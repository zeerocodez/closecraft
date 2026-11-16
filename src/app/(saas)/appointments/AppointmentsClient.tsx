'use client';

import React, { useState, useTransition } from 'react';
import { bookOrUpdateAppointment, updateAppointmentStatus } from '@/app/(saas)/actions';
import { formatWhatsAppUrl } from '@/lib/whatsapp';
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  MessageSquare, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Bell, 
  RotateCcw, 
  Check,
  CalendarDays,
  Flame,
  UserCheck,
  HelpCircle
} from 'lucide-react';

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
  const noShowCount = appointments.filter((a) => a.status === 'NO_SHOW').length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#121c1a] border border-[#248277]/40 text-white shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={18} className="text-[#45bfae]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Appointments & Calendar
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#248277]/15 border border-[#248277]/30 text-xs font-bold text-[#45bfae]">
              <span className="w-2 h-2 rounded-full bg-[#45bfae] animate-pulse"></span>
              {googleCalendarConnected ? 'Google Calendar Synced' : 'Live Pacing Engine'}
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-400">
            Executive demo bookings, video bridges, and automated no-show prevention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#248277]/20 transition-all"
          >
            <Plus size={16} />
            <span>Schedule Appointment</span>
          </button>
        </div>
      </div>

      {/* 4-KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f1214] border border-white/5 shadow-md">
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5 font-medium">
            <Calendar size={14} className="text-[#45bfae]" />
            <span>Upcoming Demos</span>
          </div>
          <div className="text-2xl font-serif font-bold text-white">{confirmedCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Scheduled or confirmed</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1214] border border-white/5 shadow-md">
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5 font-medium">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Completed Calls</span>
          </div>
          <div className="text-2xl font-serif font-bold text-white">{completedCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Successfully delivered</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121c1a] border border-[#248277]/30 shadow-md">
          <div className="text-xs text-[#45bfae] mb-1 flex items-center gap-1.5 font-semibold">
            <ShieldCheck size={14} />
            <span>Anti-No-Show Shield</span>
          </div>
          <div className="text-2xl font-serif font-bold text-white">&lt; 1.8%</div>
          <div className="text-[11px] text-gray-400 mt-0.5">24h & 1h WhatsApp alerts</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1214] border border-white/5 shadow-md">
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5 font-medium">
            <Bell size={14} className="text-amber-400" />
            <span>No-Show Incidents</span>
          </div>
          <div className="text-2xl font-serif font-bold text-white">{noShowCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Auto-reschedule enabled</div>
        </div>
      </div>

      {/* View Switcher & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0d12] p-2 rounded-2xl border border-white/5 shadow-sm">
        {/* View Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveView('AGENDA')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeView === 'AGENDA'
                ? 'bg-[#248277] text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CalendarDays size={15} />
            <span>Upcoming Agenda</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[#45bfae] text-[10px] font-mono">
              {appointments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('CALENDAR')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeView === 'CALENDAR'
                ? 'bg-[#248277] text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar size={15} />
            <span>Weekly Distribution</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('SYNC')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeView === 'SYNC'
                ? 'bg-[#248277] text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RotateCcw size={15} />
            <span>Google Calendar & Reminders</span>
          </button>
        </div>

        {/* Status Filter Pills (Agenda View) */}
        {activeView === 'AGENDA' && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'CONFIRMED', 'SCHEDULED', 'COMPLETED', 'NO_SHOW'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-white/10 text-white font-bold border border-white/15'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase().replace('_', '-')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeView === 'AGENDA' && (
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-xs bg-[#0f1214] rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#248277]/10 flex items-center justify-center text-[#45bfae]">
                <Calendar size={22} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">No upcoming appointments scheduled</p>
                <p className="text-xs text-gray-500 mt-1">Book your first sales discovery call with any qualified lead.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] font-bold text-xs transition-all"
              >
                Schedule Appointment
              </button>
            </div>
          ) : (
            filteredAppointments.map((appt) => {
              const dateObj = new Date(appt.scheduledAt);
              const dateFormatted = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
              const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const closerName = appt.closer?.name || appt.closer?.email?.split('@')[0] || 'Unassigned Rep';

              const isConfirmed = appt.status === 'CONFIRMED' || appt.status === 'SCHEDULED';
              const isCompleted = appt.status === 'COMPLETED';
              const isNoShow = appt.status === 'NO_SHOW';

              return (
                <div
                  key={appt.id}
                  className="p-5 rounded-2xl bg-[#0f1214] border border-white/5 hover:border-[#248277]/40 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Time & Meeting Overview */}
                  <div className="flex items-start gap-4">
                    {/* Time Box */}
                    <div className="w-20 p-2.5 rounded-xl bg-[#121c1a] border border-[#248277]/30 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#45bfae]">{dateFormatted.split(',')[0]}</span>
                      <span className="text-sm font-bold text-white font-mono">{timeFormatted}</span>
                      <span className="text-[9px] text-gray-500 font-mono">{appt.durationMinutes}m</span>
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-base text-white">
                          {appt.title || `Discovery Call with ${appt.lead.name}`}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isConfirmed 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : isCompleted 
                            ? 'bg-[#248277]/20 text-[#45bfae] border border-[#248277]/30' 
                            : isNoShow
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-white/5 text-gray-400'
                        }`}>
                          {appt.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-400 mt-1.5">
                        <span className="font-medium text-white flex items-center gap-1">
                          <User size={13} className="text-[#45bfae]" />
                          <span>{appt.lead.name}</span>
                        </span>
                        <span>•</span>
                        <span className="font-mono">{appt.lead.email}</span>
                        {appt.lead.phone && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-gray-300">{appt.lead.phone}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-[#45bfae] font-medium flex items-center gap-1">
                          <UserCheck size={13} />
                          <span>Closer: {closerName}</span>
                        </span>
                      </div>

                      {appt.notes && (
                        <p className="text-[11px] text-gray-400 mt-2 italic bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 inline-block">
                          Note: {appt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Meeting Actions & Video Bridge */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                    {appt.meetingUrl && (
                      <a
                        href={appt.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-[#248277] hover:bg-[#2e9c8f] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Video size={14} />
                        <span>Join Video Call</span>
                      </a>
                    )}

                    {isConfirmed && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleStatusChange(appt.id, 'COMPLETED')}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 border border-white/5"
                      >
                        <Check size={14} className="text-emerald-400" />
                        <span>Complete</span>
                      </button>
                    )}

                    {appt.lead.phone && (
                      <a
                        href={formatWhatsAppUrl(
                          appt.lead.phone,
                          `Hi ${appt.lead.name}, looking forward to our scheduled demo at ${timeFormatted}. Meeting link: ${appt.meetingUrl || ''}`
                        ) || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-500/20 transition-colors"
                        title="Send WhatsApp Reminder"
                      >
                        <MessageSquare size={16} />
                      </a>
                    )}

                    {/* Status Dropdown */}
                    <div className="relative inline-block">
                      <select
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt.id, e.target.value as any)}
                        disabled={isPending}
                        className="h-8 px-2 bg-black/50 border border-white/10 text-gray-300 rounded-lg text-[11px] focus:outline-none focus:border-[#45bfae]"
                      >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="NO_SHOW">No-Show</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Weekly Schedule View */}
      {activeView === 'CALENDAR' && (
        <div className="p-6 rounded-2xl bg-[#0f1214] border border-white/5 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h3 className="font-serif font-bold text-base text-white">Weekly Executive Demo Distribution</h3>
              <p className="text-xs text-gray-400">Live calendar pacing across your organization's sales force</p>
            </div>
            <span className="font-mono text-xs text-[#45bfae] font-bold">
              {confirmedCount} Confirmed Sessions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, idx) => (
              <div key={day} className="p-4 rounded-xl bg-[#0a0d12] border border-white/5 flex flex-col justify-between min-h-[160px]">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <span className="font-bold text-xs text-white">{day}</span>
                  <span className="text-[10px] text-gray-500 font-mono">Day {idx + 1}</span>
                </div>

                <div className="space-y-2 flex-1">
                  {appointments.slice(idx, idx + 2).map((a) => (
                    <div key={a.id} className="p-2.5 rounded-lg bg-[#121c1a] border border-[#248277]/30 text-[11px]">
                      <div className="font-bold text-white truncate">{a.lead.name}</div>
                      <div className="text-[10px] text-[#45bfae] font-mono">
                        {new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  {appointments.slice(idx, idx + 2).length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-600 text-[11px] italic">
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
          <div className="p-6 rounded-2xl bg-[#0f1214] border border-white/5 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#248277]/20 text-[#45bfae] flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Google Calendar Synchronization</h3>
                  <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                    googleCalendarConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'
                  }`}>
                    {googleCalendarConnected ? 'Connected & Active' : 'Not Connected'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                When enabled, every meeting booked by a setter or closer is automatically added to both the rep's and prospect's Google Calendars with auto-generated Google Meet video conference bridges.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0a0d12] border border-white/5 flex items-center justify-between text-xs">
              <span className="font-mono text-gray-400 truncate max-w-[200px]">
                {googleCalendarEmail || currentUser.email}
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Active</span>
              </span>
            </div>
          </div>

          {/* Automated Reminders (Prevent No-Shows) */}
          <div className="p-6 rounded-2xl bg-[#121c1a] border border-[#248277]/30 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Automated No-Show Shield</h3>
                  <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    &lt; 1.8% No-Show Rate
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Automated multi-channel reminders are dispatched to the prospect's WhatsApp and Email 24 hours and 1 hour before every scheduled call.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="font-medium text-gray-200">WhatsApp 24h Confirmation</span>
                <span className="text-emerald-400 font-bold">Enabled</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="font-medium text-gray-200">SMS / Email 1h Flash Reminder</span>
                <span className="text-emerald-400 font-bold">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f1214] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="font-serif font-bold text-base text-white">Schedule Sales Presentation</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Book demo and generate Google Meet bridge
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Select Prospect / Lead
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full h-10 px-3 bg-[#161a1d] text-white text-xs rounded-xl border border-white/10 focus:outline-none focus:border-[#45bfae]"
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
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Assigned Closer / Setter
                </label>
                <select
                  value={selectedCloserId}
                  onChange={(e) => setSelectedCloserId(e.target.value)}
                  className="w-full h-10 px-3 bg-[#161a1d] text-white text-xs rounded-xl border border-white/10 focus:outline-none focus:border-[#45bfae]"
                >
                  {teamMembers.map((m) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name || m.user.email} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Meeting Title (Optional)
                </label>
                <input
                  type="text"
                  value={apptTitle}
                  onChange={(e) => setApptTitle(e.target.value)}
                  placeholder="e.g. Executive Revenue Demo"
                  className="w-full h-10 px-3 bg-[#161a1d] text-white text-xs rounded-xl border border-white/10 focus:outline-none focus:border-[#45bfae]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full h-10 px-3 bg-[#161a1d] text-white text-xs rounded-xl border border-white/10 focus:outline-none focus:border-[#45bfae] font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-[#161a1d] text-white text-xs rounded-xl border border-white/10 focus:outline-none focus:border-[#45bfae]"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Internal Briefing Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key objections to address or pricing tier to propose."
                  rows={2}
                  className="w-full p-3 bg-[#161a1d] text-white text-xs rounded-xl border border-white/10 focus:outline-none focus:border-[#45bfae]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] font-bold text-xs shadow-md transition-all disabled:opacity-50"
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
