import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { timingSafeEqualString } from '@/lib/apiSecurity';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Paystack Webhook] PAYSTACK_SECRET_KEY is unconfigured in production.');
        return NextResponse.json({ error: 'Webhook secret unconfigured' }, { status: 500 });
      }
    }

    if (secret) {
      const expectedSignature = crypto
        .createHmac('sha512', secret)
        .update(rawBody)
        .digest('hex');

      if (!signature || !timingSafeEqualString(signature, expectedSignature)) {
        console.warn('[Paystack Webhook] Invalid Paystack signature rejected.');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

 const event = JSON.parse(rawBody);

 // Handle Paystack Events
 if (event.event === 'charge.success') {
 const email = event.data.customer.email;
 const amount = event.data.amount / 100; // Paystack amounts are in kobo

 console.log(`[Paystack Webhook] Successful charge of ₦${amount} for ${email}`);

 // Example: find organization by email and update plan
 // You would typically store a customer_code or reference on the organization
 const org = await db.organization.findFirst({
 where: {
 members: {
 some: {
 user: { email }
 }
 }
 }
 });

 if (org) {
 await db.organization.update({
 where: { id: org.id },
 data: { plan: 'PRO' }
 });
 
 await db.auditLog.create({
 data: {
 organizationId: org.id,
 actorType: 'SYSTEM',
 action: 'SUBSCRIPTION_UPGRADED',
 resourceType: 'BILLING',
 resourceId: event.data.reference,
 newState: 'PRO'
 }
 });
 }
 }

 return NextResponse.json({ received: true });
 } catch (error) {
 console.error('Paystack webhook error:', error);
 return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
 }
}
