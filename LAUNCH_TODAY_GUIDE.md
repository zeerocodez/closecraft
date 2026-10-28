# Closecraft "Launch Today" Production Deployment & Billing Guide

This guide gives you everything you need to take Closecraft live **today** with the new **Starter (₦20,000/month)** and **Pro (₦45,000/month)** plans, active seat limit enforcement, official Bachs.io payment processing, and production infrastructure.

---

## 1. What Was Implemented & Deployed

The following updates are live in the database schema, backend services, and pushed to `main` on GitHub (`origin/main` commit `bd13511`):

### Plan Structure
| Plan | Price (NGN) | Internal Seats | Description & Target Audience |
| :--- | :--- | :--- | :--- |
| **Starter** | **₦20,000 / mo** | **3 Seats** | Lean service businesses & small sales teams. 14-day free trial (no credit card required), enquiry capture, follow-up SLA tracking, and revenue leakage alerts. |
| **Pro** | **₦45,000 / mo** | **10 Seats** | High-velocity sales teams. Includes everything in Starter plus 10 internal team seats, **Round-Robin automated lead routing**, manager call coaching & review queue, priority notification dispatch, and revenue health analytics. |

### Technical Protections Deployed
1. **Seat Cap Enforcement**: `addTenantTeamMember` checks `internalMembersCount >= maxSeats`. If a Starter workspace attempts to add a 4th internal team member, the action throws a clean error guiding the owner to upgrade to Pro.
2. **External Professional Exemption**: Remote sales professionals placed through active managed pilot engagements have `role: 'EXTERNAL_PROFESSIONAL'`. They **never** consume internal team seats.
3. **Bachs Checkout Session Metadata**: Bachs hosted checkout sessions record `plan: 'STARTER'` or `plan: 'PRO'`.
4. **Instant Webhook Provisioning**: When Bachs confirms payment (`collection.succeeded` or `invoice.paid`), the webhook updates `workspaceSubscription.plan`, `pricePerMonth`, `maxInternalSeats` (3 for Starter, 10 for Pro), and extends `paidThroughDate` by one full calendar month.

---

## 2. Production `.env` Requirements

To launch today on Vercel, Railway, Render, or a VPS, configure the following environment variables in your deployment environment:

```ini
# ==============================================================================
# 1. APPLICATION & AUTHENTICATION
# ==============================================================================
NODE_ENV="production"
NEXTAUTH_URL="https://app.closecraft.com" # Replace with your production domain
NEXTAUTH_SECRET="f4d8e9c1a2b3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9" # Generate: openssl rand -hex 32
NEXT_PUBLIC_APP_URL="https://app.closecraft.com"

# ==============================================================================
# 2. DATABASE (SUPABASE POSTGRESQL POOLING)
# ==============================================================================
# IMPORTANT: Next.js Server Actions and serverless routes need transaction pooling
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=15"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# ==============================================================================
# 3. BACHS.IO PAYMENT GATEWAY (PRODUCTION)
# ==============================================================================
# Obtain from your Bachs dashboard (https://bachs.io or https://dashboard.bachs.io)
BACHS_API_BASE="https://api.bachs.io"
BACHS_SECRET_KEY="sec_live_..."          # Your Bachs Live Secret Key
BACHS_PUBLIC_KEY="pub_live_..."          # Your Bachs Live Public Key
BACHS_WEBHOOK_SECRET="whsec_..."         # From Bachs Webhook configuration
BACHS_FORCE_SANDBOX="false"              # Keep false for live production billing

# ==============================================================================
# 4. AI TRIAGE & REVENUE ENGINE
# ==============================================================================
GROQ_API_KEY="gsk_..."                   # Fast Llama 3.3 70B inference for triage & voice notes

# ==============================================================================
# 5. COMMUNICATIONS & NOTIFICATIONS (OPTIONAL / PRODUCTION)
# ==============================================================================
RESEND_API_KEY="re_..."                  # For transactional notification emails
WHATSAPP_PHONE_NUMBER_ID=""              # Meta WhatsApp Business Cloud API ID (optional)
WHATSAPP_ACCESS_TOKEN=""                 # Permanent Meta token (optional)
WHATSAPP_WEBHOOK_VERIFY_TOKEN=""         # Webhook verification secret
CRON_SECRET="closecraft_cron_secret_..." # Protects /api/cron/* endpoints
```

---

## 3. Bachs.io Setup (Step-by-Step for Launch Today)

Bachs.io is the official payment gateway for Nigerian Naira (NGN) settlements supporting **Instant Bank Transfer (virtual account per checkout)**, **Debit Cards (Mastercard, Visa, Verve)**, and **MoMo**.

### Step 3.1: Switch to Live Mode in Bachs Dashboard
1. Log in to [bachs.io](https://bachs.io/).
2. Toggle the dashboard from **Sandbox / Test** to **Live**.
3. Under **Settings → API Keys**:
   - Copy your **Secret Key** (`sec_live_...`) and set it as `BACHS_SECRET_KEY`.
   - Copy your **Public Key** (`pub_live_...`) and set it as `BACHS_PUBLIC_KEY`.

### Step 3.2: Configure the Webhook Endpoint
Closecraft ships with a production webhook handler featuring HMAC-SHA256 signature verification and idempotent processing:
- **Webhook URL**: `https://[YOUR-PRODUCTION-DOMAIN]/api/webhooks/bachs`
  *(Example: `https://app.closecraft.com/api/webhooks/bachs`)*
- **Subscribed Events**: Select the following events:
  - `collection.succeeded` *(Primary event when a customer pays)*
  - `invoice.paid`
  - `checkout.completed`
- **Signing Secret**: Copy the signing secret generated by Bachs (`whsec_...`) and paste it into `BACHS_WEBHOOK_SECRET`.

> [!IMPORTANT]
> **Currency Precision Rule**: Bachs mandates decimal string representations (`"20000.00"` for Starter, `"45000.00"` for Pro). Closecraft's payment adapter already handles this strictly so minor-unit conversion errors (e.g. kobo vs naira) are mathematically impossible.

### Step 3.3: Settlement Bank Account
1. Under Bachs **Settings → Payouts / Settlements**, ensure your corporate bank account (e.g. GTBank, Zenith, Access, Kuda) is verified.
2. Verified collections are disbursed directly to your account according to Bachs settlement schedule (T+1 or instant depending on account tier).

---

## 4. Go-Live Verification Smoke Test (5-Minute Verification)

Follow this quick run-through after deploying environment variables:

1. **Sign Up a New Company**:
   - Go to `https://[YOUR-DOMAIN]/signup`.
   - Register an organization (e.g. *"Apex Logistics"*).
   - Notice the company starts in **14-day free trial** on the **Starter Plan (3 Seats)**.
2. **Verify Seat Enforcement**:
   - Navigate to `/team`.
   - Add Rep 1 and Rep 2 (Total internal members = 3: Owner + Rep 1 + Rep 2).
   - Try adding Rep 3.
   - **Expected behavior**: System blocks addition with:
     > *"Workspace seat limit reached (3/3 internal seats in use). Please upgrade to the Pro plan (10 seats) in Billing & Subscriptions to invite additional team members."*
3. **Verify Billing & Upgrade Flow**:
   - Navigate to `/billing`.
   - You will see the **Starter (₦20,000)** and **Pro (₦45,000)** cards, and the seat utilization bar showing `3 of 3 seats assigned`.
   - Click **Upgrade to Pro (₦45,000 / month)**.
   - You will be redirected to Bachs.io hosted checkout displaying `₦45,000.00`.
4. **Complete Payment**:
   - Complete checkout via Card or Bank Transfer.
   - Upon redirect back to `/billing?status=success`, the webhook confirms the invoice.
   - Workspace immediately updates to **Pro Plan**, **10 Seats**, and extends access by 1 full month.
   - Return to `/team` and add the 4th member — it now succeeds immediately!

---

## 5. Automated Acceptance Test Verification

All 39 unit, security, and acceptance tests pass locally and in CI:

```bash
$ npm test
▶ Closecraft Follow-up Pilot & Managed Operations Acceptance Tests (93.5ms)
▶ CloseCraft Free Pilot & Revenue Engine Integrity (38.8ms)
▶ Closecraft Full Production Hardening & Security Acceptance Tests (24.4ms)
  ✔ 10. Multi-Tier Workspace Plans & Internal Seat Enforcement
    ✔ configures initial Starter plan with 3 internal users at N20,000/month
    ✔ configures Pro plan with 10 internal users at N45,000/month
    ✔ enforces internal seat limits strictly against internal roles
    ✔ formats exact Bachs decimal strings for N20,000 and N45,000 billing

ℹ tests 39 | suites 21 | pass 39 | fail 0
```
