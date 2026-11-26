import React from 'react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllAffiliateStoreData } from '@/lib/dss/affiliate-store';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Enforce strict SUPER_ADMIN or OPERATOR authorization (never tenant workspace ADMIN)
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  const isSuperAdmin = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'OPERATOR';

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">lock</span>
        </div>
        <h1 className="text-xl font-bold text-on-surface mb-2">Access Restricted</h1>
        <p className="text-sm text-on-surface-variant max-w-md mb-6">
          Superadmin platform privileges are required to access global commercial controls and tenant financials.
        </p>
        <a 
          href="/dashboard" 
          className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  // Fetch all client organizations with counts and memberships
  const organizations = await db.organization.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          members: true,
          leads: true,
          deals: true,
          revenueActions: true,
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true,
            }
          }
        }
      }
    }
  });

  // Fetch all users across the platform
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      memberships: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              plan: true,
            }
          }
        }
      }
    }
  });

  // Fetch won deals across all client pipelines
  const wonDeals = await db.deal.findMany({
    where: { stage: 'WON' },
    include: {
      organization: {
        select: { id: true, name: true, slug: true }
      },
      lead: {
        select: { name: true, email: true }
      }
    },
    orderBy: { closedAt: 'desc' },
    take: 100,
  });

  // Fetch DSS affiliate sales, payouts, and partners
  const affiliateData = await getAllAffiliateStoreData();

  // Aggregate statistics
  const totalOrgs = organizations.length;
  const approvedOrgs = organizations.filter(o => o.status === 'APPROVED').length;
  const pendingOrgs = organizations.filter(o => o.status === 'PENDING').length;
  const suspendedOrgs = organizations.filter(o => o.status === 'SUSPENDED').length;
  const totalUsers = users.length;
  const totalLeads = organizations.reduce((acc, o) => acc + o._count.leads, 0);
  const totalRevenueActions = organizations.reduce((acc, o) => acc + o._count.revenueActions, 0);

  // Fetch verified billing, subscription, and commission records for non-fabricated reporting
  const [allSubscriptions, allInvoices, failedAttemptsCount, allCommissions] = await Promise.all([
    db.workspaceSubscription.findMany({ select: { status: true, plan: true, pricePerMonth: true, currency: true, marketRegion: true, billingInterval: true } }),
    db.bachsInvoice.findMany({ select: { type: true, amount: true, currency: true, status: true } }),
    db.paymentAttempt.count({ where: { status: 'FAILED' } }),
    db.salesCommissionRecord.findMany({ select: { commissionAmount: true, status: true } }),
  ]);

  const toNgn = (amount: number, currency: string) => (currency === 'USD' ? amount * 1500 : currency === 'GBP' ? amount * 1900 : currency === 'CAD' ? amount * 1100 : amount);

  const activePaidSubs = allSubscriptions.filter((s) => s.status === 'ACTIVE');
  const mrrNgn = activePaidSubs.reduce((sum, s) => sum + toNgn(s.pricePerMonth || 0, s.currency || 'NGN'), 0);
  const arrNgn = mrrNgn * 12;
  const trialAccountsCount = allSubscriptions.filter((s) => s.status === 'TRIALING').length;
  const graceOrPastDueCount = allSubscriptions.filter((s) => ['GRACE_PERIOD', 'GRACE', 'PAST_DUE'].includes(s.status)).length;
  const cancelledOrExpiredCount = allSubscriptions.filter((s) => ['CANCELLED', 'EXPIRED', 'SUSPENDED'].includes(s.status)).length;
  const denom = activePaidSubs.length + cancelledOrExpiredCount;
  const churnRatePercent = denom > 0 ? Math.round((cancelledOrExpiredCount / denom) * 1000) / 10 : 0;

  const paidInvoices = allInvoices.filter((i) => ['PAID', 'CONFIRMED', 'FUNDS_AVAILABLE'].includes(i.status));
  const outstandingInvoices = allInvoices.filter((i) => ['ISSUED', 'APPROVED'].includes(i.status));
  const refundedInvoices = allInvoices.filter((i) => i.status === 'REFUNDED');

  const verifiedCollectedRevenueNgn = paidInvoices.reduce((sum, i) => sum + toNgn(i.amount, i.currency), 0);
  const subscriptionRevenueNgn = paidInvoices.filter((i) => ['SOFTWARE_SUBSCRIPTION', 'WORKSPACE_INVOICE'].includes(i.type)).reduce((sum, i) => sum + toNgn(i.amount, i.currency), 0);
  const serviceRevenueNgn = paidInvoices.filter((i) => ['GROWTH_SERVICE', 'SERVICE_PURCHASE', 'PILOT_ENGAGEMENT'].includes(i.type)).reduce((sum, i) => sum + toNgn(i.amount, i.currency), 0);
  const leadRecoveryRevenueNgn = paidInvoices.filter((i) => i.type === 'LEAD_RECOVERY').reduce((sum, i) => sum + toNgn(i.amount, i.currency), 0);
  const outstandingInvoicesNgn = outstandingInvoices.reduce((sum, i) => sum + toNgn(i.amount, i.currency), 0);
  const refundedInvoicesNgn = refundedInvoices.reduce((sum, i) => sum + toNgn(i.amount, i.currency), 0);
  const arpaNgn = activePaidSubs.length > 0 ? Math.round(mrrNgn / activePaidSubs.length) : 0;

  const commissionPayableNgn = allCommissions.filter((c) => c.status === 'PAYABLE').reduce((sum, c) => sum + c.commissionAmount, 0);
  const commissionPaidNgn = allCommissions.filter((c) => c.status === 'PAID').reduce((sum, c) => sum + c.commissionAmount, 0);

  const revenueByPlan: Record<string, { count: number; revenueNgn: number }> = {};
  const revenueByCountry: Record<string, { count: number; revenueNgn: number }> = {};
  for (const sub of allSubscriptions) {
    const pKey = sub.plan || 'STARTER';
    const cKey = sub.marketRegion || 'NG';
    if (!revenueByPlan[pKey]) revenueByPlan[pKey] = { count: 0, revenueNgn: 0 };
    revenueByPlan[pKey].count += 1;
    if (sub.status === 'ACTIVE') revenueByPlan[pKey].revenueNgn += toNgn(sub.pricePerMonth || 0, sub.currency || 'NGN');

    if (!revenueByCountry[cKey]) revenueByCountry[cKey] = { count: 0, revenueNgn: 0 };
    revenueByCountry[cKey].count += 1;
    if (sub.status === 'ACTIVE') revenueByCountry[cKey].revenueNgn += toNgn(sub.pricePerMonth || 0, sub.currency || 'NGN');
  }

  const commercialAnalytics = {
    mrrNgn,
    arrNgn,
    activePaidSubscriptions: activePaidSubs.length,
    trialAccountsCount,
    graceOrPastDueCount,
    cancelledOrExpiredCount,
    churnRatePercent,
    arpaNgn,
    verifiedCollectedRevenueNgn,
    subscriptionRevenueNgn,
    serviceRevenueNgn,
    leadRecoveryRevenueNgn,
    outstandingInvoicesNgn,
    outstandingInvoicesCount: outstandingInvoices.length,
    refundedInvoicesNgn,
    failedPaymentAttemptsCount: failedAttemptsCount,
    commissionPayableNgn,
    commissionPaidNgn,
    revenueByPlan,
    revenueByCountry,
  };

  // Real client won-deal pipeline volume (zero fabricated baselines)
  const pipelineGmvNgn = wonDeals.reduce((sum, d) => sum + d.amount, 0);
  const academyTuitionGmvNgn = affiliateData.sales.reduce((sum, s) => sum + (s.amount / 100), 0);
  const totalGmvNgn = pipelineGmvNgn + academyTuitionGmvNgn + verifiedCollectedRevenueNgn;

  const totalAffiliateCommissionNgn = affiliateData.sales.reduce((sum, s) => sum + (s.commission / 100), 0);
  const paidAffiliateCommissionNgn = affiliateData.sales
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + (s.commission / 100), 0);
  const pendingAffiliateCommissionNgn = affiliateData.sales
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + (s.commission / 100), 0);

  const netAcademyNgn = academyTuitionGmvNgn - totalAffiliateCommissionNgn;
  const netPlatformRevenueNgn = verifiedCollectedRevenueNgn + commissionPaidNgn + netAcademyNgn;

  const finances = {
    totalGmvNgn,
    netPlatformRevenueNgn,
    mrrNgn,
    totalAffiliateCommissionNgn,
    paidAffiliateCommissionNgn,
    pendingAffiliateCommissionNgn,
    industryBreakdown: {
      serviceBusinesses: { amount: serviceRevenueNgn, percentage: verifiedCollectedRevenueNgn > 0 ? Math.round((serviceRevenueNgn / verifiedCollectedRevenueNgn) * 100) : 0 },
      techFirms: { amount: subscriptionRevenueNgn, percentage: verifiedCollectedRevenueNgn > 0 ? Math.round((subscriptionRevenueNgn / verifiedCollectedRevenueNgn) * 100) : 0 },
      digitalCreators: { amount: leadRecoveryRevenueNgn, percentage: verifiedCollectedRevenueNgn > 0 ? Math.round((leadRecoveryRevenueNgn / verifiedCollectedRevenueNgn) * 100) : 0 },
      academyBootcamps: { amount: academyTuitionGmvNgn, percentage: 0 },
    }
  };

  // Fetch service marketplace packages, active client services & early access/service requests
  const [servicePackages, clientServices, serviceRequests, closecraftAffiliatesRaw, closecraftPayoutsRaw] = await Promise.all([
    db.servicePackage.findMany({ orderBy: { defaultBasePrice: 'asc' } }),
    db.clientService.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true, slug: true } }
      }
    }),
    db.serviceRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.affiliateProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        commissions: true,
        payouts: true,
        _count: {
          select: {
            referralEvents: true,
            attributions: true,
            commissions: true,
            payouts: true,
          }
        }
      }
    }),
    db.affiliatePayout.findMany({
      orderBy: { requestedAt: 'desc' },
      include: {
        affiliate: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      },
      take: 50,
    })
  ]);

  const closecraftAffiliates = closecraftAffiliatesRaw.map((aff) => {
    const totalEarned = aff.commissions
      .filter((c) => c.status === 'APPROVED' || c.status === 'PAYABLE' || c.status === 'PAID')
      .reduce((sum, c) => sum + c.amount, 0);

    const totalPaid = aff.payouts
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = aff.payouts
      .filter((p) => p.status === 'REQUESTED' || p.status === 'APPROVED' || p.status === 'PROCESSING')
      .reduce((sum, p) => sum + p.amount, 0);

    const clearedBalance = Math.max(0, totalEarned - totalPaid - totalPending);

    return {
      id: aff.id,
      userId: aff.userId,
      referralCode: aff.referralCode,
      channel: aff.channel,
      status: aff.status,
      commissionRate: aff.commissionRate,
      bankName: aff.bankName,
      bankAccountNumber: aff.bankAccountNumber,
      bankAccountName: aff.bankAccountName,
      createdAt: aff.createdAt.toISOString(),
      user: aff.user,
      _count: aff._count,
      totalEarnedNgn: totalEarned,
      clearedBalanceNgn: clearedBalance,
    };
  });

  const closecraftPayouts = closecraftPayoutsRaw.map((p) => ({
    id: p.id,
    affiliateId: p.affiliateId,
    amount: p.amount,
    status: p.status,
    reference: p.reference,
    bankDetails: p.bankDetails,
    requestedAt: p.requestedAt.toISOString(),
    processedAt: p.processedAt ? p.processedAt.toISOString() : null,
    affiliate: {
      referralCode: p.affiliate.referralCode,
      bankName: p.affiliate.bankName,
      bankAccountNumber: p.affiliate.bankAccountNumber,
      bankAccountName: p.affiliate.bankAccountName,
      user: p.affiliate.user,
    }
  }));

  return (
    <AdminDashboardClient
      organizations={organizations}
      users={users}
      wonDeals={wonDeals}
      affiliateData={affiliateData}
      servicePackages={servicePackages}
      clientServices={clientServices}
      serviceRequests={serviceRequests}
      closecraftAffiliates={closecraftAffiliates}
      closecraftPayouts={closecraftPayouts}
      stats={{
        totalOrgs,
        approvedOrgs,
        pendingOrgs,
        suspendedOrgs,
        totalUsers,
        totalLeads,
        totalRevenueActions,
      }}
      finances={finances}
      commercialAnalytics={commercialAnalytics}
    />
  );
}
