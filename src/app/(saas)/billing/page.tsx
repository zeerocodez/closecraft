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

  // Fetch or initialize 14-day trial workspace subscription
  const sub = await getOrCreateWorkspaceSubscription(organizationId);

  // Ensure active approved invoice exists (base one-time NGN 15,000 workspace invoice)
  let activeInvoice = await db.bachsInvoice.findFirst({
    where: {
      organizationId,
      status: { in: ['APPROVED', 'ISSUED'] },
      type: 'WORKSPACE_INVOICE',
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!activeInvoice) {
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    activeInvoice = await db.bachsInvoice.create({
      data: {
        organizationId,
        invoiceNumber,
        type: 'WORKSPACE_INVOICE',
        amount: 15000.0,
        currency: 'NGN',
        status: 'APPROVED',
        customerEmail: session.user.email || null,
        customerName: session.user.name || null,
        metadata: JSON.stringify({
          description: 'One-time NGN 15,000 Workspace Invoice (30 Days)',
          plan: 'STARTER',
        }),
      }
    });
  }

  // Fetch invoices for this organization
  const invoices = await db.bachsInvoice.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <BillingClient
      subscription={sub}
      invoices={invoices as any}
      activeInvoice={activeInvoice as any}
      isOwnerOrAdmin={isOwnerOrAdmin}
    />
  );
}
