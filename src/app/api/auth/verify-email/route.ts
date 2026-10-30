import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rateLimit';
import { timingSafeEqualString } from '@/lib/apiSecurity';
import { sendTransactionalEmailEvent } from '@/lib/email/service';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const url = new URL(req.url);
    const queryEmail = url.searchParams.get('email')?.trim().toLowerCase();

    let user = null;
    if (session?.user?.id) {
      user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          emailVerified: true,
        },
      });
    } else if (queryEmail) {
      user = await db.user.findUnique({
        where: { email: queryEmail },
        select: {
          id: true,
          email: true,
          emailVerified: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json({ authenticated: false, verified: false });
    }

    return NextResponse.json({
      authenticated: true,
      email: user.email,
      verified: !!user.emailVerified,
    });
  } catch (err: any) {
    console.error('[Verify Email GET Error]:', err);
    return NextResponse.json({ error: 'Failed to inspect verification status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));
    const { code, quickVerify, resend, email: bodyEmail } = body;

    let user = null;
    if (session?.user?.id) {
      user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
          memberships: {
            include: { organization: true },
          },
        },
      });
    } else if (bodyEmail && typeof bodyEmail === 'string') {
      const cleanEmail = bodyEmail.trim().toLowerCase();
      user = await db.user.findUnique({
        where: { email: cleanEmail },
        include: {
          memberships: {
            include: { organization: true },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in or provide your registered email address.' },
        { status: 401 }
      );
    }

    // If already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'Email address is already verified.',
      });
    }

    // Handle Resend Request with rate limit (max 3 resends per 10 minutes)
    if (resend) {
      const resendLimit = await rateLimit(`verify-email-resend:${user.id}`, 3, 10 * 60 * 1000);
      if (!resendLimit.allowed) {
        return NextResponse.json(
          { error: 'Too many verification code requests. Please wait a few minutes before trying again.' },
          { status: 429 }
        );
      }

      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerificationCode: newCode,
          emailVerificationExpiresAt: expiresAt,
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://www.closecrafthq.com';
      const verificationUrl = `${baseUrl}/verify-email?code=${newCode}&email=${encodeURIComponent(user.email)}`;
      const primaryOrg = user.memberships[0]?.organization;

      try {
        await sendTransactionalEmailEvent({
          templateId: 'CC-01',
          recipientEmail: user.email,
          recipientName: user.name || undefined,
          organizationId: primaryOrg?.id,
          sourceEvent: 'user.resend_verification',
          data: {
            first_name: user.name ? user.name.split(' ')[0] : undefined,
            verification_code: newCode,
            verification_url: verificationUrl,
            verification_expiry_description: 'in 24 hours',
          },
        });
      } catch (err) {
        console.error('[Verify Email Resend] Failed to dispatch CC-01 email:', err);
      }

      return NextResponse.json({
        success: true,
        message: 'A fresh verification code has been dispatched to your email.',
      });
    }

    // Disable Quick Verify in production mode
    if (quickVerify) {
      return NextResponse.json(
        { error: 'Quick verification is disabled in production mode.' },
        { status: 403 }
      );
    }

    // Standard Code Verification with brute-force rate limit (max 6 attempts per 10 min)
    const attemptLimit = await rateLimit(`verify-email-attempt:${user.id}`, 6, 10 * 60 * 1000);
    if (!attemptLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many incorrect verification attempts. Please wait 10 minutes.' },
        { status: 429 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Please enter the 6-digit verification code.' }, { status: 400 });
    }

    const cleanCode = code.trim();

    if (user.emailVerificationExpiresAt && new Date() > user.emailVerificationExpiresAt) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    if (!user.emailVerificationCode || !timingSafeEqualString(user.emailVerificationCode, cleanCode)) {
      return NextResponse.json({ error: 'Incorrect verification code. Please check and try again.' }, { status: 400 });
    }

    // Mark email verified
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationCode: null,
        emailVerificationExpiresAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully.',
    });
  } catch (error: any) {
    console.error('[Verify Email API Error]:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during verification.' }, { status: 500 });
  }
}
