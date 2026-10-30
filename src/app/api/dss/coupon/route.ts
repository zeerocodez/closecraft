import { NextResponse } from 'next/server';
import { validateEarlyBirdCode } from '@/lib/dss/early-bird';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limiter = await rateLimit(`coupon-validate:${ip}`, 30, 5 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Too many coupon check attempts. Please wait a moment.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { code, productSlug, learnerEmail, existingDiscountApplied, currency } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'We couldn’t apply that code. Check it and try again.' },
        { status: 400 }
      );
    }

    if (!productSlug || typeof productSlug !== 'string') {
      return NextResponse.json(
        { error: 'This offer applies to selected DSS programmes. It isn’t available for this purchase.' },
        { status: 400 }
      );
    }

    const result = await validateEarlyBirdCode({
      code,
      productSlug,
      learnerEmail: learnerEmail || undefined,
      existingDiscountApplied: Boolean(existingDiscountApplied),
      currency: currency || 'NGN',
    });

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: result.error,
          code: result.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      data: result,
      message: `Early bird offer applied. You saved ₦${result.discountAmountNGN.toLocaleString('en-NG')}.`,
    });
  } catch (err: unknown) {
    console.error('Coupon validation error:', err);
    return NextResponse.json(
      {
        valid: false,
        error: 'We couldn’t check the code right now. Please try again before paying.',
      },
      { status: 500 }
    );
  }
}
