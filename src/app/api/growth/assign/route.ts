import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { assignPartnerToProjectRequest } from '@/lib/growth/matching';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    const isAuthorized = role === 'OPERATOR' || role === 'SUPER_ADMIN' || role === 'ADMIN';

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden: Only operators and administrators can execute partner assignment.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { projectRequestId, partnerId, operatorNotes } = body;

    if (!projectRequestId || typeof projectRequestId !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: projectRequestId' },
        { status: 400 }
      );
    }

    if (!partnerId || typeof partnerId !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: partnerId' },
        { status: 400 }
      );
    }

    const result = await assignPartnerToProjectRequest({
      projectRequestId,
      partnerId,
      assignedByUserId: session.user.id,
      operatorNotes,
    });

    return NextResponse.json({
      message: `Partner assigned successfully to project ${result.projectRequest.reference}.`,
      ...result,
    });
  } catch (err: any) {
    console.error('[Growth Partner Assignment Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to assign partner to project request.' },
      { status: 500 }
    );
  }
}
