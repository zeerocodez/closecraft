'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { assertStaffPermission, StaffRole } from '@/lib/permissions/matrix';

/**
 * Creates or updates an internal remote staff account with assigned role, department, capacity, and skills.
 */
export async function createStaffAccountAction(data: {
  email: string;
  name: string;
  role: StaffRole;
  department?: string;
  phone?: string;
  timezone?: string;
  weeklyCapacity?: number;
  skills?: string[];
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await assertStaffPermission(session.user.id, 'workforce:manage_staff');

  const normalizedEmail = data.email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Valid email address is required.');
  }
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Staff full name is required.');
  }

  // 1. Find or create User record
  let user = await db.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: data.name.trim(),
        role: data.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'OPERATOR',
      }
    });
  } else {
    // Elevate platform role if needed
    if (data.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
      await db.user.update({
        where: { id: user.id },
        data: { role: 'SUPER_ADMIN' }
      });
    } else if (user.role === 'USER') {
      await db.user.update({
        where: { id: user.id },
        data: { role: 'OPERATOR' }
      });
    }
  }

  // 2. Infer department if not provided
  let department = data.department || 'OPERATIONS';
  if (!data.department) {
    if (data.role === 'CLOSER' || data.role === 'SETTER' || data.role === 'LEAD_MANAGER') {
      department = 'SALES';
    } else if (data.role === 'MARKETING_SPECIALIST' || data.role === 'ADS_SPECIALIST') {
      department = 'MARKETING';
    } else if (data.role === 'SUPPORT_REP') {
      department = 'SUPPORT';
    } else if (data.role === 'SUPER_ADMIN' || data.role === 'OPERATIONS_MANAGER') {
      department = 'MANAGEMENT';
    }
  }

  // 3. Upsert StaffProfile
  const profile = await db.staffProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      role: data.role,
      department,
      phone: data.phone || null,
      timezone: data.timezone || 'Africa/Lagos',
      weeklyCapacity: data.weeklyCapacity || 40,
      status: 'ACTIVE',
      skills: data.skills || [],
      notes: data.notes || null,
    },
    update: {
      role: data.role,
      department,
      phone: data.phone !== undefined ? data.phone : undefined,
      timezone: data.timezone || undefined,
      weeklyCapacity: data.weeklyCapacity !== undefined ? data.weeklyCapacity : undefined,
      skills: data.skills !== undefined ? data.skills : undefined,
      notes: data.notes !== undefined ? data.notes : undefined,
      status: 'ACTIVE',
    }
  });

  // 4. Audit Log
  const callerOrgId = (session as any).organizationId || 
    (await db.organizationMember.findFirst({ where: { userId: session.user.id }, select: { organizationId: true } }))?.organizationId ||
    (await db.organization.findFirst({ select: { id: true } }))?.id;

  if (callerOrgId) {
    await db.auditLog.create({
      data: {
        organizationId: callerOrgId,
        actorId: session.user.id,
        actorType: 'USER',
        actorRole: 'OPERATOR',
        action: 'WORKFORCE_STAFF_PROVISIONED',
        resourceType: 'STAFF_PROFILE',
        resourceId: profile.id,
        reason: `Staff profile for ${data.name} (${data.role}) created/updated`,
        metadata: JSON.stringify({ email: normalizedEmail, role: data.role, department }),
      }
    });
  }

  revalidatePath('/operator');
  revalidatePath('/admin');

  return { success: true, profileId: profile.id, userId: user.id };
}

/**
 * Updates staff status, capacity, or role.
 */
export async function updateStaffStatusAction(data: {
  staffId: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  role?: StaffRole;
  weeklyCapacity?: number;
  skills?: string[];
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await assertStaffPermission(session.user.id, 'workforce:manage_staff');

  const updated = await db.staffProfile.update({
    where: { id: data.staffId },
    data: {
      status: data.status,
      ...(data.role ? { role: data.role } : {}),
      ...(data.weeklyCapacity !== undefined ? { weeklyCapacity: data.weeklyCapacity } : {}),
      ...(data.skills !== undefined ? { skills: data.skills } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    }
  });

  const callerOrgId = (session as any).organizationId || 
    (await db.organizationMember.findFirst({ where: { userId: session.user.id }, select: { organizationId: true } }))?.organizationId ||
    (await db.organization.findFirst({ select: { id: true } }))?.id;

  if (callerOrgId) {
    await db.auditLog.create({
      data: {
        organizationId: callerOrgId,
        actorId: session.user.id,
        actorType: 'USER',
        actorRole: 'OPERATOR',
        action: 'WORKFORCE_STAFF_STATUS_UPDATED',
        resourceType: 'STAFF_PROFILE',
        resourceId: updated.id,
        reason: `Staff status changed to ${data.status}`,
        metadata: JSON.stringify(data),
      }
    });
  }

  revalidatePath('/operator');
  revalidatePath('/admin');

  return { success: true, profile: updated };
}

/**
 * Creates and allocates a service delivery task to a remote staff member.
 */
export async function createServiceDeliveryTaskAction(data: {
  organizationId: string;
  clientServiceId?: string;
  assignedStaffId?: string;
  title: string;
  description?: string;
  category: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await assertStaffPermission(session.user.id, 'tasks:create');

  if (!data.organizationId) throw new Error('Client organization is required.');
  if (!data.title || data.title.trim().length === 0) throw new Error('Task title is required.');
  if (!data.category) throw new Error('Task category is required.');

  const task = await db.serviceDeliveryTask.create({
    data: {
      organizationId: data.organizationId,
      clientServiceId: data.clientServiceId || null,
      assignedStaffId: data.assignedStaffId || null,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      category: data.category,
      priority: data.priority || 'MEDIUM',
      status: 'TODO',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    }
  });

  // Touch the client service's last activity
  if (data.clientServiceId) {
    await db.clientService.update({
      where: { id: data.clientServiceId },
      data: { lastActivityAt: new Date() }
    });
  }

  // Audit
  await db.auditLog.create({
    data: {
      organizationId: data.organizationId,
      actorId: session.user.id,
      actorType: 'USER',
      actorRole: 'OPERATOR',
      action: 'SERVICE_DELIVERY_TASK_ALLOCATED',
      resourceType: 'SERVICE_DELIVERY_TASK',
      resourceId: task.id,
      reason: `Task '${data.title}' allocated to staff ${data.assignedStaffId || 'Unassigned'}`,
      metadata: JSON.stringify(data),
    }
  });

  revalidatePath('/operator');
  revalidatePath('/services');
  revalidatePath('/rep');

  return { success: true, task };
}

/**
 * Updates task status, allowing staff to mark in progress, submit deliverable proof, or block.
 */
export async function updateDeliveryTaskStatusAction(data: {
  taskId: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'BLOCKED';
  deliverableUrl?: string;
  completionNotes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const task = await db.serviceDeliveryTask.findUnique({
    where: { id: data.taskId },
    include: { clientService: true }
  });

  if (!task) throw new Error('Task not found.');

  const isCompleted = data.status === 'COMPLETED';
  const isInReview = data.status === 'IN_REVIEW';

  const updated = await db.serviceDeliveryTask.update({
    where: { id: data.taskId },
    data: {
      status: data.status,
      ...(data.deliverableUrl !== undefined ? { deliverableUrl: data.deliverableUrl } : {}),
      ...(data.completionNotes !== undefined ? { completionNotes: data.completionNotes } : {}),
      ...(isInReview ? { submittedAt: new Date() } : {}),
      ...(isCompleted ? { completedAt: new Date() } : {}),
    }
  });

  // Auto-calculate client service progress percent if linked
  if (task.clientServiceId) {
    const allTasks = await db.serviceDeliveryTask.findMany({
      where: { clientServiceId: task.clientServiceId }
    });

    if (allTasks.length > 0) {
      const completedCount = allTasks.filter(t => t.status === 'COMPLETED').length;
      const calculatedProgress = Math.min(100, Math.round((completedCount / allTasks.length) * 100));

      await db.clientService.update({
        where: { id: task.clientServiceId },
        data: {
          progressPercent: Math.max(15, calculatedProgress),
          lastActivityAt: new Date(),
        }
      });
    }
  }

  await db.auditLog.create({
    data: {
      organizationId: task.organizationId,
      actorId: session.user.id,
      actorType: 'USER',
      actorRole: 'STAFF',
      action: 'SERVICE_DELIVERY_TASK_STATUS_UPDATED',
      resourceType: 'SERVICE_DELIVERY_TASK',
      resourceId: task.id,
      reason: `Task status changed from ${task.status} to ${data.status}`,
      metadata: JSON.stringify(data),
    }
  });

  revalidatePath('/operator');
  revalidatePath('/services');
  revalidatePath('/rep');

  return { success: true, task: updated };
}

/**
 * Reviews a submitted deliverable: approves to COMPLETED or requests revision.
 */
export async function reviewDeliveryTaskAction(data: {
  taskId: string;
  decision: 'APPROVE' | 'REQUEST_CHANGES';
  feedback?: string;
  isClientApproval?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const task = await db.serviceDeliveryTask.findUnique({
    where: { id: data.taskId },
    include: { clientService: true }
  });

  if (!task) throw new Error('Task not found.');

  const isApproval = data.decision === 'APPROVE';

  const updated = await db.serviceDeliveryTask.update({
    where: { id: data.taskId },
    data: {
      status: isApproval ? 'COMPLETED' : 'IN_PROGRESS',
      clientApproved: isApproval && !!data.isClientApproval,
      reviewedByUserId: session.user.id,
      clientFeedback: data.feedback || null,
      completedAt: isApproval ? new Date() : null,
    }
  });

  // Update progress on linked service
  if (task.clientServiceId) {
    const allTasks = await db.serviceDeliveryTask.findMany({
      where: { clientServiceId: task.clientServiceId }
    });

    if (allTasks.length > 0) {
      const completedCount = allTasks.filter(t => t.status === 'COMPLETED').length;
      const calculatedProgress = Math.min(100, Math.round((completedCount / allTasks.length) * 100));

      await db.clientService.update({
        where: { id: task.clientServiceId },
        data: {
          progressPercent: Math.max(15, calculatedProgress),
          lastActivityAt: new Date(),
          status: calculatedProgress === 100 ? 'COMPLETED' : 'ACTIVE',
        }
      });
    }
  }

  await db.auditLog.create({
    data: {
      organizationId: task.organizationId,
      actorId: session.user.id,
      actorType: 'USER',
      actorRole: data.isClientApproval ? 'CLIENT' : 'OPERATOR',
      action: isApproval ? 'SERVICE_DELIVERY_TASK_APPROVED' : 'SERVICE_DELIVERY_TASK_CHANGES_REQUESTED',
      resourceType: 'SERVICE_DELIVERY_TASK',
      resourceId: task.id,
      reason: isApproval ? 'Deliverable approved' : `Changes requested: ${data.feedback}`,
      metadata: JSON.stringify(data),
    }
  });

  revalidatePath('/operator');
  revalidatePath('/services');
  revalidatePath('/rep');

  return { success: true, task: updated };
}

/**
 * Assigns an account manager and team specialists to a client service or organization.
 */
export async function assignClientTeamAction(data: {
  clientServiceId: string;
  assignedStaffId?: string;
  assignedTeamMember: string;
  accountManagerEmail?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await assertStaffPermission(session.user.id, 'clients:assign_team');

  const updated = await db.clientService.update({
    where: { id: data.clientServiceId },
    data: {
      assignedUserId: data.assignedStaffId || null,
      assignedTeamMember: data.assignedTeamMember.trim(),
      accountManagerEmail: data.accountManagerEmail?.trim() || 'sales@closecrafthq.com',
      lastActivityAt: new Date(),
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: updated.organizationId,
      actorId: session.user.id,
      actorType: 'USER',
      actorRole: 'OPERATOR',
      action: 'CLIENT_SERVICE_TEAM_ASSIGNED',
      resourceType: 'CLIENT_SERVICE',
      resourceId: updated.id,
      reason: `Assigned team member: ${data.assignedTeamMember} (${data.accountManagerEmail || 'sales@closecrafthq.com'})`,
      metadata: JSON.stringify(data),
    }
  });

  revalidatePath('/operator');
  revalidatePath('/services');

  return { success: true, clientService: updated };
}

/**
 * Deletes a delivery task.
 */
export async function deleteDeliveryTaskAction(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await assertStaffPermission(session.user.id, 'tasks:create');

  const task = await db.serviceDeliveryTask.findUnique({
    where: { id: taskId }
  });

  if (!task) throw new Error('Task not found.');

  await db.serviceDeliveryTask.delete({
    where: { id: taskId }
  });

  revalidatePath('/operator');
  revalidatePath('/services');
  revalidatePath('/rep');

  return { success: true };
}
