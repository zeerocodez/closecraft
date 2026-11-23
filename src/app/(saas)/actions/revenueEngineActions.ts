'use server'

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { qualifyLead } from "@/lib/ai/qualification";

const ClaimActionSchema = z.object({
  actionId: z.string().min(1, "Action ID is required")
});

export async function runAIQualification(leadId: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const lead = await db.lead.findFirst({
    where: { id: leadId, organizationId },
    select: { id: true },
  });

  if (!lead) {
    throw new Error("Lead not found or unauthorized");
  }

  await qualifyLead(leadId);

  revalidatePath('/leads');
  revalidatePath('/pipeline');
  
  return { success: true };
}

export async function claimRevenueAction(rawActionId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const organizationId = session?.organizationId;
  
  if (!userId || !organizationId) {
    return { success: false, error: "Unauthorized" };
  }

  const parseResult = ClaimActionSchema.safeParse({ actionId: rawActionId });
  if (!parseResult.success) {
    return { success: false, error: "Invalid input" };
  }
  
  const { actionId } = parseResult.data;

  try {
    const result = await db.$transaction(async (tx) => {
      const updateResult = await tx.revenueAction.updateMany({
        where: {
          id: actionId,
          organizationId: organizationId,
          status: 'PENDING',
          OR: [
            { assignedUserId: null },
            { assignedUserId: userId }
          ]
        },
        data: {
          assignedUserId: userId,
          status: 'EXECUTING'
        }
      });

      if (updateResult.count === 0) {
        const existing = await tx.revenueAction.findUnique({ where: { id: actionId } });
        if (!existing || existing.organizationId !== organizationId) throw new Error("NOT_FOUND");
        if (existing.status !== 'PENDING') throw new Error("NOT_PENDING");
        if (existing.assignedUserId && existing.assignedUserId !== userId) throw new Error("ALREADY_CLAIMED");
        throw new Error("CLAIM_FAILED");
      }

      const updatedAction = await tx.revenueAction.findUniqueOrThrow({
        where: { id: actionId }
      });

      await tx.auditLog.create({
        data: {
          action: "CLAIM_REVENUE_ACTION",
          resourceId: actionId,
          resourceType: "RevenueAction",
          organizationId: organizationId,
          actorId: userId,
          actorType: "USER",
          oldState: JSON.stringify({ status: 'PENDING' }),
          newState: JSON.stringify({ status: 'EXECUTING', originalRecommendedActor: updatedAction.recommendedActor })
        }
      });

      return updatedAction;
    });

    revalidatePath('/dashboard/revenue-engine');
    revalidatePath('/dashboard');
    return { success: true, data: result };
    
  } catch (error: any) {
    const msg = error.message;
    if (msg === 'ALREADY_CLAIMED') return { success: false, error: "Another user has already claimed this action." };
    if (msg === 'NOT_PENDING') return { success: false, error: "This action is no longer pending." };
    if (msg === 'NOT_FOUND' || msg === 'FORBIDDEN') return { success: false, error: "Action not found." };
    
    return { success: false, error: "Failed to claim action. Please try again." };
  }
}

export async function updateQualificationPolicy(policy: string, reprocessExisting: boolean = false) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  await db.organization.update({
    where: { id: organizationId },
    data: { qualificationPolicy: policy }
  });

  if (reprocessExisting) {
    const { RevenueEngine } = await import('@/lib/revenue-engine/engine');
    const leads = await db.lead.findMany({
      where: { organizationId, status: { in: ['NEW', 'DISQUALIFIED'] } },
      select: { id: true },
      take: 20
    });

    for (const lead of leads) {
      try {
        await RevenueEngine.processNewLead(lead.id);
      } catch (err) {
        console.error(`Failed to reprocess lead ${lead.id}`, err);
      }
    }
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard/revenue-engine');
  return { success: true };
}

export async function overrideNextBestAction(data: {
  leadId: string;
  actionId?: string;
  newActionType: string;
  overrideReason: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const organizationId = (session as any)?.organizationId;
  if (!userId || !organizationId) throw new Error("Unauthorized");
  if (!data.overrideReason || data.overrideReason.trim().length < 5) {
    throw new Error("A valid operational override reason is required (minimum 5 characters).");
  }

  const lead = await db.lead.findFirst({
    where: { id: data.leadId, organizationId },
    include: { revenueActions: { where: { status: 'PENDING' } } }
  });
  if (!lead) throw new Error("Lead not found");

  const currentAction = lead.revenueActions[0];
  const originalActionType = currentAction ? currentAction.type : lead.nextAction || 'UNKNOWN';

  if (currentAction) {
    await db.revenueAction.update({
      where: { id: currentAction.id },
      data: {
        status: 'CANCELLED',
        cancellationReason: `Human override by ${session.user.name || session.user.email}: ${data.overrideReason}`,
      }
    });
  }

  const newAction = await db.revenueAction.create({
    data: {
      organizationId,
      leadId: data.leadId,
      type: data.newActionType,
      recommendedActor: 'HUMAN',
      priority: 95,
      reason: `Human Override (Replaced ${originalActionType}): ${data.overrideReason}`,
      status: 'PENDING',
      assignedUserId: userId,
    }
  });

  await db.lead.update({
    where: { id: data.leadId },
    data: {
      nextAction: data.newActionType,
      message: `${lead.message || ''}\n[Human Override by ${session.user.name || session.user.email}]: Replaced AI Next Action "${originalActionType}" with "${data.newActionType}". Reason: ${data.overrideReason}`,
    }
  });

  await db.auditLog.create({
    data: {
      organizationId,
      actorId: userId,
      actorType: 'USER',
      action: 'revenue_action.override',
      resourceType: 'Lead',
      resourceId: data.leadId,
      reason: data.overrideReason,
      oldState: originalActionType,
      newState: data.newActionType,
      metadata: JSON.stringify({
        previousAction: originalActionType,
        newAction: data.newActionType,
        overrideReason: data.overrideReason,
      })
    }
  });

  revalidatePath('/dashboard');
  revalidatePath('/leads');
  revalidatePath('/pipeline');
  revalidatePath('/today');

  return { success: true, action: newAction };
}
