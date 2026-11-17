import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  FilePlus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  UserSearch, 
  ArrowRight, 
  Lock,
  ExternalLink
} from 'lucide-react';

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
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 max-w-6xl mx-auto font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-2.5 py-1 rounded-full border border-[#248277]/20 mb-2">
            <Users size={13} />
            <span>Dedicated Sales Talent</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
            Assigned Sales Professionals
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Vetted appointment setters and closers operating directly inside your workspace pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sales-support/request"
            className="px-4 py-2.5 rounded-xl bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold text-xs transition-all shadow-lg shadow-[#248277]/20 flex items-center gap-2"
          >
            <Plus size={15} />
            <span>Request Additional Talent</span>
          </Link>
        </div>
      </div>

      {/* Governance & Privacy Notice */}
      <div className="p-4 bg-[#0a0d12] border border-white/5 rounded-2xl space-y-1.5 text-xs text-gray-400">
        <div className="flex items-center gap-2 font-bold text-white">
          <ShieldCheck size={16} className="text-[#45bfae]" />
          <span>Tenant Boundary & Permission Policy</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          External appointment setters and closers only access leads and opportunities explicitly assigned to their engagement. They do not have unrestricted workspace membership, cannot export records, and their access is strictly revoked when assignments complete while preserving all historical work logs.
        </p>
      </div>

      {/* Engagements / Professionals List */}
      {activeEngagements.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#0f1214] border border-white/5 rounded-3xl space-y-4">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-gray-400 border border-white/10">
            <Users size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base text-white">No Active Professional Assignments</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Your workspace currently does not have an active sales engagement with allocated setters or closers. Submit a service assessment to initiate staffing.
            </p>
          </div>
          <Link
            href="/sales-support/request"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold text-xs shadow-md transition-all"
          >
            <FilePlus size={15} />
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
                className="bg-[#0f1214] border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl"
              >
                {/* Engagement Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-serif font-bold text-base text-white">{eng.title}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        eng.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : eng.status === 'PAUSED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-[#248277]/20 text-[#45bfae] border border-[#248277]/30'
                      }`}>
                        {eng.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Offer: <span className="text-white font-medium">{eng.offerRepresented || 'Workspace Offer'}</span> • Capacity: {eng.usedCapacity} / {eng.agreedCapacity} {eng.capacityUnit}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/sales-support`}
                      className="px-3 py-1.5 rounded-xl border border-white/10 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      View Terms
                    </Link>
                    <Link
                      href={`/leads?engagementId=${eng.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-[#248277]/20 text-[#45bfae] border border-[#248277]/40 text-xs font-bold hover:bg-[#248277]/30 transition-colors"
                    >
                      Assigned Leads ({eng.assignedLeads.length})
                    </Link>
                  </div>
                </div>

                {/* Professional Profile Card */}
                {prof ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-3 p-4 bg-[#0a0d12] rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#248277]/20 text-[#45bfae] font-bold flex items-center justify-center text-lg border border-[#248277]/30">
                          {prof.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{prof.fullName}</div>
                          <div className="text-[11px] text-[#45bfae] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>Verified Talent Pool Rep</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-gray-400 pt-3 border-t border-white/5">
                        <div>
                          <span className="text-gray-500 block text-[10px] uppercase font-bold">Languages</span>
                          <span className="text-white font-medium">
                            {prof.languages.length > 0 ? prof.languages.join(', ') : 'English'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px] uppercase font-bold">Working Hours</span>
                          <span className="text-white font-medium">{eng.responseWindows}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px] uppercase font-bold">Experience Focus</span>
                          <p className="text-gray-300 line-clamp-3 mt-0.5">
                            {prof.experienceSummary || 'Certified Digital Sales School graduate with assessed capability in outbound qualification and commercial objection resolution.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Operational Metrics & Lead Health */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 bg-[#0a0d12] rounded-2xl border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Assigned Leads</span>
                          <span className="text-xl font-bold text-white font-mono">{eng.assignedLeads.length}</span>
                        </div>
                        <div className="p-3.5 bg-[#0a0d12] rounded-2xl border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Active Pipeline</span>
                          <span className="text-xl font-bold text-[#45bfae] font-mono">{openLeadsCount}</span>
                        </div>
                        <div className="p-3.5 bg-[#0a0d12] rounded-2xl border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Won Conversions</span>
                          <span className="text-xl font-bold text-emerald-400 font-mono">{wonLeadsCount}</span>
                        </div>
                        <div className="p-3.5 bg-[#0a0d12] rounded-2xl border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Open Blockers</span>
                          <span className={`text-xl font-bold font-mono ${openBlockersCount > 0 ? 'text-amber-400' : 'text-gray-300'}`}>
                            {openBlockersCount}
                          </span>
                        </div>
                      </div>

                      {/* Recent Work Activity Logs */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                          <span>Recent Activity Logged</span>
                          <span className="text-[11px] text-gray-400 font-normal">Audited by Operator</span>
                        </div>
                        {eng.workLogs.length === 0 ? (
                          <div className="p-3.5 bg-[#0a0d12] rounded-2xl text-xs text-gray-500 italic border border-white/5">
                            No work activity logs recorded yet.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {eng.workLogs.map(log => (
                              <div
                                key={log.id}
                                className="p-3 rounded-xl bg-[#0a0d12] border border-white/5 flex items-start justify-between gap-4 text-xs"
                              >
                                <div>
                                  <span className="font-semibold text-white">{log.activityDescription}</span>
                                  <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                                    {new Date(log.date).toLocaleDateString()} • {log.leadsWorkedCount} leads worked
                                  </div>
                                </div>
                                <span className="text-xs font-mono text-[#45bfae] font-bold shrink-0">
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
                  <div className="p-6 bg-[#0a0d12] rounded-2xl border border-white/5 text-center space-y-2">
                    <UserSearch size={32} className="text-[#45bfae] mx-auto" />
                    <div className="font-bold text-sm text-white">Staffing In Progress</div>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
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
