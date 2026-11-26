import { db } from '@/lib/db';

export type PlanCode = 'STARTER' | 'GROWTH' | 'SCALE' | 'ENTERPRISE';
export type MarketRegion = 'NG' | 'US' | 'GB' | 'CA' | 'GLOBAL';
export type BillingInterval = 'MONTHLY' | 'ANNUAL';
export type SupportedCurrency = 'NGN' | 'USD' | 'GBP' | 'CAD';

export interface RegionalPriceConfig {
  marketRegion: MarketRegion;
  currency: SupportedCurrency;
  monthlyPrice: number;
  annualPrice: number; // ~2 months free (10x monthly)
  annualSavingsLabel: string;
}

export interface PlanEntitlementConfig {
  maxWorkspaces: number;
  maxActiveLeads: number;
  maxTeamMembers: number;
  maxAiRequestsPerMonth: number;
  maxAiQualificationsPerMonth: number;
  maxAutomatedFollowUpsPerMonth: number;
  maxConnectedChannels: number;
  maxCampaigns: number;
  maxStorageMb: number;
  featureFlags: {
    leadCapture: boolean;
    basicPipeline: boolean;
    multiChannelInbox: boolean;
    aiQualification: boolean;
    advancedAiQualification: boolean;
    followUpAutomation: boolean;
    advancedFollowUpAutomation: boolean;
    leadSegmentation: boolean;
    leadReactivation: boolean;
    multiplePipelines: boolean;
    salesPerformanceReporting: boolean;
    advancedAnalytics: boolean;
    teamActivityTracking: boolean;
    teamPerformanceIntelligence: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
    dedicatedOnboarding: boolean;
  };
}

export interface DefaultPlanDefinition {
  code: PlanCode;
  name: string;
  tagline: string;
  description: string;
  isRecommended: boolean;
  isCustomQuote: boolean;
  sortOrder: number;
  featuresList: string[];
  regionalPrices: RegionalPriceConfig[];
  entitlements: PlanEntitlementConfig;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  CAD: 'CA$',
};

export function formatMoneyDisplay(amount: number, currency: string = 'NGN'): string {
  const code = currency.toUpperCase();
  const sym = CURRENCY_SYMBOLS[code] || `${code} `;
  return `${sym}${Number(amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export const DEFAULT_SUBSCRIPTION_PLANS: DefaultPlanDefinition[] = [
  {
    code: 'STARTER',
    name: 'Starter',
    tagline: 'Small businesses, solo operators & early-stage teams',
    description: 'Essential enquiry capture, basic pipeline tracking, follow-up reminders, and limited AI assistance for lean businesses.',
    isRecommended: false,
    isCustomQuote: false,
    sortOrder: 1,
    featuresList: [
      '1 business workspace',
      'Up to 500 active leads',
      '2 team members',
      'Lead capture and management',
      'Basic sales pipeline',
      'Contact and prospect records',
      'Follow-up reminders',
      'Basic reporting',
      'Limited AI assistance (200 ops/mo)',
      'Basic customer enquiry management',
    ],
    regionalPrices: [
      { marketRegion: 'NG', currency: 'NGN', monthlyPrice: 15000, annualPrice: 150000, annualSavingsLabel: 'Save ₦30,000 (2 months free)' },
      { marketRegion: 'US', currency: 'USD', monthlyPrice: 19, annualPrice: 190, annualSavingsLabel: 'Save $38 (2 months free)' },
      { marketRegion: 'GB', currency: 'GBP', monthlyPrice: 15, annualPrice: 150, annualSavingsLabel: 'Save £30 (2 months free)' },
      { marketRegion: 'CA', currency: 'CAD', monthlyPrice: 25, annualPrice: 250, annualSavingsLabel: 'Save CA$50 (2 months free)' },
      { marketRegion: 'GLOBAL', currency: 'USD', monthlyPrice: 19, annualPrice: 190, annualSavingsLabel: 'Save $38 (2 months free)' },
    ],
    entitlements: {
      maxWorkspaces: 1,
      maxActiveLeads: 500,
      maxTeamMembers: 2,
      maxAiRequestsPerMonth: 200,
      maxAiQualificationsPerMonth: 200,
      maxAutomatedFollowUpsPerMonth: 500,
      maxConnectedChannels: 1,
      maxCampaigns: 2,
      maxStorageMb: 500,
      featureFlags: {
        leadCapture: true,
        basicPipeline: true,
        multiChannelInbox: false,
        aiQualification: true,
        advancedAiQualification: false,
        followUpAutomation: false,
        advancedFollowUpAutomation: false,
        leadSegmentation: false,
        leadReactivation: false,
        multiplePipelines: false,
        salesPerformanceReporting: false,
        advancedAnalytics: false,
        teamActivityTracking: false,
        teamPerformanceIntelligence: false,
        prioritySupport: false,
        customIntegrations: false,
        dedicatedOnboarding: false,
      },
    },
  },
  {
    code: 'GROWTH',
    name: 'Growth',
    tagline: 'Growing businesses with active enquiries & sales teams',
    description: 'AI-powered qualification, automated follow-up workflows, lead segmentation, reactivation tools, and team tracking.',
    isRecommended: true,
    isCustomQuote: false,
    sortOrder: 2,
    featuresList: [
      '1 business workspace',
      'Up to 2,000 active leads',
      '5 team members',
      'Multi-channel lead management',
      'AI-powered lead qualification (1,000 ops/mo)',
      'Follow-up workflow automation',
      'Lead segmentation & reactivation tools',
      'Multiple pipeline stages',
      'Sales performance reporting',
      'Team activity tracking',
      'Enhanced AI assistance',
    ],
    regionalPrices: [
      { marketRegion: 'NG', currency: 'NGN', monthlyPrice: 35000, annualPrice: 350000, annualSavingsLabel: 'Save ₦70,000 (2 months free)' },
      { marketRegion: 'US', currency: 'USD', monthlyPrice: 49, annualPrice: 490, annualSavingsLabel: 'Save $98 (2 months free)' },
      { marketRegion: 'GB', currency: 'GBP', monthlyPrice: 39, annualPrice: 390, annualSavingsLabel: 'Save £78 (2 months free)' },
      { marketRegion: 'CA', currency: 'CAD', monthlyPrice: 65, annualPrice: 650, annualSavingsLabel: 'Save CA$130 (2 months free)' },
      { marketRegion: 'GLOBAL', currency: 'USD', monthlyPrice: 49, annualPrice: 490, annualSavingsLabel: 'Save $98 (2 months free)' },
    ],
    entitlements: {
      maxWorkspaces: 1,
      maxActiveLeads: 2000,
      maxTeamMembers: 5,
      maxAiRequestsPerMonth: 1000,
      maxAiQualificationsPerMonth: 1000,
      maxAutomatedFollowUpsPerMonth: 2500,
      maxConnectedChannels: 3,
      maxCampaigns: 10,
      maxStorageMb: 2500,
      featureFlags: {
        leadCapture: true,
        basicPipeline: true,
        multiChannelInbox: true,
        aiQualification: true,
        advancedAiQualification: false,
        followUpAutomation: true,
        advancedFollowUpAutomation: false,
        leadSegmentation: true,
        leadReactivation: true,
        multiplePipelines: true,
        salesPerformanceReporting: true,
        advancedAnalytics: false,
        teamActivityTracking: true,
        teamPerformanceIntelligence: false,
        prioritySupport: false,
        customIntegrations: false,
        dedicatedOnboarding: false,
      },
    },
  },
  {
    code: 'SCALE',
    name: 'Scale',
    tagline: 'Established sales teams managing higher enquiry volumes',
    description: 'High-volume operational infrastructure with advanced AI qualification, multiple pipelines, team intelligence, and priority support.',
    isRecommended: false,
    isCustomQuote: false,
    sortOrder: 3,
    featuresList: [
      '1 business workspace',
      'Up to 10,000 active leads',
      '15 team members',
      'Advanced AI qualification (5,000 ops/mo)',
      'Advanced follow-up automation',
      'Multiple sales pipelines',
      'Advanced analytics',
      'Team performance intelligence',
      'Advanced lead segmentation',
      'Priority support',
      'Higher AI usage allowance',
    ],
    regionalPrices: [
      { marketRegion: 'NG', currency: 'NGN', monthlyPrice: 75000, annualPrice: 750000, annualSavingsLabel: 'Save ₦150,000 (2 months free)' },
      { marketRegion: 'US', currency: 'USD', monthlyPrice: 99, annualPrice: 990, annualSavingsLabel: 'Save $198 (2 months free)' },
      { marketRegion: 'GB', currency: 'GBP', monthlyPrice: 79, annualPrice: 790, annualSavingsLabel: 'Save £158 (2 months free)' },
      { marketRegion: 'CA', currency: 'CAD', monthlyPrice: 129, annualPrice: 1290, annualSavingsLabel: 'Save CA$258 (2 months free)' },
      { marketRegion: 'GLOBAL', currency: 'USD', monthlyPrice: 99, annualPrice: 990, annualSavingsLabel: 'Save $198 (2 months free)' },
    ],
    entitlements: {
      maxWorkspaces: 1,
      maxActiveLeads: 10000,
      maxTeamMembers: 15,
      maxAiRequestsPerMonth: 5000,
      maxAiQualificationsPerMonth: 5000,
      maxAutomatedFollowUpsPerMonth: 15000,
      maxConnectedChannels: 10,
      maxCampaigns: 50,
      maxStorageMb: 10000,
      featureFlags: {
        leadCapture: true,
        basicPipeline: true,
        multiChannelInbox: true,
        aiQualification: true,
        advancedAiQualification: true,
        followUpAutomation: true,
        advancedFollowUpAutomation: true,
        leadSegmentation: true,
        leadReactivation: true,
        multiplePipelines: true,
        salesPerformanceReporting: true,
        advancedAnalytics: true,
        teamActivityTracking: true,
        teamPerformanceIntelligence: true,
        prioritySupport: true,
        customIntegrations: false,
        dedicatedOnboarding: false,
      },
    },
  },
  {
    code: 'ENTERPRISE',
    name: 'Enterprise',
    tagline: 'Multi-location organisations & custom integrations',
    description: 'Tailored lead capacity, multi-branch workspaces, custom AI workflows, advanced RBAC, and agreed SLAs.',
    isRecommended: false,
    isCustomQuote: true,
    sortOrder: 4,
    featuresList: [
      'Custom lead capacity',
      'Custom team capacity',
      'Multiple workspaces or branches',
      'Advanced roles and permissions',
      'Custom integrations',
      'Dedicated onboarding',
      'Advanced automation & custom AI workflows',
      'Priority support & agreed SLAs',
    ],
    regionalPrices: [
      { marketRegion: 'NG', currency: 'NGN', monthlyPrice: 0, annualPrice: 0, annualSavingsLabel: 'Custom quotation' },
      { marketRegion: 'US', currency: 'USD', monthlyPrice: 0, annualPrice: 0, annualSavingsLabel: 'Custom quotation' },
      { marketRegion: 'GB', currency: 'GBP', monthlyPrice: 0, annualPrice: 0, annualSavingsLabel: 'Custom quotation' },
      { marketRegion: 'CA', currency: 'CAD', monthlyPrice: 0, annualPrice: 0, annualSavingsLabel: 'Custom quotation' },
      { marketRegion: 'GLOBAL', currency: 'USD', monthlyPrice: 0, annualPrice: 0, annualSavingsLabel: 'Custom quotation' },
    ],
    entitlements: {
      maxWorkspaces: 10,
      maxActiveLeads: 50000,
      maxTeamMembers: 50,
      maxAiRequestsPerMonth: 25000,
      maxAiQualificationsPerMonth: 25000,
      maxAutomatedFollowUpsPerMonth: 50000,
      maxConnectedChannels: 25,
      maxCampaigns: 200,
      maxStorageMb: 50000,
      featureFlags: {
        leadCapture: true,
        basicPipeline: true,
        multiChannelInbox: true,
        aiQualification: true,
        advancedAiQualification: true,
        followUpAutomation: true,
        advancedFollowUpAutomation: true,
        leadSegmentation: true,
        leadReactivation: true,
        multiplePipelines: true,
        salesPerformanceReporting: true,
        advancedAnalytics: true,
        teamActivityTracking: true,
        teamPerformanceIntelligence: true,
        prioritySupport: true,
        customIntegrations: true,
        dedicatedOnboarding: true,
      },
    },
  },
];

export const DEFAULT_RECOVERY_TIERS = [
  {
    code: 'TIER_500',
    name: 'Up to 500 leads',
    minLeads: 1,
    maxLeads: 500,
    serviceFeeNgn: 25000,
    serviceFeeUsd: 29,
    isCustomQuote: false,
    sortOrder: 1,
  },
  {
    code: 'TIER_2000',
    name: '501–2,000 leads',
    minLeads: 501,
    maxLeads: 2000,
    serviceFeeNgn: 50000,
    serviceFeeUsd: 59,
    isCustomQuote: false,
    sortOrder: 2,
  },
  {
    code: 'TIER_5000',
    name: '2,001–5,000 leads',
    minLeads: 2001,
    maxLeads: 5000,
    serviceFeeNgn: 100000,
    serviceFeeUsd: 119,
    isCustomQuote: false,
    sortOrder: 3,
  },
  {
    code: 'CUSTOM',
    name: 'Above 5,000 leads',
    minLeads: 5001,
    maxLeads: null,
    serviceFeeNgn: 0,
    serviceFeeUsd: 0,
    isCustomQuote: true,
    sortOrder: 4,
  },
];

export const DEFAULT_COMMISSION_TIERS = [
  {
    serviceType: 'APPOINTMENT_SETTING',
    displayName: 'Appointment Setting',
    minCommissionPercent: 2.0,
    maxCommissionPercent: 5.0,
    defaultRetainerNgn: null,
    notes: 'Starting range for qualified booked appointments based on verified deal value and margin.',
  },
  {
    serviceType: 'SALES_CLOSING',
    displayName: 'Sales Closing',
    minCommissionPercent: 5.0,
    maxCommissionPercent: 10.0,
    defaultRetainerNgn: null,
    notes: 'Starting range calculated strictly on verified customer payments actually received.',
  },
  {
    serviceType: 'COMBINED',
    displayName: 'Appointment Setting + Closing',
    minCommissionPercent: 8.0,
    maxCommissionPercent: 15.0,
    defaultRetainerNgn: null,
    notes: 'End-to-end human appointment setting and closing support.',
  },
  {
    serviceType: 'DEDICATED_TEAM',
    displayName: 'Dedicated Sales Team',
    minCommissionPercent: 5.0,
    maxCommissionPercent: 12.0,
    defaultRetainerNgn: 150000,
    notes: 'Custom monthly retainer + verified performance commission.',
  },
];

export const USAGE_CREDIT_PACKS = [
  {
    id: 'PACK_AI_500',
    creditType: 'AI_OPS' as const,
    name: '+500 AI Qualification Operations',
    units: 500,
    priceNgn: 5000,
    priceUsd: 7,
  },
  {
    id: 'PACK_AI_2000',
    creditType: 'AI_OPS' as const,
    name: '+2,000 AI Qualification Operations',
    units: 2000,
    priceNgn: 15000,
    priceUsd: 19,
  },
  {
    id: 'PACK_FOLLOWUP_1000',
    creditType: 'FOLLOW_UPS' as const,
    name: '+1,000 Automated Follow-Up Credits',
    units: 1000,
    priceNgn: 6000,
    priceUsd: 8,
  },
  {
    id: 'PACK_LEADS_1000',
    creditType: 'LEADS' as const,
    name: '+1,000 Active Lead Capacity Add-On',
    units: 1000,
    priceNgn: 8000,
    priceUsd: 10,
  },
];

export function normalizePlanCode(rawPlan?: string | null): PlanCode {
  const upper = (rawPlan || 'STARTER').toUpperCase();
  if (upper === 'PRO') return 'GROWTH';
  if (upper === 'STARTER' || upper === 'GROWTH' || upper === 'SCALE' || upper === 'ENTERPRISE') {
    return upper;
  }
  return 'STARTER';
}

let commercialCatalogCacheExpiresAt = 0;

/**
 * Idempotently ensures the commercial catalog tables have baseline configurations.
 * Uses a warm in-memory TTL cache to avoid repeated count round-trips on serverless renders.
 */
export async function ensureCommercialCatalogInitialized(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && commercialCatalogCacheExpiresAt > now) {
    return;
  }

  const [existingPlansCount, recoveryTiersCount, commissionTiersCount] = await Promise.all([
    db.subscriptionPlan.count(),
    db.leadRecoveryTier.count(),
    db.salesCommissionTierConfig.count(),
  ]);

  if (existingPlansCount === 0) {
    for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
      const createdPlan = await db.subscriptionPlan.upsert({
        where: { code: plan.code },
        update: {},
        create: {
          code: plan.code,
          name: plan.name,
          tagline: plan.tagline,
          description: plan.description,
          isRecommended: plan.isRecommended,
          isCustomQuote: plan.isCustomQuote,
          sortOrder: plan.sortOrder,
          isActive: true,
        },
      });

      await db.planEntitlement.upsert({
        where: { planId: createdPlan.id },
        update: {},
        create: {
          planId: createdPlan.id,
          maxWorkspaces: plan.entitlements.maxWorkspaces,
          maxActiveLeads: plan.entitlements.maxActiveLeads,
          maxTeamMembers: plan.entitlements.maxTeamMembers,
          maxAiRequestsPerMonth: plan.entitlements.maxAiRequestsPerMonth,
          maxAiQualificationsPerMonth: plan.entitlements.maxAiQualificationsPerMonth,
          maxAutomatedFollowUpsPerMonth: plan.entitlements.maxAutomatedFollowUpsPerMonth,
          maxConnectedChannels: plan.entitlements.maxConnectedChannels,
          maxCampaigns: plan.entitlements.maxCampaigns,
          maxStorageMb: plan.entitlements.maxStorageMb,
          featureFlags: plan.entitlements.featureFlags,
        },
      });

      for (const rp of plan.regionalPrices) {
        await db.planRegionalPrice.upsert({
          where: {
            planId_marketRegion_currency: {
              planId: createdPlan.id,
              marketRegion: rp.marketRegion,
              currency: rp.currency,
            },
          },
          update: {},
          create: {
            planId: createdPlan.id,
            marketRegion: rp.marketRegion,
            currency: rp.currency,
            monthlyPrice: rp.monthlyPrice,
            annualPrice: rp.annualPrice,
            annualSavingsLabel: rp.annualSavingsLabel,
            isActive: true,
          },
        });
      }
    }
  }

  if (recoveryTiersCount === 0) {
    for (const tier of DEFAULT_RECOVERY_TIERS) {
      await db.leadRecoveryTier.upsert({
        where: { code: tier.code },
        update: {},
        create: tier,
      });
    }
  }

  if (commissionTiersCount === 0) {
    for (const ct of DEFAULT_COMMISSION_TIERS) {
      await db.salesCommissionTierConfig.upsert({
        where: { serviceType: ct.serviceType },
        update: {},
        create: ct,
      });
    }
  }

  commercialCatalogCacheExpiresAt = Date.now() + 10 * 60 * 1000;
}

export async function getActivePlansWithPricing(marketRegion?: string, currency?: string) {
  await ensureCommercialCatalogInitialized();
  const plans = await db.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      regionalPrices: { where: { isActive: true } },
      entitlements: true,
    },
  });

  return plans.map((plan) => {
    const def = DEFAULT_SUBSCRIPTION_PLANS.find((d) => d.code === plan.code);
    const matchingPrice =
      plan.regionalPrices.find(
        (p) =>
          (!marketRegion || p.marketRegion === marketRegion) &&
          (!currency || p.currency === currency)
      ) ||
      plan.regionalPrices.find((p) => (currency ? p.currency === currency : p.marketRegion === 'NG')) ||
      plan.regionalPrices[0];

    return {
      ...plan,
      featuresList: def?.featuresList || [],
      selectedPrice: matchingPrice || null,
    };
  });
}

export async function resolveServerPlanPrice(params: {
  planCode: string;
  marketRegion?: string;
  currency?: string;
  billingInterval?: string;
}) {
  await ensureCommercialCatalogInitialized();
  const code = normalizePlanCode(params.planCode);
  const region = (params.marketRegion || 'NG').toUpperCase();
  const curr = (params.currency || (region === 'NG' ? 'NGN' : 'USD')).toUpperCase();
  const interval = (params.billingInterval || 'MONTHLY').toUpperCase() === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';

  const plan = await db.subscriptionPlan.findUnique({
    where: { code },
    include: {
      regionalPrices: { where: { isActive: true } },
      entitlements: true,
    },
  });

  if (!plan || !plan.isActive) {
    throw new Error(`Subscription plan ${code} is not currently available.`);
  }
  if (plan.isCustomQuote) {
    throw new Error('Enterprise plans require a custom quotation configured by CloseCraft HQ.');
  }

  const priceRow =
    plan.regionalPrices.find((p) => p.marketRegion === region && p.currency === curr) ||
    plan.regionalPrices.find((p) => p.currency === curr) ||
    plan.regionalPrices.find((p) => p.marketRegion === 'GLOBAL') ||
    plan.regionalPrices[0];

  if (!priceRow) {
    throw new Error(`No pricing configured for ${code} in ${curr}/${region}.`);
  }

  const unitAmount = interval === 'ANNUAL' ? priceRow.annualPrice : priceRow.monthlyPrice;
  const durationMonths = interval === 'ANNUAL' ? 12 : 1;

  return {
    plan,
    priceRow,
    unitAmount,
    currency: priceRow.currency,
    marketRegion: priceRow.marketRegion,
    billingInterval: interval as BillingInterval,
    durationMonths,
    entitlements: plan.entitlements,
  };
}
