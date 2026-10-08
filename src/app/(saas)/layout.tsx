import React from 'react';
import { auth } from "@/lib/auth";
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

  return (
    <AppShell user={session.user}>
      {children}
    </AppShell>
  );
}
