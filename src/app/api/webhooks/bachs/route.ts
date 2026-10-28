import { NextResponse } from 'next/server';
import { verifyBachsWebhookSignature, processBachsWebhookEvent } from '@/lib/payments/bachs';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const secret = process.env.BACHS_WEBHOOK_SECRET || process.env.BILLING_WEBHOOK_SECRET;

    // Verify Bachs signature
    if (secret) {
      const verification = verifyBachsWebhookSignature(rawBody, req.headers, secret);
      if (!verification.isValid) {
        console.error('[Bachs Webhook] Signature verification failed:', verification.error);
        return NextResponse.json({ error: 'Invalid Bachs signature', details: verification.error }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.error('[Bachs Webhook] Missing BACHS_WEBHOOK_SECRET in production environment');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const result = await processBachsWebhookEvent(payload);

    if (!result.handled && result.error) {
      return NextResponse.json({
        received: true,
        handled: false,
        error: result.error,
        details: result.details,
      }, { status: 400 });
    }

    return NextResponse.json({
      received: true,
      result
    }, { status: 200 });
  } catch (error: any) {
    console.error('[Bachs Webhook] Unexpected error handling event:', error);
    return NextResponse.json({ error: 'Internal server error processing webhook' }, { status: 500 });
  }
}
