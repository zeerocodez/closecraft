export interface HomepageFaqItem {
  q: string;
  a: string;
}

export const HOMEPAGE_FAQS: HomepageFaqItem[] = [
  {
    q: '1. What is CloseCraft HQ?',
    a: 'CloseCraft HQ is a multi-tenant AI Revenue Operations, Lead Recovery, and Fulfilment platform by Zeerocodes Automation Limited. It unifies software workflows, quotation-based growth services, lead reactivation, and human sales capacity so businesses stop losing revenue to slow or inconsistent follow-up.',
  },
  {
    q: '2. Who is CloseCraft HQ built for?',
    a: 'Our primary launch markets are Real Estate & Property businesses and Education & Training Institutes in Lagos, Nigeria—alongside high-enquiry clinics, solar firms, luxury retail, agencies, and B2B services operating across Nigeria, the US, UK, and Canada.',
  },
  {
    q: '3. How does the 7-day free trial work?',
    a: 'Every new workspace receives a 7-day free trial with no credit card required upfront. You can explore the workspace, import sample leads up to trial limits, configure pipelines, and test follow-up workflows before choosing a paid subscription.',
  },
  {
    q: '4. What are the subscription plans and regional pricing?',
    a: 'In Nigeria, plans start at Starter (₦15,000/mo — 500 leads, 2 seats), Growth Recommended (₦35,000/mo — 2,000 leads, 5 seats), Scale (₦75,000/mo — 10,000 leads, 15 seats), and configurable Enterprise quotations. Independent regional pricing is available in USD ($19/$49/$99), GBP, and CAD, with ~2 months free on annual billing.',
  },
  {
    q: '5. How do payments, invoices, and receipts work?',
    a: 'All card, transfer, and invoice checkouts are processed securely via Bachs.io. Paid entitlements activate only after verified webhook confirmation—never from unverified client redirects—and every paid transaction generates an official downloadable HTML/print invoice and receipt.',
  },
  {
    q: '6. What happens if a payment fails or a subscription expires?',
    a: 'Failed renewals trigger notifications and enter a 5-day grace period so your team can resolve payment without losing work. Even if a subscription later suspends or expires, CloseCraft HQ never deletes your customer leads, conversation history, or audit logs.',
  },
  {
    q: '7. Is CloseCraft HQ an autonomous AI bot that replaces human sales reps?',
    a: 'No. AI handles speed, triage, qualification summaries, and Next Best Action recommendations under strict workspace limits and structured rules. High-value negotiation, pricing commitments, and closing remain controlled by your human team—or audited Digital Sales School reps.',
  },
  {
    q: '8. What does the urgent follow-up SLA actually cover?',
    a: 'When high-intent buying signals, inspection requests, or complex objections are detected, CloseCraft HQ escalates deterministically to your assigned human closer with a visible 15-minute urgent response SLA countdown so hot leads do not cool down unnoticed.',
  },
  {
    q: '9. Can we use CloseCraft HQ with WhatsApp and Facebook/Instagram Ads?',
    a: 'Yes. Inbound enquiries from Meta Lead Ads, landing pages, and WhatsApp conversations enter a single workspace inbox with attribution intact, consent tracking, and 24-hour messaging window safeguards.',
  },
  {
    q: '10. How does Lead Recovery work and how is it priced?',
    a: 'Lead Recovery imports your past unclosed spreadsheets or chat exports, removes opted-out contacts cleanly, segments stalled objections, and runs approval-gated reactivation campaigns. Pricing is tiered by contact volume: ₦25,000 (up to 500 leads), ₦50,000 (501–2,000 leads), ₦100,000 (2,001–5,000 leads), or custom for 5,000+.',
  },
  {
    q: '11. How do Introductory Growth Services work?',
    a: 'Services such as Facebook/Instagram Ads, AI Image Flyers, AI Videos, Landing Pages, and VSL Production are quotation-based. Select one or multiple services, submit one consolidated brief ("GET STARTED"), review deliverables on WhatsApp or in-app discovery, and approve your itemized quote before paying.',
  },
  {
    q: '12. Are the case studies on the homepage verified client results?',
    a: 'No. PrimeHaven Properties, BrightPath Learning Centre, and Apex Business Solutions are explicitly labeled illustrative demo scenarios designed to show how CloseCraft HQ workflows operate in practice before customer case studies are published.',
  },
  {
    q: '13. How does tenant data isolation work?',
    a: 'Every lead, deal, message, AI operation, and invoice is scoped strictly to your business organisation server-side. Cross-tenant access is blocked at the API and database query layer, and AI context never retrieves data from other organisations.',
  },
  {
    q: '14. How do Digital Sales School commissions work if we engage trained reps?',
    a: 'Trained reps follow structured tiers (2%–5%, 5%–10%, 8%–15%, or team retainer + commission). Commissions accrue strictly when customer payment is verified by Bachs.io, require Maker-Checker approval prior to payout, and automatically reverse if a customer invoice is refunded.',
  },
];
