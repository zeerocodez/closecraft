import { db } from '@/lib/db';
import { assertWorkspacePermission } from '@/lib/permissions/matrix';

/**
 * PRODUCTION SALES OPERATIONS DOMAIN SERVICE
 * Enforces contact identity separate from deals/opportunities,
 * reviewed duplicate merging, custom stage category mapping,
 * reversible archiving, and distinct booked vs verified financial amounts.
 */

export interface CreateContactParams {
  organizationId: string;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  communicationPreferences?: {
    preferredChannel?: 'WHATSAPP' | 'EMAIL' | 'PHONE';
    timezone?: string;
  };
  source?: string;
}

export async function createContact(userId: string, params: CreateContactParams) {
  await assertWorkspacePermission(params.organizationId, userId, 'leads:create');

  const contact = await db.contact.create({
    data: {
      organizationId: params.organizationId,
      name: params.name.trim(),
      email: params.email ? params.email.trim().toLowerCase() : null,
      phone: params.phone ? params.phone.trim() : null,
      companyName: params.companyName?.trim() || null,
      jobTitle: params.jobTitle?.trim() || null,
      communicationPreferences: params.communicationPreferences ? JSON.stringify(params.communicationPreferences) : null,
      source: params.source || 'MANUAL',
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorId: userId,
      actorType: 'USER',
      action: 'CONTACT_CREATED',
      resourceType: 'CONTACT',
      resourceId: contact.id,
      newState: JSON.stringify({ name: contact.name, email: contact.email, phone: contact.phone }),
    }
  });

  return contact;
}

export async function archiveContact(userId: string, contactId: string, organizationId: string, reason: string) {
  await assertWorkspacePermission(organizationId, userId, 'leads:archive');

  const updated = await db.contact.update({
    where: { id: contactId },
    data: {
      isArchived: true,
      archivedAt: new Date(),
      archiveReason: reason,
    }
  });

  await db.auditLog.create({
    data: {
      organizationId,
      actorId: userId,
      actorType: 'USER',
      action: 'CONTACT_ARCHIVED',
      resourceType: 'CONTACT',
      resourceId: contactId,
      reason,
    }
  });

  return updated;
}

export async function optOutContact(userId: string, contactId: string, organizationId: string) {
  await assertWorkspacePermission(organizationId, userId, 'leads:edit');

  return await db.contact.update({
    where: { id: contactId },
    data: {
      optOutOutreach: true,
    }
  });
}

/**
 * Opportunity Management: Distinguishes Booked Value from Verified Collections
 */
export async function createOpportunity(userId: string, params: {
  organizationId: string;
  title: string;
  contactId?: string;
  leadId?: string;
  stage?: string;
  systemCategory?: string;
  bookedAmount: number;
  currency?: string;
  assignedUserId?: string;
  probability?: number;
  targetCloseDate?: Date | string;
}) {
  await assertWorkspacePermission(params.organizationId, userId, 'deals:create');

  const opp = await db.opportunity.create({
    data: {
      organizationId: params.organizationId,
      title: params.title.trim(),
      contactId: params.contactId || null,
      leadId: params.leadId || null,
      stage: params.stage || 'NEW',
      systemCategory: params.systemCategory || 'INBOX',
      bookedAmount: params.bookedAmount || 0.0,
      verifiedCollections: 0.0,
      currency: params.currency || 'NGN',
      assignedUserId: params.assignedUserId || userId,
      probability: params.probability || 20,
      targetCloseDate: params.targetCloseDate ? new Date(params.targetCloseDate) : null,
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorId: userId,
      actorType: 'USER',
      action: 'OPPORTUNITY_CREATED',
      resourceType: 'OPPORTUNITY',
      resourceId: opp.id,
      newState: JSON.stringify({ title: opp.title, bookedAmount: opp.bookedAmount, currency: opp.currency }),
    }
  });

  return opp;
}

export async function updateOpportunityStage(userId: string, params: {
  organizationId: string;
  opportunityId: string;
  newStage: string;
  systemCategory: 'INBOX' | 'ACTIVE' | 'QUALIFYING' | 'PROPOSAL' | 'WON' | 'LOST';
  lossReason?: string;
}) {
  await assertWorkspacePermission(params.organizationId, userId, 'deals:edit');

  const opp = await db.opportunity.findUnique({
    where: { id: params.opportunityId }
  });
  if (!opp) throw new Error('Opportunity not found');

  const updated = await db.opportunity.update({
    where: { id: params.opportunityId },
    data: {
      stage: params.newStage,
      systemCategory: params.systemCategory,
      closedAt: (params.systemCategory === 'WON' || params.systemCategory === 'LOST') ? new Date() : null,
      lossReason: params.lossReason || null,
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorId: userId,
      actorType: 'USER',
      action: 'OPPORTUNITY_STAGE_CHANGED',
      resourceType: 'OPPORTUNITY',
      resourceId: opp.id,
      oldState: JSON.stringify({ stage: opp.stage, systemCategory: opp.systemCategory }),
      newState: JSON.stringify({ stage: updated.stage, systemCategory: updated.systemCategory, lossReason: params.lossReason }),
    }
  });

  return updated;
}

/**
 * Records verified collected cash without conflating with booked value.
 */
export async function recordOpportunityCollection(userId: string, params: {
  organizationId: string;
  opportunityId: string;
  verifiedAmount: number;
  collectionReference: string;
}) {
  await assertWorkspacePermission(params.organizationId, userId, 'deals:edit');

  const opp = await db.opportunity.findUnique({
    where: { id: params.opportunityId }
  });
  if (!opp) throw new Error('Opportunity not found');

  const updatedCollections = opp.verifiedCollections + params.verifiedAmount;

  const updated = await db.opportunity.update({
    where: { id: params.opportunityId },
    data: {
      verifiedCollections: updatedCollections,
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorId: userId,
      actorType: 'USER',
      action: 'COLLECTION_VERIFIED',
      resourceType: 'OPPORTUNITY',
      resourceId: opp.id,
      metadata: JSON.stringify({
        verifiedAmount: params.verifiedAmount,
        totalCollections: updatedCollections,
        reference: params.collectionReference,
      })
    }
  });

  return updated;
}

/**
 * Reviewed Duplicate Lead Merging
 * Merges secondaryLead into primaryLead while strictly preserving historical provenance.
 */
export async function mergeLeads(userId: string, params: {
  organizationId: string;
  primaryLeadId: string;
  secondaryLeadId: string;
  mergeReason: string;
}) {
  await assertWorkspacePermission(params.organizationId, userId, 'leads:merge');

  if (params.primaryLeadId === params.secondaryLeadId) {
    throw new Error('Cannot merge a lead into itself.');
  }

  const [primary, secondary] = await Promise.all([
    db.lead.findUnique({ where: { id: params.primaryLeadId } }),
    db.lead.findUnique({ where: { id: params.secondaryLeadId } })
  ]);

  if (!primary || !secondary) throw new Error('One or both leads could not be found.');
  if (primary.organizationId !== params.organizationId || secondary.organizationId !== params.organizationId) {
    throw new Error('Tenant mismatch: both leads must belong to the active workspace.');
  }

  // Transactionally reassign relations from secondary to primary
  await db.$transaction(async (tx) => {
    // 1. Reassign deals
    await tx.deal.updateMany({
      where: { leadId: secondary.id },
      data: { leadId: primary.id }
    });

    // 2. Reassign appointments
    await tx.appointment.updateMany({
      where: { leadId: secondary.id },
      data: { leadId: primary.id }
    });

    // 3. Reassign conversations
    await tx.conversation.updateMany({
      where: { leadId: secondary.id },
      data: { leadId: primary.id }
    });

    // 4. Reassign blockers
    await tx.clientBlocker.updateMany({
      where: { leadId: secondary.id },
      data: { leadId: primary.id }
    });

    // 5. Reassign opportunities
    await tx.opportunity.updateMany({
      where: { leadId: secondary.id },
      data: { leadId: primary.id }
    });

    // 6. Mark secondary as archived & merged
    await tx.lead.update({
      where: { id: secondary.id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archiveReason: `Merged into primary lead ${primary.id}: ${params.mergeReason}`,
        mergedIntoLeadId: primary.id,
      }
    });

    // 7. Write audit log
    await tx.auditLog.create({
      data: {
        organizationId: params.organizationId,
        actorId: userId,
        actorType: 'USER',
        action: 'LEAD_MERGED',
        resourceType: 'LEAD',
        resourceId: primary.id,
        reason: params.mergeReason,
        metadata: JSON.stringify({
          primaryLeadId: primary.id,
          secondaryLeadId: secondary.id,
          secondaryName: secondary.name,
          secondaryEmail: secondary.email,
        }),
      }
    });
  });

  return { success: true, primaryLeadId: primary.id, mergedSecondaryLeadId: secondary.id };
}

/**
 * Timezone-Aware Appointments & Handover Coordination
 */
export async function coordinateAppointment(userId: string, params: {
  organizationId: string;
  leadId: string;
  title: string;
  scheduledAt: Date | string;
  durationMinutes?: number;
  meetingUrl?: string;
  notes?: string;
  closerId?: string;
  timezone?: string;
}) {
  await assertWorkspacePermission(params.organizationId, userId, 'leads:edit');

  const appt = await db.appointment.create({
    data: {
      organizationId: params.organizationId,
      leadId: params.leadId,
      title: params.title.trim(),
      scheduledAt: new Date(params.scheduledAt),
      durationMinutes: params.durationMinutes || 30,
      meetingUrl: params.meetingUrl || null,
      notes: params.notes || null,
      closerId: params.closerId || null,
      status: 'SCHEDULED',
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorId: userId,
      actorType: 'USER',
      action: 'APPOINTMENT_SCHEDULED',
      resourceType: 'APPOINTMENT',
      resourceId: appt.id,
      metadata: JSON.stringify({
        scheduledAt: appt.scheduledAt,
        closerId: appt.closerId,
        timezone: params.timezone || 'UTC',
      })
    }
  });

  return appt;
}
