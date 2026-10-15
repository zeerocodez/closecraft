# Closecraft - AI Revenue Operating System

## 1. The Problem

CloseCraft addresses the critical gap between receiving an enquiry and turning it into a properly followed-up sales opportunity.

A prospective customer asks about a service, receives a price, and says, *“I’ll get back to you.”* The conversation then stalls. The business owner may forget to follow up, send a generic reminder, or struggle to identify what is preventing the customer from buying.

The specific problem is that interested prospects often have no assigned salesperson or agreed next action. Owners also lack a reliable view of which enquiries need attention right now.

### Target Customer Hypothesis
The primary audience focuses on **Nigerian training providers and professional service businesses** with clear offers and a regular flow of enquiries, such as:
- Training Academies & Digital Sales Bootcamps
- Consulting firms and advisory practices
- High-ticket digital agencies and services providers

These businesses already attract consistent interest but struggle to systematically manage and close the conversations that follow. Validation is conducted through structured customer interviews and paid pilots.

---

## 2. The App & Workflow

CloseCraft is built as a responsive, mobile-friendly web application:
- **Business Owners:** Manage high-priority deals, monitor health, and review follow-ups directly on mobile browsers.
- **Sales Reps & Closers:** Operate from desktop laptops with full CRM, lead queues, and live negotiation workspaces.

### Communication Channels & Basic Workflow
Prospects communicate via website enquiry forms or connected **WhatsApp Business Platform** channels:
1. **Lead Ingestion:** An enquiry automatically creates or updates a tenant-isolated lead record.
2. **AI Qualification & Assistance:** The AI assistant answers approved questions and prompts the prospect with relevant qualification questions.
3. **Information Extraction:** CloseCraft records the customer’s needs, budget, timing, and authority, explicitly flagging missing details as `unknown`.
4. **Next Best Action Assignment:** The Revenue Engine assigns a clear Next Best Action (e.g. arranging a discovery call, assigning a human closer, or scheduling an approved follow-up sequence).
5. **Deterministic Human Escalation:** A human sales closer takes over whenever the conversation requires judgement, custom negotiation, or high-stakes closing.
6. **Unified Sales Command Centre:** The dashboard surfaces each lead's owner, conversation history, and Next Best Action so business owners instantly see what requires immediate attention.

WhatsApp automation operates strictly via the official Business Platform with recipient opt-in, approved message templates, and instant human handoff triggers.

---

## 3. Teaching & Configuring the AI

The AI assistant is configured around an **approved information pack** for each business:
- **Services & Pricing:** Verified offers, service tiers, and prices. The AI is strictly bounded and will **never** invent unauthorized prices or discounts.
- **Ideal Customer Profile (ICP) & Qualification Policy:** Explicit business rules combined with AI interpretation (e.g., minimum budget thresholds like ₦500k+ for B2B vs ₦80k+ for training bootcamps, decision-maker roles, and deal timelines).
- **Delivery Terms & FAQs:** Canonical knowledge base indexed for retrieval-augmented generation (RAG) with tenant scoping.
- **Tone & Authorization Boundaries:** Clear constraints specifying what the assistant can answer autonomously and what must be escalated to human operators.

### Human-in-the-Loop & Safety Principles
- **Unapproved Requests:** If a prospect asks for an unapproved discount or unsupported term, the assistant automatically routes the request to a human with full context.
- **Deterministic Follow-up Sequences:** Follow-up sequences pause immediately when a customer replies, opts out, or moves into human handling.
- **Strict Multi-Tenant Isolation:** Each organization’s knowledge base, leads, conversations, and qualification policies are strictly isolated at the database and API layer.

### What Business Owners Can Do Inside CloseCraft
- [x] Create an organization profile and enter approved offer information.
- [x] Import bulk CSV leads or capture live website enquiries.
- [x] Watch AI answer questions and extract qualification data with missing information highlighted.
- [x] Define custom qualification logic (ICP) with one-click re-evaluation across all existing leads.
- [x] Assign leads to sales reps and schedule Next Best Actions with SLA timers.
- [x] Review, approve, or edit automated follow-up messages.
- [x] Take over any conversation with complete history preserved.
- [x] Record confirmed commercial outcomes and track conversion attribution.

---

## Technology Stack
- **Frontend/Backend:** Next.js (App Router) with TypeScript
- **Styling:** Vanilla CSS & Tailwind tokens (dark ink foundation `#030712`, clean borders, electric accent `#2563eb`)
- **Database & Multi-Tenancy:** PostgreSQL / Prisma ORM with strict organization scoping
- **Authentication:** NextAuth.js (Credentials & Google OAuth with auto-tenant provisioning)
- **Validation:** Zod schemas (client-side and server-authoritative)

## Local Development
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open `http://localhost:3000` to view the site.

## Environment Variables
The application requires several environment variables for database connections, analytics, and secrets. Refer to `.env.example` (to be created) for the required keys. Never commit the actual `.env` file.

## Database Setup & Migration Process
- The application uses migrations to manage database schemas.
- Ensure your database connection string is properly set in the `.env` file.
- Run migrations before starting the application to ensure the `leads` table and other necessary schemas exist.

## Deployment Process
- Run `npm run build` to verify the production build.
- Ensure environment configuration is correct.
- Verify migrations and test live functionality on the staging/production environment before declaring readiness.

## Admin Architecture
An admin layer is planned to view, filter, and manage closer applications and business requests. The initial build will focus on secure database architecture and robust form submissions, preparing the ground for the admin interface.

## Form Architecture
Forms are validated on both the client (for immediate feedback) and server (for security). Malformed input, spam, and invalid data are rejected server-side to protect the database.

## Analytics Architecture
Conversion tracking is prepared for key actions (hero clicks, form submissions, etc.) using clean event names to allow easy integration with analytics providers later.

## Asset Requirements
- Compressed media and lazy-loaded assets.
- Responsive mobile variants for videos.
- Proper SEO metadata, Open Graph images, and semantic HTML structure.


## Build and validation

Install dependencies with `npm ci`, then run:

```sh
npm run build
npm run lint
npm test
```

The production build generates Prisma Client before compiling Next.js. Prisma CLI and Client use matching version 6 releases to support the existing SQLite schema and client initialization. Internet access to Google Fonts is required for the current fonts. See [Prisma's upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7) before upgrading the database packages to version 7 or later.

The tenant-page tests verify login redirects, reject missing organisation IDs before database access, and check that page queries use the session organisation. They use mocked sessions and database calls; they do not establish complete authentication or database isolation coverage.

The login and marketing form currently simulate submission, and several views contain demo content. A successful build verifies compilation, not production readiness. Do not run `prisma/seed.ts` against existing data: the seed deletes all records before creating demo accounts.
