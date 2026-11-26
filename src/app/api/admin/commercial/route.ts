import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ensureCommercialCatalogInitialized } from '@/lib/billing/catalog';
import { transitionSubscriptionState } from '@/lib/billing/stateMachine';
import { transitionCommissionStatus } from '@/lib/sales/commissionEngine';

async function assertSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('UNAUTHORIZED');
  }
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true },
  });
  if (!dbUser || (dbUser.role !== 'SUPER_ADMIN' && dbUser.role !== 'OPERATOR')) {
    throw new Error('FORBIDDEN');
  }
  return dbUser;
}

export async function GET() {
  try {
    await assertSuperAdmin();
    await ensureCommercialCatalogInitialized();

    const [plans, promos, recoveryTiers, commissionTiers, subscriptions, agreements, commissions, settings] =
      await Promise.all([
        db.subscriptionPlan.findMany({
          orderBy: { sortOrder: 'asc' },
          include: { regionalPrices: true, entitlements: true },
        }),
        db.promotionalCode.findMany({ orderBy: { createdAt: 'desc' } }),
        db.leadRecoveryTier.findMany({ orderBy: { sortOrder: 'asc' } }),
        db.salesCommissionTierConfig.findMany({ orderBy: { serviceType: 'asc' } }),
        db.workspaceSubscription.findMany({
          include: { organization: { select: { id: true, name: true, slug: true } } },
          orderBy: { updatedAt: 'desc' },
          take: 100,
        }),
        db.salesEngagementAgreement.findMany({
          include: { organization: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        db.salesCommissionRecord.findMany({
          include: { organization: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 100,
        }),
        db.platformSettings.findUnique({ where: { id: 'singleton' } }),
      ]);

    return NextResponse.json({
      plans,
      promos,
      recoveryTiers,
      commissionTiers,
      subscriptions,
      agreements,
      commissions,
      settings,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden: Superadmin access required' }, { status: 403 });
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await assertSuperAdmin();
    const body = await req.json().catch(() => null);
    if (!body || !body.action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    switch (body.action) {
      case 'UPSERT_REGIONAL_PRICE': {
        const updated = await db.planRegionalPrice.upsert({
          where: {
            planId_marketRegion_currency: {
              planId: body.planId,
              marketRegion: String(body.marketRegion).toUpperCase(),
              currency: String(body.currency).toUpperCase(),
            },
          },
          update: {
            monthlyPrice: Number(body.monthlyPrice),
            annualPrice: Number(body.annualPrice),
            annualSavingsLabel: body.annualSavingsLabel || null,
            isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
          },
          create: {
            planId: body.planId,
            marketRegion: String(body.marketRegion).toUpperCase(),
            currency: String(body.currency).toUpperCase(),
            monthlyPrice: Number(body.monthlyPrice),
            annualPrice: Number(body.annualPrice),
            annualSavingsLabel: body.annualSavingsLabel || null,
            isActive: true,
          },
        });
        return NextResponse.json({ success: true, price: updated });
      }

      case 'UPDATE_PLAN_ENTITLEMENTS': {
        const updated = await db.planEntitlement.update({
          where: { planId: body.planId },
          data: {
            maxActiveLeads: Number(body.maxActiveLeads),
            maxTeamMembers: Number(body.maxTeamMembers),
            maxAiQualificationsPerMonth: Number(body.maxAiQualificationsPerMonth),
            maxAutomatedFollowUpsPerMonth: Number(body.maxAutomatedFollowUpsPerMonth),
            maxCampaigns: Number(body.maxCampaigns),
          },
        });
        return NextResponse.json({ success: true, entitlements: updated });
      }

      case 'TOGGLE_PLAN': {
        const updated = await db.subscriptionPlan.update({
          where: { id: body.planId },
          data: { isActive: Boolean(body.isActive) },
        });
        return NextResponse.json({ success: true, plan: updated });
      }

      case 'CREATE_PROMO': {
        const promo = await db.promotionalCode.create({
          data: {
            code: String(body.code).trim().toUpperCase(),
            description: body.description || null,
            discountType: body.discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
            discountValue: Number(body.discountValue),
            currency: body.currency ? String(body.currency).toUpperCase() : null,
            applicablePlans: Array.isArray(body.applicablePlans) ? body.applicablePlans : [],
            maxRedemptions: body.maxRedemptions ? Number(body.maxRedemptions) : null,
            validUntil: body.validUntil ? new Date(body.validUntil) : null,
            isActive: true,
          },
        });
        return NextResponse.json({ success: true, promo });
      }

      case 'TOGGLE_PROMO': {
        const promo = await db.promotionalCode.update({
          where: { id: body.promoId },
          data: { isActive: Boolean(body.isActive) },
        });
        return NextResponse.json({ success: true, promo });
      }

      case 'UPDATE_BILLING_POLICY': {
        const settings = await db.platformSettings.upsert({
          where: { id: 'singleton' },
          update: {
            defaultTrialDays: Number(body.defaultTrialDays || 7),
            defaultGracePeriodDays: Number(body.defaultGracePeriodDays || 5),
          },
          create: {
            id: 'singleton',
            defaultTrialDays: Number(body.defaultTrialDays || 7),
            defaultGracePeriodDays: Number(body.defaultGracePeriodDays || 5),
          },
        });
        return NextResponse.json({ success: true, settings });
      }

      case 'ADJUST_SUBSCRIPTION': {
        const updated = await transitionSubscriptionState({
          organizationId: body.organizationId,
          toStatus: body.toStatus,
          toPlan: body.toPlan,
          eventType: 'ADMIN_ADJUSTED',
          actorId: admin.id,
          actorType: 'SUPER_ADMIN',
          reason: body.reason || 'Manual adjustment by Superadmin',
          updateFields: {
            ...(body.customEntitlements ? { customEntitlements: body.customEntitlements } : {}),
            ...(body.paidThroughDate ? { paidThroughDate: new Date(body.paidThroughDate) } : {}),
          },
          bypassTransitionGuard: true,
        });
        return NextResponse.json({ success: true, subscription: updated });
      }

      case 'UPDATE_COMMISSION_TIER': {
        const tier = await db.salesCommissionTierConfig.update({
          where: { serviceType: body.serviceType },
          data: {
            minCommissionPercent: Number(body.minCommissionPercent),
            maxCommissionPercent: Number(body.maxCommissionPercent),
            defaultRetainerNgn: body.defaultRetainerNgn ? Number(body.defaultRetainerNgn) : null,
          },
        });
        return NextResponse.json({ success: true, tier });
      }

      case 'APPROVE_AGREEMENT': {
        const agreement = await db.salesEngagementAgreement.update({
          where: { id: body.agreementId },
          data: {
            status: body.status || 'ACTIVE',
            approvedById: admin.id,
            approvedAt: new Date(),
          },
        });
        return NextResponse.json({ success: true, agreement });
      }

      case 'TRANSITION_COMMISSION': {
        const commission = await transitionCommissionStatus({
          commissionId: body.commissionId,
          actorId: admin.id,
          nextStatus: body.nextStatus,
          payoutReference: body.payoutReference,
          reason: body.reason,
        });
        return NextResponse.json({ success: true, commission });
      }

      default:
        return NextResponse.json({ error: 'Unknown commercial action' }, { status: 400 });
    }
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden: Superadmin access required' }, { status: 403 });
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 400 });
  }
}
