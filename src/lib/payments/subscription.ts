import { db } from '@/lib/db';

export interface SubscriptionStatusInfo {
  status: 'TRIALING' | 'ACTIVE' | 'GRACE' | 'EXPIRED' | 'PILOT_INCLUDED';
  isOperational: boolean; // Can user perform operational CRM actions?
  plan: string;
  pricePerMonth: number;
  currency: string;
  billingMode: string;
  trialDaysLeft: number;
  paidThroughDate: Date | null;
  gracePeriodEndsAt: Date | null;
  activePilotEngagementId: string | null;
}

/**
 * Gets or initializes the 14-day trial workspace subscription.
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
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
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
    }
  } else if (effectiveStatus === 'TRIALING') {
    if (sub.trialEndsAt < now) {
      if (sub.paidThroughDate && sub.paidThroughDate > now) {
        effectiveStatus = 'ACTIVE';
        isOperational = true;
      } else {
        effectiveStatus = 'EXPIRED';
        isOperational = false;
      }
    }
  }

  const trialDaysLeft = Math.max(0, Math.ceil((sub.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    status: effectiveStatus,
    isOperational,
    plan: sub.plan,
    pricePerMonth: sub.pricePerMonth,
    currency: sub.currency,
    billingMode: sub.billingMode,
    trialDaysLeft,
    paidThroughDate: sub.paidThroughDate,
    gracePeriodEndsAt: sub.gracePeriodEndsAt,
    activePilotEngagementId: sub.activePilotEngagementId,
  };
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
