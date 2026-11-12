import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { rateLimit, clientIp } from '@/lib/rateLimit';

const RESERVED_CODES = new Set([
  'ADMIN',
  'API',
  'LOGIN',
  'SIGNUP',
  'REGISTER',
  'BILLING',
  'SERVICES',
  'DASHBOARD',
  'DSS',
  'TODAY',
  'OPERATOR',
  'PIPELINE',
  'LEADS',
  'INBOX',
  'SETTINGS',
  'PRICING',
  'SOLUTIONS',
  'SUPPORT',
  'EARLYACCESS',
  'EARLY-ACCESS',
  'REFUND',
  'TERMS',
  'PRIVACY',
]);

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await db.affiliateProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      referralCode: true,
      status: true,
      commissionRate: true,
      channel: true,
      marketingExp: true,
      bankName: true,
      bankAccountNumber: true,
      bankAccountName: true,
      createdAt: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Affiliate profile not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, profile });
}

export async function PATCH(req: NextRequest) {
  const ip = clientIp(req);
  const limiter = await rateLimit(`affiliate-settings:${ip}`, 10, 5 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await db.affiliateProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Affiliate profile not found.' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const updateData: any = {};

    // 1. Custom Vanity Referral Code
    if (body.referralCode !== undefined) {
      const cleanCode = String(body.referralCode).trim().toUpperCase();

      if (cleanCode !== profile.referralCode) {
        if (cleanCode.length < 3 || cleanCode.length > 25) {
          return NextResponse.json(
            { error: 'Referral code must be between 3 and 25 characters.' },
            { status: 400 }
          );
        }

        const validCodeRegex = /^[A-Z0-9_-]+$/;
        if (!validCodeRegex.test(cleanCode)) {
          return NextResponse.json(
            { error: 'Referral code can only contain letters, numbers, hyphens, and underscores.' },
            { status: 400 }
          );
        }

        if (RESERVED_CODES.has(cleanCode)) {
          return NextResponse.json(
            { error: `The referral code "${cleanCode}" is reserved and cannot be claimed.` },
            { status: 400 }
          );
        }

        const existing = await db.affiliateProfile.findUnique({
          where: { referralCode: cleanCode },
        });

        if (existing && existing.id !== profile.id) {
          return NextResponse.json(
            { error: `The referral code "${cleanCode}" is already claimed by another partner. Please choose another.` },
            { status: 409 }
          );
        }

        updateData.referralCode = cleanCode;
      }
    }

    // 2. Bank Details
    if (body.bankName !== undefined) {
      updateData.bankName = String(body.bankName).trim().slice(0, 100) || null;
    }

    if (body.bankAccountNumber !== undefined) {
      const cleanAcc = String(body.bankAccountNumber).trim().replace(/\D/g, '');
      if (cleanAcc && cleanAcc.length !== 10) {
        return NextResponse.json(
          { error: 'Nigerian NUBAN bank account number must be exactly 10 digits.' },
          { status: 400 }
        );
      }
      updateData.bankAccountNumber = cleanAcc || null;
    }

    if (body.bankAccountName !== undefined) {
      updateData.bankAccountName = String(body.bankAccountName).trim().slice(0, 150) || null;
    }

    // 3. Marketing Channel / Plan
    if (body.channel !== undefined) {
      updateData.channel = String(body.channel).trim().slice(0, 500) || 'Direct Referral';
    }

    if (body.marketingExp !== undefined) {
      updateData.marketingExp = String(body.marketingExp).trim().slice(0, 1000) || null;
    }

    const updated = await db.affiliateProfile.update({
      where: { id: profile.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Partner settings updated successfully.',
      profile: {
        id: updated.id,
        referralCode: updated.referralCode,
        status: updated.status,
        commissionRate: updated.commissionRate,
        channel: updated.channel,
        marketingExp: updated.marketingExp,
        bankName: updated.bankName,
        bankAccountNumber: updated.bankAccountNumber,
        bankAccountName: updated.bankAccountName,
      },
    });
  } catch (error: any) {
    console.error('[Affiliate Settings Error]', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating settings.' },
      { status: 500 }
    );
  }
}

