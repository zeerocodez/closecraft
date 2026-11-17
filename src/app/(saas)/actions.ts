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
    // Check internal seat limit from workspace subscription
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

// -----------------------------------------------------------------------------
// PILOT & FAST ENQUIRY SERVER ACTIONS
// -----------------------------------------------------------------------------

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

  // Validate phone format if provided
  if (cleanPhone) {
    const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      throw new Error("Please enter a valid international phone number.");
    }
  }

  // Duplicate check warning
  const { checkDuplicateLead, createLeadForTenant } = await import('@/lib/dal/lead');
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

  // Audit log
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

  // Invalidate any obsolete follow up tasks on rescheduling/cancellation
  await db.followUpTask.updateMany({
    where: { leadId: data.leadId, status: 'PENDING' },
    data: { status: 'CANCELLED', reason: 'Rescheduled via Today action' }
  });

  // If a new follow-up is scheduled and due in future, create a durable task
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

  // Add outcome note to audit / conversation
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

export async function submitSalesSupportRequest(data: {
  helpNeeded: string[];
  offerSummary: string;
  recentEnquiryVolume: string;
  targetAudience?: string;
  typicalDealValue?: string;
  workingHoursRequired?: string;
  languageRequirements?: string;
  currentDifficulties?: string;
  authorizedDecisionMaker?: string;
  additionalNotes?: string;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const currentUserId = session?.user?.id;
  if (!organizationId || !currentUserId) throw new Error("Unauthorized");

  const request = await db.salesSupportRequest.create({
    data: {
      organizationId,
      requestedByUserId: currentUserId,
      status: 'SUBMITTED',
      helpNeeded: JSON.stringify(data.helpNeeded || []),
      offerSummary: data.offerSummary.trim(),
      recentEnquiryVolume: data.recentEnquiryVolume.trim(),
      targetAudience: data.targetAudience?.trim() || null,
      typicalDealValue: data.typicalDealValue?.trim() || null,
      workingHoursRequired: data.workingHoursRequired?.trim() || null,
      languageRequirements: data.languageRequirements?.trim() || null,
      currentDifficulties: data.currentDifficulties?.trim() || null,
      authorizedDecisionMaker: data.authorizedDecisionMaker?.trim() || null,
      additionalNotes: data.additionalNotes?.trim() || null,
    }
  });

  await db.auditLog.create({
    data: {
      organizationId,
      actorId: currentUserId,
      actorType: 'USER',
      action: 'SALES_SUPPORT_REQUESTED',
      resourceType: 'SALES_SUPPORT_REQUEST',
      resourceId: request.id,
      newState: JSON.stringify({ offerSummary: data.offerSummary, helpNeeded: data.helpNeeded })
    }
  });

  revalidatePath('/sales-support');
  revalidatePath('/operator');

  return { success: true, request };
}

export async function saveClientBlocker(data: {
  leadId?: string;
  engagementId?: string;
  whatIsNeeded: string;
  whoMustRespond: string;
  requiredResponseDate: string;
  affectedNextAction?: string;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const currentUserId = session?.user?.id;
  if (!organizationId || !currentUserId) throw new Error("Unauthorized");

  const { createClientBlocker } = await import('@/lib/pilot/pilotService');
  const blocker = await createClientBlocker({
    organizationId,
    leadId: data.leadId,
    engagementId: data.engagementId,
    whatIsNeeded: data.whatIsNeeded,
    whoMustRespond: data.whoMustRespond,
    requiredResponseDate: new Date(data.requiredResponseDate),
    affectedNextAction: data.affectedNextAction,
  });

  revalidatePath('/today');
  revalidatePath('/sales-support');
  revalidatePath('/leads');
  revalidatePath('/rep');

  return { success: true, blocker };
}

export async function resolveBlockerAction(blockerId: string, resolutionNotes: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const currentUserId = session?.user?.id;
  if (!organizationId || !currentUserId) throw new Error("Unauthorized");

  const { resolveClientBlocker } = await import('@/lib/pilot/pilotService');
  const resolved = await resolveClientBlocker(blockerId, currentUserId, resolutionNotes);

  revalidatePath('/today');
  revalidatePath('/sales-support');
  revalidatePath('/leads');
  revalidatePath('/rep');

  return { success: true, blocker: resolved };
}

export async function logPilotEffort(data: {
  engagementId: string;
  hoursSpent: number;
  activityDescription: string;
  leadsWorkedCount?: number;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const currentUserId = session?.user?.id;
  if (!organizationId || !currentUserId) throw new Error("Unauthorized");

  const member = await db.organizationMember.findFirst({
    where: { userId: currentUserId, organizationId },
    select: { role: true }
  });

  const actorRole = member?.role === 'EXTERNAL_PROFESSIONAL' ? 'PROFESSIONAL' : 'OPERATOR';

  const { logWorkEffort } = await import('@/lib/pilot/pilotService');
  const log = await logWorkEffort({
    engagementId: data.engagementId,
    userId: currentUserId,
    actorRole,
    hoursSpent: Number(data.hoursSpent),
    activityDescription: data.activityDescription,
    leadsWorkedCount: data.leadsWorkedCount,
  });

  revalidatePath('/sales-support');
  revalidatePath('/rep');
  revalidatePath('/operator');

  return { success: true, log };
}

export async function acceptPilotTermsAction(engagementId: string, termsText: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const currentUserId = session?.user?.id;
  if (!organizationId || !currentUserId) throw new Error("Unauthorized");

  const member = await db.organizationMember.findFirst({
    where: { userId: currentUserId, organizationId }
  });

  if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    throw new Error("Only a workspace Owner or Admin can accept commercial terms.");
  }

  const { recordTermsAcceptance } = await import('@/lib/pilot/pilotService');
  const updated = await recordTermsAcceptance(engagementId, currentUserId, 'web-client', termsText);

  revalidatePath('/sales-support');
  revalidatePath('/operator');

  return { success: true, engagement: updated };
}

export async function createBachsCheckoutAction(params: {
  type: 'SOFTWARE_SUBSCRIPTION' | 'PILOT_ENGAGEMENT';
  amount?: number;
  plan?: 'STARTER' | 'PRO';
  currency?: string;
  engagementId?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const { createBachsCheckoutSession } = await import('@/lib/payments/bachs');
  const { WORKSPACE_PLANS } = await import('@/lib/payments/subscription');

  let finalAmount = params.amount;
  if (!finalAmount) {
    if (params.type === 'SOFTWARE_SUBSCRIPTION') {
      const selectedPlan = params.plan === 'PRO' ? WORKSPACE_PLANS.PRO : WORKSPACE_PLANS.STARTER;
      finalAmount = selectedPlan.pricePerMonth;
    } else {
      finalAmount = 150000;
    }
  }

  const checkout = await createBachsCheckoutSession({
    organizationId,
    type: params.type,
    plan: params.plan,
    amount: finalAmount,
    currency: params.currency || 'NGN',
    customerEmail: session.user.email || undefined,
    customerName: session.user.name || undefined,
    engagementId: params.engagementId,
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
  });

  return checkout;
}

export async function updateOrganizationIdentity(name: string, whatsappNumber: string) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const userId = session?.user?.id;
  if (!organizationId || !userId) throw new Error("Unauthorized");

  // Verify user has ADMIN or OWNER privileges
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

export async function seedSampleWorkspaceAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error('Organization required');

  const existingDemo = await db.lead.findFirst({
    where: { organizationId, message: { contains: '[DEMO_SEED]' } }
  });
  if (existingDemo) {
    return { success: true, message: 'Demo workspace already seeded.' };
  }

  const lead1 = await db.lead.create({
    data: {
      organizationId,
      name: 'Tunde Balogun',
      email: `tunde.balogun.${Date.now()}@techcorplagos.ng`,
      phone: '+2348031234567',
      message: '[DEMO_SEED] High-intent enterprise lead seeking 30-day sales operations pilot for 12 outbound reps.',
      source: 'META_LEAD_AD',
      status: 'QUALIFIED',
      buyingIntent: 92,
      estimatedValue: 1200000,
      currency: 'NGN',
      nextAction: 'Execute WhatsApp Discovery Call',
      nextActionDueAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      aiAssessment: 'Enterprise lead with 12 outbound reps. High buying velocity with budget allocated for Q4 revenue systems upgrade.',
      nextStepsRecommendation: 'Initiate WhatsApp outreach within 30 minutes to lock discovery call before competitor demo.',
    }
  });

  const lead2 = await db.lead.create({
    data: {
      organizationId,
      name: 'Dr. Amara Okafor',
      email: `amara.okafor.${Date.now()}@apexclinics.com`,
      phone: '+2348059876543',
      message: '[DEMO_SEED] Requires multi-location patient enquiry triage and automated WhatsApp reminders.',
      source: 'WEBSITE',
      status: 'CONTACTED',
      buyingIntent: 78,
      estimatedValue: 450000,
      currency: 'NGN',
      nextAction: 'Confirm Pricing Sheet Review',
      nextActionDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      aiAssessment: 'Multi-branch healthcare enquiry triage. Needs HIPAA/NDPR-compliant automated appointment reminders.',
      nextStepsRecommendation: 'Send customized pricing tier breakdown and video walkthrough.',
    }
  });

  const lead3 = await db.lead.create({
    data: {
      organizationId,
      name: 'Ibrahim Musa',
      email: `ibrahim.musa.${Date.now()}@northlinelogistics.com`,
      phone: '+2348123456789',
      message: '[DEMO_SEED] Overdue follow-up trigger: Requested custom quarterly billing schedule.',
      source: 'WHATSAPP',
      status: 'NEW',
      buyingIntent: 65,
      estimatedValue: 850000,
      currency: 'NGN',
      nextAction: 'Escalate to Human Closer (Custom Terms)',
      nextActionDueAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      aiAssessment: 'Mid-sized logistics firm requiring flexible quarterly terms. High likelihood of stalled deal if SLA exceeds 4 hours.',
      nextStepsRecommendation: 'Senior closer assignment required to approve milestone-based invoice terms.',
    }
  });

  // Seed Deals
  await db.deal.create({
    data: {
      organizationId,
      leadId: lead1.id,
      title: '[DEMO_SEED] 30-Day Sales Ops Pilot - TechCorp',
      amount: 1200000,
      currency: 'NGN',
      stage: 'NEGOTIATION',
    }
  });

  await db.deal.create({
    data: {
      organizationId,
      leadId: lead3.id,
      title: '[DEMO_SEED] Fleet Logistics Dispatch - Northline',
      amount: 850000,
      currency: 'NGN',
      stage: 'PROPOSAL',
    }
  });

  // Seed Revenue Signals
  await db.revenueSignal.createMany({
    data: [
      { organizationId, leadId: lead1.id, type: 'INTENT', value: 92, evidence: 'Enterprise budget confirmed', source: 'AI' },
      { organizationId, leadId: lead2.id, type: 'INTENT', value: 78, evidence: 'High feature interest', source: 'AI' },
      { organizationId, leadId: lead3.id, type: 'INTENT', value: 65, evidence: 'Pricing negotiation ongoing', source: 'AI' },
    ]
  });

  // Seed Revenue Actions
  await db.revenueAction.create({
    data: {
      organizationId,
      leadId: lead1.id,
      type: 'EXECUTE_WHATSAPP_DISCOVERY',
      reason: 'High buying intent (92/100). WhatsApp discovery call requested for 12 outbound reps.',
      priority: 92,
      recommendedActor: 'HUMAN',
      status: 'PENDING',
    }
  });

  await db.revenueAction.create({
    data: {
      organizationId,
      leadId: lead3.id,
      type: 'ESCALATE_TO_CLOSER',
      reason: 'Overdue follow-up SLA breach: Requested custom quarterly billing terms.',
      priority: 85,
      recommendedActor: 'CLOSER',
      status: 'PENDING',
    }
  });

  await db.appointment.create({
    data: {
      organizationId,
      leadId: lead1.id,
      title: 'Commercial Demo with Tunde Balogun (TechCorp)',
      scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      durationMinutes: 30,
      status: 'CONFIRMED',
      meetingUrl: 'https://meet.google.com/closecraft-demo-bridge',
      notes: '[DEMO_SEED] Automated demo meeting bridge seeded for trial onboarding.',
    }
  });

  revalidatePath('/dashboard');
  revalidatePath('/leads');
  revalidatePath('/pipeline');
  revalidatePath('/inbox');
  revalidatePath('/appointments');

  return { success: true, count: 3 };
}

export async function clearSampleWorkspaceAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error('Organization required');

  await db.appointment.deleteMany({
    where: {
      organizationId,
      notes: { contains: '[DEMO_SEED]' }
    }
  });

  const deleted = await db.lead.deleteMany({
    where: {
      organizationId,
      message: { contains: '[DEMO_SEED]' }
    }
  });

  revalidatePath('/dashboard');
  revalidatePath('/leads');
  revalidatePath('/pipeline');
  revalidatePath('/inbox');
  revalidatePath('/appointments');

  return { success: true, deletedCount: deleted.count };
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

  // Find current lead and active action
  const lead = await db.lead.findFirst({
    where: { id: data.leadId, organizationId },
    include: { revenueActions: { where: { status: 'PENDING' } } }
  });
  if (!lead) throw new Error("Lead not found");

  const currentAction = lead.revenueActions[0];
  const originalActionType = currentAction ? currentAction.type : lead.nextAction || 'UNKNOWN';

  // Mark current action CANCELLED with human override note (never erase original AI decision)
  if (currentAction) {
    await db.revenueAction.update({
      where: { id: currentAction.id },
      data: {
        status: 'CANCELLED',
        cancellationReason: `Human override by ${session.user.name || session.user.email}: ${data.overrideReason}`,
      }
    });
  }

  // Create replacement action retaining audit trail
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

  // Update lead
  await db.lead.update({
    where: { id: data.leadId },
    data: {
      nextAction: data.newActionType,
      message: `${lead.message || ''}\n[Human Override by ${session.user.name || session.user.email}]: Replaced AI Next Action "${originalActionType}" with "${data.newActionType}". Reason: ${data.overrideReason}`,
    }
  });

  // Create audit log
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



