import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getOrCreateWorkspaceSubscription } from '@/lib/payments/subscription';
import { getActivePlansWithPricing, resolveServerPlanPrice, USAGE_CREDIT_PACKS } from '@/lib/billing/catalog';
import BillingClient from '@/components/billing/BillingClient';

export const metadata = {
  title: 'Billing & Subscriptions | CloseCraft HQ',
  description: 'Manage your workspace subscription, 7-day trial, usage limits, invoices, and Bachs.io payments.',
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) redirect('/login');

  const member = await db.organizationMember.findFirst({
    where: { userId: session.user.id, organizationId },
    select: { role: true },
  });

  const isOwnerOrAdmin = member?.role === 'OWNER' || member?.role === 'ADMIN' || (session.user as any)?.role === 'SUPER_ADMIN';

  const [sub, plans, invoices, events, credits] = await Promise.all([
    getOrCreateWorkspaceSubscription(organizationId),
    getActivePlansWithPricing(),
    db.bachsInvoice.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.subscriptionEvent.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    db.usageCredit.findMany({
      where: { organizationId, remainingUnits: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  let activeInvoice = invoices.find(
    (inv) =>
      ['APPROVED', 'ISSUED'].includes(inv.status) &&
      ['WORKSPACE_INVOICE', 'SOFTWARE_SUBSCRIPTION'].includes(inv.type)
  );

  if (!activeInvoice) {
    const resolved = await resolveServerPlanPrice({
      planCode: sub.plan || 'STARTER',
      marketRegion: sub.marketRegion || 'NG',
      currency: sub.currency || 'NGN',
      billingInterval: sub.billingInterval || 'MONTHLY',
    }).catch(() => null);

    if (resolved && !resolved.plan.isCustomQuote) {
      const invoiceNumber = `CC-INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      activeInvoice = await db.bachsInvoice.create({
        data: {
          organizationId,
          invoiceNumber,
          type: 'SOFTWARE_SUBSCRIPTION',
          subtotalAmount: resolved.unitAmount,
          amount: resolved.unitAmount,
          currency: resolved.currency,
          status: 'APPROVED',
          billingInterval: resolved.billingInterval,
          customerEmail: session.user.email || null,
          customerName: session.user.name || null,
          lineItemsJson: JSON.stringify([
            {
              description: `CloseCraft HQ ${resolved.plan.name} Plan (${resolved.billingInterval})`,
              quantity: 1,
              unitPrice: resolved.unitAmount,
              total: resolved.unitAmount,
            },
          ]),
          metadata: JSON.stringify({
            description: `CloseCraft HQ ${resolved.plan.name} Workspace Subscription`,
            plan: resolved.plan.code,
            billingInterval: resolved.billingInterval,
            marketRegion: resolved.marketRegion,
          }),
        },
      });
    }
  }

  return (
    <BillingClient
      subscription={JSON.parse(JSON.stringify(sub))}
      plans={JSON.parse(JSON.stringify(plans))}
      creditPacks={USAGE_CREDIT_PACKS}
      invoices={JSON.parse(JSON.stringify(invoices))}
      events={JSON.parse(JSON.stringify(events))}
      credits={JSON.parse(JSON.stringify(credits))}
      activeInvoice={activeInvoice ? JSON.parse(JSON.stringify(activeInvoice)) : null}
      isOwnerOrAdmin={isOwnerOrAdmin}
    />
  );
}
