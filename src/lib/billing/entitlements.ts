import { db } from '@/lib/db';
import {
  DEFAULT_SUBSCRIPTION_PLANS,
  PlanCode,
  PlanEntitlementConfig,
  ensureCommercialCatalogInitialized,
  normalizePlanCode,
} from './catalog';

export type MeteredResource = 'LEADS' | 'TEAM_SEATS' | 'AI_REQUESTS' | 'AI_QUALIFICATIONS' | 'FOLLOW_UPS' | 'CHANNELS' | 'CAMPAIGNS';

export interface WorkspaceUsageAndEntitlements {
  planCode: PlanCode;
  planName: string;
  status: string;
  isOperational: boolean;
  periodKey: string;
  entitlements: PlanEntitlementConfig;
  credits: {
    aiOps: number;
    followUps: number;
    leads: number;
    recoveryMessages: number;
  };
  usage: {
    activeLeads: number;
    teamMembers: number;
    aiRequests: number;
    aiQualifications: number;
    automatedFollowUps: number;
    connectedChannels: number;
    campaigns: number;
    storageMb: number;
    estimatedProviderCostUsd: number;
  };
  upgradeRecommendation: {
    needed: boolean;
    reason?: string;
    recommendedPlanCode?: PlanCode;
    recommendedPlanName?: string;
  };
}

export function getCurrentPeriodKey(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export async function getWorkspaceEntitlementsAndUsage(
  organizationId: string,
  preloadedSub?: {
    plan?: string | null;
    status?: string | null;
    trialEndsAt?: Date | null;
    paidThroughDate?: Date | null;
    gracePeriodEndsAt?: Date | null;
    maxInternalSeats?: number | null;
    customEntitlements?: unknown;
  } | null
): Promise<WorkspaceUsageAndEntitlements> {
  await ensureCommercialCatalogInitialized();
  const periodKey = getCurrentPeriodKey();

  const sub =
    preloadedSub !== undefined
      ? preloadedSub
      : await db.workspaceSubscription.findUnique({
          where: { organizationId },
        });

  const planCode = normalizePlanCode(sub?.plan);
  const dbPlan = await db.subscriptionPlan.findUnique({
    where: { code: planCode },
    include: { entitlements: true },
  });

  const fallbackDef = DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.code === planCode) || DEFAULT_SUBSCRIPTION_PLANS[0];
  const baseEntitlements: PlanEntitlementConfig = dbPlan?.entitlements
    ? {
        maxWorkspaces: dbPlan.entitlements.maxWorkspaces,
        maxActiveLeads: dbPlan.entitlements.maxActiveLeads,
        maxTeamMembers: dbPlan.entitlements.maxTeamMembers,
        maxAiRequestsPerMonth: dbPlan.entitlements.maxAiRequestsPerMonth,
        maxAiQualificationsPerMonth: dbPlan.entitlements.maxAiQualificationsPerMonth,
        maxAutomatedFollowUpsPerMonth: dbPlan.entitlements.maxAutomatedFollowUpsPerMonth,
        maxConnectedChannels: dbPlan.entitlements.maxConnectedChannels,
        maxCampaigns: dbPlan.entitlements.maxCampaigns,
        maxStorageMb: dbPlan.entitlements.maxStorageMb,
        featureFlags: {
          ...fallbackDef.entitlements.featureFlags,
          ...((dbPlan.entitlements.featureFlags as any) || {}),
        },
      }
    : fallbackDef.entitlements;

  // Apply Enterprise or Superadmin custom entitlements safely
  const custom = (sub?.customEntitlements as any) || {};
  const entitlements: PlanEntitlementConfig = {
    maxWorkspaces: Number(custom.maxWorkspaces ?? baseEntitlements.maxWorkspaces),
    maxActiveLeads: Number(custom.maxActiveLeads ?? baseEntitlements.maxActiveLeads),
    maxTeamMembers: Number(custom.maxTeamMembers ?? (sub?.maxInternalSeats ? Math.max(baseEntitlements.maxTeamMembers, sub.maxInternalSeats) : baseEntitlements.maxTeamMembers)),
    maxAiRequestsPerMonth: Number(custom.maxAiRequestsPerMonth ?? baseEntitlements.maxAiRequestsPerMonth),
    maxAiQualificationsPerMonth: Number(custom.maxAiQualificationsPerMonth ?? baseEntitlements.maxAiQualificationsPerMonth),
    maxAutomatedFollowUpsPerMonth: Number(custom.maxAutomatedFollowUpsPerMonth ?? baseEntitlements.maxAutomatedFollowUpsPerMonth),
    maxConnectedChannels: Number(custom.maxConnectedChannels ?? baseEntitlements.maxConnectedChannels),
    maxCampaigns: Number(custom.maxCampaigns ?? baseEntitlements.maxCampaigns),
    maxStorageMb: Number(custom.maxStorageMb ?? baseEntitlements.maxStorageMb),
    featureFlags: {
      ...baseEntitlements.featureFlags,
      ...(custom.featureFlags || {}),
    },
  };

  // Query real DB usage & active prepaid credits
  const [
    activeLeads,
    teamMembers,
    usageRecord,
    creditRows,
    metaPagesCount,
    orgInfo,
    campaignsCount,
  ] = await Promise.all([
    db.lead.count({
      where: {
        organizationId,
        status: { notIn: ['WON', 'LOST', 'DISQUALIFIED'] },
      },
    }),
    db.organizationMember.count({
      where: {
        organizationId,
        role: { not: 'EXTERNAL_PROFESSIONAL' },
      },
    }),
    db.usageRecord.findUnique({
      where: { organizationId_periodKey: { organizationId, periodKey } },
    }),
    db.usageCredit.findMany({
      where: {
        organizationId,
        remainingUnits: { gt: 0 },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    }),
    db.metaConnectedPage.count({
      where: { organizationId, isActive: true },
    }),
    db.organization.findUnique({
      where: { id: organizationId },
      select: { whatsappPhoneNumberId: true },
    }),
    db.reactivationCampaign.count({
      where: { organizationId },
    }),
  ]);

  const credits = {
    aiOps: creditRows.filter((c) => c.creditType === 'AI_OPS').reduce((s, c) => s + c.remainingUnits, 0),
    followUps: creditRows.filter((c) => c.creditType === 'FOLLOW_UPS').reduce((s, c) => s + c.remainingUnits, 0),
    leads: creditRows.filter((c) => c.creditType === 'LEADS').reduce((s, c) => s + c.remainingUnits, 0),
    recoveryMessages: creditRows.filter((c) => c.creditType === 'RECOVERY_MESSAGES').reduce((s, c) => s + c.remainingUnits, 0),
  };

  const connectedChannels = metaPagesCount + (orgInfo?.whatsappPhoneNumberId ? 1 : 0);
  const aiRequests = usageRecord?.aiRequestsUsed ?? 0;
  const aiQualifications = usageRecord?.aiQualificationsUsed ?? 0;
  const automatedFollowUps = usageRecord?.automatedFollowUpsUsed ?? 0;
  const storageMb = usageRecord?.storageMbUsed ?? 0;
  const estimatedProviderCostUsd = usageRecord?.estimatedProviderCostUsd ?? 0;

  // Determine upgrade recommendation if >85% on core meters
  let needed = false;
  let reason: string | undefined;
  let recommendedPlanCode: PlanCode | undefined;

  if (planCode === 'STARTER') {
    if (activeLeads >= entitlements.maxActiveLeads * 0.85) {
      needed = true;
      reason = `You are using ${activeLeads} of ${entitlements.maxActiveLeads} active leads on Starter.`;
      recommendedPlanCode = 'GROWTH';
    } else if (teamMembers >= entitlements.maxTeamMembers) {
      needed = true;
      reason = `All ${entitlements.maxTeamMembers} team seats on Starter are filled.`;
      recommendedPlanCode = 'GROWTH';
    } else if (aiQualifications >= entitlements.maxAiQualificationsPerMonth * 0.85) {
      needed = true;
      reason = `You have used ${aiQualifications} of ${entitlements.maxAiQualificationsPerMonth} monthly AI operations.`;
      recommendedPlanCode = 'GROWTH';
    }
  } else if (planCode === 'GROWTH') {
    if (activeLeads >= entitlements.maxActiveLeads * 0.85 || teamMembers >= entitlements.maxTeamMembers) {
      needed = true;
      reason = `Your team is approaching Growth capacity limits (${activeLeads}/${entitlements.maxActiveLeads} leads, ${teamMembers}/${entitlements.maxTeamMembers} seats).`;
      recommendedPlanCode = 'SCALE';
    }
  }

  const now = new Date();
  const status = sub?.status || 'TRIALING';
  const isOperational =
    status === 'PILOT_INCLUDED' ||
    (status === 'TRIALING' && (!sub?.trialEndsAt || sub.trialEndsAt > now)) ||
    (status === 'ACTIVE' && (!sub?.paidThroughDate || sub.paidThroughDate > now)) ||
    (status === 'GRACE_PERIOD' && (!sub?.gracePeriodEndsAt || sub.gracePeriodEndsAt > now)) ||
    (status === 'GRACE' && (!sub?.gracePeriodEndsAt || sub.gracePeriodEndsAt > now));

  return {
    planCode,
    planName: dbPlan?.name || fallbackDef.name,
    status,
    isOperational,
    periodKey,
    entitlements,
    credits,
    usage: {
      activeLeads,
      teamMembers,
      aiRequests,
      aiQualifications,
      automatedFollowUps,
      connectedChannels,
      campaigns: campaignsCount,
      storageMb,
      estimatedProviderCostUsd,
    },
    upgradeRecommendation: {
      needed,
      reason,
      recommendedPlanCode,
      recommendedPlanName: recommendedPlanCode
        ? DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.code === recommendedPlanCode)?.name
        : undefined,
    },
  };
}

export class EntitlementLimitError extends Error {
  public readonly code = 'ENTITLEMENT_LIMIT_REACHED';
  public readonly resource: MeteredResource;
  public readonly used: number;
  public readonly limit: number;
  public readonly recommendedPlan: PlanCode;

  constructor(params: {
    message: string;
    resource: MeteredResource;
    used: number;
    limit: number;
    recommendedPlan: PlanCode;
  }) {
    super(params.message);
    this.resource = params.resource;
    this.used = params.used;
    this.limit = params.limit;
    this.recommendedPlan = params.recommendedPlan;
  }
}

export async function assertEntitlementLimit(organizationId: string, resource: MeteredResource): Promise<WorkspaceUsageAndEntitlements> {
  const info = await getWorkspaceEntitlementsAndUsage(organizationId);
  if (!info.isOperational) {
    throw new Error('Your workspace subscription or 7-day free trial is not active. Please choose a plan in Billing to continue creating new operations.');
  }

  const nextPlan: PlanCode =
    info.planCode === 'STARTER' ? 'GROWTH' : info.planCode === 'GROWTH' ? 'SCALE' : 'ENTERPRISE';

  switch (resource) {
    case 'LEADS': {
      const cap = info.entitlements.maxActiveLeads + info.credits.leads;
      if (info.usage.activeLeads >= cap) {
        throw new EntitlementLimitError({
          message: `Active lead limit reached (${info.usage.activeLeads} / ${cap}). Existing leads remain accessible; upgrade to ${nextPlan} or add a lead credit pack to add new leads.`,
          resource,
          used: info.usage.activeLeads,
          limit: cap,
          recommendedPlan: nextPlan,
        });
      }
      break;
    }
    case 'TEAM_SEATS': {
      if (info.usage.teamMembers >= info.entitlements.maxTeamMembers) {
        throw new EntitlementLimitError({
          message: `Team seat limit reached (${info.usage.teamMembers} / ${info.entitlements.maxTeamMembers}). Upgrade to ${nextPlan} to invite additional team members.`,
          resource,
          used: info.usage.teamMembers,
          limit: info.entitlements.maxTeamMembers,
          recommendedPlan: nextPlan,
        });
      }
      break;
    }
    case 'AI_REQUESTS':
    case 'AI_QUALIFICATIONS': {
      const cap = info.entitlements.maxAiQualificationsPerMonth + info.credits.aiOps;
      if (info.usage.aiQualifications >= cap) {
        throw new EntitlementLimitError({
          message: `Monthly AI allowance exhausted (${info.usage.aiQualifications} / ${cap}). Upgrade to ${nextPlan} or purchase a prepaid AI credit pack to continue automated AI qualification.`,
          resource,
          used: info.usage.aiQualifications,
          limit: cap,
          recommendedPlan: nextPlan,
        });
      }
      break;
    }
    case 'FOLLOW_UPS': {
      const cap = info.entitlements.maxAutomatedFollowUpsPerMonth + info.credits.followUps;
      if (info.usage.automatedFollowUps >= cap) {
        throw new EntitlementLimitError({
          message: `Monthly automated follow-up allowance reached (${info.usage.automatedFollowUps} / ${cap}). Upgrade to ${nextPlan} or purchase follow-up credits.`,
          resource,
          used: info.usage.automatedFollowUps,
          limit: cap,
          recommendedPlan: nextPlan,
        });
      }
      break;
    }
    case 'CAMPAIGNS': {
      if (info.usage.campaigns >= info.entitlements.maxCampaigns) {
        throw new EntitlementLimitError({
          message: `Campaign allowance reached (${info.usage.campaigns} / ${info.entitlements.maxCampaigns}). Upgrade to ${nextPlan} for higher campaign capacity.`,
          resource,
          used: info.usage.campaigns,
          limit: info.entitlements.maxCampaigns,
          recommendedPlan: nextPlan,
        });
      }
      break;
    }
  }

  return info;
}

/**
 * Meters AI, follow-up, and campaign operations per billing period.
 * Deducts from prepaid UsageCredit ONLY when plan allowance is exhausted.
 * Never incurs unapproved automatic overage charges.
 */
export async function recordMeteredUsage(params: {
  organizationId: string;
  type: 'AI_QUALIFICATION' | 'AI_REQUEST' | 'FOLLOW_UP' | 'CAMPAIGN';
  units?: number;
  estimatedProviderCostUsd?: number;
}) {
  const units = Math.max(1, params.units || 1);
  const periodKey = getCurrentPeriodKey();
  const cost = Math.max(0, params.estimatedProviderCostUsd || 0);

  const info = await getWorkspaceEntitlementsAndUsage(params.organizationId).catch(() => null);

  await db.usageRecord.upsert({
    where: {
      organizationId_periodKey: {
        organizationId: params.organizationId,
        periodKey,
      },
    },
    update: {
      ...(params.type === 'AI_QUALIFICATION' ? { aiQualificationsUsed: { increment: units }, aiRequestsUsed: { increment: units } } : {}),
      ...(params.type === 'AI_REQUEST' ? { aiRequestsUsed: { increment: units } } : {}),
      ...(params.type === 'FOLLOW_UP' ? { automatedFollowUpsUsed: { increment: units } } : {}),
      ...(params.type === 'CAMPAIGN' ? { campaignsCreated: { increment: units } } : {}),
      ...(cost > 0 ? { estimatedProviderCostUsd: { increment: cost } } : {}),
    },
    create: {
      organizationId: params.organizationId,
      periodKey,
      aiRequestsUsed: params.type === 'AI_REQUEST' || params.type === 'AI_QUALIFICATION' ? units : 0,
      aiQualificationsUsed: params.type === 'AI_QUALIFICATION' ? units : 0,
      automatedFollowUpsUsed: params.type === 'FOLLOW_UP' ? units : 0,
      campaignsCreated: params.type === 'CAMPAIGN' ? units : 0,
      estimatedProviderCostUsd: cost,
    },
  });

  // Consume prepaid credits if base plan allowance was already exceeded
  if (info) {
    const creditType =
      params.type === 'AI_QUALIFICATION' || params.type === 'AI_REQUEST'
        ? info.usage.aiQualifications >= info.entitlements.maxAiQualificationsPerMonth
          ? 'AI_OPS'
          : null
        : params.type === 'FOLLOW_UP' && info.usage.automatedFollowUps >= info.entitlements.maxAutomatedFollowUpsPerMonth
        ? 'FOLLOW_UPS'
        : null;

    if (creditType) {
      const credit = await db.usageCredit.findFirst({
        where: {
          organizationId: params.organizationId,
          creditType,
          remainingUnits: { gt: 0 },
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: 'asc' },
      });

      if (credit) {
        const deduct = Math.min(credit.remainingUnits, units);
        await db.usageCredit.update({
          where: { id: credit.id },
          data: { remainingUnits: { decrement: deduct } },
        });
      }
    }
  }
}
