import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';
import { timingSafeEqualString } from '@/lib/apiSecurity';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import crypto from 'crypto';

function verifyBillingSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  if (!signatureHeader || !secret) return false;

  // 1. Stripe signature format (t=...,v1=...)
  if (signatureHeader.includes('t=') && signatureHeader.includes('v1=')) {
    const parts = signatureHeader.split(',');
    let timestamp = '';
    const signatures: string[] = [];
    for (const part of parts) {
      const [k, v] = part.trim().split('=');
      if (k === 't') timestamp = v;
      if (k === 'v1') signatures.push(v);
    }
    if (!timestamp || signatures.length === 0) return false;
    const payloadToSign = `${timestamp}.${rawBody}`;
    const expected = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');
    return signatures.some(sig => timingSafeEqualString(sig, expected));
  }

  // 2. Generic HMAC SHA-256 header (sha256=<hex> or raw hex)
  const cleanSig = signatureHeader.startsWith('sha256=') ? signatureHeader.slice(7) : signatureHeader;
  const expectedHmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (timingSafeEqualString(cleanSig, expectedHmac)) return true;

  // 3. Fallback: direct token match
  if (timingSafeEqualString(signatureHeader, secret)) return true;

  return false;
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const limiter = await rateLimit(`billing-webhook:${ip}`, 120, 60 * 1000);
    if (!limiter.allowed) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || req.headers.get('x-webhook-signature') || req.headers.get('x-signature');
    const secret = process.env.STRIPE_WEBHOOK_SECRET || process.env.BILLING_WEBHOOK_SECRET;

    // Enforce cryptographic signature check
    if (secret) {
      if (!signature || !verifyBillingSignature(rawBody, signature, secret)) {
        console.warn('[Billing Webhook] Rejected: Invalid signature');
        return new NextResponse('Unauthorized: Invalid webhook signature', { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.error('[Billing Webhook] STRIPE_WEBHOOK_SECRET / BILLING_WEBHOOK_SECRET is unconfigured in production');
      return new NextResponse('Configuration error', { status: 500 });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new NextResponse('Invalid JSON payload', { status: 400 });
    }

    if (body.type === 'checkout.session.completed' || body.event === 'charge.success') {
      const session = body.data?.object || body.data;

      // Send event to our background worker (Idempotency and entitlement happens there)
      await inngest.send({
        name: 'billing/payment.success',
        data: {
          organizationId: session?.metadata?.organizationId,
          type: session?.metadata?.purchaseType || 'SAAS_SUBSCRIPTION',
          plan: session?.metadata?.plan,
          courseId: session?.metadata?.courseId,
          studentId: session?.metadata?.studentId,
          amount: session?.amount_total || session?.amount,
        },
      });
    }

    return new NextResponse('Webhook Received', { status: 200 });
  } catch (error) {
    console.error('Billing webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
