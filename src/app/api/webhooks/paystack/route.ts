import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { timingSafeEqualString } from '@/lib/apiSecurity';
import { confirmDiscountRedemption, releaseDiscountReservation } from '@/lib/dss/early-bird';
import { sendTransactionalEmailEvent } from '@/lib/email/service';

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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.closecrafthq.com';

    // 1. Handle Successful Charges
    if (event.event === 'charge.success') {
      const email = event.data.customer?.email?.toLowerCase()?.trim();
      const amount = (event.data.amount || 0) / 100; // Paystack minor units to Naira
      const reference = event.data.reference;
      const metadata = event.data.metadata || {};

      console.log(`[Paystack Webhook] Successful charge of ₦${amount} for ${email} (${reference})`);

      // A: DSS Programme Payment
      if (metadata.orderReference || metadata.productSlug || metadata.reservationId) {
        // Confirm Early Bird Discount Redemption if reserved
        if (metadata.orderReference || metadata.reservationId) {
          try {
            await confirmDiscountRedemption({
              orderReference: metadata.orderReference || reference,
              paymentReference: reference,
            });
          } catch (resErr) {
            console.error('[Discount Confirmation Error]', resErr);
          }
        }

        // Send DSS-03: Payment Received Receipt
        try {
          await sendTransactionalEmailEvent({
            templateId: 'DSS-03',
            recipientEmail: email,
            recipientName: metadata.learnerName || '',
            data: {
              firstName: (metadata.learnerName || '').split(' ')[0] || 'there',
              programmeName: metadata.programmeName || 'DSS Programme',
              cohortName: 'Cohort 001',
              originalFee: `₦${(metadata.originalFeeNGN || amount).toLocaleString()}`,
              earlyBirdApplied: Boolean(metadata.discountNGN && metadata.discountNGN > 0),
              discountAmount: metadata.discountNGN ? `₦${metadata.discountNGN.toLocaleString()}` : undefined,
              amountPaid: `₦${amount.toLocaleString()}`,
              paymentReference: reference,
              orderReference: metadata.orderReference || reference,
              enrolmentStatus: 'ACTIVE',
              receiptUrl: `${baseUrl}/dss/dashboard?order=${metadata.orderReference || reference}`,
            },
            deduplicationKey: `dss-receipt-${reference}`,
            sourceEvent: 'PAYSTACK_CHARGE_SUCCESS',
          });
        } catch (emailErr) {
          console.error('[DSS-03 Send Failed]', emailErr);
        }

        // Send DSS-04: Enrolment Confirmed and Dashboard Ready
        try {
          await sendTransactionalEmailEvent({
            templateId: 'DSS-04',
            recipientEmail: email,
            recipientName: metadata.learnerName || '',
            data: {
              firstName: (metadata.learnerName || '').split(' ')[0] || 'there',
              programmeName: metadata.programmeName || 'DSS Programme',
              cohortName: 'Cohort 001',
              dashboardUrl: `${baseUrl}/dss/dashboard`,
              isStartConfirmed: false,
            },
            deduplicationKey: `dss-enrolment-${reference}`,
            sourceEvent: 'PAYSTACK_ENROLMENT_READY',
          });
        } catch (emailErr) {
          console.error('[DSS-04 Send Failed]', emailErr);
        }

        return NextResponse.json({ received: true, dss: true });
      }

      // B: Closecraft Workspace Subscription Payment
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
            resourceId: reference,
            newState: 'PRO'
          }
        });

        // Send CC-05: Payment Received and Subscription Active
        try {
          await sendTransactionalEmailEvent({
            templateId: 'CC-05',
            recipientEmail: email,
            recipientName: org.name,
            data: {
              firstName: 'there',
              workspaceName: org.name,
              planName: 'Pro',
              billingPeriod: 'Monthly',
              amountPaid: `₦${amount.toLocaleString()}`,
              paymentReference: reference,
              dashboardUrl: `${baseUrl}/dashboard`,
              billingUrl: `${baseUrl}/billing`,
            },
            deduplicationKey: `cc-payment-${reference}`,
            sourceEvent: 'PAYSTACK_SUBSCRIPTION_ACTIVE',
            organizationId: org.id,
          });
        } catch (emailErr) {
          console.error('[CC-05 Send Failed]', emailErr);
        }
      }
    }

    // 2. Handle Failed Charges
    if (event.event === 'charge.failed') {
      const email = event.data.customer?.email?.toLowerCase()?.trim();
      const amount = (event.data.amount || 0) / 100;
      const reference = event.data.reference;
      const metadata = event.data.metadata || {};

      console.warn(`[Paystack Webhook] Charge failed of ₦${amount} for ${email} (${reference})`);

      // Release Early Bird reservation if one was pending
      if (metadata.orderReference) {
        try {
          await releaseDiscountReservation(metadata.orderReference);
        } catch (resErr) {
          console.error('[Discount Release Error]', resErr);
        }
      }

      if (metadata.orderReference || metadata.productSlug) {
        // Send DSS-10: Tuition Payment Not Completed
        try {
          await sendTransactionalEmailEvent({
            templateId: 'DSS-10',
            recipientEmail: email,
            recipientName: metadata.learnerName || '',
            data: {
              firstName: (metadata.learnerName || '').split(' ')[0] || 'there',
              programmeName: metadata.programmeName || 'DSS Programme',
              orderUrl: `${baseUrl}/dss/dashboard?order=${metadata.orderReference || reference}`,
              orderReference: metadata.orderReference || reference,
            },
            deduplicationKey: `dss-failed-${reference}`,
            sourceEvent: 'PAYSTACK_CHARGE_FAILED',
          });
        } catch (emailErr) {
          console.error('[DSS-10 Send Failed]', emailErr);
        }
      } else {
        // Send CC-06: Closecraft Payment Not Completed
        const org = await db.organization.findFirst({
          where: {
            members: {
              some: {
                user: { email }
              }
            }
          }
        });

        try {
          await sendTransactionalEmailEvent({
            templateId: 'CC-06',
            recipientEmail: email,
            recipientName: org?.name || 'there',
            data: {
              firstName: 'there',
              workspaceName: org?.name || 'Your Workspace',
              amountDue: `₦${amount.toLocaleString()}`,
              billingUrl: `${baseUrl}/billing`,
              orderReference: reference,
            },
            deduplicationKey: `cc-failed-${reference}`,
            sourceEvent: 'PAYSTACK_CHARGE_FAILED',
            organizationId: org?.id,
          });
        } catch (emailErr) {
          console.error('[CC-06 Send Failed]', emailErr);
        }
      }
    }

    // 3. Handle Refunds
    if (event.event === 'refund.processed') {
      const email = event.data.customer?.email?.toLowerCase()?.trim();
      const amount = (event.data.amount || 0) / 100;
      const reference = event.data.reference;
      const refundReference = event.data.refund_reference || `REF-${reference}`;
      const metadata = event.data.metadata || {};

      if (metadata.orderReference || metadata.productSlug) {
        try {
          await sendTransactionalEmailEvent({
            templateId: 'DSS-11',
            recipientEmail: email,
            recipientName: metadata.learnerName || '',
            data: {
              firstName: (metadata.learnerName || '').split(' ')[0] || 'there',
              programmeName: metadata.programmeName || 'DSS Programme',
              orderReference: metadata.orderReference || reference,
              refundReference,
              refundAmount: `₦${amount.toLocaleString()}`,
              refundProcessedDatetime: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
              refundDetailsUrl: `${baseUrl}/dss/dashboard`,
            },
            deduplicationKey: `dss-refund-${refundReference}`,
            sourceEvent: 'PAYSTACK_REFUND_PROCESSED',
          });
        } catch (emailErr) {
          console.error('[DSS-11 Send Failed]', emailErr);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
