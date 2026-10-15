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

  // Fetch all members of this tenant
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

  const totalClosers = members.filter(m => m.role === 'CLOSER').length;
  const totalSetters = members.filter(m => m.role === 'SETTER').length;

  const currentMember = members.find(m => m.user.id === session.user.id);
  const currentUserRole = currentMember?.role || 'MEMBER';

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
      }}
      currentUserRole={currentUserRole}
    />
  );
}
