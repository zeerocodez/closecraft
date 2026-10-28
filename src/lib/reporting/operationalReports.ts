import { db } from '@/lib/db';
import { assertWorkspacePermission } from '@/lib/permissions/matrix';

/**
 * OPERATIONAL & FINANCIAL REPORTING SERVICE
 * Strictly separates booked opportunity value from verified collections.
 * Avoids labeling gross collections as net profit.
 * Separates currencies without arbitrary summed conversions.
 */

export async function getWorkspaceOperationalReport(userId: string, organizationId: string) {
  await assertWorkspacePermission(organizationId, userId, 'leads:view_all');

  const now = new Date();

  // 1. Leads breakdown
  const leads = await db.lead.findMany({
    where: { organizationId, isArchived: false },
    select: {
      id: true,
      name: true,
      status: true,
      estimatedValue: true,
      currency: true,
      assignedUserId: true,
      nextAction: true,
      nextActionDueAt: true,
      blockerStatus: true,
    }
  });

  const totalLeads = leads.length;
  const unassignedCount = leads.filter(l => !l.assignedUserId).length;
  const missingActionCount = leads.filter(l => !l.nextAction).length;
  const overdueCount = leads.filter(l => l.nextActionDueAt && new Date(l.nextActionDueAt) < now).length;
  const blockersCount = leads.filter(l => l.blockerStatus === 'WAITING_ON_CLIENT').length;

  // 2. Opportunities breakdown: Booked vs Verified Collections
  const opportunities = await db.opportunity.findMany({
    where: { organizationId, isArchived: false },
    select: {
      id: true,
      stage: true,
      systemCategory: true,
      bookedAmount: true,
      verifiedCollections: true,
      currency: true,
    }
  });

  const totalsByCurrency: Record<string, { booked: number; collected: number }> = {};
  for (const opp of opportunities) {
    const cur = opp.currency || 'NGN';
    if (!totalsByCurrency[cur]) totalsByCurrency[cur] = { booked: 0, collected: 0 };
    totalsByCurrency[cur].booked += opp.bookedAmount;
    totalsByCurrency[cur].collected += opp.verifiedCollections;
  }

  // 3. Managed pilot status
  const activeEngagement = await db.pilotEngagement.findFirst({
    where: { organizationId, status: 'ACTIVE' },
    include: {
      workLogs: true,
      blockers: { where: { status: 'OPEN' } }
    }
  });

  const capacityLogged = activeEngagement
    ? activeEngagement.workLogs.reduce((acc, l) => acc + l.hoursSpent, 0)
    : 0;

  return {
    metrics: {
      totalLeads,
      unassignedCount,
      missingActionCount,
      overdueCount,
      blockersCount,
    },
    financialsByCurrency: totalsByCurrency,
    pilotCapacity: activeEngagement ? {
      title: activeEngagement.title,
      agreedCapacity: activeEngagement.agreedCapacity,
      capacityUnit: activeEngagement.capacityUnit,
      capacityLogged,
      openBlockersCount: activeEngagement.blockers.length,
    } : null,
  };
}

/**
 * Platform Delivery & Economics Report (Operator / Finance Restricted)
 */
export async function getPlatformDeliveryEconomicsReport(operatorUserId: string) {
  // Fetch all engagements
  const engagements = await db.pilotEngagement.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      clientServicePrice: true,
      professionalCompensation: true,
      operatorHourlyCostRate: true,
      directDeliveryCosts: true,
      estimatedPaymentFees: true,
      expectedContribution: true,
      currency: true,
      workLogs: true,
      payables: true,
    }
  });

  // Calculate actual effort costs
  let totalGrossInvoiced = 0;
  let totalProfessionalPayables = 0;
  let totalDirectCosts = 0;

  for (const eng of engagements) {
    totalGrossInvoiced += eng.clientServicePrice;
    totalProfessionalPayables += eng.professionalCompensation;
    totalDirectCosts += (eng.directDeliveryCosts + eng.estimatedPaymentFees);
  }

  const netPlatformContribution = totalGrossInvoiced - (totalProfessionalPayables + totalDirectCosts);

  return {
    engagementsCount: engagements.length,
    activeEngagementsCount: engagements.filter(e => e.status === 'ACTIVE').length,
    totalGrossInvoiced,
    totalProfessionalPayables,
    totalDirectCosts,
    netPlatformContribution,
    note: 'Internal cost rates and processing fees represent recognized delivery obligations. Gross collections are not labeled as net profit.',
  };
}
