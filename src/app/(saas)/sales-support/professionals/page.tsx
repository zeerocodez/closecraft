import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export const metadata = {
  title: 'Assigned Sales Professionals | Closecraft',
  description: 'View vetted sales development reps and closers allocated to your active workspace engagements.',
};

export default async function AssignedProfessionalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const organizationId = (session as any)?.organizationId;
  if (!organizationId) redirect('/login');

  // Fetch all engagements for this organization with assigned professional details
  const engagements = await db.pilotEngagement.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    include: {
      professional: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true }
          }
        }
      },
      workLogs: {
        orderBy: { date: 'desc' },
        take: 5,
      },
      assignedLeads: {
        select: {
          id: true,
          status: true,
          name: true,
          nextAction: true,
          nextActionDueAt: true,
        }
      },
      handovers: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      blockers: {
        where: { status: 'OPEN' }
      }
    }
  });

  const activeEngagements = engagements.filter(e => ['ACTIVE', 'SCHEDULED', 'AWAITING_READINESS', 'PAUSED'].includes(e.status));

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Sales Services
            </span>
            <span className="text-xs text-on-surface-variant">Active Operations Staffing</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-on-surface mt-2">
            Assigned Sales Professionals
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Vetted appointment setters and closers operating directly inside your workspace pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sales-support/request"
            className="px-4 py-2 rounded-lg bg-primary text-primary-fixed font-medium text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <Icon name="Plus" size={16} />
            <span>Request Additional Talent</span>
          </Link>
        </div>
      </div>

      {/* Governance & Privacy Notice */}
      <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl space-y-1.5 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2 font-semibold text-on-surface">
          <Icon name="ShieldCheck" size={16} className="text-primary" />
          <span>Tenant Boundary & Permission Policy</span>
        </div>
        <p>
          External appointment setters and closers only access leads and opportunities explicitly assigned to their engagement. They do not have unrestricted workspace membership, cannot export records, and their access is strictly revoked when assignments complete while preserving all historical work logs.
        </p>
      </div>

      {/* Engagements / Professionals List */}
      {activeEngagements.length === 0 ? (
        <div className="text-center py-16 px-4 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl space-y-4">
          <div className="w-14 h-14 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-on-surface-variant">
            <Icon name="Users" size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-base text-on-surface">No Active Professional Assignments</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Your workspace currently does not have an active sales engagement with allocated setters or closers. Submit a service assessment to initiate staffing.
            </p>
          </div>
          <Link
            href="/sales-support/request"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-fixed font-medium text-xs hover:opacity-90 transition-opacity"
          >
            <Icon name="FilePlus" size={16} />
            <span>Start Service Assessment</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeEngagements.map((eng) => {
            const prof = eng.professional;
            const openLeadsCount = eng.assignedLeads.filter(l => ['NEW', 'ENGAGED', 'QUALIFYING'].includes(l.status)).length;
            const wonLeadsCount = eng.assignedLeads.filter(l => l.status === 'WON').length;
            const openBlockersCount = eng.blockers.length;

            return (
              <div
                key={eng.id}
                className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 space-y-6"
              >
                {/* Engagement Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-outline-variant/30 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-on-surface">{eng.title}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        eng.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : eng.status === 'PAUSED'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                        {eng.status}
                      </span>
                    </div>
                    <div className="text-xs text-on-surface-variant mt-1">
                      Offer: <span className="text-on-surface font-medium">{eng.offerRepresented || 'Workspace Offer'}</span> • Capacity: {eng.usedCapacity} / {eng.agreedCapacity} {eng.capacityUnit}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/sales-support`}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      View Proposal & Terms
                    </Link>
                    <Link
                      href={`/leads?engagementId=${eng.id}`}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      View Assigned Leads ({eng.assignedLeads.length})
                    </Link>
                  </div>
                </div>

                {/* Professional Profile Card */}
                {prof ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-lg border border-primary/30">
                          {prof.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-on-surface">{prof.fullName}</div>
                          <div className="text-[11px] text-on-surface-variant flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Verified Talent Pool Rep</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
                        <div>
                          <span className="text-on-surface-variant/70 block text-[10px] uppercase font-bold">Languages</span>
                          <span className="text-on-surface font-medium">
                            {prof.languages.length > 0 ? prof.languages.join(', ') : 'English'}
                          </span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant/70 block text-[10px] uppercase font-bold">Working Hours</span>
                          <span className="text-on-surface font-medium">{eng.responseWindows}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant/70 block text-[10px] uppercase font-bold">Experience Focus</span>
                          <p className="text-on-surface line-clamp-3 mt-0.5">
                            {prof.experienceSummary || 'Certified Digital Sales School graduate with assessed capability in outbound qualification and commercial objection resolution.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Operational Metrics & Lead Health */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/20">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Assigned Leads</span>
                          <span className="text-lg font-bold text-on-surface">{eng.assignedLeads.length}</span>
                        </div>
                        <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/20">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Active Pipeline</span>
                          <span className="text-lg font-bold text-primary">{openLeadsCount}</span>
                        </div>
                        <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/20">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Won Conversions</span>
                          <span className="text-lg font-bold text-emerald-400">{wonLeadsCount}</span>
                        </div>
                        <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/20">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Open Blockers</span>
                          <span className={`text-lg font-bold ${openBlockersCount > 0 ? 'text-amber-400' : 'text-on-surface'}`}>
                            {openBlockersCount}
                          </span>
                        </div>
                      </div>

                      {/* Recent Work Activity Logs */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center justify-between">
                          <span>Recent Activity Logged</span>
                          <span className="text-[11px] text-on-surface-variant font-normal">Audited by Operator</span>
                        </div>
                        {eng.workLogs.length === 0 ? (
                          <div className="p-3 bg-surface-container rounded-xl text-xs text-on-surface-variant italic">
                            No work activity logs recorded yet.
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {eng.workLogs.map(log => (
                              <div
                                key={log.id}
                                className="p-2.5 rounded-lg bg-surface border border-outline-variant/20 flex items-start justify-between gap-4 text-xs"
                              >
                                <div>
                                  <span className="font-semibold text-on-surface">{log.activityDescription}</span>
                                  <div className="text-[10px] text-on-surface-variant mt-0.5">
                                    {new Date(log.date).toLocaleDateString()} • {log.leadsWorkedCount} leads worked
                                  </div>
                                </div>
                                <span className="text-[11px] font-mono text-primary font-semibold shrink-0">
                                  {log.hoursSpent} hrs
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 text-center space-y-2">
                    <Icon name="UserSearch" size={32} className="text-on-surface-variant mx-auto" />
                    <div className="font-semibold text-sm text-on-surface">Staffing In Progress</div>
                    <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                      Closecraft operators are vetting talent pool candidates for offer alignment. A certified setter or closer will be assigned prior to activation.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
