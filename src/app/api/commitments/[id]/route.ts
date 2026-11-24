import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { completeCommitment } from '@/lib/commitments/commitmentService';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: commitmentId } = await params;
    const body = await req.json().catch(() => ({}));

    if (body.action === 'COMPLETE') {
      const updated = await completeCommitment({
        commitmentId,
        organizationId,
        completionEvidence: body.completionEvidence || 'Confirmed delivered by assigned sales rep.',
        userId: session.user.id
      });
      return NextResponse.json({ success: true, commitment: updated });
    }

    // General update
    const updated = await db.customerCommitment.update({
      where: { id: commitmentId },
      data: {
        ...(body.title ? { title: body.title } : {}),
        ...(body.description ? { description: body.description } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(body.priority ? { priority: body.priority } : {}),
        ...(body.dueDate ? { dueDate: new Date(body.dueDate) } : {}),
        ...(body.assignedUserId ? { assignedUserId: body.assignedUserId } : {})
      }
    });

    return NextResponse.json({ success: true, commitment: updated });
  } catch (err: any) {
    console.error('[API /commitments/[id] PATCH Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to update commitment' }, { status: 500 });
  }
}
