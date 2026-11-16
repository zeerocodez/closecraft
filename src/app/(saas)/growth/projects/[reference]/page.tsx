import React from 'react';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import GrowthProjectDetailClient from '@/components/growth/GrowthProjectDetailClient';
import { MilestoneItem } from '@/components/growth/GrowthMilestonesTracker';

export const metadata = {
  title: 'Project Growth Hub | Closecraft',
  description: 'Track your custom growth services project, review proposals, sign off on deliverables, and view receipts.',
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { reference } = await params;

  const project: any = await db.projectRequest.findUnique({
    where: { reference },
    include: {
      brief: true,
      assignedPartner: {
        select: {
          id: true,
          userId: true,
          fullName: true,
          bio: true,
          experienceSummary: true,
        },
      },
      proposals: {
        orderBy: { createdAt: 'desc' },
        include: {
          lineItems: {
            orderBy: { sortOrder: 'asc' },
          },
          projectInvoice: true,
        },
      },
      projectInvoices: {
        orderBy: { createdAt: 'desc' },
      },
      milestones: {
        orderBy: { sequenceOrder: 'asc' },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Tenant Isolation Enforcement:
  // User must belong to the requesting Organization, OR be the assigned partner, OR be platform staff
  const userOrgId = (session.user as any).organizationId;
  const userRole = (session.user as any).role;
  const isPlatformStaff = ['OPERATOR', 'SUPER_ADMIN', 'ADMIN'].includes(userRole);
  const isOwnerOrg = userOrgId && userOrgId === project.organizationId;
  const isAssignedPartner = project.assignedPartner?.userId === session.user.id;

  if (!isPlatformStaff && !isOwnerOrg && !isAssignedPartner) {
    redirect('/today');
  }

  // Map to client-safe props
  const serializedProject = {
    id: project.id,
    reference: project.reference,
    status: project.status,
    services: project.services,
    whatsappThreadUrl: project.whatsappThreadUrl,
    consultationNotes: project.consultationNotes,
    consultedAt: project.consultedAt ? project.consultedAt.toISOString() : null,
    createdAt: project.createdAt.toISOString(),
    brief: project.brief
      ? {
          businessName: project.brief.businessName,
          industry: project.brief.industry,
          businessOverview: project.brief.businessOverview,
          primaryGoal: project.brief.primaryGoal,
          targetAudience: project.brief.targetAudience,
          promotedProducts: project.brief.promotedProducts,
          urgency: project.brief.urgency,
          targetLaunchDate: project.brief.targetLaunchDate
            ? project.brief.targetLaunchDate.toISOString()
            : null,
        }
      : null,
    assignedPartner: project.assignedPartner
      ? {
          id: project.assignedPartner.id,
          fullName: project.assignedPartner.fullName,
          title: 'CloseCraft Growth Specialist',
          bio: project.assignedPartner.bio,
          avatarUrl: null,
          rating: 4.95,
          completedProjectsCount: 16,
        }
      : null,
    proposals: project.proposals.map((prop: any) => ({
      id: prop.id,
      proposalNumber: prop.proposalNumber,
      title: prop.title,
      scopeSummary: prop.scopeSummary,
      totalAmount: Number(prop.totalAmount),
      currency: prop.currency,
      status: prop.status,
      estimatedDays: prop.estimatedDays,
      validUntil: prop.validUntil.toISOString(),
      lineItems: prop.lineItems.map((li: any) => ({
        id: li.id,
        serviceType: li.serviceType,
        title: li.title,
        description: li.description,
        quantity: li.quantity,
        unitPrice: Number(li.unitPrice),
        totalPrice: Number(li.totalPrice),
        deliverables: li.deliverables,
      })),
      projectInvoice: prop.projectInvoice
        ? {
            id: prop.projectInvoice.id,
            invoiceNumber: prop.projectInvoice.invoiceNumber,
            status: prop.projectInvoice.status,
            bachsCheckoutUrl: prop.projectInvoice.bachsCheckoutUrl,
          }
        : null,
    })),
    projectInvoices: project.projectInvoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      totalAmount: Number(inv.totalAmount),
      currency: inv.currency,
      status: inv.status,
      paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
      bachsCheckoutId: inv.bachsCheckoutId,
      bachsCheckoutUrl: inv.bachsCheckoutUrl,
      updatedAt: inv.updatedAt.toISOString(),
    })),
    milestones: project.milestones.map((ms: any) => ({
      id: ms.id,
      serviceType: ms.serviceType,
      title: ms.title,
      description: ms.description,
      sequenceOrder: ms.sequenceOrder,
      status: ms.status as any,
      proofUrl: ms.proofUrl,
      reviewNotes: ms.reviewNotes,
      clientApproved: ms.clientApproved,
      clientFeedback: ms.clientFeedback,
      completedAt: ms.completedAt ? ms.completedAt.toISOString() : null,
    })),
  };

  return <GrowthProjectDetailClient project={serializedProject} />;
}
