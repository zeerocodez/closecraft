'use server'

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitSalesSupportRequest(data: {
  helpNeeded: string[];
  offerSummary: string;
  recentEnquiryVolume: string;
  targetAudience?: string;
  typicalDealValue?: string;
  workingHoursRequired?: string;
  languageRequirements?: string;
  currentDifficulties?: string;
  authorizedDecisionMaker?: string;
  additionalNotes?: string;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const currentUserId = session?.user?.id;
  if (!organizationId || !currentUserId) throw new Error("Unauthorized");

  const request = await db.salesSupportRequest.create({
    data: {
      organizationId,
      requestedByUserId: currentUserId,
      status: 'SUBMITTED',
      helpNeeded: JSON.stringify(data.helpNeeded || []),
      offerSummary: data.offerSummary.trim(),
      recentEnquiryVolume: data.recentEnquiryVolume.trim(),
      targetAudience: data.targetAudience?.trim() || null,
      typicalDealValue: data.typicalDealValue?.trim() || null,
      workingHoursRequired: data.workingHoursRequired?.trim() || null,
      languageRequirements: data.languageRequirements?.trim() || null,
      currentDifficulties: data.currentDifficulties?.trim() || null,
      authorizedDecisionMaker: data.authorizedDecisionMaker?.trim() || null,
      additionalNotes: data.additionalNotes?.trim() || null,
    }
  });

  await db.auditLog.create({
    data: {
      organizationId,
      actorId: currentUserId,
      actorType: 'USER',
      action: 'SALES_SUPPORT_REQUESTED',
      resourceType: 'SALES_SUPPORT_REQUEST',
      resourceId: request.id,
      newState: JSON.stringify({ offerSummary: data.offerSummary, helpNeeded: data.helpNeeded })
    }
  });

  revalidatePath('/sales-support');
  revalidatePath('/operator');

  return { success: true, request };
}

export async function saveClientBlocker(data: {
  leadId?: string;
  engagementId?: string;
  whatIsNeeded: string;
  whoMustRespond: string;
  requiredResponseDate: string;
  affectedNextAction?: string;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const currentUserId = session?.user?.id;
  if (!organizationId || !currentUserId) throw new Error("Unauthorized");

  const { createClientBlocker } = await import('@/lib/pilot/pilotService');
  const blocker = await createClientBlocker({
    organizationId,
    leadId: data.leadId,
    engagementId: data.engagementId,
    whatIsNeeded: data.whatIsNeeded,
    whoMustRespond: data.whoMustRespond,
    requiredResponseDate: new Date(data.requiredResponseDate),
    affectedNextAction: data.affectedNextAction,
  });

  revalidatePath('/today');
  revalidatePath('/sales-support');
  revalidatePath('/leads');
  revalidatePath('/rep');

  return { success: true, blocker };
}

export async function resolveBlockerAction(blockerId: string, resolutionNotes: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const currentUserId = session?.user?.id;
  if (!organizationId || !currentUserId) throw new Error("Unauthorized");

  const { resolveClientBlocker } = await import('@/lib/pilot/pilotService');
  const resolved = await resolveClientBlocker(blockerId, currentUserId, resolutionNotes);

  revalidatePath('/today');
  revalidatePath('/sales-support');
  revalidatePath('/leads');
  revalidatePath('/rep');

  return { success: true, blocker: resolved };
}

export async function logPilotEffort(data: {
  engagementId: string;
  hoursSpent: number;
  activityDescription: string;
  leadsWorkedCount?: number;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const currentUserId = session?.user?.id;
  if (!organizationId || !currentUserId) throw new Error("Unauthorized");

  const member = await db.organizationMember.findFirst({
    where: { userId: currentUserId, organizationId },
    select: { role: true }
  });

  const actorRole = member?.role === 'EXTERNAL_PROFESSIONAL' ? 'PROFESSIONAL' : 'OPERATOR';

  const { logWorkEffort } = await import('@/lib/pilot/pilotService');
  const log = await logWorkEffort({
    engagementId: data.engagementId,
    userId: currentUserId,
    actorRole,
    hoursSpent: Number(data.hoursSpent),
    activityDescription: data.activityDescription,
    leadsWorkedCount: data.leadsWorkedCount,
  });

  revalidatePath('/sales-support');
  revalidatePath('/rep');
  revalidatePath('/operator');

  return { success: true, log };
}

export async function acceptPilotTermsAction(engagementId: string, termsText: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const currentUserId = session?.user?.id;
  if (!organizationId || !currentUserId) throw new Error("Unauthorized");

  const member = await db.organizationMember.findFirst({
    where: { userId: currentUserId, organizationId }
  });

  if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    throw new Error("Only a workspace Owner or Admin can accept commercial terms.");
  }

  const { recordTermsAcceptance } = await import('@/lib/pilot/pilotService');
  const updated = await recordTermsAcceptance(engagementId, currentUserId, 'web-client', termsText);

  revalidatePath('/sales-support');
  revalidatePath('/operator');

  return { success: true, engagement: updated };
}

export async function createBachsCheckoutAction(params: {
  type: 'SOFTWARE_SUBSCRIPTION' | 'PILOT_ENGAGEMENT';
  amount?: number;
  plan?: 'STARTER' | 'PRO';
  currency?: string;
  engagementId?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const { createBachsCheckoutSession } = await import('@/lib/payments/bachs');
  const { WORKSPACE_PLANS } = await import('@/lib/payments/subscription');

  let finalAmount = params.amount;
  if (!finalAmount) {
    if (params.type === 'SOFTWARE_SUBSCRIPTION') {
      const selectedPlan = params.plan === 'PRO' ? WORKSPACE_PLANS.PRO : WORKSPACE_PLANS.STARTER;
      finalAmount = selectedPlan.pricePerMonth;
    } else {
      finalAmount = 150000;
    }
  }

  const checkout = await createBachsCheckoutSession({
    organizationId,
    type: params.type,
    plan: params.plan,
    amount: finalAmount,
    currency: params.currency || 'NGN',
    customerEmail: session.user.email || undefined,
    customerName: session.user.name || undefined,
    engagementId: params.engagementId,
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
  });

  return checkout;
}
