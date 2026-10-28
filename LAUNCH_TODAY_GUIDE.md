# Closecraft "Launch Today" Production Deployment & Go-Live Guide

This guide gives you everything you need to take Closecraft live **today** with the new **Automated Business-Owner Onboarding & Qualification System**, **Starter (₦20,000/month)** and **Pro (₦45,000/month)** plans, active seat limit enforcement, official Bachs.io payment processing, and production infrastructure.

---

## 1. What Was Implemented & Deployed

The following features and security controls are active in the database schema, backend services, UI components, and committed to git:

### A. Automated Business-Owner Onboarding & Qualification Lifecycle
New business owners never land on an empty dashboard. Instead, they are automatically guided through a progressive 5-step onboarding lifecycle immediately following required email verification:

```
[Account Creation]
       │
       ▼
[Required Email Verification (/verify-email)]
       │
       ▼
[Progressive Onboarding Wizard (/onboarding)]
  ├── Step 1: Essential Workspace Setup
  │             • Workspace Name & Default Currency (NGN ₦ / USD $)
  │             • Team Structure (Solo, Small Team, Growing Team)
  │             • Inbound Channels (WhatsApp, Website Form, Social Ads, Referrals)
  │             • Immediate server persistence via updateWorkspaceSetupAction
  ├── Step 2: Intended Use Chooser
  │             • Software Only (Organizing & tracking internal sales)
  │             • Dedicated Closers (High-ticket remote sales reps)
  │             • Both (Software + Closers)
  │             • Not Sure Yet
  ├── Step 3: Short Business Qualification
  │             • New enquiries in the last 30 days (ranges or exact count + "Not sure")
  │             • Older opportunities awaiting a decision (ranges or exact count + "Not sure")
  │             • Who follows up & how progress is checked
  │             • Optional narrative of forgotten or delayed enquiries
  │             • Follow-up friction points
  ├── Step 4: Managed Service Assessment (Conditional)
  │             • Strictly bypassed for Software-Only prospects (zero financials required)
  │             • Qualified conversations check & saveable Economics Worksheet for managed sales
  │             • "Save draft & finish later" functionality
  └── Step 5: Relevant Activation Task & Recommendations
                • Software Fit badge & transparent explanation
                • Bounded Pilot parameters with explicit notice: Zero billing triggered
                • Interactive inline task: "Add Your First Live Enquiry" streamed into Revenue Engine
       │
       ▼
[Sales Command Centre (/today)]
  • Direct entry without redirect loops
  • Discreet top banner if user chose "Skip for now"
  • Accessible anytime via Organization Settings (/settings)
```

### B. Core Guardrails & Non-Negotiable Rules
1. **Low Volume Never Blocks Software Access**: A business with low enquiry volume receives `POTENTIAL_SOFTWARE_FIT` or `EXPLORE_SOFTWARE_FIT`. They are never locked out of using Closecraft.
2. **"Not sure" Preserved**: Unknown and estimated answers are never converted to zero.
3. **No Financial Assessment for Software Users**: Only users explicitly requesting dedicated closers or appointment setting see Step 4. Software-only users go directly from Step 3 to Step 5.
4. **Zero Billing on Recommendations**: Completing qualification and saving recommended pilot models does not create invoices or trigger Bachs charges.
5. **Server-Side Persistence & Resuming**: Onboarding progress persists in `WorkspaceQualification` (`currentStep`, `status: DRAFT | IN_PROGRESS | COMPLETED | SKIPPED`). Returning logins automatically resume at the exact step where the user stopped.
6. **No Redirect Loops**: If `status === 'COMPLETED'` or `status === 'SKIPPED'`, the user is never repeatedly bounced to `/onboarding`.
7. **Invited Member Isolation**: Team members joining via `/invite/[token]` enter their existing workspace immediately without creating duplicate workspaces or repeating qualification.
8. **External Professional Isolation**: Sales professionals (`EXTERNAL_PROFESSIONAL`) are automatically routed to `/rep` and never occupy workspace internal seats.

### C. Multi-Tier Plan Structure & Seat Enforcement
| Plan | Price (NGN) | Internal Seats | Description & Target Audience |
| :--- | :--- | :--- | :--- |
| **Starter** | **₦20,000 / mo** | **3 Seats** | Lean service businesses & small sales teams. 14-day free trial (no card required), enquiry capture, follow-up SLA tracking, and revenue leakage alerts. |
| **Pro** | **₦45,000 / mo** | **10 Seats** | High-velocity sales teams. Includes everything in Starter plus 10 internal team seats, **Round-Robin automated lead routing**, manager call coaching & review queue, priority notification dispatch, and revenue health analytics. |

- **Seat Cap Enforcement**: `addTenantTeamMember` checks `internalMembersCount >= maxSeats`. If a Starter workspace attempts to add a 4th internal team member, the action throws a clean error guiding the owner to upgrade to Pro.
- **Bachs Checkout Session Metadata**: Bachs hosted checkout sessions record `plan: 'STARTER'` or `plan: 'PRO'`.
- **Instant Webhook Provisioning**: When Bachs confirms payment (`collection.succeeded` or `invoice.paid`), the webhook updates `workspaceSubscription.plan`, `pricePerMonth`, `maxInternalSeats` (3 for Starter, 10 for Pro), and extends `paidThroughDate` by one full calendar month.

---

## 2. Production `.env` Requirements

To launch today on Vercel, Railway, Render, or a VPS, configure the following environment variables in your deployment environment:

```ini
# ==============================================================================
# 1. APPLICATION & AUTHENTICATION
# ==============================================================================
NODE_ENV="production"
NEXTAUTH_URL="https://app.closecraft.com" # Replace with your production domain
NEXTAUTH_SECRET="f4d8e9c1a2b3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9" # Generate: openssl rand -hex 32
NEXT_PUBLIC_APP_URL="https://app.closecraft.com"

# ==============================================================================
# 2. DATABASE (SUPABASE POSTGRESQL POOLING)
# ==============================================================================
# IMPORTANT: Next.js Server Actions and serverless routes need transaction pooling
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=15"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# ==============================================================================
# 3. BACHS.IO PAYMENT GATEWAY (PRODUCTION)
# ==============================================================================
# Obtain from your Bachs dashboard (https://bachs.io or https://dashboard.bachs.io)
BACHS_API_BASE="https://api.bachs.io"
BACHS_SECRET_KEY="sec_live_..."          # Your Bachs Live Secret Key
BACHS_PUBLIC_KEY="pub_live_..."          # Your Bachs Live Public Key
BACHS_WEBHOOK_SECRET="whsec_..."         # From Bachs Webhook configuration
BACHS_FORCE_SANDBOX="false"              # Keep false for live production billing

# ==============================================================================
# 4. AI TRIAGE & REVENUE ENGINE
# ==============================================================================
GROQ_API_KEY="gsk_..."                   # Fast Llama 3.3 70B inference for triage & voice notes

# ==============================================================================
# 5. COMMUNICATIONS & NOTIFICATIONS
# ==============================================================================
RESEND_API_KEY="re_..."                  # For verification emails and notifications
WHATSAPP_PHONE_NUMBER_ID=""              # Meta WhatsApp Business Cloud API ID (optional)
WHATSAPP_ACCESS_TOKEN=""                 # Permanent Meta token (optional)
WHATSAPP_WEBHOOK_VERIFY_TOKEN=""         # Webhook verification secret
CRON_SECRET="closecraft_cron_secret_..." # Protects /api/cron/* endpoints
```

---

## 3. Bachs.io Setup (Step-by-Step for Launch Today)

Bachs.io is the official payment gateway for Nigerian Naira (NGN) settlements supporting **Instant Bank Transfer (virtual account per checkout)**, **Debit Cards (Mastercard, Visa, Verve)**, and **MoMo**.

### Step 3.1: Switch to Live Mode in Bachs Dashboard
1. Log in to [bachs.io](https://bachs.io/).
2. Toggle the dashboard from **Sandbox / Test** to **Live**.
3. Under **Settings → API Keys**:
   - Copy your **Secret Key** (`sec_live_...`) and set it as `BACHS_SECRET_KEY`.
   - Copy your **Public Key** (`pub_live_...`) and set it as `BACHS_PUBLIC_KEY`.

### Step 3.2: Configure the Webhook Endpoint
Closecraft ships with a production webhook handler featuring HMAC-SHA256 signature verification and idempotent processing:
- **Webhook URL**: `https://[YOUR-PRODUCTION-DOMAIN]/api/webhooks/bachs`
  *(Example: `https://app.closecraft.com/api/webhooks/bachs`)*
- **Subscribed Events**: Select the following events:
  - `collection.succeeded` *(Primary event when a customer pays)*
  - `invoice.paid`
  - `checkout.completed`
- **Signing Secret**: Copy the signing secret generated by Bachs (`whsec_...`) and paste it into `BACHS_WEBHOOK_SECRET`.

> [!IMPORTANT]
> **Currency Precision Rule**: Bachs mandates decimal string representations (`"20000.00"` for Starter, `"45000.00"` for Pro). Closecraft's payment adapter handles this strictly so minor-unit conversion errors (e.g. kobo vs naira) are mathematically impossible.

### Step 3.3: Settlement Bank Account
1. Under Bachs **Settings → Payouts / Settlements**, ensure your corporate bank account (e.g. GTBank, Zenith, Access, Kuda) is verified.
2. Verified collections are disbursed directly to your account according to Bachs settlement schedule (T+1 or instant depending on account tier).

---

## 4. Go-Live Verification Smoke Test (7-Minute Verification)

Follow this complete end-to-end verification script:

### Flow 1: Signup, Email Verification & Workspace Setup
1. Open `https://[YOUR-DOMAIN]/signup`.
2. Fill in:
   - Full Name: *"Ngozi Okonjo"*
   - Business Email: *"ngozi@apexlogistics.ng"*
   - Workspace Name: *"Apex Logistics"*
   - Password: `Password123!`
3. Click **Create Workspace**.
4. **Verify Email Screen (`/verify-email`)**:
   - The user is automatically routed to `/verify-email`.
   - Enter the 6-digit code sent to the email (or click **Quick Verify** in development).
   - Upon verification, the user is forwarded to `/onboarding`.

### Flow 2: Progressive Qualification & Activation
1. **Step 1 (Workspace Setup)**:
   - Confirm Workspace Name and Currency (NGN ₦).
   - Select Team Structure (*"Small Team (2-5 people)"*).
   - Click **Save & Continue**.
2. **Step 2 (Intended Use)**:
   - Select *"Software Only"* (or *"Dedicated Closers"* to test managed screening).
   - Click **Next**.
3. **Step 3 (Short Qualification)**:
   - New enquiries in last 30 days: Select *"20-49 enquiries"*.
   - Older opportunities: Select *"10-19 opportunities"*.
   - Who follows up: Select *"Several team members"*.
   - Check methods: Check *"CRM / Tracking sheet"* and *"Direct WhatsApp / Phone"*.
   - Click **Evaluate Fit**.
4. **Step 4 (Service Assessment)**:
   - If *"Software Only"* was chosen, Step 4 is automatically skipped.
   - If *"Dedicated Closers"* was chosen, the Economics Worksheet appears with saveable drafts.
5. **Step 5 (Activation & First Enquiry)**:
   - View the Software Fit Badge (*"Strong Software Fit"*).
   - Review Bounded Pilot Terms (with explicit notice: *Zero billing triggered*).
   - Use the inline **"Add Your First Live Enquiry"** form:
     - Name: *"Tunde Bakare"*
     - Phone: `+2348012345678`
     - Channel: WhatsApp
     - Notes: *"Requested pricing on fleet contract"*.
   - Click **Add Enquiry & Enter Workspace**.
   - User lands in `/today` (Sales Command Centre) with the lead already triaged and ready for action!

### Flow 3: Skip & Resume Protection
1. Log in with an account that clicked **Skip for now**:
   - Lands directly on `/today` without a redirect loop.
   - Discreet amber banner appears at top: *"Complete your onboarding profile to unlock tailored recommendations → Finish Setup"*.
   - In `/settings`, the *"Onboarding & Qualification Profile"* card allows updating anytime.

### Flow 4: Seat Enforcement & Bachs Upgrade
1. In `/team`, add Rep 1 and Rep 2 (Total internal members = 3: Owner + Rep 1 + Rep 2).
2. Attempt adding a 4th member. System cleanly blocks:
   > *"Workspace seat limit reached (3/3 internal seats in use). Please upgrade to the Pro plan (10 seats) in Billing & Subscriptions to invite additional team members."*
3. Go to `/billing`, click **Upgrade to Pro (₦45,000 / month)**.
4. Complete Bachs checkout and return to `/billing?status=success`.
5. Seats increase to 10 immediately, allowing the new team member to be invited!

---

## 5. Automated Acceptance Test Verification

All 86 unit, lifecycle, and security tests pass locally and in CI:

```bash
$ npm test
▶ Closecraft Onboarding & Qualification Lifecycle Acceptance Tests (66.2ms)
  ✔ 1. Account Creation & Required Email Verification (6.8ms)
  ✔ 2. Progressive Steps: Workspace Setup & Intended Use (1.7ms)
  ✔ 3. Short Qualification Questions & Low Volume Non-Blocking (3.7ms)
  ✔ 4. Separate Service Assessment: Software-Only skips Financials (1.8ms)
  ✔ 5. Server-Side Persistence & Resuming Interrupted Onboarding (2.0ms)
  ✔ 6. Prevention of Redirect Loops for Completed & Skipped Users (8.6ms)
  ✔ 7. Invited Members & External Professional Route Isolation (0.8ms)
  ✔ 8. Activation Task: Adding First Enquiry with Zero Billing (0.8ms)
▶ CloseCraft Free Pilot & Revenue Engine Integrity (13.0ms)
▶ Closecraft Full Production Hardening & Security Acceptance Tests (35.0ms)
▶ Closecraft Onboarding & Qualification Engine Acceptance Tests (161.6ms)

ℹ tests 86 | suites 32 | pass 86 | fail 0
```

Production build validation:
```bash
$ npm run build
✓ Compiled successfully in 23.4s
  Running TypeScript ...
✓ Generating static pages using 3 workers (84/84) in 4.5s
```
