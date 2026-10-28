import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import OnboardingWizardClient from '@/components/onboarding/OnboardingWizardClient';

export const metadata = {
  title: 'Workspace Onboarding & Qualification | Closecraft',
  description: 'Personalise your Closecraft setup, assess enquiry volume, and explore remote sales support.',
};

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const organizationId = (session as any).organizationId;
  if (!organizationId) redirect('/login');

  // Enforce email verification
  if (!(session.user as any)?.emailVerified) {
    // Check database to ensure fresh state
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    });
    if (!dbUser?.emailVerified) {
      redirect('/verify-email');
    }
  }

  // Check member role: invited members enter their existing workspace directly
  const member = await db.organizationMember.findFirst({
    where: { userId: session.user.id, organizationId },
    select: { role: true },
  });

  if (member?.role === 'EXTERNAL_PROFESSIONAL') {
    redirect('/rep');
  }

  const isOwnerOrAdmin = member?.role === 'OWNER' || member?.role === 'ADMIN';
  if (!isOwnerOrAdmin) {
    redirect('/today');
  }

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true },
  });
  if (!org) redirect('/login');

  // Fetch latest qualification if resuming
  const latestQualification = await db.workspaceQualification.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex-1 w-full py-6">
      <OnboardingWizardClient
        initialQualification={latestQualification ? JSON.parse(JSON.stringify(latestQualification)) : null}
        organizationName={org.name}
      />
    </div>
  );
}
