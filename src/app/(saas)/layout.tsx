import React from 'react';
import Link from 'next/link';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import EvaluatorBanner from '@/components/layout/EvaluatorBanner';
import { getOrCreateWorkspaceSubscription } from '@/lib/payments/subscription';

export default async function SaasLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = session.organizationId;
  if (!organizationId) {
    redirect("/login");
  }

  // Server-authoritative approval check + membership + cached subscription lookup in parallel
  const [org, member, subscription] = await Promise.all([
    db.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, status: true, slug: true }
    }),
    db.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId },
      select: { role: true }
    }),
    getOrCreateWorkspaceSubscription(organizationId).catch((subErr) => {
      console.error('[SaasLayout] Subscription lookup fallback:', subErr);
      return null;
    }),
  ]);

  if (!org || org.status !== 'APPROVED') {
    redirect('/pending-approval');
  }

  const userWithRole = {
    ...session.user,
    role: member?.role || 'MEMBER',
    organizationName: org.name
  };

  return (
    <AppShell user={userWithRole}>
      {org.slug === 'apex-demo' && (
        <EvaluatorBanner
          currentUserEmail={session.user.email ?? undefined}
          currentUserName={session.user.name ?? undefined}
          currentUserRole={member?.role ?? undefined}
        />
      )}

      {subscription?.status === 'TRIALING' && subscription.trialHoursLeft <= 72 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-[20px] shrink-0">timer</span>
            <div>
              <p className="font-bold text-white text-xs">
                Starter Trial Ending Soon: {subscription.trialHoursLeft} hours remaining
              </p>
              <p className="text-amber-300/80 text-[11px] mt-0.5">
                Upgrade now to maintain active lead SLA monitoring, automated reminders, and multi-channel webhook routing.
              </p>
            </div>
          </div>
          <Link
            href="/billing"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 shadow-sm"
          >
            <span>Upgrade Plan</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      )}

      {subscription?.status === 'EXPIRED' && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-red-400 text-[20px] shrink-0">warning</span>
            <div>
              <p className="font-bold text-white text-xs">
                Your 7-Day Free Trial Has Ended
              </p>
              <p className="text-red-300/80 text-[11px] mt-0.5">
                Choose a plan to resume active lead SLA processing and automated outbound actions. Your account data remains preserved.
              </p>
            </div>
          </div>
          <Link
            href="/billing"
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 shadow-sm"
          >
            <span>Choose Plan</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      )}

      {children}
    </AppShell>
  );
}
