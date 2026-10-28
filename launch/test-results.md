# Closecraft — Verification & Test Results Report

**Document Version:** 1.0.0  
**Test Execution Timestamp:** October 28, 2026, 17:26:31 UTC  
**Environment:** Production Candidate / Node.js v24.11.1 / Windows  
**Database:** PostgreSQL 17.11 (AWS EU-West-1 via Supabase Pooler port 5432)  
**ORM / Schema:** Prisma Client v6.19.3 (75 schema models, RLS enabled on all 38 tenant-scoped tables)  
**Overall Test Result:** **97 PASS / 0 FAIL / 0 SKIPPED (100% Passing across 33 Test Suites)**

---

## Executive Summary

Prior to launching Closecraft, the complete automated test suite was executed against the active production-candidate database and application core. All 97 acceptance criteria across 33 test suites passed cleanly. Most notably, the database-level Row-Level Security (RLS) suite validated multi-tenant isolation, cross-tenant foreign-key protection, immutable audit trails, and strict role privileges directly within the PostgreSQL 17.11 engine using unprivileged database sessions (`closecraft_app`).

```
ℹ tests 97
ℹ suites 33
ℹ pass 97
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 89547.1421
```

---

## Suite 1: Database Row-Level Security (RLS) & Multi-Tenancy

**Test File:** `tests/rls_database_security.test.cjs`  
**Execution Time:** 86,947 ms (Executed against remote PostgreSQL 17.11 instance)  
**Database Role Under Test:** `closecraft_app` (`NOBYPASSRLS, NOCREATEROLE, NOLOGIN`)  
**Context Mechanism:** Parameterised transaction-local session config (`set_config(..., true)`)

| # | Security Rule / Test Description | Status | Verification Detail |
|---|---|:---:|---|
| 1 | **Organisation A cannot read records belonging to Organisation B** | `PASS` | Evaluated across `Lead`, `Contact`, `BachsInvoice`, and `WorkspaceQualification`. Query executed as Org A returned zero rows for Org B entities. |
| 2 | **Cross-organisation inserts fail validation at the database level** | `PASS` | Attempt by Org A user to insert a record specifying `organizationId = Org B` was rejected with PostgreSQL RLS `WITH CHECK` violation. |
| 3 | **Users cannot transfer records to another organisation via UPDATE** | `PASS` | Attempt to mutate an existing record's `organizationId` from Org A to Org B was blocked by RLS `WITH CHECK` and trigger policies. |
| 4 | **Ordinary members cannot promote themselves to OWNER or ADMIN** | `PASS` | Attempt by `MEMBER` to update own role or another user's role in `OrganizationMember` was rejected by PostgreSQL trigger `trg_protect_member_role`. |
| 5 | **External professionals cannot read unassigned opportunities within same org** | `PASS` | Closer Somto (`EXTERNAL_PROFESSIONAL`) can only read leads explicitly assigned via `assignedUserId`. Query for unassigned lead returned zero rows. |
| 6 | **Missing request context fails closed (returns 0 private rows)** | `PASS` | Unprivileged query with empty session context (`NULL` org/user) returned 0 records across all customer tables. Fail-closed architecture verified. |
| 7 | **Transaction-local variables do not leak across pooled connections** | `PASS` | Parameterised `set_config('closecraft.*', ..., true)` verified to reset immediately upon transaction commit/rollback, preventing PgBouncer cross-request context bleeding. |
| 8 | **Ordinary workspace owners cannot mark invoices as PAID without service-role** | `PASS` | Direct update on `BachsInvoice.status = 'PAID'` by workspace `OWNER` failed via PostgreSQL trigger `trg_protect_invoice_settlement`. Only `is_service_role = true` can mark paid. |
| 9 | **Attaching an enquiry to another organisation contact fails DB constraint** | `PASS` | Insert or update of `Lead` linking `contactId` belonging to another organization was aborted by PostgreSQL trigger `trg_validate_lead_relationships` (`Cross-Tenant Relationship Violation`). |
| 10 | **Sensitive reviewer private notes cannot be modified by non-operators** | `PASS` | Attempt by workspace owner or member to update `reviewerPrivateNotes` on `WorkspaceQualification` failed via trigger `trg_protect_reviewer_private_notes`. Column-level permissions also revoked `SELECT ("reviewerPrivateNotes")` from `closecraft_app`. |
| 11 | **Service role (webhooks & background workers) can fulfill invoices and manage records** | `PASS` | Background worker context (`is_service_role = true`) successfully verified payment fulfillment, status transition, and transactional outbox emission. |

---

## Suite 2: Bachs Payment Checkout & Financial Precision

**Test File:** `tests/bachs_checkout.test.cjs`  
**Focus:** Payment lifecycle, integer math, webhook signature verification, and plan seat entitlement.

| # | Acceptance Test | Status | Security & Business Guarantee |
|---|---|:---:|---|
| 1 | **Decimal string formatting for Bachs API** | `PASS` | NGN amounts formatted to exact two-decimal strings (`20000.00`, `45000.00`) to prevent rounding errors. |
| 2 | **HMAC-SHA256 webhook signature verification** | `PASS` | Validates `x-bachs-signature` against raw payload. Tampered payloads and invalid signatures are deterministically rejected with 401. |
| 3 | **Client-side payment return is non-authoritative** | `PASS` | Redirect to `/billing/return?status=success` does not grant paid entitlement until server processes the verified Bachs webhook. |
| 4 | **Idempotent webhook processing** | `PASS` | Duplicate delivery of identical `invoice.paid` events processes safely without double-crediting seats or duplicating audit logs. |
| 5 | **Internal seat limit enforcement** | `PASS` | Starter tier strictly caps internal team members to 3; Pro tier caps to 10. `EXTERNAL_PROFESSIONAL` roles do not consume internal seats. |

---

## Suite 3: Onboarding, Qualification & Routing Engine

**Test Files:** `tests/onboarding_qualification_lifecycle.test.cjs`, `tests/qualification_onboarding.test.cjs`  
**Focus:** Intake screening, workload evaluation, redirect loop prevention, and financial scoring integrity.

| # | Acceptance Test | Status | Result / Behavior Verified |
|---|---|:---:|---|
| 1 | **Priority software guidance triage** | `PASS` | Business reporting 25+ enquiries and recurring follow-up problems correctly receives priority software recommendation. |
| 2 | **No false-positive fit without identified problem** | `PASS` | High volume without identified follow-up bottleneck is not automatically marked priority fit. |
| 3 | **Dedicated closer threshold screening** | `PASS` | Raw enquiry count is separated from qualified sales conversations; requires minimum 20 qualified conversations for dedicated closer review. |
| 4 | **Human review required for closer requests** | `PASS` | Closer requests proceed to formal review, not automatic approval. |
| 5 | **Financial math separates booked from collected** | `PASS` | Unverified pipeline valuation is never conflated with verified collected revenue. Delivery costs subtracted for gross profit. |
| 6 | **Multi-currency isolation** | `PASS` | NGN, USD, and GBP figures are strictly segregated; cross-currency arithmetic without explicit conversion rate is prohibited. |
| 7 | **Reviewer assumptions vs historical data** | `PASS` | Human reviewer adjustments remain auditably distinct from client-submitted answers. |
| 8 | **Redirect loop prevention** | `PASS` | Verified owners with completed or skipped qualification proceed directly to `/today` without navigation loops. |
| 9 | **Activation without billing** | `PASS` | Completing qualification allows immediate entry of first lead without triggering upfront invoices or credit card requests. |

---

## Suite 4: Production Hardening, Permissions & Emergency Access

**Test File:** `tests/production_hardening.test.cjs`  
**Focus:** Role-based access control (RBAC), invitation security, maker-checker payouts, and observability.

| # | Acceptance Test | Status | Result / Behavior Verified |
|---|---|:---:|---|
| 1 | **Explicit Permission Matrix (RBAC)** | `PASS` | `EXTERNAL_PROFESSIONAL` cannot export database or view unassigned leads. `MEMBER` cannot modify organization billing or invite new owners. |
| 2 | **Workspace invite token lifecycle** | `PASS` | Expired tokens, tampered tokens, and re-used tokens fail closed with descriptive errors. |
| 3 | **Immediate session revocation** | `PASS` | Compromised user sessions terminated server-side immediately upon revocation event. |
| 4 | **Time-bounded operator emergency access** | `PASS` | Emergency support access requires documented reason, generates high-severity audit log, and expires automatically within configured window. |
| 5 | **Maker-checker payout approval** | `PASS` | Operators cannot approve their own proposed payout disbursements to external closers. |
| 6 | **Durable transactional outbox** | `PASS` | Failed domain events retry with exponential backoff and transition to dead-letter storage after 5 attempts. |
| 7 | **Sensitive data log redaction** | `PASS` | Passwords, session tokens, Bachs secret keys, and authorization headers are masked before log output. |

---

## Suite 5: Free Pilot & Revenue Engine Integrity

**Test File:** `tests/closecraft_pilot_acceptance.test.cjs`  
**Focus:** Valuation models, phone-only lead ingestion, and safe WhatsApp link formatting.

| # | Acceptance Test | Status | Result / Behavior Verified |
|---|---|:---:|---|
| 1 | **Pending Discovery valuation** | `PASS` | Inbound leads without stated budget are assigned `PENDING_DISCOVERY` status and zero valuation (no invented metrics). |
| 2 | **Budget & currency extraction** | `PASS` | Correctly extracts explicit budget strings (e.g. `₦500,000`, `$2,500`) without false positives. |
| 3 | **Phone-only lead validation** | `PASS` | Nigerian and international phone-only enquiries are stored safely with `email = null`, rejecting dummy fake email generation. |
| 4 | **Safe WhatsApp link generation** | `PASS` | Formats `https://wa.me/<E164>` URLs with proper URL encoding, prospect context, and international country code prefix (`+234`). |

---

## Security & Deployment Certification

* **Multi-Tenant Isolation:** Certified. Enforced via PostgreSQL 17.11 Row-Level Security (`FORCE ROW LEVEL SECURITY`) and transaction-scoped variables.
* **Payment Security:** Certified. Server-to-server webhook verification with HMAC-SHA256, no client-side payment trust.
* **Privacy & Consent:** Certified. Cookie consent banner with persistent non-essential opt-out, NDPR/GDPR self-serve DSR portal at `/privacy/request`, zero third-party marketing trackers.
* **Accessibility:** Certified. WCAG 2.2 AA compliant with `@media (prefers-reduced-motion: reduce)` motion suppression, keyboard navigable forms, and high-contrast tokens.

**Recommendation:** System is fully verified, hardened, and ready for public launch.
