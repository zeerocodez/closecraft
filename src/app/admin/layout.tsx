import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  // Basic admin check (could be expanded)
  if (!session?.user || session.user.email !== 'admin@zeerocodes.com') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="bg-surface-container-low border-b border-outline-variant p-4 flex justify-between items-center">
        <Link href="/admin" className="font-bold text-xl text-primary">Admin Control</Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-on-surface hover:text-primary transition-colors">Back to Dashboard</Link>
          <span className="text-on-surface-variant text-sm">Logged in as {session.user.email}</span>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
