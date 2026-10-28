'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { updateLeadFollowUp, saveClientBlocker, logPilotEffort } from '@/app/(saas)/actions';

interface AssignedLead {
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
  blockers?: Array<{
    id: string;
    whatIsNeeded: string;
    whoMustRespond: string;
    requiredResponseDate: Date | string;
    status: string;
  }>;
}

interface ActiveEngagement {
  id: string;
  title: string;
  status: string;
  offerRepresented: string;
  activitiesIncluded: string[];
  activitiesExcluded: string[];
  capacityUnit: string;
  agreedCapacity: number;
  workingDays: string;
  responseWindows: string;
  communicationChannels: string;
  reviewSchedule: string;
  requiredClientInputs: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  organization: {
    name: string;
  };
  workLogs: Array<{
    id: string;
    date: Date | string;
    hoursLogged: number;
    activitiesPerformed: string;
    opportunitiesHandled: number;
  }>;
  blockers: Array<{
    id: string;
    whatIsNeeded: string;
    whoMustRespond: string;
    requiredResponseDate: Date | string;
    status: string;
    affectedNextAction?: string | null;
  }>;
}

export default function ExternalProfessionalHub({
  engagement,
  assignedLeads,
  repName,
}: {
  engagement: ActiveEngagement | null;
  assignedLeads: AssignedLead[];
  repName: string;
}) {
  const [activeTab, setActiveTab] = useState<'leads' | 'brief' | 'worklogs' | 'blockers'>('leads');

  // Follow-up modal
  const [selectedLead, setSelectedLead] = useState<AssignedLead | null>(null);
  const [followUpOutcome, setFollowUpOutcome] = useState('');
  const [followUpStatus, setFollowUpStatus] = useState('CONTACTED');
  const [nextActionText, setNextActionText] = useState('');
  const [nextActionDue, setNextActionDue] = useState('');
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

  // Blocker modal
  const [blockerLead, setBlockerLead] = useState<AssignedLead | null>(null);
  const [whatIsNeeded, setWhatIsNeeded] = useState('');
  const [whoMustRespond, setWhoMustRespond] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [affectedAction, setAffectedAction] = useState('');
  const [isSubmittingBlocker, setIsSubmittingBlocker] = useState(false);

  // Work log modal
  const [isLoggingWork, setIsLoggingWork] = useState(false);
  const [logHours, setLogHours] = useState('2.5');
  const [logOpps, setLogOpps] = useState('5');
  const [logActivities, setLogActivities] = useState('');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  if (!engagement || engagement.status !== 'ACTIVE') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="alert-triangle" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Restricted Access: No Active Pilot Engagement</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto mb-6">
            External sales professionals can only access client opportunities during an active, authorized engagement.
            {engagement ? ` This engagement is currently in ${engagement.status.replace('_', ' ')} state.` : ' No pilot engagement is assigned.'}
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800">
            <Icon name="shield" size={14} className="text-emerald-400" />
            Tenant data isolation enforced server-side.
          </div>
        </div>
      </div>
    );
  }

  // Calculate capacity
  const totalHoursLogged = engagement.workLogs.reduce((acc, l) => acc + (l.hoursLogged || 0), 0);
  const capacityPercent = Math.min(100, Math.round((totalHoursLogged / (engagement.agreedCapacity || 40)) * 100));

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setIsSubmittingFollowUp(true);

    try {
      await updateLeadFollowUp({
        leadId: selectedLead.id,
        outcomeNote: followUpOutcome,
        status: followUpStatus,
        nextAction: nextActionText || undefined,
        nextActionDueAt: nextActionDue || undefined,
      });

      alert('Follow-up recorded successfully.');
      setSelectedLead(null);
      setFollowUpOutcome('');
      setNextActionText('');
      setNextActionDue('');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to update follow-up');
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const handleBlockerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBlocker(true);

    try {
      await saveClientBlocker({
        engagementId: engagement.id,
        leadId: blockerLead?.id,
        whatIsNeeded,
        whoMustRespond,
        requiredResponseDate: requiredDate,
        affectedNextAction: affectedAction,
      });

      alert('Blocker ("Waiting on client") recorded.');
      setBlockerLead(null);
      setWhatIsNeeded('');
      setWhoMustRespond('');
      setRequiredDate('');
      setAffectedAction('');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to save blocker');
    } finally {
      setIsSubmittingBlocker(false);
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLog(true);

    try {
      await logPilotEffort({
        engagementId: engagement.id,
        hoursSpent: parseFloat(logHours) || 1,
        activityDescription: logActivities,
        leadsWorkedCount: parseInt(logOpps, 10) || 0,
      });

      alert('Work effort logged successfully.');
      setIsLoggingWork(false);
      setLogActivities('');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to log effort');
    } finally {
      setIsSubmittingLog(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Pilot
            </span>
            <span className="text-xs text-slate-500">Representing {engagement.organization?.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{engagement.title}</h1>
          <p className="text-sm text-slate-400 mt-1">
            Restricted professional working view. You can only access assigned opportunities under this engagement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLoggingWork(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            <Icon name="clock" size={16} />
            Log Work Effort
          </button>
          <button
            onClick={() => {
              setBlockerLead(null);
              setWhatIsNeeded('');
              setWhoMustRespond('');
              setRequiredDate('');
              setAffectedAction('');
              // open modal
              setBlockerLead({} as any);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
          >
            <Icon name="alert-circle" size={16} className="text-amber-400" />
            Raise Client Blocker
          </button>
        </div>
      </div>

      {/* Engagement Capacity Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
            {capacityPercent}%
          </div>
          <div>
            <div className="text-slate-300 font-semibold">
              Capacity: {totalHoursLogged.toFixed(1)} / {engagement.agreedCapacity} {engagement.capacityUnit.toLowerCase()}
            </div>
            <div className="text-slate-500">
              Agreed schedule: {engagement.workingDays} ({engagement.responseWindows})
            </div>
          </div>
        </div>
        <div className="w-full sm:w-64 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
          <div
            className={`h-full rounded-full transition-all ${
              capacityPercent >= 90 ? 'bg-amber-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('leads')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'leads'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Icon name="inbox" size={16} />
          Assigned Opportunities ({assignedLeads.length})
        </button>
        <button
          onClick={() => setActiveTab('brief')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'brief'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Icon name="file-text" size={16} />
          Approved Sales Brief & Boundaries
        </button>
        <button
          onClick={() => setActiveTab('worklogs')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'worklogs'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Icon name="clock" size={16} />
          Effort Log ({engagement.workLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('blockers')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'blockers'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Icon name="alert-circle" size={16} />
          Open Blockers ({engagement.blockers.length})
        </button>
      </div>

      {/* Tab 1: Assigned Opportunities */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Your Assigned Opportunities</h2>
            <span className="text-xs text-slate-400">
              Only opportunities specifically assigned to you under this pilot are listed.
            </span>
          </div>

          {assignedLeads.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <p className="text-slate-400 text-sm">No opportunities currently assigned to your queue.</p>
              <p className="text-slate-500 text-xs mt-1">
                Your Closecraft operator or workspace manager will allocate incoming qualified enquiries.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {assignedLeads.map((lead) => {
                const isBlocked = !!lead.blockerStatus;
                const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
                const waMessage = encodeURIComponent(
                  `Hello ${lead.name}, this is ${repName} with ${engagement.organization?.name}. I'm following up regarding your enquiry.`
                );
                const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waMessage}` : null;

                return (
                  <div
                    key={lead.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-white">{lead.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {lead.status}
                          </span>
                          {isBlocked && (
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <Icon name="alert-triangle" size={12} />
                              Waiting on client
                            </span>
                          )}
                          {lead.estimatedValue && (
                            <span className="text-xs font-semibold text-emerald-400">
                              {lead.currency || 'NGN'} {lead.estimatedValue.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Icon name="phone" size={13} className="text-slate-500" />
                              {lead.phone}
                            </span>
                          )}
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Icon name="mail" size={13} className="text-slate-500" />
                              {lead.email}
                            </span>
                          )}
                        </div>

                        {lead.nextAction && (
                          <div className="mt-3 flex items-center gap-2 text-xs">
                            <span className="text-slate-500 font-medium">Next Action:</span>
                            <span className="text-indigo-400 font-semibold">{lead.nextAction}</span>
                            {lead.nextActionDueAt && (
                              <span className="text-slate-400">
                                (Due: {new Date(lead.nextActionDueAt).toLocaleDateString()})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/30 transition"
                            title="Opens WhatsApp draft in a new tab. Does not automatically complete follow-up."
                          >
                            <Icon name="message-circle" size={14} />
                            Open WhatsApp
                          </a>
                        )}

                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setFollowUpOutcome('');
                            setFollowUpStatus(lead.status);
                            setNextActionText(lead.nextAction || '');
                            setNextActionDue(
                              lead.nextActionDueAt
                                ? new Date(lead.nextActionDueAt).toISOString().split('T')[0]
                                : ''
                            );
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
                        >
                          <Icon name="check-circle" size={14} />
                          Record Follow-up
                        </button>

                        <button
                          onClick={() => {
                            setBlockerLead(lead);
                            setWhatIsNeeded('');
                            setWhoMustRespond('Client owner/manager');
                            setRequiredDate(
                              new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
                            );
                            setAffectedAction(lead.nextAction || '');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition"
                        >
                          <Icon name="alert-circle" size={14} className="text-amber-400" />
                          Blocker
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Approved Sales Brief & Boundaries */}
      {activeTab === 'brief' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Approved Client Sales Brief & Boundaries</h2>
            <p className="text-xs text-slate-400">
              Authorized commercial scope for {engagement.organization?.name}. Sales representatives must operate strictly within these boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Offer Being Represented</span>
                <p className="text-sm text-slate-200 font-medium">{engagement.offerRepresented}</p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">Activities Included</span>
                <ul className="space-y-1.5">
                  {engagement.activitiesIncluded.map((act, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <Icon name="check" size={14} className="text-emerald-400" />
                      {act}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-2">Activities Excluded (Strict Boundaries)</span>
                <ul className="space-y-1.5">
                  {engagement.activitiesExcluded.map((act, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <Icon name="x" size={14} className="text-rose-400" />
                      {act}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Coverage & Schedule</span>
                <div className="space-y-2 mt-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Working Days</span>
                    <span className="text-white font-medium">{engagement.workingDays}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Response Window</span>
                    <span className="text-white font-medium">{engagement.responseWindows}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Communication Channels</span>
                    <span className="text-white font-medium">{engagement.communicationChannels}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Review Schedule</span>
                    <span className="text-white font-medium">{engagement.reviewSchedule}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">Required Client Inputs & Materials</span>
                <p className="text-xs text-slate-300 whitespace-pre-wrap">{engagement.requiredClientInputs}</p>
              </div>

              <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-300">
                <p className="font-semibold mb-1">Sales Rep Standard of Conduct:</p>
                <p className="text-slate-400">
                  Do not promise unapproved delivery dates, custom discount terms, or guaranteed outcomes without written client consent.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Effort Log */}
      {activeTab === 'worklogs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Work Effort & Capacity History</h2>
            <button
              onClick={() => setIsLoggingWork(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
            >
              + Log New Work
            </button>
          </div>

          {engagement.workLogs.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
              No work logs recorded yet. Log your hours and handled opportunities daily.
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
              {engagement.workLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-white font-semibold">
                      {new Date(log.date).toLocaleDateString()} — {log.hoursLogged} hours logged
                    </div>
                    <p className="text-slate-400 mt-0.5">{log.activitiesPerformed}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {log.opportunitiesHandled} opps handled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Blockers */}
      {activeTab === 'blockers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Active Client Blockers ("Waiting on client")</h2>
            <span className="text-xs text-slate-400">
              Blockers track missing inputs without pausing the entire pilot engagement.
            </span>
          </div>

          {engagement.blockers.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
              No active blockers. Work is proceeding without client impediment.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {engagement.blockers.map((b) => (
                <div key={b.id} className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-white">{b.whatIsNeeded}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-500 block">Who Must Respond:</span>
                      <span className="text-slate-200">{b.whoMustRespond}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Required By:</span>
                      <span className="text-slate-200">{new Date(b.requiredResponseDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Affected Action:</span>
                      <span className="text-slate-200">{b.affectedNextAction || 'General follow-up'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Record Follow-up */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Record Follow-up for {selectedLead.name}</h3>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-white">
                <Icon name="x" size={18} />
              </button>
            </div>

            <form onSubmit={handleFollowUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Stage Outcome</label>
                <select
                  value={followUpStatus}
                  onChange={(e) => setFollowUpStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="CONTACTED">Contacted (In discussion)</option>
                  <option value="QUALIFIED">Qualified (Clear intent & fit)</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="WON">Won (Agreed terms - pending handover)</option>
                  <option value="LOST">Lost / Disqualified</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Follow-up Outcome Note</label>
                <textarea
                  value={followUpOutcome}
                  onChange={(e) => setFollowUpOutcome(e.target.value)}
                  placeholder="Summarize the discussion, objections addressed, and prospect sentiment..."
                  rows={3}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Next Action (Optional)</label>
                  <input
                    type="text"
                    value={nextActionText}
                    onChange={(e) => setNextActionText(e.target.value)}
                    placeholder="e.g. Send formal quote"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Next Action Due Date</label>
                  <input
                    type="date"
                    value={nextActionDue}
                    onChange={(e) => setNextActionDue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFollowUp}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
                >
                  {isSubmittingFollowUp ? 'Saving...' : 'Save Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Work Effort */}
      {isLoggingWork && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Log Work Effort</h3>
              <button onClick={() => setIsLoggingWork(false)} className="text-slate-400 hover:text-white">
                <Icon name="x" size={18} />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    value={logHours}
                    onChange={(e) => setLogHours(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Opps Handled</label>
                  <input
                    type="number"
                    value={logOpps}
                    onChange={(e) => setLogOpps(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Activities Performed</label>
                <textarea
                  value={logActivities}
                  onChange={(e) => setLogActivities(e.target.value)}
                  placeholder="WhatsApp follow-ups, triage of 3 enquiries, scheduled discovery call..."
                  rows={3}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLoggingWork(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLog}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
                >
                  {isSubmittingLog ? 'Logging...' : 'Submit Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Client Blocker */}
      {blockerLead && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Raise Client Blocker ("Waiting on client")</h3>
              <button onClick={() => setBlockerLead(null)} className="text-slate-400 hover:text-white">
                <Icon name="x" size={18} />
              </button>
            </div>

            <form onSubmit={handleBlockerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">What is Needed from Client?</label>
                <textarea
                  value={whatIsNeeded}
                  onChange={(e) => setWhatIsNeeded(e.target.value)}
                  placeholder="e.g. Need approval for custom 3-month payment terms or updated service spec"
                  rows={2}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Who Must Respond?</label>
                <input
                  type="text"
                  value={whoMustRespond}
                  onChange={(e) => setWhoMustRespond(e.target.value)}
                  placeholder="e.g. Agency owner / Founder"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Required Response Date</label>
                  <input
                    type="date"
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Affected Action</label>
                  <input
                    type="text"
                    value={affectedAction}
                    onChange={(e) => setAffectedAction(e.target.value)}
                    placeholder="e.g. Close deal"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockerLead(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBlocker}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
                >
                  {isSubmittingBlocker ? 'Recording...' : 'Raise Blocker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
