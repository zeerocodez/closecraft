'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { calculateQuoteEconomics, checkActivationPrerequisites, activateEngagement } from '@/lib/pilot/pilotService';

// Ensure caller is an authorized operator
async function assertOperator() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true }
  });

  const isOperator = user?.role === 'OPERATOR' || user?.role === 'SUPER_ADMIN' || user?.email?.endsWith('@closecrafthq.com') || user?.email?.endsWith('@closecraft.com');
  if (!isOperator) {
    throw new Error('Access Denied: Platform Operator privileges required.');
  }

  return { operatorId: session.user.id };
}

/**
 * Assesses a client support request and generates a readiness assessment.
 */
export async function assessSupportRequestAction(data: {
  requestId: string;
  outcome: 'READY_FOR_PROPOSAL' | 'MORE_INFO_NEEDED' | 'PREPARATION_REQUIRED' | 'NOT_SUITABLE';
  offerLegitimacy: boolean;
  clientDeliveryAbility: boolean;
  suitableOpportunitiesExist: boolean;
  salesMaterialsAvailable: boolean;
  pricingAndRefundClear: boolean;
  decisionMakerAvailable: boolean;
  workingExpectationsRealistic: boolean;
  compensationViable: boolean;
  factualNotes: string;
  internalNotes: string;
  checklistItems: Array<{ title: string; owner: 'CLIENT' | 'OPERATOR' }>;
}) {
  const { operatorId } = await assertOperator();

  const assessment = await db.readinessAssessment.upsert({
    where: { requestId: data.requestId },
    update: {
      operatorUserId: operatorId,
      outcome: data.outcome,
      offerLegitimacy: data.offerLegitimacy,
      clientDeliveryAbility: data.clientDeliveryAbility,
      suitableOpportunitiesExist: data.suitableOpportunitiesExist,
      salesMaterialsAvailable: data.salesMaterialsAvailable,
      pricingAndRefundClear: data.pricingAndRefundClear,
      decisionMakerAvailable: data.decisionMakerAvailable,
      workingExpectationsRealistic: data.workingExpectationsRealistic,
      compensationViable: data.compensationViable,
      factualNotes: data.factualNotes,
      internalNotes: data.internalNotes,
      completedAt: new Date(),
    },
    create: {
      requestId: data.requestId,
      operatorUserId: operatorId,
      outcome: data.outcome,
      offerLegitimacy: data.offerLegitimacy,
      clientDeliveryAbility: data.clientDeliveryAbility,
      suitableOpportunitiesExist: data.suitableOpportunitiesExist,
      salesMaterialsAvailable: data.salesMaterialsAvailable,
      pricingAndRefundClear: data.pricingAndRefundClear,
      decisionMakerAvailable: data.decisionMakerAvailable,
      workingExpectationsRealistic: data.workingExpectationsRealistic,
      compensationViable: data.compensationViable,
      factualNotes: data.factualNotes,
      internalNotes: data.internalNotes,
      completedAt: new Date(),
    }
  });

  // Re-create checklist items
  await db.preparationChecklistItem.deleteMany({
    where: { assessmentId: assessment.id }
  });

  if (data.checklistItems && data.checklistItems.length > 0) {
    await db.preparationChecklistItem.createMany({
      data: data.checklistItems.map(item => ({
        assessmentId: assessment.id,
        title: item.title,
        owner: item.owner,
        isCompleted: false,
      }))
    });
  }

  // Update request status
  await db.salesSupportRequest.update({
    where: { id: data.requestId },
    data: {
      status: data.outcome === 'READY_FOR_PROPOSAL' ? 'PROPOSED' : 'UNDER_REVIEW'
    }
  });

  revalidatePath('/operator');
  revalidatePath('/sales-support');

  return { success: true, assessment };
}

/**
 * Creates or updates an engagement proposal with the contribution economics worksheet.
 */
export async function draftEngagementProposalAction(data: {
  organizationId: string;
  requestId?: string;
  professionalId?: string;
  title: string;
  offerRepresented: string;
  activitiesIncluded: string[];
  activitiesExcluded: string[];
  capacityUnit: string;
  agreedCapacity: number;
  workingDays: string;
  responseWindows: string;
  communicationChannels: string;
  reviewSchedule: string;
  requiredClientInputs: string;
  clientServicePrice: number;
  currency?: string;
  professionalCompensation: number;
  expectedOperatorEffortHours: number;
  operatorHourlyCostRate: number;
  directDeliveryCosts: number;
  negativeMarginOverrideReason?: string;
}) {
  const { operatorId } = await assertOperator();

  const economics = calculateQuoteEconomics({
    clientServicePrice: data.clientServicePrice,
    professionalCompensation: data.professionalCompensation,
    expectedOperatorEffortHours: data.expectedOperatorEffortHours,
    operatorHourlyCostRate: data.operatorHourlyCostRate,
    directDeliveryCosts: data.directDeliveryCosts,
  });

  if (economics.isNegativeContribution && !data.negativeMarginOverrideReason?.trim()) {
    throw new Error('Expected contribution is negative. An explicit override reason is required to approve this quote.');
  }

  const engagement = await db.pilotEngagement.create({
    data: {
      organizationId: data.organizationId,
      requestId: data.requestId || null,
      professionalId: data.professionalId || null,
      title: data.title || 'Closecraft Follow-up Pilot (30 Days)',
      status: 'AWAITING_ACCEPTANCE',
      offerRepresented: data.offerRepresented,
      activitiesIncluded: JSON.stringify(data.activitiesIncluded || []),
      activitiesExcluded: JSON.stringify(data.activitiesExcluded || []),
      capacityUnit: data.capacityUnit || 'HOURS',
      agreedCapacity: data.agreedCapacity || 40.0,
      workingDays: data.workingDays,
      responseWindows: data.responseWindows,
      communicationChannels: data.communicationChannels,
      reviewSchedule: data.reviewSchedule,
      requiredClientInputs: data.requiredClientInputs,
      clientServicePrice: data.clientServicePrice,
      currency: data.currency || 'NGN',
      professionalCompensation: data.professionalCompensation,
      managementFee: economics.managementFee,
      expectedOperatorEffortHours: data.expectedOperatorEffortHours,
      operatorHourlyCostRate: data.operatorHourlyCostRate,
      directDeliveryCosts: data.directDeliveryCosts,
      estimatedPaymentFees: economics.estimatedPaymentFees,
      expectedContribution: economics.expectedContribution,
      negativeMarginOverrideReason: data.negativeMarginOverrideReason?.trim() || null,
    }
  });

  // Automatically create Bachs invoice for this quote
  const { createBachsCheckoutSession } = await import('@/lib/payments/bachs');
  try {
    await createBachsCheckoutSession({
      organizationId: data.organizationId,
      engagementId: engagement.id,
      amount: data.clientServicePrice,
      currency: data.currency || 'NGN',
      type: 'PILOT_ENGAGEMENT',
      successUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/sales-support?payment=success`,
      cancelUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/sales-support?payment=cancelled`,
    });
  } catch (err) {
    console.warn('[Operator] Bachs checkout session pre-creation note:', err);
  }

  revalidatePath('/operator');
  revalidatePath('/sales-support');

  return { success: true, engagement };
}

/**
 * Manages talent pool directory records and dual approval.
 */
export async function saveProfessionalAction(data: {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  bio?: string;
  experienceSummary?: string;
  languages: string[];
  weeklyAvailabilityHours: number;
  isPoolApproved: boolean;
}) {
  const { operatorId } = await assertOperator();

  const now = new Date();

  const pro = await db.professionalProfile.upsert({
    where: { email: data.email },
    update: {
      fullName: data.fullName,
      phone: data.phone || null,
      bio: data.bio || null,
      experienceSummary: data.experienceSummary || null,
      languages: data.languages,
      weeklyAvailabilityHours: data.weeklyAvailabilityHours,
      isPoolApproved: data.isPoolApproved,
      poolApprovedAt: data.isPoolApproved ? now : null,
      poolApprovedByUserId: data.isPoolApproved ? operatorId : null,
    },
    create: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      bio: data.bio || null,
      experienceSummary: data.experienceSummary || null,
      languages: data.languages,
      weeklyAvailabilityHours: data.weeklyAvailabilityHours,
      isPoolApproved: data.isPoolApproved,
      poolApprovedAt: data.isPoolApproved ? now : null,
      poolApprovedByUserId: data.isPoolApproved ? operatorId : null,
    }
  });

  revalidatePath('/operator');
  return { success: true, professional: pro };
}

/**
 * Updates client-specific readiness for a professional representing a client offer.
 */
export async function updateClientSpecificReadinessAction(data: {
  professionalId: string;
  organizationId: string;
  salesBriefReviewed: boolean;
  practiceConversationPassed: boolean;
  objectionHandlingPassed: boolean;
  commercialBoundariesConfirmed: boolean;
  operatorAssessmentPassed: boolean;
  clientApprovalGranted: boolean;
  assessmentEvidence?: string;
}) {
  const { operatorId } = await assertOperator();

  const isAllPassed = (
    data.salesBriefReviewed &&
    data.practiceConversationPassed &&
    data.objectionHandlingPassed &&
    data.commercialBoundariesConfirmed &&
    data.operatorAssessmentPassed &&
    data.clientApprovalGranted
  );

  const readiness = await db.clientOfferReadiness.upsert({
    where: {
      professionalId_organizationId: {
        professionalId: data.professionalId,
        organizationId: data.organizationId,
      }
    },
    update: {
      salesBriefReviewed: data.salesBriefReviewed,
      practiceConversationPassed: data.practiceConversationPassed,
      objectionHandlingPassed: data.objectionHandlingPassed,
      commercialBoundariesConfirmed: data.commercialBoundariesConfirmed,
      operatorAssessmentPassed: data.operatorAssessmentPassed,
      clientApprovalGranted: data.clientApprovalGranted,
      assessmentEvidence: data.assessmentEvidence || null,
      approvedAt: isAllPassed ? new Date() : null,
      approvedByUserId: isAllPassed ? operatorId : null,
    },
    create: {
      professionalId: data.professionalId,
      organizationId: data.organizationId,
      salesBriefReviewed: data.salesBriefReviewed,
      practiceConversationPassed: data.practiceConversationPassed,
      objectionHandlingPassed: data.objectionHandlingPassed,
      commercialBoundariesConfirmed: data.commercialBoundariesConfirmed,
      operatorAssessmentPassed: data.operatorAssessmentPassed,
      clientApprovalGranted: data.clientApprovalGranted,
      assessmentEvidence: data.assessmentEvidence || null,
      approvedAt: isAllPassed ? new Date() : null,
      approvedByUserId: isAllPassed ? operatorId : null,
    }
  });

  // Update engagement prerequisite flag if matching
  if (isAllPassed) {
    await db.pilotEngagement.updateMany({
      where: {
        organizationId: data.organizationId,
        professionalId: data.professionalId,
      },
      data: {
        isProfessionalApproved: true,
        isClientReadinessApproved: true,
      }
    });
  }

  revalidatePath('/operator');
  revalidatePath('/sales-support');

  return { success: true, readiness };
}

/**
 * Marks material checklist items provided.
 */
export async function updateMaterialsStatusAction(engagementId: string, isMaterialsProvided: boolean) {
  await assertOperator();

  const updated = await db.pilotEngagement.update({
    where: { id: engagementId },
    data: { isMaterialsProvided }
  });

  revalidatePath('/operator');
  revalidatePath('/sales-support');

  return { success: true, engagement: updated };
}

/**
 * Triggers activation verification and launches engagement if ready.
 */
export async function triggerActivationAction(engagementId: string) {
  const { operatorId } = await assertOperator();

  const activated = await activateEngagement(engagementId, operatorId);

  revalidatePath('/operator');
  revalidatePath('/sales-support');
  revalidatePath('/today');

  return { success: true, engagement: activated };
}

/**
 * Records professional payout confirmation (manually authorized by operator).
 */
export async function recordPayoutConfirmationAction(payableId: string, payoutReference: string) {
  const { operatorId } = await assertOperator();

  const payable = await db.professionalPayable.update({
    where: { id: payableId },
    data: {
      status: 'PAID_OUT',
      payoutReference,
      payoutDate: new Date(),
      approvedByUserId: operatorId,
    }
  });

  revalidatePath('/operator');
  return { success: true, payable };
}
