import { db } from "@/lib/db";

// STRICT TENANT & ROLE ISOLATION:
// All functions require organizationId and enforce it on the database query.
// External professionals are strictly restricted to assigned opportunities during active engagements.

export async function getLeadForTenant(
  leadId: string,
  organizationId: string,
  user?: { id: string; role: string }
) {
  // If user is EXTERNAL_PROFESSIONAL, restrict to assigned lead only
  if (user?.role === 'EXTERNAL_PROFESSIONAL') {
    const lead = await db.lead.findFirst({
      where: {
        id: leadId,
        organizationId,
        assignedUserId: user.id,
        pilotEngagement: {
          status: 'ACTIVE'
        }
      },
      include: {
        conversations: { include: { messages: true } },
        revenueActions: { where: { status: 'PENDING' }, orderBy: { priority: 'desc' }, take: 1 },
        blockers: { orderBy: { createdAt: 'desc' } },
        pilotEngagement: {
          select: {
            id: true,
            title: true,
            offerRepresented: true,
            activitiesIncluded: true,
            communicationChannels: true,
            responseWindows: true,
            status: true,
          }
        },
        organization: true,
      }
    });

    if (!lead) {
      throw new Error("Access Denied: External professionals can only access assigned opportunities during active engagements.");
    }
    return lead;
  }

  // Workspace internal members / admins
  const lead = await db.lead.findFirst({
    where: { 
      id: leadId,
      organizationId
    },
    include: {
      conversations: { include: { messages: true } },
      revenueActions: { where: { status: 'PENDING' }, orderBy: { priority: 'desc' }, take: 1 },
      blockers: { orderBy: { createdAt: 'desc' } },
      deals: true,
      pilotEngagement: true,
      organization: true
    }
  });

  if (!lead) throw new Error("Lead not found or does not belong to this organization");
  return lead;
}

export async function getLeadsForTenant(
  organizationId: string,
  user?: { id: string; role: string }
) {
  // External professional boundary
  if (user?.role === 'EXTERNAL_PROFESSIONAL') {
    return await db.lead.findMany({
      where: {
        organizationId,
        assignedUserId: user.id,
        pilotEngagement: {
          status: 'ACTIVE'
        }
      },
      include: {
        deals: true,
        blockers: { where: { status: 'OPEN' } },
        revenueActions: { where: { status: 'PENDING' }, orderBy: { priority: 'desc' }, take: 1 },
        revenueSignals: { where: { type: 'INTENT' }, orderBy: { createdAt: 'desc' }, take: 1 },
        pilotEngagement: {
          select: { id: true, title: true, offerRepresented: true, status: true }
        },
        assignedUser: {
          select: { id: true, name: true, email: true, image: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  // Workspace owner / internal members
  return await db.lead.findMany({
    where: { organizationId },
    include: {
      deals: true,
      blockers: { where: { status: 'OPEN' } },
      revenueActions: { where: { status: 'PENDING' }, orderBy: { priority: 'desc' }, take: 1 },
      revenueSignals: { where: { type: 'INTENT' }, orderBy: { createdAt: 'desc' }, take: 1 },
      pilotEngagement: {
        select: { id: true, title: true, status: true }
      },
      assignedUser: {
        select: { id: true, name: true, email: true, image: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Checks for likely duplicates in workspace before creating.
 * Does not silently merge records; returns duplicate match info for warning.
 */
export async function checkDuplicateLead(organizationId: string, email?: string, phone?: string) {
  const cleanEmail = email?.trim().toLowerCase() || null;
  const cleanPhone = phone?.replace(/[^0-9+]/g, '') || null;

  if (!cleanEmail && !cleanPhone) return null;

  const conditions: any[] = [];
  if (cleanEmail) conditions.push({ email: cleanEmail });
  if (cleanPhone) conditions.push({ phone: cleanPhone });

  const existing = await db.lead.findFirst({
    where: {
      organizationId,
      OR: conditions,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      assignedUser: { select: { name: true } }
    }
  });

  return existing;
}

export async function createLeadForTenant(data: { 
  name: string; 
  email?: string; 
  source: string; 
  status?: string; 
  organizationId: string;
  phone?: string;
  message?: string;
  buyingIntent?: number;
  estimatedValue?: number;
  currency?: string;
  nextAction?: string;
  nextActionDueAt?: Date;
  assignedUserId?: string;
  pilotEngagementId?: string;
}) {
  return await db.lead.create({
    data: {
      name: data.name.trim(),
      email: data.email?.trim() || "",
      phone: data.phone?.trim() || null,
      source: data.source,
      status: data.status || 'NEW',
      organizationId: data.organizationId,
      message: data.message?.trim() || null,
      buyingIntent: data.buyingIntent,
      estimatedValue: data.estimatedValue !== undefined ? Number(data.estimatedValue) : null,
      currency: data.currency || 'NGN',
      nextAction: data.nextAction?.trim() || null,
      nextActionDueAt: data.nextActionDueAt || null,
      assignedUserId: data.assignedUserId || null,
      pilotEngagementId: data.pilotEngagementId || null,
    }
  });
}

/**
 * Today View aggregated intelligence:
 * - Overdue follow-ups
 * - Follow-ups due today
 * - Open enquiries without a next action
 * - Unassigned records for authorized managers
 */
export async function getTodayViewData(organizationId: string, userId?: string, userRole?: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const baseFilter: any = { organizationId };

  // If user is external professional, restrict to assigned leads in active pilot
  if (userRole === 'EXTERNAL_PROFESSIONAL' && userId) {
    baseFilter.assignedUserId = userId;
    baseFilter.pilotEngagement = { status: 'ACTIVE' };
  }

  // 1. Overdue leads (nextActionDueAt < startOfToday and status is not terminal WON/LOST)
  const overdueLeads = await db.lead.findMany({
    where: {
      ...baseFilter,
      status: { notIn: ['WON', 'LOST'] },
      nextActionDueAt: { lt: startOfToday },
    },
    include: {
      assignedUser: { select: { id: true, name: true } },
      blockers: { where: { status: 'OPEN' } },
      pilotEngagement: { select: { id: true, title: true } }
    },
    orderBy: { nextActionDueAt: 'asc' }
  });

  // 2. Due today (nextActionDueAt between startOfToday and endOfToday)
  const dueTodayLeads = await db.lead.findMany({
    where: {
      ...baseFilter,
      status: { notIn: ['WON', 'LOST'] },
      nextActionDueAt: { gte: startOfToday, lte: endOfToday },
    },
    include: {
      assignedUser: { select: { id: true, name: true } },
      blockers: { where: { status: 'OPEN' } },
      pilotEngagement: { select: { id: true, title: true } }
    },
    orderBy: { nextActionDueAt: 'asc' }
  });

  // 3. Open enquiries without a scheduled next action
  const missingActionLeads = await db.lead.findMany({
    where: {
      ...baseFilter,
      status: { notIn: ['WON', 'LOST'] },
      OR: [
        { nextAction: null },
        { nextAction: '' },
        { nextActionDueAt: null }
      ]
    },
    include: {
      assignedUser: { select: { id: true, name: true } },
      blockers: { where: { status: 'OPEN' } },
      pilotEngagement: { select: { id: true, title: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 4. Unassigned records (only relevant for workspace owners/admins/managers)
  let unassignedLeads: any[] = [];
  if (userRole !== 'EXTERNAL_PROFESSIONAL') {
    unassignedLeads = await db.lead.findMany({
      where: {
        organizationId,
        status: { notIn: ['WON', 'LOST'] },
        assignedUserId: null,
      },
      include: {
        blockers: { where: { status: 'OPEN' } },
        pilotEngagement: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 5. Active blockers
  const openBlockers = await db.clientBlocker.findMany({
    where: {
      organizationId,
      status: 'OPEN',
      ...(userRole === 'EXTERNAL_PROFESSIONAL' && userId ? {
        lead: { assignedUserId: userId }
      } : {})
    },
    include: {
      lead: { select: { id: true, name: true, phone: true } },
      engagement: { select: { id: true, title: true } }
    },
    orderBy: { requiredResponseDate: 'asc' }
  });

  return {
    overdueLeads,
    dueTodayLeads,
    missingActionLeads,
    unassignedLeads,
    openBlockers,
    metrics: {
      overdueCount: overdueLeads.length,
      dueTodayCount: dueTodayLeads.length,
      missingActionCount: missingActionLeads.length,
      unassignedCount: unassignedLeads.length,
      blockersCount: openBlockers.length,
    }
  };
}
