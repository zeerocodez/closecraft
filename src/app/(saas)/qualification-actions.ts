'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { evaluateSoftwareFit, CURRENT_RULES_VERSION, DEFAULT_ENQUIRY_THRESHOLD } from '@/lib/qualification/rules';
import { evaluateManagedServiceScreening, DEFAULT_CLOSER_THRESHOLD } from '@/lib/qualification/closerScreening';
import { calculateEconomicsAssessment } from '@/lib/qualification/economics';
import { generateBoundedPilotSpec } from '@/lib/qualification/boundedPilot';
import { SoftwareAnswers, ManagedServiceAnswers, EconomicsAnswers, PrimaryHelpNeed } from '@/lib/qualification/types';
import { revalidatePath } from 'next/cache';

/**
 * Save progress progressively during onboarding.
 * Allows users to drop off and resume without losing answers.
 */
export async function saveQualificationProgressAction(data: {
  step: number;
  primaryNeed?: PrimaryHelpNeed;
  softwareAnswers?: Partial<SoftwareAnswers>;
  managedAnswers?: Partial<ManagedServiceAnswers>;
  economicsAnswers?: Partial<EconomicsAnswers>;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Authentication required.');
  const organizationId = (session as any).organizationId;
  if (!organizationId) throw new Error('Organization context missing.');

  // Find or create draft record
  let existing = await db.workspaceQualification.findFirst({
    where: { organizationId, isReassessment: false },
    orderBy: { createdAt: 'desc' },
  });

  const payload: any = {
    currentStep: data.step,
    status: 'IN_PROGRESS',
  };

  if (data.primaryNeed) {
    payload.primaryNeed = data.primaryNeed;
  }

  if (data.softwareAnswers) {
    const sw = data.softwareAnswers;
    if (sw.newEnquiries30dExact !== undefined) payload.newEnquiries30dExact = sw.newEnquiries30dExact;
    if (sw.newEnquiries30dRange !== undefined) payload.newEnquiries30dRange = sw.newEnquiries30dRange;
    if (sw.newEnquiries30dType !== undefined) payload.newEnquiries30dType = sw.newEnquiries30dType;
    if (sw.olderOpportunitiesCount !== undefined) payload.olderOpportunitiesCount = sw.olderOpportunitiesCount;
    if (sw.olderOpportunitiesRange !== undefined) payload.olderOpportunitiesRange = sw.olderOpportunitiesRange;
    if (sw.olderOpportunitiesType !== undefined) payload.olderOpportunitiesType = sw.olderOpportunitiesType;
    if (sw.whoFollowsUp !== undefined) payload.whoFollowsUp = sw.whoFollowsUp;
    if (sw.whoFollowsUpDetail !== undefined) payload.whoFollowsUpDetail = sw.whoFollowsUpDetail;
    if (sw.howFollowUpChecked !== undefined) payload.howFollowUpChecked = JSON.stringify(sw.howFollowUpChecked);
    if (sw.howFollowUpCheckedDetail !== undefined) payload.howFollowUpCheckedDetail = sw.howFollowUpCheckedDetail;
    if (sw.forgottenEnquiryOption !== undefined) payload.forgottenEnquiryOption = sw.forgottenEnquiryOption;
    if (sw.forgottenEnquiryNarrative !== undefined) payload.forgottenEnquiryNarrative = sw.forgottenEnquiryNarrative;
    if (sw.forgottenEnquiryAftermath !== undefined) payload.forgottenEnquiryAftermath = sw.forgottenEnquiryAftermath;
    if (sw.difficulties !== undefined) payload.difficulties = JSON.stringify(sw.difficulties);
    if (sw.difficultyFrequency !== undefined) payload.difficultyFrequency = sw.difficultyFrequency;
  }

  if (data.managedAnswers) {
    const mg = data.managedAnswers;
    if (mg.managedServiceNeed !== undefined) payload.managedServiceNeed = mg.managedServiceNeed;
    if (mg.qualifiedConversations30dExact !== undefined) payload.qualifiedConversations30dExact = mg.qualifiedConversations30dExact;
    if (mg.qualifiedConversations30dRange !== undefined) payload.qualifiedConversations30dRange = mg.qualifiedConversations30dRange;
    if (mg.bookedConversationsNext30dExact !== undefined) payload.bookedConversationsNext30dExact = mg.bookedConversationsNext30dExact;
    if (mg.bookedConversationsNext30dRange !== undefined) payload.bookedConversationsNext30dRange = mg.bookedConversationsNext30dRange;
    if (mg.pipelineSuitableCount !== undefined) payload.pipelineSuitableCount = mg.pipelineSuitableCount;
    if (mg.pipelineAgreedNextCallCount !== undefined) payload.pipelineAgreedNextCallCount = mg.pipelineAgreedNextCallCount;
    if (mg.pipelineStagesSummary !== undefined) payload.pipelineStagesSummary = mg.pipelineStagesSummary;
    if (mg.workloadTasksPerOpportunity !== undefined) payload.workloadTasksPerOpportunity = mg.workloadTasksPerOpportunity;
    if (mg.workloadChannels !== undefined) payload.workloadChannels = JSON.stringify(mg.workloadChannels);
    if (mg.workloadAvgTaskDurationMinutes !== undefined) payload.workloadAvgTaskDurationMinutes = mg.workloadAvgTaskDurationMinutes;
    if (mg.workloadCoverageHours !== undefined) payload.workloadCoverageHours = mg.workloadCoverageHours;
    if (mg.workloadExpectedResponseWindow !== undefined) payload.workloadExpectedResponseWindow = mg.workloadExpectedResponseWindow;
    if (mg.workloadLanguages !== undefined) payload.workloadLanguages = JSON.stringify(mg.workloadLanguages);
  }

  if (data.economicsAnswers) {
    const ec = data.economicsAnswers;
    if (ec.currency !== undefined) payload.currency = ec.currency;
    if (ec.expectedAttributableSales !== undefined) payload.expectedAttributableSales = ec.expectedAttributableSales;
    if (ec.grossProfitPerSale !== undefined) payload.grossProfitPerSale = ec.grossProfitPerSale;
    if (ec.fixedEngagementCost !== undefined) payload.fixedEngagementCost = ec.fixedEngagementCost;
    if (ec.variableFeePerSale !== undefined) payload.variableFeePerSale = ec.variableFeePerSale;
    if (ec.historicalConversations !== undefined) payload.historicalConversations = ec.historicalConversations;
    if (ec.historicalSales !== undefined) payload.historicalSales = ec.historicalSales;
    if (ec.historicalMeasurementPeriod !== undefined) payload.historicalMeasurementPeriod = ec.historicalMeasurementPeriod;
    if (ec.sameCohort !== undefined) payload.sameCohort = ec.sameCohort;
    if (ec.economicsEvidenceSource !== undefined) payload.economicsEvidenceSource = ec.economicsEvidenceSource;
    if (ec.dataLimitationNote !== undefined) payload.dataLimitationNote = ec.dataLimitationNote;
  }

  if (existing) {
    const updated = await db.workspaceQualification.update({
      where: { id: existing.id },
      data: payload,
    });
    return { success: true, qualificationId: updated.id };
  } else {
    const created = await db.workspaceQualification.create({
      data: {
        organizationId,
        userId: session.user.id,
        ...payload,
      },
    });
    return { success: true, qualificationId: created.id };
  }
}

/**
 * Complete qualification and evaluate transparent recommendations.
 */
export async function completeQualificationAction(data: {
  primaryNeed: PrimaryHelpNeed;
  softwareAnswers: SoftwareAnswers;
  managedAnswers?: ManagedServiceAnswers | null;
  economicsAnswers?: EconomicsAnswers | null;
  isReassessment?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Authentication required.');
  const organizationId = (session as any).organizationId;
  if (!organizationId) throw new Error('Organization context missing.');

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true },
  });
  if (!org) throw new Error('Organization not found.');

  // 1. Evaluate Software Fit
  const softwareEval = evaluateSoftwareFit(data.softwareAnswers, DEFAULT_ENQUIRY_THRESHOLD);

  // 2. Evaluate Managed Service (if requested)
  let managedEval: any = null;
  let economicsEval: any = null;
  let boundedPilotSpec: any = null;

  const wantsManaged = data.primaryNeed === 'MANAGED_SALES_PRO' || data.primaryNeed === 'BOTH';
  if (wantsManaged && data.managedAnswers) {
    managedEval = evaluateManagedServiceScreening(data.managedAnswers, DEFAULT_CLOSER_THRESHOLD);

    if (data.economicsAnswers) {
      economicsEval = calculateEconomicsAssessment(data.economicsAnswers);
    }

    if (!economicsEval?.isCalculable || managedEval.recommendation === 'BOUNDED_PILOT_RECOMMENDED') {
      boundedPilotSpec = generateBoundedPilotSpec({
        businessName: org.name,
        enquiryRange: data.softwareAnswers.newEnquiries30dRange,
        currency: data.economicsAnswers?.currency || 'NGN',
      });
    }
  }

  // 3. Persist Qualification Record
  const saved = await db.workspaceQualification.create({
    data: {
      organizationId,
      userId: session.user.id,
      primaryNeed: data.primaryNeed,
      status: 'COMPLETED',
      currentStep: 5,
      isReassessment: !!data.isReassessment,
      completedAt: new Date(),

      // Software Answers
      newEnquiries30dExact: data.softwareAnswers.newEnquiries30dExact ?? null,
      newEnquiries30dRange: data.softwareAnswers.newEnquiries30dRange ?? null,
      newEnquiries30dType: data.softwareAnswers.newEnquiries30dType,
      olderOpportunitiesCount: data.softwareAnswers.olderOpportunitiesCount ?? null,
      olderOpportunitiesRange: data.softwareAnswers.olderOpportunitiesRange ?? null,
      olderOpportunitiesType: data.softwareAnswers.olderOpportunitiesType,
      whoFollowsUp: data.softwareAnswers.whoFollowsUp ?? null,
      whoFollowsUpDetail: data.softwareAnswers.whoFollowsUpDetail ?? null,
      howFollowUpChecked: JSON.stringify(data.softwareAnswers.howFollowUpChecked || []),
      howFollowUpCheckedDetail: data.softwareAnswers.howFollowUpCheckedDetail ?? null,
      forgottenEnquiryOption: data.softwareAnswers.forgottenEnquiryOption ?? null,
      forgottenEnquiryNarrative: data.softwareAnswers.forgottenEnquiryNarrative ?? null,
      forgottenEnquiryAftermath: data.softwareAnswers.forgottenEnquiryAftermath ?? null,
      difficulties: JSON.stringify(data.softwareAnswers.difficulties || []),
      difficultyFrequency: data.softwareAnswers.difficultyFrequency ?? null,

      // Software Evaluation
      rulesVersion: CURRENT_RULES_VERSION,
      configuredEnquiryThreshold: DEFAULT_ENQUIRY_THRESHOLD,
      configuredCloserThreshold: DEFAULT_CLOSER_THRESHOLD,
      softwareFit: softwareEval.category,
      softwareFitReason: softwareEval.reason,
      softwareFitAction: softwareEval.recommendedAction,

      // Managed Service Answers & Evaluation
      managedServiceNeed: data.managedAnswers?.managedServiceNeed ?? null,
      qualifiedConversations30dExact: data.managedAnswers?.qualifiedConversations30dExact ?? null,
      qualifiedConversations30dRange: data.managedAnswers?.qualifiedConversations30dRange ?? null,
      bookedConversationsNext30dExact: data.managedAnswers?.bookedConversationsNext30dExact ?? null,
      bookedConversationsNext30dRange: data.managedAnswers?.bookedConversationsNext30dRange ?? null,
      pipelineSuitableCount: data.managedAnswers?.pipelineSuitableCount ?? null,
      pipelineAgreedNextCallCount: data.managedAnswers?.pipelineAgreedNextCallCount ?? null,
      pipelineStagesSummary: data.managedAnswers?.pipelineStagesSummary ?? null,
      workloadTasksPerOpportunity: data.managedAnswers?.workloadTasksPerOpportunity ?? null,
      workloadChannels: JSON.stringify(data.managedAnswers?.workloadChannels || []),
      workloadAvgTaskDurationMinutes: data.managedAnswers?.workloadAvgTaskDurationMinutes ?? null,
      workloadCoverageHours: data.managedAnswers?.workloadCoverageHours ?? null,
      workloadExpectedResponseWindow: data.managedAnswers?.workloadExpectedResponseWindow ?? null,
      workloadLanguages: JSON.stringify(data.managedAnswers?.workloadLanguages || []),
      serviceRecommendation: managedEval?.recommendation ?? 'NOT_REQUESTED',
      serviceRecommendationReason: managedEval?.reason ?? null,

      // Economics Answers & Calculated Contribution
      currency: data.economicsAnswers?.currency || 'NGN',
      expectedAttributableSales: economicsEval?.expectedAttributableSales ?? null,
      grossProfitPerSale: economicsEval?.grossProfitPerSale ?? null,
      totalEngagementCost: economicsEval?.totalEngagementCost ?? null,
      fixedEngagementCost: economicsEval?.fixedCost ?? null,
      variableFeePerSale: data.economicsAnswers?.variableFeePerSale ?? null,
      estimatedContribution: economicsEval?.estimatedContribution ?? null,
      economicsEvidenceSource: data.economicsAnswers?.economicsEvidenceSource ?? null,
      historicalConversations: data.economicsAnswers?.historicalConversations ?? null,
      historicalSales: data.economicsAnswers?.historicalSales ?? null,
      historicalMeasurementPeriod: data.economicsAnswers?.historicalMeasurementPeriod ?? null,
      sameCohort: data.economicsAnswers?.sameCohort ?? null,
      dataLimitationNote: economicsEval?.caveatNotes?.join(' | ') ?? null,

      // Bounded Pilot
      boundedPilotQuestion: boundedPilotSpec?.question ?? null,
      boundedPilotScope: boundedPilotSpec?.scope ?? null,
      boundedPilotCapacity: boundedPilotSpec?.capacity ?? null,
      boundedPilotPeriod: boundedPilotSpec?.period ?? null,
      boundedPilotFee: boundedPilotSpec?.fee ?? null,
      boundedPilotReviewDate: boundedPilotSpec?.reviewDate ?? null,
      boundedPilotStopConditions: boundedPilotSpec?.stopConditions ? JSON.stringify(boundedPilotSpec.stopConditions) : null,
    },
  });

  // Outbox Telemetry Event (Opaque, zero PII, zero financial values)
  await db.outboxMessage.create({
    data: {
      organizationId,
      topic: 'qualification.completed',
      payload: JSON.stringify({
        qualificationId: saved.id,
        softwareFit: softwareEval.category,
        serviceRecommendation: managedEval?.recommendation || 'NOT_REQUESTED',
        isReassessment: !!data.isReassessment,
        timestamp: new Date().toISOString(),
      }),
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/today');

  return {
    success: true,
    qualificationId: saved.id,
    softwareFit: softwareEval.category,
    softwareFitReason: softwareEval.reason,
    softwareFitAction: softwareEval.recommendedAction,
    serviceRecommendation: managedEval?.recommendation || null,
    serviceRecommendationReason: managedEval?.reason || null,
    boundedPilot: boundedPilotSpec,
    economics: economicsEval,
  };
}

/**
 * Skip optional qualification and begin using the software immediately.
 * A low-volume business or any user can skip without friction, penalty or shaming.
 */
export async function skipQualificationAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Authentication required.');
  const organizationId = (session as any).organizationId;
  if (!organizationId) throw new Error('Organization context missing.');

  const created = await db.workspaceQualification.create({
    data: {
      organizationId,
      userId: session.user.id,
      primaryNeed: 'SOFTWARE_ORGANIZING',
      status: 'SKIPPED',
      currentStep: 1,
      softwareFit: 'EXPLORE_SOFTWARE_FIT',
      softwareFitReason: 'User elected to begin using software directly. Self-service starting path provided.',
      softwareFitAction: 'Try the workspace with a real enquiry and see whether it makes the next step easier to manage.',
      rulesVersion: CURRENT_RULES_VERSION,
      completedAt: new Date(),
    },
  });

  // Outbox event
  await db.outboxMessage.create({
    data: {
      organizationId,
      topic: 'qualification.skipped',
      payload: JSON.stringify({
        qualificationId: created.id,
        timestamp: new Date().toISOString(),
      }),
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/today');

  return { success: true };
}

/**
 * Fetch latest qualification record for active workspace.
 */
export async function getLatestQualificationAction() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const organizationId = (session as any).organizationId;
  if (!organizationId) return null;

  const record = await db.workspaceQualification.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });

  return record;
}

/**
 * Operator Review & Auditable Override.
 * Strictly restricted to operators and super admins.
 * Never overwrites historical record; preserves original result and rules version.
 */
export async function overrideQualificationAction(data: {
  qualificationId: string;
  newSoftwareFit?: string;
  newServiceRecommendation?: string;
  overrideReason: string;
  overrideEvidence: string;
  reviewerPrivateNotes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Authentication required.');

  // Check operator role
  const operatorUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true },
  });

  const isOperator = operatorUser?.role === 'OPERATOR' || operatorUser?.role === 'SUPER_ADMIN' || operatorUser?.email?.endsWith('@closecraft.com');
  if (!operatorUser || !isOperator) {
    throw new Error('Access denied: Only authorised Closecraft operators can override qualification determinations.');
  }

  if (!data.overrideReason || data.overrideReason.trim().length < 10) {
    throw new Error('A detailed operational override reason is required (minimum 10 characters).');
  }

  const existing = await db.workspaceQualification.findUnique({
    where: { id: data.qualificationId },
  });
  if (!existing) throw new Error('Qualification record not found.');

  const updated = await db.workspaceQualification.update({
    where: { id: data.qualificationId },
    data: {
      originalSoftwareFit: existing.originalSoftwareFit || existing.softwareFit,
      originalServiceRecommendation: existing.originalServiceRecommendation || existing.serviceRecommendation,
      softwareFit: data.newSoftwareFit || existing.softwareFit,
      serviceRecommendation: data.newServiceRecommendation || existing.serviceRecommendation,
      overriddenByUserId: session.user.id,
      overrideReason: data.overrideReason.trim(),
      overrideEvidence: data.overrideEvidence.trim(),
      overriddenAt: new Date(),
      reviewerPrivateNotes: data.reviewerPrivateNotes?.trim() || existing.reviewerPrivateNotes,
    },
  });

  // Audit log entry
  await db.auditLog.create({
    data: {
      organizationId: existing.organizationId,
      actorId: session.user.id,
      actorType: 'USER',
      actorRole: operatorUser.role,
      action: 'qualification.override',
      reason: data.overrideReason.trim(),
      resourceType: 'WorkspaceQualification',
      resourceId: existing.id,
      oldState: JSON.stringify({
        softwareFit: existing.softwareFit,
        serviceRecommendation: existing.serviceRecommendation,
      }),
      newState: JSON.stringify({
        softwareFit: updated.softwareFit,
        serviceRecommendation: updated.serviceRecommendation,
      }),
    },
  });

  revalidatePath('/operator');
  return { success: true, qualification: updated };
}
