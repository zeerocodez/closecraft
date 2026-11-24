import { db } from "@/lib/db";

export interface DashboardMetrics {
  closedWon: number; // Backward-compatible alias for closedWonContractValue
  openPipeline: number; // Backward-compatible alias for qualifiedPipelineValue
  closedWonContractValue: number; // Signed / won contracts
  qualifiedPipelineValue: number; // Active open opportunities in negotiation/pipeline
  estimatedOpportunityValue: number; // AI / form estimates labeled as estimated
  proposalValue: number; // Formally sent proposals
  verifiedRealisedRevenue: number; // Verified paid invoices & collected funds only
  revenueAtRisk: number; // Value tied to open revenue leaks and SLA breaches
  revenueRecovered: number; // Value recovered from resolved leakage
  newLeads: number;
  upcomingAppointments: number;
  openLeaks: number;
  pendingHumanActions: number;
  currency: string;
}

export async function getDashboardMetrics(
  organizationId: string, 
  startDate: Date, 
  endDate: Date, 
  currency: string = 'NGN'
): Promise<DashboardMetrics> {
  const [
    closedWonResult,
    openPipelineResult,
    newLeads,
    upcomingAppointments,
    openLeaks,
    pendingHumanActions,
    estimatedLeadsResult,
    proposalsResult,
    verifiedInvoicesResult,
    verifiedCollectionsResult,
  ] = await Promise.all([
    // 1. Closed-Won Deals (Contract Volume)
    db.deal.aggregate({
      where: { organizationId, stage: 'WON', currency, closedAt: { gte: startDate, lt: endDate } },
      _sum: { amount: true }
    }),
    // 2. Open Pipeline (Negotiation & Opportunity stages)
    db.deal.aggregate({
      where: { organizationId, stage: { notIn: ['WON', 'LOST'] }, currency },
      _sum: { amount: true }
    }),
    // 3. New Leads Count
    db.lead.count({
      where: { organizationId, createdAt: { gte: startDate, lt: endDate } }
    }),
    // 4. Upcoming Scheduled Appointments
    db.appointment.count({
      where: { organizationId, scheduledAt: { gt: new Date() }, status: 'SCHEDULED' }
    }),
    // 5. Active Open Revenue Leaks
    db.revenueLeak.count({
      where: { organizationId, status: 'OPEN' }
    }),
    // 6. Pending Human Action Tasks
    db.revenueAction.count({
      where: { organizationId, status: 'PENDING', recommendedActor: 'HUMAN' }
    }),
    // 7. Estimated Opportunity Value across active leads
    db.lead.aggregate({
      where: { organizationId, currency, status: { notIn: ['WON', 'LOST'] } },
      _sum: { estimatedValue: true }
    }),
    // 8. Proposals Sent
    db.projectProposal.findMany({
      where: { projectRequest: { organizationId }, status: 'SENT' },
      select: { totalAmount: true }
    }),
    // 9. Verified Paid Invoices (Bachs/Paystack collections)
    db.projectInvoice.findMany({
      where: { projectRequest: { organizationId }, status: 'PAID' },
      select: { totalAmount: true }
    }),
    // 10. Verified Collections on Opportunities
    db.opportunity.aggregate({
      where: { organizationId, currency },
      _sum: { verifiedCollections: true }
    })
  ]);

  const proposalValue = proposalsResult.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
  const paidInvoiceValue = verifiedInvoicesResult.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
  const verifiedRealisedRevenue = paidInvoiceValue + (verifiedCollectionsResult._sum.verifiedCollections || 0);

  const closedWon = closedWonResult._sum.amount || 0;
  const openPipeline = openPipelineResult._sum.amount || 0;
  const estimatedOpportunityValue = estimatedLeadsResult._sum.estimatedValue || 0;

  // Approximate revenue at risk: sum of open pipeline deals that currently have open leaks or breached SLAs
  const leakedDeals = await db.revenueLeak.findMany({
    where: { organizationId, status: 'OPEN', leadId: { not: null } },
    select: {
      lead: {
        select: {
          deals: {
            where: { stage: { notIn: ['WON', 'LOST'] } },
            select: { amount: true }
          }
        }
      }
    }
  });

  const revenueAtRisk = leakedDeals.reduce((sum, leak) => {
    const dealSum = leak.lead?.deals?.reduce((dSum, d) => dSum + d.amount, 0) || 0;
    return sum + dealSum;
  }, 0);

  // Revenue recovered: deals won from leads that previously had resolved leaks
  const recoveredDeals = await db.revenueLeak.findMany({
    where: { organizationId, status: 'RESOLVED', leadId: { not: null } },
    select: {
      lead: {
        select: {
          deals: {
            where: { stage: 'WON' },
            select: { amount: true }
          }
        }
      }
    }
  });

  const revenueRecovered = recoveredDeals.reduce((sum, leak) => {
    const dealSum = leak.lead?.deals?.reduce((dSum, d) => dSum + d.amount, 0) || 0;
    return sum + dealSum;
  }, 0);

  return {
    closedWon,
    openPipeline,
    closedWonContractValue: closedWon,
    qualifiedPipelineValue: openPipeline,
    estimatedOpportunityValue,
    proposalValue,
    verifiedRealisedRevenue,
    revenueAtRisk,
    revenueRecovered,
    newLeads,
    upcomingAppointments,
    openLeaks,
    pendingHumanActions,
    currency
  };
}

export type RevenueActionWithRelations = {
  id: string;
  type: string;
  reason: string | null;
  priority: number;
  recommendedActor: string;
  assignedUserId: string | null;
  scheduledAt: Date | null;
  executedAt: Date | null;
  status: string;
  createdAt: Date;
  lead: {
    id: string;
    name: string;
  };
};

export async function getRevenueActions(
  organizationId: string, 
  filter: 'needs_attention' | 'my_actions' | 'all' = 'all', 
  userId?: string
): Promise<RevenueActionWithRelations[]> {
  const where: any = { organizationId };
  
  if (filter === 'needs_attention') {
    where.status = 'PENDING';
  } else if (filter === 'my_actions') {
    where.assignedUserId = userId;
    where.status = { notIn: ['COMPLETED', 'CANCELLED'] };
  }

  return await db.revenueAction.findMany({
    where,
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ],
    include: {
      lead: { select: { id: true, name: true } }
    },
    take: 20
  });
}

/**
 * Aggregates closed-won deals by date for revenue charts.
 */
export async function getChartData(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  currency: string = 'NGN'
): Promise<{ date: string; value: number }[]> {
  const deals = await db.deal.findMany({
    where: {
      organizationId,
      stage: 'WON',
      currency,
      closedAt: { gte: startDate, lte: endDate }
    },
    select: {
      amount: true,
      closedAt: true
    },
    orderBy: { closedAt: 'asc' }
  });

  if (!deals.length) return [];

  const map: Record<string, number> = {};
  for (const d of deals) {
    if (!d.closedAt) continue;
    const dateStr = d.closedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    map[dateStr] = (map[dateStr] || 0) + Number(d.amount || 0);
  }

  return Object.entries(map).map(([date, value]) => ({ date, value }));
}
