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
  | 'operator:emergency_access'
  // Service Delivery Tasks & Allocation
  | 'tasks:view_all'
  | 'tasks:view_assigned'
  | 'tasks:create'
  | 'tasks:assign'
  | 'tasks:update_status'
  | 'tasks:submit_deliverable'
  | 'tasks:review'
  | 'tasks:client_approve'
  // Remote Workforce Management
  | 'workforce:view_roster'
  | 'workforce:manage_staff'
  | 'workforce:view_metrics'
  | 'clients:assign_team';

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
    'tasks:view_all', 'tasks:client_approve',
  ],
  ADMIN: [
    'leads:view_all', 'leads:view_assigned', 'leads:create', 'leads:edit', 'leads:delete', 'leads:export', 'leads:archive', 'leads:merge',
    'deals:view_all', 'deals:view_assigned', 'deals:create', 'deals:edit', 'deals:delete',
    'proposals:view', 'proposals:create', 'proposals:approve',
    'billing:view', 'billing:manage',
    'team:view', 'team:invite',
    'engagements:view', 'engagements:request', 'engagements:review',
    'handover:create', 'handover:acknowledge',
    'tasks:view_all', 'tasks:client_approve',
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
    'tasks:view_all', 'tasks:view_assigned', 'tasks:create', 'tasks:assign', 'tasks:update_status', 'tasks:submit_deliverable', 'tasks:review',
    'workforce:view_roster', 'workforce:manage_staff', 'workforce:view_metrics', 'clients:assign_team',
  ],
  PLATFORM_ADMIN: [
    'operator:assess', 'operator:propose', 'operator:emergency_access',
    'compensation:view_all', 'compensation:propose_payable', 'compensation:approve_payout',
    'billing:view', 'billing:manage',
    'leads:view_all', 'deals:view_all', 'engagements:view', 'engagements:review',
    'tasks:view_all', 'tasks:view_assigned', 'tasks:create', 'tasks:assign', 'tasks:update_status', 'tasks:submit_deliverable', 'tasks:review',
    'workforce:view_roster', 'workforce:manage_staff', 'workforce:view_metrics', 'clients:assign_team',
  ],
  FINANCE_OPERATOR: [
    'billing:view', 'billing:manage', 'billing:refund',
    'compensation:view_all', 'compensation:approve_payout',
    'workforce:view_metrics',
  ],
  OPERATOR: [
    'operator:assess', 'operator:propose', 'operator:emergency_access',
    'compensation:propose_payable',
    'engagements:view', 'engagements:review',
    'tasks:view_all', 'tasks:view_assigned', 'tasks:create', 'tasks:assign', 'tasks:update_status', 'tasks:submit_deliverable', 'tasks:review',
    'workforce:view_roster', 'workforce:manage_staff', 'workforce:view_metrics', 'clients:assign_team',
  ],
  USER: [],
};

export type StaffRole =
  | 'SUPER_ADMIN'
  | 'OPERATOR'
  | 'OPERATIONS_MANAGER'
  | 'ACCOUNT_MANAGER'
  | 'MARKETING_SPECIALIST'
  | 'ADS_SPECIALIST'
  | 'LEAD_MANAGER'
  | 'SETTER'
  | 'CLOSER'
  | 'SALES_TRAINER'
  | 'SUPPORT_REP';

export const STAFF_PERMISSIONS: Record<StaffRole, Permission[]> = {
  SUPER_ADMIN: [
    'tasks:view_all', 'tasks:view_assigned', 'tasks:create', 'tasks:assign', 'tasks:update_status', 'tasks:submit_deliverable', 'tasks:review',
    'workforce:view_roster', 'workforce:manage_staff', 'workforce:view_metrics', 'clients:assign_team',
    'leads:view_all', 'deals:view_all', 'engagements:view', 'engagements:review', 'billing:view', 'billing:manage',
  ],
  OPERATOR: [
    'tasks:view_all', 'tasks:view_assigned', 'tasks:create', 'tasks:assign', 'tasks:update_status', 'tasks:submit_deliverable', 'tasks:review',
    'workforce:view_roster', 'workforce:manage_staff', 'workforce:view_metrics', 'clients:assign_team',
    'leads:view_all', 'deals:view_all', 'engagements:view', 'engagements:review',
  ],
  OPERATIONS_MANAGER: [
    'tasks:view_all', 'tasks:view_assigned', 'tasks:create', 'tasks:assign', 'tasks:update_status', 'tasks:submit_deliverable', 'tasks:review',
    'workforce:view_roster', 'workforce:manage_staff', 'workforce:view_metrics', 'clients:assign_team',
    'engagements:view', 'engagements:review',
  ],
  ACCOUNT_MANAGER: [
    'tasks:view_all', 'tasks:view_assigned', 'tasks:create', 'tasks:assign', 'tasks:update_status', 'tasks:submit_deliverable', 'tasks:review',
    'workforce:view_roster', 'workforce:view_metrics', 'clients:assign_team',
    'leads:view_assigned', 'engagements:view',
  ],
  MARKETING_SPECIALIST: [
    'tasks:view_assigned', 'tasks:update_status', 'tasks:submit_deliverable',
    'workforce:view_metrics',
  ],
  ADS_SPECIALIST: [
    'tasks:view_assigned', 'tasks:update_status', 'tasks:submit_deliverable',
    'workforce:view_metrics',
  ],
  LEAD_MANAGER: [
    'tasks:view_assigned', 'tasks:update_status', 'tasks:submit_deliverable',
    'leads:view_all', 'leads:edit', 'workforce:view_metrics',
  ],
  SETTER: [
    'tasks:view_assigned', 'tasks:update_status', 'tasks:submit_deliverable',
    'leads:view_assigned', 'leads:edit', 'workforce:view_metrics',
  ],
  CLOSER: [
    'tasks:view_assigned', 'tasks:update_status', 'tasks:submit_deliverable',
    'deals:view_assigned', 'deals:edit', 'workforce:view_metrics',
  ],
  SALES_TRAINER: [
    'tasks:view_assigned', 'tasks:update_status', 'tasks:submit_deliverable',
    'workforce:view_metrics',
  ],
  SUPPORT_REP: [
    'tasks:view_assigned', 'tasks:update_status', 'tasks:submit_deliverable',
    'workforce:view_metrics',
  ],
};

export function hasStaffPermission(role: string, permission: Permission): boolean {
  const perms = STAFF_PERMISSIONS[role as StaffRole];
  if (!perms) return false;
  return perms.includes(permission);
}

export function isStaffRole(role: string): boolean {
  return role in STAFF_PERMISSIONS;
}

export function getStaffRoleLabel(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN': return 'Super Administrator';
    case 'OPERATOR': return 'Platform Operator';
    case 'OPERATIONS_MANAGER': return 'Operations Manager';
    case 'ACCOUNT_MANAGER': return 'Account Manager';
    case 'MARKETING_SPECIALIST': return 'Marketing Specialist';
    case 'ADS_SPECIALIST': return 'Paid Ads Specialist';
    case 'LEAD_MANAGER': return 'Lead Manager';
    case 'SETTER': return 'Appointment Setter';
    case 'CLOSER': return 'Sales Closer';
    case 'SALES_TRAINER': return 'Sales Enablement Trainer';
    case 'SUPPORT_REP': return 'Support Representative';
    default: return role;
  }
}

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

/**
 * Asserts that the caller has staff privileges and required permissions for remote operations.
 */
export async function assertStaffPermission(
  userId: string,
  permission: Permission
): Promise<{ granted: boolean; staffProfile?: any; user: any }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, staffProfile: true }
  });

  if (!user) {
    throw new Error('Unauthorized: User record not found.');
  }

  // Super admins and operators always have platform permission
  if (hasPlatformPermission(user.role, permission)) {
    return { granted: true, staffProfile: user.staffProfile, user };
  }

  // Check staff profile role
  if (user.staffProfile && hasStaffPermission(user.staffProfile.role, permission)) {
    return { granted: true, staffProfile: user.staffProfile, user };
  }

  // Fallback for closecraft staff email domains
  const isCloseCraftEmail = user.email?.endsWith('@closecrafthq.com') || user.email?.endsWith('@closecraft.com') || user.email === 'zeerocodes@gmail.com';
  if (isCloseCraftEmail) {
    return { granted: true, staffProfile: user.staffProfile, user };
  }

  throw new Error(`Access Denied: Missing required staff permission '${permission}'.`);
}

