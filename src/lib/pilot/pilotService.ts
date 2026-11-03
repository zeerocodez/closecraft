import { db } from '@/lib/db';

export interface QuoteEconomicsInput {
  clientServicePrice: number;
  professionalCompensation: number;
  managementFee?: number;
  expectedOperatorEffortHours?: number;
  operatorHourlyCostRate?: number;
  directDeliveryCosts?: number;
  paymentFeePercentage?: number;
}

export interface QuoteEconomicsResult {
  clientServicePrice: number;
  professionalCompensation: number;
  managementFee: number;
  operatorCost: number;
  directDeliveryCosts: number;
  estimatedPaymentFees: number;
  expectedContribution: number;
  isNegativeContribution: boolean;
  warningMessage: string | null;
}

/**
 * Calculates contribution economics for the 30-day Follow-up Pilot.
 * Section 18: Client service price - (pro comp + operator internal effort + direct costs + payment fees).
 * Warns if expected contribution is negative.
 */
export function calculateQuoteEconomics(input: QuoteEconomicsInput): QuoteEconomicsResult {
  const clientPrice = Number(input.clientServicePrice) || 0;
  const proComp = Number(input.professionalCompensation) || 0;
  const operatorHours = Number(input.expectedOperatorEffortHours ?? 10.0);
  const operatorRate = Number(input.operatorHourlyCostRate ?? 3000.0);
  const operatorCost = Math.round(operatorHours * operatorRate);
  const directCosts = Number(input.directDeliveryCosts ?? 5000.0);
  const feePct = Number(input.paymentFeePercentage ?? 1.5) / 100;
  const estimatedPaymentFees = Math.round(clientPrice * feePct);

  // Suggested management fee default: 25% of professional compensation, min NGN 50,000
  const defaultMgmtFee = Math.max(50000, Math.round(proComp * 0.25));
  const managementFee = input.managementFee !== undefined ? Number(input.managementFee) : defaultMgmtFee;

  const totalCost = proComp + operatorCost + directCosts + estimatedPaymentFees;
  const expectedContribution = clientPrice - totalCost;
  const isNegativeContribution = expectedContribution < 0;

  const warningMessage = isNegativeContribution
    ? `Warning: Expected contribution is negative (₦${expectedContribution.toLocaleString()}). Costs (₦${totalCost.toLocaleString()}) exceed client price (₦${clientPrice.toLocaleString()}). An explicit override reason is required.`
    : null;

  return {
    clientServicePrice: clientPrice,
    professionalCompensation: proComp,
    managementFee,
    operatorCost,
    directDeliveryCosts: directCosts,
    estimatedPaymentFees,
    expectedContribution,
    isNegativeContribution,
    warningMessage,
  };
}

export interface ActivationPrerequisitesResult {
  canActivate: boolean;
  unmetPrerequisites: string[];
  checklist: {
    termsAccepted: boolean;
    professionalApproved: boolean;
    clientReadinessApproved: boolean;
    paymentVerified: boolean;
    materialsProvided: boolean;
    validStartDate: boolean;
  };
}

/**
 * Strict server-authoritative check of engagement activation prerequisites (Section 20).
 * Prerequisites:
 * 1. Accepted scope and terms
 * 2. Approved professional (Talent pool approval)
 * 3. Client-specific readiness (6 offer criteria)
 * 4. Required client materials
 * 5. Verified initial payment
 * 6. Valid start date
 */
export async function checkActivationPrerequisites(engagementId: string): Promise<ActivationPrerequisitesResult> {
  const engagement = await db.pilotEngagement.findUnique({
    where: { id: engagementId },
    include: {
      professional: true,
      organization: true,
    }
  });

  if (!engagement) {
    throw new Error('Engagement not found');
  }

  const unmet: string[] = [];

  // 1. Accepted scope and terms
  const termsAccepted = Boolean(engagement.isTermsAccepted && engagement.termsAcceptedAt);
  if (!termsAccepted) unmet.push('Scope and commercial terms must be accepted by an authorized client contact.');

  // 2. Approved professional
  const professionalApproved = Boolean(
    engagement.professionalId &&
    engagement.professional?.isPoolApproved &&
    engagement.isProfessionalApproved
  );
  if (!professionalApproved) unmet.push('A talent-pool approved sales professional must be assigned.');

  // 3. Client-specific readiness
  let clientReadinessApproved = Boolean(engagement.isClientReadinessApproved);
  if (engagement.professionalId && engagement.organizationId) {
    const specificReadiness = await db.clientOfferReadiness.findUnique({
      where: {
        professionalId_organizationId: {
          professionalId: engagement.professionalId,
          organizationId: engagement.organizationId,
        }
      }
    });

    const isAllCriteriaMet = Boolean(
      specificReadiness &&
      specificReadiness.salesBriefReviewed &&
      specificReadiness.practiceConversationPassed &&
      specificReadiness.objectionHandlingPassed &&
      specificReadiness.commercialBoundariesConfirmed &&
      specificReadiness.operatorAssessmentPassed &&
      specificReadiness.clientApprovalGranted
    );

    clientReadinessApproved = clientReadinessApproved && isAllCriteriaMet;
  }
  if (!clientReadinessApproved) unmet.push('Client-specific offer readiness must be completed and approved by both operator and client.');

  // 4. Required client materials
  const materialsProvided = Boolean(engagement.isMaterialsProvided);
  if (!materialsProvided) unmet.push('Required client sales materials (brief, pricing, FAQs) must be confirmed provided.');

  // 5. Verified payment
  const paymentVerified = Boolean(engagement.isPaymentVerified);
  if (!paymentVerified) unmet.push('Verified initial pilot payment collection must be confirmed.');

  // 6. Valid start date
  const validStartDate = Boolean(engagement.startDate);
  if (!validStartDate) unmet.push('A valid engagement start date must be scheduled.');

  const canActivate = termsAccepted && professionalApproved && clientReadinessApproved && materialsProvided && paymentVerified && validStartDate;

  return {
    canActivate,
    unmetPrerequisites: unmet,
    checklist: {
      termsAccepted,
      professionalApproved,
      clientReadinessApproved,
      paymentVerified,
      materialsProvided,
      validStartDate,
    }
  };
}

/**
 * Activates an engagement after verifying all prerequisites.
 */
export async function activateEngagement(engagementId: string, actorUserId: string) {
  const check = await checkActivationPrerequisites(engagementId);
  if (!check.canActivate) {
    throw new Error(`Cannot activate engagement. Unmet prerequisites: ${check.unmetPrerequisites.join('; ')}`);
  }

  const now = new Date();
  const engagement = await db.pilotEngagement.findUnique({ where: { id: engagementId } });
  if (!engagement) throw new Error('Engagement not found');

  const startDate = engagement.startDate || now;
  const isFuture = startDate > now;
  const status = isFuture ? 'SCHEDULED' : 'ACTIVE';
  const endDate = engagement.endDate || new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const updated = await db.pilotEngagement.update({
    where: { id: engagementId },
    data: {
      status,
      activatedAt: isFuture ? null : now,
      startDate,
      endDate,
    }
  });

  // Assign external professional membership to client workspace with EXTERNAL_PROFESSIONAL role
  if (engagement.professionalId) {
    const prof = await db.professionalProfile.findUnique({ where: { id: engagement.professionalId } });
    if (prof?.userId) {
      await db.organizationMember.upsert({
        where: {
          userId_organizationId: {
            userId: prof.userId,
            organizationId: engagement.organizationId,
          }
        },
        update: {
          role: 'EXTERNAL_PROFESSIONAL',
          isAvailable: true,
        },
        create: {
          userId: prof.userId,
          organizationId: engagement.organizationId,
          role: 'EXTERNAL_PROFESSIONAL',
          isAvailable: true,
        }
      });
    }
  }

  // Ensure workspace subscription includes software access during pilot
  await db.workspaceSubscription.upsert({
    where: { organizationId: engagement.organizationId },
    update: {
      status: 'PILOT_INCLUDED',
      activePilotEngagementId: engagementId,
      paidThroughDate: endDate,
    },
    create: {
      organizationId: engagement.organizationId,
      status: 'PILOT_INCLUDED',
      trialStartedAt: now,
      trialEndsAt: now,
      activePilotEngagementId: engagementId,
      paidThroughDate: endDate,
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: engagement.organizationId,
      actorId: actorUserId,
      actorType: 'USER',
      action: 'PILOT_ENGAGEMENT_ACTIVATED',
      resourceType: 'PILOT_ENGAGEMENT',
      resourceId: engagementId,
      newState: JSON.stringify({ status, startDate, endDate }),
    }
  });

  return updated;
}

/**
 * Records immutable terms acceptance.
 */
export async function recordTermsAcceptance(
  engagementId: string,
  userId: string,
  signerIp: string,
  termsSnapshotText: string
) {
  const engagement = await db.pilotEngagement.findUnique({ where: { id: engagementId } });
  if (!engagement) throw new Error('Engagement not found');

  const now = new Date();
  const nextVersion = engagement.termsVersion + 1;

  const updated = await db.pilotEngagement.update({
    where: { id: engagementId },
    data: {
      isTermsAccepted: true,
      termsVersion: nextVersion,
      termsAcceptedAt: now,
      termsAcceptedByUserId: userId,
      termsSignerIp: signerIp,
      termsTextSnapshot: termsSnapshotText,
      status: engagement.status === 'DRAFT' || engagement.status === 'AWAITING_ACCEPTANCE'
        ? (engagement.isPaymentVerified ? 'AWAITING_READINESS' : 'AWAITING_PAYMENT')
        : engagement.status,
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: engagement.organizationId,
      actorId: userId,
      actorType: 'USER',
      action: 'ENGAGEMENT_TERMS_ACCEPTED',
      resourceType: 'PILOT_ENGAGEMENT',
      resourceId: engagementId,
      newState: JSON.stringify({ version: nextVersion, acceptedAt: now, signerIp })
    }
  });

  return updated;
}

/**
 * Logs professional or operator effort against engagement capacity.
 */
export async function logWorkEffort(params: {
  engagementId: string;
  userId: string;
  actorRole: 'PROFESSIONAL' | 'OPERATOR';
  hoursSpent: number;
  activityDescription: string;
  leadsWorkedCount?: number;
}) {
  const engagement = await db.pilotEngagement.findUnique({ where: { id: params.engagementId } });
  if (!engagement) throw new Error('Engagement not found');

  const log = await db.pilotWorkLog.create({
    data: {
      engagementId: params.engagementId,
      loggedByUserId: params.userId,
      actorRole: params.actorRole,
      hoursSpent: params.hoursSpent,
      activityDescription: params.activityDescription,
      leadsWorkedCount: params.leadsWorkedCount || 0,
    }
  });

  // Calculate new total capacity used (only counting professional hours towards client allowance)
  if (params.actorRole === 'PROFESSIONAL') {
    const totalLogs = await db.pilotWorkLog.findMany({
      where: { engagementId: params.engagementId, actorRole: 'PROFESSIONAL' },
      select: { hoursSpent: true }
    });

    const totalHours = totalLogs.reduce((acc, l) => acc + l.hoursSpent, 0);
    const isOverCapacity = totalHours >= engagement.agreedCapacity;

    await db.pilotEngagement.update({
      where: { id: params.engagementId },
      data: {
        usedCapacity: totalHours,
        isOverCapacity,
        overCapacityNotifiedAt: isOverCapacity && !engagement.isOverCapacity ? new Date() : engagement.overCapacityNotifiedAt,
      }
    });
  }

  return log;
}

/**
 * Creates or updates an explicit client blocker ("Waiting on client").
 */
export async function createClientBlocker(params: {
  organizationId: string;
  leadId?: string;
  engagementId?: string;
  whatIsNeeded: string;
  whoMustRespond: string;
  requiredResponseDate: Date;
  affectedNextAction?: string;
}) {
  const blocker = await db.clientBlocker.create({
    data: {
      organizationId: params.organizationId,
      leadId: params.leadId || null,
      engagementId: params.engagementId || null,
      whatIsNeeded: params.whatIsNeeded,
      whoMustRespond: params.whoMustRespond,
      requiredResponseDate: params.requiredResponseDate,
      affectedNextAction: params.affectedNextAction || null,
      status: 'OPEN',
    }
  });

  // If tied to lead, update lead blockerStatus
  if (params.leadId) {
    await db.lead.update({
      where: { id: params.leadId },
      data: { blockerStatus: 'WAITING_ON_CLIENT' }
    });
  }

  return blocker;
}

export async function resolveClientBlocker(blockerId: string, userId: string, resolutionNotes: string) {
  const blocker = await db.clientBlocker.findUnique({ where: { id: blockerId } });
  if (!blocker) throw new Error('Blocker not found');

  const resolved = await db.clientBlocker.update({
    where: { id: blockerId },
    data: {
      status: 'RESOLVED',
      resolutionNotes,
      resolvedAt: new Date(),
      resolvedByUserId: userId,
    }
  });

  if (blocker.leadId) {
    // Check if there are other open blockers on this lead
    const otherOpen = await db.clientBlocker.count({
      where: { leadId: blocker.leadId, status: 'OPEN', id: { not: blockerId } }
    });
    if (otherOpen === 0) {
      await db.lead.update({
        where: { id: blocker.leadId },
        data: { blockerStatus: 'NONE' }
      });
    }
  }

  return resolved;
}

/**
 * Executes continuity and handover workflow.
 * Prompt Section 21 & 22:
 * - Identify open opportunities and outstanding tasks
 * - Assign temporary responsibility
 * - Summarise buyer commitments and unresolved issues
 * - Revoke professional access promptly
 * - Record client acknowledgement
 */
export async function executeContinuityHandover(params: {
  engagementId: string;
  type: 'MID_PILOT_CONTINUITY' | 'ENGAGEMENT_COMPLETION' | 'POST_SALE_CLIENT_HANDOVER';
  temporaryOwnerUserId?: string;
  openTasksSummary?: string;
  buyerExpectations?: string;
  agreedScope?: string;
  agreedValue?: number;
  deliveryOwner?: string;
  nextDeliveryStep?: string;
  notes?: string;
  actorUserId: string;
}) {
  const engagement = await db.pilotEngagement.findUnique({
    where: { id: params.engagementId },
    include: { professional: true, assignedLeads: true }
  });

  if (!engagement) throw new Error('Engagement not found');

  const now = new Date();

  // 1. Reassign assigned leads if temporaryOwnerUserId provided
  if (params.temporaryOwnerUserId) {
    await db.lead.updateMany({
      where: { pilotEngagementId: params.engagementId },
      data: { assignedUserId: params.temporaryOwnerUserId }
    });
  }

  // 2. Revoke external professional workspace membership if continuity or completion
  let revoked = false;
  if (params.type !== 'POST_SALE_CLIENT_HANDOVER' && engagement.professional?.userId) {
    await db.organizationMember.deleteMany({
      where: {
        userId: engagement.professional.userId,
        organizationId: engagement.organizationId,
        role: 'EXTERNAL_PROFESSIONAL',
      }
    });
    revoked = true;
  }

  // 3. Create Handover record
  const handover = await db.pilotHandover.create({
    data: {
      engagementId: params.engagementId,
      type: params.type,
      agreedScope: params.agreedScope || engagement.offerRepresented,
      agreedValue: params.agreedValue,
      buyerExpectations: params.buyerExpectations,
      deliveryOwner: params.deliveryOwner,
      nextDeliveryStep: params.nextDeliveryStep,
      openTasksSummary: params.openTasksSummary,
      temporaryOwnerUserId: params.temporaryOwnerUserId || null,
      professionalAccessRevoked: revoked,
      professionalAccessRevokedAt: revoked ? now : null,
    }
  });

  // If engagement completed, update status to ENDED
  if (params.type === 'ENGAGEMENT_COMPLETION') {
    await db.pilotEngagement.update({
      where: { id: params.engagementId },
      data: { status: 'ENDED' }
    });
  }

  await db.auditLog.create({
    data: {
      organizationId: engagement.organizationId,
      actorId: params.actorUserId,
      actorType: 'USER',
      action: 'PILOT_CONTINUITY_HANDOVER_EXECUTED',
      resourceType: 'PILOT_ENGAGEMENT',
      resourceId: params.engagementId,
      newState: JSON.stringify({ type: params.type, handoverId: handover.id, accessRevoked: revoked })
    }
  });

  return handover;
}

/**
 * Acknowledges a handover by authorized client contact.
 */
export async function acknowledgeHandover(handoverId: string, clientUserId: string) {
  const handover = await db.pilotHandover.findUnique({
    where: { id: handoverId },
    include: { engagement: true }
  });

  if (!handover) throw new Error('Handover record not found');

  const updated = await db.pilotHandover.update({
    where: { id: handoverId },
    data: {
      clientAcknowledged: true,
      clientAcknowledgedAt: new Date(),
      clientAcknowledgedByUserId: clientUserId,
    }
  });

  return updated;
}

// -----------------------------------------------------------------------------
// COMMERCIAL SUITABILITY ASSESSMENT & PIPELINE VOLUME SCREENING
// -----------------------------------------------------------------------------

export interface CommercialSuitabilityInput {
  approxMonthlyEnquiries: number;
  approxMonthlyQualifiedConversations: number;
  approxOpenOpportunities: number;
  typicalDealValue: number;
  grossProfitMarginPercent: number; // e.g. 50 for 50%
  expectedAttributableSalesCount?: number;
  serviceType: 'ENQUIRY_TRIAGE' | 'APPOINTMENT_SETTING' | 'SALES_CLOSING' | 'FULL_MANAGED_PILOT';
  proposedTotalCost: number;
}

export interface CommercialSuitabilityResult {
  isSuitableForDedicatedClosing: boolean;
  qualifiedConversationsGuidelineMet: boolean;
  recommendedServiceScope: 'DEDICATED_CLOSING' | 'BOUNDED_PART_TIME' | 'APPOINTMENT_SETTING_FIRST' | 'HUMAN_OPERATOR_REVIEW';
  projectedGrossProfit: number;
  netAttributableReturn: number;
  isCommerciallyPositive: boolean;
  screeningRationale: string;
  volumeDiscrepancies: {
    rawEnquiries: number;
    qualifiedConversations: number;
    openOpportunities: number;
  };
}

/**
 * Reviews commercial suitability using client evidence (Section 7):
 * Formula: (Expected attributable sales * gross profit per sale) - total engagement cost.
 * Screen: ~20 qualified conversations/month for dedicated closing.
 * Lower volume routes to bounded/part-time support or human review rather than automatic rejection.
 */
export function calculateCommercialSuitability(input: CommercialSuitabilityInput): CommercialSuitabilityResult {
  const enquiries = Number(input.approxMonthlyEnquiries) || 0;
  const qualifiedConversations = Number(input.approxMonthlyQualifiedConversations) || 0;
  const opportunities = Number(input.approxOpenOpportunities) || 0;
  const dealValue = Number(input.typicalDealValue) || 0;
  const marginPct = (Number(input.grossProfitMarginPercent) || 50) / 100;
  const grossProfitPerSale = dealValue * marginPct;

  // Screening guideline: ~20 qualified conversations per month for dedicated closing
  const qualifiedConversationsGuidelineMet = qualifiedConversations >= 20;

  // Expected attributable sales (conservative benchmark: 10% - 20% conversion from qualified conversations if not explicitly supplied)
  const estimatedSales = input.expectedAttributableSalesCount !== undefined
    ? Number(input.expectedAttributableSalesCount)
    : Math.max(1, Math.round(qualifiedConversations * 0.15));

  const projectedGrossProfit = Math.round(estimatedSales * grossProfitPerSale);
  const totalCost = Number(input.proposedTotalCost) || 150000;
  const netAttributableReturn = projectedGrossProfit - totalCost;
  const isCommerciallyPositive = netAttributableReturn > 0;

  let recommendedServiceScope: CommercialSuitabilityResult['recommendedServiceScope'] = 'HUMAN_OPERATOR_REVIEW';
  let screeningRationale = '';

  if (qualifiedConversationsGuidelineMet && isCommerciallyPositive) {
    recommendedServiceScope = 'DEDICATED_CLOSING';
    screeningRationale = `Volume of ${qualifiedConversations} qualified conversations/mo exceeds the 20/mo guideline. Economics project positive net return (₦${netAttributableReturn.toLocaleString()}).`;
  } else if (qualifiedConversations < 20 && enquiries >= 20) {
    recommendedServiceScope = 'APPOINTMENT_SETTING_FIRST';
    screeningRationale = `Inbound raw enquiry volume is solid (${enquiries}/mo), but qualified conversations (${qualifiedConversations}/mo) are below the 20/mo threshold. Dedicated SDR appointment setting recommended to build qualified deal flow before assigning a dedicated closer.`;
  } else if (qualifiedConversations > 0 && qualifiedConversations < 20) {
    recommendedServiceScope = 'BOUNDED_PART_TIME';
    screeningRationale = `Pipeline volume is below 20 qualified conversations/mo (${qualifiedConversations}/mo). Bounded part-time follow-up support is commercially appropriate instead of a dedicated full-time closing commitment.`;
  } else {
    recommendedServiceScope = 'HUMAN_OPERATOR_REVIEW';
    screeningRationale = 'Insufficient historical conversion evidence. Routing to Closecraft operator review for discovery consultation.';
  }

  return {
    isSuitableForDedicatedClosing: qualifiedConversationsGuidelineMet && input.serviceType === 'SALES_CLOSING',
    qualifiedConversationsGuidelineMet,
    recommendedServiceScope,
    projectedGrossProfit,
    netAttributableReturn,
    isCommerciallyPositive,
    screeningRationale,
    volumeDiscrepancies: {
      rawEnquiries: enquiries,
      qualifiedConversations,
      openOpportunities: opportunities,
    }
  };
}

// -----------------------------------------------------------------------------
// STRICT LIFECYCLE STATE MACHINE (Section 8)
// -----------------------------------------------------------------------------

export const ALLOWED_ENGAGEMENT_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['AWAITING_ACCEPTANCE', 'CANCELLED'],
  AWAITING_ACCEPTANCE: ['AWAITING_PAYMENT', 'AWAITING_READINESS', 'DRAFT', 'CANCELLED'],
  AWAITING_PAYMENT: ['AWAITING_READINESS', 'SCHEDULED', 'ACTIVE', 'CANCELLED'],
  AWAITING_READINESS: ['SCHEDULED', 'ACTIVE', 'CANCELLED'],
  SCHEDULED: ['ACTIVE', 'PAUSED', 'CANCELLED'],
  ACTIVE: ['PAUSED', 'ENDING', 'ENDED', 'CANCELLED'],
  PAUSED: ['ACTIVE', 'ENDING', 'ENDED', 'CANCELLED'],
  ENDING: ['ENDED', 'CANCELLED'],
  ENDED: [], // Terminal
  CANCELLED: [], // Terminal
};

/**
 * Server-authoritative transition function.
 * Validates allowed transitions, prerequisites, and logs audits.
 */
export async function transitionEngagementState(params: {
  engagementId: string;
  nextStatus: string;
  actorUserId: string;
  reason?: string;
}) {
  const engagement = await db.pilotEngagement.findUnique({
    where: { id: params.engagementId },
    include: {
      professional: true,
      assignedLeads: true,
    }
  });

  if (!engagement) {
    throw new Error(`Engagement with ID ${params.engagementId} not found.`);
  }

  const currentStatus = engagement.status;
  const allowed = ALLOWED_ENGAGEMENT_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(params.nextStatus)) {
    throw new Error(
      `Invalid state transition: Cannot transition engagement from '${currentStatus}' to '${params.nextStatus}'. Allowed transitions from '${currentStatus}' are: [${allowed.join(', ')}].`
    );
  }

  // If transitioning to ACTIVE or SCHEDULED, verify all 6 activation prerequisites
  if (params.nextStatus === 'ACTIVE' || params.nextStatus === 'SCHEDULED') {
    const prereqs = await checkActivationPrerequisites(params.engagementId);
    if (!prereqs.canActivate) {
      throw new Error(
        `Activation prerequisites not met: ${prereqs.unmetPrerequisites.join('; ')}`
      );
    }
  }

  const now = new Date();
  const updateData: any = {
    status: params.nextStatus,
  };

  if (params.nextStatus === 'ACTIVE' && !engagement.activatedAt) {
    updateData.activatedAt = now;
    if (!engagement.startDate) updateData.startDate = now;
    if (!engagement.endDate) updateData.endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  // When pausing an engagement, flag unfinished leads for supervisor review
  let pausedAffectedLeadsCount = 0;
  if (params.nextStatus === 'PAUSED') {
    const openLeads = await db.lead.findMany({
      where: {
        pilotEngagementId: params.engagementId,
        status: { in: ['NEW', 'ENGAGED', 'QUALIFYING', 'FOLLOW_UP'] }
      }
    });
    pausedAffectedLeadsCount = openLeads.length;
  }

  const updated = await db.pilotEngagement.update({
    where: { id: params.engagementId },
    data: updateData,
  });

  await db.auditLog.create({
    data: {
      organizationId: engagement.organizationId,
      actorId: params.actorUserId,
      actorType: 'USER',
      action: 'ENGAGEMENT_STATE_TRANSITION',
      resourceType: 'PILOT_ENGAGEMENT',
      resourceId: params.engagementId,
      oldState: currentStatus,
      newState: params.nextStatus,
      reason: params.reason || null,
      metadata: JSON.stringify({
        pausedAffectedLeadsCount,
        transitionedAt: now.toISOString(),
      })
    }
  });

  return {
    engagement: updated,
    previousStatus: currentStatus,
    newStatus: params.nextStatus,
    pausedAffectedLeadsCount,
  };
}

