import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import ServiceAssessmentRequestClient from '@/components/services/ServiceAssessmentRequestClient';

export const metadata = {
  title: 'Request Support & Assessment | Closecraft',
  description: 'Evaluate commercial suitability for sales execution, team training, or dedicated appointment setters and closers.',
};

export default async function RequestSupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const organizationId = (session as any)?.organizationId;
  if (!organizationId) redirect('/login');

  const member = await db.organizationMember.findFirst({
    where: { userId: session.user.id, organizationId },
    select: { role: true }
  });

  const isAuthorized = member?.role === 'OWNER' || member?.role === 'ADMIN' || member?.role === 'MANAGER' || (session.user as any)?.role === 'SUPER_ADMIN';
  if (!isAuthorized) {
    redirect('/sales-support');
  }

  const organization = await db.organization.findUnique({
    where: { id: organizationId },
    select: { name: true }
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <ServiceAssessmentRequestClient
        organizationName={organization?.name || 'Your Workspace'}
        userEmail={session.user.email || ''}
      />
    </div>
  );
}
