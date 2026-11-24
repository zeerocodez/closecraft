# CloseCraft — AI Revenue Operating System
> Multi-tenant AI revenue recovery and sales execution platform for B2B enterprises, consulting firms, agencies, and high-ticket service providers.

[![CI / Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://closecrafthq.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.6_App_Router-black)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Prisma-PostgreSQL_Supabase-38bdf8)](https://prisma.io)
[![Multi-Tenant](https://img.shields.io/badge/Multi--Tenancy-Strict_Server_Isolation-purple)](#multi-tenant-architecture)

---

## 1. Executive Summary & Value Proposition

In high-ticket B2B services, up to **67% of inbound commercial enquiries leak away** due to delayed first touch, unstandardized qualification, lack of human closer assignment, and non-existent follow-up discipline.

CloseCraft bridges the gap between receiving an enquiry and converting it into realized revenue:
1. **Multi-Tenant Inbound Capture:** Automatically ingests enquiries from official **WhatsApp Business Platform**, **Meta Lead Ads (Facebook & Instagram)**, and embeddable **Website Widgets** with cryptographic signature verification.
2. **Canonical AI Qualification:** Standardizes lead evaluation into four objective signals (**Intent, Fit, Urgency, Value**) without fabricating unstated budgets or hallucinating decision timelines.
3. **Prescriptive Next Best Action:** Answers *"What needs attention right now?"* for sales teams, assigning each action to the appropriate actor: **AI**, **Automation**, **Human Closer**, or **System**.
4. **Sales Rep Dispatch & Fair Routing:** Automatically routes qualified opportunities to certified Closers and Setters via round-robin, scheduling discovery calls with automatic meeting links.
5. **Revenue Leakage Prevention:** Continuously monitors pipeline deals and response SLAs, alerting management to stalled deals and at-risk revenue before opportunities are permanently lost.
6. **Financial Distinction:** Strictly separates **prospect-stated budgets**, **AI opportunity estimates**, **signed contract values**, and **verified realised cash collections** (Bachs / Paystack).

---

## 2. Target Market

* **Consulting Practices & Advisory Firms:** Management consultants, legal practices, accounting and audit firms handling retainers between ₦1.5M and ₦15M.
* **B2B Digital Agencies:** Software engineering, growth marketing, and digital transformation agencies with high-value inbound enquiries.
* **Corporate Training Academies:** Professional bootcamps and executive education programs requiring disciplined qualification and enrolment tracking.
* **High-Ticket Sales Teams:** Distributed sales forces in Nigeria, Kenya, Ghana, and broader emerging markets operating primarily over WhatsApp and direct calls.

---

## 3. Core Platform Capabilities

### A. Multi-Tenant WhatsApp & Meta Ingestion
* **Strict Tenant Resolution:** Incoming WhatsApp messages resolve to an organization strictly by `whatsappPhoneNumberId` or verified phone number. Meta Lead Ads resolve strictly by `facebookPageId`.
* **Quarantine of Unmapped Enquiries:** Unmapped phone numbers or pages are safely quarantined into `WebhookEvent` logs with audit trails. **Zero unmapped leads ever enter another client's workspace.**
* **Cryptographic Verification:** Webhook endpoints verify HMAC-SHA256 signatures (`x-hub-signature-256`) using `crypto.timingSafeEqual`.
* **Compliance & Opt-Out:** Inbound `STOP` or `UNSUBSCRIBE` keywords immediately set `optedOutOfMarketing: true`, halting all automated outreach.

### B. Canonical Structured AI Qualification Engine
* **Single Authoritative Extractor:** Powered by `@ai-sdk/openai` and Zod schema validation. Obsolete mock qualification engines have been eliminated.
* **Objective Signal Generation:**
  * **Intent Score (1–100):** Evaluated against explicit prospect language and buying triggers.
  * **ICP Fit Score (1–100):** Benchmarked against each tenant's custom `qualificationPolicy`.
  * **Urgency Score (1–100):** Calibrated from stated purchase timelines.
  * **Commercial Value:** Stated budget preserved; unstated figures labeled as `0 (Pending Discovery)`.
* **Transparent Analysis Modes:** Clearly labels assessments with `[Analysis Mode: AI Model Assessment (GPT-4o)]` or `[Analysis Mode: Deterministic Policy Fallback Engine]` for resilient offline operation.

### C. Sales Command Centre (`/today`) & Next Best Action
* Answers the essential sales question: *"What needs attention right now?"*
* Displays prioritized action queues (e.g. `SCHEDULE_DISCOVERY`, `CALL_URGENT`, `SEND_PROPOSAL`, `RESOLVE_LEAK`).
* Provides prescriptive WhatsApp openers and communication objectives for sales reps.

### D. Revenue Leakage Monitoring (`/pipeline`)
* Automatically flags deals with no activity beyond the configured threshold (e.g. 14 days post-proposal).
* Calculates exact **Revenue at Risk** tied to open leaks and SLA breaches.
* Measures **Revenue Recovered** when stalled opportunities are reactivated and closed.

### E. Financial Accuracy & Metric Separation
* **Estimated Opportunity Value:** Uncommitted pipeline potential based on prospect-stated budgets.
* **Qualified Pipeline Value:** Value of active negotiations in progress.
* **Closed-Won Contract Value:** Legally executed customer agreements.
* **Verified Realised Revenue:** Actual cash collected through verified payment webhooks (Bachs / Paystack).

---

## 4. Technical Architecture & Tech Stack

```
                                  INBOUND CHANNELS
              [Meta Lead Ads]    [WhatsApp Cloud API]    [Website Embed]
                     │                    │                     │
                     ▼                    ▼                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                             CLOSECRAFT API                                 │
│  • HMAC-SHA256 Webhook Verification                                         │
│  • Multi-Tenant Organization Resolver (Phone ID / Page ID)                 │
│  • Idempotency & Rate Limiting (Atomic DB + Memory Token Bucket)           │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                        CANONICAL REVENUE ENGINE                            │
│  • Structured AI Extractor (OpenAI / AI SDK + Deterministic Fallback)      │
│  • Standardized Revenue Signals (Intent, Fit, Urgency, Value)              │
│  • Prescriptive Next Best Action Generator                                 │
│  • Sales Rep Round-Robin Routing & SLA Enforcer                            │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
┌─────────────────────────────────┐       ┌──────────────────────────────────┐
│      PERSISTENCE & AUDIT        │       │       BACKGROUND WORKFLOWS       │
│  • PostgreSQL / Supabase        │       │  • Inngest Event-Driven Engine   │
│  • Prisma ORM (Strict Tenant ID)│       │  • WhatsApp Outbound Dispatch    │
│  • Immutable Audit Log Trail    │       │  • Revenue Leakage Cron Monitors │
└─────────────────────────────────┘       └──────────────────────────────────┘
```

* **Frontend:** Next.js 16.4 (App Router, Server Components, React 19, Tailwind CSS)
* **Backend:** Next.js Route Handlers, Inngest Workflow Engine
* **Database:** PostgreSQL on Supabase, managed via Prisma ORM
* **AI:** Vercel AI SDK (`ai`), `@ai-sdk/openai` (GPT-4o), Zod structured output schemas
* **Authentication:** NextAuth.js v5 (Secure Session Cookies, Scoped Role-Based Access)
* **Hosting:** Vercel Edge & Serverless Infrastructure

---

## 5. Local Development & Setup Instructions

### Prerequisites
* **Node.js:** v20.x or v22.x LTS
* **Package Manager:** npm (locked with `package-lock.json`)
* **Database:** PostgreSQL database instance (local or hosted Supabase)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/zeerocodez/closecraft.git
cd closecraft
npm ci
```

### 2. Environment Variables Configuration
Copy the example environment configuration:
```bash
cp .env.example .env.local
```
Ensure the following variables are configured in `.env.local`:
```ini
# Database & Core
DATABASE_URL="postgresql://user:password@host:5432/closecraft?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-nextauth-token"

# AI Engine
OPENAI_API_KEY="sk-proj-your-openai-api-key"

# Meta & WhatsApp Cloud API
WHATSAPP_APP_SECRET="your-meta-app-secret"
WHATSAPP_VERIFY_TOKEN="your-webhook-verification-token"
FACEBOOK_APP_SECRET="your-meta-app-secret"
FACEBOOK_VERIFY_TOKEN="your-webhook-verification-token"

# Follow-Up Dispatch Safeguards
# Keep "false" for safe pilot dry-run testing; set "true" only in production
WHATSAPP_LIVE_DISPATCH_ENABLED="false"

# Background Job Engine
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"
```

### 3. Database Migrations
Run the database migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Seed Dedicated Demonstration Workspace
Provision the **Apex Professional Services** evaluation workspace with 12 pre-configured scenarios and 7 team members:
```bash
npx tsx scripts/seed_apex_demo_workspace.ts
```

### 5. Run Automated Verification Tests
Execute the comprehensive test suite verifying multi-tenant isolation, AI qualification, and revenue lifecycle:
```bash
npm test
```
To run individual acceptance tests:
```bash
node --test tests/whatsapp_multitenant_isolation.test.cjs
node --test tests/meta_lead_ads_ingestion.test.cjs
node --test tests/revenue_engine_e2e_journey.test.cjs
```

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 6. Live Evaluator Demonstration Guide

A dedicated evaluation portal is available at `/demo` for evaluators and judges.

### Demonstration Workspace Credentials
| Role | Email | Password | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Managing Director (Owner)** | `demo.owner@apexconsulting.ng` | `DemoAccess2026!` | Overall revenue analytics, pipeline health, settings |
| **Revenue Operations Manager** | `demo.manager@apexconsulting.ng` | `DemoAccess2026!` | Lead assignment, SLA alerts, leakage resolution |
| **Senior Certified Closer** | `demo.closer1@apexconsulting.ng` | `DemoAccess2026!` | Lead triage, discovery calls, proposal closing |

### Recommended 2-Minute Demonstration Flow

1. **Access the Demo Portal:** Navigate to `http://localhost:3000/demo` or click *"Autofill Demo"* on the `/login` page.
2. **Review Inbound WhatsApp Triage (`/inbox`):**
   * Inspect live WhatsApp message threads from legal, logistics, and medical consulting prospects.
   * Note the AI-generated triage summaries and prescriptive opener recommendations.
3. **Inspect AI Qualification & Signals (`/leads`):**
   * Open `Dr. Adeyemi Adeleke` (₦4.5M budget) vs `David Adeleke` (₦150k budget).
   * Verify how the qualification policy automatically disqualified the under-budget enquiry without human intervention while flagging the high-ticket lead for urgent closer outreach.
4. **Sales Command Centre (`/today`):**
   * Review prioritized hot leads and overdue SLA actions.
   * Observe how every action is assigned to a specific actor (**AI**, **Automation**, or **Human Closer**).
5. **Scheduled Calls (`/appointments`):**
   * Inspect scheduled executive discovery sessions with auto-generated Google Meet rooms.
6. **Detect & Resolve Revenue Leakage (`/pipeline`):**
   * Locate the stalled deal: `Chief Victor Okafor (₦6.0M)` with an active *STALLED_OPPORTUNITY* leak.
   * Review the detected cause and recommended intervention.
7. **Verified Revenue Metrics (`/dashboard/revenue-engine`):**
   * Observe the strict separation of **Closed-Won Contract Value** (₦12M) vs **Verified Realised Collections** (₦8.5M).

---

## 7. Integration Status & Verification Safeguards

| Component | Status | Operational Safeguards |
| :--- | :--- | :--- |
| **WhatsApp Inbound Webhook** | **Production Ready** | Cryptographic HMAC validation, verified phone number mapping, automatic quarantine of unknown phone numbers. |
| **WhatsApp Outbound Follow-up** | **Pilot Dry-Run Guarded** | `WHATSAPP_LIVE_DISPATCH_ENABLED=false` by default. Outbound messages are recorded as `DRY_RUN_LOGGED`. Enforces 24h customer window and opt-out checks. |
| **Meta Lead Ads Webhook** | **Production Ready** | Page ID tenant scoping, payload normalization, instant Revenue Engine processing, unmapped page quarantine. |
| **AI Qualification Engine** | **Production Ready** | Structured Zod extraction, transparent fallback mode tagging, no unstated budget hallucination. |
| **Payment Ingestion** | **Production Ready** | Bachs & Paystack webhook signature verification, idempotent receipt handling. |

---

## 8. License & Commercial Information

CloseCraft is proprietary software engineered by **Zeerocodes Automation Limited** (RC 7291048), Lagos, Nigeria. Built for the AI Startup Challenge. All rights reserved.
