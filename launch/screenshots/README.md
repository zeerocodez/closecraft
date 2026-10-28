# Closecraft — Launch Screenshot Capture Checklist & Specifications

**Document Version:** 1.0.0  
**Date:** October 28, 2026  
**Operator:** Zeerocodes Automation Limited  
**Target Format:** 1920x1080 (16:9), PNG (lossless), 2x DPI retina scaling recommended  
**Fictional Demo Environment:** Use pre-seeded demo workspace (`Alpha Agency Ltd` or `Apex Digital Dynamics`)  
**Strict Data Integrity Rule:** Never capture live production customer data, real phone numbers, real emails, or real customer names. Use only realistic fictional Nigerian commercial entities.

---

## Master Capture Specifications

| Parameter | Specification | Notes |
| :--- | :--- | :--- |
| **Resolution** | 1920 × 1080 px (or 3840 × 2160 @ 2x) | Standard 16:9 widescreen |
| **File Format** | PNG-24 (Optimized, lossless) | Crisp typography and UI borders |
| **Color Profile** | sRGB | Consistent display across Product Hunt and directories |
| **Browser Chrome** | Clean, hidden bookmark bar, no extensions visible | Zoom at 100% |
| **Visual Theme** | Default Closecraft Dark/Deep Slate with Cyan Accents | High contrast, legible typography |

---

## Screen 1: Today Command Centre

* **Target Route:** `/today` (or `/dashboard`)
* **File Name:** `01-today-view.png`
* **Caption:** *“The Today View: Know instantly which high-value enquiries require immediate follow-up, overdue responses, and revenue at risk.”*
* **Core Elements to Highlight:**
  - Header showing current date and workspace name (`Apex Digital Dynamics`).
  - Metric counters: **Hot Leads (4)**, **Overdue Follow-ups (2)**, **Pending Discovery (3)**, **Verified Pipeline Value (₦4.2M)**.
  - Priority action cards displaying explicit owner avatar, enquiry origin (Website / Ads), and SLA countdown clock (e.g., `Overdue by 2h`, `Due in 45m`).
* **Fictional Demo Data:**
  - Enquiry 1: *Chioma Okonkwo — Enterprise Branding Retainer (₦1,200,000)* — Assigned: `Tunde B.` — Next Action: `Send proposal scope` (Due in 1h).
  - Enquiry 2: *Dr. Adeyemi Adeleke — Hospital CRM Consultation (₦850,000)* — Assigned: `Amaka O.` — Next Action: `Call back on WhatsApp` (Overdue by 45m).
  - Enquiry 3: *Kayode Johnson — E-commerce Funnel Build (₦600,000)* — Assigned: `Somto C.` — Next Action: `Qualify project budget`.

---

## Screen 2: Enquiry Ownership & Next Best Action Drawer

* **Target Route:** `/inbox` or `/leads/[id]`
* **File Name:** `02-enquiry-ownership-next-action.png`
* **Caption:** *“Single-Owner Accountability: Every lead has an assigned owner, clear next action, and 1-click WhatsApp outreach with pre-filled context.”*
* **Core Elements to Highlight:**
  - Selected lead detail drawer open on right side.
  - Assigned Owner selector clearly indicating `Amaka Obi (Account Lead)`.
  - Next Best Action banner in electric cyan: `Next Action: Schedule discovery call before 4:00 PM`.
  - Contextual action buttons: `Open WhatsApp Chat`, `Send Email`, `Log Meeting Notes`, `Reassign`.
  - WhatsApp button displays tool-tip: *“Opens pre-formatted WhatsApp chat with lead context”*.
* **Fictional Demo Data:**
  - Prospect: *Bilikisu Ibrahim (Founder, Sterling Logistics Ltd)*
  - Contact: `+234 803 000 1234` | `bilikisu@sterlinglogistics.ng`
  - Inbound Message: *“We need a dedicated team to handle customer follow-ups across our 3 regional hubs. Budget around ₦1.5M/mo.”*
  - Extracted Signals: High Intent, Budget ₦1,500,000, Urgency: Immediate.

---

## Screen 3: Activity History & Audit Timeline

* **Target Route:** `/leads/[id]` (Activity Tab) or `/audit`
* **File Name:** `03-activity-history-audit.png`
* **Caption:** *“Complete Auditability: Track every status transition, assignment change, and team interaction with unchangeable timestamps.”*
* **Core Elements to Highlight:**
  - Vertical chronological event timeline.
  - Event cards showing:
    1. `Lead Captured from Web Form` — *Today, 09:14 AM*
    2. `Auto-Assigned to Amaka Obi (Round Robin)` — *Today, 09:15 AM*
    3. `WhatsApp Outreach Link Clicked by Amaka Obi` — *Today, 09:32 AM*
    4. `Status Changed to QUALIFYING` — *Today, 10:15 AM*
    5. `Next Action Set: Send Discovery Brief` — *Today, 10:16 AM*
  - Actor badges clearly indicating whether action was initiated by `SYSTEM`, `AUTOMATION`, or `USER`.

---

## Screen 4: Managed-Service Request & Sales Support Pilot

* **Target Route:** `/sales-support` (or `/pilot`)
* **File Name:** `04-managed-sales-pilot.png`
* **Caption:** *“On-Demand Remote Sales Closers: When service teams lack closing bandwidth, request pre-screened remote professionals for a 30-day pilot.”*
* **Core Elements to Highlight:**
  - Managed Remote Closer pilot intake card.
  - Scope details: Dedicated remote sales closer matched from the Digital Sales School (DSS) ecosystem.
  - Qualification review metrics: Historical deal volume, average deal size, lead source consistency.
  - Transparent pricing notice: *“Pilots structured via formal service engagement from ₦150,000 / 30 days. No automatic credit card charges.”*
  - Status indicator: `Qualification Complete — Operator Review in Progress`.

---

## Capture Execution Steps

1. Start development or staging server: `npm run dev`.
2. Sign in as demo workspace owner (`owner@apexagency.ng`).
3. Maximize browser window to full 1080p resolution (1920 × 1080).
4. Navigate sequentially to each route:
   - Screen 1: Navigate to `http://localhost:3000/today`
   - Screen 2: Navigate to `http://localhost:3000/inbox` and click lead to open drawer
   - Screen 3: Open activity tab on lead detail
   - Screen 4: Navigate to `http://localhost:3000/sales-support`
5. Capture with lossless snipping tool or Puppeteer screenshot script.
6. Save images directly into `launch/screenshots/` matching exact filenames:
   - `01-today-view.png`
   - `02-enquiry-ownership-next-action.png`
   - `03-activity-history-audit.png`
   - `04-managed-sales-pilot.png`
7. Generate scaled thumbnail `thumbnail_240.png` (240x240) for Product Hunt.
