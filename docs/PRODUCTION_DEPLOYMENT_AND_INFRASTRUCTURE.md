# PRODUCTION DEPLOYMENT AND INFRASTRUCTURE
**Product:** CloseCraft Revenue Operating System  
**Hosting Infrastructure:** Vercel Global Edge Network  
**Database Host:** Supabase Cloud PostgreSQL 15+ (Frankfurt / eu-central-1)  
**Background Engine:** Inngest Cloud Serverless Event Queue  
**DNS & TLS:** Cloudflare / Vercel Managed TLS 1.3  

---

## 1. Production Topology & Environment Model

```
[ Internet Traffic / Prospects / Sales Teams ]
                       |
               (Cloudflare DNS)
                       |
      [ Vercel Edge Production Gateway ]
      - Custom Domain: closecrafthq.com
      - SSL/TLS: Automatic Strict Let's Encrypt TLS 1.3
      - Edge Middleware: Auth & Rate Limiting
                       |
       +---------------+---------------+
       |                               |
[ Next.js SSR / App Router ]    [ Next.js API Routes ]
       |                               |
       +---------------+---------------+
                       |
       +---------------+---------------+
       |                               |
[ Supabase PostgreSQL 15+ ]     [ Inngest Event Queue ]
- PgBouncer Connection Pooler   - Step Functions
- Port 5432 / SSL Enabled       - Scheduled Cron Triggers
- Automatic Daily Snapshots     - Retry & Dead Letter Queues
```

---

## 2. Environment Configuration Matrix

The production deployment requires the following encrypted environment variables configured in Vercel:

| Variable Name | Environment | Purpose | Security Rule |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Production | Supabase PgBouncer pooler connection string | Encrypted, server-only |
| `DIRECT_URL` | Production | Direct PostgreSQL connection for migrations | Encrypted, server-only |
| `NEXTAUTH_SECRET` | Production | Session token cryptographic signing key | 32+ byte random entropy |
| `NEXTAUTH_URL` | Production | `https://closecrafthq.com` | Production canonical URL |
| `OPENAI_API_KEY` | Production | Structured AI qualification & commitment extraction | Secure server key |
| `META_APP_SECRET` | Production | Inbound webhook HMAC SHA-256 signature verification | Never exposed to client |
| `META_ACCESS_TOKEN` | Production | WhatsApp Cloud API outbound dispatch token | System user token |
| `PAYSTACK_SECRET_KEY` | Production | Verified payment processing & webhook signing | Restricted server key |
| `PAYSTACK_PUBLIC_KEY` | Client/Prod | Client-side checkout modal initiation | Public key |
| `WHATSAPP_LIVE_DISPATCH_ENABLED` | Production | Enables live outbound WhatsApp messaging (`true`/`false`) | Safety guard switch |

---

## 3. Database Migration & Promotion Procedure

1. **Pre-Deployment Migration Check:**
   ```bash
   npx prisma migrate deploy
   ```
2. **Schema Verification:**
   All 7 newly added enterprise models (`LeadImportBatch`, `LeadIntelligence`, `ReactivationCampaign`, `ReactivationMessage`, `CustomerCommitment`, `CustomerOrder`, `CustomerComplaint`) are synced to Supabase PostgreSQL with active indexes and foreign-key constraints.
3. **Rollback Plan:**
   - Supabase maintains continuous Point-In-Time Recovery (PITR) with automated daily snapshots.
   - Non-destructive migration methodology: schema modifications add tables and optional fields, ensuring backwards compatibility with previous server versions during blue/green deployment rollouts.

---

## 4. Health Check & Synthetic Probes

CloseCraft provides an automated health endpoint:
- **Endpoint:** `GET /api/health`
- **Verification:** Probes database connectivity (`SELECT 1`), confirms Redis/memory cache accessibility, and validates background queue availability.
- **Monitoring Integration:** Configured with external uptime monitors (BetterStack / UptimeRobot) pinging every 60 seconds with PagerDuty alerts on failure.
