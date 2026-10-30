import { db } from '@/lib/db';

export const TRIAL_DURATION_HOURS = 168; // Exactly 7 days (168 hours)
export const TRIAL_DURATION_MS = TRIAL_DURATION_HOURS * 60 * 60 * 1000;
export const TRIAL_POLICY_VERSION = 'V2_7DAY';

export interface WorkspacePlanConfig {
  id: 'STARTER' | 'PRO' | 'ENTERPRISE' | 'MANAGED_SALES';
  name: string;
  pricePerMonth: number;
  currency: string;
  maxInternalSeats: number;
  maxActiveLeads: number;
  headline: string;
  description: string;
  features: string[];
}

export const WORKSPACE_PLANS: Record<'STARTER' | 'PRO' | 'ENTERPRISE' | 'MANAGED_SALES', WorkspacePlanConfig> = {
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    pricePerMonth: 20000.0,
    currency: 'NGN',
    maxInternalSeats: 3,
    maxActiveLeads: 1000, // Discrepancy resolved: configured 1,000 active leads/month
    headline: '3 Internal Seats · 7-Day Free Trial',
    description: 'Designed for lean service businesses looking to capture enquiries and establish structured follow-up routines.',
    features: [
      'Up to 3 internal team seats',
      'Up to 1,000 active leads/month',
      '7-day free trial (no card required)',
      'Enquiry inbox & lead assignment',
      'Follow-up reminders & leakage radar',
      'Bachs.io hosted checkout (cards, bank transfer, MoMo)',
      'Add remote sales support pilots anytime',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    pricePerMonth: 45000.0,
    currency: 'NGN',
    maxInternalSeats: 10,
    maxActiveLeads: 10000,
    headline: '10 Internal Seats · High-Velocity Operations',
    description: 'Built for growing sales organizations requiring multi-rep capacity, automated round-robin distribution, and manager coaching tools.',
    features: [
      'Up to 10 internal team seats',
      'Expanded active lead capacity',
      'Round-robin and automated lead assignment',
      'Manager call review & coaching queue',
      'Revenue health analytics & leakage detection',
      'Priority WhatsApp & email notification dispatch',
      'Dedicated pilot onboarding assistance',
    ],
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    pricePerMonth: 75000.0,
    currency: 'NGN',
    maxInternalSeats: 25,
    maxActiveLeads: 50000,
    headline: 'Enterprise Operations · Expanded Capacity',
    description: 'Larger teams needing custom integrations, expanded lead volume, and dedicated security controls.',
    features: [
      'Up to 25 internal team seats',
      'Expanded active lead allowance (50,000+)',
      'Custom CRM & ERP integrations',
      'Dedicated onboarding & priority support',
      'Enterprise SLA & audit export',
    ],
  },
  MANAGED_SALES: {
    id: 'MANAGED_SALES',
    name: 'Managed Sales Engagement',
    pricePerMonth: 150000.0,
    currency: 'NGN',
    maxInternalSeats: 10,
    maxActiveLeads: 10000,
    headline: 'Remote Sales Support · From ₦150,000 for 30 Days',
    description: 'Suitable businesses needing remote sales support with workspace access included in agreed engagement scope.',
    features: [
      'Remote sales closers and appointment setters',
      'Workspace access included in engagement scope',
      'Offer economics & lead flow review',
      'Daily activity & pipeline tracking',
    ],
  },
};

export interface SubscriptionStatusInfo {
  status: 'TRIALING' | 'ACTIVE' | 'GRACE' | 'EXPIRED' | 'PILOT_INCLUDED';
  isOperational: boolean; // Can user perform operational CRM actions (add leads, automate, outreach)?
  plan: string;
  pricePerMonth: number;
  currency: string;
  billingMode: string;
  trialStartedAt: Date;
  trialEndsAt: Date;
  trialPolicyVersion: string;
  trialDaysLeft: number;
  trialHoursLeft: number;
  paidThroughDate: Date | null;
  gracePeriodEndsAt: Date | null;
  activePilotEngagementId: string | null;
  maxInternalSeats: number;
  internalSeatsUsed: number;
  maxActiveLeads: number;
  activeLeadsCount: number;
}

/**
 * Gets or initializes the 7-day Starter trial workspace subscription.
 * Idempotent: never overwrites or resets existing trial dates.
 */
export async function getOrCreateWorkspaceSubscription(organizationId: string): Promise<SubscriptionStatusInfo> {
  const now = new Date();

  // Check if an active pilot engagement exists for this organization
  const activePilot = await db.pilotEngagement.findFirst({
    where: {
      organizationId,
      status: { in: ['ACTIVE', 'SCHEDULED'] }
    }
  });

  let sub = await db.workspaceSubscription.findUnique({
    where: { organizationId }
  });

  if (!sub) {
    // 7-day trial = exactly 168 hours from server creation in UTC
    const trialEnd = new Date(now.getTime() + TRIAL_DURATION_MS);
    sub = await db.workspaceSubscription.create({
      data: {
        organizationId,
        status: activePilot ? 'PILOT_INCLUDED' : 'TRIALING',
        trialStartedAt: now,
        trialEndsAt: trialEnd,
        plan: 'STARTER',
        pricePerMonth: 20000.0,
        currency: 'NGN',
        billingMode: 'MANUAL_MONTHLY',
        maxInternalSeats: 3,
        activePilotEngagementId: activePilot ? activePilot.id : null,
      }
    });
  }

  // If active pilot engagement exists, status is PILOT_INCLUDED
  if (activePilot && sub.status !== 'PILOT_INCLUDED') {
    sub = await db.workspaceSubscription.update({
      where: { organizationId },
      data: {
        status: 'PILOT_INCLUDED',
        activePilotEngagementId: activePilot.id,
      }
    });
  } else if (!activePilot && sub.status === 'PILOT_INCLUDED') {
    // If pilot finished, transition to trial or grace
    const isTrialValid = sub.trialEndsAt > now;
    sub = await db.workspaceSubscription.update({
      where: { organizationId },
      data: {
        status: isTrialValid ? 'TRIALING' : (sub.paidThroughDate && sub.paidThroughDate > now ? 'ACTIVE' : 'EXPIRED'),
        activePilotEngagementId: null,
      }
    });
  }

  // Calculate current effective status
  let effectiveStatus: 'TRIALING' | 'ACTIVE' | 'GRACE' | 'EXPIRED' | 'PILOT_INCLUDED' = sub.status as any;
  let isOperational = true;

  if (effectiveStatus === 'PILOT_INCLUDED') {
    isOperational = true;
  } else if (effectiveStatus === 'ACTIVE') {
    if (sub.paidThroughDate && sub.paidThroughDate < now) {
      if (sub.gracePeriodEndsAt && sub.gracePeriodEndsAt > now) {
        effectiveStatus = 'GRACE';
        isOperational = true;
      } else {
        effectiveStatus = 'EXPIRED';
        isOperational = false;
      }
    } else {
      isOperational = true;
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
  } else if (effectiveStatus === 'EXPIRED') {
    if (sub.paidThroughDate && sub.paidThroughDate > now) {
      effectiveStatus = 'ACTIVE';
      isOperational = true;
    } else {
      isOperational = false;
    }
  }

  const remainingMs = Math.max(0, sub.trialEndsAt.getTime() - now.getTime());
  const trialHoursLeft = Math.floor(remainingMs / (1000 * 60 * 60));
  const trialDaysLeft = Math.floor(trialHoursLeft / 24);

  // Count internal members
  const internalSeatsUsed = await db.organizationMember.count({
    where: {
      organizationId,
      role: { not: 'EXTERNAL_PROFESSIONAL' },
    },
  });

  // Count active leads (excluding terminal WON/LOST/DISQUALIFIED deals)
  const activeLeadsCount = await db.lead.count({
    where: {
      organizationId,
      status: { notIn: ['WON', 'LOST', 'DISQUALIFIED'] },
    },
  });

  const planKey = (sub.plan?.toUpperCase() || 'STARTER') as keyof typeof WORKSPACE_PLANS;
  const planConfig = WORKSPACE_PLANS[planKey] || WORKSPACE_PLANS.STARTER;
  const maxActiveLeads = planConfig.maxActiveLeads || 1000;

  return {
    status: effectiveStatus,
    isOperational,
    plan: sub.plan,
    pricePerMonth: sub.pricePerMonth,
    currency: sub.currency,
    billingMode: sub.billingMode,
    trialStartedAt: sub.trialStartedAt,
    trialEndsAt: sub.trialEndsAt,
    trialPolicyVersion: TRIAL_POLICY_VERSION,
    trialDaysLeft,
    trialHoursLeft,
    paidThroughDate: sub.paidThroughDate,
    gracePeriodEndsAt: sub.gracePeriodEndsAt,
    activePilotEngagementId: sub.activePilotEngagementId,
    maxInternalSeats: sub.maxInternalSeats || 3,
    internalSeatsUsed,
    maxActiveLeads,
    activeLeadsCount,
  };
}

/**
 * Asserts that the workspace is currently operational (active trial, active subscription, or pilot included).
 * At server time >= trialEndsAt, an unpaid workspace no longer receives trial access.
 * Throws an explicit error without altering existing data.
 */
export async function assertWorkspaceOperational(organizationId: string): Promise<SubscriptionStatusInfo> {
  const sub = await getOrCreateWorkspaceSubscription(organizationId);
  if (!sub.isOperational) {
    throw new Error('Your free trial has ended. Choose a plan to continue using paid features. You can still access your account and billing options.');
  }
  return sub;
}

/**
 * Asserts that the workspace has not exceeded its plan active-lead allowance.
 * Starter tier is bounded at 1,000 active leads.
 */
export async function assertWithinLeadAllowance(organizationId: string): Promise<void> {
  const sub = await getOrCreateWorkspaceSubscription(organizationId);
  if (sub.activeLeadsCount >= sub.maxActiveLeads) {
    throw new Error(`Starter workspace active-lead allowance reached (${sub.activeLeadsCount}/${sub.maxActiveLeads} leads). Please upgrade to Pro to continue adding leads.`);
  }
}

/**
 * Calculates next paid through date for calendar month renewal.
 * Early renewal extends the existing paid-through date.
 * Renewal after expiry starts 1 calendar month from current confirmation.
 */
export function calculateNextPaidThroughDate(currentPaidThroughDate: Date | null, durationMonths: number = 1): {
  nextPaidThroughDate: Date;
  gracePeriodEndsAt: Date;
} {
  const now = new Date();
  let baseDate: Date;

  if (currentPaidThroughDate && currentPaidThroughDate > now) {
    baseDate = new Date(currentPaidThroughDate);
  } else {
    baseDate = new Date(now);
  }

  const nextPaidThroughDate = new Date(baseDate);
  nextPaidThroughDate.setMonth(nextPaidThroughDate.getMonth() + durationMonths);

  const gracePeriodEndsAt = new Date(nextPaidThroughDate);
  gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 7); // 7-day grace period

  return { nextPaidThroughDate, gracePeriodEndsAt };
}
