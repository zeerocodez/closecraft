import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import GuideManager from '@/components/admin/GuideManager';

export default async function AdminGuidePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Same gate as the Command Center: strict SUPER_ADMIN or OPERATOR
  // authorization (never a tenant workspace ADMIN).
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  const isSuperAdmin = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'OPERATOR';

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">lock</span>
        </div>
        <h1 className="text-xl font-bold text-on-surface mb-2">Access Restricted</h1>
        <p className="text-sm text-on-surface-variant max-w-md mb-6">
          Superadmin platform privileges are required to manage the Loop guide.
        </p>
        <a
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
      <Link href="/admin" className="text-sm font-semibold text-brand-teal underline underline-offset-2">
        ← Back to Command Center
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-brand-ink">Loop guide</h1>
      <p className="mt-1 text-sm text-gray-600">
        The answers Loop, the helper on every page, gives visitors — and the questions it could not answer yet.
      </p>
      <div className="mt-6">
        <GuideManager />
      </div>
    </div>
  );
}
