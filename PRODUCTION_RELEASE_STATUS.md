# Closecraft Full Production Release Status

## 1. System Overview & Commercial Model

Closecraft has been evolved from a validated pilot into a full production sales-work management platform with managed remote-sales service capabilities:
- **Core positioning:** “Know who is following up.”
- **Supporting description:** “Manage sales opportunities and get professional help moving them forward.”
- **Operating Model:**
  - **Software-only Workspaces:** Customers use the sales operations platform (Contacts, Opportunities, Today view, Custom Stages, Pipeline, Team Queues) for NGN 15,000/month (up to 5 internal users, 14-day no-card trial) with manual renewal checkout.
  - **Managed Sales Services:** Scoped, versioned service packages (Enquiry Follow-up, Appointment Setting, Remote Closing) quoted individually with transparent economics contribution worksheets.
  - **Service Delivery & Quality:** Closecraft coordinates professional assessment, sales brief approval, call quality reviews, and continuity handovers.

---

## 2. Milestone Implementation Status

| Milestone | Scope & Domain | Status | Key Deliverables & Test Verification |
|---|---|---|---|
| **Milestone A** | **Foundation: Permissions, Roles & Security** | **COMPLETE** | Explicit permission matrix (`matrix.ts`), 6 workspace roles, platform roles, time-bounded emergency support access with audit logging, expiring invitations, and revocable sessions. |
| **Milestone B** | **Sales Operations: Contacts & Opportunities** | **COMPLETE** | Contact entity separate from opportunities, reviewed duplicate merging with provenance, custom stages mapped to system categories, reversible archiving, and public lead capture API (`/api/leads/capture`). |
| **Milestone C** | **Managed Services: Catalogue & Quality** | **COMPLETE** | Versioned service package catalogue (`catalogueService.ts`), call review scorecards assessing judgment & boundary adherence (`qualityService.ts`), operational issues, and controlled replacement workflow. |
| **Milestone D** | **Billing & Financial Integrity** | **COMPLETE** | Precise integer minor units (`money.ts`), zero floating-point math, exact Bachs decimal conversion (`"15000.00"`), deterministic proration, 14-day trial, and entitlement grace periods. |
| **Milestone E** | **Compensation & Reporting** | **COMPLETE** | Attribution engine with prior-contact disqualification (`attributionService.ts`), verified cash basis, maker-checker payout authorization, and drill-down operational reports (`operationalReports.ts`). |
| **Milestone F** | **Production Hardening & Reliability** | **COMPLETE** | Durable transactional outbox worker (`outboxWorker.ts`) with bounded retries & dead-letter queue, health check API (`/api/health`), structured logger with secret redaction (`logger.ts`), and 35 automated acceptance tests. |

---

## 3. Architecture & Domain Services

### A. Foundation & Security (`src/lib/permissions/` & `src/lib/auth/`)
- **Explicit Permission Matrix (`matrix.ts`):** Enforces 30+ granular permissions across workspace roles (`OWNER`, `ADMIN`, `SALES_MANAGER`, `INTERNAL_MEMBER`, `EXTERNAL_PROFESSIONAL`, `READ_ONLY_REVIEWER`) and platform roles (`OPERATOR`, `FINANCE_OPERATOR`, `PLATFORM_ADMIN`, `SUPER_ADMIN`).
- **Emergency Operator Support Access (`accessService.ts`):** Allows authorized platform operators to request time-bounded access (1–24 hours) with mandatory justification. All operations are logged in `AuditLog` as `EMERGENCY_SUPPORT_OPERATION`.
- **Expiring Invites & Revocable Sessions:** Cryptographically random invite tokens with 7-day expiration. User sessions support immediate server-side revocation.

### B. Sales Operations (`src/lib/sales/salesService.ts` & `/api/leads/capture`)
- **Contact Entity:** Maintains real human identity (email, phone, organization, communication preferences, opt-out status) separate from individual deals or opportunities.
- **Opportunities:** Distinguishes `bookedAmount` from `verifiedCollections`. Confirmed sales move through custom stages mapped to stable system categories (`INBOX`, `ACTIVE`, `QUALIFYING`, `PROPOSAL`, `WON`, `LOST`).
- **Reviewed Duplicate Merging:** Transactionally reassigns conversations, deals, and appointments from secondary to primary lead, marking the secondary record as reversibly archived with full audit provenance.
- **Public Lead Capture Endpoint:** `/api/leads/capture` validates public workspace slugs, enforces international phone formatting (`+234...`), tests email syntax, detects workspace duplicates without silent merging, and queues an outbox notification.

### C. Managed Services (`src/lib/pilot/`)
- **Service Catalogue (`catalogueService.ts`):** Configurable package templates (`ENQUIRY_RESPONSE`, `APPOINTMENT_SETTING`, `SALES_CLOSING`) defining included activities, explicit exclusions, coverage hours, response expectations, and capacity allowances.
- **Call Quality Reviews (`qualityService.ts`):** Evaluates judgment (1–10), commercial boundary adherence (1–10), and record completeness (1–10). Avoids ranking sales representatives purely by close rate.
- **Operational Continuity:** Allows operators to replace professionals mid-engagement, automatically revoking workspace access, reassigning opportunities, and logging a continuity handover record.

### D. Financial Integrity (`src/lib/payments/money.ts` & `src/lib/payments/bachs.ts`)
- **Precise Integer Math:** All monetary calculations use integer minor units (kobo/cents). Binary floating-point arithmetic is strictly forbidden.
- **Bachs Decimal Strings:** Safely converts monetary values to decimal string format (`15000.00`).
- **Proration Engine:** Computes deterministic unused credit for plan adjustments and mid-cycle renewals.

### E. Compensation & Attribution (`src/lib/compensation/attributionService.ts`)
- **Attributed Opportunity Register:** Records eligible opportunities for performance-based engagements.
- **Prior Contact Rule:** Automatically disqualifies opportunities that had active client contact within the attribution window (default: 30 days).
- **Verified Cash Basis:** Commissions apply strictly to confirmed collected revenue, preventing double-counting of instalments.
- **Maker-Checker Payouts:** Operator A (Maker) proposes a payable; Operator B / Finance Operator (Checker) authorizes payout. Self-approval is strictly prevented.

### F. Observability & Reliable Outbox (`src/lib/outbox/` & `src/lib/observability/`)
- **Transactional Outbox Worker:** Bounded retries (5 max) with exponential backoff (2, 4, 8, 16, 32s). Messages failing after max retries transition to `DEAD_LETTER` for operator review.
- **Production Health Check (`/api/health`):** Verifies PostgreSQL connection latency, outbox pending and dead-letter queues, process memory (heap/RSS), and uptime.
- **Structured Redacting Logger:** Automatically redacts passwords, secret keys, bearer tokens, card numbers, and authorization headers.

---

## 4. Test Results & Quality Gates

Ran `node --test tests/*.test.cjs`:
- **Total Test Suites:** 20
- **Total Passing Tests:** 35
- **Failures:** 0
- **TypeScript Typecheck:** `npx tsc --noEmit` passed with 0 errors.
- **Production Bundle:** `npm run build` compiled all 77 routes cleanly with Turbopack.

---

## 5. Bachs Provider Capability Matrix

| Feature | Provider Status | Closecraft Implementation |
|---|---|---|
| **Hosted Checkout** | Supported (API v1) | Implemented via `createBachsCheckoutSession`. |
| **Webhook Signatures** | Supported (`X-Bachs-Signature-V2`) | Enforced with raw-body HMAC-SHA256 and 300s replay window. |
| **Decimal Precision** | Required (`"15000.00"`) | Formatted with `toBachsDecimalString()` in `money.ts`. |
| **Manual Monthly Renewal** | Supported (one-time invoice) | Default model for NGN software subscriptions. |
| **Automated Payouts** | Requires merchant approval | Kept disabled; manual maker-checker authorization enforced. |
| **Refunds** | Supported | Recorded with status `REFUNDED` preserving historical records. |

---

## 6. Runbooks & Operational Protocols

### A. Emergency Support Access Runbook
1. Operator navigates to `/operator` or calls `grantEmergencySupportAccess()`.
2. Operator provides explicit justification (minimum 10 characters) and duration (1–24 hours).
3. The system grants time-bounded access and records an audit log.
4. When work is complete, operator revokes access immediately. The system auto-terminates upon expiration.

### B. Professional Replacement Runbook
1. Operator navigates to `/operator` -> Active Engagements -> Continuity.
2. Selects replacement professional candidate from pool.
3. System executes atomic transaction:
   - Revokes outgoing professional's workspace membership.
   - Enrolls replacement candidate as `EXTERNAL_PROFESSIONAL`.
   - Reassigns active leads.
   - Logs `PilotHandover` record and audit trail.

### C. Daily Billing Reconciliation Runbook
1. Query Bachs dashboard for confirmed charges in previous 24h.
2. Compare with `BachsInvoice` records with `status = 'CONFIRMED'`.
3. Check `/api/health` for dead-letter outbox notifications.
4. If a webhook was dropped, re-trigger event via Bachs reference or replay outbox message via `replayDeadLetterMessage()`.

---

## 7. Known Limitations & Deferred Features

1. **Automated Bidding Marketplace (Deferred):** Matching remains operator-assisted to preserve service quality.
2. **Third-Party Disbursal Wallets (Deferred):** Payouts are authorized via maker-checker ledger, but bank transfers are disbursed via standard banking channels until merchant wallet APIs are approved.
3. **Unofficial Messaging Bots (Prohibited):** Closecraft uses standard click-to-draft links (`https://wa.me/...`). Automated unofficial WhatsApp scraping is rejected for platform safety.
