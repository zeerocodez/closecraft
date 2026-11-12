import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import AffiliateDashboardClient from './AffiliateDashboardClient';

export const metadata = {
  title: 'Affiliate Partner Dashboard — Closecraft',
  description: 'Track clicks, referrals, commissions, and request payouts from your CloseCraft partner dashboard.',
};

export default async function AffiliateDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/affiliate/dashboard');
  }

  const profile = await db.affiliateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      commissions: { orderBy: { createdAt: 'desc' }, take: 50 },
      payouts: { orderBy: { requestedAt: 'desc' }, take: 20 },
      attributions: { 
        orderBy: { createdAt: 'desc' }, 
        take: 20,
        include: {
          organization: {
            select: { id: true, name: true, plan: true, createdAt: true }
          }
        }
      },
      _count: {
        select: {
          referralEvents: true,
          attributions: true,
        },
      },
    },
  });

  if (!profile) {
    redirect('/affiliate');
  }

  const totalEarnedNgn = profile.commissions
    .filter((c) => c.status === 'APPROVED' || c.status === 'PAYABLE' || c.status === 'PAID')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalPaidNgn = profile.payouts
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPendingOrProcessingPayouts = profile.payouts
    .filter((p) => p.status === 'REQUESTED' || p.status === 'APPROVED' || p.status === 'PROCESSING')
    .reduce((sum, p) => sum + p.amount, 0);

  const clearedEarningsNgn = Math.max(0, totalEarnedNgn - totalPaidNgn - totalPendingOrProcessingPayouts);

  const serializedProfile = {
    id: profile.id,
    affiliateCode: profile.referralCode,
    status: profile.status,
    commissionRateBps: Math.round(profile.commissionRate * 100),
    bankName: profile.bankName,
    bankAccountNumber: profile.bankAccountNumber,
    bankAccountName: profile.bankAccountName,
    payoutCurrency: 'NGN',
    lifetimeClicks: profile._count.referralEvents,
    lifetimeReferrals: profile._count.attributions,
    lifetimeEarningsNgn: totalEarnedNgn,
    clearedEarningsNgn,
    paidEarningsNgn: totalPaidNgn,
  };

  const serializedCommissions = profile.commissions.map((c) => ({
    id: c.id,
    grossAmountNgn: c.saleAmount,
    commissionAmountNgn: c.amount,
    status: c.status,
    clearedAt: c.clearsAt ? c.clearsAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
  }));

  const serializedPayouts = profile.payouts.map((p) => ({
    id: p.id,
    amountNgn: p.amount,
    status: p.status,
    payoutReference: p.reference,
    notes: p.bankDetails,
    createdAt: p.requestedAt.toISOString(),
  }));

  const serializedAttributions = profile.attributions.map((a: any) => ({
    id: a.id,
    organizationName: a.organization?.name || 'Referred Client',
    plan: a.organization?.plan || 'STARTER',
    status: 'ACTIVE',
    expiresAt: new Date(a.createdAt.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <AffiliateDashboardClient
      profile={serializedProfile}
      commissions={serializedCommissions}
      payouts={serializedPayouts}
      attributions={serializedAttributions}
      userName={session.user.name || 'Partner'}
      userEmail={session.user.email || ''}
    />
  );
}
