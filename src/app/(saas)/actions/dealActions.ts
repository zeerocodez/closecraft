'use server'

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createDealForTenant } from "@/lib/dal/deal";

export async function createDeal(leadId: string, amount: number) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const deal = await createDealForTenant({
    amount,
    leadId,
    organizationId
  });

  revalidatePath('/leads');
  revalidatePath('/pipeline');

  return deal;
}

export async function updateDealStage(dealId: string, newStage: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const userId = session?.user?.id;
  if (!organizationId || !userId) throw new Error("Unauthorized");

  const allowedStages = ['OPPORTUNITY', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
  if (!allowedStages.includes(newStage)) {
    throw new Error("Invalid deal stage");
  }

  const deal = await db.deal.findFirst({
    where: { id: dealId, organizationId }
  });
  if (!deal) throw new Error("Deal not found");

  const isTerminal = newStage === 'WON' || newStage === 'LOST';
  const effectiveCloserId = deal.closerId || userId;
  let commissionAmount: number | null = deal.commissionAmount;
  let commissionStatus = deal.commissionStatus;

  if (newStage === 'WON') {
    const closerMember = await db.organizationMember.findFirst({
      where: { userId: effectiveCloserId, organizationId }
    });

    if (closerMember) {
      if (closerMember.commissionType === 'PERCENTAGE') {
        commissionAmount = Math.round((deal.amount * closerMember.commissionRate) / 100);
      } else {
        commissionAmount = closerMember.commissionRate;
      }
      commissionStatus = 'PENDING';
    }
  }

  const updatedDeal = await db.$transaction(async (tx) => {
    const d = await tx.deal.update({
      where: { id: dealId },
      data: {
        stage: newStage,
        closedAt: isTerminal ? new Date() : null,
        closerId: effectiveCloserId,
        commissionAmount,
        commissionStatus,
      }
    });

    await tx.lead.update({
      where: { id: deal.leadId },
      data: {
        status: newStage === 'WON' ? 'CLOSED' : newStage
      }
    });

    await tx.auditLog.create({
      data: {
        organizationId,
        actorId: userId,
        actorType: 'USER',
        action: 'DEAL_STAGE_CHANGED',
        resourceType: 'Deal',
        resourceId: dealId,
        oldState: JSON.stringify({ stage: deal.stage }),
        newState: JSON.stringify({ stage: newStage, amount: deal.amount, commissionAmount }),
        leadId: deal.leadId
      }
    });

    return d;
  });

  revalidatePath('/pipeline');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/revenue-engine');
  revalidatePath('/leads');
  revalidatePath('/rep');
  revalidatePath('/closer');

  return updatedDeal;
}

export async function updateMemberCommission(data: {
  memberId: string;
  commissionRate: number;
  commissionType: 'PERCENTAGE' | 'FIXED_PER_DEAL' | 'FIXED_PER_APPOINTMENT';
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const caller = await db.organizationMember.findFirst({
    where: { userId: session?.user?.id, organizationId }
  });
  if (caller?.role !== 'ADMIN' && caller?.role !== 'MANAGER' && (session?.user as any)?.role !== 'SUPER_ADMIN') {
    throw new Error("Only organization owners/managers can configure commission rates");
  }

  const updated = await db.organizationMember.update({
    where: { id: data.memberId },
    data: {
      commissionRate: data.commissionRate,
      commissionType: data.commissionType
    }
  });

  revalidatePath('/team');
  revalidatePath('/rep');
  revalidatePath('/closer');
  return { success: true, member: updated };
}

export async function updateCommissionPayoutStatus(dealId: string, status: 'PENDING' | 'APPROVED' | 'PAID') {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const caller = await db.organizationMember.findFirst({
    where: { userId: session?.user?.id, organizationId }
  });
  if (caller?.role !== 'ADMIN' && caller?.role !== 'MANAGER' && (session?.user as any)?.role !== 'SUPER_ADMIN') {
    throw new Error("Only organization owners/managers can approve commission payouts");
  }

  const deal = await db.deal.findFirst({
    where: { id: dealId, organizationId }
  });
  if (!deal) throw new Error("Deal not found");

  const updated = await db.deal.update({
    where: { id: dealId },
    data: { commissionStatus: status }
  });

  revalidatePath('/team');
  revalidatePath('/rep');
  revalidatePath('/closer');
  revalidatePath('/pipeline');
  return { success: true, deal: updated };
}
