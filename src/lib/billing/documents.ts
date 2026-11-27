import { db } from '@/lib/db';

export interface PromoValidationResult {
  valid: boolean;
  code?: string;
  promoId?: string;
  discountType?: string;
  discountValue?: number;
  discountAmount: number;
  finalAmount: number;
  reason?: string;
}

export async function validatePromotionalCode(params: {
  code: string;
  planCode: string;
  currency: string;
  subtotalAmount: number;
}): Promise<PromoValidationResult> {
  const cleanCode = params.code.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, discountAmount: 0, finalAmount: params.subtotalAmount, reason: 'Empty code' };
  }

  const promo = await db.promotionalCode.findUnique({
    where: { code: cleanCode },
  });

  if (!promo || !promo.isActive) {
    return { valid: false, discountAmount: 0, finalAmount: params.subtotalAmount, reason: 'Promotional code is invalid or inactive.' };
  }

  const now = new Date();
  if (promo.validFrom > now) {
    return { valid: false, discountAmount: 0, finalAmount: params.subtotalAmount, reason: 'Promotional code is not yet active.' };
  }
  if (promo.validUntil && promo.validUntil < now) {
    return { valid: false, discountAmount: 0, finalAmount: params.subtotalAmount, reason: 'Promotional code has expired.' };
  }
  if (promo.maxRedemptions !== null && promo.redemptionsCount >= promo.maxRedemptions) {
    return { valid: false, discountAmount: 0, finalAmount: params.subtotalAmount, reason: 'Promotional code redemption limit reached.' };
  }
  if (promo.applicablePlans.length > 0 && !promo.applicablePlans.includes(params.planCode.toUpperCase())) {
    return { valid: false, discountAmount: 0, finalAmount: params.subtotalAmount, reason: `Code applies only to: ${promo.applicablePlans.join(', ')}.` };
  }
  if (promo.discountType === 'FIXED' && promo.currency && promo.currency.toUpperCase() !== params.currency.toUpperCase()) {
    return { valid: false, discountAmount: 0, finalAmount: params.subtotalAmount, reason: `Code applies only to ${promo.currency} invoices.` };
  }

  let discountAmount = 0;
  if (promo.discountType === 'PERCENTAGE') {
    discountAmount = Math.round(((params.subtotalAmount * promo.discountValue) / 100) * 100) / 100;
  } else {
    discountAmount = Math.min(params.subtotalAmount, promo.discountValue);
  }

  const finalAmount = Math.max(0, Math.round((params.subtotalAmount - discountAmount) * 100) / 100);

  return {
    valid: true,
    code: promo.code,
    promoId: promo.id,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discountAmount,
    finalAmount,
  };
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function generateReceiptNumber(invoiceNumber: string): string {
  return `CC-RCPT-${invoiceNumber.replace(/^INV-|^CC-INV-/, '')}`;
}

export function buildFinancialDocumentDto(invoice: any, orgName?: string) {
  let metadata: any = {};
  try {
    metadata = typeof invoice.metadata === 'string' ? JSON.parse(invoice.metadata) : (invoice.metadata || {});
  } catch {}

  let lineItems: InvoiceLineItem[] = [];
  try {
    if (invoice.lineItemsJson) {
      lineItems = JSON.parse(invoice.lineItemsJson);
    }
  } catch {}

  if (lineItems.length === 0) {
    lineItems = [
      {
        description: metadata.description || `${invoice.type.replace(/_/g, ' ')} (${invoice.billingInterval || '30 Days'})`,
        quantity: 1,
        unitPrice: invoice.subtotalAmount ?? invoice.amount,
        total: invoice.subtotalAmount ?? invoice.amount,
      },
    ];
  }

  const isPaid = ['PAID', 'CONFIRMED', 'FUNDS_AVAILABLE'].includes(invoice.status);

  return {
    documentKind: isPaid ? 'RECEIPT' : 'INVOICE',
    brand: {
      name: 'CloseCraft HQ',
      legalEntity: 'Zeerocodes Automation Limited',
      registration: 'RC 8181339',
      supportEmail: 'billing@closecrafthq.com',
      website: 'https://www.closecrafthq.com',
    },
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    receiptNumber: isPaid ? invoice.receiptNumber || generateReceiptNumber(invoice.invoiceNumber) : null,
    status: invoice.status,
    type: invoice.type,
    customer: {
      organizationName: orgName || metadata.organizationName || 'CloseCraft Customer Workspace',
      contactName: invoice.customerName || 'Workspace Owner',
      contactEmail: invoice.customerEmail || '',
    },
    currency: invoice.currency || 'NGN',
    subtotalAmount: invoice.subtotalAmount ?? invoice.amount,
    discountAmount: invoice.discountAmount || 0,
    taxRatePercent: invoice.taxRatePercent || 0,
    taxAmount: invoice.taxAmount || 0,
    totalAmount: invoice.amount,
    promotionalCode: invoice.promotionalCode || null,
    lineItems,
    transactionReference: invoice.bachsChargeId || invoice.bachsCheckoutId || invoice.invoiceNumber,
    paymentProvider: 'Bachs.io',
    issueDate: invoice.createdAt,
    dueDate: invoice.dueDate || invoice.createdAt,
    paidAt: invoice.paidAt || null,
  };
}
