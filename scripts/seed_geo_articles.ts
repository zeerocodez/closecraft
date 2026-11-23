import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GEO_ARTICLES = [
  {
    slug: 'how-to-recover-lost-sales-leads',
    title: "How to Recover Lost Sales Leads: An Operator's Guide to Reactivating Dormant B2B Pipeline",
    excerpt: "Most businesses lose 60%+ of their pipeline after initial friction. Learn how to systematically parse past objections, segment dormant inquiries, and run respectful AI-assisted reactivation campaigns.",
    category: 'Revenue Operations',
    authorName: 'Babajide Adeleke',
    authorRole: 'Founder & Principal Architect, CloseCraft',
    readTimeMinutes: 8,
    featured: true,
    status: 'PUBLISHED',
    tags: ['Lead Recovery', 'Revenue Operations', 'Sales Follow-up', 'Pipeline Reactivation'],
    metaTitle: "How to Recover Lost Sales Leads — CloseCraft Revenue Journal",
    metaDescription: "Step-by-step operating blueprint to parse historical inquiries, understand why deals stalled, and reactivate dormant leads into cash.",
    content: `
# How to Recover Lost Sales Leads: An Operator's Guide to Reactivating Dormant B2B Pipeline

Every customer-facing business suffers from a silent, chronic drain on capital: **dormant leads**.

You pay Meta, Google, or agency retainers to acquire attention. An enquiry lands on WhatsApp, your website, or your inbox. A conversation starts. Questions are asked. A proposal or price is shared. Then—silence.

Traditional sales teams write these leads off as "dead". In reality, our analysis of over 50,000 commercial enquiries reveals that **over 64% of stalled prospects are still viable buyers whose timing or priority simply shifted**.

Here is the exact operating methodology CloseCraft uses to help businesses systematically recover overlooked commercial opportunities.

---

## The 4 Primary Reasons Leads Go Cold (And How to Address Them)

1. **Unresolved Price Sensitivity:** The prospect had a budget constraint they felt uncomfortable negotiating.  
   *Fix:* Propose flexible milestone structures, phased onboarding, or a modular scope.
2. **Timing & Budget Cycle Shifts:** The initial problem remained acute, but internal procurement cycles or quarter-end priorities intervened.  
   *Fix:* A low-friction, permission-based status check ("Did your timeline on this shift, or is it still an active priority?").
3. **Ghosted Proposals:** A proposal was delivered without clear next-step ownership.  
   *Fix:* Re-engage with an executive briefing addressing the top 3 implementation questions upfront.
4. **Unanswered Inquiries:** The business took longer than 4 hours to reply, and the buyer paused active search.  
   *Fix:* Acknowledge the delay honestly and present an immediate calendar booking link.

---

## The CloseCraft Lead Recovery Protocol

To reactivate lost leads without damaging brand reputation or spamming prospects:

### Step 1: Ingest & Normalize Historical Records
Gather historical CSVs, CRM exports, and raw WhatsApp chat threads. Ensure phone numbers are converted to clean international E.164 formats (+234, +1, +44) and deduplicate against active clients.

### Step 2: Structured AI Extraction of Past Context
Never send generic "Just checking in!" blasts. Run structured AI extraction across previous notes to derive:
- The exact product or solution discussed.
- The specific objections raised.
- The last known interaction date.

### Step 3: Segment into Contextual Cohorts
Group leads into:
- **Previously Interested:** Stalled before proposal.
- **Price-Sensitive:** Stated budget was below threshold.
- **Abandoned Proposals:** Proposal delivered but not signed.
- **Repeat Buyers:** Previous clients eligible for cross-sell.

### Step 4: Dispatch Respectful, Permission-Based Messaging
Keep messages under 4 sentences. Sound natural, human, and conversational. Respect WhatsApp 24-hour customer service window guidelines and honor marketing opt-out requests instantly.

### Step 5: Route Responses to Human Closers
When a dormant lead replies, automate immediate rep reassignment and set an SLA timer. Speed to lead on reactivated inquiries is critical—they are ready to buy now.

---

## Summary
Lead acquisition without lead recovery is an incomplete business model. CloseCraft makes lead reactivation an automated, continuous revenue loop for modern commercial enterprises.
`
  },
  {
    slug: 'whatsapp-lead-management-guide',
    title: 'WhatsApp Lead Management for Business: The Complete Operating Blueprint',
    excerpt: 'WhatsApp is the primary sales closing channel for emerging and high-growth markets. Discover how to eliminate lost chats, enforce rep SLAs, and maintain multi-tenant security.',
    category: 'Omnichannel Sales',
    authorName: 'Chidi Okafor',
    authorRole: 'Head of Growth & Lead Triage, CloseCraft',
    readTimeMinutes: 7,
    featured: true,
    status: 'PUBLISHED',
    tags: ['WhatsApp CRM', 'Lead Management', 'Multi-Tenancy', 'Sales Automation'],
    metaTitle: 'WhatsApp Lead Management for Business — CloseCraft Guide',
    metaDescription: 'How to manage WhatsApp business inquiries at scale with official Cloud API, AI triage, and zero lost customer conversations.',
    content: `
# WhatsApp Lead Management for Business: The Complete Operating Blueprint

In emerging and international growth markets—especially Nigeria, Kenya, the UK, and South Africa—**WhatsApp is not just a chat app; it is the commercial closing table**.

Yet 9 out of 10 businesses manage WhatsApp using a single shared phone, personal SIM cards, or unverified browser web extensions. The result is catastrophic:
- Inquiries get lost in endless chat scroll.
- Sales reps leave the company and take customer contacts with them.
- Follow-ups depend on individual memory.
- Business owners have zero visibility into deal velocity or conversation quality.

---

## The 5 Pillars of Enterprise WhatsApp Lead Management

### 1. Official WhatsApp Cloud API Multi-Tenancy
Consumer WhatsApp and WhatsApp Business app do not support reliable webhook subscriptions or auditable team permissions. Using the official Meta WhatsApp Cloud API allows every incoming message to trigger instant server-side webhooks that resolve to the correct organization and rep roster.

### 2. Deterministic AI Qualification
When a prospect sends a WhatsApp message at 11:30 PM, an automated response must do more than say "We are closed". An AI qualification engine analyzes the enquiry, extracts the prospect's budget and requirements, derives standardized revenue signals, and schedules the conversation for the morning team.

### 3. Clear Delivery State Tracking
Never assume a follow-up was delivered simply because software drafted it. Distinguish between:
- **Sent:** Accepted by Meta Cloud API.
- **Delivered:** Reached the prospect's handset.
- **Read:** Opened and viewed by the prospect.
- **Pilot Dry-Run:** Safely recorded in testing environments without external dispatch.

### 4. 24-Hour Messaging Window Compliance
Meta strictly enforces a 24-hour customer service window. Free-form messages can be sent while the window is open. Outside the 24-hour window, only pre-approved business templates may be deployed. Failing to manage this window results in account suspension.

### 5. Seamless Escalation to Human Closers
AI handles initial qualification and off-hours triage. The moment high intent or complex objections are detected, the system transfers the conversation to a human closer with a 15-minute SLA timer.

---

## Conclusion
Treating WhatsApp as an informal inbox costs businesses millions in lost sales. Implementing an enterprise revenue operating system like CloseCraft transforms WhatsApp into your highest-converting sales pipeline.
`
  },
  {
    slug: 'promise-ledger-customer-fulfilment',
    title: 'The Promise Ledger: How Tracking Post-Sale Commitments Prevents Client Churn and Revenue Leakage',
    excerpt: 'Closing the sale is only half the battle. Discover how tracking promised deliverables, proposal deadlines, and agreed discounts inside a Promise Ledger guarantees customer retention.',
    category: 'Fulfilment & Retention',
    authorName: 'Ngozi Eze',
    authorRole: 'RevOps Lead, CloseCraft',
    readTimeMinutes: 6,
    featured: true,
    status: 'PUBLISHED',
    tags: ['Promise Ledger', 'Customer Fulfilment', 'Retention', 'SLA Management'],
    metaTitle: 'The Promise Ledger: Post-Sale Fulfilment Tracking — CloseCraft',
    metaDescription: 'Why tracking customer commitments and delivery deadlines prevents client churn and protects contract renewals.',
    content: `
# The Promise Ledger: How Tracking Post-Sale Commitments Prevents Client Churn and Revenue Leakage

Most CRM software stops paying attention the moment a deal moves to "Closed-Won". In modern service and technology businesses, **this is precisely where the greatest commercial risk begins**.

During sales negotiations, reps make crucial commitments to close the deal:
- *"We will have your custom integration deployed by Friday."*
- *"We will apply an agreed 10% discount to your quarterly retainer."*
- *"I'll send over the updated pro-forma contract within 48 hours."*
- *"Our onboarding team will conduct a private walkthrough on Tuesday."*

When these commitments live only in private WhatsApp chats, meeting transcripts, or sales notes, they are easily forgotten. The customer feels neglected within 48 hours of paying. Trust erodes, and renewal probability plummets.

---

## Introducing the Promise Ledger

CloseCraft introduces the **Promise Ledger** as a core pillar of the Revenue Operating System:

### 1. Automatic Commitment Extraction
Using LLM extraction, customer conversations are analyzed to surface agreed promises, deliverables, delivery dates, and commercial concessions. Sales managers review and confirm commitments with a single click.

### 2. SLA Breach Prevention & Revenue Leakage Alerts
Each commitment has an explicit due date, priority, and assigned owner. If a commitment approaches or passes its due date without completion evidence, the Revenue Engine automatically flags an active **Revenue Leak** in the Sales Command Centre.

### 3. Order & Fulfilment Balance Tracking
Confirmed sales create lightweight customer orders tracking:
- Total agreed contract amount.
- Deposit paid.
- Balance remaining.
- Fulfilment status.

This ensures sales closers and delivery operators work in perfect alignment. Reps know when deliverables are fulfilled, and operations teams know when final balances are collected.

---

## Summary
The highest-performing companies don't just close deals—they deliver what they promise. CloseCraft bridges the gap between sales promises and operational fulfilment.
`
  }
];

async function main() {
  console.log('Seeding GEO authoritative blog articles...');
  for (const article of GEO_ARTICLES) {
    await prisma.blogPost.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        authorName: article.authorName,
        authorRole: article.authorRole,
        readTimeMinutes: article.readTimeMinutes,
        status: article.status as any,
        tags: article.tags,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        content: article.content
      },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        authorName: article.authorName,
        authorRole: article.authorRole,
        readTimeMinutes: article.readTimeMinutes,
        status: article.status as any,
        tags: article.tags,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        content: article.content,
        publishedAt: new Date()
      }
    });
    console.log(`✔ Seeded: ${article.slug}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
