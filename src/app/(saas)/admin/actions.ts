'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Check if user has an ADMIN role in any organization
  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      role: 'ADMIN',
    },
  });

  if (!membership) {
    throw new Error('Forbidden: Platform admin privileges required');
  }

  return session;
}

export async function approveOrganization(organizationId: string) {
  await requireAdmin();

  const org = await db.organization.update({
    where: { id: organizationId },
    data: { status: 'APPROVED' },
  });

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { success: true, organization: org };
}

export async function suspendOrganization(organizationId: string) {
  await requireAdmin();

  const org = await db.organization.update({
    where: { id: organizationId },
    data: { status: 'SUSPENDED' },
  });

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { success: true, organization: org };
}

export async function setPendingOrganization(organizationId: string) {
  await requireAdmin();

  const org = await db.organization.update({
    where: { id: organizationId },
    data: { status: 'PENDING' },
  });

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { success: true, organization: org };
}

export async function updateOrganizationPlan(organizationId: string, plan: string) {
  await requireAdmin();

  const validPlans = ['STARTER', 'GROWTH', 'SCALE'];
  if (!validPlans.includes(plan)) {
    throw new Error('Invalid plan selected');
  }

  const org = await db.organization.update({
    where: { id: organizationId },
    data: { plan },
  });

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { success: true, organization: org };
}

export async function createClientOrganization(formData: FormData) {
  await requireAdmin();

  const name = (formData.get('name') as string)?.trim();
  const slugInput = (formData.get('slug') as string)?.trim().toLowerCase();
  const plan = (formData.get('plan') as string) || 'STARTER';
  const status = (formData.get('status') as string) || 'APPROVED';
  const clientType = (formData.get('clientType') as string) || 'Service-Based Business';

  if (!name) {
    throw new Error('Organization name is required');
  }

  const baseSlug = slugInput || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  let slug = baseSlug;

  const existingOrg = await db.organization.findUnique({
    where: { slug }
  });

  if (existingOrg) {
    slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  // Pre-seed an initial default qualification policy tailored to their client category
  let defaultPolicy = `Target Client Profile: ${clientType}.\nMinimum budget: ₦250,000.\nTarget: Founders, Directors, Operations Leads.\nGoal: Inbound qualification and automated follow-up.`;
  if (clientType.includes('Creator')) {
    defaultPolicy = `Target Client Profile: Digital Creators & Knowledge Brands.\nMinimum budget: ₦100,000.\nTarget: Community members, high-ticket course buyers, sponsorship deals.\nGoal: Convert social DM and link-in-bio enquiries into paying clients.`;
  } else if (clientType.includes('Tech')) {
    defaultPolicy = `Target Client Profile: Tech & Software Companies.\nMinimum budget: ₦500,000.\nTarget: VP Engineering, CTO, Procurement.\nGoal: Inbound demo booking and SLA escalation.`;
  }

  const org = await db.organization.create({
    data: {
      name,
      slug,
      plan,
      status,
      qualificationPolicy: defaultPolicy,
    },
  });

  revalidatePath('/admin');
  return { success: true, organization: org };
}

export async function updateUserRole(userId: string, organizationId: string, newRole: string) {
  await requireAdmin();

  const validRoles = ['ADMIN', 'CLOSER', 'MEMBER'];
  if (!validRoles.includes(newRole)) {
    throw new Error('Invalid role selected');
  }

  const member = await db.organizationMember.update({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      }
    },
    data: { role: newRole }
  });

  revalidatePath('/admin');
  return { success: true, member };
}

export async function triggerAffiliatePayout(saleId: string, reference?: string) {
  await requireAdmin();
  const { processAffiliateSalePayout } = await import('@/lib/dss/affiliate-store');
  const success = await processAffiliateSalePayout(saleId, reference || 'TRANSFER-DIRECT');
  revalidatePath('/admin');
  return { success };
}
