import crypto from 'crypto';
import { db } from '@/lib/db';

const BACHS_API_BASE = process.env.BACHS_API_BASE || (
  process.env.NODE_ENV === 'production' && !process.env.BACHS_FORCE_SANDBOX
    ? 'https://api.bachs.io'
    : 'https://sandbox-api.bachs.io'
);

export interface BachsCheckoutParams {
  amount: number; // e.g. 15000 or 150000
  currency?: string; // e.g. 'NGN'
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  organizationId: string;
  invoiceId?: string;
  engagementId?: string;
  type: 'SOFTWARE_SUBSCRIPTION' | 'PILOT_ENGAGEMENT' | 'PERFORMANCE_FEE';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface BachsCheckoutResult {
  checkoutId: string;
  checkoutUrl: string;
  status: string;
  invoiceNumber: string;
}

/**
 * Creates a Bachs hosted checkout session.
 * Official convention: Money is always a decimal string at the currency's precision ("15000.00").
 * Never use minor units for Bachs.
 */
export async function createBachsCheckoutSession(params: BachsCheckoutParams): Promise<BachsCheckoutResult> {
  const apiKey = process.env.BACHS_SECRET_KEY || process.env.BACHS_API_KEY;
  const currency = params.currency || 'NGN';
  const decimalAmount = params.amount.toFixed(2);
  const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Find or create BachsInvoice record server-side first
  const invoice = await db.bachsInvoice.create({
    data: {
      organizationId: params.organizationId,
      engagementId: params.engagementId || null,
      invoiceNumber,
      type: params.type,
      amount: params.amount,
      currency,
      status: 'ISSUED',
      customerEmail: params.customerEmail || null,
      customerName: params.customerName || null,
      metadata: JSON.stringify(params.metadata || {}),
    }
  });

  if (!apiKey) {
    // If Bachs API key is not yet configured in environment, provide sandbox simulated hosted URL
    const simulatedCheckoutId = `chk_mock_${invoice.id}`;
    const simulatedCheckoutUrl = `/billing/checkout/mock?checkout_id=${simulatedCheckoutId}&invoice_id=${invoice.id}&amount=${params.amount}&currency=${currency}`;

    await db.bachsInvoice.update({
      where: { id: invoice.id },
      data: {
        bachsCheckoutId: simulatedCheckoutId,
        bachsCheckoutUrl: simulatedCheckoutUrl,
      }
    });

    return {
      checkoutId: simulatedCheckoutId,
      checkoutUrl: simulatedCheckoutUrl,
      status: 'open',
      invoiceNumber,
    };
  }

  const payload: any = {
    pricing: {
      currency,
      amount: decimalAmount,
    },
    customer: params.customerEmail ? {
      email: params.customerEmail,
      name: params.customerName || undefined,
      phone_number: params.customerPhone || undefined,
    } : undefined,
    success_url: params.successUrl.includes('?') 
      ? `${params.successUrl}&invoice_id=${invoice.id}`
      : `${params.successUrl}?invoice_id=${invoice.id}`,
    cancel_url: params.cancelUrl,
    reference: invoice.invoiceNumber,
    metadata: {
      organizationId: params.organizationId,
      invoiceId: invoice.id,
      engagementId: params.engagementId || '',
      type: params.type,
      ...(params.metadata || {}),
    }
  };

  const response = await fetch(`${BACHS_API_BASE}/v1/checkout-sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `chk-${invoice.id}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Bachs] Checkout session creation failed:', response.status, errorText);
    throw new Error(`Bachs checkout creation failed: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const checkoutId = data.checkout_id || data.id;
  const checkoutUrl = data.checkout_url || data.url;

  await db.bachsInvoice.update({
    where: { id: invoice.id },
    data: {
      bachsCheckoutId: checkoutId,
      bachsCheckoutUrl: checkoutUrl,
    }
  });

  return {
    checkoutId,
    checkoutUrl,
    status: data.status || 'open',
    invoiceNumber,
  };
}

/**
 * Verifies Bachs webhook authenticity.
 * Checks X-Bachs-Signature-V2 (t={timestamp},v1={sig}) or X-Bachs-Signature + X-Bachs-Timestamp.
 * Uses raw request body HMAC-SHA256 with 300s replay tolerance.
 */
export function verifyBachsWebhookSignature(
  rawBody: string,
  headers: Headers | Record<string, string | null | undefined>,
  secret: string,
  toleranceSeconds: number = 300
): { isValid: boolean; timestamp?: number; error?: string } {
  if (!secret) {
    return { isValid: false, error: 'Webhook secret is not configured' };
  }

  const getHeader = (name: string): string | null => {
    if (typeof (headers as any).get === 'function') {
      return (headers as Headers).get(name) || (headers as Headers).get(name.toLowerCase());
    }
    const record = headers as Record<string, string | null | undefined>;
    return record[name] || record[name.toLowerCase()] || null;
  };

  const v2Header = getHeader('X-Bachs-Signature-V2') || getHeader('x-bachs-signature-v2');
  const sigHeader = getHeader('X-Bachs-Signature') || getHeader('x-bachs-signature');
  const timestampHeader = getHeader('X-Bachs-Timestamp') || getHeader('x-bachs-timestamp');

  if (v2Header) {
    // Parse scheme t=..., v1=...
    const parts = v2Header.split(',').map(p => p.trim());
    let timestamp: number | null = null;
    const signatures: string[] = [];

    for (const part of parts) {
      const [k, v] = part.split('=');
      if (k === 't' && v) timestamp = parseInt(v, 10);
      if (k === 'v1' && v) signatures.push(v);
    }

    if (!timestamp || signatures.length === 0) {
      return { isValid: false, error: 'Malformed X-Bachs-Signature-V2 header' };
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
      return { isValid: false, error: 'Webhook timestamp outside tolerance window (replay protection)' };
    }

    const message = `${timestamp}.${rawBody}`;
    const expected = crypto.createHmac('sha256', secret).update(message, 'utf8').digest('hex');

    const match = signatures.some(sig => {
      try {
        return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
      } catch {
        return false;
      }
    });

    return { isValid: match, timestamp, error: match ? undefined : 'Signature mismatch' };
  }

  if (sigHeader && timestampHeader) {
    const timestamp = parseInt(timestampHeader, 10);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
      return { isValid: false, error: 'Webhook timestamp outside tolerance window' };
    }

    const message = `${timestamp}.${rawBody}`;
    const expected = crypto.createHmac('sha256', secret).update(message, 'utf8').digest('hex');

    try {
      const match = crypto.timingSafeEqual(Buffer.from(sigHeader, 'hex'), Buffer.from(expected, 'hex'));
      return { isValid: match, timestamp, error: match ? undefined : 'Signature mismatch' };
    } catch {
      return { isValid: false, error: 'Invalid signature encoding' };
    }
  }

  return { isValid: false, error: 'Missing Bachs signature headers' };
}

/**
 * Idempotently handles Bachs webhook events.
 * Event types:
 * - collection.succeeded: Payment verified
 * - checkout.completed: Checkout session finished
 * - customer.subscription.created / updated / deleted
 * - invoice.paid
 */
export async function processBachsWebhookEvent(event: any): Promise<{ handled: boolean; details?: string }> {
  const eventType = event.type || event.event;
  const eventData = event.data || {};
  const metadata = eventData.metadata || event.metadata || {};

  console.log(`[Bachs Webhook] Processing event: ${eventType}, ID: ${event.id || 'N/A'}`);

  if (eventType === 'collection.succeeded' || eventType === 'invoice.paid' || eventType === 'checkout.completed') {
    const checkoutId = eventData.checkout_id || eventData.id;
    const chargeId = eventData.charge_id || eventData.payment_id;
    const organizationId = metadata.organizationId || eventData.organization_id;
    const invoiceId = metadata.invoiceId;
    const engagementId = metadata.engagementId;
    const purchaseType = metadata.type || 'SOFTWARE_SUBSCRIPTION';

    // Find invoice by checkoutId, id, or reference
    let invoice = null;
    if (invoiceId) {
      invoice = await db.bachsInvoice.findUnique({ where: { id: invoiceId } });
    }
    if (!invoice && checkoutId) {
      invoice = await db.bachsInvoice.findFirst({
        where: {
          OR: [
            { bachsCheckoutId: checkoutId },
            { id: checkoutId }
          ]
        }
      });
    }

    // Idempotency: If invoice already CONFIRMED or FUNDS_AVAILABLE, avoid duplicate activation
    if (invoice && (invoice.status === 'CONFIRMED' || invoice.status === 'FUNDS_AVAILABLE')) {
      return { handled: true, details: `Invoice ${invoice.invoiceNumber} already marked as confirmed` };
    }

    const targetOrgId = invoice?.organizationId || organizationId;
    if (!targetOrgId) {
      console.warn('[Bachs Webhook] No organizationId associated with payment event');
      return { handled: false, details: 'Missing organization reference' };
    }

    const now = new Date();

    // 1. Update invoice status
    if (invoice) {
      await db.bachsInvoice.update({
        where: { id: invoice.id },
        data: {
          status: 'CONFIRMED',
          bachsChargeId: chargeId || invoice.bachsChargeId,
          paidAt: now,
          fundsAvailableAt: now,
        }
      });
    }

    // 2. Fulfill Software Subscription
    if (purchaseType === 'SOFTWARE_SUBSCRIPTION') {
      const sub = await db.workspaceSubscription.findUnique({
        where: { organizationId: targetOrgId }
      });

      let nextPaidThrough: Date;
      if (sub?.paidThroughDate && sub.paidThroughDate > now) {
        // Early renewal extends existing paid-through date
        nextPaidThrough = new Date(sub.paidThroughDate);
        nextPaidThrough.setMonth(nextPaidThrough.getMonth() + 1);
      } else {
        // Renewal after expiry starts 1 calendar month from now
        nextPaidThrough = new Date(now);
        nextPaidThrough.setMonth(nextPaidThrough.getMonth() + 1);
      }

      const gracePeriodEnd = new Date(nextPaidThrough);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

      await db.workspaceSubscription.upsert({
        where: { organizationId: targetOrgId },
        update: {
          status: 'ACTIVE',
          paidThroughDate: nextPaidThrough,
          gracePeriodEndsAt: gracePeriodEnd,
        },
        create: {
          organizationId: targetOrgId,
          status: 'ACTIVE',
          trialStartedAt: now,
          trialEndsAt: now,
          paidThroughDate: nextPaidThrough,
          gracePeriodEndsAt: gracePeriodEnd,
        }
      });

      await db.organization.update({
        where: { id: targetOrgId },
        data: { plan: 'STARTER', status: 'APPROVED' }
      });

      await db.auditLog.create({
        data: {
          organizationId: targetOrgId,
          actorType: 'INTEGRATION',
          action: 'SOFTWARE_SUBSCRIPTION_RENEWED',
          resourceType: 'BILLING',
          resourceId: invoice?.id || checkoutId || 'manual',
          newState: JSON.stringify({ paidThroughDate: nextPaidThrough, amount: invoice?.amount })
        }
      });
    }

    // 3. Fulfill Managed Pilot Engagement
    if (purchaseType === 'PILOT_ENGAGEMENT' && (engagementId || invoice?.engagementId)) {
      const targetEngagementId = engagementId || invoice?.engagementId;
      const engagement = await db.pilotEngagement.findUnique({
        where: { id: targetEngagementId },
        include: { professional: true }
      });

      if (engagement) {
        // Set payment verified
        const updatedPrereq = {
          isPaymentVerified: true,
          status: engagement.isTermsAccepted && engagement.isProfessionalApproved && engagement.isClientReadinessApproved
            ? 'ACTIVE'
            : 'AWAITING_READINESS',
          activatedAt: engagement.isTermsAccepted && engagement.isProfessionalApproved && engagement.isClientReadinessApproved
            ? now
            : null,
          startDate: engagement.startDate || now,
          endDate: engagement.endDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30-day fixed pilot term
        };

        await db.pilotEngagement.update({
          where: { id: targetEngagementId },
          data: updatedPrereq
        });

        // Ensure Software Subscription has PILOT_INCLUDED to prevent duplicate software billing!
        const pilotEndDate = updatedPrereq.endDate;
        await db.workspaceSubscription.upsert({
          where: { organizationId: targetOrgId },
          update: {
            status: 'PILOT_INCLUDED',
            activePilotEngagementId: targetEngagementId,
            paidThroughDate: pilotEndDate,
          },
          create: {
            organizationId: targetOrgId,
            status: 'PILOT_INCLUDED',
            trialStartedAt: now,
            trialEndsAt: now,
            activePilotEngagementId: targetEngagementId,
            paidThroughDate: pilotEndDate,
          }
        });

        // Create earned ProfessionalPayable (kept strictly separate from client collections)
        if (engagement.professionalId) {
          const existingPayable = await db.professionalPayable.findFirst({
            where: {
              engagementId: targetEngagementId,
              professionalId: engagement.professionalId,
              type: 'FIXED_PILOT_COMPENSATION'
            }
          });

          if (!existingPayable) {
            await db.professionalPayable.create({
              data: {
                engagementId: targetEngagementId,
                professionalId: engagement.professionalId,
                amount: engagement.professionalCompensation,
                currency: engagement.currency,
                type: 'FIXED_PILOT_COMPENSATION',
                status: 'EARNED',
              }
            });
          }
        }

        await db.auditLog.create({
          data: {
            organizationId: targetOrgId,
            actorType: 'INTEGRATION',
            action: 'PILOT_ENGAGEMENT_PAYMENT_VERIFIED',
            resourceType: 'PILOT_ENGAGEMENT',
            resourceId: targetEngagementId,
            newState: JSON.stringify(updatedPrereq)
          }
        });
      }
    }

    return { handled: true, details: `Fulfillment completed for ${purchaseType}` };
  }

  return { handled: true, details: `Event ${eventType} recorded without action` };
}
