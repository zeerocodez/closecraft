# CloseCraft HQ — Commercial Architecture, Readiness Matrix & Confirmation Checklist

**Brand Identity:** CloseCraft HQ (Zeerocodes Automation Limited, RC 8421094)  
**Primary Billing Provider:** Bachs.io  
**Independence Notice:** CloseCraft HQ is a revenue operations platform for businesses. It is not affiliated with CloseCraft App.


> **Single source of truth (added Nov 2026):** Plan names, prices, seats, lead
> limits and trial length are defined in code in `src/lib/billing/catalog.ts`
> (Starter ₦15,000/mo · 2 seats · 500 leads · 7-day trial; Growth ₦35,000/mo ·
> 5 seats · 2,000 leads; Scale ₦75,000/mo · 15 seats · 10,000 leads; Enterprise
> custom). The company registration number is **RC 8421094**. Every page, doc
> and launch asset must match the catalog — if they disagree, the catalog is
> right and the other document is a bug. Older documents that quoted
> ₦20,000/₦45,000 "Pro" pricing or a 14-day trial describe a superseded offer.

---

## 1. Architecture Summary Across 4 Commercial Streams

### Stream A: Revenue Engine SaaS Subscriptions
- **Core Rule:** Workspace-and-capacity pricing, not per-seat licence gouging.
- **NGN Plans:** `STARTER` (₦15,000/mo — 1 workspace, 500 leads, 2 seats, 200 AI ops), `GROWTH` Recommended (₦35,000/mo — 2,000 leads, 5 seats, 1,000 AI ops), `SCALE` (₦75,000/mo — 10,000 leads, 15 seats, 5,000 AI ops), `ENTERPRISE` (Superadmin-configured custom quotation & multi-workspace limits).
- **Regional Markets:** Independent prices configured per market (`NG`, `US`, `GB`, `CA`, `GLOBAL`) with `MONTHLY` and `ANNUAL` (~2 months free = 10x monthly) billing.
- **Subscription Lifecycle (`src/lib/billing/stateMachine.ts`):** `TRIALING` (7-day no-card trial), `ACTIVE`, `PAST_DUE`, `GRACE_PERIOD` (5-day default preserving data), `SUSPENDED`, `CANCELLED`, `EXPIRED`, `PILOT_INCLUDED`.
- **Metering & Enforcement (`src/lib/billing/entitlements.ts`):** Server-enforced lead caps (`EntitlementLimitError`), team seat limits, AI qualification metering (`estimatedProviderCostUsd`), campaign limits, and opt-in prepaid `UsageCredit` packs.

### Stream B: Introductory Growth Services
- **CTA Policy:** Primary CTA is `"GET STARTED"` (consolidated quotation request, never forcing immediate checkout on custom services).
- **Quotations (`src/lib/growth/proposals.ts`):** Line-item support for Meta/IG Ads, AI Flyers, AI Videos, Landing Pages, and VSLs with optional discount, tax rate, terms, and Bachs.io checkout creating downloadable receipts (`/api/billing/invoices/[id]/document`).

### Stream C: Lead Recovery Campaigns
- **Tiered Pricing (`src/lib/recovery/campaignService.ts`):** `TIER_500` (₦25,000 / $35), `TIER_2000` (₦50,000 / $69), `TIER_5000` (₦100,000 / $129), `CUSTOM` (5,000+).
- **Conversion Integrity:** Inbound positive replies increment `interestedCount`; `convertedCount` updates only upon verified `WON` pipeline conversion. Live dispatch requires explicit campaign approval (`approveRecoveryCampaign`).

### Stream D: Sales Enablement & Digital Sales School (DSS)
- **Tiers:** `2%–5%` Foundation, `5%–10%` Growth, `8%–15%` Managed Dedicated Closing, and Retainer + Commission Pods.
- **Trust & Financial Safety (`src/lib/sales/commissionEngine.ts`):** Commissions accrue **only** upon verified Bachs.io payments (`recordVerifiedSaleCommission`), require Maker-Checker separation (`APPROVED_PAYABLE` -> `PAID`), and auto-reverse (`reverseCommissionsForRefundedInvoice`) when `charge.refunded` / `refund.succeeded` webhook fires.

---

## 2. Feature Readiness & Implementation Status Matrix

| Area | Feature | Status | Notes |
|---|---|---|---|
| Database Schema | SaaS Plans, Regional Prices, Entitlements, UsageRecords, UsageCredits, PromoCodes, RecoveryTiers, Commissions | **Implemented & Synced** | Pushed to PostgreSQL via `prisma db push` & client generated |
| Billing & Payments | Bachs.io server-priced checkout, HMAC-SHA256 webhook signature verification, idempotent activation, refund hook | **Implemented** | Requires live `BACHS_*` env keys in production |
| Plan Enforcement | Server-side lead/seat/AI/campaign limits & opt-in credit pack consumption | **Implemented** | Wired into `qualificationEngine.ts`, `recovery/campaignService.ts`, `/api/billing/checkout` |
| Invoices & Receipts | Downloadable HTML/Print Invoice & Receipt documents (`receiptNumber`, tenant-isolated) | **Implemented** | `/api/billing/invoices/[id]/document` |
| Superadmin Control | Strict `SUPER_ADMIN`/`OPERATOR` RBAC, verified analytics (no hardcoded GMV), regional price/promo/override editor | **Implemented** | `/admin` + `/api/admin/commercial` |
| Sales Commissions | Rep commission & agreement dashboard + payout approvals + refund clawback | **Implemented** | `/rep` + `/api/sales/commissions` |
| Homepage & Pricing | 11-section CloseCraft HQ flow, Lagos Real Estate/Education focus, Demo Case Studies with disclosure, Meta Pixel | **Implemented** | Shared `HomepagePricingSection` across `/` and `/pricing` |
| Automated Tests | Unit & acceptance tests for billing, state transitions, entitlements, commissions, webhook security | **Implemented** | `tests/commercial_billing_and_commissions_acceptance.test.cjs` |

---

## 3. Owner Confirmation Checklist (`[TO CONFIRM: ...]`)

Before flipping live traffic and paid advertising on production, the business owner must verify each item below:

- `[TO CONFIRM: Bachs.io Production Keys]` Verify `BACHS_SECRET_KEY`, `BACHS_WEBHOOK_SECRET`, and `NEXT_PUBLIC_BACHS_PUBLISHABLE_KEY` are live keys in production environment variables, and register `https://YOUR_DOMAIN/api/webhooks/bachs` in Bachs.io dashboard.
- `[TO CONFIRM: Promotional Coupon Codes]` Confirm which launch discount coupon codes (`promotional_codes`) should be activated in `/admin` -> Commercial Control.
- `[TO CONFIRM: Regional USD / GBP / CAD Prices]` Review default non-NGN prices (`$19 / $49 / $99`, `£15 / £39 / £79`, `CA$25 / CA$65 / CA$129`) in `/admin` Commercial Control before international ad spend.
- `[TO CONFIRM: Tax / VAT Configuration]` Confirm default Nigeria VAT (`7.5%`) or zero-tax invoicing settings for service quotes (`ProjectProposal.taxRatePercent`) and subscription receipts.
- `[TO CONFIRM: Official WhatsApp & Support Contact]` Confirm `2349026365853` and `hello@closecrafthq.com` are monitored during Nigerian business hours for concierge requests & 15-minute urgent escalation SLAs.
- `[TO CONFIRM: Meta Pixel ID]` Add live `NEXT_PUBLIC_META_PIXEL_ID` to hosting environment variables and verify a single `PageView` event in Meta Events Manager.
- `[TO CONFIRM: Real Case Studies Replacement]` Replace the three clearly-labeled fictional demo case studies (`PrimeHaven Properties`, `BrightPath Learning Centre`, `Apex Business Solutions`) with verified pilot/customer outcomes once signed customer permission is granted.
- `[TO CONFIRM: Superadmin Account Assignment]` Confirm only trusted founders/finance admins hold `User.role = 'SUPER_ADMIN'` in the production database (regular workspace owners hold tenant `ADMIN`, not platform `SUPER_ADMIN`).
