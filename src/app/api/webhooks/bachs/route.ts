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

    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret unconfigured' }, { status: 503 });
    }
    const verification = verifyBachsWebhookSignature(rawBody, req.headers, secret);
    if (!verification.isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = payload.type || payload.event || 'unknown';

    const result = await processBachsWebhookEvent(payload);

    return NextResponse.json({
      received: true,
      verified: true,
      eventType,
      result
    }, { status: 200 });
  } catch (error: any) {
    console.error('[Bachs Webhook] Unexpected error handling event:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
