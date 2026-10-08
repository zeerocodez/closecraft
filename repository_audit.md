# CloseCraft Repository Audit & Unified Architecture Plan

This document fulfills the **Required First Response** directive to evaluate the existing CloseCraft repository and provide a target architecture plan for unifying the Public Website, Revenue Engine, and CRM.

## 1. Current State Assessment

*   **Current CloseCraft Architecture:** A monolithic Next.js 14 (App Router) application that houses both public marketing pages and authenticated SaaS experiences. 
*   **Current Website Architecture:** Resides in `src/app/(marketing)`. It is a statically/dynamically generated set of React pages. Forms (like the audit request) submit directly to `/api/leads` but are largely disconnected from the Revenue Engine logic.
*   **Current Revenue Engine Implementation:** Primarily exists as a mocked/static UI layer downloaded from Google Stitch (in `src/app/(saas)`). While there are some endpoints (Facebook webhook, CSV upload), the core looping logic (Understand -> Prioritise -> Action) does not exist in the backend.
*   **Existing Shared Functionality:** `globals.css` (design system tokens) and `schema.prisma` are shared across the entire app. The database contains a single `Lead` model, which is good.
*   **Duplicate or Conflicting Systems:** The main conflict is between the "Idea" of the Revenue Engine (as seen in the UI) and the "Reality" of the backend (which just stores basic leads). There are no duplicate databases.
*   **Current Database/Domain Model:** PostgreSQL via Prisma. Includes `User`, `Organization`, `Lead`, `Conversation`, `Message`, `Appointment`, `AiAction`, and `Deal`. It lacks explicit models for `RevenueSignal`, `NextBestAction`, or `RevenueAction`.
*   **Authentication and Multi-tenancy Assessment:** Multi-tenancy is partially implemented via `Organization` and `OrganizationMember` models. NextAuth is used for authentication. Tenant isolation is not strictly enforced via RLS (Row Level Security) at the DB level, but rather via application logic (`session.organizationId`).
*   **Existing API/Backend Architecture:** Simple Next.js Route Handlers (`src/app/api/...`). There is no CQRS, no formal Event Bus, and business logic is often mixed with routing.
*   **Integration Architecture:** Minimal. A Facebook webhook exists, but it's a direct API route (`api/webhooks/facebook`) rather than a robust, queued integration pipeline.
*   **AI Architecture:** Basic `AiAction` table exists, but there is no unified LLM orchestration layer or structured output pipeline.
*   **Major Integration Gaps:** Website leads don't trigger qualification workflows; no background event bus; UI in `(saas)` routes are mostly static HTML/JSX with no live data bindings to the database.

## 2. Target Architecture Recommendations

*   **Recommended Unified Target Architecture:**
    *   **Frontend:** Keep the Next.js App Router monolith. `(marketing)` and `(saas)` remain sibling route groups.
    *   **Data Access:** Implement a Data Access Layer (DAL) to strictly enforce tenant isolation (`getLeadForTenant(id, tenantId)`).
    *   **Event Infrastructure:** Implement an Event Bus (e.g., using Inngest, BullMQ, or Postgres Listen/Notify) to decouple commands from reactions (e.g., `LeadCreated` -> triggers `CalculatePriority`).
    *   **Revenue Engine:** Build as a core domain service (`src/lib/revenue-engine`) rather than a separate app.
*   **Components to Preserve:** Prisma Schema (mostly), NextAuth setup, existing UI components (they look great after the dark theme fix).
*   **Components to Refactor:** 
    *   Route Handlers (`api/*`) need to be refactored to emit Domain Events instead of executing monolithic logic.
    *   Static UI in `(saas)` must be wired to real server actions/queries.
*   **Components to Remove:** Any hardcoded demo data inside the `(saas)` UI components.

## 3. Implementation Requirements

*   **Required Schema Migrations:**
    *   Add `RevenueAction` (id, type, priority, actor, leadId, status).
    *   Add `RevenueSignal` (intent score, urgency, fit).
    *   Add `RevenueLeak` (for tracking missed SLAs).
*   **Required Backend Changes:**
    *   Implement an Event Dispatcher.
    *   Create Service classes (`LeadService`, `QualificationService`).
*   **Required Frontend Changes:**
    *   Replace static data in `src/app/(saas)/*` with React Server Components fetching live data from Prisma.
*   **Required Revenue Engine Changes:**
    *   Build the core state machine: evaluate incoming events, generate `RevenueSignal`s, and spawn `RevenueAction`s.
*   **Event Architecture:** 
    *   Needs a robust background job queue. Next.js cron/API routes are insufficient for reliable retries. Recommend evaluating Inngest or Trigger.dev for event-driven workflows.
*   **Security Concerns:** Tenant isolation must be bulletproofed before real traffic hits. Server Actions must verify `organizationId` against the requested resource.

## 4. Execution Plan

*   **Migration Sequence & Prioritised Implementation Plan:**
    1.  **Phase 1: Foundation (Current Sprint)**
        *   Update Prisma schema with `RevenueAction` and `RevenueSignal`.
        *   Implement the Event Dispatcher interface.
    2.  **Phase 2: The Core Loop**
        *   Wire Website Forms -> Lead API -> Emit `LeadCreated` Event.
        *   Build Revenue Engine listener for `LeadCreated` -> Creates a `RevenueAction` (e.g., `RESPOND`).
    3.  **Phase 3: UI Wiring**
        *   Connect the `(saas)/leads` and `(saas)/inbox` UI to the live DB.
        *   Display the `Next Best Action` derived from the DB.
    4.  **Phase 4: AI & Automation**
        *   Implement AI structured output for Qualification extraction.
        *   Implement automated Follow-up background jobs.

*   **Explicit Assumptions:**
    *   We are sticking with Next.js App Router and Prisma.
    *   We will use standard PostgreSQL features (or a lightweight queue) for the Event Bus to avoid adding heavy infrastructure (like Kafka) prematurely.
    *   The "CloseCraft Revenue Command Centre" dark theme we just applied remains the source of truth for the UI.
