'use server'

import { z } from "zod";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { qualifyLead } from "@/lib/ai/qualification";
import { createLeadForTenant } from "@/lib/dal/lead";
import { createDealForTenant } from "@/lib/dal/deal";

export async function addManualLead(data: { name: string, email: string, source: string }) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const lead = await createLeadForTenant({
    name: data.name,
    email: data.email,
    source: data.source,
    organizationId
  });

  // Since it was added manually in the UI, trigger the AI asynchronously
  // We can just invoke the background job directly or fire a separate event,
  // but calling qualifyLead here without awaiting (or firing an event) works.
  // Actually, we'll just fire an evaluate event, or call it directly.
  try {
    await qualifyLead(lead.id);
  } catch(e) {
    console.error("AI qualification failed", e);
  }

  revalidatePath('/leads');
  revalidatePath('/pipeline');
  
  return lead;
}

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

export async function createAppointment(data: { title: string; startTime: string; endTime: string; leadId: string }) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const organizerId = session?.user?.id;
  if (!organizationId || !organizerId) throw new Error("Unauthorized");

  const { createAppointmentForTenant } = await import('@/lib/dal/appointment');

  const appointment = await createAppointmentForTenant({
    title: data.title,
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime),
    leadId: data.leadId,
    organizerId,
    organizationId
  });

  revalidatePath('/appointments');
  return appointment;
}

export async function runAIQualification(leadId: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  // Run the AI qualification (this calls OpenAI and updates the DB)
  await qualifyLead(leadId);

  revalidatePath('/leads');
  revalidatePath('/pipeline');
  
  return { success: true };
}

const ClaimActionSchema = z.object({
  actionId: z.string().min(1, "Action ID is required")
});

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

  // Transaction to conditionally claim the action and audit it
  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Check ownership and current status
      const action = await tx.revenueAction.findUnique({
        where: { id: actionId }
      });
      
      if (!action) {
        throw new Error("NOT_FOUND");
      }
      if (action.organizationId !== organizationId) {
        throw new Error("FORBIDDEN");
      }
      if (action.status !== 'PENDING') {
        throw new Error("NOT_PENDING");
      }
      if (action.assignedUserId && action.assignedUserId !== userId) {
        throw new Error("ALREADY_CLAIMED");
      }

      // 2. Perform conditional update (state transition)
      const updatedAction = await tx.revenueAction.update({
        where: { id: actionId },
        data: {
          assignedUserId: userId,
          status: 'EXECUTING'
        }
      });

      // 3. Audit the consequential change
      await tx.auditLog.create({
        data: {
          action: "CLAIM_REVENUE_ACTION",
          resourceId: actionId,
          resourceType: "RevenueAction",
          organizationId: organizationId,
          actorId: userId,
          actorType: "USER",
          oldState: JSON.stringify({ status: action.status }),
          newState: JSON.stringify({ status: 'EXECUTING', originalRecommendedActor: action.recommendedActor })
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

export async function updateQualificationPolicy(policy: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  await db.organization.update({
    where: { id: organizationId },
    data: { qualificationPolicy: policy }
  });

  revalidatePath('/settings');
  return { success: true };
}
