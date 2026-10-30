import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getAffiliateDashboardData,
  registerAffiliate,
  getDemoDashboardData,
} from '@/lib/dss/affiliate-store';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const isDemo = url.searchParams.get('demo') === '1';

    if (isDemo) {
      return NextResponse.json(getDemoDashboardData());
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Sign in required to access affiliate data.' }, { status: 401 });
    }

    const isOperator = (session.user as any)?.role === 'OPERATOR' || (session.user as any)?.role === 'SUPER_ADMIN';
    const email = isOperator ? (url.searchParams.get('email') || session.user.email) : session.user.email;
    const code = isOperator ? url.searchParams.get('code') : undefined;

    const data = await getAffiliateDashboardData(code || email || undefined);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('DSS affiliate GET API error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch affiliate data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Rate limit: max 5 registrations per 10 minutes per IP
  const ip = clientIp(req);
  const limiter = await rateLimit(`dss-affiliate-reg:${ip}`, 5, 10 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json({ error: 'Too many registrations. Please try again later.' }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot spam check
    if (body.website || body.hpField || body.company_fax) {
      return NextResponse.json({ success: true, message: 'Received' });
    }

    const { name, email, channel, consent } = body;

    if (!name || !email || !channel) {
      return NextResponse.json({ error: 'Name, email, and promotion channel are required' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Invalid email address syntax' }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json({ error: 'Consent to terms is required' }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id;

    const affiliate = await registerAffiliate({
      name: String(name).trim().slice(0, 100),
      email: cleanEmail.slice(0, 180),
      channel: String(channel).trim().slice(0, 100),
      userId,
    });

    return NextResponse.json({ success: true, affiliate });
  } catch (error: any) {
    console.error('DSS affiliate registration error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to register affiliate' }, { status: 500 });
  }
}
