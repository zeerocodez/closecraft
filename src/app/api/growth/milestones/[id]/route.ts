import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { reviewMilestoneDeliverable } from '@/lib/growth/milestones';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userOrgId = (session.user as any).organizationId;

    if (!userOrgId) {
      return NextResponse.json(
        { error: 'Forbidden: You must belong to an organization to review deliverables.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, feedback } = body;

    if (!action || !['APPROVE', 'REQUEST_REVISION'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'APPROVE' or 'REQUEST_REVISION'." },
        { status: 400 }
      );
    }

    const result = await reviewMilestoneDeliverable({
      milestoneId: id,
      reviewerUserId: session.user.id,
      organizationId: userOrgId,
      action,
      feedback,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Growth Milestone Review Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to review milestone deliverable.' },
      { status: 500 }
    );
  }
}

