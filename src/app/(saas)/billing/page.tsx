import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getOrCreateWorkspaceSubscription } from '@/lib/payments/subscription';
import BillingClient from '@/components/billing/BillingClient';

export const metadata = {
  title: 'Billing & Subscriptions | Closecraft',
  description: 'Manage your workspace subscription, 14-day trial, and Bachs payments.',
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) redirect('/login');

  const member = await db.organizationMember.findFirst({
    where: { userId: session.user.id, organizationId },
    select: { role: true }
  });

  const isOwnerOrAdmin = member?.role === 'OWNER' || member?.role === 'ADMIN';

  // Fetch or initialize subscription
  const sub = await getOrCreateWorkspaceSubscription(organizationId);

  // Fetch invoices for this organization
  const invoices = await db.bachsInvoice.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <BillingClient
      subscription={sub}
      invoices={invoices as any}
      isOwnerOrAdmin={isOwnerOrAdmin}
    />
  );
}
