import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import RepDashboardClient from './RepDashboardClient';

export default async function RepDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = session.organizationId;
  const userId = session.user.id;
  if (!organizationId || !userId) {
    redirect('/login');
  }

  // Fetch caller's membership details
  const membership = await db.organizationMember.findFirst({
    where: { userId, organizationId },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true }
      },
      organization: {
        select: { id: true, name: true, slug: true }
      }
    }
  });

  if (!membership) {
    redirect('/dashboard');
  }

  // Fetch leads assigned to this rep
  const leads = await db.lead.findMany({
    where: { 
      organizationId,
      assignedUserId: userId
    },
    include: {
      deals: true,
      revenueActions: { where: { status: 'PENDING' }, orderBy: { priority: 'desc' }, take: 1 },
      revenueSignals: { where: { type: 'INTENT' }, orderBy: { createdAt: 'desc' }, take: 1 },
      appointments: { orderBy: { scheduledAt: 'asc' }, take: 1 },
      assignedUser: { select: { id: true, name: true, email: true, image: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Fetch open pool leads available to be claimed
  const openPoolLeads = await db.lead.findMany({
    where: {
      organizationId,
      assignedUserId: null
    },
    include: {
      deals: true,
      revenueActions: { where: { status: 'PENDING' }, orderBy: { priority: 'desc' }, take: 1 },
      revenueSignals: { where: { type: 'INTENT' }, orderBy: { createdAt: 'desc' }, take: 1 },
      appointments: { orderBy: { scheduledAt: 'asc' }, take: 1 },
      assignedUser: { select: { id: true, name: true, email: true, image: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch deals assigned to or owned by this rep
  const deals = await db.deal.findMany({
    where: {
      organizationId,
      OR: [
        { closerId: userId },
        { lead: { assignedUserId: userId } }
      ]
    },
    include: {
      lead: {
        select: { id: true, name: true, email: true, phone: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Fetch appointments for this rep
  const appointments = await db.appointment.findMany({
    where: {
      organizationId,
      OR: [
        { closerId: userId },
        { lead: { assignedUserId: userId } }
      ]
    },
    include: {
      lead: {
        select: { id: true, name: true, email: true, phone: true }
      }
    },
    orderBy: { scheduledAt: 'asc' }
  });

  // Also fetch all team members so rep can refer/escalate if needed
  const teamMembers = await db.organizationMember.findMany({
    where: { organizationId },
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  });

  // Compute metrics
  const activeLeadsCount = leads.filter(l => l.status !== 'CLOSED').length;
  const wonDeals = deals.filter(d => d.stage === 'WON');
  const pipelineValue = deals.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').reduce((sum, d) => sum + d.amount, 0);
  const totalCommission = wonDeals.reduce((sum, d) => sum + (d.commissionAmount || 0), 0);
  const pendingPayout = wonDeals.filter(d => d.commissionStatus === 'PENDING').reduce((sum, d) => sum + (d.commissionAmount || 0), 0);

  return (
    <RepDashboardClient
      member={membership}
      leads={leads}
      openPoolLeads={openPoolLeads}
      deals={deals}
      appointments={appointments}
      teamMembers={teamMembers}
      metrics={{
        activeLeadsCount,
        wonDealsCount: wonDeals.length,
        pipelineValue,
        totalCommission,
        pendingPayout,
      }}
    />
  );
}
