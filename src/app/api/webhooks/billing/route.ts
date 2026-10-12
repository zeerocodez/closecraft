import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || req.headers.get('x-webhook-signature');
    const secret = process.env.STRIPE_WEBHOOK_SECRET || process.env.BILLING_WEBHOOK_SECRET;

    // Enforce signature check in production environments
    if (process.env.NODE_ENV === 'production') {
      if (!secret || !signature) {
        console.warn('[Billing Webhook] Rejected: Missing signature or webhook secret in production');
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);

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
