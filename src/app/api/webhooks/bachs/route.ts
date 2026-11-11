import { NextResponse } from 'next/server';
import { verifyBachsWebhookSignature, processBachsWebhookEvent } from '@/lib/payments/bachs';

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    service: 'closecraft-bachs-webhook',
    timestamp: new Date().toISOString()
  }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const secret = [process.env.BACHS_WEBHOOK_SECRET, process.env.BILLING_WEBHOOK_SECRET].filter(Boolean).join(',');

    let isVerified = false;
    let verificationError: string | undefined;

    // Verify Bachs signature if secret is configured
    if (secret) {
      const verification = verifyBachsWebhookSignature(rawBody, req.headers, secret);
      isVerified = verification.isValid;
      verificationError = verification.error;
    } else {
      console.warn('[Bachs Webhook] No webhook secret configured in environment variables (BACHS_WEBHOOK_SECRET)');
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = payload.type || payload.event || 'unknown';

    // Critical payment events require valid signature to fulfill
    const isPaymentFulfillmentEvent = ['collection.succeeded', 'invoice.paid', 'checkout.completed'].includes(eventType);

    if (isPaymentFulfillmentEvent && secret && !isVerified) {
      console.error('[Bachs Webhook] Signature verification failed for payment fulfillment event:', verificationError);
      // Return 200 with clear details so Bachs does not count as delivery failure and disable endpoint,
      // but do NOT fulfill the payment unverified.
      return NextResponse.json({
        received: true,
        handled: false,
        verified: false,
        error: 'Invalid Bachs signature - payment fulfillment deferred',
        details: verificationError,
      }, { status: 200 });
    }

    const result = await processBachsWebhookEvent(payload);

    return NextResponse.json({
      received: true,
      verified: isVerified,
      eventType,
      result
    }, { status: 200 });
  } catch (error: any) {
    console.error('[Bachs Webhook] Unexpected error handling event:', error);
    // Return 200 so Bachs does not disable the endpoint upon transient errors
    return NextResponse.json({
      received: true,
      handled: false,
      error: error.message || 'Internal processing error'
    }, { status: 200 });
  }
}
