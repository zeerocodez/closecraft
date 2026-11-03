import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import TeamTrainingClient from '@/components/team/TeamTrainingClient';

export const metadata = {
  title: 'Team Sales Training | Closecraft',
  description: 'Manage sales team capability sprints, tailored objection training, and manager oversight.',
};

export default async function TeamTrainingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const organizationId = (session as any)?.organizationId;
  if (!organizationId) redirect('/login');

  const member = await db.organizationMember.findFirst({
    where: { userId: session.user.id, organizationId },
    select: { role: true }
  });

  const isManagerOrOwner = member?.role === 'OWNER' || member?.role === 'ADMIN' || member?.role === 'MANAGER' || (session.user as any)?.role === 'SUPER_ADMIN';

  const organization = await db.organization.findUnique({
    where: { id: organizationId },
    select: { name: true }
  });

  // Fetch team participants (members with internal roles)
  const teamMembers = await db.organizationMember.findMany({
    where: {
      organizationId,
      role: { in: ['MEMBER', 'SETTER', 'CLOSER', 'MANAGER', 'ADMIN'] }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  // For each member, query their completed practice sessions
  const memberUserIds = teamMembers.map(m => m.user.id);
  const practiceCounts = await db.practiceSession.groupBy({
    by: ['userId'],
    where: {
      userId: { in: memberUserIds },
      status: 'COMPLETED'
    },
    _count: {
      id: true
    }
  });

  const practiceCountMap: Record<string, number> = {};
  practiceCounts.forEach(pc => {
    practiceCountMap[pc.userId] = pc._count.id;
  });

  const participants = teamMembers.map(m => ({
    id: m.id,
    name: m.user.name || m.user.email,
    email: m.user.email,
    role: m.role,
    status: m.isAvailable ? 'Active' : 'Paused',
    joinedAt: m.createdAt.toISOString(),
    practiceConversationsCount: practiceCountMap[m.user.id] || 0,
  }));

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <TeamTrainingClient
        organizationName={organization?.name || 'Your Workspace'}
        userEmail={session.user.email || ''}
        isManagerOrOwner={Boolean(isManagerOrOwner)}
        participants={participants}
      />
    </div>
  );
}
