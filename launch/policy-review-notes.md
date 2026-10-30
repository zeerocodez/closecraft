# Closecraft Policy Review Notes & Data Architecture Record

**Operator Name:** Zeerocodes Automation Limited  
**Brand / Application:** Closecraft  
**Contact Email:** info@closecrafthq.com  
**Website:** https://www.closecrafthq.com  
**Applicable Legal Frameworks:** Nigeria Data Protection Act 2023 (NDPA), Nigeria Data Protection Regulation (NDPR)  
**Date of Record:** October 28, 2026  

---

## 1. Data Inventory & Flow Architecture

### A. Information Types & Storage Locations

| Data Category | Specific Fields | Processing Purpose | Storage Engine | Retention Window |
|---|---|---|---|---|
| **Account Owner / Member Data** | Full name, work email address, hashed passwords (bcrypt), profile image URL, assigned workspace role. | Authentication, authorization, seat allocation, and multi-tenant isolation. | PostgreSQL (`User`, `OrganizationMember`, `UserSession` tables) hosted on AWS EU-West-1 (Ireland). | Duration of active subscription + 7-day grace period. Erasable upon verified DSR request. |
| **Prospect / Customer Lead Records** | Lead contact name, phone number (WhatsApp), email address, estimated deal value, source channel (Meta Lead Ads, web form, CSV), status, communication notes. | Lead ingestion, qualification scoring, follow-up SLA tracking, task assignment. | PostgreSQL (`Lead`, `Contact`, `Opportunity`, `Conversation`, `Message` tables). | Scoped to customer workspace. Customer organization acts as Data Controller and may export or purge records at will. |
| **Financial & Transaction Records** | Invoice numbers, plan tier, amount in NGN, Bachs checkout reference IDs (`bachsCheckoutId`), timestamp of payment verification. | Billing management, entitlement extension, statutory accounting compliance. | PostgreSQL (`BachsInvoice`, `PaymentAttempt` tables). | Statutory retention period of 6 years in accordance with Nigerian tax legislation. |
| **Emergency Support Access Logs** | Operator user ID, organization ID, stated justification, timestamp of grant, expiration timestamp, active flag. | Independent auditing of operator support sessions. | PostgreSQL (`EmergencySupportAccess`, `AuditLog` tables). | Immutable audit trail retained for 3 years. |

---

## 2. Third-Party Service Providers & Sub-processors

| Provider | Purpose | Data Received | Security & Compliance Boundary |
|---|---|---|---|
| **Bachs (Bachs.io)** | Hosted Payment Gateway | Customer name, email, invoice amount, currency (NGN). Bachs collects payment card/bank account details directly. | Closecraft never stores raw card or bank account credentials. Bachs communicates via HMAC-SHA256 signed webhooks (`X-Bachs-Signature-V2`). |
| **Google Cloud (OAuth 2.0)** *(Optional)* | Single Sign-On Authentication | Email address, profile name, avatar URL. | Read-only Google identity verification during sign-in. |
| **Resend** *(Optional / Configured)* | Transactional Email Dispatch | Recipient email address, verification codes, invoice payment receipts. | TLS 1.3 encrypted transit. No CRM leads or prospect databases are synchronized. |

---

## 3. Controller vs. Processor Boundary

Under the Nigeria Data Protection Act 2023 (NDPA):
- **Closecraft as Data Controller:** Closecraft determines the purposes and means of processing for account credentials, subscription billing records, operator support tickets, and direct website inquiries.
- **Closecraft as Data Processor:** For prospective buyer leads, phone numbers, customer notes, and deals entered by customer organizations, **the customer organization is the Data Controller**. Closecraft processes these records solely to provide the SaaS service and executes database deletion/export commands upon customer instructions.

---

## 4. Specific Legal Questions Flagged for Qualified Review

> [!IMPORTANT]
> The publication of these policy pages does not constitute formal legal counsel. The following specific legal questions are flagged for review by qualified Nigerian legal counsel prior to high-volume commercial scaling:
>
> 1. **Cross-Border Cloud Hosting:** Closecraft’s primary database infrastructure is located in AWS EU-West-1 (Ireland). While Ireland provides GDPR-standard protections aligned with NDPA cross-border transfer requirements (Section 41-43 NDPA 2023), formal filing of a Data Protection Compliance Audit (DPCO) with the Nigeria Data Protection Commission (NDPC) should be scheduled for the current fiscal year.
> 2. **WhatsApp Outreach Protocols:** Closecraft facilitates 1-click WhatsApp outreach via pre-formatted links (`https://wa.me/...`). Customer organizations must ensure their inbound lead generation forms include explicit consent for WhatsApp communication to avoid breaching anti-spam regulations (NCC Unsolicited Communications Regulations).
> 3. **Managed Sales Professional Agency Status:** Remote sales closers and appointment setters engaged through DSS 30-day Managed Sales Pilots operate as independent contractors, not direct employees of customer organizations. Standard tripartite engagement contracts must be reviewed to maintain clear contractor boundaries under Nigerian labor laws.

---

## 5. Verified Deployment Checklist

- [x] Privacy Notice live at `/privacy`
- [x] Terms of Service live at `/terms`
- [x] Cancellation & Refund Policy live at `/refund-policy`
- [x] Cookie Notice live at `/cookies`
- [x] Managed Service Terms live at `/managed-service-terms`
- [x] Privacy Request Portal live at `/privacy/request`
- [x] Real-time Cookie Consent Banner active with localStorage preference persistence
- [x] Footer and signup form links verified and operational
