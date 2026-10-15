import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';

export default async function SaasLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = session.organizationId;
  if (!organizationId) {
    redirect("/login");
  }

  // Server-authoritative approval check: only approved organizations can access the SaaS
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, status: true }
  });

  if (!org || org.status !== 'APPROVED') {
    redirect('/pending-approval');
  }

  const member = await db.organizationMember.findFirst({
    where: { userId: session.user.id, organizationId },
    select: { role: true }
  });

  const userWithRole = {
    ...session.user,
    role: member?.role || 'MEMBER',
    organizationName: org.name
  };

  return (
    <AppShell user={userWithRole}>
      {children}
    </AppShell>
  );
}
