import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasStaffPermission, assertStaffPermission } from '@/lib/permissions/matrix';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientServiceId = searchParams.get('clientServiceId');
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const assignedStaffId = searchParams.get('assignedStaffId');

    const callerOrgId = (session as any).organizationId;
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { staffProfile: true }
    });

    const isOperator = user?.role === 'SUPER_ADMIN' || user?.role === 'OPERATOR' || 
      (user?.staffProfile && hasStaffPermission(user.staffProfile.role, 'tasks:view_all'));

    // Tenant isolation: if not operator, strictly scope to caller's organizationId
    const effectiveOrgId = isOperator ? (organizationId || undefined) : callerOrgId;

    if (!isOperator && !effectiveOrgId) {
      return NextResponse.json({ error: 'No workspace context' }, { status: 403 });
    }

    const where: any = {
      ...(effectiveOrgId ? { organizationId: effectiveOrgId } : {}),
      ...(clientServiceId ? { clientServiceId } : {}),
      ...(status ? { status } : {}),
      ...(assignedStaffId ? { assignedStaffId } : {}),
    };

    const tasks = await db.serviceDeliveryTask.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true } },
        clientService: { select: { id: true, name: true, category: true, tier: true } },
        assignedStaff: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await assertStaffPermission(session.user.id, 'tasks:create');

    const body = await req.json();
    const { organizationId, clientServiceId, assignedStaffId, title, description, category, priority, dueDate } = body;

    if (!organizationId || !title || !category) {
      return NextResponse.json({ error: 'Missing required task fields (organizationId, title, category)' }, { status: 400 });
    }

    const task = await db.serviceDeliveryTask.create({
      data: {
        organizationId,
        clientServiceId: clientServiceId || null,
        assignedStaffId: assignedStaffId || null,
        title: title.trim(),
        description: description?.trim() || null,
        category,
        priority: priority || 'MEDIUM',
        status: 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

