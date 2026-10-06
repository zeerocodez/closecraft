import React from 'react';
import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

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
    <div className="flex h-screen bg-surface font-body-md text-on-surface antialiased overflow-hidden relative">
      {/* Premium glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary/20 blur-[100px] pointer-events-none z-0"></div>
      
      <Sidebar user={session.user} />
      <div className="pl-64 flex-1 flex flex-col relative w-full bg-transparent overflow-hidden z-10">
        {children}
      </div>
    </div>
  );
}
