# PRODUCTION LAUNCH DECISION

**Product:** CloseCraft AI Revenue Operating System
**Evaluation target:** Production Release Gate 1.0
**Assessment date:** November 2026 (revised)
**Status of this document:** Self-assessment by the CloseCraft engineering
team (Zeerocodes Automation Limited). It has **not** been independently
audited. An earlier version of this document awarded the product 100/100 in
every category with an "unconditional GO"; that version has been replaced
because the scores were not supported by external evidence and several
material issues (below) were open at the time.

**Revised verdict: CONDITIONAL GO — controlled pilot with named customers,
not an unrestricted public launch.**

---

## 1. What is verified, and by what evidence

| Area | Status | Evidence |
| --- | --- | --- |
| Multi-tenant isolation (application layer) | Implemented & tested in-repo | `organizationId` scoping in the data-access layer; `tests/whatsapp_multitenant_isolation.test.cjs`, `tests/rls_database_security.test.cjs` |
| Webhook security | Implemented | HMAC-SHA256 signature verification with timing-safe comparison on WhatsApp/Meta/Bachs/Paystack webhooks |
| AI qualification | Implemented | Structured Zod-validated extraction (`@ai-sdk/openai`) with a labelled deterministic fallback; no invented budgets |
| Financial separation | Implemented | Estimated vs qualified vs closed-won vs verified-realised revenue kept distinct; integer minor-unit money math; commissions accrue only on verified payments, with maker-checker approval and refund reversal |
| Privacy (NDPA/GDPR) | Implemented | Data export/erasure endpoints, STOP opt-out handling, privacy request portal |
| Billing | Implemented, sandbox-verified | Bachs.io checkout with server-side pricing from `src/lib/billing/catalog.ts`; live-key activation is an owner checklist item, not yet evidenced here |

## 2. Material issues found in review — and their status

| Issue | Status |
| --- | --- |
| Hardcoded fallback secrets in auth and Meta integration code (public values in this repo) | **Fixed** on `fix/phased-recommendations` (Phase 1). Deploy gate: confirm `AUTH_SECRET`/`NEXTAUTH_SECRET`, `ENCRYPTION_KEY`, `FACEBOOK_VERIFY_TOKEN` are set in Vercel first |
| Demo accounts accepted weak passwords (`password`, `demo`) bypassing bcrypt, and skipped login rate limits | **Fixed** (Phase 1) — bcrypt-only verification, rate limits for all accounts |
| Root `create_admin.js` with a hardcoded admin password; `password123` in the Prisma seed | **Fixed** (Phase 1) — env-based `scripts/create_admin.js`; seed password generated/env-supplied |
| Legal pages and launch assets sold a superseded offer (₦20,000/₦45,000 "Pro", 14-day trial) while billing charged ₦15,000/₦35,000/₦75,000 with a 7-day trial | **Fixed** (Phase 2) — catalog is the single source of truth; guarded by `tests/pricing_consistency.test.cjs` |
| Company RC number appeared as both 8421094 and 7291048 | **Fixed** (Phase 2) — unified to RC 8421094 (the number used by invoice generation). Owner to confirm against the CAC certificate |
| 94MB onboarding video shipped in `public/`; repo working tree 235MB | **Fixed** (Phase 4) — video re-encoded to 3.9MB; tree now ~27MB |
| Fabricated `aggregateRating` (4.9★, 128 reviews) in SEO structured data | **Fixed** (Phase 5) — removed until real review data exists |
| Test-suite claims inconsistent (35 / 37 / 97 in different docs); part of the suite is self-referential | **Open** — see the accuracy note in `docs/QA_AUTOMATION_AND_ACCEPTANCE_REPORT.md`. Converting acceptance tests to source-/behaviour-verifying tests is ongoing work |
| No independent security audit or penetration test | **Open** — recommended before handling customer payment data at scale |
| No published pilot results (real customers, real recovered revenue) | **Open** — the strongest launch evidence does not exist yet; the demo workspace is synthetic |

## 3. Conditions for expanding beyond a controlled pilot

1. Phase 1–5 fixes merged and deployed, with the Phase 1 environment-variable
   gate confirmed in Vercel.
2. Demo workspace password rotated after any public evaluation period.
3. At least one named pilot customer run end-to-end with measured outcomes
   (leads recovered, response times, verified collections) that can be
   quoted with permission.
4. Repository made private once external evaluation (AI Startup Challenge)
   no longer requires public access — the code is proprietary.
5. Owner confirms the RC number and Bachs live-key status in writing in
   `docs/COMMERCIAL_ARCHITECTURE_AND_CONFIRMATION_CHECKLIST.md`.

## 4. Sign-off

This document is a self-assessment. Real sign-off requires named individuals
accepting the open items above:

```
Product owner (Zeerocodes Automation Limited):  ____________  Date: ________
Engineering reviewer (independent, if engaged): ____________  Date: ________
```
