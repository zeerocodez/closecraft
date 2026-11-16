import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { getOrCreateWorkspaceSubscription } from '@/lib/payments/subscription';
import TeamPageClient from './TeamPageClient';

export const metadata = {
  title: 'Team Management & User Roles | Closecraft',
  description: 'Manage your sales closers, appointment setters, lead routing, and team seat capacity.',
};

export default async function TeamPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = (session as any)?.organizationId;
  if (!organizationId) {
    redirect('/login');
  }

  // Fetch tenant organization, subscription, members, leads, deals, appointments
  const [organization, subscription, members, leads, deals, appointments] = await Promise.all([
    db.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        leadRoutingMode: true,
      }
    }),
    getOrCreateWorkspaceSubscription(organizationId),
    db.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    }),
    db.lead.findMany({
      where: { organizationId },
      select: {
        id: true,
        assignedUserId: true,
        status: true,
      }
    }),
    db.deal.findMany({
      where: { organizationId },
      select: {
        id: true,
        amount: true,
        stage: true,
        closerId: true,
        commissionAmount: true,
        commissionStatus: true,
      }
    }),
    db.appointment.findMany({
      where: { organizationId },
      select: {
        id: true,
        closerId: true,
        status: true,
        scheduledAt: true,
      }
    })
  ]);

  if (!organization) {
    redirect('/login');
  }

  const memberLeadCounts: Record<string, number> = {};
  let totalAssignedLeads = 0;
  let totalUnassignedLeads = 0;

  leads.forEach((l) => {
    if (l.assignedUserId) {
      totalAssignedLeads++;
      memberLeadCounts[l.assignedUserId] = (memberLeadCounts[l.assignedUserId] || 0) + 1;
    } else {
      totalUnassignedLeads++;
    }
  });

  const memberStats: Record<string, { wonCount: number; wonVolume: number; totalCommission: number; activeAppointments: number }> = {};
  deals.forEach((d) => {
    if (d.closerId) {
      if (!memberStats[d.closerId]) {
        memberStats[d.closerId] = { wonCount: 0, wonVolume: 0, totalCommission: 0, activeAppointments: 0 };
      }
      if (d.stage === 'WON') {
        memberStats[d.closerId].wonCount += 1;
        memberStats[d.closerId].wonVolume += d.amount;
        memberStats[d.closerId].totalCommission += (d.commissionAmount || 0);
      }
    }
  });

  appointments.forEach((a) => {
    if (a.closerId) {
      if (!memberStats[a.closerId]) {
        memberStats[a.closerId] = { wonCount: 0, wonVolume: 0, totalCommission: 0, activeAppointments: 0 };
      }
      if (a.status === 'SCHEDULED' || a.status === 'CONFIRMED') {
        memberStats[a.closerId].activeAppointments += 1;
      }
    }
  });

  const totalClosers = members.filter(m => m.role === 'CLOSER').length;
  const totalSetters = members.filter(m => m.role === 'SETTER').length;

  const currentMember = members.find(m => m.user.id === session.user.id);
  const currentUserRole = currentMember?.role || (session.user as any)?.role || 'MEMBER';

  return (
    <TeamPageClient
      organization={organization}
      members={members}
      subscription={subscription}
      stats={{
        totalClosers,
        totalSetters,
        totalAssignedLeads,
        totalUnassignedLeads,
        memberLeadCounts,
        memberStats,
      }}
      currentUserRole={currentUserRole}
    />
  );
}
