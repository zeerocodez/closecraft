import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getAffiliateDashboardData,
  registerAffiliate,
  getDemoDashboardData,
} from '@/lib/dss/affiliate-store';

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
  try {
    const body = await req.json();
    const { name, email, channel, consent } = body;

    if (!name || !email || !channel) {
      return NextResponse.json({ error: 'Name, email, and promotion channel are required' }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json({ error: 'Consent to terms is required' }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id;

    const affiliate = await registerAffiliate({
      name,
      email,
      channel,
      userId,
    });

    return NextResponse.json({ success: true, affiliate });
  } catch (error: any) {
    console.error('DSS affiliate registration error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to register affiliate' }, { status: 500 });
  }
}
