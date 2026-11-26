import { db } from '@/lib/db';
import { DEFAULT_COMMISSION_TIERS } from '@/lib/billing/catalog';
import { assertWorkspacePermission } from '@/lib/permissions/matrix';

export type AgreementServiceType =
  | 'APPOINTMENT_SETTING'
  | 'SALES_CLOSING'
  | 'COMBINED'
  | 'DEDICATED_TEAM';

export type CommissionModelType = 'PERCENTAGE' | 'FIXED' | 'TIERED' | 'SPLIT';

export type CommissionRecordStatus =
  | 'PENDING'
  | 'QUALIFIED'
  | 'APPROVED'
  | 'PAYABLE'
  | 'PAID'
  | 'REVERSED'
  | 'DISPUTED';

export interface CreateSalesAgreementInput {
  organizationId: string;
  representativeUserId?: string;
  serviceType: AgreementServiceType;
  businessDetails: string;
  productDescription: string;
  productPricing: string;
  grossMarginPercent?: number;
  targetCustomerProfile: string;
  salesProcess: string;
  qualificationCriteria: string;
  commissionModel?: CommissionModelType;
  appointmentSettingRate?: number;
  closingRate?: number;
  combinedRate?: number;
  fixedCommissionAmount?: number;
  monthlyRetainerAmount?: number;
  currency?: string;
  attributionWindowDays?: number;
  attributionRules?: string;
  settlementTerms: string;
}

export async function createSalesEngagementAgreement(userId: string, input: CreateSalesAgreementInput) {
  await assertWorkspacePermission(input.organizationId, userId, 'engagements:review');

  const requiredFields = [
    ['businessDetails', input.businessDetails],
    ['productDescription', input.productDescription],
    ['productPricing', input.productPricing],
    ['targetCustomerProfile', input.targetCustomerProfile],
    ['salesProcess', input.salesProcess],
    ['qualificationCriteria', input.qualificationCriteria],
    ['settlementTerms', input.settlementTerms],
  ];

  for (const [field, val] of requiredFields) {
    if (!val || String(val).trim().length < 3) {
      throw new Error(`Sales engagement setup requires "${field}" before execution.`);
    }
  }

  const tierDefault = DEFAULT_COMMISSION_TIERS.find((t) => t.serviceType === input.serviceType);
  const settingRate = input.appointmentSettingRate ?? (input.serviceType === 'APPOINTMENT_SETTING' ? 3.5 : 2.5);
  const closeRate = input.closingRate ?? (input.serviceType === 'SALES_CLOSING' ? 7.5 : 6.0);
  const combined = input.combinedRate ?? (input.serviceType === 'COMBINED' ? 10.0 : settingRate + closeRate);

  const agreement = await db.salesEngagementAgreement.create({
    data: {
      organizationId: input.organizationId,
      representativeUserId: input.representativeUserId || null,
      serviceType: input.serviceType,
      status: 'PENDING_APPROVAL',
      businessDetails: input.businessDetails.trim(),
      productDescription: input.productDescription.trim(),
      productPricing: input.productPricing.trim(),
      grossMarginPercent: input.grossMarginPercent ?? null,
      targetCustomerProfile: input.targetCustomerProfile.trim(),
      salesProcess: input.salesProcess.trim(),
      qualificationCriteria: input.qualificationCriteria.trim(),
      commissionModel: input.commissionModel || 'PERCENTAGE',
      appointmentSettingRate: settingRate,
      closingRate: closeRate,
      combinedRate: combined,
      fixedCommissionAmount: input.fixedCommissionAmount ?? null,
      monthlyRetainerAmount: input.monthlyRetainerAmount ?? tierDefault?.defaultRetainerNgn ?? null,
      currency: input.currency || 'NGN',
      attributionWindowDays: input.attributionWindowDays || 30,
      attributionRules: input.attributionRules?.trim() || '30-day verified payment attribution window excluding prior client contact.',
      settlementTerms: input.settlementTerms.trim(),
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: input.organizationId,
      actorId: userId,
      actorType: 'USER',
      action: 'SALES_AGREEMENT_CREATED',
      resourceType: 'SALES_AGREEMENT',
      resourceId: agreement.id,
      newState: JSON.stringify({
        serviceType: agreement.serviceType,
        commissionModel: agreement.commissionModel,
        combinedRate: agreement.combinedRate,
      }),
    },
  });

  return agreement;
}

/**
 * Calculates and records commission ONLY on verified payments actually received.
 * Never automatically releases commission merely because a deal is marked WON.
 */
export async function recordVerifiedSaleCommission(params: {
  organizationId: string;
  agreementId: string;
  representativeUserId: string;
  leadId?: string;
  dealId?: string;
  invoiceId: string;
  commissionType: 'APPOINTMENT_SETTING' | 'CLOSING' | 'COMBINED' | 'SPLIT' | 'RETAINER';
  verifiedPaymentAmount: number;
  proposedById: string;
  splitSharePercent?: number; // e.g. 50% split if SPLIT
}) {
  if (!params.invoiceId) {
    throw new Error('A verified payment invoiceId is mandatory before commission accrual.');
  }

  const invoice = await db.bachsInvoice.findUnique({ where: { id: params.invoiceId } });
  if (!invoice || invoice.organizationId !== params.organizationId) {
    throw new Error('Verified payment invoice not found for this organization.');
  }
  if (!['PAID', 'CONFIRMED', 'FUNDS_AVAILABLE'].includes(invoice.status)) {
    throw new Error('Commission cannot be released: customer payment has not been verified.');
  }

  const agreement = await db.salesEngagementAgreement.findUnique({
    where: { id: params.agreementId },
  });
  if (!agreement || agreement.organizationId !== params.organizationId) {
    throw new Error('Commission agreement not found for this tenant.');
  }
  if (agreement.status !== 'ACTIVE' && agreement.status !== 'PENDING_APPROVAL') {
    throw new Error(`Agreement is ${agreement.status}; cannot accrue commissions.`);
  }

  const verifiedCash = Math.min(invoice.amount, Math.max(0, Number(params.verifiedPaymentAmount) || invoice.amount));
  if (verifiedCash <= 0) {
    throw new Error('Verified payment amount must be positive.');
  }

  let ratePercent = 0;
  let commissionAmount = 0;

  if (agreement.commissionModel === 'FIXED' && agreement.fixedCommissionAmount) {
    commissionAmount = agreement.fixedCommissionAmount;
  } else {
    if (params.commissionType === 'APPOINTMENT_SETTING') {
      ratePercent = agreement.appointmentSettingRate;
    } else if (params.commissionType === 'CLOSING') {
      ratePercent = agreement.closingRate;
    } else if (params.commissionType === 'COMBINED') {
      ratePercent = agreement.combinedRate;
    } else if (params.commissionType === 'SPLIT') {
      const share = (params.splitSharePercent ?? 50) / 100;
      ratePercent = Math.round(agreement.combinedRate * share * 100) / 100;
    } else if (params.commissionType === 'RETAINER') {
      commissionAmount = agreement.monthlyRetainerAmount || 0;
    }

    if (ratePercent > 0) {
      commissionAmount = Math.round(((verifiedCash * ratePercent) / 100) * 100) / 100;
    }
  }

  const record = await db.salesCommissionRecord.create({
    data: {
      organizationId: params.organizationId,
      agreementId: agreement.id,
      representativeUserId: params.representativeUserId,
      leadId: params.leadId || null,
      dealId: params.dealId || null,
      invoiceId: invoice.id,
      commissionType: params.commissionType,
      verifiedPaymentAmount: verifiedCash,
      commissionRatePercent: ratePercent,
      commissionAmount,
      currency: invoice.currency || agreement.currency,
      status: 'QUALIFIED', // Verified payment exists, awaiting manager approval
      proposedById: params.proposedById,
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorId: params.proposedById,
      actorType: 'USER',
      action: 'COMMISSION_QUALIFIED_ON_VERIFIED_PAYMENT',
      resourceType: 'SALES_COMMISSION',
      resourceId: record.id,
      newState: JSON.stringify({
        invoiceId: invoice.id,
        verifiedCash,
        commissionAmount,
        ratePercent,
        status: 'QUALIFIED',
      }),
    },
  });

  return record;
}

export async function transitionCommissionStatus(params: {
  commissionId: string;
  actorId: string;
  nextStatus: CommissionRecordStatus;
  payoutReference?: string;
  reason?: string;
}) {
  const rec = await db.salesCommissionRecord.findUnique({
    where: { id: params.commissionId },
  });
  if (!rec) throw new Error('Commission record not found.');

  // Enforce Maker-Checker separation for PAYABLE/PAID approval
  if ((params.nextStatus === 'APPROVED' || params.nextStatus === 'PAYABLE' || params.nextStatus === 'PAID') && rec.proposedById === params.actorId) {
    throw new Error('Maker-Checker Violation: A separate administrator must approve or pay out a proposed commission.');
  }

  if (params.nextStatus === 'PAID' && !params.payoutReference) {
    throw new Error('A payoutReference is required to mark commission as PAID.');
  }

  const updated = await db.salesCommissionRecord.update({
    where: { id: rec.id },
    data: {
      status: params.nextStatus,
      ...(params.nextStatus === 'APPROVED' || params.nextStatus === 'PAYABLE' ? { approvedById: params.actorId } : {}),
      ...(params.nextStatus === 'PAID' ? { payoutReference: params.payoutReference, paidAt: new Date(), approvedById: rec.approvedById || params.actorId } : {}),
      ...(params.nextStatus === 'DISPUTED' ? { disputeReason: params.reason || 'Under review' } : {}),
      ...(params.nextStatus === 'REVERSED' ? { reversalReason: params.reason || 'Refund / chargeback reversal' } : {}),
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: rec.organizationId,
      actorId: params.actorId,
      actorType: 'ADMIN',
      action: `COMMISSION_${params.nextStatus}`,
      resourceType: 'SALES_COMMISSION',
      resourceId: rec.id,
      oldState: JSON.stringify({ status: rec.status }),
      newState: JSON.stringify({ status: params.nextStatus, reason: params.reason, payoutReference: params.payoutReference }),
    },
  });

  return updated;
}

export async function reverseCommissionsForRefundedInvoice(invoiceId: string, reason: string = 'Customer payment refunded or charged back') {
  const records = await db.salesCommissionRecord.findMany({
    where: {
      invoiceId,
      status: { notIn: ['REVERSED'] },
    },
  });

  for (const r of records) {
    await db.salesCommissionRecord.update({
      where: { id: r.id },
      data: {
        status: 'REVERSED',
        reversalReason: reason,
      },
    });
  }

  return records.length;
}
