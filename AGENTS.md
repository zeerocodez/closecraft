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
