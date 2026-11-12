import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { assertStaffPermission } from '@/lib/permissions/matrix';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await assertStaffPermission(session.user.id, 'workforce:view_roster');

    const staff = await db.staffProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, role: true }
        },
        assignedTasks: {
          select: { id: true, status: true, priority: true, dueDate: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const staffWithMetrics = staff.map(s => {
      const activeTasks = s.assignedTasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length;
      const completedTasks = s.assignedTasks.filter(t => t.status === 'COMPLETED').length;
      return {
        ...s,
        activeTasksCount: activeTasks,
        completedTasksCount: completedTasks,
      };
    });

    return NextResponse.json({ success: true, staff: staffWithMetrics });
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

    await assertStaffPermission(session.user.id, 'workforce:manage_staff');

    const body = await req.json();
    const { email, name, role, department, phone, timezone, weeklyCapacity, skills, notes } = body;

    if (!email || !name || !role) {
      return NextResponse.json({ error: 'Email, name, and role are required.' }, { status: 400 });
    }

    const { createStaffAccountAction } = await import('@/app/(saas)/operator/workforceActions');
    const result = await createStaffAccountAction({
      email,
      name,
      role,
      department,
      phone,
      timezone,
      weeklyCapacity: weeklyCapacity ? parseInt(weeklyCapacity, 10) : 40,
      skills,
      notes,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

