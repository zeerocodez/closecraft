'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { updateLeadFollowUp, recordFastEnquiry, saveClientBlocker, resolveBlockerAction } from '@/app/(saas)/actions';
import QualificationProfileBanner from '@/components/qualification/QualificationProfileBanner';
import { formatWhatsAppUrl, normalizeWhatsAppNumber } from '@/lib/whatsapp';

interface TodayLeadItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  estimatedValue?: number | null;
  currency?: string | null;
  nextAction?: string | null;
  nextActionDueAt?: Date | string | null;
  blockerStatus?: string | null;
  assignedUser?: { id: string; name: string | null } | null;
  pilotEngagement?: { id: string; title: string } | null;
  blockers?: Array<{
    id: string;
    whatIsNeeded: string;
    whoMustRespond: string;
    requiredResponseDate: Date | string;
    status: string;
  }>;
}

interface BlockerItem {
  id: string;
  whatIsNeeded: string;
  whoMustRespond: string;
  requiredResponseDate: Date | string;
  affectedNextAction?: string | null;
  status: string;
  lead?: { id: string; name: string; phone: string | null } | null;
}

export default function TodayViewClient({
  data,
  currentUserId,
  userRole,
  teamMembers,
  qualification,
  organizationName,
  organizationWhatsApp,
}: {
  data: {
    overdueLeads: TodayLeadItem[];
    dueTodayLeads: TodayLeadItem[];
    missingActionLeads: TodayLeadItem[];
    unassignedLeads: TodayLeadItem[];
    openBlockers: BlockerItem[];
    metrics: {
      overdueCount: number;
      dueTodayCount: number;
      missingActionCount: number;
      unassignedCount: number;
      blockersCount: number;
    };
  };
  currentUserId: string;
  userRole: string;
  teamMembers: Array<{ id: string; name: string | null; role: string }>;
  qualification?: any | null;
  organizationName?: string;
  organizationWhatsApp?: string | null;
}) {
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'missing' | 'unassigned' | 'blockers'>('today');
  const [selectedLead, setSelectedLead] = useState<TodayLeadItem | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);
  const [blockerTargetLead, setBlockerTargetLead] = useState<TodayLeadItem | null>(null);

  // Follow-up form state
  const [outcomeNote, setOutcomeNote] = useState('');
  const [newStatus, setNewStatus] = useState('CONTACTED');
  const [disqualificationReason, setDisqualificationReason] = useState('');
  const [nextActionText, setNextActionText] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick add form state
  const [qaName, setQaName] = useState('');
  const [qaEmail, setQaEmail] = useState('');
  const [qaPhone, setQaPhone] = useState('');
  const [qaValue, setQaValue] = useState('');
  const [qaCurrency, setQaCurrency] = useState('NGN');
  const [qaOwner, setQaOwner] = useState(currentUserId);
  const [qaNextAction, setQaNextAction] = useState('Call to introduce services');
  const [qaDueDate, setQaDueDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [qaMessage, setQaMessage] = useState('');

  // Client blocker form state
  const [blockerNeeded, setBlockerNeeded] = useState('');
  const [blockerWho, setBlockerWho] = useState('Client Owner');
  const [blockerDate, setBlockerDate] = useState('');

  // Resolve blocker
  const [resolvingBlockerId, setResolvingBlockerId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const openFollowUpModal = (lead: TodayLeadItem) => {
    setSelectedLead(lead);
    setNewStatus(lead.status === 'NEW' ? 'CONTACTED' : lead.status);
    setOutcomeNote('');
    setDisqualificationReason('');
    setNextActionText(lead.nextAction || '');
    setNextActionDate(
      lead.nextActionDueAt
        ? new Date(lead.nextActionDueAt).toISOString().slice(0, 16)
        : new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16)
    );
    setAssigneeId(lead.assignedUser?.id || currentUserId);
    setIsFollowUpModalOpen(true);
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      await updateLeadFollowUp({
        leadId: selectedLead.id,
        status: newStatus,
        disqualificationReason: newStatus === 'LOST' ? disqualificationReason : undefined,
        outcomeNote,
        nextAction: nextActionText,
        nextActionDueAt: nextActionDate || undefined,
        assignedUserId: assigneeId || undefined,
      });

      setFeedbackMsg({ type: 'success', text: `Saved follow-up for ${selectedLead.name}.` });
      setIsFollowUpModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to update follow-up' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await recordFastEnquiry({
        name: qaName,
        email: qaEmail,
        phone: qaPhone,
        estimatedValue: qaValue ? parseFloat(qaValue) : undefined,
        currency: qaCurrency,
        ownerId: qaOwner,
        nextAction: qaNextAction,
        nextActionDueAt: qaDueDate,
        message: qaMessage,
      });

      if (res.duplicateWarning) {
        alert(res.duplicateWarning);
      }

      setFeedbackMsg({ type: 'success', text: `Enquiry for ${qaName} created and scheduled.` });
      setIsQuickAddOpen(false);
      window.location.reload();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to record enquiry' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlockerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockerTargetLead) return;
    setIsSubmitting(true);

    try {
      await saveClientBlocker({
        leadId: blockerTargetLead.id,
        whatIsNeeded: blockerNeeded,
        whoMustRespond: blockerWho,
        requiredResponseDate: blockerDate,
        affectedNextAction: blockerTargetLead.nextAction || undefined,
      });

      setIsBlockerModalOpen(false);
      setBlockerNeeded('');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to save blocker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveBlocker = async (blockerId: string) => {
    if (!resolutionText.trim()) {
      alert('Please enter resolution notes.');
      return;
    }
    try {
      await resolveBlockerAction(blockerId, resolutionText);
      setResolvingBlockerId(null);
      setResolutionText('');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve blocker');
    }
  };

  // Safe WhatsApp draft generator (Section 13: does NOT mark follow up complete)
  const openWhatsAppDraft = (phone: string, contactName: string) => {
    const cleanLeadPhone = normalizeWhatsAppNumber(phone);
    const orgDisplayName = organizationName || 'CloseCraft';
    const opener = `Hello ${contactName}, following up regarding your enquiry with ${orgDisplayName}. Are you available for a brief call today?`;

    if (cleanLeadPhone) {
      const url = formatWhatsAppUrl(cleanLeadPhone, opener);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } else if (organizationWhatsApp) {
      // Fallback: If lead has no direct phone, trigger chat via organization desk
      const fallbackUrl = formatWhatsAppUrl(
        organizationWhatsApp,
        `Follow-up regarding ${contactName}'s enquiry with ${orgDisplayName}.`
      );
      if (fallbackUrl) window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('No valid WhatsApp phone number found for this contact or workspace.');
    }
  };

  const formatDueDate = (dateVal?: Date | string | null) => {
    if (!dateVal) return 'Not scheduled';
    const d = new Date(dateVal);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Optional Qualification Profile Update Banner for Established Users */}
      <QualificationProfileBanner qualification={qualification} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-on-surface">Today</h1>
            <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-medium">
              Sales Command
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Know who is following up. Clear responsibility and visibility into the next action.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 bg-primary text-on-primary font-medium px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-all shadow-sm active:scale-95"
          >
            <Icon name="Plus" size={16} />
            <span>Fast Enquiry Add</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center justify-between ${
            feedbackMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs opacity-75 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/20 pb-2">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'today'
              ? 'bg-primary-container text-primary-fixed'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <Icon name="Calendar" size={16} />
          <span>Due Today</span>
          <span className="text-xs px-1.5 py-0.2 rounded-full bg-surface-container-highest">
            {data.metrics.dueTodayCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'overdue'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <Icon name="AlertCircle" size={16} />
          <span>Overdue Tasks</span>
          {data.metrics.overdueCount > 0 && (
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-200">
              {data.metrics.overdueCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('missing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'missing'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <Icon name="HelpCircle" size={16} />
          <span>No Next Action</span>
          <span className="text-xs px-1.5 py-0.2 rounded-full bg-surface-container-highest">
            {data.metrics.missingActionCount}
          </span>
        </button>

        {userRole !== 'EXTERNAL_PROFESSIONAL' && (
          <button
            onClick={() => setActiveTab('unassigned')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'unassigned'
                ? 'bg-primary-container text-primary-fixed'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Icon name="UserX" size={16} />
            <span>Unassigned</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-surface-container-highest">
              {data.metrics.unassignedCount}
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('blockers')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'blockers'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <Icon name="Clock" size={16} />
          <span>Waiting on Client</span>
          {data.metrics.blockersCount > 0 && (
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200">
              {data.metrics.blockersCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Content List */}
      <div className="space-y-3">
        {activeTab === 'today' && (
          <LeadListSection
            leads={data.dueTodayLeads}
            emptyMessage="No follow-up tasks due today. All active opportunities have actions scheduled for upcoming days."
            onOpenFollowUp={openFollowUpModal}
            onOpenWhatsApp={openWhatsAppDraft}
            onAddBlocker={(lead) => {
              setBlockerTargetLead(lead);
              setIsBlockerModalOpen(true);
            }}
          />
        )}

        {activeTab === 'overdue' && (
          <LeadListSection
            leads={data.overdueLeads}
            emptyMessage="Zero overdue follow-ups! Every lead has received timely attention."
            isOverdue
            onOpenFollowUp={openFollowUpModal}
            onOpenWhatsApp={openWhatsAppDraft}
            onAddBlocker={(lead) => {
              setBlockerTargetLead(lead);
              setIsBlockerModalOpen(true);
            }}
          />
        )}

        {activeTab === 'missing' && (
          <LeadListSection
            leads={data.missingActionLeads}
            emptyMessage="No opportunities without a next action. Keep it up!"
            onOpenFollowUp={openFollowUpModal}
            onOpenWhatsApp={openWhatsAppDraft}
            onAddBlocker={(lead) => {
              setBlockerTargetLead(lead);
              setIsBlockerModalOpen(true);
            }}
          />
        )}

        {activeTab === 'unassigned' && (
          <LeadListSection
            leads={data.unassignedLeads}
            emptyMessage="No unassigned enquiries. All records have an accountable owner."
            onOpenFollowUp={openFollowUpModal}
            onOpenWhatsApp={openWhatsAppDraft}
            onAddBlocker={(lead) => {
              setBlockerTargetLead(lead);
              setIsBlockerModalOpen(true);
            }}
          />
        )}

        {activeTab === 'blockers' && (
          <div className="space-y-3">
            {data.openBlockers.length === 0 ? (
              <div className="text-center py-12 bg-surface-container-low rounded-xl border border-outline-variant/30">
                <Icon name="CheckCircle2" size={32} className="mx-auto text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-on-surface">No open client blockers</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  When work requires information or approval from a client, log a blocker to track response deadlines.
                </p>
              </div>
            ) : (
              data.openBlockers.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl bg-surface-container-low border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                        WAITING ON CLIENT
                      </span>
                      {b.lead && <span className="text-sm font-medium text-on-surface">{b.lead.name}</span>}
                    </div>
                    <p className="text-sm text-on-surface">{b.whatIsNeeded}</p>
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span>Responsible: <strong className="text-on-surface">{b.whoMustRespond}</strong></span>
                      <span>
                        Deadline:{' '}
                        <strong className="text-amber-300">
                          {new Date(b.requiredResponseDate).toLocaleDateString()}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {resolvingBlockerId === b.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Resolution details..."
                          value={resolutionText}
                          onChange={(e) => setResolutionText(e.target.value)}
                          className="bg-surface-container-high px-3 py-1.5 rounded-lg text-xs text-on-surface border border-outline-variant/40"
                        />
                        <button
                          onClick={() => handleResolveBlocker(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold text-xs hover:bg-emerald-400"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setResolvingBlockerId(null)}
                          className="px-2 py-1.5 text-xs text-on-surface-variant hover:text-on-surface"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setResolvingBlockerId(b.id);
                          setResolutionText('');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        Resolve Blocker
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Completion & Rescheduling Modal */}
      {isFollowUpModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-semibold text-lg text-on-surface">Record Follow-up</h3>
                <p className="text-xs text-on-surface-variant">{selectedLead.name} ({selectedLead.phone || selectedLead.email})</p>
              </div>
              <button onClick={() => setIsFollowUpModalOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                <Icon name="X" size={18} />
              </button>
            </div>

            <form onSubmit={handleFollowUpSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Enquiry Stage</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="WON">Won (Agreed Sale)</option>
                  <option value="LOST">Lost (Disqualified)</option>
                </select>
                {newStatus === 'WON' && (
                  <p className="text-[11px] text-amber-300 mt-1">
                    Note: A Won record marks an agreed sale, not proof of collected cash. Verified collections are tracked via Bachs invoices.
                  </p>
                )}
              </div>

              {newStatus === 'LOST' && (
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Disqualification Reason</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Budget mismatch, competitor chosen, no current need"
                    value={disqualificationReason}
                    onChange={(e) => setDisqualificationReason(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Outcome Note (What happened?)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sent WhatsApp brochure, client confirmed they are evaluating options..."
                  value={outcomeNote}
                  onChange={(e) => setOutcomeNote(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                />
              </div>

              {newStatus !== 'WON' && newStatus !== 'LOST' && (
                <div className="space-y-3 pt-2 border-t border-outline-variant/20">
                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Scheduled Next Action</label>
                    <input
                      type="text"
                      placeholder="e.g. Call to discuss pricing sheet"
                      value={nextActionText}
                      onChange={(e) => setNextActionText(e.target.value)}
                      className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Due Date & Time</label>
                    <input
                      type="datetime-local"
                      value={nextActionDate}
                      onChange={(e) => setNextActionDate(e.target.value)}
                      className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                    />
                  </div>
                </div>
              )}

              {userRole !== 'EXTERNAL_PROFESSIONAL' && (
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Responsible Owner</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || 'Member'} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsFollowUpModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fast Enquiry Quick-Add Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-semibold text-lg text-on-surface">Fast Enquiry Capture</h3>
                <p className="text-xs text-on-surface-variant">Minimised typing for rapid mobile and desk entry.</p>
              </div>
              <button onClick={() => setIsQuickAddOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                <Icon name="X" size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Contact or Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Studio / David Adeleke"
                  value={qaName}
                  onChange={(e) => setQaName(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Phone Number (WhatsApp)</label>
                  <input
                    type="text"
                    placeholder="e.g. +234 803 123 4567"
                    value={qaPhone}
                    onChange={(e) => setQaPhone(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. david@apex.com"
                    value={qaEmail}
                    onChange={(e) => setQaEmail(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Estimated Value</label>
                  <input
                    type="number"
                    placeholder="e.g. 250000"
                    value={qaValue}
                    onChange={(e) => setQaValue(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Currency</label>
                  <select
                    value={qaCurrency}
                    onChange={(e) => setQaCurrency(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Scheduled Next Action</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call to discuss scope"
                  value={qaNextAction}
                  onChange={(e) => setQaNextAction(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Action Due Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={qaDueDate}
                    onChange={(e) => setQaDueDate(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Assigned Owner</label>
                  <select
                    value={qaOwner}
                    onChange={(e) => setQaOwner(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || 'Member'} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Enquiry Summary / Initial Note</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Reached out via website requesting a quote for website redesign..."
                  value={qaMessage}
                  onChange={(e) => setQaMessage(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Client Blocker Modal */}
      {isBlockerModalOpen && blockerTargetLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-heading font-semibold text-lg text-on-surface">Log Client Blocker</h3>
            <p className="text-xs text-on-surface-variant">
              Tag when work on <strong>{blockerTargetLead.name}</strong> is waiting on client decision or materials.
            </p>

            <form onSubmit={handleBlockerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">What is needed? *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirmation of custom quote / domain DNS access"
                  value={blockerNeeded}
                  onChange={(e) => setBlockerNeeded(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Who must respond? *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agency Owner / Jane Doe"
                  value={blockerWho}
                  onChange={(e) => setBlockerWho(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Required Response Date *</label>
                <input
                  type="date"
                  required
                  value={blockerDate}
                  onChange={(e) => setBlockerDate(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBlockerModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-xl hover:bg-amber-400"
                >
                  Save Blocker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadListSection({
  leads,
  emptyMessage,
  isOverdue = false,
  onOpenFollowUp,
  onOpenWhatsApp,
  onAddBlocker,
}: {
  leads: TodayLeadItem[];
  emptyMessage: string;
  isOverdue?: boolean;
  onOpenFollowUp: (lead: TodayLeadItem) => void;
  onOpenWhatsApp: (phone: string, name: string) => void;
  onAddBlocker: (lead: TodayLeadItem) => void;
}) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12 bg-surface-container-low rounded-xl border border-outline-variant/30">
        <Icon name="CheckCircle2" size={32} className="mx-auto text-emerald-400 mb-2" />
        <p className="text-sm font-medium text-on-surface">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {leads.map((lead) => {
        const hasBlocker = lead.blockers && lead.blockers.length > 0;
        return (
          <div
            key={lead.id}
            className={`p-4 rounded-xl bg-surface-container-low border transition-all hover:border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isOverdue ? 'border-rose-500/30 bg-rose-500/5' : 'border-outline-variant/30'
            }`}
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-heading font-semibold text-base text-on-surface truncate">
                  {lead.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                  {lead.status}
                </span>
                {hasBlocker && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Waiting on client
                  </span>
                )}
                {lead.pilotEngagement && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30">
                    Pilot
                  </span>
                )}
              </div>

              {lead.nextAction ? (
                <div className="flex items-center gap-2 text-sm text-on-surface">
                  <Icon name="ArrowRight" size={14} className="text-primary shrink-0" />
                  <span className="font-medium">{lead.nextAction}</span>
                </div>
              ) : (
                <p className="text-xs text-amber-300 font-medium italic">No scheduled next action</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                <span>
                  Owner: <strong className="text-on-surface">{lead.assignedUser?.name || 'Unassigned'}</strong>
                </span>
                {lead.nextActionDueAt && (
                  <span>
                    Due:{' '}
                    <strong className={isOverdue ? 'text-rose-400' : 'text-on-surface'}>
                      {new Date(lead.nextActionDueAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </strong>
                  </span>
                )}
                {lead.estimatedValue && (
                  <span>
                    Value: <strong className="text-emerald-400">₦{lead.estimatedValue.toLocaleString()}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {lead.phone && (
                <button
                  onClick={() => onOpenWhatsApp(lead.phone!, lead.name)}
                  title="Open WhatsApp draft (does not auto-complete follow-up)"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-medium transition-colors"
                >
                  <Icon name="MessageCircle" size={14} />
                  <span>Open WhatsApp</span>
                </button>
              )}

              <button
                onClick={() => onAddBlocker(lead)}
                title="Log client blocker"
                className="px-2.5 py-1.5 rounded-lg border border-outline-variant/30 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Blocker
              </button>

              <button
                onClick={() => onOpenFollowUp(lead)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-medium hover:opacity-90 transition-all shadow-sm active:scale-95"
              >
                <Icon name="CheckSquare" size={14} />
                <span>Action</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
