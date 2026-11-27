# Focus & Scope Plan (Nov 2026)

CloseCraft's schema holds 131 models because the monolith carries several
products at once. That breadth is the project's biggest strategic risk for a
small team: every module adds surface for bugs, tests, and support. This plan
sets an explicit focus order. It changes no code by itself — it governs what
gets built next.

## Tier 1 — The product (invest here)
**Revenue Engine SaaS** for the two primary launch markets (Lagos real
estate and education/training): WhatsApp/Meta lead ingestion, AI
qualification, `/today` command centre, `/pipeline` leakage monitoring,
billing via Bachs. This is the wedge, the pricing in
`src/lib/billing/catalog.ts`, and the story in the README.

## Tier 2 — Revenue-adjacent (maintain, extend only on customer demand)
- Lead Recovery Campaigns — feeds Tier 1 workspaces.
- Introductory Growth Services (quotations/proposals) — feeds Tier 1 signups.
- Managed sales / pilot engagements — high-touch revenue while SaaS scales.

## Tier 3 — Separate products sharing the monolith (feature freeze)
- **Digital Sales School / LMS** (courses, modules, quizzes, certification,
  roleplay): a real business, but a different buyer and roadmap. Freeze new
  features except payment/enrolment fixes. Revisit extraction into its own
  app once Tier 1 has paying cohorts.
- **Practice/coaching suite** and **Ecosystem/community** features: freeze.
- **Affiliate platform**: maintain payouts correctness only.

## Rules
1. New Tier 3 work requires a written exception naming the customer/revenue
   it unblocks.
2. Every Tier 1 feature ships with a source-verifying test, not a
   self-referential acceptance fixture.
3. Review this plan after the first 10 paying Tier 1 workspaces or in
   90 days, whichever comes first.
