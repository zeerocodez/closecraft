import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validSignature } from '@/lib/security';
import { z } from 'zod';

const chargeSchema = z.object({
  reference: z.string().min(1).max(200),
  status: z.literal('success'),
  amount: z.number().int().positive(),
  currency: z.string().length(3),
});

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret?.trim()) return NextResponse.json({ error: 'Billing unavailable' }, { status: 503 });
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get('x-paystack-signature'), secret, 'sha512')) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  let event;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (event.event !== 'charge.success') return NextResponse.json({ received: true });
  const result = chargeSchema.safeParse(event.data);
  if (!result.success) return NextResponse.json({ error: 'Invalid charge' }, { status: 400 });
  const charge = result.data;
  try {
    const accepted = await db.$transaction(async tx => {
      const payment = await tx.paymentTransaction.findUnique({ where: { reference: charge.reference } });
      if (!payment || payment.amount !== charge.amount || payment.currency !== charge.currency || !['GROWTH', 'SCALE', 'PRO'].includes(payment.plan)) return false;
      // Atomic claim and all side effects commit together, including concurrent retries.
      const claimed = await tx.paymentTransaction.updateMany({
        where: { reference: payment.reference, processedAt: null }, data: { processedAt: new Date() },
      });
      if (claimed.count === 0) return true;
      await tx.organization.update({ where: { id: payment.organizationId }, data: { plan: payment.plan } });
      await tx.auditLog.create({ data: {
        organizationId: payment.organizationId, actorType: 'SYSTEM', action: 'SUBSCRIPTION_UPGRADED',
        resourceType: 'BILLING', resourceId: payment.reference, newState: payment.plan,
      } });
      return true;
    });
    return accepted ? NextResponse.json({ received: true }) : NextResponse.json({ error: 'Unrecognized payment' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
