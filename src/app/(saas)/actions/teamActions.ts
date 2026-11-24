'use server'

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function setOrganizationStatus(targetOrgId: string, newStatus: 'APPROVED' | 'PENDING' | 'SUSPENDED') {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId || !session?.user?.id) throw new Error("Unauthorized");

  const callerOrg = await db.organization.findUnique({
    where: { id: organizationId },
    select: { slug: true }
  });

  const callerMember = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organizationId,
      role: 'ADMIN'
    }
  });

  if (!callerMember || (callerOrg?.slug !== 'zeerocodes' && callerOrg?.slug !== 'acme-corp')) {
    throw new Error("Forbidden: Super-admin privileges required to manage organization approval status.");
  }

  const updated = await db.organization.update({
    where: { id: targetOrgId },
    data: { status: newStatus }
  });

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  return { success: true, organization: updated };
}

export async function addTenantTeamMember(data: { name: string; email: string; role: 'SETTER' | 'CLOSER' | 'ADMIN' | 'MANAGER' | 'MEMBER' }) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const caller = await db.organizationMember.findFirst({
    where: { userId: session?.user?.id, organizationId }
  });
  if (caller?.role !== 'OWNER' && caller?.role !== 'ADMIN' && caller?.role !== 'MANAGER' && (session?.user as any)?.role !== 'SUPER_ADMIN') {
    throw new Error("Only organization owners and managers can add team members");
  }

  const cleanEmail = data.email.trim().toLowerCase();
  const cleanName = data.name.trim() || cleanEmail.split('@')[0];

  let user = await db.user.findUnique({
    where: { email: cleanEmail }
  });

  if (!user) {
    const bcrypt = await import('bcryptjs');
    const tempHash = await bcrypt.default.hash(Math.random().toString(36), 10);
    user = await db.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        passwordHash: tempHash,
      }
    });
  }

  const existingMembership = await db.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId
      }
    }
  });

  if (existingMembership) {
    await db.organizationMember.update({
      where: { id: existingMembership.id },
      data: { role: data.role, isAvailable: true }
    });
  } else {
    const { getOrCreateWorkspaceSubscription } = await import('@/lib/payments/subscription');
    const sub = await getOrCreateWorkspaceSubscription(organizationId);

    const internalCount = await db.organizationMember.count({
      where: {
        organizationId,
        role: { not: 'EXTERNAL_PROFESSIONAL' },
      }
    });

    if (internalCount >= sub.maxInternalSeats) {
      throw new Error(
        `Workspace seat limit reached (${internalCount}/${sub.maxInternalSeats} internal seats in use). Please upgrade to the Pro plan (10 seats) in Billing to add more team members.`
      );
    }

    await db.organizationMember.create({
      data: {
        userId: user.id,
        organizationId,
        role: data.role,
        isAvailable: true,
      }
    });
  }

  revalidatePath('/team');
  revalidatePath('/settings');
  revalidatePath('/leads');
  return { success: true };
}

export async function removeTenantTeamMember(memberId: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  await db.organizationMember.deleteMany({
    where: {
      id: memberId,
      organizationId
    }
  });

  revalidatePath('/team');
  revalidatePath('/settings');
  return { success: true };
}

export async function toggleMemberAvailability(memberId: string, isAvailable: boolean) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  await db.organizationMember.updateMany({
    where: {
      id: memberId,
      organizationId
    },
    data: { isAvailable }
  });

  revalidatePath('/team');
  revalidatePath('/leads');
  return { success: true };
}

export async function updateTenantRoutingMode(mode: 'OPEN_POOL' | 'ROUND_ROBIN' | 'OWNER_MANUAL') {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const caller = await db.organizationMember.findFirst({
    where: { userId: session?.user?.id, organizationId }
  });
  if (caller?.role !== 'OWNER' && caller?.role !== 'ADMIN' && caller?.role !== 'MANAGER' && (session?.user as any)?.role !== 'SUPER_ADMIN') {
    throw new Error("Only organization owners and managers can update lead distribution");
  }

  await db.organization.update({
    where: { id: organizationId },
    data: { leadRoutingMode: mode }
  });

  revalidatePath('/team');
  revalidatePath('/settings');
  revalidatePath('/leads');
  return { success: true };
}

export async function updateOrganizationIdentity(name: string, whatsappNumber: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const userId = session?.user?.id;
  if (!organizationId || !userId) throw new Error("Unauthorized");

  const member = await db.organizationMember.findFirst({
    where: { organizationId, userId }
  });
  if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    throw new Error("Only workspace owners and administrators can update workspace identity.");
  }

  const cleanName = name.trim();
  if (!cleanName) throw new Error("Organization name cannot be empty.");

  const { normalizeWhatsAppNumber } = await import('@/lib/whatsapp');
  const cleanWhatsApp = normalizeWhatsAppNumber(whatsappNumber);
  if (whatsappNumber.trim() && !cleanWhatsApp) {
    throw new Error("Invalid WhatsApp phone number format.");
  }

  const updatedOrg = await db.organization.update({
    where: { id: organizationId },
    data: {
      name: cleanName,
      whatsappNumber: cleanWhatsApp,
    }
  });

  revalidatePath('/settings');
  revalidatePath('/today');
  revalidatePath('/leads');
  revalidatePath('/dashboard');

  return { success: true, organization: updatedOrg };
}
