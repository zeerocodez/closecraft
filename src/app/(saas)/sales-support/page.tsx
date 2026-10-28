import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import SalesSupportClient from '@/components/pilot/SalesSupportClient';

export const metadata = {
  title: 'Sales Support | Closecraft',
  description: 'Manage sales support requests, readiness reviews, scoped pilot proposals, and active engagements.',
};

export default async function SalesSupportPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) redirect('/login');

  const member = await db.organizationMember.findFirst({
    where: { userId: session.user.id, organizationId },
    select: { role: true }
  });

  const isOwnerOrAdmin = member?.role === 'OWNER' || member?.role === 'ADMIN';

  // Fetch latest support request
  const request = await db.salesSupportRequest.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    include: {
      assessment: {
        include: { checklist: true }
      }
    }
  });

  // Fetch active or latest engagement
  const engagement = await db.pilotEngagement.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    include: {
      professional: true,
      workLogs: { orderBy: { date: 'desc' } },
      blockers: { orderBy: { createdAt: 'desc' } },
      handovers: { orderBy: { createdAt: 'desc' } }
    }
  });

  return (
    <SalesSupportClient
      request={request as any}
      engagement={engagement as any}
      isOwnerOrAdmin={isOwnerOrAdmin}
    />
  );
}
