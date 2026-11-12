import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendTransactionalEmailEvent } from '@/lib/email/service';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { rateLimit, clientIp } from '@/lib/rateLimit';

function generateAffiliateCode(name: string): string {
  const cleanName = (name || 'PARTNER')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6) || 'PARTNER';
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `CC-${cleanName}${rand}`;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limiter = await rateLimit(`affiliate-apply:${ip}`, 10, 15 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));

    // Honeypot check
    if (body.hpField || body.website) {
      return NextResponse.json({ success: true, message: 'Application received.' });
    }

    const {
      name,
      email,
      password,
      whatsappNumber,
      marketingChannels,
      promotionPlan,
      bankName,
      bankAccountNumber,
      bankAccountName,
    } = body;

    let targetUserId = session?.user?.id;
    let verificationRequired = false;

    if (!targetUserId) {
      if (!email || !password || !name) {
        return NextResponse.json(
          { error: 'Name, email, and password are required to register as an affiliate partner.' },
          { status: 400 }
        );
      }

      if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          typeof password !== 'string' || password.length < 8 || password.length > 100) {
        return NextResponse.json({ error: 'Valid email and password of 8 to 100 characters required.' }, { status: 400 });
      }
      const cleanEmail = email.trim().toLowerCase();
      const existingUser = await db.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in before applying.' },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const cleanName = name.trim();
      const baseSlug = `affiliate-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)}-${Date.now().toString(36)}`;

      const verificationCode = crypto.randomInt(100000, 1000000).toString();
      const created = await db.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: {
            name: `${cleanName} (Partner)`,
            slug: baseSlug,
            whatsappNumber: whatsappNumber || '08000000000',
            plan: 'STARTER',
            status: 'APPROVED',
          },
        });

        const user = await tx.user.create({
          data: {
            name: cleanName,
            email: cleanEmail,
            passwordHash,
            emailVerified: null,
            emailVerificationCode: verificationCode,
            emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            memberships: {
              create: {
                role: 'ADMIN',
                organizationId: org.id,
              },
            },
          },
        });

        return { user, org };
      });

      targetUserId = created.user.id;
      verificationRequired = true;
      try {
        await sendTransactionalEmailEvent({
          templateId: 'CC-01', recipientEmail: cleanEmail, recipientName: cleanName,
          organizationId: created.org.id, sourceEvent: 'user.registered',
          data: { first_name: cleanName.split(' ')[0], verification_code: verificationCode,
            verification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.closecrafthq.com'}/verify-email?email=${encodeURIComponent(cleanEmail)}&code=${verificationCode}`,
            verification_expiry_description: 'in 24 hours' },
        });
      } catch { console.error('[Affiliate Apply] Verification email delivery failed'); }

    }

    // Check if user already has an affiliate profile
    const existingProfile = await db.affiliateProfile.findUnique({
      where: { userId: targetUserId },
    });

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        affiliateCode: existingProfile.referralCode,
        message: 'You are already an active CloseCraft affiliate partner.',
        verificationRequired,
        redirectUrl: verificationRequired ? '/verify-email' : '/affiliate/dashboard',
      });
    }

    const user = await db.user.findUnique({ where: { id: targetUserId } });
    let code = generateAffiliateCode(user?.name || 'PARTNER');

    while (await db.affiliateProfile.findUnique({ where: { referralCode: code } })) {
      code = generateAffiliateCode(user?.name || 'PARTNER');
    }

    const profile = await db.affiliateProfile.create({
      data: {
        userId: targetUserId,
        referralCode: code,
        status: 'APPROVED',
        commissionRate: 15.0,
        channel: marketingChannels ? String(marketingChannels).trim().slice(0, 500) : 'Direct Referral',
        marketingExp: promotionPlan ? String(promotionPlan).trim().slice(0, 1000) : null,
        bankName: bankName ? String(bankName).trim().slice(0, 100) : null,
        bankAccountNumber: bankAccountNumber ? String(bankAccountNumber).trim().slice(0, 30) : null,
        bankAccountName: bankAccountName ? String(bankAccountName).trim().slice(0, 150) : null,
      },
    });

    return NextResponse.json({
      success: true,
      affiliateCode: profile.referralCode,
      message: 'CloseCraft Affiliate Partner profile activated successfully.',
      verificationRequired,
      redirectUrl: verificationRequired ? '/verify-email' : '/affiliate/dashboard',
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Affiliate Apply Error]', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating your affiliate profile.' },
      { status: 500 }
    );
  }
}
