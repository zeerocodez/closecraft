import { db } from '@/lib/db';

export type WorkspaceRole = 
  | 'OWNER'
  | 'ADMIN'
  | 'SALES_MANAGER'
  | 'INTERNAL_MEMBER'
  | 'EXTERNAL_PROFESSIONAL'
  | 'READ_ONLY_REVIEWER';

export type PlatformRole =
  | 'USER'
  | 'OPERATOR'
  | 'FINANCE_OPERATOR'
  | 'PLATFORM_ADMIN'
  | 'SUPER_ADMIN';

export type Permission =
  // Leads & Opportunities
  | 'leads:view_all'
  | 'leads:view_assigned'
  | 'leads:create'
  | 'leads:edit'
  | 'leads:delete'
  | 'leads:export'
  | 'leads:archive'
  | 'leads:merge'
  // Deals & Pipeline
  | 'deals:view_all'
  | 'deals:view_assigned'
  | 'deals:create'
  | 'deals:edit'
  | 'deals:delete'
  // Proposals & Contracts
  | 'proposals:view'
  | 'proposals:create'
  | 'proposals:approve'
  | 'proposals:accept'
  // Billing & Subscriptions
  | 'billing:view'
  | 'billing:manage'
  | 'billing:refund'
  // Team & Workspace Admin
  | 'team:view'
  | 'team:invite'
  | 'team:manage_roles'
  // Pilot & Managed Services
  | 'engagements:view'
  | 'engagements:request'
  | 'engagements:accept_terms'
  | 'engagements:work'
  | 'engagements:review'
  // Handover & Continuity
  | 'handover:create'
  | 'handover:acknowledge'
  // Professional Compensation
  | 'compensation:view_own'
  | 'compensation:view_all'
  | 'compensation:propose_payable'
  | 'compensation:approve_payout'
  // Platform Operator
  | 'operator:assess'
  | 'operator:propose'
  | 'operator:emergency_access';

const WORKSPACE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  OWNER: [
    'leads:view_all', 'leads:view_assigned', 'leads:create', 'leads:edit', 'leads:delete', 'leads:export', 'leads:archive', 'leads:merge',
    'deals:view_all', 'deals:view_assigned', 'deals:create', 'deals:edit', 'deals:delete',
    'proposals:view', 'proposals:create', 'proposals:approve', 'proposals:accept',
    'billing:view', 'billing:manage', 'billing:refund',
    'team:view', 'team:invite', 'team:manage_roles',
    'engagements:view', 'engagements:request', 'engagements:accept_terms', 'engagements:review',
    'handover:create', 'handover:acknowledge',
    'compensation:view_all',
  ],
  ADMIN: [
    'leads:view_all', 'leads:view_assigned', 'leads:create', 'leads:edit', 'leads:delete', 'leads:export', 'leads:archive', 'leads:merge',
    'deals:view_all', 'deals:view_assigned', 'deals:create', 'deals:edit', 'deals:delete',
    'proposals:view', 'proposals:create', 'proposals:approve',
    'billing:view', 'billing:manage',
    'team:view', 'team:invite',
    'engagements:view', 'engagements:request', 'engagements:review',
    'handover:create', 'handover:acknowledge',
  ],
  SALES_MANAGER: [
    'leads:view_all', 'leads:view_assigned', 'leads:create', 'leads:edit', 'leads:archive', 'leads:merge',
    'deals:view_all', 'deals:view_assigned', 'deals:create', 'deals:edit',
    'proposals:view', 'proposals:create',
    'team:view',
    'engagements:view',
    'handover:create',
  ],
  INTERNAL_MEMBER: [
    'leads:view_all', 'leads:view_assigned', 'leads:create', 'leads:edit',
    'deals:view_assigned', 'deals:create', 'deals:edit',
    'proposals:view',
    'team:view',
    'engagements:view',
  ],
  EXTERNAL_PROFESSIONAL: [
    'leads:view_assigned', 'leads:edit',
    'deals:view_assigned', 'deals:edit',
    'proposals:view',
    'engagements:work',
    'compensation:view_own',
  ],
  READ_ONLY_REVIEWER: [
    'leads:view_all', 'leads:view_assigned',
    'deals:view_all', 'deals:view_assigned',
    'proposals:view',
    'team:view',
    'engagements:view',
  ],
};

const PLATFORM_PERMISSIONS: Record<PlatformRole, Permission[]> = {
  SUPER_ADMIN: [
    'operator:assess', 'operator:propose', 'operator:emergency_access',
    'compensation:view_all', 'compensation:propose_payable', 'compensation:approve_payout',
    'billing:view', 'billing:manage', 'billing:refund',
    'leads:view_all', 'deals:view_all', 'engagements:view', 'engagements:review',
  ],
  PLATFORM_ADMIN: [
    'operator:assess', 'operator:propose', 'operator:emergency_access',
    'compensation:view_all', 'compensation:propose_payable', 'compensation:approve_payout',
    'billing:view', 'billing:manage',
    'leads:view_all', 'deals:view_all', 'engagements:view', 'engagements:review',
  ],
  FINANCE_OPERATOR: [
    'billing:view', 'billing:manage', 'billing:refund',
    'compensation:view_all', 'compensation:approve_payout',
  ],
  OPERATOR: [
    'operator:assess', 'operator:propose', 'operator:emergency_access',
    'compensation:propose_payable',
    'engagements:view', 'engagements:review',
  ],
  USER: [],
};

export function hasWorkspacePermission(role: string, permission: Permission): boolean {
  // Normalize role string (e.g. MANAGER -> SALES_MANAGER, CLOSER/SETTER/MEMBER -> INTERNAL_MEMBER)
  let normalizedRole = role as WorkspaceRole;
  if (role === 'MANAGER') normalizedRole = 'SALES_MANAGER';
  if (role === 'CLOSER' || role === 'SETTER' || role === 'MEMBER') normalizedRole = 'INTERNAL_MEMBER';

  const perms = WORKSPACE_PERMISSIONS[normalizedRole];
  if (!perms) return false;
  return perms.includes(permission);
}

export function hasPlatformPermission(role: string, permission: Permission): boolean {
  const perms = PLATFORM_PERMISSIONS[role as PlatformRole];
  if (!perms) return false;
  return perms.includes(permission);
}

/**
 * Resolves permissions within the requested workspace on every operation.
 * Checks workspace membership and verifies active emergency support sessions.
 */
export async function assertWorkspacePermission(
  organizationId: string,
  userId: string,
  permission: Permission
): Promise<{ granted: boolean; role: string; isEmergencyAccess: boolean }> {
  // 1. Check workspace membership
  const member = await db.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      }
    }
  });

  if (member && hasWorkspacePermission(member.role, permission)) {
    return { granted: true, role: member.role, isEmergencyAccess: false };
  }

  // 2. Check platform user & emergency support access (audit required)
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true }
  });

  if (user && hasPlatformPermission(user.role, permission)) {
    return { granted: true, role: user.role, isEmergencyAccess: false };
  }

  // 3. Check active emergency support access
  const now = new Date();
  const emergencyAccess = await db.emergencySupportAccess.findFirst({
    where: {
      organizationId,
      operatorUserId: userId,
      active: true,
      expiresAt: { gt: now },
      revokedAt: null,
    }
  });

  if (emergencyAccess) {
    // Audit log emergency access usage
    await db.auditLog.create({
      data: {
        organizationId,
        actorId: userId,
        actorType: 'USER',
        actorRole: 'EMERGENCY_OPERATOR',
        action: 'EMERGENCY_SUPPORT_OPERATION',
        resourceType: 'PERMISSION',
        resourceId: permission,
        reason: emergencyAccess.reason,
        metadata: JSON.stringify({ emergencyAccessId: emergencyAccess.id, permission }),
      }
    });

    return { granted: true, role: 'EMERGENCY_OPERATOR', isEmergencyAccess: true };
  }

  throw new Error(`Access Denied: Missing required permission '${permission}' in this workspace.`);
}
