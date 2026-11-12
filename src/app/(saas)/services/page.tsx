import React, { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { getServiceCatalogue } from '@/lib/services/catalogue';
import ServicesClient from './ServicesClient';

export const metadata = {
  title: 'Services & Marketplace | Closecraft',
  description: 'Browse CloseCraft sales growth services, manage active deliverables, and upgrade your revenue system.',
};

export default async function ServicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const organizationId = (session as any).organizationId;
  if (!organizationId) redirect('/login');

  // Fetch available service catalogue
  const packages = await getServiceCatalogue();

  // Fetch organization's active services
  const clientServices = await db.clientService.findMany({
    where: { organizationId },
    include: {
      servicePackage: true,
      deliveryTasks: {
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      },
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch organization details for currency & contact
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, plan: true }
  });

  return (
    <div className="w-full h-full pb-12">
      <Suspense fallback={<div className="p-8 text-center text-on-surface-variant text-sm">Loading services marketplace...</div>}>
        <ServicesClient 
          packages={packages}
          clientServices={clientServices.map((s: any) => ({
            ...s,
            deliverables: typeof s.deliverables === 'string' ? JSON.parse(s.deliverables || '[]') : (s.deliverables || []),
            createdAt: s.createdAt.toISOString(),
            updatedAt: s.updatedAt.toISOString(),
            startDate: s.startDate ? s.startDate.toISOString() : null,
            paidThroughDate: s.paidThroughDate ? s.paidThroughDate.toISOString() : null,
          }))}
          organizationName={org?.name || 'Your Workspace'}
        />
      </Suspense>
    </div>
  );
}
