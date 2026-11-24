import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = (session as any).organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organization context' }, { status: 400 });
    }

    // 1. Fetch Integration record with pages, adAccounts, forms, and recent sync logs
    const [integration, pages, adAccounts, forms, syncLogs, teamMembers] = await Promise.all([
      db.metaIntegration.findUnique({
        where: { organizationId },
      }),
      db.metaConnectedPage.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      }),
      db.metaAdAccount.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      }),
      db.metaLeadForm.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      }),
      db.metaLeadSyncLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      db.organizationMember.findMany({
        where: { organizationId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    // 2. Compute live Campaign-to-Revenue Attribution metrics from real database records
    const metaLeads = await db.lead.findMany({
      where: {
        organizationId,
        source: 'FACEBOOK_LEAD_AD',
      },
      include: {
        deals: true,
        followUpTasks: {
          where: { status: 'PENDING' },
        },
      },
    });

    const totalLeadsCaptured = metaLeads.length;
    const qualifiedLeads = metaLeads.filter((l) => (l.buyingIntent || 0) >= 70).length;
    const followUpsDue = metaLeads.filter((l) => l.followUpTasks.length > 0).length;
    
    // Closed-Won Deals & Verified Revenue Attribution
    let dealsWonCount = 0;
    let verifiedRevenue = 0;
    const campaignAttributionMap: Record<string, {
      campaignName: string;
      leadsCount: number;
      qualifiedCount: number;
      dealsWon: number;
      revenue: number;
    }> = {};

    for (const lead of metaLeads) {
      const campName = lead.metaCampaignName || 'Meta Instant Campaign';
      if (!campaignAttributionMap[campName]) {
        campaignAttributionMap[campName] = {
          campaignName: campName,
          leadsCount: 0,
          qualifiedCount: 0,
          dealsWon: 0,
          revenue: 0,
        };
      }
      campaignAttributionMap[campName].leadsCount++;
      if ((lead.buyingIntent || 0) >= 70) {
        campaignAttributionMap[campName].qualifiedCount++;
      }

      for (const deal of lead.deals) {
        if (deal.stage === 'WON') {
          dealsWonCount++;
          verifiedRevenue += deal.amount;
          campaignAttributionMap[campName].dealsWon++;
          campaignAttributionMap[campName].revenue += deal.amount;
        }
      }
    }

    const campaignAttribution = Object.values(campaignAttributionMap).sort((a, b) => b.leadsCount - a.leadsCount);

    return NextResponse.json({
      isConnected: Boolean(integration && integration.status === 'CONNECTED'),
      integration: integration
        ? {
            id: integration.id,
            metaUserId: integration.metaUserId,
            metaUserName: integration.metaUserName,
            businessPortfolioId: integration.businessPortfolioId,
            businessPortfolioName: integration.businessPortfolioName,
            status: integration.status,
            syncEnabled: integration.syncEnabled,
            lastSyncAt: integration.lastSyncAt,
            lastError: integration.lastError,
            defaultPipelineStage: integration.defaultPipelineStage,
            defaultAssigneeId: integration.defaultAssigneeId,
            tokenExpiresAt: integration.tokenExpiresAt,
          }
        : null,
      pages: pages.map((p) => ({
        id: p.id,
        pageId: p.pageId,
        pageName: p.pageName,
        isSubscribed: p.isSubscribed,
        subscribedAt: p.subscribedAt,
        isActive: p.isActive,
        leadAccessStatus: p.leadAccessStatus,
      })),
      adAccounts: adAccounts.map((a) => ({
        id: a.id,
        adAccountId: a.adAccountId,
        name: a.name,
        currency: a.currency,
        accountStatus: a.accountStatus,
        isActive: a.isActive,
      })),
      forms: forms.map((f) => ({
        id: f.id,
        formId: f.formId,
        formName: f.formName,
        pageId: f.pageId,
        pageName: f.pageName,
        status: f.status,
        leadsCount: f.leadsCount,
        isActive: f.isActive,
        customQuestions: f.customQuestions ? JSON.parse(f.customQuestions) : [],
        fieldMapping: f.fieldMapping ? JSON.parse(f.fieldMapping) : {},
        targetStage: f.targetStage,
        targetAssigneeId: f.targetAssigneeId,
      })),
      syncLogs: syncLogs.map((l) => ({
        id: l.id,
        metaLeadId: l.metaLeadId,
        pageId: l.pageId,
        formId: l.formId,
        campaignName: l.campaignName,
        leadId: l.leadId,
        status: l.status,
        errorMessage: l.errorMessage,
        createdAt: l.createdAt,
      })),
      teamMembers: teamMembers.map((m) => ({
        id: m.userId,
        name: m.user.name || m.user.email?.split('@')[0] || 'Team Member',
        role: m.role,
      })),
      stats: {
        totalLeadsCaptured,
        qualifiedLeads,
        followUpsDue,
        dealsWon: dealsWonCount,
        verifiedRevenue,
        qualificationRate: totalLeadsCaptured > 0 ? Math.round((qualifiedLeads / totalLeadsCaptured) * 100) : 0,
        winRate: totalLeadsCaptured > 0 ? Math.round((dealsWonCount / totalLeadsCaptured) * 100) : 0,
      },
      campaignAttribution,
    });
  } catch (error: any) {
    console.error('[MetaStatus] Error retrieving integration status:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch status' }, { status: 500 });
  }
}
