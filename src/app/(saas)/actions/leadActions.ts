'use server'

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createLeadForTenant, checkDuplicateLead } from "@/lib/dal/lead";

export async function addManualLead(data: { 
  name: string; 
  email?: string; 
  source: string;
  phone?: string;
  message?: string;
  buyingIntent?: number;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const { assertWorkspaceOperational, assertWithinLeadAllowance } = await import('@/lib/payments/subscription');
  await assertWorkspaceOperational(organizationId);
  await assertWithinLeadAllowance(organizationId);

  const cleanEmail = data.email?.trim() || "";
  const cleanPhone = data.phone?.trim() || null;

  if (!cleanEmail && !cleanPhone) {
    throw new Error("Please provide either a phone number or an email address.");
  }

  const lead = await createLeadForTenant({
    name: data.name.trim(),
    email: cleanEmail,
    source: data.source,
    phone: cleanPhone || undefined,
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

export async function claimLead(leadId: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId || !session?.user?.id) throw new Error("Unauthorized");

  const member = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organizationId
    }
  });

  if (!member) throw new Error("Forbidden: Not a member of this workspace");

  const lead = await db.lead.findFirst({
    where: {
      id: leadId,
      organizationId
    }
  });

  if (!lead) throw new Error("Lead not found");

  const updatedLead = await db.lead.update({
    where: { id: lead.id },
    data: {
      assignedUserId: session.user.id,
      assignedRole: member.role === 'SETTER' ? 'SETTER' : 'CLOSER',
      claimedAt: new Date()
    }
  });

  revalidatePath('/leads');
  revalidatePath('/inbox');
  revalidatePath('/pipeline');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/revenue-engine');
  return { success: true, lead: updatedLead };
}

export async function assignLeadToUser(leadId: string, targetUserId: string, targetRole?: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const targetMember = await db.organizationMember.findFirst({
    where: {
      userId: targetUserId,
      organizationId
    }
  });

  if (!targetMember) throw new Error("Target user is not a member of this workspace");

  const lead = await db.lead.findFirst({
    where: {
      id: leadId,
      organizationId
    }
  });

  if (!lead) throw new Error("Lead not found");

  const updatedLead = await db.lead.update({
    where: { id: lead.id },
    data: {
      assignedUserId: targetUserId,
      assignedRole: targetRole || targetMember.role,
      claimedAt: new Date()
    }
  });

  revalidatePath('/leads');
  revalidatePath('/inbox');
  revalidatePath('/pipeline');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/revenue-engine');
  return { success: true, lead: updatedLead };
}

export async function handoffLeadToCloser(data: {
  leadId: string;
  closerUserId: string;
  notes?: string;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const callerId = session?.user?.id;
  if (!organizationId || !callerId) throw new Error("Unauthorized");

  const callerMember = await db.organizationMember.findFirst({
    where: { userId: callerId, organizationId }
  });
  if (!callerMember) throw new Error("Caller not in workspace");

  const targetMember = await db.organizationMember.findFirst({
    where: { userId: data.closerUserId, organizationId }
  });
  if (!targetMember) throw new Error("Target closer is not in this workspace");

  const lead = await db.lead.findFirst({
    where: { id: data.leadId, organizationId }
  });
  if (!lead) throw new Error("Lead not found");

  const existingNotes = lead.message || '';
  const updatedMessage = data.notes 
    ? `${existingNotes}\n[Handoff from ${callerMember.role} (${session.user.name || session.user.email})]: ${data.notes}`
    : existingNotes;

  const updatedLead = await db.lead.update({
    where: { id: data.leadId },
    data: {
      assignedUserId: data.closerUserId,
      assignedRole: 'CLOSER',
      message: updatedMessage,
      claimedAt: new Date()
    }
  });

  revalidatePath('/leads');
  revalidatePath('/rep');
  revalidatePath('/team');
  return { success: true, lead: updatedLead };
}

export async function recordFastEnquiry(data: {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  estimatedValue?: number;
  currency?: string;
  ownerId?: string;
  nextAction?: string;
  nextActionDueAt?: string;
  message?: string;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const currentUserId = session?.user?.id;
  if (!organizationId || !currentUserId) throw new Error("Unauthorized");

  const cleanName = data.name.trim();
  const cleanEmail = data.email?.trim().toLowerCase() || "";
  const cleanPhone = data.phone?.trim() || null;

  if (!cleanName) {
    throw new Error("Contact or business name is required.");
  }

  if (!cleanEmail && !cleanPhone) {
    throw new Error("At least one contact method (email or phone number) is required.");
  }

  if (cleanPhone) {
    const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      throw new Error("Please enter a valid international phone number.");
    }
  }

  const duplicate = await checkDuplicateLead(organizationId, cleanEmail || undefined, cleanPhone || undefined);
  const assignedUserId = data.ownerId || currentUserId;
  const dueDate = data.nextActionDueAt ? new Date(data.nextActionDueAt) : null;

  const lead = await createLeadForTenant({
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone || undefined,
    source: data.source || 'Direct Entry',
    status: 'NEW',
    organizationId,
    message: data.message,
    estimatedValue: data.estimatedValue,
    currency: data.currency || 'NGN',
    nextAction: data.nextAction,
    nextActionDueAt: dueDate || undefined,
    assignedUserId,
  });

  await db.auditLog.create({
    data: {
      organizationId,
      actorId: currentUserId,
      actorType: 'USER',
      action: 'ENQUIRY_RECORDED',
      resourceType: 'LEAD',
      resourceId: lead.id,
      newState: JSON.stringify({ name: cleanName, assignedUserId, nextAction: data.nextAction })
    }
  });

  revalidatePath('/today');
  revalidatePath('/leads');
  revalidatePath('/dashboard');
  revalidatePath('/pipeline');

  return { lead, duplicateWarning: duplicate ? `Likely duplicate: Found existing lead "${duplicate.name}" with status ${duplicate.status}.` : null };
}

export async function updateLeadFollowUp(data: {
  leadId: string;
  status?: string;
  disqualificationReason?: string;
  outcomeNote?: string;
  nextAction?: string;
  nextActionDueAt?: string;
  assignedUserId?: string;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const currentUserId = session?.user?.id;
  if (!organizationId || !currentUserId) throw new Error("Unauthorized");

  const member = await db.organizationMember.findFirst({
    where: { userId: currentUserId, organizationId },
    select: { role: true }
  });

  const isExternalProfessional = member?.role === 'EXTERNAL_PROFESSIONAL';

  const lead = await db.lead.findFirst({
    where: {
      id: data.leadId,
      organizationId,
      ...(isExternalProfessional ? { assignedUserId: currentUserId } : {})
    }
  });

  if (!lead) throw new Error("Enquiry not found or access denied.");

  const dueDate = data.nextActionDueAt ? new Date(data.nextActionDueAt) : null;

  await db.followUpTask.updateMany({
    where: { leadId: data.leadId, status: 'PENDING' },
    data: { status: 'CANCELLED', reason: 'Rescheduled via Today action' }
  });

  if (data.nextAction && dueDate) {
    await db.followUpTask.create({
      data: {
        organizationId,
        leadId: data.leadId,
        actionType: 'SCHEDULED_FOLLOW_UP',
        scheduledFor: dueDate,
        reason: data.nextAction,
        status: 'PENDING',
      }
    });
  }

  const updatedLead = await db.lead.update({
    where: { id: data.leadId },
    data: {
      status: data.status || lead.status,
      disqualificationReason: data.disqualificationReason || (data.status === 'LOST' ? lead.disqualificationReason : null),
      nextAction: data.nextAction !== undefined ? data.nextAction : lead.nextAction,
      nextActionDueAt: data.nextActionDueAt !== undefined ? dueDate : lead.nextActionDueAt,
      assignedUserId: isExternalProfessional ? lead.assignedUserId : (data.assignedUserId !== undefined ? data.assignedUserId : lead.assignedUserId),
    }
  });

  if (data.outcomeNote?.trim()) {
    let conv = await db.conversation.findFirst({ where: { leadId: data.leadId, organizationId } });
    if (!conv) {
      conv = await db.conversation.create({
        data: { leadId: data.leadId, organizationId, channel: 'WHATSAPP', status: 'ACTIVE' }
      });
    }

    await db.message.create({
      data: {
        conversationId: conv.id,
        content: `Follow-up Outcome: ${data.outcomeNote.trim()}${data.nextAction ? ` | Next: ${data.nextAction}` : ''}`,
        senderType: 'HUMAN',
      }
    });
  }

  await db.auditLog.create({
    data: {
      organizationId,
      actorId: currentUserId,
      actorType: 'USER',
      action: 'LEAD_FOLLOW_UP_UPDATED',
      resourceType: 'LEAD',
      resourceId: data.leadId,
      newState: JSON.stringify({ status: updatedLead.status, nextAction: updatedLead.nextAction, nextActionDueAt: dueDate })
    }
  });

  revalidatePath('/today');
  revalidatePath('/leads');
  revalidatePath('/rep');
  revalidatePath('/pipeline');

  return { success: true, lead: updatedLead };
}
