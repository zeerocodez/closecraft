import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { getDashboardMetrics } from '@/lib/revenue-engine/dashboardService';
import OnboardingChecklistCard from '@/components/dashboard/OnboardingChecklistCard';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  Clock,
  MessageCircle,
  FileText,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Plus,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const metadata = {
  title: 'CloseCraft Dashboard | Closecraft HQ',
  description: 'Manage active customer growth projects, review proposals, pay invoices, and track delivery milestones.',
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!session.organizationId) redirect('/login');

  const { organizationId } = session;

  // Role-based dashboard isolation:
  const member = await db.organizationMember.findFirst({
    where: { userId: session.user.id, organizationId },
    select: { role: true },
  });

  const userRole = member?.role || 'MEMBER';
  if (userRole === 'CLOSER' || userRole === 'SETTER' || userRole === 'EXTERNAL_PROFESSIONAL') {
    redirect('/rep');
  }
  if (userRole === 'MANAGER') {
    redirect('/team');
  }

  // Enforce email verification
  if (!(session.user as any)?.emailVerified) {
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    });
    if (!dbUser?.emailVerified) {
      redirect('/verify-email');
    }
  }

  // Business owner onboarding check
  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN';
  if (isOwnerOrAdmin) {
    const qual = await db.workspaceQualification.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
    if (!qual || qual.status === 'DRAFT') {
      redirect('/onboarding');
    }
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    org,
    pendingProposals,
    pendingInvoices,
    pendingMilestones,
    activeProjects,
    activeSubscriptions,
    revMetrics,
    leadCount,
    demoLead,
    workspaceQual,
  ] = await Promise.all([
    db.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, plan: true },
    }),
    // 1. Pending Proposals awaiting client approval
    db.projectProposal.findMany({
      where: {
        projectRequest: { organizationId },
        status: 'SENT',
      },
      include: {
        projectRequest: { select: { reference: true, services: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    // 2. Pending Invoices awaiting Bachs payment
    db.projectInvoice.findMany({
      where: {
        projectRequest: { organizationId },
        status: 'ISSUED',
      },
      include: {
        projectRequest: { select: { reference: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    // 3. Deliverables awaiting client sign-off
    db.projectMilestone.findMany({
      where: {
        projectRequest: { organizationId },
        status: 'SUBMITTED',
        clientApproved: false,
      },
      include: {
        projectRequest: { select: { reference: true } },
      },
      orderBy: { sequenceOrder: 'asc' },
      take: 3,
    }),
    // 4. Active Growth Projects
    db.projectRequest.findMany({
      where: {
        organizationId,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
      include: {
        brief: { select: { businessName: true, primaryGoal: true } },
        assignedPartner: {
          select: { id: true, fullName: true, bio: true },
        },
        milestones: {
          select: { id: true, status: true, clientApproved: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    // 5. Active Subscriptions
    db.clientService.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        progressPercent: true,
        paidThroughDate: true,
      },
      take: 3,
    }),
    // 6. High-level Revenue Engine metrics
    getDashboardMetrics(organizationId, thirtyDaysAgo, now, 'NGN'),
    // 7. Lead count and demo seed status for onboarding
    db.lead.count({ where: { organizationId } }),
    db.lead.findFirst({
      where: {
        organizationId,
        OR: [
          { message: { contains: '[DEMO_SEED]' } },
          { message: { contains: '[Demo' } },
          { email: { endsWith: '@example.com' } },
        ]
      }
    }),
    db.workspaceQualification.findFirst({ where: { organizationId } }),
  ]);

  const totalActionCount =
    pendingProposals.length + pendingInvoices.length + pendingMilestones.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_DELIVERY':
        return <Badge variant="success" dot>In Delivery</Badge>;
      case 'PROPOSAL_SENT':
        return <Badge variant="warning" dot>Proposal Sent</Badge>;
      case 'INVOICED':
        return <Badge variant="warning" dot>Awaiting Payment</Badge>;
      case 'PAID':
        return <Badge variant="success">Paid</Badge>;
      case 'ASSIGNED':
      case 'CONSULTING':
        return <Badge variant="info">Partner Assigned</Badge>;
      case 'PENDING_ASSIGNMENT':
        return <Badge variant="info" dot>Matching Specialist</Badge>;
      default:
        return <Badge variant="neutral">{status.replace(/_/g, ' ')}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-16">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#248277]/10 text-[#45bfae] border border-[#248277]/20">
              CLOSECRAFT HQ
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {org?.name || 'Workspace'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Customer Growth &amp; Deliverables
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Overview of active growth projects, proposals requiring review, and delivery milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <Link
            href="/services"
            className="px-4 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-[#248277]/20 transition-all"
          >
            <Plus size={15} />
            <span>Select Growth Services</span>
          </Link>

          <a
            href="https://wa.me/2349026365853"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors"
            title="Official WhatsApp Concierge Desk"
          >
            <MessageCircle size={18} />
          </a>
        </div>
      </div>

      {/* Onboarding & Trial Activation Checklist */}
      <OnboardingChecklistCard
        organizationName={org?.name || 'Workspace'}
        leadCount={leadCount}
        hasDemoSeed={!!demoLead}
        isProfileComplete={!!org?.name}
        isPolicyConfigured={!!workspaceQual}
      />

      {/* ========================================================================= */}
      {/* 1. WHAT REQUIRES ATTENTION RIGHT NOW? (Immediate Action Queue)           */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-on-surface">Needs Your Attention</h2>
            {totalActionCount > 0 ? (
              <Badge variant="warning">{totalActionCount} pending</Badge>
            ) : (
              <Badge variant="success">All caught up</Badge>
            )}
          </div>
          <span className="text-xs text-on-surface-variant">
            Proposals, Bachs payments &amp; milestone approvals
          </span>
        </div>

        {totalActionCount === 0 ? (
          <Card className="p-6 text-center border-outline-variant/30 bg-surface-container-low">
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-sm font-bold text-on-surface">No pending actions required</p>
              <p className="text-xs text-on-surface-variant max-w-md">
                All proposals are approved, invoices are fulfilled, and deliverable sign-offs are up to date.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Proposals Awaiting Review */}
            {pendingProposals.map((prop: any) => (
              <Card
                key={prop.id}
                className="p-5 border-amber-500/40 bg-surface-container-low flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                      PROPOSAL AWAITING REVIEW
                    </span>
                    <span className="text-xs font-mono text-on-surface-variant">
                      {prop.proposalNumber}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-on-surface">
                    {prop.title || 'Growth Services Proposal'}
                  </h3>

                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-mono font-extrabold text-on-surface">
                      ₦{Number(prop.totalAmount).toLocaleString()}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {prop.currency}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-outline-variant/30">
                  <Link
                    href={`/growth/projects/${prop.projectRequest.reference}`}
                    className="w-full py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Review &amp; Approve</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </Card>
            ))}

            {/* Invoices Awaiting Payment */}
            {pendingInvoices.map((inv: any) => (
              <Card
                key={inv.id}
                className="p-5 border-amber-500/40 bg-surface-container-low flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                      INVOICE AWAITING PAYMENT
                    </span>
                    <span className="text-xs font-mono text-on-surface-variant">
                      {inv.invoiceNumber}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-on-surface">
                    Project Invoice for {inv.projectRequest.reference}
                  </h3>

                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-mono font-extrabold text-primary">
                      ₦{Number(inv.totalAmount).toLocaleString()}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {inv.currency}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-outline-variant/30">
                  <Link
                    href={`/growth/projects/${inv.projectRequest.reference}`}
                    className="w-full py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <DollarSign size={13} />
                    <span>Pay with Bachs</span>
                  </Link>
                </div>
              </Card>
            ))}

            {/* Milestones Awaiting Review */}
            {pendingMilestones.map((ms: any) => (
              <Card
                key={ms.id}
                className="p-5 border-blue-500/40 bg-surface-container-low flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30">
                      DELIVERABLE READY FOR REVIEW
                    </span>
                    <span className="text-xs font-mono text-on-surface-variant">
                      {ms.projectRequest.reference}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-on-surface">{ms.title}</h3>
                  <p className="text-xs text-on-surface-variant">
                    Your specialist has submitted proof for client verification.
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-outline-variant/30">
                  <Link
                    href={`/growth/projects/${ms.projectRequest.reference}`}
                    className="w-full py-2 px-3 rounded-xl bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/40"
                  >
                    <span>Inspect &amp; Sign Off</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2. WHAT IS HAPPENING? (Active Projects & Subscriptions)                   */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Active Growth Projects</h2>
            <p className="text-xs text-on-surface-variant">
              Ongoing customer acquisition, creative production, and live deliverables.
            </p>
          </div>

          <Link
            href="/growth/projects"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All ({activeProjects.length})</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {activeProjects.length === 0 ? (
          <EmptyState
            title="No active growth projects"
            description="You do not have any active creative or advertising projects. Select from our 5 introductory services to begin."
            action={{
              label: 'Explore Growth Services',
              href: '/services',
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.map((project: any) => {
              const approvedCount = project.milestones.filter(
                (m: any) => m.status === 'APPROVED' || m.clientApproved
              ).length;
              const totalCount = project.milestones.length;
              const progressPct =
                totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

              return (
                <Card
                  key={project.id}
                  className="p-5 sm:p-6 bg-surface-container-low border-outline-variant/40 hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                        {project.reference}
                      </span>
                      {getStatusBadge(project.status)}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-on-surface">
                        {project.brief?.businessName || 'Growth Project'}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                        Goal: {project.brief?.primaryGoal || 'Commercial expansion'}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    {totalCount > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-on-surface-variant">Milestone Completion</span>
                          <span className="text-primary font-bold">{progressPct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Partner Info & Workspace Link */}
                  <div className="pt-4 mt-4 border-t border-outline-variant/30 flex items-center justify-between gap-2">
                    {project.assignedPartner ? (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[11px]">
                          {project.assignedPartner.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-on-surface text-xs truncate">
                            {project.assignedPartner.fullName}
                          </p>
                          <p className="text-[10px] text-on-surface-variant">
                            Vetted Specialist
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <Clock size={12} className="text-amber-400" />
                        <span>Matching Specialist</span>
                      </span>
                    )}

                    <Link
                      href={`/growth/projects/${project.reference}`}
                      className="px-3 py-1.5 rounded-xl bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center gap-1 transition-colors border border-outline-variant/30"
                    >
                      <span>Workspace</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. REVENUE ENGINE SALES SNAPSHOT & CROSS-PRODUCT JUMP                    */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-2">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low border border-outline-variant/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25">
                REVENUE ENGINE SNAPSHOT
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                Sales Pipeline Operations
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-on-surface">
                Sales Pipeline &amp; Action Queue
              </h3>
              <p className="text-xs text-on-surface-variant max-w-xl mt-0.5">
                Manage inbound enquiries, follow up on warm leads, and track closing performance in the dedicated Revenue Command Centre.
              </p>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-surface-container/70 border border-outline-variant/20">
                <p className="text-[10px] text-on-surface-variant font-medium">Closed-Won</p>
                <p className="text-base font-bold font-mono text-on-surface mt-0.5">
                  ₦{revMetrics.closedWon.toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-surface-container/70 border border-outline-variant/20">
                <p className="text-[10px] text-on-surface-variant font-medium">Open Pipeline</p>
                <p className="text-base font-bold font-mono text-primary mt-0.5">
                  ₦{revMetrics.openPipeline.toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-surface-container/70 border border-outline-variant/20">
                <p className="text-[10px] text-on-surface-variant font-medium">Total Leads</p>
                <p className="text-base font-bold font-mono text-on-surface mt-0.5">
                  {revMetrics.newLeads}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-surface-container/70 border border-outline-variant/20">
                <p className="text-[10px] text-on-surface-variant font-medium">Pending Rep Actions</p>
                <p className="text-base font-bold font-mono text-amber-400 mt-0.5">
                  {revMetrics.pendingHumanActions}
                </p>
              </div>
            </div>
          </div>

          <div className="shrink-0 self-start md:self-center">
            <Link
              href="/dashboard/revenue-engine"
              className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Launch Revenue Command Centre</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
