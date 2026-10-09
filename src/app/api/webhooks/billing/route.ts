import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';

export async function POST(req: Request) {
 try {
 const body = await req.json();
 
 // In production, verify Stripe/Paystack signature here
 // const signature = req.headers.get('stripe-signature');

 if (body.type === 'checkout.session.completed' || body.event === 'charge.success') {
 const session = body.data?.object || body.data;
 
 // Send event to our background worker (Idempotency happens there)
 await inngest.send({
 name: 'billing/payment.success',
 data: {
 organizationId: session.metadata?.organizationId,
 type: session.metadata?.purchaseType || 'SAAS_SUBSCRIPTION',
 plan: session.metadata?.plan,
 courseId: session.metadata?.courseId,
 studentId: session.metadata?.studentId,
 amount: session.amount_total || session.amount,
 }
 });
 }

 return new NextResponse('Webhook Received', { status: 200 });
 } catch (error) {
 console.error('Billing webhook error:', error);
 return new NextResponse('Internal Server Error', { status: 500 });
 }
}
