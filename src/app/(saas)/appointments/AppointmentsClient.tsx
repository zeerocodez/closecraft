'use client';

import React, { useState, useTransition } from 'react';
import { bookOrUpdateAppointment, updateAppointmentStatus, updateGoogleCalendarIntegration } from '@/app/(saas)/actions';

interface AppointmentRecord {
  id: string;
  title?: string | null;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
  meetingUrl?: string | null;
  notes?: string | null;
  googleEventId?: string | null;
  closerId?: string | null;
  lead: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    buyingIntent?: number | null;
  };
  closer?: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  } | null;
}

interface AppointmentsClientProps {
  appointments: AppointmentRecord[];
  leads: Array<{ id: string; name: string; email: string; phone?: string | null }>;
  teamMembers: Array<{ id: string; role: string; user: { id: string; name: string | null; email: string } }>;
  currentUser: { id: string; name?: string | null; email: string };
  googleCalendarConnected: boolean;
  googleCalendarEmail?: string | null;
}

export default function AppointmentsClient({
  appointments,
  leads,
  teamMembers,
  currentUser,
  googleCalendarConnected,
  googleCalendarEmail,
}: AppointmentsClientProps) {
  const [activeView, setActiveView] = useState<'AGENDA' | 'CALENDAR' | 'SYNC'>('AGENDA');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New appointment form state
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || '');
  const [apptTitle, setApptTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(30);
  const [selectedCloserId, setSelectedCloserId] = useState(currentUser.id);
  const [notes, setNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (filterStatus === 'ALL') return true;
    return appt.status === filterStatus;
  });

  const handleStatusChange = (apptId: string, nextStatus: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED') => {
    startTransition(async () => {
      try {
        await updateAppointmentStatus(apptId, nextStatus);
        showToast(`Meeting status marked as ${nextStatus}.`);
      } catch (err: any) {
        alert(err.message || 'Failed to update status');
      }
    });
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !scheduledAt) {
      alert('Please select a prospect and date/time');
      return;
    }

    startTransition(async () => {
      try {
        const lead = leads.find((l) => l.id === selectedLeadId);
        await bookOrUpdateAppointment({
          leadId: selectedLeadId,
          title: apptTitle || `Sales Presentation with ${lead?.name || 'Prospect'}`,
          scheduledAt,
          durationMinutes: Number(duration),
          notes,
          closerId: selectedCloserId,
        });
        setShowScheduleModal(false);
        setApptTitle('');
        setScheduledAt('');
        setNotes('');
        showToast(`✅ Appointment scheduled and synced with Google Calendar.`);
      } catch (err: any) {
        alert(err.message || 'Failed to book appointment');
      }
    });
  };

  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'SCHEDULED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-surface-container-highest border border-primary/30 text-on-surface shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Clean, Spacious Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-heading font-semibold text-on-surface">Appointments & Calendar</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-xs font-bold text-primary">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {googleCalendarConnected ? 'Google Calendar Synced' : 'Live Pacing Engine'}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Executive demo bookings, video bridges, and automated no-show prevention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-primary/20 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Schedule Appointment</span>
          </button>
        </div>
      </div>

      {/* Clean View & Filter Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-2.5 rounded-2xl border border-outline-variant/30 shadow-sm">
        {/* Segmented View Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveView('AGENDA')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeView === 'AGENDA'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_agenda</span>
            <span>Upcoming Agenda</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-secondary text-[10px]">
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveView('CALENDAR')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeView === 'CALENDAR'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            <span>Weekly Pacing</span>
          </button>

          <button
            onClick={() => setActiveView('SYNC')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeView === 'SYNC'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Google Calendar & Reminders</span>
          </button>
        </div>

        {/* Filter Pills */}
        {activeView === 'AGENDA' && (
          <div className="flex items-center gap-1 overflow-x-auto">
            {['ALL', 'CONFIRMED', 'SCHEDULED', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-surface-container-high text-on-surface font-bold border border-outline-variant/40'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeView === 'AGENDA' && (
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant text-xs bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">event_available</span>
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface">No upcoming appointments scheduled</p>
                <p className="text-xs text-on-surface-variant mt-1">Book your first sales discovery call with any qualified lead.</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs transition-all"
              >
                Schedule Appointment
              </button>
            </div>
          ) : (
            filteredAppointments.map((appt) => {
              const dateObj = new Date(appt.scheduledAt);
              const dateFormatted = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
              const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const closerName = appt.closer?.name || appt.closer?.email?.split('@')[0] || 'Unassigned Closer';

              const isConfirmed = appt.status === 'CONFIRMED' || appt.status === 'SCHEDULED';
              const isCompleted = appt.status === 'COMPLETED';

              return (
                <div
                  key={appt.id}
                  className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Time & Meeting Overview */}
                  <div className="flex items-start gap-4">
                    {/* Time Box */}
                    <div className="w-20 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">{dateFormatted.split(',')[0]}</span>
                      <span className="text-sm font-bold text-primary font-mono">{timeFormatted}</span>
                      <span className="text-[9px] text-on-surface-variant font-mono">{appt.durationMinutes}m</span>
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-on-surface">
                          {appt.title || `Discovery Call with ${appt.lead.name}`}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isConfirmed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : isCompleted ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-container text-on-surface'
                        }`}>
                          {appt.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant mt-1.5">
                        <span className="font-medium text-on-surface flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-secondary">person</span>
                          <span>{appt.lead.name}</span>
                        </span>
                        <span>•</span>
                        <span className="font-mono">{appt.lead.email}</span>
                        {appt.lead.phone && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-secondary">{appt.lead.phone}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-primary font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">badge</span>
                          <span>Closer: {closerName}</span>
                        </span>
                      </div>

                      {appt.notes && (
                        <p className="text-[11px] text-on-surface-variant mt-2 italic bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant/20 inline-block">
                          Note: {appt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Meeting Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                    {appt.meetingUrl && (
                      <a
                        href={appt.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-[16px]">videocam</span>
                        <span>Join Video Call</span>
                      </a>
                    )}

                    {isConfirmed && (
                      <button
                        disabled={isPending}
                        onClick={() => handleStatusChange(appt.id, 'COMPLETED')}
                        className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px] text-emerald-400">task_alt</span>
                        <span>Complete</span>
                      </button>
                    )}

                    {appt.lead.phone && (
                      <a
                        href={`https://wa.me/${appt.lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${appt.lead.name}, looking forward to our scheduled demo at ${timeFormatted}. Meeting link: ${appt.meetingUrl || ''}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-500/20 transition-colors"
                        title="Send WhatsApp Reminder"
                      >
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Weekly Schedule View */}
      {activeView === 'CALENDAR' && (
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-6">
            <div>
              <h3 className="font-bold text-base text-on-surface">Weekly Executive Demo Distribution</h3>
              <p className="text-xs text-on-surface-variant">Live calendar pacing across your organization's sales force</p>
            </div>
            <span className="font-mono text-xs text-primary font-bold">
              {confirmedCount} Confirmed Sessions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, idx) => (
              <div key={day} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between min-h-[160px]">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2 mb-2">
                  <span className="font-bold text-xs text-on-surface">{day}</span>
                  <span className="text-[10px] text-secondary font-mono">Day {idx + 1}</span>
                </div>

                <div className="space-y-2 flex-1">
                  {appointments.slice(idx, idx + 2).map((a) => (
                    <div key={a.id} className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-[11px]">
                      <div className="font-bold text-on-surface truncate">{a.lead.name}</div>
                      <div className="text-[10px] text-primary font-mono">{new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))}
                  {appointments.slice(idx, idx + 2).length === 0 && (
                    <div className="h-full flex items-center justify-center text-outline text-[11px] italic">
                      Slots Available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Google Calendar & Reminders Panel */}
      {activeView === 'SYNC' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Google Calendar Connection Card */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">Google Calendar Synchronization</h3>
                  <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                    googleCalendarConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {googleCalendarConnected ? 'Connected & Active' : 'Not Connected'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                When enabled, every meeting booked by a setter or closer is automatically added to both the rep's and prospect's Google Calendars with auto-generated Google Meet video conference bridges.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
              <span className="font-mono text-on-surface-variant truncate max-w-[200px]">
                {googleCalendarEmail || currentUser.email}
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Active</span>
              </span>
            </div>
          </div>

          {/* Automated Reminders (Prevent No-Shows) */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">notifications_active</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">Automated No-Show Shield</h3>
                  <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    &lt;1.8% No-Show Rate
                  </span>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                Automated multi-channel reminders are dispatched to the prospect's WhatsApp and Email 24 hours and 1 hour before every scheduled call.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                <span className="font-medium text-on-surface">WhatsApp 24h Confirmation</span>
                <span className="text-emerald-400 font-bold">Enabled</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                <span className="font-medium text-on-surface">SMS / Email 1h Flash Reminder</span>
                <span className="text-emerald-400 font-bold">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <div>
                <h3 className="font-bold text-base text-on-surface">Schedule Sales Presentation</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Book demo and generate Google Meet bridge
                </p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Select Prospect / Lead
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                  required
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Assigned Closer / Setter
                </label>
                <select
                  value={selectedCloserId}
                  onChange={(e) => setSelectedCloserId(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                >
                  {teamMembers.map((m) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name || m.user.email} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Meeting Title (Optional)
                </label>
                <input
                  type="text"
                  value={apptTitle}
                  onChange={(e) => setApptTitle(e.target.value)}
                  placeholder="e.g. Executive Revenue Demo"
                  className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Internal Briefing Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key objections to address or pricing tier to propose."
                  rows={2}
                  className="w-full p-3 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  {isPending ? 'Scheduling...' : 'Schedule & Sync'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
