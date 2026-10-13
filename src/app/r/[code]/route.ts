import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordAffiliateClick, findAffiliateByCode } from '@/lib/dss/affiliate-store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const origin = new URL(request.url).origin;
  const fallbackUrl = `${origin}/dss`;

  if (!code) {
    return NextResponse.redirect(fallbackUrl, 302);
  }

  const affiliate = await findAffiliateByCode(code);
  if (!affiliate || affiliate.status !== 'approved') {
    return NextResponse.redirect(fallbackUrl, 302);
  }

  // Check visitor cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)dss_visitor=([A-Za-z0-9-]{36})(?:;|$)/);
  const visitorId = match ? match[1] : crypto.randomUUID();

  // Record click
  await recordAffiliateClick(code, visitorId);

  const destination = `${origin}/dss?ref=${encodeURIComponent(code)}`;
  const response = NextResponse.redirect(destination, 302);

  // Set 30-day tracking cookie
  response.cookies.set('dss_visitor', visitorId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return response;
}
