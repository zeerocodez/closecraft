import { db } from '../src/lib/db';

async function seedBlogPosts() {
  console.log('[Seed Blog] Starting blog post seeding...');

  const posts = [
    {
      slug: 'lead-leakage-nigerian-b2b-enquiries',
      title: 'Lead Leakage: Why 68% of Nigerian B2B Enquiries Never Get Followed Up',
      excerpt: 'Most high-ticket businesses do not have a lead volume problem. They are leaking millions in revenue between the initial WhatsApp enquiry and the first sales conversation.',
      content: `### The Hidden Drain on Modern Commercial Pipeline

Ask any founder or managing director running marketing campaigns in Nigeria what their biggest hurdle is, and the answer is almost always the same: "We need more leads."

Yet, when you audit their CRM, WhatsApp Business inboxes, and email threads, a completely different reality emerges. 

Over 68% of incoming enquiries are either never responded to, or abandoned after a single unreturned greeting. In high-ticket B2B services, consulting, real estate, and enterprise software, this represents catastrophic deal leakage.

## Why Fast Follow-Up Determines Revenue

Studies across thousands of B2B transactions reveal an unambiguous rule: the probability of qualifying an inbound prospect drops by over 80% if first contact occurs after 30 minutes.

- **Speed conveys competence:** High-ticket buyers are evaluating your operational reliability the moment they message you.
- **Competitor capture:** The prospect who messaged you likely searched two other alternatives on Google or Instagram at the exact same moment.
- **Context decays rapidly:** Within 2 hours, a prospect has stepped into another meeting or forgotten the specific hook that prompted their inquiry.

## The Three Structural Bottlenecks Causing Leakage

### 1. The WhatsApp Silo
In West Africa, WhatsApp is the undisputed commercial operating system. However, when enquiries arrive on personal numbers or unmonitored team devices:
- Management has zero visibility into response times.
- If a representative is sick or leaves, active negotiations vanish.
- Conversations are neither logged into a pipeline nor scheduled for multi-touch follow-up.

### 2. The Single-Touch Surrender
Most sales representatives message a prospect once: *"Hello, here is our brochure."* When the prospect fails to reply, the lead is immediately tagged as "unserious" or dead. 
In reality, high-ticket decisions require an average of 5 to 7 deliberate, value-driven touches across multiple channels before a decision-maker agrees to a consultation.

### 3. Lack of Role Specialization
Expecting your top closer or founder to handle initial qualification, administrative scheduling, and complex closing negotiations guarantees that one of those responsibilities will be neglected.

## How to Plug Deal Leakage Immediately

1. **Deploy an Automated Intake Buffer:** Use CloseCraft to instantly ingest incoming leads from Meta Lead Forms, website widgets, and WhatsApp into a centralized triage queue.
2. **Enforce a 15-Minute SLA:** Mandate that every new enquiry receives an immediate, tailored qualification response within 15 minutes during business hours.
3. **Separate Setters from Closers:** Use dedicated appointment setters—trained through the Digital Sales School—to qualify prospects and book them into calendar slots, allowing senior representatives to focus 100% on closing conversations.
4. **Implement Multi-Touch Objection Trees:** Program disciplined cadences with automated reminders so that no enquiry is archived without at least 6 structured touchpoints.`,
      category: 'Revenue Operations',
      tags: ['lead-leakage', 'sales-follow-up', 'b2b-nigeria', 'pipeline-management'],
      authorName: 'CloseCraft Revenue Team',
      authorRole: 'Pipeline Architecture Group',
      status: 'PUBLISHED',
      metaTitle: 'Lead Leakage: Why 68% of B2B Enquiries Never Get Followed Up',
      metaDescription: 'Discover why high-ticket businesses lose millions between lead capture and first contact, and how to build a disciplined follow-up engine.',
      targetKeyword: 'lead follow up system nigeria',
      readTimeMinutes: 5,
      publishedAt: new Date(),
    },
    {
      slug: 'meta-ads-high-ticket-b2b-client-acquisition',
      title: 'Meta Ads for High-Ticket B2B: How to Capture Enquiries That Actually Convert',
      excerpt: 'How to structure Facebook and Instagram advertising to attract serious commercial buyers, eliminate low-intent tyre-kickers, and feed your sales closers.',
      content: `### Moving Beyond Vanity Clicks to High-Intent Pipeline

A common misconception among B2B leaders is that Meta advertising (Facebook and Instagram) is only effective for cheap consumer e-commerce.

In reality, CEOs, corporate procurement directors, and high-net-worth investors spend hours on Instagram and Facebook daily. The reason most B2B campaigns fail on Meta is not the platform—it is the offer design and the qualification funnel.

## The Flawed Approach: Maximizing Cheap Leads

When marketing agencies optimize purely for low Cost Per Lead (CPL), they produce thousands of submissions from people who clicked accidentally, cannot afford the service, or never respond.

Your sales team is left frustrated, burning dozens of hours dialing dead numbers.

## The High-Ticket Meta Architecture

### 1. Explicit Commercial Filters in Ad Copy
State the price floor and operational scope directly in your ad creative and copy. For example:
- *"Designed for established companies generating over ₦50M annually..."*
- *"Retainers start at ₦350,000/month..."*
This deliberately repels tyre-kickers while instantly signaling enterprise credibility to qualified buyers.

### 2. Multi-Step Friction in Lead Forms
Instead of utilizing standard one-click autofill forms, introduce 3 to 4 required qualifying questions:
- Business type and industry
- Current monthly marketing or sales budget
- Primary operational bottleneck
- Urgency / target timeline for deployment

Qualified prospects do not mind answering relevant questions; unqualified casual browsers will abandon the form.

### 3. Immediate Hook into CloseCraft Intake
The instant a lead submits their details, CloseCraft triggers:
- Instant SMS / WhatsApp confirmation acknowledging their application.
- Real-time notification dispatched to the assigned appointment setter.
- Automatic verification of phone and email formats.

## Key Metrics to Track
Stop evaluating your campaigns based on impression volume. Focus on:
- Cost Per Qualified Opportunity (CPQO)
- Speed-to-First-Contact SLA compliance
- Deal Pipeline Progression Rate
- Customer Acquisition Cost (CAC) vs. Lifetime Value (LTV)`,
      category: 'Lead Generation',
      tags: ['meta-ads', 'b2b-marketing', 'lead-generation', 'high-ticket-sales'],
      authorName: 'Emmanuel Nwabueze',
      authorRole: 'Head of Growth & Advertising',
      status: 'PUBLISHED',
      metaTitle: 'Meta Ads for High-Ticket B2B: How to Capture Converting Enquiries',
      metaDescription: 'Learn how to calibrate Facebook and Instagram campaigns for high-ticket B2B offers with explicit qualifying filters and fast sales response.',
      targetKeyword: 'meta ads for high ticket b2b',
      readTimeMinutes: 6,
      publishedAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      slug: 'remote-appointment-setter-playbook-15-minute-qualification',
      title: 'The Remote Appointment Setter Playbook: Qualifying Enquiries in Under 15 Minutes',
      excerpt: 'How high-performing sales teams use dedicated appointment setters to filter tyre-kickers, confirm economic fit, and fill closer calendars with qualified buyers.',
      content: `### The Single Most Underutilized Role in Modern Sales

In high-growth companies, the appointment setter is the frontline guardian of company revenue. 

When your senior closers spend their days dealing with no-shows, unqualified students, or prospects with zero budget, your revenue engine stalls. Deploying trained remote appointment setters solves this permanently.

## The Core Objectives of the Setter

1. **Flawless Speed-to-Lead:** Acknowledging and engaging every new inbound enquiry within 15 minutes.
2. **Economic & Problem Fit Diagnostic:** Asking 3 targeted diagnostic questions to verify whether the prospect meets your client avatar.
3. **Calendar Booking & Friction Reduction:** Directing the qualified prospect to a confirmed calendar slot with an assigned senior closer.
4. **Pre-Call Show-Up Nurture:** Delivering calendar invites, agenda briefs, and preparation reminders to guarantee attendance.

## The 4-Question Qualification Script

High-performing setters do not pitch services over text. They diagnose:

### 1. The Trigger
> *"Thanks for reaching out, [Name]. What prompted you to enquire about our revenue operating system today?"*

### 2. The Current Workflow
> *"How is your team currently handling incoming leads once they hit your WhatsApp or CRM?"*

### 3. The Commercial Impact
> *"Approximately how many viable enquiries do you receive monthly, and what is your average deal size?"*

### 4. The Urgency & Authority
> *"If we can demonstrate a clear roadmap to solve this within 14 days, are you in a position to implement this month?"*

## Eliminating Call No-Shows

Calendar booking is only half the battle. If 50% of prospects miss their discovery calls, closer morale collapses.

- **The Instant Confirmation Touch:** Immediately dispatch an SMS and email with the calendar link and a 2-minute overview video.
- **The T-minus 2 Hour Pulse:** Send a direct WhatsApp confirmation checking if the scheduled time still aligns with their day.
- **The Reschedule Protocol:** If a prospect needs to reschedule, provide 2 alternative times immediately rather than asking an open-ended question.

## Training & Certification Through DSS
CloseCraft’s appointment setters are trained through the Digital Sales School, undergoing rigorous roleplay simulations, objection handling evaluations, and live pipeline audits before ever touching client accounts.`,
      category: 'Appointment Setting',
      tags: ['appointment-setting', 'sales-qualification', 'remote-sales', 'digital-sales-school'],
      authorName: 'DSS Master Coach',
      authorRole: 'Head of Sales Training',
      status: 'PUBLISHED',
      metaTitle: 'The Remote Appointment Setter Playbook: 15-Minute Qualification',
      metaDescription: 'Learn how dedicated appointment setters qualify inbound prospects, eliminate no-shows, and fill closer calendars with high-ticket opportunities.',
      targetKeyword: 'remote appointment setter playbook',
      readTimeMinutes: 7,
      publishedAt: new Date(Date.now() - 86400000 * 5),
    },
  ];

  for (const post of posts) {
    const existing = await db.blogPost.findUnique({
      where: { slug: post.slug },
    });

    if (existing) {
      console.log(`[Seed Blog] Post "${post.slug}" already exists. Updating...`);
      await db.blogPost.update({
        where: { slug: post.slug },
        data: post,
      });
    } else {
      console.log(`[Seed Blog] Creating post "${post.slug}"...`);
      await db.blogPost.create({
        data: post,
      });
    }
  }

  console.log('[Seed Blog] Completed blog seeding successfully!');
}

seedBlogPosts()
  .catch((err) => {
    console.error('[Seed Blog] Error seeding:', err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
