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
  const todayData = await getTodayViewData(organizationId, session.user.id, userRole);

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
    />
  );
}
