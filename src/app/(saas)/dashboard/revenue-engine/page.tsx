import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getRevenueActions, getDashboardMetrics } from '@/lib/revenue-engine/dashboardService';
import { ActionQueue } from '@/components/revenue-engine/ActionQueue';
import { Icon } from '@/components/ui/Icon';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ImportLeadsModal } from '@/app/(saas)/leads/ImportLeadsModal';
import { AddLeadModal } from '@/app/(saas)/leads/AddLeadModal';
import { QualificationPolicyModal } from '@/components/revenue-engine/QualificationPolicyModal';
import { RevenueEngineOnboardingGuide } from '@/components/revenue-engine/RevenueEngineOnboardingGuide';
import { LiveLeadSimulatorModal } from '@/components/revenue-engine/LiveLeadSimulatorModal';
import { RevenueLeakSection } from '@/components/revenue-engine/RevenueLeakSection';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Sparkles,
  Flame,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Calendar,
  MessageCircle,
  ShieldAlert,
  CheckSquare,
} from 'lucide-react';

export const metadata = {
  title: 'Revenue Command Centre | Closecraft HQ',
  description: 'Prioritize hot leads, mitigate revenue leakage, and execute next best sales actions.',
};

export default async function RevenueEnginePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!session.organizationId) redirect('/login');

  const { organizationId } = session;
  const resolvedParams = searchParams ? await searchParams : {};
  const currentTab = typeof resolvedParams?.tab === 'string' ? resolvedParams.tab : 'needs_attention';
  const filter =
    currentTab === 'needs_attention'
      ? 'needs_attention'
      : currentTab === 'my_actions'
      ? 'my_actions'
      : 'all';

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    actions,
    org,
    metrics,
    hotLeads,
    openLeaks,
    stalledDeals,
  ] = await Promise.all([
    getRevenueActions(organizationId, filter, session.user.id),
    db.organization.findUnique({
      where: { id: organizationId },
      select: { qualificationPolicy: true, name: true },
    }),
    getDashboardMetrics(organizationId, thirtyDaysAgo, now, 'NGN'),
    // Hot Leads (intent >= 70 or in opportunity stage)
    db.lead.findMany({
      where: {
        organizationId,
        OR: [
          { buyingIntent: { gte: 70 } },
          { status: { in: ['QUALIFYING', 'OPPORTUNITY'] } },
        ],
      },
      include: {
        deals: { select: { amount: true, stage: true } },
        revenueActions: { where: { status: 'PENDING' }, take: 1 },
      },
      orderBy: [{ buyingIntent: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    }),
    // Open Revenue Leaks
    db.revenueLeak.findMany({
      where: { organizationId, status: 'OPEN' },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    }),
    // Stalled Deals in Pipeline (> 7 days)
    db.deal.findMany({
      where: {
        organizationId,
        stage: { in: ['OPPORTUNITY', 'PROPOSAL', 'NEGOTIATION'] },
        updatedAt: { lt: sevenDaysAgo },
      },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { amount: 'desc' },
      take: 4,
    }),
  ]);

  const tabs = [
    { id: 'needs_attention', label: 'Needs Attention' },
    { id: 'my_actions', label: 'My Actions' },
    { id: 'all', label: 'All Actions' },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-16">
      {/* Page Heading & Fast Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              REVENUE ENGINE
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              {org?.name || 'Workspace'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">
            Sales Command Centre
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Review signals, prioritize leads, prevent revenue leakage, and execute next best actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <Link
            href="/recovery"
            className="h-10 px-3.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Sparkles size={14} />
            <span>Lead Recovery Hub</span>
          </Link>
          <Link
            href="/commitments"
            className="h-10 px-3.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/60 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <CheckSquare size={14} className="text-emerald-400" />
            <span>Promise Ledger</span>
          </Link>
          <LiveLeadSimulatorModal />
          <QualificationPolicyModal currentPolicy={org?.qualificationPolicy} />
          <AddLeadModal />
        </div>
      </div>

      {/* Interactive Step-by-Step Onboarding & Launch Guide */}
      <RevenueEngineOnboardingGuide
        currentPolicy={org?.qualificationPolicy}
        orgName={org?.name || 'Workspace'}
      />

      {/* ========================================================================= */}
      {/* 1. REVENUE OPERATIONS KPI STRIP                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-3xl bg-surface-container-low border border-outline-variant/40 space-y-1">
          <p className="text-[11px] font-medium text-on-surface-variant">Closed-Won</p>
          <p className="text-lg font-bold font-mono text-on-surface">
            ₦{metrics.closedWon.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold block">30-day revenue</span>
        </div>

        <div className="p-4 rounded-3xl bg-surface-container-low border border-outline-variant/40 space-y-1">
          <p className="text-[11px] font-medium text-on-surface-variant">Open Pipeline</p>
          <p className="text-lg font-bold font-mono text-primary">
            ₦{metrics.openPipeline.toLocaleString()}
          </p>
          <span className="text-[10px] text-on-surface-variant block">Active opportunities</span>
        </div>

        <div className="p-4 rounded-3xl bg-surface-container-low border border-outline-variant/40 space-y-1">
          <p className="text-[11px] font-medium text-on-surface-variant">New Inbound Leads</p>
          <p className="text-lg font-bold font-mono text-on-surface">{metrics.newLeads}</p>
          <span className="text-[10px] text-on-surface-variant block">Recent acquisitions</span>
        </div>

        <div className="p-4 rounded-3xl bg-surface-container-low border border-outline-variant/40 space-y-1">
          <p className="text-[11px] font-medium text-on-surface-variant">Appointments</p>
          <p className="text-lg font-bold font-mono text-on-surface">
            {metrics.upcomingAppointments}
          </p>
          <span className="text-[10px] text-primary font-semibold block">Scheduled meetings</span>
        </div>

        <div className="p-4 rounded-3xl bg-surface-container-low border border-outline-variant/40 space-y-1">
          <p className="text-[11px] font-medium text-on-surface-variant">Revenue at Risk</p>
          <p className="text-lg font-bold font-mono text-rose-400">
            {metrics.openLeaks + stalledDeals.length}
          </p>
          <span className="text-[10px] text-rose-400 font-semibold block">Leaks &amp; stalled</span>
        </div>

        <div className="p-4 rounded-3xl bg-surface-container-low border border-outline-variant/40 space-y-1">
          <p className="text-[11px] font-medium text-on-surface-variant">Pending Actions</p>
          <p className="text-lg font-bold font-mono text-amber-400">
            {metrics.pendingHumanActions}
          </p>
          <span className="text-[10px] text-amber-400 font-semibold block">Human attention</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ATTENTION PODS: HOT LEADS & REVENUE AT RISK                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hot Leads Pod */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-amber-400" />
              <h3 className="text-base font-bold text-on-surface">Hot Leads Needing Action</h3>
            </div>
            <Link
              href="/leads"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {hotLeads.length === 0 ? (
            <p className="text-xs text-on-surface-variant py-4 text-center">
              No high-intent leads waiting right now.
            </p>
          ) : (
            <div className="space-y-3">
              {hotLeads.map((lead: any) => {
                const topDeal = lead.deals?.[0];
                const nextAction = lead.revenueActions?.[0];

                return (
                  <div
                    key={lead.id}
                    className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-on-surface truncate">
                          {lead.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Intent: {lead.buyingIntent ?? 80}%
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        {nextAction
                          ? `Action: ${nextAction.type.replace(/_/g, ' ')}`
                          : 'Awaiting rep follow-up'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {topDeal ? (
                        <p className="font-mono font-bold text-xs text-primary">
                          ₦{Number(topDeal.amount).toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-[11px] text-on-surface-variant font-mono">Unset deal</p>
                      )}
                      <Link
                        href={`/leads`}
                        className="text-[11px] font-bold text-on-surface hover:text-primary transition-colors inline-block mt-0.5"
                      >
                        Engage &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Revenue at Risk Pod */}
        <RevenueLeakSection openLeaks={openLeaks as any} stalledDeals={stalledDeals as any} />
      </div>

      {/* ========================================================================= */}
      {/* 3. NEXT BEST ACTION QUEUE                                                */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Tabs Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-4">
            {tabs.map((tab) => {
              const isActive = tab.id === currentTab;
              return (
                <Link
                  key={tab.id}
                  href={`/dashboard/revenue-engine?tab=${tab.id}`}
                  className={`relative pb-3 font-semibold text-xs transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(69,191,174,0.4)]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">
              {actions.length} {actions.length === 1 ? 'Action' : 'Actions'} in Queue
            </span>
          </div>
        </div>

        {/* Action Queue Table & Inspector */}
        <ActionQueue
          actions={actions as any}
          emptyStateTitle={
            currentTab === 'needs_attention'
              ? 'No human actions waiting.'
              : currentTab === 'my_actions'
              ? 'You have no assigned actions.'
              : 'No actions recorded.'
          }
          emptyStateDesc={
            currentTab === 'needs_attention'
              ? 'New AI and deterministic sales recommendations will appear here when a prospect requires your attention.'
              : 'Actions claimed by you will appear here.'
          }
        />
      </div>
    </div>
  );
}
