'use server'

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function seedSampleWorkspaceAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error('Organization required');

  const existingDemo = await db.lead.findFirst({
    where: { organizationId, message: { contains: '[DEMO_SEED]' } }
  });
  if (existingDemo) {
    return { success: true, message: 'Demo workspace already seeded.' };
  }

  const lead1 = await db.lead.create({
    data: {
      organizationId,
      name: 'Tunde Balogun',
      email: `tunde.balogun.${Date.now()}@techcorplagos.ng`,
      phone: '+2348031234567',
      message: '[DEMO_SEED] High-intent enterprise lead seeking 30-day sales operations pilot for 12 outbound reps.',
      source: 'META_LEAD_AD',
      status: 'QUALIFIED',
      buyingIntent: 92,
      estimatedValue: 1200000,
      currency: 'NGN',
      nextAction: 'Execute WhatsApp Discovery Call',
      nextActionDueAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      aiAssessment: 'Enterprise lead with 12 outbound reps. High buying velocity with budget allocated for Q4 revenue systems upgrade.',
      nextStepsRecommendation: 'Initiate WhatsApp outreach within 30 minutes to lock discovery call before competitor demo.',
    }
  });

  const lead2 = await db.lead.create({
    data: {
      organizationId,
      name: 'Dr. Amara Okafor',
      email: `amara.okafor.${Date.now()}@apexclinics.com`,
      phone: '+2348059876543',
      message: '[DEMO_SEED] Requires multi-location patient enquiry triage and automated WhatsApp reminders.',
      source: 'WEBSITE',
      status: 'CONTACTED',
      buyingIntent: 78,
      estimatedValue: 450000,
      currency: 'NGN',
      nextAction: 'Confirm Pricing Sheet Review',
      nextActionDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      aiAssessment: 'Multi-branch healthcare enquiry triage. Needs HIPAA/NDPR-compliant automated appointment reminders.',
      nextStepsRecommendation: 'Send customized pricing tier breakdown and video walkthrough.',
    }
  });

  const lead3 = await db.lead.create({
    data: {
      organizationId,
      name: 'Ibrahim Musa',
      email: `ibrahim.musa.${Date.now()}@northlinelogistics.com`,
      phone: '+2348123456789',
      message: '[DEMO_SEED] Overdue follow-up trigger: Requested custom quarterly billing schedule.',
      source: 'WHATSAPP',
      status: 'NEW',
      buyingIntent: 65,
      estimatedValue: 850000,
      currency: 'NGN',
      nextAction: 'Escalate to Human Closer (Custom Terms)',
      nextActionDueAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      aiAssessment: 'Mid-sized logistics firm requiring flexible quarterly terms. High likelihood of stalled deal if SLA exceeds 4 hours.',
      nextStepsRecommendation: 'Senior closer assignment required to approve milestone-based invoice terms.',
    }
  });

  await db.deal.create({
    data: {
      organizationId,
      leadId: lead1.id,
      title: '[DEMO_SEED] 30-Day Sales Ops Pilot - TechCorp',
      amount: 1200000,
      currency: 'NGN',
      stage: 'NEGOTIATION',
    }
  });

  await db.deal.create({
    data: {
      organizationId,
      leadId: lead3.id,
      title: '[DEMO_SEED] Fleet Logistics Dispatch - Northline',
      amount: 850000,
      currency: 'NGN',
      stage: 'PROPOSAL',
    }
  });

  await db.revenueSignal.createMany({
    data: [
      { organizationId, leadId: lead1.id, type: 'INTENT', value: 92, evidence: 'Enterprise budget confirmed', source: 'AI' },
      { organizationId, leadId: lead2.id, type: 'INTENT', value: 78, evidence: 'High feature interest', source: 'AI' },
      { organizationId, leadId: lead3.id, type: 'INTENT', value: 65, evidence: 'Pricing negotiation ongoing', source: 'AI' },
    ]
  });

  await db.revenueAction.create({
    data: {
      organizationId,
      leadId: lead1.id,
      type: 'EXECUTE_WHATSAPP_DISCOVERY',
      reason: 'High buying intent (92/100). WhatsApp discovery call requested for 12 outbound reps.',
      priority: 92,
      recommendedActor: 'HUMAN',
      status: 'PENDING',
    }
  });

  await db.revenueAction.create({
    data: {
      organizationId,
      leadId: lead3.id,
      type: 'ESCALATE_TO_CLOSER',
      reason: 'Overdue follow-up SLA breach: Requested custom quarterly billing terms.',
      priority: 85,
      recommendedActor: 'CLOSER',
      status: 'PENDING',
    }
  });

  await db.appointment.create({
    data: {
      organizationId,
      leadId: lead1.id,
      title: 'Commercial Demo with Tunde Balogun (TechCorp)',
      scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      durationMinutes: 30,
      status: 'CONFIRMED',
      meetingUrl: 'https://meet.google.com/closecraft-demo-bridge',
      notes: '[DEMO_SEED] Automated demo meeting bridge seeded for trial onboarding.',
    }
  });

  revalidatePath('/dashboard');
  revalidatePath('/leads');
  revalidatePath('/pipeline');
  revalidatePath('/inbox');
  revalidatePath('/appointments');

  return { success: true, count: 3 };
}

export async function clearSampleWorkspaceAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error('Organization required');

  await db.appointment.deleteMany({
    where: {
      organizationId,
      OR: [
        { notes: { contains: '[DEMO_SEED]' } },
        { notes: { contains: '[Demo' } },
      ]
    }
  });

  const deleted = await db.lead.deleteMany({
    where: {
      organizationId,
      OR: [
        { message: { contains: '[DEMO_SEED]' } },
        { message: { contains: '[Demo' } },
        { email: { endsWith: '@example.com' } },
        { email: { contains: 'testcompany.com' } },
      ]
    }
  });

  revalidatePath('/dashboard');
  revalidatePath('/leads');
  revalidatePath('/pipeline');
  revalidatePath('/inbox');
  revalidatePath('/appointments');

  return { success: true, deletedCount: deleted.count };
}
