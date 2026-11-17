# CloseCraft — AI Startup Challenge Evidence Pack
**Prepared:** 17 November 2026  
**Repository:** [zeerocodez/closecraft](https://github.com/zeerocodez/closecraft)  
**Product website:** https://closecrafthq.com  
**Demo candidate:** https://closecraft-sand.vercel.app

## 1. Recommended application proposition

**CloseCraft is an AI-powered revenue recovery and sales execution platform that helps businesses stop losing sales opportunities through poor enquiry management and inconsistent follow-up.**

Businesses invest in marketing to generate enquiries. Many lack the operational capacity to respond quickly, identify serious prospects, assign ownership, and make sure every qualified opportunity has a clear next action. CloseCraft connects lead capture, AI-assisted qualification, sales prioritisation, human handoff, and revenue-leakage visibility in one workspace.

The product should be described as a revenue operations system, not simply a chatbot or generic CRM.

## 2. The problem

The gap CloseCraft addresses is between lead acquisition and sales execution. Leads can arrive from advertising, websites, and messaging channels, but without a disciplined workflow they can remain unanswered, unqualified, unassigned, or forgotten. This wastes acquisition spend and makes it difficult for owners to know which opportunities need attention.

The initial customer hypothesis in the repository focuses on Nigerian training providers and professional service businesses that already receive regular enquiries and sell considered or higher-value services. Adjacent segments can be explored after validation.

## 3. How the product works

1. **Capture:** Leads enter through website forms, public lead-capture endpoints, imports, and supported channel integrations.
2. **Understand:** The qualification pipeline analyses the enquiry and available context against the organisation's qualification policy.
3. **Prioritise:** The Revenue Engine derives intent, fit, urgency, and value signals, with supporting evidence.
4. **Recommend:** The system creates a Next Best Action and recommends an actor such as AI, automation, or a human team member.
5. **Assign and supervise:** Leads can be routed to sales representatives. Human review remains important for negotiation, sensitive matters, and high-value decisions.
6. **Monitor:** The Revenue Command Centre surfaces priority leads, pending actions, stalled deals, and open revenue leaks.

## 4. Repository evidence and implementation status

This table describes what code inspection established. It is not a claim that every feature has been validated against live production credentials.

| Capability | Repository evidence | Status / qualification |
|---|---|---|
| Structured AI lead qualification | `src/lib/ai/extractor.ts` uses AI SDK `generateObject`, Zod schema, and OpenAI `gpt-4o-mini`; deterministic fallback is present | Implemented; live model use depends on `OPENAI_API_KEY` |
| Tenant-specific qualification | Extractor accepts the organisation's `qualificationPolicy` | Implemented in qualification flow; test against real tenant data |
| Revenue signals and next-best-action | `src/lib/revenue-engine/engine.ts` persists intent, fit, urgency, and value signals and creates Revenue Actions | Implemented |
| Revenue command centre | `src/app/(saas)/dashboard/revenue-engine/page.tsx` | Implemented UI and data queries; use a populated demo tenant |
| Public lead capture | `src/app/api/leads/capture/route.ts` validates workspace slug, rate-limits, checks duplicates, and persists leads | Implemented endpoint |
| Meta lead forms | `src/app/api/webhooks/facebook/route.ts` verifies webhook signatures when configured, retrieves lead details through Meta Graph API, and sends a background event | Integration code exists; verify app subscriptions, tokens, page-to-tenant mapping, and live delivery |
| WhatsApp inbound | `src/app/api/webhooks/whatsapp/route.ts` supports webhook verification and inbound message handling | Inbound path exists; tenant mapping and signature configuration need validation |
| WhatsApp outbound AI reply | Current webhook saves an AI response and logs a mocked send rather than calling the WhatsApp Cloud API | **Not production-ready; do not claim live outbound automation** |
| Automated follow-up | `src/app/api/cron/follow-ups/route.ts` has pilot safeguards; unattended dispatch is disabled unless explicitly enabled, and current route logs rather than sends a real message | **Not production-ready; do not claim automatic message delivery** |
| Revenue leakage detection | `src/lib/inngest/cron.ts` identifies stale proposal-stage deals and creates Revenue Leak and human follow-up records | Implemented workflow; validate scheduling and duplicate behaviour |
| Sales team assignment | Revenue Engine supports organisation routing modes and team availability | Implemented; validate with multiple real team members |
| Sales practice and learning | Practice, coaching, playbook, evaluation, and DSS routes/models exist | Supporting capability; not the primary challenge proposition |

## 5. Technology

The current repository indicates the following stack:

- Next.js App Router, React, and TypeScript
- PostgreSQL with Prisma ORM
- NextAuth.js authentication
- AI SDK with OpenAI model integration
- Zod structured-output validation
- Inngest background workflows
- Vercel deployment infrastructure

Do not claim that every listed provider integration is configured in the current production environment. Confirm environment variables and deployment settings before the pitch.

## 6. What makes CloseCraft different

CloseCraft's central proposition is the connection between AI-assisted understanding and accountable sales execution. It does not stop at generating a reply. It aims to answer:

- Which lead needs attention?
- Why is the lead important?
- What information is missing?
- What should happen next?
- Who is responsible for taking that action?
- Is the opportunity stalled or at risk?

The system combines structured qualification, organisation-specific policies, a next-best-action workflow, and human oversight. The defensible product direction is the operational layer between marketing lead generation and revenue conversion.

## 7. Recommended live demonstration

Use a clearly labelled demonstration workspace and fictional prospect data. Do not expose real customer information.

**Demo scenario:** A Nigerian professional services business receives an enquiry from a prospect who needs help, has a stated budget, and wants a solution within a defined timeframe.

1. Show the organisation's approved offer information and qualification policy.
2. Create or ingest a sample lead with a realistic enquiry.
3. Run the qualification flow and show intent, fit, urgency, extracted information, and evidence.
4. Open the Revenue Command Centre and show the resulting priority and Next Best Action.
5. Assign the lead to a human sales representative.
6. Show how a stalled opportunity becomes visible as a revenue leak and creates a human follow-up action.
7. Explain the WhatsApp and Meta integrations accurately, distinguishing implemented webhook code from provider-verified live operation.

**Demo outcome:** Judges should see how an enquiry becomes an owned, qualified, prioritised sales opportunity with a clear next action.

## 8. Claims to avoid until verified or implemented

- Do not say CloseCraft autonomously sends WhatsApp replies in production. The current outbound path is mocked.
- Do not say automated follow-up messages are being delivered. The pilot route currently prevents unattended dispatch by default and does not call a live messaging provider.
- Do not describe Instagram DM or email as fully connected, end-to-end channels unless the corresponding provider integrations are tested and operational.
- Do not present estimated pipeline values, heuristic scores, seeded records, or demo dashboards as customer results or realised revenue.
- Do not claim a measured conversion uplift, revenue recovered, number of paying customers, or number of active businesses without verifiable evidence.
- Do not claim complete production readiness from a successful build or passing unit tests alone.
- Do not imply that an AI model is used on every interaction. The extractor has a deterministic fallback, and a separate legacy qualification helper contains heuristic/mock response logic.

## 9. Pre-submission verification checklist

- [ ] Confirm challenge eligibility and team residency requirements independently of product readiness.
- [ ] Verify the demo URL loads, authentication works, and judges can access the intended demo workspace.
- [ ] Prepare fictional sample leads and a clean organisation qualification policy.
- [ ] Confirm `OPENAI_API_KEY` is configured in the demo environment and capture a real structured qualification result.
- [ ] Verify Meta webhook subscriptions, signature validation, page access token, and page-to-organisation mapping in a controlled test.
- [ ] Verify WhatsApp phone-number-to-organisation mapping. Remove any primary-workspace fallback before enabling multi-tenant live use.
- [ ] Keep outbound WhatsApp and unattended follow-up disabled unless a real provider send path, opt-in handling, template compliance, idempotency, and human handoff are tested.
- [ ] Confirm that demo records are clearly marked and no real customer data is exposed.
- [ ] Run the repository's build, lint, and test scripts in the project environment.
- [ ] Record a short screen demo and retain screenshots of the actual product state.
- [ ] Prepare evidence of customer discovery, pilot usage, or measurable outcomes only where such evidence exists.

## 10. Application summary

CloseCraft is building an AI-powered revenue recovery platform for businesses that lose sales opportunities because inbound enquiries are not consistently managed. It combines AI-assisted lead qualification, organisation-specific rules, explainable revenue signals, next-best-action recommendations, team assignment, and revenue-leakage monitoring. Its goal is to help businesses move from simply generating leads to managing every serious opportunity with clarity and accountability.

---

**Accuracy note:** This evidence pack is based on repository source inspection on 17 November 2026. It is a technical preparation document, not an independent security audit or production integration certification.
