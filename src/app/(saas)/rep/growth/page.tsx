import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import PartnerGrowthHubClient from '@/components/growth/PartnerGrowthHubClient';

export const metadata = {
  title: 'Partner Growth Hub | Closecraft',
  description: 'Manage assigned client growth projects, WhatsApp consultations, proposals, and delivery milestones.',
};

export default async function PartnerGrowthPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userRole = (session.user as any).role;
  const isOperator = ['OPERATOR', 'SUPER_ADMIN', 'ADMIN'].includes(userRole);

  const proProfile = await db.professionalProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!isOperator && !proProfile) {
    redirect('/today');
  }

  let whereClause: any = {};
  if (!isOperator && proProfile) {
    whereClause.assignedPartnerId = proProfile.id;
  }

  const projects = await db.projectRequest.findMany({
    where: whereClause,
    include: {
      brief: true,
      proposals: {
        orderBy: { createdAt: 'desc' },
      },
      milestones: {
        orderBy: { sequenceOrder: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedProjects = projects.map((p) => ({
    id: p.id,
    reference: p.reference,
    status: p.status,
    services: p.services,
    whatsappThreadUrl: p.whatsappThreadUrl,
    consultationNotes: p.consultationNotes,
    consultedAt: p.consultedAt ? p.consultedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    brief: p.brief
      ? {
          businessName: p.brief.businessName,
          industry: p.brief.industry,
          primaryGoal: p.brief.primaryGoal,
          targetAudience: p.brief.targetAudience,
          promotedProducts: p.brief.promotedProducts,
          urgency: p.brief.urgency,
        }
      : null,
    proposals: p.proposals.map((prop) => ({
      id: prop.id,
      proposalNumber: prop.proposalNumber,
      title: prop.title,
      totalAmount: Number(prop.totalAmount),
      currency: prop.currency,
      status: prop.status,
      createdAt: prop.createdAt.toISOString(),
    })),
    milestones: p.milestones.map((ms) => ({
      id: ms.id,
      serviceType: ms.serviceType,
      title: ms.title,
      status: ms.status,
      sequenceOrder: ms.sequenceOrder,
      proofUrl: ms.proofUrl,
      reviewNotes: ms.reviewNotes,
    })),
  }));

  return (
    <PartnerGrowthHubClient
      projects={serializedProjects}
      partnerName={proProfile?.fullName || session.user.name || 'Partner Professional'}
    />
  );
}

