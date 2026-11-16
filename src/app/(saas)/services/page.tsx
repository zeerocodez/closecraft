import React, { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { getServiceCatalogue } from '@/lib/services/catalogue';
import ServicesClient from './ServicesClient';

export const metadata = {
  title: 'Services & Growth Operations | Closecraft',
  description: 'Browse CloseCraft growth services, manage active deliverables, review proposals, and submit project briefs.',
};

export default async function ServicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const organizationId = (session as any).organizationId;
  if (!organizationId) redirect('/login');

  // Fetch available self-service catalogue
  const packages = await getServiceCatalogue();

  // Fetch organization's active subscriptions/client services
  const clientServices = await db.clientService.findMany({
    where: { organizationId },
    include: {
      servicePackage: true,
      deliveryTasks: {
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch organization's custom growth project requests
  const projectRequests = await db.projectRequest.findMany({
    where: { organizationId },
    include: {
      brief: true,
      assignedPartner: {
        select: {
          id: true,
          fullName: true,
          bio: true,
        },
      },
      proposals: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          proposalNumber: true,
          totalAmount: true,
          currency: true,
          status: true,
        },
      },
      projectInvoices: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          invoiceNumber: true,
          totalAmount: true,
          currency: true,
          status: true,
          bachsCheckoutUrl: true,
        },
      },
      milestones: {
        orderBy: { sequenceOrder: 'asc' },
        select: {
          id: true,
          title: true,
          status: true,
          sequenceOrder: true,
          clientApproved: true,
          proofUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch organization details
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, plan: true },
  });

  return (
    <div className="w-full h-full pb-16">
      <Suspense
        fallback={
          <div className="p-12 text-center text-on-surface-variant text-sm">
            Loading services and projects...
          </div>
        }
      >
        <ServicesClient
          packages={packages}
          clientServices={clientServices.map((s: any) => ({
            ...s,
            deliverables:
              typeof s.deliverables === 'string'
                ? JSON.parse(s.deliverables || '[]')
                : s.deliverables || [],
            createdAt: s.createdAt.toISOString(),
            updatedAt: s.updatedAt.toISOString(),
            startDate: s.startDate ? s.startDate.toISOString() : null,
            paidThroughDate: s.paidThroughDate ? s.paidThroughDate.toISOString() : null,
          }))}
          projectRequests={projectRequests.map((p: any) => ({
            id: p.id,
            reference: p.reference,
            status: p.status,
            services: p.services,
            whatsappThreadUrl: p.whatsappThreadUrl,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
            brief: p.brief
              ? {
                  businessName: p.brief.businessName,
                  industry: p.brief.industry,
                  primaryGoal: p.brief.primaryGoal,
                  urgency: p.brief.urgency,
                }
              : null,
            assignedPartner: p.assignedPartner
              ? {
                  id: p.assignedPartner.id,
                  fullName: p.assignedPartner.fullName,
                  bio: p.assignedPartner.bio,
                  rating: 5.0,
                  completedProjectsCount: 12,
                }
              : null,
            latestProposal: p.proposals?.[0] || null,
            latestInvoice: p.projectInvoices?.[0] || null,
            milestones: p.milestones || [],
          }))}
          organizationName={org?.name || 'Your Workspace'}
        />
      </Suspense>
    </div>
  );
}
