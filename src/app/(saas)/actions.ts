'use server'

import { z } from "zod";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { qualifyLead } from "@/lib/ai/qualification";
import { createLeadForTenant } from "@/lib/dal/lead";
import { createDealForTenant } from "@/lib/dal/deal";

export async function addManualLead(data: { 
  name: string; 
  email: string; 
  source: string;
  phone?: string;
  message?: string;
  buyingIntent?: number;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const lead = await createLeadForTenant({
    name: data.name,
    email: data.email,
    source: data.source,
    phone: data.phone,
    message: data.message,
    buyingIntent: data.buyingIntent,
    organizationId
  });

  try {
    const { RevenueEngine } = await import('@/lib/revenue-engine/engine');
    await RevenueEngine.processNewLead(lead.id);
  } catch(e) {
    console.error("RevenueEngine processing failed", e);
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/revenue-engine');
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

export async function updateDealStage(dealId: string, newStage: string) {
 const session = await auth();
 const organizationId = (session as any)?.organizationId;
 const userId = session?.user?.id;
 if (!organizationId || !userId) throw new Error("Unauthorized");

 const allowedStages = ['OPPORTUNITY', 'PROPOSAL', 'WON', 'LOST'];
 if (!allowedStages.includes(newStage)) {
   throw new Error("Invalid deal stage");
 }

 const deal = await db.deal.findFirst({
   where: { id: dealId, organizationId }
 });
 if (!deal) throw new Error("Deal not found");

 const isTerminal = newStage === 'WON' || newStage === 'LOST';

 const updatedDeal = await db.$transaction(async (tx) => {
   const d = await tx.deal.update({
     where: { id: dealId },
     data: {
       stage: newStage,
       closedAt: isTerminal ? new Date() : null,
     }
   });

   // Update lead status
   await tx.lead.update({
     where: { id: deal.leadId },
     data: {
       status: newStage === 'WON' ? 'CLOSED' : newStage
     }
   });

   // Record audit log
   await tx.auditLog.create({
     data: {
       organizationId,
       actorId: userId,
       actorType: 'USER',
       action: 'DEAL_STAGE_CHANGED',
       resourceType: 'Deal',
       resourceId: dealId,
       oldState: JSON.stringify({ stage: deal.stage }),
       newState: JSON.stringify({ stage: newStage, amount: deal.amount }),
       leadId: deal.leadId
     }
   });

   return d;
 });

 revalidatePath('/pipeline');
 revalidatePath('/dashboard');
 revalidatePath('/dashboard/revenue-engine');
 revalidatePath('/leads');

 return updatedDeal;
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

  // Strictly verify tenant resource ownership
  const lead = await db.lead.findFirst({
    where: { id: leadId, organizationId },
    select: { id: true },
  });

  if (!lead) {
    throw new Error("Lead not found or unauthorized");
  }

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
    await RevenueEngine.reprocessAllLeads(organizationId);
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/revenue-engine');
  revalidatePath('/leads');
  revalidatePath('/pipeline');
  revalidatePath('/settings');
  return { success: true };
}
