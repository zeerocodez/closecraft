'use client';

import React, { useState, useTransition } from 'react';
import { claimLead, assignLeadToUser, claimRevenueAction } from '@/app/(saas)/actions';
import { LeadAiAssessmentModal } from '@/components/revenue-engine/LeadAiAssessmentModal';

interface AssignedUser {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
}

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: string;
  source?: string | null;
  buyingIntent?: number | null;
  createdAt: Date;
  assignedUserId?: string | null;
  assignedRole?: string | null;
  claimedAt?: Date | null;
  aiAssessment?: string | null;
  nextStepsRecommendation?: string | null;
  assignedUser?: AssignedUser | null;
  deals: Array<{ id: string; amount: number; stage: string; currency: string }>;
  revenueActions: Array<{ id: string; type: string; reason?: string | null; priority: number; recommendedActor: string; status: string }>;
  revenueSignals: Array<{ id: string; type: string; value: number }>;
}

interface LeadsTableClientProps {
  leads: LeadRecord[];
  currentUserId: string;
  currentUserRole: string;
  teamMembers: TeamMember[];
}

export default function LeadsTableClient({
  leads,
  currentUserId,
  currentUserRole,
  teamMembers,
}: LeadsTableClientProps) {
  const [filterTab, setFilterTab] = useState<'ALL' | 'MY_LEADS' | 'OPEN_POOL' | 'QUALIFIED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadForAi, setSelectedLeadForAi] = useState<LeadRecord | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copiedScript, setCopiedScript] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleClaim = (leadId: string, leadName: string) => {
    startTransition(async () => {
      try {
        await claimLead(leadId);
        showToast(`✅ You claimed "${leadName}". Added to your workflow lead sheet.`);
      } catch (err: any) {
        alert(err.message || 'Failed to claim lead');
      }
    });
  };

  const handleAssign = (leadId: string, targetUserId: string, leadName: string) => {
    const target = teamMembers.find(m => m.user.id === targetUserId);
    startTransition(async () => {
      try {
        await assignLeadToUser(leadId, targetUserId, target?.role);
        showToast(`Assigned "${leadName}" to ${target?.user.name || target?.user.email}.`);
      } catch (err: any) {
        alert(err.message || 'Failed to assign lead');
      }
    });
  };

  const handleCopyScript = (script: string) => {
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Filter calculations
  const myLeads = leads.filter(l => l.assignedUserId === currentUserId);
  const openPoolLeads = leads.filter(l => !l.assignedUserId);
  const qualifiedLeads = leads.filter(l => (l.buyingIntent && l.buyingIntent >= 70) || l.status === 'OPPORTUNITY');

  const filteredLeads = leads.filter(lead => {
    // Tab filter
    if (filterTab === 'MY_LEADS' && lead.assignedUserId !== currentUserId) return false;
    if (filterTab === 'OPEN_POOL' && lead.assignedUserId) return false;
    if (filterTab === 'QUALIFIED' && !(lead.buyingIntent && lead.buyingIntent >= 70) && lead.status !== 'OPPORTUNITY') return false;

    // Search filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const nameMatch = lead.name.toLowerCase().includes(q);
      const emailMatch = lead.email.toLowerCase().includes(q);
      const sourceMatch = lead.source?.toLowerCase().includes(q) ?? false;
      return nameMatch || emailMatch || sourceMatch;
    }
    return true;
  });

  return (
    <div className="w-full space-y-4">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-surface-container-highest border border-primary/30 text-on-surface shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface-container-lowest p-2.5 rounded-2xl border border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {/* All */}
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterTab === 'ALL'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span>All Leads</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px] font-bold">
              {leads.length}
            </span>
          </button>

          {/* My Workflow / Claimed */}
          <button
            onClick={() => setFilterTab('MY_LEADS')}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterTab === 'MY_LEADS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">person_pin</span>
            <span>My Workflow Sheet</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              {myLeads.length}
            </span>
          </button>

          {/* Open Team Pool */}
          <button
            onClick={() => setFilterTab('OPEN_POOL')}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterTab === 'OPEN_POOL'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Open Pool (Unassigned)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-bold">
              {openPoolLeads.length}
            </span>
          </button>

          {/* High Intent Qualified */}
          <button
            onClick={() => setFilterTab('QUALIFIED')}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterTab === 'QUALIFIED'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-400 hover:bg-purple-500/10'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">stars</span>
            <span>High Intent</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
              {qualifiedLeads.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center w-full lg:w-64">
          <span className="material-symbols-outlined absolute left-2.5 text-secondary text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search lead, email, source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary placeholder:text-outline"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/30">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse select-none text-xs">
            <thead>
              <tr className="bg-surface-container-low/80 text-secondary uppercase font-bold tracking-wider text-[11px] border-b border-outline-variant/30">
                <th className="py-3 px-4 min-w-[210px]">Lead & Contact</th>
                <th className="py-3 px-3 min-w-[130px]">Intent & ICP</th>
                <th className="py-3 px-3 min-w-[180px]">Assigned Closer / Setter</th>
                <th className="py-3 px-3 min-w-[200px]">AI Assessment & Protocol</th>
                <th className="py-3 px-3 min-w-[170px]">Next Best Action</th>
                <th className="py-3 px-4 text-right min-w-[140px]">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-on-surface-variant text-xs">
                    No leads found matching your selected filter.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, idx) => {
                  const intentSignal = lead.revenueSignals[0];
                  const intentScore = intentSignal ? intentSignal.value : (lead.buyingIntent || 50);
                  const isHot = intentScore >= 75;
                  const nextAction = lead.revenueActions[0];
                  
                  const isAssignedToMe = lead.assignedUserId === currentUserId;
                  const isUnassigned = !lead.assignedUserId;
                  const assignedName = lead.assignedUser?.name || lead.assignedUser?.email?.split('@')[0];

                  return (
                    <tr 
                      key={lead.id} 
                      className={`hover:bg-surface-container/30 transition-colors ${
                        isAssignedToMe ? 'bg-emerald-500/[0.03]' : (isUnassigned ? 'bg-amber-500/[0.02]' : '')
                      }`}
                    >
                      {/* Contact Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${isHot ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-on-surface'} text-xs font-bold flex items-center justify-center shrink-0`}>
                            {lead.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-on-surface hover:text-primary cursor-pointer truncate text-xs">
                                {lead.name}
                              </span>
                              {isHot && (
                                <span className="material-symbols-outlined text-[14px] text-amber-500" title="High Buying Intent">
                                  local_fire_department
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-on-surface-variant truncate">
                              {lead.email || (lead.phone ? 'WhatsApp / Phone Lead' : 'No contact address')}
                            </span>
                            {lead.phone && (
                              <span className="text-[10px] text-secondary font-mono">{lead.phone}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Intent & Value */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1">
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full w-fit text-[11px] font-bold ${
                            isHot ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-surface-container text-secondary'
                          }`}>
                            <span className="material-symbols-outlined text-[13px]">{isHot ? 'bolt' : 'analytics'}</span>
                            <span>{intentScore}/100</span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant font-medium">
                            {lead.source || 'Website Enquiry'}
                          </span>
                        </div>
                      </td>

                      {/* Team Assignment / Workflow Ownership */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1">
                          {isAssignedToMe ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px] w-fit">
                              <span className="material-symbols-outlined text-[13px]">person_check</span>
                              <span>Assigned to You ({lead.assignedRole || 'Closer'})</span>
                            </span>
                          ) : lead.assignedUser ? (
                            <div className="flex items-center gap-1.5 text-xs text-on-surface font-semibold">
                              <span className="w-5 h-5 rounded-full bg-surface-container-high text-secondary flex items-center justify-center text-[10px] uppercase">
                                {assignedName?.[0] || 'U'}
                              </span>
                              <span className="truncate max-w-[120px]">{assignedName}</span>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-surface-container text-secondary font-bold uppercase">
                                {lead.assignedRole || 'Team'}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-[10px] w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              <span>Open Pool (Unclaimed)</span>
                            </span>
                          )}

                          {/* Owner Reassignment Dropdown (if admin) */}
                          {currentUserRole === 'ADMIN' && (
                            <select
                              value={lead.assignedUserId || ''}
                              disabled={isPending}
                              onChange={(e) => handleAssign(lead.id, e.target.value, lead.name)}
                              className="text-[10px] bg-surface-container-low border border-outline-variant/20 rounded px-1.5 py-0.5 text-on-surface-variant focus:outline-none focus:border-primary w-fit mt-0.5"
                            >
                              <option value="">-- Reassign to Member --</option>
                              {teamMembers.map((m) => (
                                <option key={m.user.id} value={m.user.id}>
                                  {m.user.name || m.user.email} ({m.role})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>

                      {/* AI Assessment & Protocol Inspector */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setSelectedLeadForAi(lead)}
                          className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary hover:text-primary-container text-xs font-semibold flex items-center gap-1.5 transition-colors border border-outline-variant/20 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[15px]">psychology</span>
                          <span>View AI Assessment</span>
                        </button>
                      </td>

                      {/* Next Best Action */}
                      <td className="py-3 px-3">
                        {nextAction ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-xs text-on-surface">
                              {nextAction.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[11px] text-on-surface-variant line-clamp-1" title={nextAction.reason || ''}>
                              {nextAction.reason || 'SLA Protocol Action'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-on-surface-variant text-xs italic">No action queued</span>
                        )}
                      </td>

                      {/* Execution / Workflow Button */}
                      <td className="py-3 px-4 text-right">
                        {isUnassigned ? (
                          <button
                            disabled={isPending}
                            onClick={() => handleClaim(lead.id, lead.name)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] inline-flex items-center gap-1 float-right"
                          >
                            <span className="material-symbols-outlined text-[15px]">handshake</span>
                            <span>Claim Lead</span>
                          </button>
                        ) : isAssignedToMe ? (
                          <button
                            onClick={() => setSelectedLeadForAi(lead)}
                            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1 float-right"
                          >
                            <span className="material-symbols-outlined text-[15px]">call</span>
                            <span>Work Lead</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-on-surface-variant font-mono">
                            Assigned
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Assessment & Prescriptive Next Steps Modal */}
      {selectedLeadForAi && (
        <LeadAiAssessmentModal
          lead={selectedLeadForAi}
          onClose={() => setSelectedLeadForAi(null)}
          onClaim={(leadId, leadName) => {
            handleClaim(leadId, leadName);
            setSelectedLeadForAi(null);
          }}
          isPending={isPending}
        />
      )}

    </div>
  );
}
