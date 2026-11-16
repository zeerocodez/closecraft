import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { getDealsForTenant } from '@/lib/dal/deal';
import PipelineClient from './PipelineClient';

export const metadata = {
  title: 'Sales Pipeline | Closecraft HQ',
  description: 'Manage sales stages, track stalled deals, and move opportunities to closed-won revenue.',
};

export default async function PipelinePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = session.organizationId;
  if (!organizationId) {
    redirect('/login');
  }

  // Fetch deals via DAL with tenant isolation
  const deals = await getDealsForTenant(organizationId as string);

  const availableLeads = await db.lead.findMany({
    where: { organizationId },
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <PipelineClient
      deals={deals.map((d: any) => ({
        id: d.id,
        title: d.title,
        amount: d.amount,
        stage: d.stage,
        currency: d.currency,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
        closer: d.closer
          ? {
              id: d.closer.id,
              name: d.closer.name,
              email: d.closer.email,
            }
          : null,
        lead: {
          id: d.lead.id,
          name: d.lead.name,
          email: d.lead.email,
          phone: d.lead.phone,
          buyingIntent: d.lead.buyingIntent,
          revenueActions: d.lead.revenueActions?.map((ra: any) => ({
            type: ra.type,
            recommendedActor: ra.recommendedActor,
            priority: ra.priority,
            reason: ra.reason,
          })),
        },
      }))}
      availableLeads={availableLeads}
    />
  );
}
