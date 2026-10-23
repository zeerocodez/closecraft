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
  email?: string; 
  source: string;
  phone?: string;
  message?: string;
  buyingIntent?: number;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

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
   // Fetch closer member commission rate
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

  // Race-proof atomic conditional update within transaction
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
    await RevenueEngine.reprocessAllLeads(organizationId);
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/revenue-engine');
  revalidatePath('/leads');
  revalidatePath('/pipeline');
  revalidatePath('/settings');
  return { success: true };
}

export async function setOrganizationStatus(targetOrgId: string, newStatus: 'APPROVED' | 'PENDING' | 'SUSPENDED') {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId || !session?.user?.id) throw new Error("Unauthorized");

  // Verify caller has administrative privileges
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
  if (caller?.role !== 'ADMIN' && caller?.role !== 'MANAGER' && (session?.user as any)?.role !== 'SUPER_ADMIN') {
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

  // Check if membership already exists in this tenant
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
      organizationId // Strictly tenant isolated
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
  if (caller?.role !== 'ADMIN' && caller?.role !== 'MANAGER' && (session?.user as any)?.role !== 'SUPER_ADMIN') {
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

export async function claimLead(leadId: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId || !session?.user?.id) throw new Error("Unauthorized");

  // Get caller member role in this organization
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
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/revenue-engine');
  return { success: true, lead: updatedLead };
}

export async function assignLeadToUser(leadId: string, targetUserId: string, targetRole?: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  // Verify target user belongs to this organization
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
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/revenue-engine');
  return { success: true, lead: updatedLead };
}

export async function updateMemberCommission(data: {
  memberId: string;
  commissionRate: number;
  commissionType: 'PERCENTAGE' | 'FIXED_PER_DEAL' | 'FIXED_PER_APPOINTMENT';
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  // Verify caller is admin or manager
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

export async function updateGoogleCalendarIntegration(data: {
  googleCalendarConnected: boolean;
  googleCalendarEmail?: string;
  reminderChannels?: string;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const userId = session?.user?.id;
  if (!organizationId || !userId) throw new Error("Unauthorized");

  const member = await db.organizationMember.findFirst({
    where: { userId, organizationId }
  });
  if (!member) throw new Error("Member not found");

  const updated = await db.organizationMember.update({
    where: { id: member.id },
    data: {
      googleCalendarConnected: data.googleCalendarConnected,
      googleCalendarEmail: data.googleCalendarEmail || session?.user?.email,
      reminderChannels: data.reminderChannels || member.reminderChannels
    }
  });

  revalidatePath('/rep');
  revalidatePath('/closer');
  revalidatePath('/appointments');
  revalidatePath('/team');
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

export async function handoffLeadToCloser(data: {
  leadId: string;
  closerUserId: string;
  notes?: string;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const callerId = session?.user?.id;
  if (!organizationId || !callerId) throw new Error("Unauthorized");

  // Verify caller belongs to organization
  const callerMember = await db.organizationMember.findFirst({
    where: { userId: callerId, organizationId }
  });
  if (!callerMember) throw new Error("Caller not in workspace");

  // Verify target closer belongs to organization
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

export async function bookOrUpdateAppointment(data: {
  id?: string;
  leadId: string;
  title: string;
  scheduledAt: string;
  durationMinutes?: number;
  meetingUrl?: string;
  notes?: string;
  closerId?: string;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const userId = session?.user?.id;
  if (!organizationId || !userId) throw new Error("Unauthorized");

  const lead = await db.lead.findFirst({
    where: { id: data.leadId, organizationId }
  });
  if (!lead) throw new Error("Lead not found or unauthorized");

  const effectiveCloserId = data.closerId || lead.assignedUserId || userId;

  let appointment;
  if (data.id) {
    appointment = await db.appointment.update({
      where: { id: data.id },
      data: {
        title: data.title,
        scheduledAt: new Date(data.scheduledAt),
        durationMinutes: data.durationMinutes || 30,
        meetingUrl: data.meetingUrl || `https://meet.google.com/cls-${Math.random().toString(36).substring(2, 6)}-crf`,
        notes: data.notes,
        closerId: effectiveCloserId
      }
    });
  } else {
    appointment = await db.appointment.create({
      data: {
        title: data.title,
        scheduledAt: new Date(data.scheduledAt),
        durationMinutes: data.durationMinutes || 30,
        meetingUrl: data.meetingUrl || `https://meet.google.com/cls-${Math.random().toString(36).substring(2, 6)}-crf`,
        notes: data.notes,
        leadId: data.leadId,
        organizationId,
        closerId: effectiveCloserId,
        googleEventId: `gcal_${Date.now()}`
      }
    });

    await db.lead.update({
      where: { id: data.leadId },
      data: { status: 'SCHEDULED' }
    });
  }

  revalidatePath('/appointments');
  revalidatePath('/rep');
  revalidatePath('/closer');
  revalidatePath('/leads');
  return { success: true, appointment };
}

export async function updateAppointmentStatus(appointmentId: string, status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED') {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const appointment = await db.appointment.findFirst({
    where: { id: appointmentId, organizationId }
  });
  if (!appointment) throw new Error("Appointment not found");

  const updated = await db.appointment.update({
    where: { id: appointmentId },
    data: { status }
  });

  revalidatePath('/appointments');
  revalidatePath('/rep');
  revalidatePath('/closer');
  return { success: true, appointment: updated };
}

