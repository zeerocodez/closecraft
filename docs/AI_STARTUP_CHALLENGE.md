# CloseCraft — AI Startup Challenge Submission & Technical Documentation

## Executive Overview

**Applicant Organization:** Zeerocodes Automation Limited (RC 7291048)  
**Project:** CloseCraft (AI Revenue Operating System)  
**Live URL:** [https://closecrafthq.com](https://closecrafthq.com)  
**Demo Portal:** [https://closecrafthq.com/demo](https://closecrafthq.com/demo)  
**Repository:** [https://github.com/zeerocodez/closecraft](https://github.com/zeerocodez/closecraft)  
**Branch:** `feature/ai-startup-challenge-remediation`

---

## 1. Challenge Requirements Addressed

| Challenge Requirement | CloseCraft Architectural Solution | Verification / Test Evidence |
| :--- | :--- | :--- |
| **Real-World AI Utility** | Eliminates manual lead triage and stalled sales follow-ups for high-ticket B2B businesses via automated qualification and prescriptive Next Best Actions. | `tests/revenue_engine_e2e_journey.test.cjs` |
| **Strict Multi-Tenancy** | Organization resolution enforced via verified Meta Page IDs and WhatsApp Phone Number IDs; unknown accounts quarantined. Zero cross-tenant leakage. | `tests/whatsapp_multitenant_isolation.test.cjs`, `tests/meta_lead_ads_ingestion.test.cjs` |
| **AI Reliability & Safety** | Canonical Structured AI Extractor with Zod validation. Non-hallucination guardrails ensure unstated budgets or timelines remain `Pending Discovery`. | `src/lib/ai/extractor.ts`, `tests/revenue_engine_e2e_journey.test.cjs` |
| **Measurable Commercial Impact** | Automated detection of stalled deals (>14 days) and SLA breaches (>4h) computing exact *Revenue at Risk* and *Revenue Recovered*. | `src/lib/revenue-engine/dashboardService.ts` |
| **Production Operational Readiness** | Official Meta Graph API & WhatsApp Cloud API integration, HMAC-SHA256 signature verification, and pilot mode dry-run safeguards. | `src/lib/whatsapp.ts`, `src/app/api/webhooks/whatsapp/route.ts` |

---

## 2. Core Architectural Decisions

### A. One Product, One Architecture
Rather than creating disconnected dashboards or competing microservices, CloseCraft operates as a single, coherent Next.js 16 application:
* Inbound leads immediately trigger the canonical `RevenueEngine.processNewLead` pipeline.
* Standardized domain events (`revenue/lead.created`) are dispatched via Inngest for asynchronous notifications.
* Every database query and mutation enforces strict organization scoping.

### B. Multi-Tenant Security & Webhook Isolation
* **Previous Vulnerability:** Webhook ingestion previously contained a generic fallback (`slug: 'zeerocodes'`) which risked routing unknown external messages into a default client workspace.
* **Remediated Architecture:**
  1. Incoming WhatsApp messages resolve strictly by `whatsappPhoneNumberId` or verified phone number in `Organization`.
  2. Incoming Meta Lead Ads resolve strictly by `facebookPageId` in `Organization`.
  3. If unmapped, the payload is safely quarantined to `WebhookEvent` with `status: 'IGNORED'` and `eventType: '*.quarantined'`.
  4. Cryptographic HMAC-SHA256 signatures are validated using constant-time string comparison (`timingSafeEqualString`).

### C. Unified AI Qualification Engine
* Consolidates all lead qualification into `src/lib/ai/extractor.ts` using `@ai-sdk/openai` (GPT-4o) and structured Zod output.
* Obsolete mock rule engines (such as the legacy $99 rule engine in `qualificationEngine.ts`) have been completely routed through the canonical extractor.
* When AI credentials are not configured or external providers experience downtime, the engine gracefully transitions to an explainable deterministic policy engine, clearly stamped with `[Analysis Mode: Deterministic Policy Fallback Engine]`.

### D. Revenue Leakage Methodology
Revenue leakage represents commercial value lost when high-intent opportunities are neglected:
1. **SLA Breach Leaks:** Triggered when high-intent inbound WhatsApp messages remain unanswered by sales reps beyond the organization's response window (e.g. 4 hours).
2. **Stalled Deal Leaks:** Triggered when proposals remain in the pipeline without sales interaction for over 14 days.
3. **Financial Impact Calculation:** `dashboardService.ts` calculates:
   * **Revenue at Risk:** Cumulative pipeline value of all deals linked to active, unresolved leaks.
   * **Revenue Recovered:** Cumulative won contract value of deals successfully salvaged from resolved leaks.

### E. Financial Accuracy & Separation of Values
To prevent inflated commercial reporting, CloseCraft strictly categorizes revenue:
* **Prospect-Stated Budget:** Raw numerical figure explicitly stated in the inquiry.
* **Estimated Opportunity Value:** AI-derived commercial estimate labeled as an estimate.
* **Qualified Pipeline Value:** Total value of active opportunities currently in negotiation.
* **Closed-Won Contract Value:** Legally committed contract amounts signed by customers.
* **Verified Realised Revenue:** Actual funds collected, backed by verified payment gateway invoices (Bachs / Paystack).

---

## 3. Dedicated Demonstration Workspace ("Apex Professional Services")

For the AI Startup Challenge evaluators, a complete production workspace was provisioned via `scripts/seed_apex_demo_workspace.ts`:

* **Organization Name:** Apex Professional Services
* **Slug:** `apex-demo`
* **Team Roster (7 Members):**
  * `demo.owner@apexconsulting.ng` — Managing Director (Owner)
  * `demo.manager@apexconsulting.ng` — RevOps Manager
  * `demo.closer1@apexconsulting.ng` — Chidi Okafor (Senior Closer)
  * `demo.closer2@apexconsulting.ng` — Zainab Ahmed (Closer)
  * `demo.closer3@apexconsulting.ng` — Emeka Nwosu (Closer)
  * `demo.setter1@apexconsulting.ng` — Tunde Bakare (Appointment Setter)
  * `demo.setter2@apexconsulting.ng` — Kemi Sowore (Appointment Setter)
* **12 Pre-Seeded Lead Scenarios:** Spanning high-ticket corporate legal, medical diagnostics, logistics consulting, stalled proposal follow-ups, SLA breaches, disqualified low-budget leads, and customer opt-outs (`STOP`).

---

## 4. Test Coverage & Quality Assurance Summary

The entire remediation build is verified through automated test suites running via Node.js native test runner:

1. **WhatsApp Multi-Tenant Isolation & Delivery Tests (`tests/whatsapp_multitenant_isolation.test.cjs`):**
   * Static AST check (removal of hardcoded workspace fallbacks).
   * GET challenge verification.
   * HMAC-SHA256 signature enforcement.
   * Scoped organization resolution.
   * Duplicate message idempotency.
   * Quarantine of unmapped phone IDs.
   * Inbound opt-out (`STOP`) compliance.
   * **Result: 10/10 PASSING.**

2. **Meta Lead Ads Ingestion & Multi-Tenant Tests (`tests/meta_lead_ads_ingestion.test.cjs`):**
   * Page ID organization resolution.
   * HMAC-SHA256 signature enforcement.
   * Unmapped page quarantine to `WebhookEvent`.
   * Lead record creation with source attribution.
   * Automatic triggering of canonical Revenue Engine evaluation.
   * **Result: 9/9 PASSING.**

3. **Complete End-to-End Revenue Lifecycle Test (`tests/revenue_engine_e2e_journey.test.cjs`):**
   * Step 1–2: Inbound lead capture & multi-tenant isolation.
   * Step 3–4: Canonical AI qualification & signal generation (Intent, Fit, Urgency, Value).
   * Step 5–6: Next Best Action & fair Closer round-robin routing.
   * Step 7–8: Appointment scheduling & pilot-guarded WhatsApp dispatch.
   * Step 9: Pipeline progression & stalled deal leakage detection.
   * Step 10–12: Closed-won settlement & strict financial separation (Contract vs Realised Cash).
   * **Result: 10/10 PASSING.**

---

## 5. Verification Commands

To verify all test suites locally:
```bash
# Run all automated tests
npm test

# Run individual challenge verification tests
node --test tests/whatsapp_multitenant_isolation.test.cjs
node --test tests/meta_lead_ads_ingestion.test.cjs
node --test tests/revenue_engine_e2e_journey.test.cjs
```
