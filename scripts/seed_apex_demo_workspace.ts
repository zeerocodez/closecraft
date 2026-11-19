/**
 * Apex Professional Services - Dedicated CloseCraft Demonstration Workspace Seed
 * 
 * Provisions an isolated, complete demonstration tenant:
 * - Organization: Apex Professional Services (slug: apex-demo)
 * - 7 Team Members (Owner, Manager, 3 Closers, 2 Setters)
 * - 12 Distinct Prospect Scenarios reflecting the full Revenue Engine lifecycle
 * - Real conversations, BANT qualification evidence, Revenue Signals, and Actions
 * - Active Revenue Leaks (SLA breaches, stalled deals) and verified Won deals
 * 
 * Idempotent: Can be executed multiple times safely without duplicate records.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedApexDemoWorkspace() {
  console.log('[Apex Demo Seed] Provisioning isolated demonstration workspace: "Apex Professional Services"...');

  const DEMO_ORG_SLUG = 'apex-demo';
  const PASSWORD_HASH = await bcrypt.hash('ApexDemo2026!', 10);

  // 1. Create or update Demo Organization
  const org = await prisma.organization.upsert({
    where: { slug: DEMO_ORG_SLUG },
    update: {
      name: 'Apex Professional Services',
      status: 'APPROVED',
      plan: 'SCALE',
      whatsappNumber: '+2348021112233',
      whatsappPhoneNumberId: 'wa_phone_apex_demo_101',
      whatsappBusinessAccountId: 'waba_apex_demo_waba_505',
      facebookPageId: 'fb_page_apex_demo_202',
      leadRoutingMode: 'ROUND_ROBIN',
      qualificationPolicy: `Apex Professional Services B2B Consulting Qualification Policy:\n` +
        `• Target Clients: Mid-sized to enterprise Nigerian businesses in financial services, logistics, retail, and tech.\n` +
        `• Minimum Deal Scope: ₦500,000 for advisory sprints, ₦1,500,000 for retainer engagements.\n` +
        `• Authority Requirement: Founder, CEO, COO, Chief Financial Officer, or Senior Managing Partner.\n` +
        `• Immediate Escalation: Assign human CLOSER if budget exceeds ₦1,000,000 and timeline is under 30 days.\n` +
        `• Disqualification: Undergraduate student projects, individual CV reviews, or unbudgeted casual queries.`,
    },
    create: {
      name: 'Apex Professional Services',
      slug: DEMO_ORG_SLUG,
      status: 'APPROVED',
      plan: 'SCALE',
      whatsappNumber: '+2348021112233',
      whatsappPhoneNumberId: 'wa_phone_apex_demo_101',
      whatsappBusinessAccountId: 'waba_apex_demo_waba_505',
      facebookPageId: 'fb_page_apex_demo_202',
      leadRoutingMode: 'ROUND_ROBIN',
      qualificationPolicy: `Apex Professional Services B2B Consulting Qualification Policy:\n` +
        `• Target Clients: Mid-sized to enterprise Nigerian businesses in financial services, logistics, retail, and tech.\n` +
        `• Minimum Deal Scope: ₦500,000 for advisory sprints, ₦1,500,000 for retainer engagements.\n` +
        `• Authority Requirement: Founder, CEO, COO, Chief Financial Officer, or Senior Managing Partner.\n` +
        `• Immediate Escalation: Assign human CLOSER if budget exceeds ₦1,000,000 and timeline is under 30 days.\n` +
        `• Disqualification: Undergraduate student projects, individual CV reviews, or unbudgeted casual queries.`,
    },
  });

  console.log(`[Apex Demo Seed] Organization ready: "${org.name}" (ID: ${org.id})`);

  // Clean existing demo records for this org to ensure strict idempotency
  await prisma.revenueSignal.deleteMany({ where: { organizationId: org.id } });
  await prisma.revenueAction.deleteMany({ where: { organizationId: org.id } });
  await prisma.revenueLeak.deleteMany({ where: { organizationId: org.id } });
  await prisma.appointment.deleteMany({ where: { organizationId: org.id } });
  await prisma.deal.deleteMany({ where: { organizationId: org.id } });
  await prisma.conversation.deleteMany({ where: { organizationId: org.id } });
  await prisma.lead.deleteMany({ where: { organizationId: org.id } });

  // 2. Provision 7 Team Members
  const teamDefs = [
    { email: 'jide.adeleke@apexdemo.closecraft.com', name: 'Babajide Adeleke', role: 'OWNER' },
    { email: 'ngozi.eze@apexdemo.closecraft.com', name: 'Ngozi Eze', role: 'MANAGER' },
    { email: 'femi.adeyemi@apexdemo.closecraft.com', name: 'Femi Adeyemi', role: 'CLOSER' },
    { email: 'zainab.bello@apexdemo.closecraft.com', name: 'Zainab Bello', role: 'CLOSER' },
    { email: 'emeka.nwosu@apexdemo.closecraft.com', name: 'Emeka Nwosu', role: 'CLOSER' },
    { email: 'tariere.dickson@apexdemo.closecraft.com', name: 'Tariere Dickson', role: 'SETTER' },
    { email: 'kelechi.amadi@apexdemo.closecraft.com', name: 'Kelechi Amadi', role: 'SETTER' },
  ];

  const teamUsers: Record<string, any> = {};

  for (const def of teamDefs) {
    const user = await prisma.user.upsert({
      where: { email: def.email },
      update: { name: def.name, emailVerified: new Date() },
      create: {
        email: def.email,
        name: def.name,
        passwordHash: PASSWORD_HASH,
        emailVerified: new Date(),
      },
    });

    teamUsers[def.role + '_' + def.name.split(' ')[0]] = user;

    await prisma.organizationMember.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: org.id,
        },
      },
      update: {
        role: def.role,
        isAvailable: true,
      },
      create: {
        userId: user.id,
        organizationId: org.id,
        role: def.role,
        isAvailable: true,
        commissionRate: def.role === 'CLOSER' ? 15.0 : (def.role === 'SETTER' ? 5.0 : 0.0),
      },
    });
  }

  console.log(`[Apex Demo Seed] Provisioned ${teamDefs.length} team members.`);

  const closerFemi = teamUsers['CLOSER_Femi'];
  const closerZainab = teamUsers['CLOSER_Zainab'];
  const closerEmeka = teamUsers['CLOSER_Emeka'];
  const setterTariere = teamUsers['SETTER_Tariere'];
  const setterKelechi = teamUsers['SETTER_Kelechi'];

  // 3. Provision 12 Distinct Prospect Scenarios
  const now = Date.now();

  // Scenario 1: New inbound enquiry (Website Form)
  const lead1 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      name: 'Folake Jacobs',
      email: 'folake.jacobs@crestviewholdings.ng',
      phone: '+2348039988771',
      message: '[DEMO - Scenario 1: New Inbound Enquiry] Exploring business restructuring and financial audit advisory for our 3 retail outlets in Ikeja.',
      source: 'WEBSITE',
      status: 'NEW',
      buyingIntent: 55,
      estimatedValue: 1200000,
      currency: 'NGN',
      assignedUserId: setterTariere.id,
      assignedRole: 'SETTER',
      nextAction: 'Triage Inbound Website Lead & Schedule Discovery',
      nextActionDueAt: new Date(now + 2 * 60 * 60 * 1000),
      aiAssessment: '[Analysis Mode: Deterministic Policy Fallback Engine]\n• ICP Fit: 75/100 • Intent: 55/100 • Urgency: 50/100\n• Stated Budget: ₦1,200,000 (Prospect-Stated)\n• Identified Need: Multi-outlet retail business restructuring\n• Next Step: Inbound setter discovery via WhatsApp',
      nextStepsRecommendation: 'Reach out via WhatsApp within 2 hours to qualify timeline and current financial accounting software.',
    },
  });

  // Scenario 2: High-intent prospect with stated budget (Meta Lead Ad)
  const lead2 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      name: 'Alhaji Musa Garba',
      email: 'musa.garba@sahelindustries.com',
      phone: '+2348023344556',
      message: '[DEMO - Scenario 2: High-Intent with Stated Budget] We are preparing for our annual board strategy retreat and have an approved budget of ₦3.5M. We need a partner by end of month.',
      source: 'FACEBOOK_LEAD_AD',
      status: 'OPPORTUNITY',
      buyingIntent: 94,
      estimatedValue: 3500000,
      currency: 'NGN',
      assignedUserId: closerFemi.id,
      assignedRole: 'CLOSER',
      claimedAt: new Date(),
      nextAction: 'Executive Strategy Call & Terms Negotiation',
      nextActionDueAt: new Date(now + 30 * 60 * 1000), // 30-min urgent SLA
      aiAssessment: '[Analysis Mode: Deterministic Policy Fallback Engine]\n• ICP Fit: 95/100 • Intent: 94/100 • Urgency: 95/100\n• Decision Authority: Managing Director / Board Representative\n• Stated Budget: ₦3,500,000 (Approved Board Allocation)\n• Deal Health: 🟢 High Conversion Probability (Closing Window < 30 Days)',
      nextStepsRecommendation: 'Senior closer assignment required. Immediate phone/WhatsApp outreach to schedule CEO presentation.',
    },
  });

  // Scenario 3: Prospect requesting more information (Website Widget)
  const lead3 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      name: 'Chinedu Okonkwo',
      email: 'c.okonkwo@transcorpfreight.ng',
      phone: '+2348122334455',
      message: '[DEMO - Scenario 3: Requesting Information] Please send over your corporate advisory brochure and rate card for supply chain cost reduction.',
      source: 'WEBSITE_WIDGET',
      status: 'ENGAGED',
      buyingIntent: 68,
      estimatedValue: 800000,
      currency: 'NGN',
      assignedUserId: setterKelechi.id,
      assignedRole: 'SETTER',
      nextAction: 'Send Corporate Rate Card & Video Explainer',
      nextActionDueAt: new Date(now + 4 * 60 * 60 * 1000),
      aiAssessment: 'Mid-sized logistics provider requesting information. Intent is solid but commercial scope not yet finalized.',
      nextStepsRecommendation: 'Send customized pricing PDF and offer 15-minute diagnostic walkthrough.',
    },
  });

  // Scenario 4: Prospect who needs qualification (WhatsApp Inbound)
  const lead4 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      name: 'Damilola Bakare',
      email: 'damilola.bakare@primelogistics.ng',
      phone: '+2348133445566',
      message: '[DEMO - Scenario 4: Needs Qualification] Hi Apex team, heard about your operations advisory from LinkedIn. Do you work with haulage businesses in Apapa?',
      source: 'WHATSAPP',
      status: 'QUALIFYING',
      buyingIntent: 62,
      estimatedValue: null, // Explicitly not yet established
      currency: 'NGN',
      assignedUserId: setterTariere.id,
      assignedRole: 'SETTER',
      nextAction: 'Discover Fleet Size and Operational Bottlenecks',
      nextActionDueAt: new Date(now + 60 * 60 * 1000),
      aiAssessment: 'Inbound WhatsApp lead. Unstated budget and fleet size. Requires discovery before closer assignment.',
      nextStepsRecommendation: 'Ask how many operational trucks they manage and what current delivery turnaround challenges they face.',
    },
  });

  // Scenario 5: Prospect awaiting a proposal
  const lead5 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      name: 'Dr. Ifeanyi Uzoma',
      email: 'uzoma@medilinkdiagnostics.com',
      phone: '+2348055667788',
      message: '[DEMO - Scenario 5: Awaiting Proposal] We finished discovery yesterday with Zainab. Awaiting official proposal for diagnostic lab revenue audit.',
      source: 'REFERRAL',
      status: 'PROPOSAL_SENT',
      buyingIntent: 85,
      estimatedValue: 2200000,
      currency: 'NGN',
      assignedUserId: closerZainab.id,
      assignedRole: 'CLOSER',
      nextAction: 'Follow Up on Commercial Proposal Review',
      nextActionDueAt: new Date(now + 24 * 60 * 60 * 1000),
      aiAssessment: 'Proposal for ₦2.2M diagnostic operations audit issued. Client reviewing with partners.',
      nextStepsRecommendation: 'Send proposal summary via WhatsApp with executive video brief.',
    },
  });

  // Scenario 6: Prospect who stopped responding (Stale Follow-Up)
  const lead6 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      name: 'Bimbo Shonowo',
      email: 'bimbo@shonowoglobal.com',
      phone: '+2348077889900',
      message: '[DEMO - Scenario 6: Stopped Responding] Downloaded consulting deck 5 days ago. No response to WhatsApp outreach.',
      source: 'FACEBOOK_LEAD_AD',
      status: 'ENGAGED',
      buyingIntent: 70,
      estimatedValue: 950000,
      currency: 'NGN',
      assignedUserId: setterKelechi.id,
      assignedRole: 'SETTER',
      nextAction: 'Trigger Day-5 Value Nurture WhatsApp Message',
      nextActionDueAt: new Date(now - 12 * 60 * 60 * 1000), // Overdue
      aiAssessment: 'Prospect unresponsive for 48+ hours. High probability of stalled deal without intelligent re-engagement.',
      nextStepsRecommendation: 'Dispatch short question: "Did you manage to look over the 3 quick wins for retail stock turnover?"',
    },
  });

  // Scenario 7: Stalled opportunity (Revenue Leak: Stalled Deal)
  const lead7 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      name: 'Tariq Mansur',
      email: 'tariq@kanofoods.ng',
      phone: '+2348099001122',
      message: '[DEMO - Scenario 7: Stalled Opportunity] Commercial terms for ₦1.8M FMCG supply chain review sent 14 days ago. Contract unexecuted.',
      source: 'DIRECT',
      status: 'OPPORTUNITY',
      buyingIntent: 76,
      estimatedValue: 1800000,
      currency: 'NGN',
      assignedUserId: closerEmeka.id,
      assignedRole: 'CLOSER',
      nextAction: 'Executive Intervention: Offer Phased Milestone Payment',
      nextActionDueAt: new Date(now - 48 * 60 * 60 * 1000),
      aiAssessment: '🔴 STALLED DEAL: Opportunity idle in negotiation for 14 days. Revenue at risk: ₦1,800,000.',
      nextStepsRecommendation: 'Sales manager or senior closer should offer 50/50 milestone payment terms to unlock closing.',
    },
  });

  // Scenario 8: Qualified prospect awaiting human follow-up (Revenue Leak: SLA Breach)
  const lead8 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      name: 'Bolanle Williams',
      email: 'bolanle.williams@zenithlogistics.com',
      phone: '+2348031122334',
      message: '[DEMO - Scenario 8: Qualified Awaiting Human Follow-Up] Ready to schedule contract signing call today. Stated budget: ₦2.8M.',
      source: 'WHATSAPP',
      status: 'QUALIFIED',
      buyingIntent: 88,
      estimatedValue: 2800000,
      currency: 'NGN',
      assignedUserId: closerEmeka.id,
      assignedRole: 'CLOSER',
      nextAction: 'Execute Overdue Closing Outreach (SLA Breached)',
      nextActionDueAt: new Date(now - 3 * 60 * 60 * 1000), // 3 hours overdue
      aiAssessment: '⚠️ SLA BREACHED: High-intent closer lead waiting > 3 hours without contact. Revenue at risk.',
      nextStepsRecommendation: 'Immediate call to prospect. Lead has ready budget and executive authority.',
    },
  });

  // Scenario 9: Unqualified enquiry (Disqualified)
  const lead9 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      name: 'Victor Olamide',
      email: 'victor.olamide.student@gmail.com',
      phone: '+2348144556677',
      message: '[DEMO - Scenario 9: Unqualified Enquiry] Hello sir, I am a final-year student writing my thesis on Nigerian consulting firms. Can you send me internal financial files?',
      source: 'WEBSITE',
      status: 'LOST',
      buyingIntent: 15,
      estimatedValue: null,
      currency: 'NGN',
      disqualificationReason: 'Undergraduate student thesis inquiry. Fails tenant B2B commercial entity criterion.',
      nextAction: 'Polite Disqualification Notice Dispatched',
      aiAssessment: 'Disqualified under tenant policy: non-commercial student research inquiry.',
      nextStepsRecommendation: 'Direct to public case studies and blog; close opportunity.',
    },
  });

  // Scenario 10: Closed-won opportunity (Verified Realised Revenue)
  const lead10 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      name: 'Segun Adelekan',
      email: 's.adelekan@lagosmercantile.com',
      phone: '+2348022114433',
      message: '[DEMO - Scenario 10: Closed-Won Opportunity] Corporate advisory engagement accepted and invoice cleared.',
      source: 'FACEBOOK_LEAD_AD',
      status: 'WON',
      buyingIntent: 98,
      estimatedValue: 2500000,
      currency: 'NGN',
      assignedUserId: closerFemi.id,
      assignedRole: 'CLOSER',
      nextAction: 'Initiate Client Onboarding & Project Kickoff',
      aiAssessment: '🎉 CLOSED-WON: Contract executed and Bachs payment verified. Realised Revenue: ₦2,500,000.',
      nextStepsRecommendation: 'Hand over to client services delivery team; send welcome pack.',
    },
  });

  // Scenario 11: Prospect with scheduled appointment
  const lead11 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      name: 'Amina Mohammed',
      email: 'amina.mohammed@horizontech.ng',
      phone: '+2348091122335',
      message: '[DEMO - Scenario 11: Scheduled Appointment] Scheduled walkthrough for executive sales audit on Friday 11:00 AM.',
      source: 'WEBSITE',
      status: 'QUALIFIED',
      buyingIntent: 84,
      estimatedValue: 1500000,
      currency: 'NGN',
      assignedUserId: closerZainab.id,
      assignedRole: 'CLOSER',
      nextAction: 'Prepare Custom Diagnostic Deck for Scheduled Demo',
      nextActionDueAt: new Date(now + 26 * 60 * 60 * 1000),
      aiAssessment: 'Confirmed video meeting. High intent with executive decision-maker attendance.',
      nextStepsRecommendation: 'Send calendar invite and automated WhatsApp meeting reminder 2 hours prior.',
    },
  });

  // Scenario 12: Prospect who has opted out of marketing
  const lead12 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      name: 'Kayode Fagbemi',
      email: 'kayode.fagbemi@outlook.com',
      phone: '+2348188776655',
      message: '[DEMO - Scenario 12: Prospect Opted Out] STOP',
      source: 'WHATSAPP',
      status: 'LOST',
      buyingIntent: 10,
      estimatedValue: null,
      currency: 'NGN',
      optedOutOfMarketing: true,
      optedOutAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
      disqualificationReason: 'Customer requested opt-out via WhatsApp (STOP)',
      nextAction: 'Opted out - no further outreach permitted',
      aiAssessment: 'Customer explicitly replied STOP on WhatsApp. All automated and manual outreach terminated.',
      nextStepsRecommendation: 'Do not contact. Preserve opt-out compliance.',
    },
  });

  console.log('[Apex Demo Seed] Provisioned 12 distinct lead scenarios.');

  // 4. Create Active Deals
  // Deal for Scenario 2 (Negotiation)
  await prisma.deal.create({
    data: {
      organizationId: org.id,
      leadId: lead2.id,
      title: '[DEMO] Board Strategy Retreat Advisory - Sahel Industries',
      amount: 3500000,
      currency: 'NGN',
      stage: 'NEGOTIATION',
      closerId: closerFemi.id,
      commissionAmount: 525000,
      commissionStatus: 'PENDING',
    },
  });

  // Deal for Scenario 5 (Proposal)
  await prisma.deal.create({
    data: {
      organizationId: org.id,
      leadId: lead5.id,
      title: '[DEMO] Lab Operations Revenue Audit - MediLink',
      amount: 2200000,
      currency: 'NGN',
      stage: 'PROPOSAL',
      closerId: closerZainab.id,
      commissionAmount: 330000,
      commissionStatus: 'PENDING',
    },
  });

  // Deal for Scenario 7 (Stalled Opportunity)
  await prisma.deal.create({
    data: {
      organizationId: org.id,
      leadId: lead7.id,
      title: '[DEMO] FMCG Supply Chain Efficiency - Kano Foods',
      amount: 1800000,
      currency: 'NGN',
      stage: 'OPPORTUNITY',
      closerId: closerEmeka.id,
      commissionAmount: 270000,
      commissionStatus: 'PENDING',
    },
  });

  // Deal for Scenario 10 (Closed Won - Realised Revenue)
  await prisma.deal.create({
    data: {
      organizationId: org.id,
      leadId: lead10.id,
      title: '[DEMO] Corporate Advisory Sprint - Lagos Mercantile',
      amount: 2500000,
      currency: 'NGN',
      stage: 'WON',
      closerId: closerFemi.id,
      closedAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
      commissionAmount: 375000,
      commissionStatus: 'APPROVED',
    },
  });

  // 5. Create Appointments
  await prisma.appointment.create({
    data: {
      organizationId: org.id,
      leadId: lead11.id,
      closerId: closerZainab.id,
      title: '[DEMO] Commercial Walkthrough - Horizon Technologies',
      scheduledAt: new Date(now + 26 * 60 * 60 * 1000),
      durationMinutes: 45,
      status: 'SCHEDULED',
      meetingUrl: 'https://meet.google.com/closecraft-apex-demo',
      reminderSent: false,
      notes: '[DEMO] Executive demo with Amina Mohammed and CFO.',
    },
  });

  // 6. Create Revenue Leaks
  await prisma.revenueLeak.create({
    data: {
      organizationId: org.id,
      leadId: lead7.id,
      type: 'STALLED_OPPORTUNITY',
      severity: 'CRITICAL',
      status: 'OPEN',
      description: 'Opportunity with Kano Foods (₦1.8M) has lingered in negotiation for 14 days without stage progression.',
    },
  });

  await prisma.revenueLeak.create({
    data: {
      organizationId: org.id,
      leadId: lead8.id,
      type: 'SLA_BREACHED',
      severity: 'HIGH',
      status: 'OPEN',
      description: 'First touch response SLA breached by 3 hours for high-intent prospect Bolanle Williams (₦2.8M).',
    },
  });

  // 7. Create Standardized Revenue Signals & Actions
  const signalsToCreate = [
    { leadId: lead2.id, type: 'INTENT', value: 94, evidence: 'Approved board retreat budget of ₦3.5M explicitly stated in enquiry.' },
    { leadId: lead2.id, type: 'FIT', value: 95, evidence: 'Established Nigerian conglomerate matching enterprise ICP.' },
    { leadId: lead2.id, type: 'URGENCY', value: 95, evidence: 'Event deadline under 30 days.' },
    { leadId: lead5.id, type: 'INTENT', value: 85, evidence: 'Completed discovery call and agreed to commercial scope.' },
    { leadId: lead7.id, type: 'INTENT', value: 76, evidence: 'Engaged negotiation stalled on milestone terms.' },
    { leadId: lead8.id, type: 'INTENT', value: 88, evidence: 'Inbound message states ready budget and contract signing urgency.' },
  ];

  for (const s of signalsToCreate) {
    await prisma.revenueSignal.create({
      data: {
        organizationId: org.id,
        leadId: s.leadId,
        type: s.type,
        value: s.value,
        source: 'AI',
        evidence: s.evidence,
      },
    });
  }

  // Next Best Actions
  await prisma.revenueAction.create({
    data: {
      organizationId: org.id,
      leadId: lead2.id,
      type: 'ASSIGN_HUMAN',
      reason: 'High-intent enterprise deal (₦3.5M) ready for senior closer terms negotiation.',
      priority: 95,
      recommendedActor: 'HUMAN',
      assignedUserId: closerFemi.id,
      status: 'PENDING',
      source: 'AI',
    },
  });

  await prisma.revenueAction.create({
    data: {
      organizationId: org.id,
      leadId: lead8.id,
      type: 'RESPOND',
      reason: 'SLA recovery action: Reach out immediately to Bolanle Williams to recover ₦2.8M opportunity.',
      priority: 98,
      recommendedActor: 'HUMAN',
      assignedUserId: closerEmeka.id,
      status: 'PENDING',
      source: 'AI',
    },
  });

  await prisma.revenueAction.create({
    data: {
      organizationId: org.id,
      leadId: lead3.id,
      type: 'SEND_NURTURE_SEQUENCE',
      reason: 'Mid-intent enquiry requiring brochure and explainer walkthrough to advance.',
      priority: 65,
      recommendedActor: 'AUTOMATION',
      assignedUserId: setterKelechi.id,
      status: 'PENDING',
      source: 'AI',
    },
  });

  // 8. Create Realistic Conversations
  const conv2 = await prisma.conversation.create({
    data: {
      organizationId: org.id,
      leadId: lead2.id,
      channel: 'WHATSAPP',
      status: 'ACTIVE',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv2.id,
      content: 'Good day. We saw your ad regarding strategic consulting. We have an executive board retreat next month and an approved ₦3.5M budget.',
      senderType: 'PROSPECT',
      status: 'DELIVERED',
      providerMessageId: `wamid_demo_${Date.now()}_1`,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv2.id,
      content: 'Thank you for reaching out, Alhaji Garba. We specialize in executive retreat facilitation and strategy alignment for Nigerian conglomerates. Our senior managing consultant, Femi Adeyemi, is reviewing your timeline.',
      senderType: 'AI',
      status: 'DELIVERED',
      providerMessageId: `wamid_demo_${Date.now()}_2`,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv2.id,
      content: 'Hello Alhaji Garba, this is Femi Adeyemi from Apex. I would be glad to share our board retreat framework and case studies. Are you available for a brief 10-minute call this afternoon?',
      senderType: 'HUMAN',
      status: 'DELIVERED',
      providerMessageId: `wamid_demo_${Date.now()}_3`,
    },
  });

  console.log('[Apex Demo Seed] Demonstration workspace provisioning completed successfully!');
  return {
    organizationId: org.id,
    slug: org.slug,
    leadsCount: 12,
    dealsCount: 4,
    membersCount: 7,
  };
}

// Allow direct CLI execution: npx tsx scripts/seed_apex_demo_workspace.ts
if (require.main === module) {
  seedApexDemoWorkspace()
    .then((res) => {
      console.log('[Apex Demo Seed Success]', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Apex Demo Seed Error]', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
