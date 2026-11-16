import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { submitMilestoneDeliverable } from '@/lib/growth/milestones';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectRequestId = searchParams.get('projectRequestId');

    if (!projectRequestId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: projectRequestId' },
        { status: 400 }
      );
    }

    const projectRequest = await db.projectRequest.findUnique({
      where: { id: projectRequestId },
      include: {
        assignedPartner: true,
      },
    });

    if (!projectRequest) {
      return NextResponse.json({ error: 'Project request not found.' }, { status: 404 });
    }

    const userOrgId = (session.user as any).organizationId;
    const userRole = (session.user as any).role;
    const isPlatformStaff = ['OPERATOR', 'SUPER_ADMIN', 'ADMIN'].includes(userRole);
    const isOwnerOrg = userOrgId && userOrgId === projectRequest.organizationId;
    const isAssignedPartner = projectRequest.assignedPartner?.userId === session.user.id;

    if (!isPlatformStaff && !isOwnerOrg && !isAssignedPartner) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view milestones for this project.' },
        { status: 403 }
      );
    }

    const milestones = await db.projectMilestone.findMany({
      where: { projectRequestId },
      orderBy: { sequenceOrder: 'asc' },
    });

    return NextResponse.json({ milestones });
  } catch (err: any) {
    console.error('[Growth Milestones GET Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve milestones.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { milestoneId, proofUrl, submissionNotes } = body;

    if (!milestoneId || typeof milestoneId !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: milestoneId' },
        { status: 400 }
      );
    }

    if (!proofUrl || typeof proofUrl !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: proofUrl' },
        { status: 400 }
      );
    }

    const updated = await submitMilestoneDeliverable({
      milestoneId,
      partnerUserId: session.user.id,
      proofUrl,
      submissionNotes,
    });

    return NextResponse.json({
      success: true,
      message: 'Deliverable proof submitted for client review.',
      milestone: updated,
    });
  } catch (err: any) {
    console.error('[Growth Milestone Deliverable Submission Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to submit milestone deliverable.' },
      { status: 500 }
    );
  }
}

