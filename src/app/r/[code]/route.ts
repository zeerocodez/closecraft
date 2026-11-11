import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { recordAffiliateClick, findAffiliateByCode } from '@/lib/dss/affiliate-store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const url = new URL(request.url);
  const origin = url.origin;
  const requestedDest = url.searchParams.get('dest') || '/';
  const cleanCode = (code || '').trim().toUpperCase();

  if (!cleanCode) {
    return NextResponse.redirect(`${origin}/`, 302);
  }

  // 1. Check CloseCraft 2.0 Platform Affiliate
  try {
    const affiliate = await db.affiliateProfile.findUnique({
      where: { referralCode: cleanCode },
    });

    if (affiliate && affiliate.status !== 'SUSPENDED') {
      const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // Record referral event
      await db.referralEvent.create({
        data: {
          affiliateId: affiliate.id,
          ipAddress: clientIp.slice(0, 45),
          userAgent: userAgent.slice(0, 250),
          landingPage: requestedDest.slice(0, 200),
        },
      }).catch((e) => {
        console.warn('[ReferralEvent Error]', e.message);
      });

      const destination = `${origin}${requestedDest.startsWith('/') ? requestedDest : `/${requestedDest}`}?ref=${encodeURIComponent(cleanCode)}`;
      const response = NextResponse.redirect(destination, 302);

      // Set 60-day tracking cookies
      const cookieOptions = {
        httpOnly: false,
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 24 * 60 * 60, // 60 days
      };

      response.cookies.set('closecraft_ref', cleanCode, cookieOptions);
      response.cookies.set('ref', cleanCode, cookieOptions);

      return response;
    }
  } catch (err) {
    console.warn('[Affiliate Redirect Error]', err);
  }

  // 2. Legacy DSS Affiliate fallback
  const dssAffiliate = await findAffiliateByCode(cleanCode);
  if (dssAffiliate && dssAffiliate.status === 'approved') {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)dss_visitor=([A-Za-z0-9-]{36})(?:;|$)/);
    const visitorId = match ? match[1] : crypto.randomUUID();

    await recordAffiliateClick(cleanCode, visitorId);

    const destination = `${origin}/dss?ref=${encodeURIComponent(cleanCode)}`;
    const response = NextResponse.redirect(destination, 302);

    response.cookies.set('dss_visitor', visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
    response.cookies.set('ref', cleanCode, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  }

  // Fallback to home
  return NextResponse.redirect(`${origin}/`, 302);
}
