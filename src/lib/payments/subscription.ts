import { cache } from 'react';
import { db } from '@/lib/db';
import {
  DEFAULT_SUBSCRIPTION_PLANS,
  normalizePlanCode,
  PlanCode,
} from '@/lib/billing/catalog';
import {
  DEFAULT_GRACE_PERIOD_DAYS,
  DEFAULT_TRIAL_DAYS,
  getPlatformBillingPolicy,
  normalizeSubscriptionState,
  transitionSubscriptionState,
} from '@/lib/billing/stateMachine';
import {
  assertEntitlementLimit,
  getWorkspaceEntitlementsAndUsage,
} from '@/lib/billing/entitlements';

export const TRIAL_DURATION_HOURS = DEFAULT_TRIAL_DAYS * 24; // 7 days (168 hours)
export const TRIAL_DURATION_MS = TRIAL_DURATION_HOURS * 60 * 60 * 1000;
export const TRIAL_POLICY_VERSION = 'V3_7DAY_COMMERCIAL';

export interface WorkspacePlanConfig {
  id: 'STARTER' | 'GROWTH' | 'SCALE' | 'ENTERPRISE' | 'PRO' | 'MANAGED_SALES';
  name: string;
  pricePerMonth: number;
  usdPricePerMonth?: number;
  currency: string;
  maxInternalSeats: number;
  maxActiveLeads: number;
  headline: string;
  description: string;
  features: string[];
}

const starterDef = DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.code === 'STARTER')!;
const growthDef = DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.code === 'GROWTH')!;
const scaleDef = DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.code === 'SCALE')!;
const enterpriseDef = DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.code === 'ENTERPRISE')!;

export const WORKSPACE_PLANS: Record<string, WorkspacePlanConfig> = {
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    pricePerMonth: 15000.0,
    usdPricePerMonth: 19,
    currency: 'NGN',
    maxInternalSeats: starterDef.entitlements.maxTeamMembers,
    maxActiveLeads: starterDef.entitlements.maxActiveLeads,
    headline: '2 Team Members · Up to 500 Active Leads · 7-Day Free Trial',
    description: starterDef.description,
    features: starterDef.featuresList,
  },
  GROWTH: {
    id: 'GROWTH',
    name: 'Growth',
    pricePerMonth: 35000.0,
    usdPricePerMonth: 49,
    currency: 'NGN',
    maxInternalSeats: growthDef.entitlements.maxTeamMembers,
    maxActiveLeads: growthDef.entitlements.maxActiveLeads,
    headline: 'Recommended Plan · 5 Team Members · 2,000 Active Leads',
    description: growthDef.description,
    features: growthDef.featuresList,
  },
  // Legacy PRO alias mapped cleanly to GROWTH entitlements
  PRO: {
    id: 'GROWTH',
    name: 'Growth',
    pricePerMonth: 35000.0,
    usdPricePerMonth: 49,
    currency: 'NGN',
    maxInternalSeats: growthDef.entitlements.maxTeamMembers,
    maxActiveLeads: growthDef.entitlements.maxActiveLeads,
    headline: 'Recommended Plan · 5 Team Members · 2,000 Active Leads',
    description: growthDef.description,
    features: growthDef.featuresList,
  },
  SCALE: {
    id: 'SCALE',
    name: 'Scale',
    pricePerMonth: 75000.0,
    usdPricePerMonth: 99,
    currency: 'NGN',
    maxInternalSeats: scaleDef.entitlements.maxTeamMembers,
    maxActiveLeads: scaleDef.entitlements.maxActiveLeads,
    headline: '15 Team Members · 10,000 Active Leads · Advanced Analytics',
    description: scaleDef.description,
    features: scaleDef.featuresList,
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    pricePerMonth: 0,
    currency: 'NGN',
    maxInternalSeats: enterpriseDef.entitlements.maxTeamMembers,
    maxActiveLeads: enterpriseDef.entitlements.maxActiveLeads,
    headline: 'Custom Quotation · Multi-Workspace & Custom SLA',
    description: enterpriseDef.description,
    features: enterpriseDef.featuresList,
  },
  MANAGED_SALES: {
    id: 'MANAGED_SALES',
    name: 'Sales Enablement & Closing',
    pricePerMonth: 150000.0,
    currency: 'NGN',
    maxInternalSeats: 10,
    maxActiveLeads: 10000,
    headline: 'Performance Commission (2–15%) or Dedicated Sales Team',
    description: 'Dedicated appointment setters, closers, or managed sales execution with configurable commission terms.',
    features: [
      'Appointment setting (2–5% indicative)',
      'Sales closing (5–10% indicative)',
      'Setting + closing (8–15% indicative)',
      'Dedicated sales team (Custom retainer + commission)',
    ],
  },
};

export interface SubscriptionStatusInfo {
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'GRACE_PERIOD' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED' | 'PILOT_INCLUDED' | 'GRACE';
  isOperational: boolean;
  plan: PlanCode;
  planName: string;
  pricePerMonth: number;
  currency: string;
  billingMode: string;
  billingInterval: string;
  marketRegion: string;
  trialStartedAt: Date;
  trialEndsAt: Date;
  trialPolicyVersion: string;
  trialDaysLeft: number;
  trialHoursLeft: number;
  paidThroughDate: Date | null;
  gracePeriodEndsAt: Date | null;
  gracePeriodDays: number;
  cancelAtPeriodEnd: boolean;
  cancelledAt: Date | null;
  activePilotEngagementId: string | null;
  maxInternalSeats: number;
  internalSeatsUsed: number;
  maxActiveLeads: number;
  activeLeadsCount: number;
  usageSummary: Awaited<ReturnType<typeof getWorkspaceEntitlementsAndUsage>>;
}

/**
 * Gets or initializes the configurable 7-day Starter trial workspace subscription.
 * Idempotent: never resets trial dates or erases customer data on expiry.
 */
async function _getOrCreateWorkspaceSubscription(organizationId: string): Promise<SubscriptionStatusInfo> {
  const now = new Date();
  const [policy, activePilot, existingSub] = await Promise.all([
    getPlatformBillingPolicy(),
    db.pilotEngagement.findFirst({
      where: {
        organizationId,
        status: { in: ['ACTIVE', 'SCHEDULED'] },
      },
    }),
    db.workspaceSubscription.findUnique({
      where: { organizationId },
    }),
  ]);

  let sub = existingSub;

  if (!sub) {
    const trialMs = (policy.trialDays || DEFAULT_TRIAL_DAYS) * 24 * 60 * 60 * 1000;
    const trialEnd = new Date(now.getTime() + trialMs);

    sub = await db.workspaceSubscription.create({
      data: {
        organizationId,
        status: activePilot ? 'PILOT_INCLUDED' : 'TRIALING',
        trialStartedAt: now,
        trialEndsAt: trialEnd,
        plan: 'STARTER',
        pricePerMonth: 15000.0,
        currency: 'NGN',
        billingMode: 'MANUAL_MONTHLY',
        billingInterval: 'MONTHLY',
        marketRegion: 'NG',
        gracePeriodDays: policy.gracePeriodDays || DEFAULT_GRACE_PERIOD_DAYS,
        maxInternalSeats: 2,
        activePilotEngagementId: activePilot ? activePilot.id : null,
      },
    });

    await db.subscriptionEvent.create({
      data: {
        organizationId,
        subscriptionId: sub.id,
        eventType: 'TRIAL_STARTED',
        toStatus: sub.status,
        toPlan: 'STARTER',
        actorType: 'SYSTEM',
        reason: `${policy.trialDays}-day free trial initialized (no credit card required)`,
      },
    }).catch(() => {});
  }

  // Sync Pilot link
  if (activePilot && sub.status !== 'PILOT_INCLUDED') {
    sub = await transitionSubscriptionState({
      organizationId,
      toStatus: 'PILOT_INCLUDED',
      eventType: 'PILOT_ACTIVATED',
      actorType: 'SYSTEM',
      updateFields: { activePilotEngagementId: activePilot.id },
      bypassTransitionGuard: true,
    });
  } else if (!activePilot && sub.status === 'PILOT_INCLUDED') {
    const isTrialValid = sub.trialEndsAt > now;
    const fallbackStatus = isTrialValid
      ? 'TRIALING'
      : sub.paidThroughDate && sub.paidThroughDate > now
      ? 'ACTIVE'
      : 'EXPIRED';
    sub = await transitionSubscriptionState({
      organizationId,
      toStatus: fallbackStatus,
      eventType: 'PILOT_ENDED',
      actorType: 'SYSTEM',
      updateFields: { activePilotEngagementId: null },
      bypassTransitionGuard: true,
    });
  }

  let effectiveStatus = normalizeSubscriptionState(sub.status);
  let isOperational = true;

  if (effectiveStatus === 'PILOT_INCLUDED') {
    isOperational = true;
  } else if (effectiveStatus === 'ACTIVE') {
    if (sub.paidThroughDate && sub.paidThroughDate < now) {
      if (sub.cancelAtPeriodEnd) {
        effectiveStatus = 'CANCELLED';
        isOperational = false;
      } else if (sub.gracePeriodEndsAt && sub.gracePeriodEndsAt > now) {
        effectiveStatus = 'GRACE_PERIOD';
        isOperational = true;
      } else {
        effectiveStatus = 'EXPIRED';
        isOperational = false;
      }
    } else {
      isOperational = true;
    }
  } else if (effectiveStatus === 'PAST_DUE' || effectiveStatus === 'GRACE_PERIOD') {
    if (sub.gracePeriodEndsAt && sub.gracePeriodEndsAt > now) {
      effectiveStatus = 'GRACE_PERIOD';
      isOperational = true;
    } else {
      effectiveStatus = 'EXPIRED';
      isOperational = false;
    }
  } else if (effectiveStatus === 'TRIALING') {
    if (sub.trialEndsAt <= now) {
      if (sub.paidThroughDate && sub.paidThroughDate > now) {
        effectiveStatus = 'ACTIVE';
        isOperational = true;
      } else {
        effectiveStatus = 'EXPIRED';
        isOperational = false;
      }
    } else {
      isOperational = true;
    }
  } else if (effectiveStatus === 'CANCELLED') {
    if (sub.paidThroughDate && sub.paidThroughDate > now && !sub.cancelledAt) {
      isOperational = true;
    } else if (sub.cancelAtPeriodEnd && sub.paidThroughDate && sub.paidThroughDate > now) {
      isOperational = true;
    } else {
      isOperational = false;
    }
  } else if (effectiveStatus === 'SUSPENDED' || effectiveStatus === 'EXPIRED') {
    if (effectiveStatus === 'EXPIRED' && sub.paidThroughDate && sub.paidThroughDate > now) {
      effectiveStatus = 'ACTIVE';
      isOperational = true;
    } else {
      isOperational = false;
    }
  }

  const remainingMs = Math.max(0, sub.trialEndsAt.getTime() - now.getTime());
  const trialHoursLeft = Math.floor(remainingMs / (1000 * 60 * 60));
  const trialDaysLeft = Math.floor(trialHoursLeft / 24);

  const usageSummary = await getWorkspaceEntitlementsAndUsage(organizationId, sub);
  const planCode = normalizePlanCode(sub.plan);

  return {
    status: effectiveStatus,
    isOperational,
    plan: planCode,
    planName: usageSummary.planName,
    pricePerMonth: sub.pricePerMonth,
    currency: sub.currency,
    billingMode: sub.billingMode,
    billingInterval: sub.billingInterval || 'MONTHLY',
    marketRegion: sub.marketRegion || 'NG',
    trialStartedAt: sub.trialStartedAt,
    trialEndsAt: sub.trialEndsAt,
    trialPolicyVersion: TRIAL_POLICY_VERSION,
    trialDaysLeft,
    trialHoursLeft,
    paidThroughDate: sub.paidThroughDate,
    gracePeriodEndsAt: sub.gracePeriodEndsAt,
    gracePeriodDays: sub.gracePeriodDays || DEFAULT_GRACE_PERIOD_DAYS,
    cancelAtPeriodEnd: Boolean(sub.cancelAtPeriodEnd),
    cancelledAt: sub.cancelledAt,
    activePilotEngagementId: sub.activePilotEngagementId,
    maxInternalSeats: usageSummary.entitlements.maxTeamMembers,
    internalSeatsUsed: usageSummary.usage.teamMembers,
    maxActiveLeads: usageSummary.entitlements.maxActiveLeads + usageSummary.credits.leads,
    activeLeadsCount: usageSummary.usage.activeLeads,
    usageSummary,
  };
}

const cachedGetOrCreateWorkspaceSubscription =
  typeof cache === 'function' ? cache(_getOrCreateWorkspaceSubscription) : _getOrCreateWorkspaceSubscription;

export async function getOrCreateWorkspaceSubscription(organizationId: string): Promise<SubscriptionStatusInfo> {
  return cachedGetOrCreateWorkspaceSubscription(organizationId);
}

/**
 * Asserts that the workspace is currently operational.
 * Never deletes or hides existing customer data when expired.
 */
export async function assertWorkspaceOperational(organizationId: string): Promise<SubscriptionStatusInfo> {
  const sub = await getOrCreateWorkspaceSubscription(organizationId);
  if (!sub.isOperational) {
    throw new Error('Your free trial or paid billing period has ended. Choose a plan in Billing to resume new automated operations — all your existing records remain safe and accessible.');
  }
  return sub;
}

/**
 * Backend enforcement for active-lead allowance (Starter 500, Growth 2,000, Scale 10,000, Enterprise custom).
 */
export async function assertWithinLeadAllowance(organizationId: string): Promise<void> {
  await assertEntitlementLimit(organizationId, 'LEADS');
}

export function calculateNextPaidThroughDate(
  currentPaidThroughDate: Date | null,
  durationMonths: number = 1,
  gracePeriodDays: number = DEFAULT_GRACE_PERIOD_DAYS
): {
  nextPaidThroughDate: Date;
  gracePeriodEndsAt: Date;
} {
  const now = new Date();
  const baseDate = currentPaidThroughDate && currentPaidThroughDate > now
    ? new Date(currentPaidThroughDate)
    : new Date(now);

  const nextPaidThroughDate = new Date(baseDate);
  nextPaidThroughDate.setMonth(nextPaidThroughDate.getMonth() + durationMonths);

  const gracePeriodEndsAt = new Date(nextPaidThroughDate);
  gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + gracePeriodDays);

  return { nextPaidThroughDate, gracePeriodEndsAt };
}
