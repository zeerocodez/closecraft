import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import crypto from 'crypto';

const MINIMUM_PAYOUT_NGN = 10000; // ₦10,000

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limiter = await rateLimit(`affiliate-payout:${ip}`, 5, 10 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in to request payout.' }, { status: 401 });
  }

  try {
    const profile = await db.affiliateProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        commissions: true,
        payouts: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'No active affiliate profile found.' }, { status: 404 });
    }

    if (profile.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Your affiliate account is currently pending or suspended.' }, { status: 403 });
    }

    // Calculate cleared available commission
    const totalEarned = profile.commissions
      .filter((c) => c.status === 'APPROVED' || c.status === 'PAYABLE')
      .reduce((sum, c) => sum + c.amount, 0);

    const totalPaidOrRequested = profile.payouts
      .filter((p) => p.status !== 'REJECTED')
      .reduce((sum, p) => sum + p.amount, 0);

    const availableNgn = Math.max(0, totalEarned - totalPaidOrRequested);

    if (availableNgn < MINIMUM_PAYOUT_NGN) {
      return NextResponse.json(
        { error: `Minimum payout threshold is ₦10,000. Your available balance is ₦${availableNgn.toLocaleString()}.` },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const requestedNgn = parseFloat(body.amountNgn || availableNgn);

    if (requestedNgn > availableNgn) {
      return NextResponse.json(
        { error: 'Requested amount exceeds your available cleared commission balance.' },
        { status: 400 }
      );
    }

    if (requestedNgn < MINIMUM_PAYOUT_NGN) {
      return NextResponse.json(
        { error: 'Minimum payout withdrawal is ₦10,000.' },
        { status: 400 }
      );
    }

    const payoutRef = `PAYOUT-CC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const bankSnapshot = `${profile.bankName || ''} - ${profile.bankAccountNumber || ''} (${profile.bankAccountName || ''})`;

    const payout = await db.affiliatePayout.create({
      data: {
        affiliateId: profile.id,
        amount: requestedNgn,
        status: 'REQUESTED',
        reference: payoutRef,
        bankDetails: bankSnapshot,
      },
    });

    return NextResponse.json({
      success: true,
      payoutReference: payout.reference,
      amountNgn: payout.amount,
      message: 'Payout request received. Bank transfers are cleared within 24 to 48 business hours.',
    });
  } catch (error: any) {
    console.error('[Affiliate Payout Error]', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while submitting your payout request.' },
      { status: 500 }
    );
  }
}
