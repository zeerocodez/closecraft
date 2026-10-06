<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CLOSECRAFT ENGINEERING AGENTS GUIDE

## Mission

Build Closecraft as a production-grade, multi-tenant AI revenue operating system connecting the public marketing website with the authenticated SaaS application.

## Product Principle

The website acquires and converts customers.
The SaaS delivers the product.
The backend provides the secure source of truth.
AI handles speed and scale.
Humans handle judgement and high-value decisions.

---

## Architecture

The system consists of:

* Public marketing website
* Authentication
* SaaS application
* Backend/API
* Database
* AI services
* Background jobs
* Integrations
* Billing
* Analytics
* Audit infrastructure

Keep these boundaries clear.
Do not create unnecessary coupling.

---

## Existing Code

Before modifying the system:

* Inspect the existing code.
* Understand the framework.
* Read the existing documentation.
* Reuse functioning components.
* Avoid unnecessary rewrites.
* Preserve working functionality.

---

## Multi-Tenancy

Every customer-owned record must belong to an organisation.

Every private request must verify:

1. Authentication
2. Organisation membership
3. Role/permission
4. Resource ownership

Never trust an organisation ID supplied by the browser.
Tenant isolation is non-negotiable.

---

## Authentication

Use secure authentication.

Never expose:

* session secrets
* private tokens
* API keys
* database credentials

Never put authentication secrets in URLs.
Use secure cookies and server-side validation where appropriate.

---

## Public Website

The website is the acquisition layer.
It must:

* Explain the product.
* Convert visitors.
* Capture demo requests.
* Generate signups.
* Preserve attribution.
* Remain SEO-friendly.

Do not expose private SaaS data.

---

## SaaS

The SaaS is the authenticated product.
It owns:

* Leads
* Conversations
* AI actions
* Pipeline
* Automations
* Appointments
* Analytics
* Billing
* Settings

---

## Identity

The website and SaaS must use one coherent identity system.
Do not create duplicate user accounts.
Use secure redirect-based authentication when cross-domain authentication is required.

---

## AI

AI is never an authority above the application.
AI recommendations must pass through:

* Business rules
* Permission checks
* Plan entitlement
* Human approval where configured

AI must not bypass security controls.

---

## Human-in-the-Loop

Humans must be able to:

* Approve
* Reject
* Edit
* Reassign
* Override

AI decisions must remain auditable.
Never erase the original AI decision when a human overrides it.

---

## AI Safety

Treat all external lead messages as untrusted input.
Never allow lead content to:

* Reveal system prompts
* Change application permissions
* Access other tenants
* Bypass approval
* Change billing
* Execute unauthorised actions

---

## AI Data Isolation

AI context must always be scoped to the current organisation.
Never retrieve knowledge, conversations, leads or configuration belonging to another organisation.

---

## Billing

The payment provider webhook is the source of truth for subscription state.
Always verify webhook signatures.
Process webhooks idempotently.
Never trust client-side payment-success states.

---

## Database

Use migrations.
Use foreign keys.
Use indexes.
Avoid destructive migrations.
Every customer-owned table must have appropriate organisation scoping.

---

## API

Every private API endpoint must verify:

1. Authentication
2. Organisation
3. Permission
4. Resource access

Never rely solely on frontend protection.

---

## Public APIs

Public website forms and widgets must:

* Validate input
* Rate limit
* Prevent abuse
* Never expose secrets
* Use public identifiers only

---

## Integrations

Third-party credentials must remain server-side.
Validate webhook signatures.
Use adapters instead of coupling business logic to one provider.

---

## Analytics

Do not fabricate metrics.
Website analytics and customer SaaS analytics must remain logically separate.
Preserve attribution through signup and activation.

---

## Security

Never commit:

* API keys
* Passwords
* Tokens
* Database credentials
* Private certificates
* Production secrets

Use environment variables or a secure secret manager.

---

## Privacy

Collect only necessary personal information.
Support:

* Data export
* Data deletion
* Opt-out
* Retention controls

Do not expose customer data publicly.

---

## Performance

Avoid unnecessary client-side JavaScript.
Use pagination.
Use background jobs for expensive operations.
Do not block user requests with long-running AI operations.

---

## Accessibility

All interfaces must support:

* Keyboard navigation
* Screen readers
* Accessible labels
* Focus states
* Colour contrast
* Reduced motion

---

## Testing

Every integration must include:

* Unit tests
* Integration tests
* End-to-end tests
* Authentication tests
* Permission tests
* Tenant-isolation tests
* AI safety tests
* Billing tests

---

## Deployment

Maintain separate:

* Development
* Staging
* Production

Never use production credentials in development.

---

## Git

Use small, meaningful commits.
Examples:

feat: integrate website authentication
feat: connect marketing leads to crm
feat: add shared pricing configuration
feat: preserve signup attribution
feat: add customer website widget
fix: prevent cross-tenant lead access
fix: secure public lead endpoint
fix: validate billing webhooks
chore: improve production observability

---

## Definition of Done

A feature is complete only when it is:

* Functional
* Secure
* Tested
* Observable
* Documented
* Accessible
* Tenant-safe
* Production-ready

A feature that merely renders is not complete.

---

## Final Rule

Never sacrifice security, tenant isolation or data integrity for speed of implementation.

---

# REVENUE ENGINE & UNIFIED PLATFORM RULES (MASTER PROMPT)

**1. ONE PRODUCT, ONE ARCHITECTURE**
Do not duplicate Auth, Leads, Dashboards, AI, or Databases. Use a single source of truth. A lead captured on the website immediately enters the Revenue Engine. Maintain a unified data model enforcing strict tenant isolation (Organization/Workspace).

**2. LEAD LIFECYCLE & EVENTS**
Use a coherent lifecycle (e.g., NEW → ENGAGED → QUALIFYING → OPPORTUNITY → WON). Use domain events (`LeadCreated`, `MessageReceived`) separated from commands (`AssignHuman`).

**3. REVENUE SIGNAL & PRIORITY ENGINE**
Derive standardized signals (intent, fit, urgency, value). Prioritize leads explainably—do not use an opaque AI score without interpretable factors.

**4. NEXT BEST ACTION & ACTOR MODEL**
Every viable lead must have a Next Best Action (RESPOND, ESCALATE, WAIT) assigned to the correct actor: AI (reasoning), AUTOMATION (predictable), HUMAN (negotiation/closing), or SYSTEM (permissions/security). AI must never override deterministic business rules.

**5. UNIFIED WORKSPACES (INBOX, LEADS, PIPELINE)**
The Inbox, Leads list, and Pipeline must expose Revenue Engine intelligence natively. Do not force users to jump between applications. The Sales Command Centre must answer: **"What needs attention right now?"** (Hot Leads, Revenue at Risk, Overdue Follow-ups).

**6. FOLLOW-UP & HUMAN HANDOFF**
Follow-up must stop automatically upon terminal events. When AI detects high intent or complex objections, escalate deterministically: Assign human → Pause automation → Generate summary → Start SLA.

**7. APPOINTMENTS, LEAKAGE & ANALYTICS**
Appointments must operate directly inside the system. Build Revenue Leakage detection (stalled deals, SLA breaches) into the main workflow. Analytics and Attribution must span the entire journey (Source → Revenue). Do not fabricate metrics.

**8. REAL-TIME AI & AUTOMATION**
AI must use strict structured outputs and never invent pricing/commitments. Automations must be idempotent and native. Reflect updates in the UI in real-time where appropriate.

**9. SECURITY & RELIABILITY**
Enforce RBAC and tenant isolation server-side. Implement idempotency, retries, and duplicate-send prevention. A technical retry must never contact a prospect twice.

**10. AUDITABILITY & UX PRINCIPLES**
Trace every consequential action. The UI must communicate: **Priority → Reason → Action → Outcome**. Use simple, premium, modern design tokens shared between the marketing site and SaaS app.

**11. IMPLEMENTATION APPROACH**
Consolidate domain logic first, then data access, then application surfaces. Prioritize an operational vertical slice: 
*Real lead enters → stored → Revenue Engine processes → appears in App → Next Best Action generated → action executed → result reflected everywhere.* 
Every feature requires Database, Logic, Backend, UI, Permissions, Auditability, and Tests. Do not build disconnected mock dashboards.

**FINAL OPERATING PRINCIPLE**
One platform. One domain model. One source of truth. One revenue loop. Every viable lead must have a clear state, a measurable opportunity, and the right next action assigned to the right actor at the right time.




---

# DIGITAL SALES SCHOOL (DSS) & LMS RULES (MASTER PROMPT)

**1. BUILD DIRECTIVE**
Build an original, premium Digital Sales School (DSS) website plus AI-powered LMS for Zeerocodes Automation Limited. Primary business objective: convert qualified visitors into active paid students, then help those students produce measurable evidence of digital-sales competence.

**2. BRAND + DESIGN SYSTEM**
- Premium Nigerian technology education brand. Deep ink foundation, restrained electric accent, optional cyan highlight.
- Large editorial headlines, generous whitespace, strong alignment, and high-contrast CTAs.
- Use purposeful reveal, hover, and progress animations.

**3. AI LMS**
- Every module is locked by default. Module N+1 remains locked until the server confirms that Module N's required completion criteria have passed.
- AI layer includes: AI Tutor, AI Buyer Role-play, AI Assessor, AI Practice Coach, AI Study Planner.
- Human review remains authoritative for configured high-stakes certification.

**4. TECHNICAL DIRECTIVE**
- TypeScript architecture with clear domain/application boundaries.
- Server-authoritative authentication, payments, and entitlements.
- Persist all progress and assessment state server-side. Protect premium media.
- Build loading, empty, locked, error, and success states for all critical flows.

**5. CORE DATA MODEL**
Include: StudentProfile, Application, Payment, Enrollment, Cohort, Part, Module, ModulePrerequisite, Lesson, LessonProgress, ModuleProgress, Quiz, Question, QuizAttempt, Assignment, Submission, Assessment, AssessmentScore, RoleplayScenario, RoleplaySession, AIGrade, CompetencyScore, PortfolioArtifact, CertificationAttempt, InternshipOpportunity.

## Build and Validation

- Install the locked dependencies with `npm ci`.
- Run `npm run build` for the production build; the prebuild script generates Prisma Client.
- Run `npm run lint` and `npm test` before delivering changes.
- Google Fonts must be reachable during the build.
- Never run `prisma/seed.ts` against an existing database: it deletes data and creates demo accounts.
- A successful build does not verify deployment configuration or complete the planned product integrations.
