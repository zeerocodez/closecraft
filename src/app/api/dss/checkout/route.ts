import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { getDSSProduct } from '@/lib/dss/products';
import { reserveDiscount, releaseDiscountReservation, validateEarlyBirdCode } from '@/lib/dss/early-bird';

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limiter = await rateLimit(`dss-checkout:${ip}`, 15, 5 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Too many checkout attempts. Please wait a few moments before trying again.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const {
      productSlug,
      learnerEmail,
      learnerName,
      couponCode,
      currency = 'NGN',
    } = body;

    // Validate email
    const cleanEmail = typeof learnerEmail === 'string' ? learnerEmail.trim().toLowerCase() : '';
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please provide a valid learner email address.' }, { status: 400 });
    }

    // Validate product
    const product = getDSSProduct(productSlug);
    if (!product) {
      return NextResponse.json({ error: 'Selected programme not found in catalogue.' }, { status: 404 });
    }

    if (currency !== 'NGN') {
      return NextResponse.json({ error: 'This checkout flow only supports NGN currency.' }, { status: 400 });
    }

    const originalFeeNGN = product.priceNGN;
    const originalFeeKobo = product.priceKobo; // integer minor units
    let discountNGN = 0;
    let discountKobo = 0;
    let reservationId: string | null = null;
    let appliedCode: string | null = null;
    const orderReference = `DSS-ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Handle early bird coupon if provided
    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      try {
        const result = await reserveDiscount({
          code: couponCode,
          productSlug,
          learnerEmail: cleanEmail,
          orderReference,
        });

        discountNGN = result.validation.discountAmountNGN;
        discountKobo = result.validation.discountAmountKobo;
        reservationId = result.reservation.id;
        appliedCode = result.validation.campaignCode;
      } catch (err: any) {
        return NextResponse.json(
          {
            error: err.message || 'We couldn’t apply that code. Check it and try again.',
            currentTotalNGN: originalFeeNGN,
          },
          { status: 400 }
        );
      }
    }

    const payableNGN = originalFeeNGN - discountNGN;
    const payableKobo = originalFeeKobo - discountKobo;

    // Calculate affiliate commission on discounted or final payable amount
    // Rule: Do not calculate commissions against an inflated undiscounted price unless an explicit approved agreement requires it.
    const affiliateRate = 0.35; // 35% standard approved affiliate policy
    const affiliateCommissionNGN = Math.round(payableNGN * affiliateRate);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.closecrafthq.com';
    const callbackUrl = `${baseUrl}/dss/dashboard?order=${orderReference}`;

    let checkoutUrl = `${baseUrl}/dss/dashboard?order=${orderReference}&status=success`;
    let paymentReference = `PAY-${orderReference}`;

    // If Paystack is configured, initialize real Paystack transaction
    if (process.env.PAYSTACK_SECRET_KEY) {
      try {
        const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
            amount: payableKobo, // Paystack requires integer kobo
            currency: 'NGN',
            reference: orderReference,
            callback_url: callbackUrl,
            metadata: {
              orderReference,
              reservationId,
              productSlug,
              programmeName: product.title,
              originalFeeNGN,
              discountNGN,
              payableNGN,
              appliedCode,
              learnerName: learnerName || '',
              learnerEmail: cleanEmail,
              affiliateCommissionNGN,
            },
          }),
        });

        const paystackData = await paystackRes.json();
        if (paystackData.status && paystackData.data?.authorization_url) {
          checkoutUrl = paystackData.data.authorization_url;
          paymentReference = paystackData.data.reference || orderReference;
        } else {
          console.warn('[Paystack Initialize Warning]', paystackData.message);
        }
      } catch (paystackErr) {
        console.error('[Paystack Initialization Failed]', paystackErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderReference,
      paymentReference,
      checkoutUrl,
      orderSummary: {
        programmeTitle: product.title,
        programmeFee: `₦${originalFeeNGN.toLocaleString()}`,
        originalFeeNGN,
        discountApplied: discountNGN > 0,
        discountCode: appliedCode,
        discountLabel: appliedCode ? `Early bird discount — ${appliedCode}` : null,
        discountAmount: discountNGN > 0 ? `₦${discountNGN.toLocaleString()}` : null,
        discountNGN,
        applicableTaxesOrFees: null, // No unapproved fees
        totalPayable: `₦${payableNGN.toLocaleString()}`,
        payableNGN,
        payableKobo,
        reservationId,
      },
    });
  } catch (err: any) {
    console.error('[DSS Checkout API Error]', err);
    return NextResponse.json({ error: 'Failed to initialize checkout session' }, { status: 500 });
  }
}
