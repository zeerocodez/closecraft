# Bachs Sandbox Checkout & Entitlement Integration Runbook

## 1. Overview & Architectural Boundaries

Closecraft integrates with the **Bachs.io Sandbox** (`https://sandbox-api.bachs.io`) for one-off workspace access settlements and pilot engagements. The implementation adheres strictly to Bachs official API specifications, multi-tenant security, and double-level idempotency.

### Core Principles
- **No Client Secrets**: Browser client code never interacts directly with Bachs APIs using private or secret keys.
- **Server-Authoritative Fulfillment**: Redirects to the success URL (`/billing/return`) never grant entitlement. Entitlement is granted **only** upon cryptographic verification of the server-to-server Bachs webhook (`collection.succeeded`).
- **Raw Pricing Checkout**: Uses direct `pricing: { currency: "NGN", amount: "15000.00" }` without recurring subscription locks or artificial product carts.
- **Strict Money Conventions**: Amounts are formatted as exact decimal strings (`"15000.00"`), paired with ISO 4217 currency (`"NGN"`). Minor units (kobo/cents) are strictly prohibited.
- **Tenant Isolation**: Entitlements are mapped strictly through the database `BachsInvoice.organizationId` relationship, never by matching the payer's external email address.

---

## 2. Implemented Endpoints & Routes

### Backend Routes

| Route | Method | Purpose | Auth & Permissions |
|---|---|---|---|
| `/api/billing/checkout` | `POST` | Creates a Bachs checkout session for an approved invoice | Authenticated user with `billing:manage` permission |
| `/api/billing/invoices/[id]/status` | `GET` | Polling endpoint returning live invoice settlement & paid-through status | Authenticated workspace member or platform admin |
| `/api/webhooks/bachs` | `POST` | Authoritative Bachs webhook handler | Signed with HMAC-SHA256 (`X-Bachs-Signature-V2` / `X-Bachs-Signature`) |

### Frontend Pages

| URL | Path in Repo | Functionality |
|---|---|---|
| `/billing` | `src/app/(saas)/billing/page.tsx` | Displays 14-day no-card trial status, active approved NGN 15,000 invoice, plan tiers, invoice history, and checkout button |
| `/billing/return` | `src/app/(saas)/billing/return/page.tsx` | Return page displaying `Pending` while polling `/api/billing/invoices/[id]/status`. Once verified, celebrates activation and renders exact `paidThroughDate`. Safe if user closes tab. |
| `/billing/checkout/mock` | `src/app/billing/checkout/mock/page.tsx` | Sandbox visual simulator when Bachs secret keys are not configured in local development |

---

## 3. Checkout Creation Protocol (`POST /api/billing/checkout`)

```
Browser Client                     Closecraft Backend                 Bachs Sandbox
      |                                    |                                |
      |--- POST /api/billing/checkout ---->|                                |
      |    (optional: invoiceId)           |-- Authenticate Session         |
      |                                    |-- Verify `billing:manage`      |
      |                                    |-- Load approved invoice        |
      |                                    |-- Reject if already PAID       |
      |                                    |-- Derive amount ("15000.00")   |
      |                                    |                                |
      |                                    |--- POST /v1/checkout-sessions->|
      |                                    |    Headers:                    |
      |                                    |      Authorization: Bearer sk  |
      |                                    |      Idempotency-Key: chk-...  |
      |                                    |    Body: { pricing: {...} }    |
      |                                    |<-- 200 { checkout_id, url } ---|
      |                                    |                                |
      |                                    |-- Save checkout_id on invoice  |
      |                                    |-- Create PaymentAttempt record |
      |<-- 200 { checkout_url } -----------|                                |
      |                                                                     |
      |--- Redirect to Bachs Hosted Checkout ------------------------------>|
```

### Idempotency Key
- Key format: `checkout-${invoice.id}-${timestamp}` (e.g. `checkout-inv_123-1740740000000`).

---

## 4. Webhook Verification & Double-Level Idempotency

### Signature Verification
- Bachs signs requests with HMAC-SHA256 of `${timestamp}.${rawBody}` using the secret key.
- Supported headers: `X-Bachs-Signature-V2` (`t=...,v1=...`), `X-Bachs-Signature` + `X-Bachs-Timestamp`, and `webhook-signature`.
- **Replay Protection**: Timestamps exceeding a 300-second window are rejected with 401.

### Double-Level Idempotency
1. **Level 1 (Event-Level)**: If `event.id` already exists in `WebhookEvent`, return 200 OK with `{ handled: true, duplicate: true }`.
2. **Level 2 (Invoice-Level)**: If the target invoice is already in `PAID`, `CONFIRMED`, or `FUNDS_AVAILABLE` status, return 200 OK with `{ handled: true, alreadyFulfilled: true }`.

### Payload Amount & Currency Verification
Before activating access, the webhook handler compares `event.data.amount` and `event.data.currency` with the stored invoice:
- Mismatched amounts (e.g. partial payment) reject fulfillment and log a security audit event.
- Mismatched currencies reject fulfillment.

### Entitlement Update
Once verified:
1. `BachsInvoice` is marked `status = 'PAID'` with `paidAt = now()` and `bachsChargeId`.
2. Associated `PaymentAttempt` is updated to `status = 'SUCCEEDED'`.
3. `WorkspaceSubscription` is updated to `status = 'ACTIVE'` with `paidThroughDate` extended by 30 days.
4. For Managed Pilots (`PILOT_ENGAGEMENT`): Payment satisfies **only** `isPaymentVerified = true`. Pilot activation still requires accepted terms and professional readiness. Professional payouts remain decoupled.

---

## 5. Environment & Webhook Configuration

### Deployed Webhook URL
Configure this URL in the Bachs Merchant Dashboard (Sandbox):
```
https://closecraft.com/api/webhooks/bachs
```
*(In local development with tunnels like ngrok: `https://<subdomain>.ngrok-free.app/api/webhooks/bachs`)*

### Secrets Status

| Secret Name | Status in Environment | Notes |
|---|---|---|
| `DATABASE_URL` | **Configured** | Supabase Postgres pooler |
| `NEXTAUTH_SECRET` | **Configured** | Session encryption |
| `BACHS_SECRET_KEY` | **Pending Configuration** | Add `sk_sandbox_...` from Bachs Dashboard |
| `BACHS_WEBHOOK_SECRET` | **Pending Configuration** | Add `whsec_...` from Bachs Webhook Settings |
| `BACHS_FORCE_SANDBOX` | **Default (`true`)** | Keeps checkout locked to sandbox base URL |

> [!NOTE]
> If `BACHS_SECRET_KEY` is not present in `.env`, Closecraft automatically enters simulated sandbox mode and serves `/billing/checkout/mock` for seamless offline testing. Live payment keys should **never** be enabled in sandbox testing.

---

## 6. Automated Test Coverage

Run the test suite with:
```powershell
npm test
```

### Verified Scenarios (69/69 passing)
- **Raw Pricing Format**: Verifies `pricing: { currency: "NGN", amount: "15000.00" }` with exact decimal strings.
- **Idempotency Key Transmission**: Confirms `Idempotency-Key` header structure on checkout creation.
- **HMAC-SHA256 Verification**: Verifies `X-Bachs-Signature-V2` header parser and timing-safe equal checks.
- **Replay Attack Mitigation**: Confirms timestamps older than 300 seconds are rejected.
- **Signature Tamper Detection**: Confirms tampered bodies and mismatched secrets fail.
- **Amount & Currency Mismatch Rejection**: Confirms underpaid or foreign-currency events are rejected.
- **Double Idempotency**: Tests that duplicate event IDs and duplicate invoice payments are ignored without double-crediting.
- **Redirect Isolation**: Asserts that `/billing/return` never executes entitlement updates without official webhook settlement.
- **14-Day Free Trial Preservation**: Asserts that free trials remain intact with no-card requirements.
- **Pilot Prerequisite Decoupling**: Asserts that pilot fee payments do not bypass terms acceptance or client readiness.
