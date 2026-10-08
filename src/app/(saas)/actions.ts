'use server'

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

  revalidatePath('/dss/leads');
  revalidatePath('/dss/pipeline');
  
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

  revalidatePath('/dss/leads');
  revalidatePath('/dss/pipeline');

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

  revalidatePath('/dss/leads');
  revalidatePath('/dss/pipeline');
  
  return { success: true };
}

export async function claimRevenueAction(actionId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  await db.revenueAction.update({
    where: { id: actionId },
    data: {
      assignedUserId: userId,
      status: 'EXECUTING'
    }
  });

  revalidatePath('/dss/leads');
  revalidatePath('/dss/pipeline');
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
