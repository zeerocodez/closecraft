import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import TraineeNavClient from './TraineeNavClient';

export default async function TraineeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Check if user is a dual-role member of an active business organization
  const businessMembership = await db.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true }
  });

  return (
    <TraineeNavClient 
      user={{
        name: session.user.name,
        email: session.user.email,
        id: session.user.id
      }}
      businessMembership={businessMembership ? {
        organization: {
          id: businessMembership.organization.id,
          name: businessMembership.organization.name
        }
      } : null}
    >
      {children}
    </TraineeNavClient>
  );
}
