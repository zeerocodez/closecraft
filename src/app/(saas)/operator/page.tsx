import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import OperatorDashboardClient from '@/components/operator/OperatorDashboardClient';

export const metadata = {
  title: 'Operator Command Centre | Closecraft',
  description: 'Coordinate service delivery, assess readiness, draft proposals, and manage professional talent pool.',
};

export default async function OperatorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true }
  });

  const isOperator = user?.role === 'OPERATOR' || user?.role === 'SUPER_ADMIN';
  if (!isOperator) {
    redirect('/today');
  }

  // Fetch all requests
  const requests = await db.salesSupportRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      organization: { select: { id: true, name: true } },
      assessment: {
        include: { checklist: true }
      }
    }
  });

  // Fetch all pilot engagements
  const engagements = await db.pilotEngagement.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      organization: { select: { id: true, name: true } },
      professional: {
        include: {
          user: { select: { name: true, email: true } }
        }
      },
      workLogs: true,
      blockers: true
    }
  });

  // Fetch professional talent pool directory
  const professionals = await db.professionalProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      clientReadiness: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }
    }
  });

  // Fetch professional payables
  const payables = await db.professionalPayable.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      professional: {
        include: { user: { select: { name: true, email: true } } }
      },
      engagement: { select: { id: true, title: true } }
    }
  });

  // Fetch organizations for proposal drafting
  const organizations = await db.organization.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  // Fetch workspace qualification records for operator review
  const qualifications = await db.workspaceQualification.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      organization: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  // Fetch inbound service requests (REQ-LG, REQ-SW, REQ-TT, REQ-MS)
  const serviceRequests = await db.serviceRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      organization: { select: { id: true, name: true } },
    },
  });

  // Fetch Remote Workforce Staff Profiles
  const staffProfiles = await db.staffProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, role: true } },
      assignedTasks: {
        select: { id: true, status: true, priority: true, dueDate: true }
      }
    }
  });

  // Fetch Service Delivery Tasks
  const deliveryTasks = await db.serviceDeliveryTask.findMany({
    orderBy: [
      { priority: 'desc' },
      { dueDate: 'asc' },
      { createdAt: 'desc' }
    ],
    include: {
      organization: { select: { id: true, name: true } },
      clientService: { select: { id: true, name: true, category: true, tier: true, progressPercent: true } },
      assignedStaff: {
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      }
    }
  });

  // Fetch Client Services
  const clientServices = await db.clientService.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      organization: { select: { id: true, name: true } },
      servicePackage: true,
      deliveryTasks: true,
    }
  });

  // Fetch Performance Metrics
  const wonDeals = await db.deal.findMany({
    where: { stage: 'WON' },
    select: { amount: true, currency: true }
  });
  const totalClosedRevenue = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalWonDeals = wonDeals.length;
  const totalAppointments = await db.appointment.count();
  const totalLeads = await db.lead.count();
  const qualifiedLeads = await db.lead.count({
    where: { status: { in: ['QUALIFIED', 'OPPORTUNITY', 'WON'] } }
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <OperatorDashboardClient
        requests={requests as any}
        engagements={engagements as any}
        professionals={professionals as any}
        payables={payables as any}
        organizations={organizations as any}
        qualifications={qualifications as any}
        serviceRequests={serviceRequests as any}
        staffProfiles={staffProfiles as any}
        deliveryTasks={deliveryTasks as any}
        clientServices={clientServices as any}
        performanceMetrics={{
          totalWonDeals,
          totalClosedRevenue,
          totalAppointments,
          totalLeads,
          qualifiedLeads,
        }}
      />
    </div>
  );
}
