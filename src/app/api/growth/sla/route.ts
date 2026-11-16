import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { monitorProjectRequestSlas } from '@/lib/growth/matching';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    const isAuthorized = role === 'OPERATOR' || role === 'SUPER_ADMIN' || role === 'ADMIN';

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden: Only operators and administrators can view SLA monitoring reports.' },
        { status: 403 }
      );
    }

    const report = await monitorProjectRequestSlas();

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error('[Growth SLA Monitor Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate SLA monitor report.' },
      { status: 500 }
    );
  }
}

