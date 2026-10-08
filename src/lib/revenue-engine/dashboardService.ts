import { db } from "@/lib/db";

export interface DashboardMetrics {
  closedWon: number;
  openPipeline: number;
  newLeads: number;
  upcomingAppointments: number;
  openLeaks: number;
  pendingHumanActions: number;
  currency: string;
}

export async function getDashboardMetrics(organizationId: string, startDate: Date, endDate: Date, currency: string = 'USD'): Promise<DashboardMetrics> {
  const [
    closedWonResult,
    openPipelineResult,
    newLeads,
    upcomingAppointments,
    openLeaks,
    pendingHumanActions
  ] = await Promise.all([
    db.deal.aggregate({
      where: { organizationId, stage: 'WON', currency, closedAt: { gte: startDate, lt: endDate } },
      _sum: { amount: true }
    }),
    db.deal.aggregate({
      where: { organizationId, stage: { notIn: ['WON', 'LOST'] }, currency },
      _sum: { amount: true }
    }),
    db.lead.count({
      where: { organizationId, createdAt: { gte: startDate, lt: endDate } }
    }),
    db.appointment.count({
      where: { organizationId, scheduledAt: { gt: new Date() }, status: 'SCHEDULED' }
    }),
    db.revenueLeak.count({
      where: { organizationId, status: 'OPEN' }
    }),
    db.revenueAction.count({
      where: { organizationId, status: 'PENDING', recommendedActor: 'HUMAN' }
    })
  ]);

  return {
    closedWon: closedWonResult._sum.amount || 0,
    openPipeline: openPipelineResult._sum.amount || 0,
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

export async function getRevenueActions(organizationId: string, filter: 'needs_attention' | 'my_actions' | 'all' = 'all', userId?: string): Promise<RevenueActionWithRelations[]> {
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
    take: 50
  }) as RevenueActionWithRelations[];
}

export async function getChartData(organizationId: string, startDate: Date, endDate: Date, currency: string = 'USD') {
  // Aggregate WON deals by day for the chart
  const deals = await db.deal.findMany({
    where: { organizationId, stage: 'WON', currency, closedAt: { gte: startDate, lt: endDate } },
    select: { closedAt: true, amount: true },
    orderBy: { closedAt: 'asc' }
  });
  
  // Group by date string
  const grouped: Record<string, number> = {};
  deals.forEach(deal => {
    if (deal.closedAt) {
      const dateKey = deal.closedAt.toISOString().split('T')[0];
      grouped[dateKey] = (grouped[dateKey] || 0) + (deal.amount || 0);
    }
  });
  
  const result = Object.entries(grouped).map(([date, value]) => ({ date, value }));
  return result;
}
