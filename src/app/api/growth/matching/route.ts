import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rankEligiblePartnersForProject } from '@/lib/growth/matching';

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
        { error: 'Forbidden: Only operators and administrators can access partner matching.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectRequestId = searchParams.get('projectRequestId');

    if (!projectRequestId) {
      return NextResponse.json(
        { error: 'Missing required parameter: projectRequestId' },
        { status: 400 }
      );
    }

    const rankedMatches = await rankEligiblePartnersForProject(projectRequestId);

    return NextResponse.json({
      success: true,
      projectRequestId,
      matchCount: rankedMatches.length,
      matches: rankedMatches,
    });
  } catch (err: any) {
    console.error('[Growth Partner Matching Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to match partners for project request.' },
      { status: 500 }
    );
  }
}
