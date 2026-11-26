import { db } from '@/lib/db';

export type SubscriptionState =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'GRACE_PERIOD'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'PILOT_INCLUDED';

export const DEFAULT_TRIAL_DAYS = 7;
export const DEFAULT_GRACE_PERIOD_DAYS = 5;

export const PERMITTED_STATE_TRANSITIONS: Record<SubscriptionState, SubscriptionState[]> = {
  TRIALING: ['ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED', 'PILOT_INCLUDED'],
  ACTIVE: ['ACTIVE', 'PAST_DUE', 'GRACE_PERIOD', 'CANCELLED', 'SUSPENDED', 'EXPIRED', 'PILOT_INCLUDED'],
  PAST_DUE: ['ACTIVE', 'GRACE_PERIOD', 'SUSPENDED', 'CANCELLED', 'EXPIRED'],
  GRACE_PERIOD: ['ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'],
  SUSPENDED: ['ACTIVE', 'CANCELLED', 'EXPIRED'],
  CANCELLED: ['ACTIVE', 'EXPIRED', 'TRIALING'],
  EXPIRED: ['ACTIVE', 'PILOT_INCLUDED'],
  PILOT_INCLUDED: ['ACTIVE', 'TRIALING', 'EXPIRED', 'GRACE_PERIOD'],
};

export function normalizeSubscriptionState(raw?: string | null): SubscriptionState {
  const s = (raw || 'TRIALING').toUpperCase();
  if (s === 'GRACE') return 'GRACE_PERIOD';
  if (
    s === 'TRIALING' ||
    s === 'ACTIVE' ||
    s === 'PAST_DUE' ||
    s === 'GRACE_PERIOD' ||
    s === 'SUSPENDED' ||
    s === 'CANCELLED' ||
    s === 'EXPIRED' ||
    s === 'PILOT_INCLUDED'
  ) {
    return s;
  }
  return 'TRIALING';
}

export function isTransitionPermitted(from: SubscriptionState, to: SubscriptionState): boolean {
  if (from === to) return true;
  const allowed = PERMITTED_STATE_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

export async function getPlatformBillingPolicy() {
  const settings = await db.platformSettings.findUnique({
    where: { id: 'singleton' },
  }).catch(() => null);

  return {
    trialDays: settings?.defaultTrialDays || DEFAULT_TRIAL_DAYS,
    gracePeriodDays: settings?.defaultGracePeriodDays || DEFAULT_GRACE_PERIOD_DAYS,
    eligibilityPolicy: settings?.trialEligibilityPolicy || { requireEmailVerification: true, oneTrialPerOrganization: true },
  };
}

export async function transitionSubscriptionState(params: {
  organizationId: string;
  toStatus: SubscriptionState;
  eventType: string;
  toPlan?: string;
  actorId?: string;
  actorType?: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'WEBHOOK' | 'SYSTEM';
  reason?: string;
  metadata?: Record<string, any>;
  updateFields?: Record<string, any>;
  bypassTransitionGuard?: boolean;
}) {
  const sub = await db.workspaceSubscription.findUnique({
    where: { organizationId: params.organizationId },
  });

  if (!sub) {
    throw new Error('Workspace subscription record not found.');
  }

  const fromStatus = normalizeSubscriptionState(sub.status);
  const toStatus = normalizeSubscriptionState(params.toStatus);

  if (!params.bypassTransitionGuard && !isTransitionPermitted(fromStatus, toStatus)) {
    throw new Error(`Invalid subscription transition from ${fromStatus} to ${toStatus}.`);
  }

  const now = new Date();
  const data: Record<string, any> = {
    status: toStatus,
    ...(params.toPlan ? { plan: params.toPlan } : {}),
    ...(params.updateFields || {}),
  };

  if (toStatus === 'PAST_DUE' && !sub.pastDueSince) {
    data.pastDueSince = now;
  }
  if (toStatus === 'GRACE_PERIOD' && !data.gracePeriodEndsAt) {
    const policy = await getPlatformBillingPolicy();
    const graceDays = sub.gracePeriodDays || policy.gracePeriodDays || DEFAULT_GRACE_PERIOD_DAYS;
    data.gracePeriodEndsAt = new Date(now.getTime() + graceDays * 24 * 60 * 60 * 1000);
  }
  if (toStatus === 'SUSPENDED') {
    data.suspendedAt = now;
  }
  if (toStatus === 'CANCELLED') {
    data.cancelledAt = now;
  }
  if (toStatus === 'EXPIRED') {
    data.expiredAt = now;
  }
  if (toStatus === 'ACTIVE') {
    data.pastDueSince = null;
    data.suspendedAt = null;
    data.expiredAt = null;
    data.cancelledAt = null;
    data.cancelAtPeriodEnd = false;
  }

  const updated = await db.$transaction(async (tx) => {
    const updatedSub = await tx.workspaceSubscription.update({
      where: { id: sub.id },
      data,
    });

    await tx.subscriptionEvent.create({
      data: {
        organizationId: params.organizationId,
        subscriptionId: sub.id,
        eventType: params.eventType,
        fromStatus,
        toStatus,
        fromPlan: sub.plan,
        toPlan: params.toPlan || sub.plan,
        actorId: params.actorId || null,
        actorType: params.actorType || 'SYSTEM',
        reason: params.reason || null,
        metadata: params.metadata || undefined,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: params.organizationId,
        actorId: params.actorId || null,
        actorType: params.actorType === 'SUPER_ADMIN' ? 'ADMIN' : (params.actorType || 'SYSTEM'),
        action: `SUBSCRIPTION_${params.eventType}`,
        resourceType: 'SUBSCRIPTION',
        resourceId: sub.id,
        oldState: JSON.stringify({ status: fromStatus, plan: sub.plan }),
        newState: JSON.stringify({ status: toStatus, plan: params.toPlan || sub.plan, reason: params.reason }),
      },
    });

    return updatedSub;
  });

  return updated;
}

export async function cancelWorkspaceSubscription(params: {
  organizationId: string;
  actorId: string;
  immediate?: boolean;
  reason?: string;
}) {
  const sub = await db.workspaceSubscription.findUnique({
    where: { organizationId: params.organizationId },
  });
  if (!sub) throw new Error('Subscription not found');

  const now = new Date();
  if (params.immediate || !sub.paidThroughDate || sub.paidThroughDate <= now) {
    return transitionSubscriptionState({
      organizationId: params.organizationId,
      toStatus: 'CANCELLED',
      eventType: 'CANCELLED',
      actorId: params.actorId,
      actorType: 'USER',
      reason: params.reason || 'Customer requested immediate cancellation',
      updateFields: { cancelAtPeriodEnd: true },
    });
  }

  // Schedule cancel at end of paid billing period so data & paid access are preserved
  const updated = await db.workspaceSubscription.update({
    where: { id: sub.id },
    data: {
      cancelAtPeriodEnd: true,
      cancelledAt: now,
    },
  });

  await db.subscriptionEvent.create({
    data: {
      organizationId: params.organizationId,
      subscriptionId: sub.id,
      eventType: 'CANCELLATION_SCHEDULED',
      fromStatus: sub.status,
      toStatus: sub.status,
      fromPlan: sub.plan,
      toPlan: sub.plan,
      actorId: params.actorId,
      actorType: 'USER',
      reason: params.reason || 'Cancel at end of paid billing period',
      metadata: { paidThroughDate: sub.paidThroughDate },
    },
  });

  return updated;
}

export async function reactivateWorkspaceSubscription(params: {
  organizationId: string;
  actorId: string;
}) {
  const sub = await db.workspaceSubscription.findUnique({
    where: { organizationId: params.organizationId },
  });
  if (!sub) throw new Error('Subscription not found');

  const now = new Date();
  const hasRemainingPaidPeriod = sub.paidThroughDate && sub.paidThroughDate > now;

  if (!hasRemainingPaidPeriod) {
    throw new Error('Paid billing period has ended. Please complete checkout to reactivate your subscription.');
  }

  return transitionSubscriptionState({
    organizationId: params.organizationId,
    toStatus: 'ACTIVE',
    eventType: 'REACTIVATED',
    actorId: params.actorId,
    actorType: 'USER',
    reason: 'Customer reactivated subscription within paid period',
    updateFields: { cancelAtPeriodEnd: false, cancelledAt: null },
  });
}
