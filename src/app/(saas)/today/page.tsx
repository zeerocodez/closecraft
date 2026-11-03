import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getTodayViewData } from '@/lib/dal/lead';
import TodayViewClient from '@/components/today/TodayViewClient';

export const metadata = {
  title: 'Today | Closecraft',
  description: 'Know who is following up. Overdue tasks, tasks due today, and scheduled sales actions.',
};

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) redirect('/login');

  const member = await db.organizationMember.findFirst({
    where: { userId: session.user.id, organizationId },
    select: { role: true }
  });

  const userRole = member?.role || 'MEMBER';

  if (userRole === 'EXTERNAL_PROFESSIONAL') {
    redirect('/rep');
  }

  // Enforce email verification
  if (!(session.user as any)?.emailVerified) {
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    });
    if (!dbUser?.emailVerified) {
      redirect('/verify-email');
    }
  }

  // Fetch qualification state if exists (optional profile update for established users)
  const latestQualification = await db.workspaceQualification.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' }
  });

  // Automated onboarding for business owners:
  // If owner/admin has neither completed nor explicitly skipped qualification, guide them to /onboarding
  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN';
  if (isOwnerOrAdmin) {
    if (!latestQualification || latestQualification.status === 'DRAFT') {
      redirect('/onboarding');
    }
  }

  // Fetch today view data with strict tenant and role isolation
  const [todayData, org, unrespondedCount, pilot, serviceReq] = await Promise.all([
    getTodayViewData(organizationId, session.user.id, userRole),
    db.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, whatsappNumber: true }
    }),
    db.lead.count({
      where: { organizationId, status: 'NEW' }
    }),
    db.pilotEngagement.findFirst({
      where: { organizationId, status: { in: ['ACTIVE', 'ONBOARDING', 'DRAFT', 'ACCEPTED'] } },
      orderBy: { createdAt: 'desc' }
    }),
    db.serviceRequest.findFirst({
      where: { organizationId, stage: { notIn: ['WITHDRAWN', 'NOT_SUITABLE'] } },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  // Construct active engagement details if present
  let activeEngagement: any = null;
  let campaignMetrics: any = null;
  let launchChecklist: any = null;

  if (pilot) {
    const isLeadGen = pilot.serviceType === 'MANAGED_LEAD_GENERATION';
    activeEngagement = {
      id: pilot.id,
      title: isLeadGen ? 'Managed Facebook & Instagram Lead Generation' : pilot.title || 'Managed Sales Pilot',
      serviceType: pilot.serviceType,
      stage: isLeadGen ? 'Campaign creative review' : pilot.status,
      nextAction: isLeadGen ? 'Review and approve campaign ad creative' : 'Review weekly follow-up metrics',
      responsibleParty: isLeadGen ? 'Client Reviewer & Closecraft Campaign Manager' : 'Assigned Sales Professional',
      outcomeAfterward: isLeadGen ? 'Campaign goes live on Facebook & Instagram upon approval' : 'Qualified opportunities progressed to closing',
      status: pilot.status,
    };

    if (pilot.campaignMetrics) {
      try {
        campaignMetrics = JSON.parse(pilot.campaignMetrics);
      } catch {
        campaignMetrics = null;
      }
    }

    if (pilot.onboardingChecklist) {
      try {
        launchChecklist = JSON.parse(pilot.onboardingChecklist);
      } catch {
        launchChecklist = null;
      }
    } else if (isLeadGen) {
      launchChecklist = [
        { id: 'm1', title: 'Campaign brief approved', completed: true },
        { id: 'm2', title: 'Ad account and page access granted', completed: true },
        { id: 'm3', title: 'Ad creative and copy approved', completed: false, isCurrent: true },
        { id: 'm4', title: 'Lead form configured', completed: false },
        { id: 'm5', title: 'Webhook/Closecraft integration tested', completed: false },
        { id: 'm6', title: 'Response SLA and team assigned', completed: false },
        { id: 'm7', title: 'Campaign published', completed: false },
        { id: 'm8', title: 'First weekly review completed', completed: false },
      ];
    }
  } else if (serviceReq) {
    const isLeadGen = serviceReq.serviceType === 'LEAD_GENERATION';
    activeEngagement = {
      id: serviceReq.id,
      title: isLeadGen ? 'Managed Facebook & Instagram Lead Generation' : serviceReq.serviceType.replace(/_/g, ' '),
      serviceType: serviceReq.serviceType,
      stage: serviceReq.stage,
      nextAction: serviceReq.nextAction || (isLeadGen ? 'Review campaign proposal' : 'Schedule Discovery Call'),
      responsibleParty: 'Closecraft Strategy Team',
      outcomeAfterward: 'Pilot onboarding and campaign setup',
      status: serviceReq.stage,
      reference: serviceReq.reference,
    };

    if (isLeadGen) {
      launchChecklist = [
        { id: 'm1', title: 'Campaign brief approved', completed: serviceReq.stage !== 'NEW' },
        { id: 'm2', title: 'Ad account and page access granted', completed: false },
        { id: 'm3', title: 'Ad creative and copy approved', completed: false },
        { id: 'm4', title: 'Lead form configured', completed: false },
        { id: 'm5', title: 'Webhook/Closecraft integration tested', completed: false },
        { id: 'm6', title: 'Response SLA and team assigned', completed: false },
        { id: 'm7', title: 'Campaign published', completed: false },
        { id: 'm8', title: 'First weekly review completed', completed: false },
      ];
    }
  }

  // Fetch team members for assignment
  const teamMembers = await db.organizationMember.findMany({
    where: { organizationId },
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  });

  const formattedMembers = teamMembers.map((m) => ({
    id: m.userId,
    name: m.user?.name || m.user?.email || 'Team Member',
    role: m.role,
  }));

  return (
    <TodayViewClient
      data={todayData}
      currentUserId={session.user.id}
      userRole={userRole}
      teamMembers={formattedMembers}
      qualification={latestQualification as any}
      organizationName={org?.name || 'CloseCraft'}
      organizationWhatsApp={org?.whatsappNumber || null}
      unrespondedEnquiriesCount={unrespondedCount}
      activeEngagement={activeEngagement}
      campaignMetrics={campaignMetrics}
      launchChecklist={launchChecklist}
    />
  );
}
