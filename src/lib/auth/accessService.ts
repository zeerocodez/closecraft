import { db } from '@/lib/db';
import crypto from 'node:crypto';
import { assertWorkspacePermission, WorkspaceRole } from '@/lib/permissions/matrix';

/**
 * Grants time-bounded, audited emergency operator support access to a client workspace.
 * Requires an explicit stated reason and duration.
 */
export async function grantEmergencySupportAccess(params: {
  organizationId: string;
  operatorUserId: string;
  reason: string;
  durationHours?: number;
}) {
  if (!params.reason || params.reason.trim().length < 10) {
    throw new Error('An explicit, detailed reason (min 10 characters) is required for emergency support access.');
  }

  // Operator verification
  const operator = await db.user.findUnique({
    where: { id: params.operatorUserId },
    select: { id: true, role: true, email: true }
  });

  const isOperator = operator?.role === 'OPERATOR' || operator?.role === 'SUPER_ADMIN' || operator?.role === 'PLATFORM_ADMIN';
  if (!isOperator) {
    throw new Error('Access Denied: Only platform operators or administrators can request emergency support access.');
  }

  const duration = Math.min(24, Math.max(1, params.durationHours || 2)); // 1 to 24 hours max
  const expiresAt = new Date(Date.now() + duration * 3600000);

  const emergency = await db.emergencySupportAccess.create({
    data: {
      organizationId: params.organizationId,
      operatorUserId: params.operatorUserId,
      reason: params.reason.trim(),
      expiresAt,
      active: true,
    }
  });

  // Audit log entry
  await db.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorId: params.operatorUserId,
      actorType: 'USER',
      actorRole: operator.role,
      action: 'EMERGENCY_ACCESS_GRANTED',
      resourceType: 'ORGANIZATION',
      resourceId: params.organizationId,
      reason: params.reason.trim(),
      metadata: JSON.stringify({ emergencyAccessId: emergency.id, expiresAt }),
    }
  });

  return emergency;
}

/**
 * Immediately revokes an emergency support session.
 */
export async function revokeEmergencySupportAccess(accessId: string, revokedByUserId: string) {
  const session = await db.emergencySupportAccess.findUnique({
    where: { id: accessId }
  });

  if (!session) throw new Error('Emergency support session not found');

  const updated = await db.emergencySupportAccess.update({
    where: { id: accessId },
    data: {
      active: false,
      revokedAt: new Date(),
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: session.organizationId,
      actorId: revokedByUserId,
      actorType: 'USER',
      action: 'EMERGENCY_ACCESS_REVOKED',
      resourceType: 'EMERGENCY_ACCESS',
      resourceId: accessId,
      reason: 'Revoked by operator/administrator',
    }
  });

  return updated;
}

/**
 * Issues an expiring workspace invite.
 */
export async function createWorkspaceInvite(params: {
  organizationId: string;
  invitedByUserId: string;
  email: string;
  role: WorkspaceRole;
  expiresInDays?: number;
}) {
  await assertWorkspacePermission(params.organizationId, params.invitedByUserId, 'team:invite');

  const cleanEmail = params.email.trim().toLowerCase();
  const token = crypto.randomBytes(32).toString('hex');
  const days = params.expiresInDays || 7;
  const expiresAt = new Date(Date.now() + days * 86400000);

  const invite = await db.workspaceInvite.create({
    data: {
      organizationId: params.organizationId,
      email: cleanEmail,
      role: params.role,
      token,
      invitedByUserId: params.invitedByUserId,
      expiresAt,
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorId: params.invitedByUserId,
      actorType: 'USER',
      action: 'WORKSPACE_INVITE_SENT',
      resourceType: 'INVITE',
      resourceId: invite.id,
      metadata: JSON.stringify({ email: cleanEmail, role: params.role, expiresAt }),
    }
  });

  return invite;
}

/**
 * Accepts an expiring workspace invitation.
 */
export async function acceptWorkspaceInvite(token: string, userId: string) {
  const invite = await db.workspaceInvite.findUnique({
    where: { token },
    include: { organization: true }
  });

  if (!invite) throw new Error('Invalid invitation link');
  if (invite.acceptedAt) throw new Error('Invitation has already been accepted');
  if (new Date() > invite.expiresAt) throw new Error('Invitation link has expired');

  // Enroll user into workspace with invited role
  const member = await db.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId,
        organizationId: invite.organizationId,
      }
    },
    update: {
      role: invite.role,
    },
    create: {
      userId,
      organizationId: invite.organizationId,
      role: invite.role,
    }
  });

  await db.workspaceInvite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() }
  });

  await db.auditLog.create({
    data: {
      organizationId: invite.organizationId,
      actorId: userId,
      actorType: 'USER',
      action: 'WORKSPACE_INVITE_ACCEPTED',
      resourceType: 'ORGANIZATION_MEMBER',
      resourceId: member.id,
      metadata: JSON.stringify({ inviteId: invite.id, role: invite.role }),
    }
  });

  return { member, organization: invite.organization };
}

/**
 * User Session Management & Revocation
 */
export async function registerUserSession(userId: string, sessionToken: string, ip?: string, userAgent?: string) {
  const expiresAt = new Date(Date.now() + 30 * 86400000); // 30 days
  return await db.userSession.upsert({
    where: { sessionToken },
    update: {
      ipAddress: ip,
      userAgent,
      revoked: false,
      expiresAt,
    },
    create: {
      userId,
      sessionToken,
      ipAddress: ip,
      userAgent,
      expiresAt,
    }
  });
}

export async function revokeUserSession(sessionToken: string) {
  return await db.userSession.update({
    where: { sessionToken },
    data: {
      revoked: true,
      revokedAt: new Date(),
    }
  });
}

export async function isSessionValid(sessionToken: string): Promise<boolean> {
  const session = await db.userSession.findUnique({
    where: { sessionToken }
  });
  if (!session) return true; // If not using session table tracking, allow NextAuth JWT
  return !session.revoked && session.expiresAt > new Date();
}
