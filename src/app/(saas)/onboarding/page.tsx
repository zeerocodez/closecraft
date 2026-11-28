import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import OnboardingWizardClient from '@/components/onboarding/OnboardingWizardClient';
import ActivationFirstSteps from '@/components/onboarding/ActivationFirstSteps';

export const metadata = {
  title: 'Set Up Your Workspace | CloseCraft HQ',
  description: 'Connect WhatsApp and Meta Lead Ads so every enquiry from your ads lands in one place, then tell us about your business.',
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
    select: { id: true, name: true, whatsappPhoneNumberId: true, whatsappAccessToken: true },
  });
  if (!org) redirect('/login');

  // Activation state, shown above the qualification questions: channel
  // definitions mirror the Settings page exactly.
  const [metaIntegration, leadCount] = await Promise.all([
    db.metaIntegration.findUnique({
      where: { organizationId },
      select: { status: true },
    }),
    db.lead.count({ where: { organizationId } }),
  ]);
  const whatsappConnected = Boolean(org.whatsappPhoneNumberId && org.whatsappAccessToken);
  const metaConnected = metaIntegration?.status === 'CONNECTED';

  // Fetch latest qualification if resuming
  const latestQualification = await db.workspaceQualification.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex-1 w-full py-6">
      <ActivationFirstSteps
        whatsappConnected={whatsappConnected}
        metaConnected={metaConnected}
        leadCount={leadCount}
      />
      <OnboardingWizardClient
        initialQualification={latestQualification ? JSON.parse(JSON.stringify(latestQualification)) : null}
        organizationName={org.name}
      />
    </div>
  );
}
