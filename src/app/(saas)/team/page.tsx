import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import TeamPageClient from './TeamPageClient';

export default async function TeamPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = session.organizationId;
  if (!organizationId) {
    redirect('/login');
  }

  // Fetch tenant organization
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      leadRoutingMode: true,
    }
  });

  if (!organization) {
    redirect('/login');
  }

  // Fetch all members of this tenant with their commission and google calendar settings
  const members = await db.organizationMember.findMany({
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
  });

  // Fetch leads for this tenant to compute workflow distributions
  const leads = await db.lead.findMany({
    where: { organizationId },
    select: {
      id: true,
      assignedUserId: true,
      status: true,
    }
  });

  // Fetch deals for this tenant to compute closed deals and commission totals
  const deals = await db.deal.findMany({
    where: { organizationId },
    select: {
      id: true,
      amount: true,
      stage: true,
      closerId: true,
      commissionAmount: true,
      commissionStatus: true,
    }
  });

  // Fetch appointments to compute rep schedule load
  const appointments = await db.appointment.findMany({
    where: { organizationId },
    select: {
      id: true,
      closerId: true,
      status: true,
      scheduledAt: true,
    }
  });

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
