# LAUNCH OPERATIONS MANUAL
**Product:** CloseCraft AI Revenue Operating System  
**Audience:** Site Reliability Engineering (SRE), DevOps, Sales Operations, Technical Account Managers  
**Version:** 1.0.0-prod  
**Last Updated:** November 2026  

---

## 1. Operating Model & Role Ownership

CloseCraft operates on a collaborative actor model separating automated execution from human sales judgment:

```
+-----------------------------------------------------------------------------+
|                               ACTOR TOPOLOGY                                |
+------------------+------------------+--------------------+------------------+
|      ACTOR       |    DISCIPLINE    |     CORE ENGINE    |   AUTHORITY LEVEL|
+------------------+------------------+--------------------+------------------+
| AI               | Reasoning & Triage| Structured Extractor| Suggestions only |
| AUTOMATION       | Deterministic    | Inngest / Crons    | Policy-bounded   |
| HUMAN CLOSER     | Judgment & Sales | Sales Command Centre| High-value closes|
| SRE / SYSTEM     | Security & Health| AuditLog & Gateway | Absolute veto    |
+------------------+------------------+--------------------+------------------+
```

---

## 2. Standard Operating Procedures (SOPs)

### SOP-01: Ingesting Historical Leads into AI Recovery Hub
1. Navigate to **Lead Recovery Hub** (`/recovery`) in the SaaS workspace.
2. Select **Import Historical Leads**; upload a `.csv` or export file containing past inquiries or paste raw WhatsApp export logs.
3. System automatically executes:
   - Phone normalization to international E.164 (`+234...`, `+1...`, `+44...`).
   - Deduplication check against existing tenant contacts (preventing duplicate contact records).
   - Structured AI Intelligence inference (identifying product interests, past objections, and intent level).
   - Assignment to one of the 6 recovery cohorts (`PRICE_SENSITIVE`, `COLD_STALLED`, `ABANDONED`, etc.).
4. Inspect the generated segment counts before drafting a reactivation wave.

### SOP-02: Executing a Reactivation Campaign
1. In `/recovery`, click **Create Reactivation Wave**.
2. Select target cohort, preferred messaging tone (Friendly, Value Offer, Direct Check-in, Professional), and communication channel (WhatsApp / Web).
3. Review preview samples.
4. **Safety Check:** Ensure `WHATSAPP_LIVE_DISPATCH_ENABLED=true` is only set in production when approved Meta templates are registered. By default, campaigns execute in **Pilot Dry-Run Mode** (`DRY_RUN_LOGGED`) ensuring zero accidental customer spam.
5. Inbound prospect responses automatically trigger high-priority Closer tasks in the **Sales Command Centre** (`/dashboard/revenue-engine`).

### SOP-03: Managing Customer Promises & SLAs
1. When sales agreements or deliverables are confirmed in chat or meetings, navigate to **Promise Ledger** (`/commitments`).
2. Click **AI Extract Promises** to extract commitments directly from meeting notes, or manually log via **Record Commitment**.
3. Set explicit due date, priority, and assigned delivery owner.
4. When fulfillment is completed, mark status `COMPLETED` and attach proof link in `completionEvidence`.
5. If a deadline passes, the automated cron scanner flags the commitment as `OVERDUE` and immediately creates a `SLA_BREACHED` Revenue Leak alert on the dashboard.

### SOP-04: Handling Data Privacy Requests (NDPA/GDPR)
1. **Export Request:** Access `/api/privacy/export?leadId={id}` as an authenticated administrator to download the machine-readable JSON data portability archive.
2. **Erasure Request:** Submit a `POST /api/privacy/delete` with `{ leadId, reason }`. System atomically erases personal identity records across all tables while recording an anonymized audit event in `AuditLog`.

---

## 3. Incident Response Playbooks

### Incident Playbook A: WhatsApp Inbound Webhook Failures
- **Symptoms:** Incoming customer messages do not appear in `/inbox`.
- **Diagnostic Steps:**
  1. Check Vercel function logs for `/api/webhooks/whatsapp`.
  2. If status is `401 Unauthorized`: Verify `META_APP_SECRET` in Vercel environment variables matches the Meta App Dashboard.
  3. If status is `422 Unprocessable Entity`: The phone number ID is not mapped to an active organization. Verify `organization.whatsappPhoneNumberId` in the database.
  4. Ensure no unmapped message is silently discarded: check `AuditLog` table for `WHATSAPP_MESSAGE_QUARANTINED` events.

### Incident Playbook B: Database Connection Pool Saturation
- **Symptoms:** API endpoints return `PrismaClientInitializationError` or query timeouts.
- **Remediation Steps:**
  1. Verify application is connecting via `aws-0-eu-west-1.pooler.supabase.com:5432` with `?pgbouncer=true` parameter.
  2. Inspect Supabase dashboard metrics for active connections.
  3. Scale pooler limit or recycle idle connection threads.

---

## 4. Operational Checklist Before High-Volume Ad Campaigns

- [ ] Supabase connection pool verified healthy.
- [ ] Vercel Edge Cache enabled for marketing assets.
- [ ] Meta App Secret verified in production environment variables.
- [ ] Paystack Webhook endpoint configured with live secret key.
- [ ] Sales team Closer assignments active in Sales Command Centre.
- [ ] Overdue Promise cron (`/api/cron/commitments`) verified active.
