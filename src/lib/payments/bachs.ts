import crypto from 'crypto';
import { db } from '@/lib/db';

export function getBachsApiBase(): string {
  if (process.env.BACHS_API_BASE) {
    return process.env.BACHS_API_BASE.replace(/\/$/, '');
  }

  const isSandboxForced = process.env.BACHS_FORCE_SANDBOX === 'true';
  if (isSandboxForced) {
    return 'https://sandbox-api.bachs.io';
  }

  const key = process.env.BACHS_SECRET_KEY || process.env.BACHS_API_KEY || '';
  const isLiveKey = key.startsWith('sk_live_') || key.startsWith('sec_live_') || key.startsWith('live_');
  const isExplicitLive = process.env.BACHS_MODE === 'live' || process.env.BACHS_FORCE_SANDBOX === 'false';
  const isProduction = process.env.NODE_ENV === 'production';

  if (isLiveKey || isExplicitLive || isProduction) {
    return 'https://api.bachs.io';
  }

  return 'https://sandbox-api.bachs.io';
}

export interface BachsCheckoutParams {
  amount?: number; // e.g. 15000 or 150000
  currency?: string; // e.g. 'NGN'
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  organizationId: string;
  invoiceId?: string;
  engagementId?: string;
  type?: 'SOFTWARE_SUBSCRIPTION' | 'WORKSPACE_INVOICE' | 'PILOT_ENGAGEMENT' | 'PERFORMANCE_FEE';
  plan?: 'STARTER' | 'PRO';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface BachsCheckoutResult {
  checkoutId: string;
  checkoutUrl: string;
  status: string;
  invoiceNumber: string;
  invoiceId: string;
}

/**
 * Creates a Bachs hosted checkout session.
 * Official convention: Money is always an exact decimal string at the currency's precision ("15000.00").
 * Raw pricing checkout uses { pricing: { currency: "NGN", amount: "15000.00" } }.
 * Never use minor units for Bachs.
 */
export async function createBachsCheckoutSession(params: BachsCheckoutParams): Promise<BachsCheckoutResult> {
  const apiKey = process.env.BACHS_SECRET_KEY || process.env.BACHS_API_KEY;

  let invoice: any = null;

  if (params.invoiceId) {
    invoice = await db.bachsInvoice.findUnique({
      where: { id: params.invoiceId }
    });

    if (!invoice) {
      throw new Error(`Invoice with ID ${params.invoiceId} not found`);
    }

    if (invoice.organizationId !== params.organizationId) {
      throw new Error("Unauthorized: Invoice does not belong to this organization");
    }

    if (['PAID', 'CONFIRMED', 'FUNDS_AVAILABLE'].includes(invoice.status)) {
      throw new Error(`Invoice ${invoice.invoiceNumber} is already paid`);
    }
  } else {
    // Derive amount and currency server-side
    const baseAmount = params.amount ?? 15000.0;
    const currency = params.currency || 'NGN';
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    invoice = await db.bachsInvoice.create({
      data: {
        organizationId: params.organizationId,
        engagementId: params.engagementId || null,
        invoiceNumber,
        type: params.type || 'WORKSPACE_INVOICE',
        amount: baseAmount,
        currency,
        status: 'APPROVED',
        customerEmail: params.customerEmail || null,
        customerName: params.customerName || null,
        metadata: JSON.stringify(params.metadata || {}),
      }
    });
  }

  // Derive amount and currency strictly server-side from invoice record
  const finalAmount = invoice.amount;
  const currency = invoice.currency || 'NGN';
  const decimalAmount = finalAmount.toFixed(2);
  const idempotencyKey = `checkout-${invoice.id}-${Date.now()}`;

  const publicFallback = (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost'))
    ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
    : 'https://www.closecrafthq.com';

  let safeSuccessUrl = params.successUrl;
  let safeCancelUrl = params.cancelUrl;

  if (safeSuccessUrl.includes('localhost') || safeSuccessUrl.includes('127.0.0.1')) {
    safeSuccessUrl = safeSuccessUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, publicFallback);
  }
  if (safeCancelUrl.includes('localhost') || safeCancelUrl.includes('127.0.0.1')) {
    safeCancelUrl = safeCancelUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, publicFallback);
  }

  const resolvedSuccessUrl = safeSuccessUrl.includes('?')
    ? `${safeSuccessUrl}&checkout_id={CHECKOUT_ID}&invoice_id=${invoice.id}`
    : `${safeSuccessUrl}?checkout_id={CHECKOUT_ID}&invoice_id=${invoice.id}`;

  if (!apiKey) {
    // If Bachs API key is not yet configured, provide simulated sandbox checkout
    const simulatedCheckoutId = `chk_mock_${invoice.id}_${Date.now()}`;
    const simulatedCheckoutUrl = `/billing/checkout/mock?checkout_id=${simulatedCheckoutId}&invoice_id=${invoice.id}&amount=${decimalAmount}&currency=${currency}`;

    await db.bachsInvoice.update({
      where: { id: invoice.id },
      data: {
        bachsCheckoutId: simulatedCheckoutId,
        bachsCheckoutUrl: simulatedCheckoutUrl,
      }
    });

    await db.paymentAttempt.create({
      data: {
        invoiceId: invoice.id,
        organizationId: invoice.organizationId,
        checkoutId: simulatedCheckoutId,
        idempotencyKey,
        amount: finalAmount,
        currency,
        status: 'PENDING',
        provider: 'BACHS',
        rawResponse: JSON.stringify({ checkout_id: simulatedCheckoutId, simulated: true }),
      }
    });

    return {
      checkoutId: simulatedCheckoutId,
      checkoutUrl: simulatedCheckoutUrl,
      status: 'open',
      invoiceNumber: invoice.invoiceNumber,
      invoiceId: invoice.id,
    };
  }

  // Raw pricing checkout payload adhering strictly to Bachs specification
  const payload = {
    pricing: {
      currency,
      amount: decimalAmount,
    },
    customer: params.customerEmail ? {
      email: params.customerEmail,
      name: params.customerName || undefined,
      phone_number: params.customerPhone || undefined,
    } : undefined,
    success_url: resolvedSuccessUrl,
    cancel_url: safeCancelUrl,
    reference: invoice.invoiceNumber,
    metadata: {
      organizationId: invoice.organizationId,
      invoiceId: invoice.id,
      engagementId: invoice.engagementId || '',
      type: invoice.type,
      plan: params.plan || (params.metadata as any)?.plan || 'STARTER',
      ...(params.metadata || {}),
    }
  };

  const response = await fetch(`${getBachsApiBase()}/v1/checkout-sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
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

  // Persist checkout_id and checkout_url on invoice
  await db.bachsInvoice.update({
    where: { id: invoice.id },
    data: {
      bachsCheckoutId: checkoutId,
      bachsCheckoutUrl: checkoutUrl,
    }
  });

  // Record payment attempt
  await db.paymentAttempt.create({
    data: {
      invoiceId: invoice.id,
      organizationId: invoice.organizationId,
      checkoutId,
      idempotencyKey,
      amount: finalAmount,
      currency,
      status: 'PENDING',
      provider: 'BACHS',
      rawResponse: JSON.stringify(data),
    }
  });

  return {
    checkoutId,
    checkoutUrl,
    status: data.status || 'open',
    invoiceNumber: invoice.invoiceNumber,
    invoiceId: invoice.id,
  };
}

/**
 * Verifies Bachs webhook authenticity.
 * Checks X-Bachs-Signature-V2 (t={timestamp},v1={sig}) or X-Bachs-Signature + X-Bachs-Timestamp.
 * Supports webhook-signature and webhook-timestamp header conventions.
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

  const secrets = secret.split(',').map(s => s.trim()).filter(Boolean);
  if (secrets.length > 1) {
    let lastResult: { isValid: boolean; timestamp?: number; error?: string } = { isValid: false, error: 'Signature mismatch' };
    for (const singleSecret of secrets) {
      const res = verifyBachsWebhookSignature(rawBody, headers, singleSecret, toleranceSeconds);
      if (res.isValid) return res;
      lastResult = res;
    }
    return lastResult;
  }


  const getHeader = (name: string): string | null => {
    if (typeof (headers as any).get === 'function') {
      return (headers as Headers).get(name) || (headers as Headers).get(name.toLowerCase());
    }
    const record = headers as Record<string, string | null | undefined>;
    return record[name] || record[name.toLowerCase()] || null;
  };

  const v2Header = getHeader('X-Bachs-Signature-V2') || getHeader('x-bachs-signature-v2');
  const sigHeader = getHeader('X-Bachs-Signature') || getHeader('x-bachs-signature') || getHeader('webhook-signature');
  const timestampHeader = getHeader('X-Bachs-Timestamp') || getHeader('x-bachs-timestamp') || getHeader('webhook-timestamp');

  if (v2Header) {
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
    if (isNaN(timestamp)) {
      return { isValid: false, error: 'Invalid timestamp format' };
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
      return { isValid: false, error: 'Webhook timestamp outside tolerance window (replay protection)' };
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

  // Also support single hex signature if only sigHeader is supplied without timestamp header
  if (sigHeader && !timestampHeader) {
    const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
    try {
      const match = crypto.timingSafeEqual(Buffer.from(sigHeader, 'hex'), Buffer.from(expected, 'hex'));
      return { isValid: match, error: match ? undefined : 'Signature mismatch' };
    } catch {
      return { isValid: false, error: 'Invalid signature encoding' };
    }
  }

  return { isValid: false, error: 'Missing Bachs signature headers' };
}

/**
 * Idempotently handles Bachs webhook events.
 * Double-level idempotency:
 * 1. Event-level: ignores duplicate webhook event IDs (WebhookEvent table)
 * 2. Invoice-level: does not re-process already fulfilled invoices
 * Entitlement is granted strictly via invoice-to-workspace relationship (never merely payer email).
 */
export async function processBachsWebhookEvent(event: any): Promise<{
  handled: boolean;
  duplicate?: boolean;
  alreadyFulfilled?: boolean;
  details?: string;
  error?: string;
}> {
  const eventId = event.id;
  const eventType = event.type || event.event;
  const eventData = event.data || {};
  const metadata = eventData.metadata || event.metadata || {};

  console.log(`[Bachs Webhook] Processing event: ${eventType}, ID: ${eventId || 'N/A'}`);

  // Level 1: Event-level idempotency
  if (eventId) {
    const existingEvent = await db.webhookEvent.findUnique({
      where: { eventId }
    });
    if (existingEvent) {
      console.log(`[Bachs Webhook] Event ${eventId} already processed, skipping`);
      return { handled: true, duplicate: true, details: `Event ${eventId} already processed` };
    }
  }

  // Fulfill on collection.succeeded or equivalent successful payment events
  if (eventType === 'collection.succeeded' || eventType === 'invoice.paid' || eventType === 'checkout.completed') {
    const checkoutId = eventData.checkout_id || eventData.id;
    const chargeId = eventData.charge_id || eventData.payment_id || eventData.id;
    const invoiceId = metadata.invoiceId;
    const engagementId = metadata.engagementId;
    const purchaseType = metadata.type || 'WORKSPACE_INVOICE';

    // Find invoice by invoiceId or checkoutId
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

    if (!invoice) {
      console.warn(`[Bachs Webhook] No invoice found for checkout_id=${checkoutId}, invoiceId=${invoiceId}`);
      return { handled: false, details: 'Invoice not found' };
    }

    // Level 2: Invoice-level idempotency
    if (['PAID', 'CONFIRMED', 'FUNDS_AVAILABLE'].includes(invoice.status)) {
      console.log(`[Bachs Webhook] Invoice ${invoice.invoiceNumber} is already fulfilled`);
      // Record event so subsequent retries are recognized as duplicates
      if (eventId) {
        await db.webhookEvent.create({
          data: {
            eventId,
            provider: 'BACHS',
            eventType,
            status: 'PROCESSED',
            payload: JSON.stringify(event),
          }
        }).catch(() => {});
      }
      return { handled: true, alreadyFulfilled: true, details: `Invoice ${invoice.invoiceNumber} already marked as paid` };
    }

    // Verify expected amount and currency
    if (eventData.amount !== undefined && eventData.amount !== null) {
      const payloadAmount = parseFloat(eventData.amount);
      if (!isNaN(payloadAmount) && Math.abs(payloadAmount - invoice.amount) > 0.01) {
        console.error(`[Bachs Webhook] Amount mismatch: expected ${invoice.amount}, received ${payloadAmount}`);
        return { handled: false, error: `Amount mismatch: expected ${invoice.amount}, got ${payloadAmount}` };
      }
    }

    if (eventData.currency) {
      const payloadCurrency = String(eventData.currency).toUpperCase();
      if (payloadCurrency !== invoice.currency.toUpperCase()) {
        console.error(`[Bachs Webhook] Currency mismatch: expected ${invoice.currency}, received ${payloadCurrency}`);
        return { handled: false, error: `Currency mismatch: expected ${invoice.currency}, got ${payloadCurrency}` };
      }
    }

    // Entitlement granted strictly through authenticated invoice-to-workspace relationship
    const targetOrgId = invoice.organizationId;
    const now = new Date();

    // 1. Mark invoice as PAID
    await db.bachsInvoice.update({
      where: { id: invoice.id },
      data: {
        status: 'PAID',
        bachsChargeId: chargeId || invoice.bachsChargeId,
        paidAt: now,
        fundsAvailableAt: now,
      }
    });

    // 2. Mark payment attempt as SUCCEEDED
    if (checkoutId) {
      await db.paymentAttempt.updateMany({
        where: { checkoutId },
        data: { status: 'SUCCEEDED' }
      });
    }

    // 3. Fulfill Workspace Subscription / Software Access
    if (purchaseType === 'SOFTWARE_SUBSCRIPTION' || purchaseType === 'WORKSPACE_INVOICE') {
      let parsedMetadata: any = {};
      try {
        parsedMetadata = typeof invoice.metadata === 'string' ? JSON.parse(invoice.metadata) : (invoice.metadata || {});
      } catch (_) {}

      const targetPlan = (metadata.plan || parsedMetadata.plan || (invoice.amount >= 40000 ? 'PRO' : 'STARTER')).toUpperCase() === 'PRO' ? 'PRO' : 'STARTER';
      const planPrice = targetPlan === 'PRO' ? 45000.0 : 20000.0;
      const planSeats = targetPlan === 'PRO' ? 10 : 3;

      const sub = await db.workspaceSubscription.findUnique({
        where: { organizationId: targetOrgId }
      });

      let nextPaidThrough: Date;
      if (sub?.paidThroughDate && sub.paidThroughDate > now) {
        // Early renewal extends existing paid-through date by 30 days
        nextPaidThrough = new Date(sub.paidThroughDate);
        nextPaidThrough.setDate(nextPaidThrough.getDate() + 30);
      } else {
        // Renewal from now grants 30 days of active access
        nextPaidThrough = new Date(now);
        nextPaidThrough.setDate(nextPaidThrough.getDate() + 30);
      }

      const gracePeriodEnd = new Date(nextPaidThrough);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

      await db.workspaceSubscription.upsert({
        where: { organizationId: targetOrgId },
        update: {
          status: 'ACTIVE',
          plan: targetPlan,
          pricePerMonth: planPrice,
          maxInternalSeats: planSeats,
          paidThroughDate: nextPaidThrough,
          gracePeriodEndsAt: gracePeriodEnd,
        },
        create: {
          organizationId: targetOrgId,
          status: 'ACTIVE',
          plan: targetPlan,
          pricePerMonth: planPrice,
          maxInternalSeats: planSeats,
          trialStartedAt: now,
          trialEndsAt: now,
          paidThroughDate: nextPaidThrough,
          gracePeriodEndsAt: gracePeriodEnd,
        }
      });

      await db.organization.update({
        where: { id: targetOrgId },
        data: { plan: targetPlan, status: 'APPROVED' }
      });

      await db.auditLog.create({
        data: {
          organizationId: targetOrgId,
          actorType: 'INTEGRATION',
          action: 'WORKSPACE_INVOICE_PAID',
          resourceType: 'BILLING',
          resourceId: invoice.id,
          newState: JSON.stringify({ paidThroughDate: nextPaidThrough, amount: invoice.amount })
        }
      });
    }

    // 4. Fulfill Managed Pilot Engagement (payment satisfies ONLY payment prerequisite)
    if (purchaseType === 'PILOT_ENGAGEMENT' && (engagementId || invoice.engagementId)) {
      const targetEngagementId = engagementId || invoice.engagementId;
      const engagement = await db.pilotEngagement.findUnique({
        where: { id: targetEngagementId },
        include: { professional: true }
      });

      if (engagement) {
        // Payment verifies payment prerequisite; does NOT bypass accepted terms or professional readiness
        const canActivate = engagement.isTermsAccepted && engagement.isProfessionalApproved && engagement.isClientReadinessApproved;
        const updatedPrereq = {
          isPaymentVerified: true,
          status: canActivate ? 'ACTIVE' : 'AWAITING_READINESS',
          activatedAt: canActivate ? now : null,
          startDate: engagement.startDate || now,
          endDate: engagement.endDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        };

        await db.pilotEngagement.update({
          where: { id: targetEngagementId },
          data: updatedPrereq
        });

        // Ensure Workspace Subscription includes pilot
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

    // 5. Record processed WebhookEvent for event-level idempotency
    if (eventId) {
      await db.webhookEvent.create({
        data: {
          eventId,
          provider: 'BACHS',
          eventType,
          status: 'PROCESSED',
          payload: JSON.stringify(event),
        }
      }).catch((e) => {
        console.warn('[Bachs Webhook] WebhookEvent record insertion notice:', e.message);
      });
    }

    return { handled: true, details: `Fulfillment completed for ${purchaseType} (Invoice ${invoice.invoiceNumber})` };
  }

  // Record other events for audit trail
  if (eventId) {
    await db.webhookEvent.create({
      data: {
        eventId,
        provider: 'BACHS',
        eventType,
        status: 'PROCESSED',
        payload: JSON.stringify(event),
      }
    }).catch(() => {});
  }

  return { handled: true, details: `Event ${eventType} recorded without action` };
}
