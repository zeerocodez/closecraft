import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { createCommitment } from '@/lib/commitments/commitmentService';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const commitments = await db.customerCommitment.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {})
      },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, orderNumber: true, agreedAmount: true, currency: true } }
      },
      orderBy: [{ isOverdue: 'desc' }, { dueDate: 'asc' }]
    });

    return NextResponse.json({ success: true, commitments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch commitments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.title || !body.dueDate) {
      return NextResponse.json({ error: 'title and dueDate are required' }, { status: 400 });
    }

    const commitment = await createCommitment({
      organizationId,
      title: body.title,
      description: body.description || '',
      commitmentType: body.commitmentType || 'DELIVERABLE',
      dueDate: new Date(body.dueDate),
      priority: body.priority || 'MEDIUM',
      leadId: body.leadId || null,
      dealId: body.dealId || null,
      assignedUserId: body.assignedUserId || session.user.id,
      orderId: body.orderId || null,
      userId: session.user.id
    });

    return NextResponse.json({ success: true, commitment });
  } catch (err: any) {
    console.error('[API /commitments POST Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to create commitment' }, { status: 500 });
  }
}
