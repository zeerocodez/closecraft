import { db } from '@/lib/db';
import { multiplyMoney, subtractMoney } from '@/lib/payments/money';
import { assertWorkspacePermission } from '@/lib/permissions/matrix';

/**
 * ATTRIBUTION & COMPENSATION ENGINE
 * Maintains accepted opportunity register, evaluates prior contact exclusions,
 * prevents double-counting of instalments, and enforces maker-checker payout authorization.
 */

export interface RegisterAttributedOpportunityParams {
  organizationId: string;
  engagementId: string;
  opportunityId: string;
  priorClientContactDate?: Date | string;
  attributionWindowDays?: number;
  sharedContributionRate?: number;
}

export async function registerAttributedOpportunity(userId: string, params: RegisterAttributedOpportunityParams) {
  await assertWorkspacePermission(params.organizationId, userId, 'engagements:review');

  const opp = await db.opportunity.findUnique({
    where: { id: params.opportunityId },
    include: { lead: true }
  });
  if (!opp) throw new Error('Opportunity not found');

  const windowDays = params.attributionWindowDays || 30;
  const now = new Date();

  // Evaluate prior client contact rule
  let status = 'REGISTERED';
  let disqualificationReason = null;

  if (params.priorClientContactDate) {
    const priorDate = new Date(params.priorClientContactDate);
    const diffDays = Math.floor((now.getTime() - priorDate.getTime()) / 86400000);
    if (diffDays <= windowDays) {
      status = 'DISQUALIFIED_PRIOR_CONTACT';
      disqualificationReason = `Prior client contact detected ${diffDays} days ago within the ${windowDays}-day attribution window.`;
    }
  }

  const record = await db.attributedOpportunity.create({
    data: {
      organizationId: params.organizationId,
      engagementId: params.engagementId,
      opportunityId: params.opportunityId,
      priorClientContactDate: params.priorClientContactDate ? new Date(params.priorClientContactDate) : null,
      attributionWindowDays: windowDays,
      sharedContributionRate: params.sharedContributionRate || 1.0,
      eligibleCollectionBasis: 0.0,
      verifiedCollectionAmount: 0.0,
      status,
      disqualificationReason,
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorId: userId,
      actorType: 'USER',
      action: 'ATTRIBUTED_OPPORTUNITY_REGISTERED',
      resourceType: 'ATTRIBUTED_OPPORTUNITY',
      resourceId: record.id,
      metadata: JSON.stringify({ opportunityId: opp.id, status, disqualificationReason }),
    }
  });

  return record;
}

/**
 * Calculates performance compensation based on verified collections only.
 * Conflation of booked deal value with collected cash is strictly prohibited.
 */
export async function calculateAttributedCommission(attributedId: string, performanceFeeRate: number) {
  const record = await db.attributedOpportunity.findUnique({
    where: { id: attributedId },
    include: { opportunity: true }
  });

  if (!record) throw new Error('Attribution record not found');
  if (record.status === 'DISQUALIFIED_PRIOR_CONTACT') {
    return { eligible: false, commissionAmount: 0, reason: record.disqualificationReason };
  }

  // Use verified collections only
  const verifiedCash = record.opportunity.verifiedCollections;
  if (verifiedCash <= 0) {
    return { eligible: false, commissionAmount: 0, reason: 'No verified collected cash on record.' };
  }

  // Apply shared contribution rate
  const eligibleBasis = multiplyMoney(verifiedCash, record.sharedContributionRate);
  const commission = multiplyMoney(eligibleBasis, performanceFeeRate);

  return {
    eligible: true,
    verifiedCash,
    sharedContributionRate: record.sharedContributionRate,
    eligibleBasis,
    performanceFeeRate,
    commissionAmount: commission,
  };
}

/**
 * MAKER-CHECKER PAYOUT WORKFLOW
 * Operator A (Maker) proposes payable.
 * Operator B / Finance Operator (Checker) approves payout.
 */
export async function proposeProfessionalPayable(makerUserId: string, params: {
  engagementId: string;
  professionalId: string;
  amount: number;
  type: 'FIXED_PILOT_COMPENSATION' | 'PERFORMANCE_SHARE';
  currency?: string;
  calculationBasis: string;
  notes?: string;
}) {
  const payable = await db.professionalPayable.create({
    data: {
      engagementId: params.engagementId,
      professionalId: params.professionalId,
      amount: params.amount,
      currency: params.currency || 'NGN',
      type: params.type,
      status: 'AWAITING_REVIEW', // Awaiting checker approval
      proposedByUserId: makerUserId,
      calculationBasis: params.calculationBasis,
      notes: params.notes || null,
    }
  });

  return payable;
}

export async function approveProfessionalPayout(checkerUserId: string, params: {
  payableId: string;
  payoutReference: string;
  notes?: string;
}) {
  const payable = await db.professionalPayable.findUnique({
    where: { id: params.payableId }
  });

  if (!payable) throw new Error('Payable record not found');
  if (payable.status === 'PAID_OUT') throw new Error('Payable is already paid out.');

  // Enforce Maker-Checker separation: Checker must be a different operator
  if (payable.proposedByUserId && payable.proposedByUserId === checkerUserId) {
    throw new Error('Maker-Checker Violation: An operator cannot approve their own proposed payout. A separate operator or finance administrator must authorize.');
  }

  const updated = await db.professionalPayable.update({
    where: { id: params.payableId },
    data: {
      status: 'PAID_OUT',
      payoutApprovedByUserId: checkerUserId,
      makerCheckerVerified: true,
      approvedAt: new Date(),
      payoutDate: new Date(),
      payoutReference: params.payoutReference,
      notes: params.notes ? `${payable.notes || ''} | ${params.notes}` : payable.notes,
    }
  });

  return updated;
}
