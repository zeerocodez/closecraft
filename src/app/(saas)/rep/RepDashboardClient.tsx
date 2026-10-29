'use client';

import React, { useState, useTransition } from 'react';
import { 
  updateDealStage, 
  createDeal,
  updateGoogleCalendarIntegration, 
  toggleMemberAvailability,
  bookOrUpdateAppointment,
  updateAppointmentStatus,
  claimLead,
  handoffLeadToCloser
} from '@/app/(saas)/actions';
import { LeadAiAssessmentModal } from '@/components/revenue-engine/LeadAiAssessmentModal';
import { formatWhatsAppUrl } from '@/lib/whatsapp';

interface RepLead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: string;
  source?: string | null;
  buyingIntent?: number | null;
  assignedRole?: string | null;
  assignedUserId?: string | null;
  assignedUser?: { id?: string; name?: string | null; email?: string; image?: string | null } | null;
  aiAssessment?: string | null;
  nextStepsRecommendation?: string | null;
  createdAt: Date;
  deals: Array<{ id: string; amount: number; stage: string; currency: string }>;
  revenueActions: Array<{ id: string; type: string; reason?: string | null; priority: number; recommendedActor: string }>;
  revenueSignals: Array<{ id: string; type: string; value: number }>;
  appointments: Array<{ id: string; scheduledAt: Date; status: string }>;
}

interface RepDeal {
  id: string;
  title?: string | null;
  amount: number;
  currency: string;
  stage: string;
  closerId?: string | null;
  commissionAmount?: number | null;
  commissionStatus: string;
  closedAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lead: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

interface RepAppointment {
  id: string;
  title?: string | null;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
  meetingUrl?: string | null;
  notes?: string | null;
  lead: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

interface RepDashboardClientProps {
  member: {
    id: string;
    role: string;
    isAvailable: boolean;
    commissionRate?: number;
    commissionType?: string;
    googleCalendarConnected?: boolean;
    googleCalendarEmail?: string | null;
    reminderChannels?: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
    organization: {
      id: string;
      name: string;
      slug: string;
    };
  };
  leads: RepLead[];
  openPoolLeads?: RepLead[];
  deals: RepDeal[];
  appointments: RepAppointment[];
  teamMembers: any[];
  metrics: {
    activeLeadsCount: number;
    wonDealsCount: number;
    pipelineValue: number;
    totalCommission: number;
    pendingPayout: number;
  };
}

export default function RepDashboardClient({
  member,
  leads,
  openPoolLeads = [],
  deals,
  appointments,
  teamMembers,
  metrics,
}: RepDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'LEADS' | 'OPEN_POOL' | 'DEALS' | 'CALENDAR' | 'COMMISSIONS'>('LEADS');
  const [selectedLeadForAi, setSelectedLeadForAi] = useState<RepLead | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showCreateDealModal, setShowCreateDealModal] = useState<RepLead | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState<RepLead | null>(null);
  const [showHandoffModal, setShowHandoffModal] = useState<RepLead | null>(null);
  const [selectedCloserId, setSelectedCloserId] = useState<string>('');
  const [handoffNotes, setHandoffNotes] = useState<string>('');

  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Calendar settings state
  const [gcalEmail, setGcalEmail] = useState(member.googleCalendarEmail || member.user.email);
  const [gcalConnected, setGcalConnected] = useState(member.googleCalendarConnected ?? false);
  const [reminderChannels, setReminderChannels] = useState(member.reminderChannels || 'WHATSAPP_EMAIL');

  // Deal creation state
  const [dealAmount, setDealAmount] = useState<number>(500000);

  // Appointment schedule state
  const [apptTitle, setApptTitle] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [apptDuration, setApptDuration] = useState(30);
  const [apptNotes, setApptNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleClaimLead = (leadId: string, leadName: string) => {
    startTransition(async () => {
      try {
        await claimLead(leadId);
        showToast(`✅ Claimed "${leadName}" into your active queue!`);
      } catch (err: any) {
        alert(err.message || 'Failed to claim lead');
      }
    });
  };

  const handleHandoffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showHandoffModal || !selectedCloserId) return;

    startTransition(async () => {
      try {
        await handoffLeadToCloser({
          leadId: showHandoffModal.id,
          closerUserId: selectedCloserId,
          notes: handoffNotes,
        });
        showToast(`✅ Successfully handed off ${showHandoffModal.name} to closer!`);
        setShowHandoffModal(null);
        setSelectedCloserId('');
        setHandoffNotes('');
      } catch (err: any) {
        alert(err.message || 'Failed to hand off lead');
      }
    });
  };

  const displayName = member.user.name || member.user.email.split('@')[0];
  const rateFormatted = member.commissionType === 'PERCENTAGE'
    ? `${member.commissionRate ?? 10}% Commission`
    : `₦${Number(member.commissionRate || 0).toLocaleString()} per deal`;

  const handleToggleAvailability = () => {
    const nextStatus = !member.isAvailable;
    startTransition(async () => {
      try {
        await toggleMemberAvailability(member.id, nextStatus);
        showToast(`You are now marked as ${nextStatus ? 'Available for Leads' : 'Away'}.`);
      } catch (err: any) {
        alert(err.message || 'Failed to update availability');
      }
    });
  };

  const handleSaveCalendarSettings = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateGoogleCalendarIntegration({
          googleCalendarConnected: gcalConnected,
          googleCalendarEmail: gcalEmail,
          reminderChannels: reminderChannels,
        });
        setShowCalendarModal(false);
        showToast(gcalConnected ? '✅ Google Calendar & Reminders synchronized.' : 'Google Calendar disconnected.');
      } catch (err: any) {
        alert(err.message || 'Failed to update calendar settings');
      }
    });
  };

  const handleUpdateDealStage = (dealId: string, newStage: string, dealName: string) => {
    startTransition(async () => {
      try {
        await updateDealStage(dealId, newStage);
        if (newStage === 'WON') {
          showToast(`🎉 CONGRATULATIONS! Deal "${dealName}" WON. Commission recorded in your ledger!`);
        } else {
          showToast(`Deal "${dealName}" moved to ${newStage}.`);
        }
      } catch (err: any) {
        alert(err.message || 'Failed to update deal stage');
      }
    });
  };

  const handleCreateDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCreateDealModal) return;

    startTransition(async () => {
      try {
        await createDeal(showCreateDealModal.id, Number(dealAmount));
        setShowCreateDealModal(null);
        showToast(`✅ Created ₦${Number(dealAmount).toLocaleString()} deal for ${showCreateDealModal.name}!`);
      } catch (err: any) {
        alert(err.message || 'Failed to create deal');
      }
    });
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showScheduleModal || !apptTime) return;

    startTransition(async () => {
      try {
        await bookOrUpdateAppointment({
          leadId: showScheduleModal.id,
          title: apptTitle || `Sales Discovery with ${showScheduleModal.name}`,
          scheduledAt: apptTime,
          durationMinutes: Number(apptDuration),
          notes: apptNotes,
          closerId: member.user.id
        });
        setShowScheduleModal(null);
        setApptTitle('');
        setApptTime('');
        setApptNotes('');
        showToast(`✅ Booked appointment with ${showScheduleModal.name} & synced to Google Calendar.`);
      } catch (err: any) {
        alert(err.message || 'Failed to schedule appointment');
      }
    });
  };

  const handleCopyScript = (script: string) => {
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full max-w-7xl mx-auto pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-surface-container-highest border border-primary/30 text-on-surface shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Operator Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-surface-container-low via-surface-container-lowest to-surface-container-low border border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xl uppercase shrink-0 shadow-inner">
            {displayName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold text-on-surface font-heading">{displayName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                {member.role === 'CLOSER' ? 'High-Ticket Closer' : member.role === 'SETTER' ? 'Appointment Setter' : member.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant mt-1">
              <span>{member.organization.name}</span>
              <span>•</span>
              <span className="font-mono font-bold text-primary">{rateFormatted}</span>
              <span>•</span>
              <span className="text-on-surface-variant font-mono">{member.user.email}</span>
            </div>
          </div>
        </div>

        {/* Action Controls: Availability & Google Calendar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Availability Toggle */}
          <button
            disabled={isPending}
            onClick={handleToggleAvailability}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 active:scale-[0.98] ${
              member.isAvailable
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${member.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-outline'}`}></span>
            <span>{member.isAvailable ? 'Receiving Leads' : 'Status: Away'}</span>
          </button>

          {/* Google Calendar Status / Connect Button */}
          <button
            onClick={() => setShowCalendarModal(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 active:scale-[0.98] ${
              member.googleCalendarConnected
                ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                : 'bg-surface-container-high border-outline-variant/40 text-on-surface hover:border-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
            <span>{member.googleCalendarConnected ? 'Google Calendar Synced' : 'Connect Google Calendar'}</span>
          </button>
        </div>
      </div>

      {/* Rep KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active In Flight */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">My Claimed Leads</span>
            <span className="material-symbols-outlined text-[20px] text-primary">person_pin</span>
          </div>
          <div className="text-2xl font-bold text-on-surface font-headline">{metrics.activeLeadsCount}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">Leads in your personal workflow sheet</div>
        </div>

        {/* Pipeline Value */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Pipeline</span>
            <span className="material-symbols-outlined text-[20px] text-cyan-400">payments</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-headline">₦{(metrics.pipelineValue / 1000000).toFixed(1)}M</div>
          <div className="text-[11px] text-on-surface-variant mt-1">Active deals in proposal/negotiation</div>
        </div>

        {/* Closed Won Deals */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Deals Won</span>
            <span className="material-symbols-outlined text-[20px] text-emerald-400">verified</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-headline">{metrics.wonDealsCount}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">Successfully closed customer contracts</div>
        </div>

        {/* Commission Earned */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Commission Earned</span>
            <span className="material-symbols-outlined text-[20px] text-primary">account_balance_wallet</span>
          </div>
          <div className="text-2xl font-bold text-primary font-mono">₦{metrics.totalCommission.toLocaleString()}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">
            ₦{metrics.pendingPayout.toLocaleString()} pending owner payout
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('LEADS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'LEADS'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">groups</span>
          <span>My Claimed Leads</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px]">
            {leads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('OPEN_POOL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'OPEN_POOL'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">touch_app</span>
          <span>Open Pool (Claim Leads)</span>
          {openPoolLeads.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'OPEN_POOL' ? 'bg-white text-primary' : 'bg-primary/20 text-primary'
            }`}>
              {openPoolLeads.length} Available
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('DEALS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'DEALS'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
          <span>My Deals & Pipeline</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px]">
            {deals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CALENDAR'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          <span>Google Calendar & Appointments</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px]">
            {appointments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('COMMISSIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'COMMISSIONS'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">receipt_long</span>
          <span>Transparent Commission Ledger</span>
        </button>
      </div>

      {/* Tab 1: My Claimed Leads */}
      {activeTab === 'LEADS' && (
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-on-surface">My Assigned Prospect Sheet</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Qualified prospects assigned to your queue with AI assessment and prescribed openers
              </p>
            </div>
            <span className="text-xs text-secondary font-mono">
              {leads.length} Leads in Queue
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-secondary uppercase font-bold tracking-wider text-[11px]">
                  <th className="p-4">Contact & Company</th>
                  <th className="p-4">Intent & ICP Score</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4">AI Coaching Protocol</th>
                  <th className="p-4">Deals Attached</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant text-xs">
                      No leads currently claimed. Visit the <a href="/leads" className="text-primary underline">Leads Sheet</a> to claim leads from the Open Pool!
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const intentSignal = lead.revenueSignals[0];
                    const intentScore = intentSignal ? intentSignal.value : (lead.buyingIntent || 50);
                    const isHot = intentScore >= 75;

                    return (
                      <tr key={lead.id} className="hover:bg-surface-container/30 transition-colors">
                        {/* Contact */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${isHot ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-on-surface'} text-xs font-bold flex items-center justify-center shrink-0`}>
                              {lead.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-on-surface text-sm flex items-center gap-1.5">
                                <span>{lead.name}</span>
                                {isHot && (
                                  <span className="material-symbols-outlined text-primary text-[15px]" title="High Intent">
                                    local_fire_department
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-on-surface-variant">{lead.email}</div>
                              {lead.phone && (
                                <div className="text-[10px] text-secondary font-mono">{lead.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Intent */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-xs font-bold ${
                            isHot ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            <span className="material-symbols-outlined text-[14px]">bolt</span>
                            <span>{intentScore}/100</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container border border-outline-variant/30 text-on-surface">
                            {lead.status}
                          </span>
                        </td>

                        {/* AI Protocol */}
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedLeadForAi(lead)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition-all active:scale-[0.98]"
                          >
                            <span className="material-symbols-outlined text-[16px]">psychology</span>
                            <span>AI Protocol & Script</span>
                          </button>
                        </td>

                        {/* Deals Attached */}
                        <td className="p-4">
                          {lead.deals.length > 0 ? (
                            <span className="font-mono font-bold text-emerald-400 text-xs">
                              ₦{(lead.deals[0].amount / 1000000).toFixed(1)}M ({lead.deals[0].stage})
                            </span>
                          ) : (
                            <button
                              onClick={() => setShowCreateDealModal(lead)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                            >
                              <span className="material-symbols-outlined text-[14px]">add</span>
                              <span>Create Deal</span>
                            </button>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => {
                                setShowHandoffModal(lead);
                                setSelectedCloserId('');
                                setHandoffNotes('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Hand off lead to a closer"
                            >
                              <span className="material-symbols-outlined text-[15px]">send_time_extension</span>
                              <span>Handoff</span>
                            </button>

                            <button
                              onClick={() => setShowScheduleModal(lead)}
                              className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Schedule Meeting"
                            >
                              <span className="material-symbols-outlined text-[15px]">event</span>
                              <span>Book Appt</span>
                            </button>

                            {lead.phone && (
                              <a
                                href={formatWhatsAppUrl(lead.phone, `Hello ${lead.name}, I am reaching out regarding your enquiry.`) || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                                title="WhatsApp Direct"
                              >
                                <span className="material-symbols-outlined text-[15px]">chat</span>
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Open Lead Pool (Unassigned Leads to Claim) */}
      {activeTab === 'OPEN_POOL' && (
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-on-surface">Unassigned Open Lead Pool</h3>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                  {openPoolLeads.length} Available to Claim
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Fresh inbound leads waiting to be claimed by active Setters or Closers. Claiming moves the lead directly into your personal workflow.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-secondary uppercase font-bold tracking-wider text-[11px]">
                  <th className="p-4">Contact & Company</th>
                  <th className="p-4">Intent & ICP Score</th>
                  <th className="p-4">AI Coaching Protocol</th>
                  <th className="p-4">Inbound Channel</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {openPoolLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface-variant text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40">done_all</span>
                        <p className="font-semibold text-on-surface">No unassigned leads in the open pool</p>
                        <p className="text-[11px] text-on-surface-variant max-w-sm">
                          All incoming prospects have already been routed or claimed. New inbound leads from the website or ads will appear here instantly.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  openPoolLeads.map((lead) => {
                    const intentSignal = lead.revenueSignals[0];
                    const intentScore = intentSignal ? intentSignal.value : (lead.buyingIntent || 50);
                    const isHot = intentScore >= 75;

                    return (
                      <tr key={lead.id} className="hover:bg-surface-container/30 transition-colors">
                        {/* Contact */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${isHot ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-on-surface'} text-xs font-bold flex items-center justify-center shrink-0`}>
                              {lead.name ? lead.name[0].toUpperCase() : '?'}
                            </div>
                            <div>
                              <div className="font-bold text-on-surface flex items-center gap-1.5">
                                <span>{lead.name}</span>
                                {isHot && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] uppercase tracking-wider">
                                    Hot
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-on-surface-variant font-mono">{lead.email}</div>
                              {lead.phone && (
                                <div className="text-[11px] text-on-surface-variant/80 font-mono">{lead.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Intent */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-surface-container overflow-hidden">
                              <div 
                                className={`h-full ${isHot ? 'bg-emerald-400' : 'bg-primary'}`}
                                style={{ width: `${intentScore}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-xs">{intentScore}%</span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant block mt-0.5">
                            {isHot ? 'High Purchase Intent' : 'Standard Intent'}
                          </span>
                        </td>

                        {/* AI Protocol */}
                        <td className="p-4">
                          {lead.aiAssessment ? (
                            <div className="max-w-xs">
                              <div className="text-[11px] text-on-surface font-mono line-clamp-2">
                                {lead.aiAssessment}
                              </div>
                              <button
                                onClick={() => setSelectedLeadForAi(lead)}
                                className="text-[10px] text-primary hover:underline font-bold mt-1 inline-flex items-center gap-0.5"
                              >
                                <span className="material-symbols-outlined text-[12px]">psychology</span>
                                <span>View AI Assessment</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-on-surface-variant italic">Assessing signals...</span>
                          )}
                        </td>

                        {/* Source */}
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container text-on-surface-variant uppercase">
                            {lead.source || 'INBOUND_FORM'}
                          </span>
                        </td>

                        {/* Claim Action */}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleClaimLead(lead.id, lead.name)}
                            disabled={isPending}
                            className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ml-auto active:scale-95 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[15px]">touch_app</span>
                            <span>Claim Lead</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: My Deals & Pipeline */}
      {activeTab === 'DEALS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-on-surface">My Deals & Stage Advancements</h3>
              <p className="text-xs text-on-surface-variant">
                Advance deal stages directly. Marking a deal as WON automatically computes your commission!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deals.length === 0 ? (
              <div className="col-span-full py-12 text-center text-on-surface-variant text-xs bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
                No active deals in motion. Open "My Claimed Leads" above and click "Create Deal" on any prospect to start tracking!
              </div>
            ) : (
              deals.map((deal) => {
                const estCommission = member.commissionType === 'PERCENTAGE'
                  ? Math.round((deal.amount * (member.commissionRate ?? 10)) / 100)
                  : (member.commissionRate ?? 0);

                const isWon = deal.stage === 'WON';
                const isLost = deal.stage === 'LOST';

                return (
                  <div 
                    key={deal.id}
                    className={`p-5 rounded-2xl bg-surface-container-lowest border shadow-sm flex flex-col justify-between transition-all ${
                      isWon ? 'border-emerald-500/40 bg-emerald-500/[0.02]' : isLost ? 'border-outline-variant/20 opacity-60' : 'border-outline-variant/30 hover:border-primary/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-bold text-sm text-on-surface truncate">{deal.lead.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isWon ? 'bg-emerald-500/20 text-emerald-400' : isLost ? 'bg-error/20 text-error' : 'bg-primary/20 text-primary'
                        }`}>
                          {deal.stage}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between mb-4">
                        <span className="text-xl font-bold font-mono text-on-surface">₦{(deal.amount / 1000000).toFixed(2)}M</span>
                        <span className="text-xs font-mono text-primary font-bold">
                          Est. Comm: ₦{estCommission.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs text-on-surface-variant font-mono mb-4">
                        {deal.lead.email}
                      </div>
                    </div>

                    {/* Stage Advancement Control */}
                    <div className="pt-3 border-t border-outline-variant/20 flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                        Update Deal Stage
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          disabled={isPending}
                          onClick={() => handleUpdateDealStage(deal.id, 'PROPOSAL', deal.lead.name)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            deal.stage === 'PROPOSAL' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          Proposal
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => handleUpdateDealStage(deal.id, 'NEGOTIATION', deal.lead.name)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            deal.stage === 'NEGOTIATION' ? 'bg-cyan-600 text-white' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          Negotiate
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => handleUpdateDealStage(deal.id, 'WON', deal.lead.name)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            deal.stage === 'WON' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          🎉 WON
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => handleUpdateDealStage(deal.id, 'LOST', deal.lead.name)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            deal.stage === 'LOST' ? 'bg-error text-white' : 'bg-surface-container text-on-surface-variant hover:text-error'
                          }`}
                        >
                          Lost
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Google Calendar & Appointments */}
      {activeTab === 'CALENDAR' && (
        <div className="space-y-6">
          {/* Calendar Sync Banner */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">calendar_month</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-on-surface">Google Calendar Integration & Live Transparency</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    member.googleCalendarConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-outline/20 text-outline'
                  }`}>
                    {member.googleCalendarConnected ? 'Active' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {member.googleCalendarConnected 
                    ? `Synced with ${member.googleCalendarEmail || member.user.email}. Automated WhatsApp & Email reminders are dispatched before calls.`
                    : 'Connect your Google Calendar so the business owner and system can schedule demos without scheduling conflicts.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCalendarModal(true)}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-all active:scale-[0.98] shrink-0"
            >
              Configure Calendar & Reminders
            </button>
          </div>

          {/* Appointments Table */}
          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Scheduled Sales Appointments</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Live calendar pacing, prospect links, and Google Meet video bridges
                </p>
              </div>
              <span className="text-xs text-secondary font-mono">{appointments.length} Appointments</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-secondary uppercase font-bold tracking-wider text-[11px]">
                    <th className="p-4">Meeting & Prospect</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Meeting URL</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-on-surface-variant text-xs">
                        No upcoming appointments scheduled. Use "Book Appt" in your leads list to schedule a meeting!
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-on-surface text-sm">{appt.title || `Demo with ${appt.lead.name}`}</div>
                          <div className="text-[11px] text-on-surface-variant font-mono">{appt.lead.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-on-surface">{new Date(appt.scheduledAt).toLocaleDateString()}</div>
                          <div className="text-[11px] text-primary font-mono">{new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="p-4 font-mono text-on-surface-variant">
                          {appt.durationMinutes} mins
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-container text-on-surface border border-outline-variant/30">
                            {appt.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {appt.meetingUrl ? (
                            <a
                              href={appt.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline font-mono text-[11px] flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">videocam</span>
                              <span>Join Google Meet</span>
                            </a>
                          ) : (
                            <span className="text-on-surface-variant text-xs italic">No link generated</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              startTransition(async () => {
                                await updateAppointmentStatus(appt.id, 'COMPLETED');
                                showToast(`Appointment marked as completed.`);
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface"
                          >
                            Mark Complete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Transparent Commission Ledger */}
      {activeTab === 'COMMISSIONS' && (
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Your Commission & Payout History</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Full transparency on all closed deals, applied commission percentages, and approval status
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs">
                Total Accrued: ₦{metrics.totalCommission.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-secondary uppercase font-bold tracking-wider text-[11px]">
                  <th className="p-4">Deal / Customer</th>
                  <th className="p-4">Closed Date</th>
                  <th className="p-4">Deal Value (ACV)</th>
                  <th className="p-4">Commission Rate</th>
                  <th className="p-4">Your Payout</th>
                  <th className="p-4 text-right">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {deals.filter(d => d.stage === 'WON').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant text-xs">
                      No closed won deals yet. As soon as you close a deal, your earnings will appear here immediately!
                    </td>
                  </tr>
                ) : (
                  deals.filter(d => d.stage === 'WON').map((deal) => (
                    <tr key={deal.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-on-surface text-sm">{deal.lead.name}</div>
                        <div className="text-[11px] font-mono text-on-surface-variant">{deal.lead.email}</div>
                      </td>
                      <td className="p-4 font-mono text-on-surface-variant">
                        {deal.closedAt ? new Date(deal.closedAt).toLocaleDateString() : new Date(deal.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-mono font-bold text-on-surface">
                        ₦{deal.amount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs text-primary font-bold">
                          {member.commissionType === 'PERCENTAGE' ? `${member.commissionRate}%` : 'Fixed'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                        ₦{(deal.commissionAmount || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          deal.commissionStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : deal.commissionStatus === 'APPROVED'
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {deal.commissionStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Assessment & Prescriptive Next Steps Drawer */}
      {selectedLeadForAi && (
        <LeadAiAssessmentModal
          lead={selectedLeadForAi}
          onClose={() => setSelectedLeadForAi(null)}
          onClaim={(leadId, leadName) => {
            handleClaimLead(leadId, leadName);
            setSelectedLeadForAi(null);
          }}
          onBookDemo={(lead) => {
            setShowScheduleModal(lead as RepLead);
            setSelectedLeadForAi(null);
          }}
          isPending={isPending}
        />
      )}

      {/* Google Calendar & Reminders Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
                <h3 className="font-bold text-base text-on-surface">Google Calendar Integration</h3>
              </div>
              <button 
                onClick={() => setShowCalendarModal(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCalendarSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Google Account Email
                </label>
                <input
                  type="email"
                  value={gcalEmail}
                  onChange={(e) => setGcalEmail(e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary font-mono"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Calendar Auto-Sync</span>
                  <span className="text-[11px] text-on-surface-variant">Sync appointments live to Google Calendar</span>
                </div>
                <input
                  type="checkbox"
                  checked={gcalConnected}
                  onChange={(e) => setGcalConnected(e.target.checked)}
                  className="w-5 h-5 rounded bg-surface-container accent-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Automated Prospect Reminders
                </label>
                <select
                  value={reminderChannels}
                  onChange={(e) => setReminderChannels(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                >
                  <option value="WHATSAPP_EMAIL">WhatsApp + Email (Recommended - &lt;2% No-Show)</option>
                  <option value="WHATSAPP">WhatsApp Only</option>
                  <option value="EMAIL">Email Only</option>
                  <option value="SMS">SMS + WhatsApp</option>
                </select>
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Reminders are automatically sent to the prospect 24 hours and 1 hour before the scheduled call.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowCalendarModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  {isPending ? 'Saving...' : 'Save & Sync Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Deal Modal */}
      {showCreateDealModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <div>
                <h3 className="font-bold text-base text-on-surface">Create New Deal</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Convert {showCreateDealModal.name} into an active revenue deal
                </p>
              </div>
              <button 
                onClick={() => setShowCreateDealModal(null)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateDealSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Estimated Deal Amount (₦ NGN)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={dealAmount}
                  onChange={(e) => setDealAmount(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary font-mono text-base font-bold"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs">
                <span className="text-secondary font-bold block mb-1">Your Estimated Commission:</span>
                <span className="text-primary font-mono font-bold text-sm">
                  ₦{member.commissionType === 'PERCENTAGE'
                    ? Math.round((dealAmount * (member.commissionRate ?? 10)) / 100).toLocaleString()
                    : Number(member.commissionRate || 0).toLocaleString()}
                </span>
                <span className="text-on-surface-variant text-[11px] block mt-0.5">
                  ({rateFormatted})
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowCreateDealModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  {isPending ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <div>
                <h3 className="font-bold text-base text-on-surface">Book Sales Appointment</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Schedule meeting with {showScheduleModal.name}
                </p>
              </div>
              <button 
                onClick={() => setShowScheduleModal(null)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={apptTitle}
                  onChange={(e) => setApptTitle(e.target.value)}
                  placeholder={`Discovery Call with ${showScheduleModal.name}`}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Duration (Minutes)
                </label>
                <select
                  value={apptDuration}
                  onChange={(e) => setApptDuration(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                >
                  <option value={15}>15 Minutes (Briefing)</option>
                  <option value={30}>30 Minutes (Standard Demo)</option>
                  <option value={45}>45 Minutes (Executive Review)</option>
                  <option value={60}>60 Minutes (Proposal Closing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Agenda / Notes (Optional)
                </label>
                <textarea
                  value={apptNotes}
                  onChange={(e) => setApptNotes(e.target.value)}
                  placeholder="Focus on closing payment terms and pricing structure."
                  rows={2}
                  className="w-full p-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  {isPending ? 'Booking...' : 'Confirm & Sync Google Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Handoff Lead to Closer Modal */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <div>
                <h3 className="font-bold text-base text-on-surface">Hand Off Lead to Closer</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Transfer {showHandoffModal.name} with qualification briefing
                </p>
              </div>
              <button 
                onClick={() => setShowHandoffModal(null)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleHandoffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Select Closer
                </label>
                <select
                  value={selectedCloserId}
                  onChange={(e) => setSelectedCloserId(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">-- Choose Closer or Manager --</option>
                  {teamMembers
                    .filter((m: any) => m.role === 'CLOSER' || m.role === 'MANAGER' || m.role === 'ADMIN')
                    .map((m: any) => (
                      <option key={m.id} value={m.userId || m.user?.id}>
                        {m.user?.name || m.user?.email} ({m.role}) {m.isAvailable ? '🟢 Available' : '⚪ Away'}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Qualification Notes & Briefing
                </label>
                <textarea
                  value={handoffNotes}
                  onChange={(e) => setHandoffNotes(e.target.value)}
                  placeholder="e.g. Prospect has budget approved and needs demo focused on multi-location reporting. Demo booked for tomorrow."
                  rows={3}
                  className="w-full p-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                />
              </div>

              {showHandoffModal.aiAssessment && (
                <div className="p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/20">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                    AI Qualification Summary
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-3">
                    {showHandoffModal.aiAssessment}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowHandoffModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !selectedCloserId}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isPending ? 'Transferring...' : 'Confirm Handoff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
