import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rateLimit';
import { timingSafeEqualString } from '@/lib/apiSecurity';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { code, quickVerify, resend } = body;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailVerificationCode: true,
        emailVerificationExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
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

      console.log(`\n=========================================`);
      console.log(`[MOCK EMAIL RESENT TO: ${user.email}]`);
      console.log(`Subject: New Closecraft Verification Code`);
      console.log(`Your 6-digit verification code is: ${newCode}`);
      console.log(`=========================================\n`);

      return NextResponse.json({
        success: true,
        message: 'A fresh verification code has been dispatched.',
      });
    }

    // Handle Quick Verify (Development / Testing convenience only)
    if (quickVerify) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Quick verification is disabled in production environments.' },
          { status: 403 }
        );
      }

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
        message: 'Email verified successfully (Quick Verify).',
      });
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
