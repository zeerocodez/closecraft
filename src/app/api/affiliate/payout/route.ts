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
    const body = await req.json().catch(() => ({}));
    const rawRequested = body.amountNgn !== undefined && body.amountNgn !== null
      ? parseFloat(String(body.amountNgn))
      : null;

    // Concurrency protection: Atomic transaction with row-level lock FOR UPDATE
    const txResult = await db.$transaction(async (tx) => {
      // 1. Acquire exclusive lock on the affiliate profile row
      await tx.$executeRaw`SELECT "id" FROM "AffiliateProfile" WHERE "userId" = ${session.user.id} FOR UPDATE;`;

      // 2. Fetch fresh profile with commissions and payouts under lock
      const profile = await tx.affiliateProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          commissions: true,
          payouts: true,
        },
      });

      if (!profile) {
        return { ok: false, status: 404, error: 'No active affiliate profile found.' };
      }

      if (profile.status !== 'APPROVED') {
        return { ok: false, status: 403, error: 'Your affiliate account is currently pending or suspended.' };
      }

      // 3. Compute cleared available commission under lock
      const totalEarned = profile.commissions
        .filter((c) => c.status === 'APPROVED' || c.status === 'PAYABLE')
        .reduce((sum, c) => sum + c.amount, 0);

      const totalPaidOrRequested = profile.payouts
        .filter((p) => p.status !== 'REJECTED')
        .reduce((sum, p) => sum + p.amount, 0);

      const availableNgn = Math.max(0, totalEarned - totalPaidOrRequested);

      if (availableNgn < MINIMUM_PAYOUT_NGN) {
        return {
          ok: false,
          status: 400,
          error: `Minimum payout threshold is ₦10,000. Your available balance is ₦${availableNgn.toLocaleString()}.`,
        };
      }

      const requestedNgn = rawRequested !== null && !isNaN(rawRequested)
        ? rawRequested
        : availableNgn;

      if (requestedNgn < MINIMUM_PAYOUT_NGN) {
        return {
          ok: false,
          status: 400,
          error: 'Minimum payout withdrawal is ₦10,000.',
        };
      }

      if (requestedNgn > availableNgn) {
        return {
          ok: false,
          status: 400,
          error: 'Requested amount exceeds your available cleared commission balance.',
        };
      }

      const payoutRef = `PAYOUT-CC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const bankSnapshot = `${profile.bankName || ''} - ${profile.bankAccountNumber || ''} (${profile.bankAccountName || ''})`;

      const payout = await tx.affiliatePayout.create({
        data: {
          affiliateId: profile.id,
          amount: requestedNgn,
          status: 'REQUESTED',
          reference: payoutRef,
          bankDetails: bankSnapshot,
        },
      });

      return {
        ok: true,
        status: 200,
        payout,
      };
    });

    if (!txResult.ok) {
      return NextResponse.json({ error: txResult.error }, { status: txResult.status });
    }

    return NextResponse.json({
      success: true,
      payoutReference: txResult.payout!.reference,
      amountNgn: txResult.payout!.amount,
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
