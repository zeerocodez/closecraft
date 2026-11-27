import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { getRevenueActions, getDashboardMetrics } from '@/lib/revenue-engine/dashboardService';
import { ActionQueue } from '@/components/revenue-engine/ActionQueue';
import { RevenueLeakSection } from '@/components/revenue-engine/RevenueLeakSection';
import { AddLeadModal } from '@/app/(saas)/leads/AddLeadModal';
import { QualificationPolicyModal } from '@/components/revenue-engine/QualificationPolicyModal';
import { LiveLeadSimulatorModal } from '@/components/revenue-engine/LiveLeadSimulatorModal';
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
  ShieldCheck,
  CheckSquare,
  Plus,
  Zap,
  Target,
  Layers,
  ArrowUpRight,
  Inbox,
  History,
  FileText
} from 'lucide-react';

export const metadata = {
  title: 'Revenue Command Centre | CloseCraft HQ',
  description: 'Recover overlooked opportunities, convert active prospects, and deliver customer promises.',
};

export default async function CommandCentrePage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
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
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Time-aware greeting
  const hour = now.getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = session.user.name?.split(' ')[0] || 'Partner';

  const [
    org,
    metrics,
    actions,
    hotLeads,
    overdueCommitments,
    overlookedLeads,
    openLeaks,
    stalledDeals,
    recentAudits,
    recoveredCount,
    unreadInboxCount
  ] = await Promise.all([
    db.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, plan: true, slug: true, qualificationPolicy: true },
    }),
    getDashboardMetrics(organizationId, thirtyDaysAgo, now, 'NGN'),
    getRevenueActions(organizationId, filter, session.user.id),
    // Hot Leads requiring attention
    db.lead.findMany({
      where: {
        organizationId,
        OR: [
          { buyingIntent: { gte: 70 } },
          { status: { in: ['QUALIFYING', 'OPPORTUNITY', 'ENGAGED'] } },
        ],
      },
      include: {
        deals: { select: { amount: true, stage: true } },
        revenueActions: { where: { status: 'PENDING' }, take: 1 },
      },
      orderBy: [{ buyingIntent: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    }),
    // Active or overdue commitments from Promise Ledger
    db.customerCommitment.findMany({
      where: {
        organizationId,
        status: { in: ['PENDING', 'IN_PROGRESS', 'OVERDUE'] },
      },
      include: {
        lead: { select: { id: true, name: true } },
        assignedUser: { select: { name: true } },
      },
      orderBy: [{ isOverdue: 'desc' }, { dueDate: 'asc' }],
      take: 4,
    }),
    // Overlooked Leads ready for reactivation (created > 24 hours ago, still NEW or UNANSWERED)
    db.lead.findMany({
      where: {
        organizationId,
        status: 'NEW',
        createdAt: { lt: oneDayAgo },
      },
      select: {
        id: true,
        name: true,
        buyingIntent: true,
        estimatedValue: true,
        currency: true,
        createdAt: true,
        source: true,
      },
      orderBy: { buyingIntent: 'desc' },
      take: 3,
    }),
    // Open Revenue Leaks
    db.revenueLeak.findMany({
      where: { organizationId, status: 'OPEN' },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      take: 3,
    }),
    // Stalled Deals in Pipeline (> 7 days without update)
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
      take: 3,
    }),
    // Immutable Tenant Audit Activity
    db.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    // Total Recovered Prospects
    db.lead.count({
      where: {
        organizationId,
        source: 'RECOVERY_CAMPAIGN',
      },
    }),
    // Unread Inbound Messages
    db.conversation.count({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
    }),
  ]);

  const tabs = [
    { id: 'needs_attention', label: 'Needs Attention' },
    { id: 'my_actions', label: 'My Assigned Actions' },
    { id: 'all', label: 'All Actions' },
  ];

  // Urgent attention count
  const attentionItemsCount =
    hotLeads.length + overdueCommitments.filter((c) => c.isOverdue).length + stalledDeals.length;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & PERSONALISED GREETING                                     */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-accent-lime/15 text-accent-lime border border-accent-lime/30 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-lime animate-pulse" />
              <span>REVENUE COMMAND CENTRE</span>
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              {org?.name || 'Workspace'}
            </span>
            <span className="text-xs text-on-surface-variant/60">·</span>
            <span className="text-xs text-on-surface-variant font-mono">
              Last 30 Days
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-on-surface">
            {timeGreeting}, {firstName}. Here&apos;s where your revenue stands.
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
            Recover overlooked sales, keep customer conversations moving, and fulfill every promise on time.
          </p>
        </div>

        {/* 1-Click Fast Primary Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <Link
            href="/recovery"
            className="h-9 px-3 rounded-xl bg-accent-lime/15 hover:bg-accent-lime/25 text-accent-lime border border-accent-lime/35 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            title="Launch Lead Recovery Campaign"
          >
            <Sparkles size={14} />
            <span>Recover Leads</span>
          </Link>

          <Link
            href="/commitments"
            className="h-9 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/60 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Open Customer Promise Ledger"
          >
            <CheckSquare size={14} className="text-accent-lime" />
            <span>Promise Ledger</span>
          </Link>

          <LiveLeadSimulatorModal />
          <AddLeadModal />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REVENUE SNAPSHOT (FOUR COMPACT TRUTHFUL METRICS)                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Verified Cash Collected */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-2 relative overflow-hidden group card-sheen hover:border-accent-lime/40 transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Revenue Collected
            </span>
            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              VERIFIED CASH
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-extrabold text-on-surface tracking-tight">
            ₦{metrics.verifiedRealisedRevenue.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/20">
            <span>Paid bank deposits</span>
            <span className="text-emerald-400 font-semibold">{metrics.closedWon} deals won</span>
          </div>
        </div>

        {/* Metric 2: Active Open Pipeline */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-2 relative overflow-hidden group card-sheen hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Active Opportunities
            </span>
            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
              OPEN PIPELINE
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-extrabold text-accent-lime tracking-tight">
            ₦{metrics.openPipeline.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/20">
            <span>In negotiation / proposal</span>
            <Link href="/pipeline" className="text-xs font-bold text-on-surface hover:text-accent-lime flex items-center gap-0.5">
              <span>View Pipeline</span>
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        {/* Metric 3: Recovered Opportunities */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-2 relative overflow-hidden group card-sheen hover:border-accent-lime/40 transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Recovered Opportunities
            </span>
            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-accent-lime/15 text-accent-lime border border-accent-lime/30">
              RECOVER PILLAR
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-extrabold text-on-surface tracking-tight">
            {recoveredCount > 0 ? recoveredCount : metrics.newLeads}
          </p>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/20">
            <span>Revived dormant leads</span>
            <Link href="/recovery" className="text-xs font-bold text-on-surface hover:text-accent-lime flex items-center gap-0.5">
              <span>Recovery Hub</span>
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        {/* Metric 4: Outstanding Commitments */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-2 relative overflow-hidden group card-sheen hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Customer Promises
            </span>
            <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border ${
              overdueCommitments.some(c => c.isOverdue)
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              DELIVER PILLAR
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-extrabold text-on-surface tracking-tight">
            {overdueCommitments.length}
          </p>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/20">
            <span>{overdueCommitments.filter(c => c.isOverdue).length} overdue SLA</span>
            <Link href="/commitments" className="text-xs font-bold text-on-surface hover:text-accent-lime flex items-center gap-0.5">
              <span>Promise Ledger</span>
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRIORITY ACTION AREA: NEEDS YOUR ATTENTION                            */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-lime animate-pulse" />
            <h2 className="text-lg font-bold text-on-surface tracking-tight">
              Needs Your Attention
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-accent-lime/15 text-accent-lime border border-accent-lime/30">
              {attentionItemsCount} items
            </span>
          </div>
          <span className="text-xs text-on-surface-variant hidden sm:inline">
            Prioritised by revenue urgency and customer SLA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Attention Card 1: Hot Leads Awaiting Rep Follow-up */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Flame size={14} />
                  <span>Hot Leads Waiting</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {hotLeads.length} Available
                </span>
              </div>
              {hotLeads.length > 0 ? (
                <div>
                  <p className="text-sm font-bold text-on-surface truncate">
                    {hotLeads[0].name}
                  </p>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                    {hotLeads[0].revenueActions?.[0]?.reason || 'High intent prospect awaiting direct sales outreach.'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant py-2">
                  All high-intent prospects currently have active rep follow-ups.
                </p>
              )}
            </div>
            <Link
              href="/leads"
              className="w-full h-8 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Engage Next Hot Lead</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Attention Card 2: Outstanding Customer Commitments */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  <span>Customer Promises SLA</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {overdueCommitments.filter(c => c.isOverdue).length} Overdue
                </span>
              </div>
              {overdueCommitments.length > 0 ? (
                <div>
                  <p className="text-sm font-bold text-on-surface truncate">
                    {overdueCommitments[0].title}
                  </p>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                    Client: {overdueCommitments[0].lead?.name || 'Customer'} · Due: {new Date(overdueCommitments[0].dueDate).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant py-2">
                  All customer promises and deliverables are within SLA window.
                </p>
              )}
            </div>
            <Link
              href="/commitments"
              className="w-full h-8 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Review Promise Ledger</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Attention Card 3: Stalled Pipeline Deals */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Stalled Deals (&gt;7 Days)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {stalledDeals.length} Stalled
                </span>
              </div>
              {stalledDeals.length > 0 ? (
                <div>
                  <p className="text-sm font-bold text-on-surface truncate">
                    {stalledDeals[0].title}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Value: ₦{Number(stalledDeals[0].amount).toLocaleString()} · Stage: {stalledDeals[0].stage}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant py-2">
                  No deals currently stalled without salesperson momentum.
                </p>
              )}
            </div>
            <Link
              href="/pipeline"
              className="w-full h-8 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Advance Stalled Deals</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. OPPORTUNITY SPOTLIGHT: WHAT YOU MAY BE OVERLOOKING                    */}
      {/* ========================================================================= */}
      <section className="p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/30">
          <div>
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Sparkles size={16} className="text-accent-lime" />
              <span>Opportunities You May Be Overlooking</span>
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              High-intent prospects with no activity in 24h, ready for instant reactivation.
            </p>
          </div>
          <Link
            href="/recovery"
            className="text-xs font-bold text-accent-lime hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Launch Recovery Wave</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {overlookedLeads.length === 0 ? (
          <div className="py-6 text-center text-xs text-on-surface-variant">
            <p className="font-semibold text-on-surface">No dormant leads currently overlooked.</p>
            <p className="text-[11px] mt-0.5">All captured contacts have active follow-up schedules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {overlookedLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-on-surface truncate max-w-[140px]">
                      {lead.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-accent-lime/15 text-accent-lime border border-accent-lime/30">
                      {lead.buyingIntent ?? 80}% Fit
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Value: ₦{(Number(lead.estimatedValue) || 250000).toLocaleString()} · Source: {lead.source}
                  </p>
                </div>
                <Link
                  href={`/inbox?leadId=${lead.id}`}
                  className="w-full py-1.5 rounded-lg bg-accent-lime/10 hover:bg-accent-lime/20 text-accent-lime text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Reactivate Enquiry</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5. NEXT BEST ACTION QUEUE (ACTION-ORIENTED TABLE)                         */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* Tabs Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-4">
            {tabs.map((tab) => {
              const isActive = tab.id === currentTab;
              return (
                <Link
                  key={tab.id}
                  href={`/dashboard?tab=${tab.id}`}
                  className={`relative pb-3 font-semibold text-xs transition-colors ${
                    isActive
                      ? 'text-accent-lime font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent-lime rounded-t-full shadow-[0_-2px_8px_rgba(199,243,107,0.4)]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">
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
      </section>

      {/* ========================================================================= */}
      {/* 6. IMMUTABLE ACTIVITY & AUDIT TIMELINE                                    */}
      {/* ========================================================================= */}
      <section className="p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <History size={15} className="text-on-surface-variant" />
            <span>Recent Revenue &amp; Fulfilment Activity</span>
          </h3>
          <span className="text-[11px] text-on-surface-variant font-mono">Immutable audit trail</span>
        </div>

        {recentAudits.length === 0 ? (
          <p className="text-xs text-on-surface-variant py-3 text-center">
            No audit events recorded for this workspace yet.
          </p>
        ) : (
          <div className="divide-y divide-outline-variant/15 text-xs">
            {recentAudits.map((event) => (
              <div key={event.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-lime shrink-0" />
                  <span className="font-semibold text-on-surface truncate">
                    {event.reason || event.action}
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant font-mono shrink-0">
                  {new Date(event.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
