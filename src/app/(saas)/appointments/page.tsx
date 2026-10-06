import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';

export default async function AppointmentsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = (session as any).organizationId;
  const user = session.user;

  // Fetch upcoming appointments
  const appointments = await db.appointment.findMany({
    where: { 
      organizationId,
      status: 'SCHEDULED'
    },
    include: {
      lead: {
        include: { deals: true }
      }
    },
    orderBy: { scheduledAt: 'asc' }
  });

  const totalAppointments = appointments.length;
  // Sum up deals associated with these appointments
  const pipelineValue = appointments.reduce((sum, apt) => {
    return sum + apt.lead.deals.reduce((dealSum, deal) => dealSum + (deal.amount || 0), 0);
  }, 0);
  
  const formattedPipeline = `₦${(pipelineValue / 1000000).toFixed(1)}M`;
  
  const firstApt = appointments.length > 0 ? appointments[0] : null;
  const firstAptDeal = firstApt?.lead.deals[0];
  const formattedFirstAptDeal = firstAptDeal ? `₦${(firstAptDeal.amount / 1000000).toFixed(1)}M ACV` : 'No Deal';
    <div className="flex h-screen bg-surface font-body-md text-on-surface antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-inverse-surface z-50 flex flex-col justify-between select-none shadow-[0_1px_8px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="h-16 px-4 flex items-center justify-between bg-inverse-surface">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">rocket_launch</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-headline-sm text-headline-sm font-bold text-inverse-on-surface tracking-tight">Closecraft</span>
                </div>
                <span className="font-label-caps text-label-caps uppercase text-primary-fixed tracking-wider font-semibold">Revenue OS</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          </div>
          <div className="px-4 py-1">
            <div className="bg-on-surface/20 rounded-lg p-1.5 flex items-center justify-between text-inverse-on-surface cursor-pointer">
              <div className="flex items-center gap-1 overflow-hidden">
                <span className="material-symbols-outlined text-primary-fixed text-[16px]">corporate_fare</span>
                <span className="font-label-md text-label-md truncate font-medium text-inverse-on-surface">Acme Enterprise Ops</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-[16px]">unfold_more</span>
            </div>
          </div>
          
          <nav className="flex-1 px-3 py-2 space-y-3 mt-4">
            <div className="space-y-1">
              <div className="px-1 py-1 font-label-caps text-label-caps uppercase text-outline-variant tracking-wider font-bold">Revenue</div>
              <div className="space-y-0.5">
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-body-md text-body-md text-inverse-on-surface/80 hover:bg-surface-container-highest/20 hover:text-inverse-on-surface transition-colors" href="/dashboard">
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  <span>Dashboard</span>
                </a>
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-body-md text-body-md text-inverse-on-surface/80 hover:bg-surface-container-highest/20 hover:text-inverse-on-surface transition-colors" href="/leads">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                  <span>Leads</span>
                </a>
                <a className="flex items-center justify-between px-3 py-1.5 rounded-lg font-body-md text-body-md text-inverse-on-surface/80 hover:bg-surface-container-highest/20 hover:text-inverse-on-surface transition-colors" href="/inbox">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">inbox</span>
                    <span>Inbox</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full font-label-caps text-label-caps bg-primary-container text-on-primary font-bold">5</span>
                </a>
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-body-md text-body-md text-inverse-on-surface/80 hover:bg-surface-container-highest/20 hover:text-inverse-on-surface transition-colors" href="/pipeline">
                  <span className="material-symbols-outlined text-[18px]">view_kanban</span>
                  <span>Pipeline</span>
                </a>
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors bg-primary text-on-primary font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.2)]" href="/appointments">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  <span>Appointments</span>
                </a>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col relative w-full bg-surface">
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl z-40 flex items-center justify-between px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
              <span className="font-label-md text-label-md text-secondary font-medium">Revenue Workspace</span>
              <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
              <span className="font-label-md text-label-md text-on-surface font-bold">Appointments</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden xl:flex items-center gap-1 px-3 py-1 rounded bg-surface-container-low text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="font-body-sm text-body-sm">Telemetry: 340ms • 99.98% Integrity</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        <main className="relative pt-16 min-h-screen w-full overflow-y-auto">
          <div className="flex flex-col w-full p-6 gap-6">
            {/* Operational Sub-Header & Controls Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">Revenue Appointments</h1>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-label-caps text-label-caps">LIVE CALENDAR ENGINE</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Automated executive demo bookings, rep dispatching & calendar pacing</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center p-1 rounded-xl bg-surface-container-low shadow-sm">
                  <button className="px-3 py-1 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" type="button">Day</button>
                  <button className="px-3 py-1 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md shadow-sm font-semibold" type="button">Week View</button>
                  <button className="px-3 py-1 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" type="button">Month</button>
                  <button className="px-3 py-1 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" type="button">Agenda List</button>
                </div>
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low shadow-sm font-label-md text-label-md transition-all font-semibold" type="button">
                  <span className="material-symbols-outlined text-[18px] text-primary">sync</span>
                  <span>Sync Calendar</span>
                </button>
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container shadow-sm font-label-md text-label-md transition-all font-bold" type="button">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Schedule Appointment</span>
                </button>
              </div>
            </div>

            {/* Top KPI Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container justify-between">
                <div className="flex items-center justify-between text-on-surface-variant mb-2">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">Slated Today</span>
                  <span className="material-symbols-outlined text-[20px] text-primary">event_available</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-numeral-lg text-3xl font-bold text-on-surface">{totalAppointments}</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">Appointments</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-primary font-body-sm text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span className="font-semibold">6 Enterprise Demos</span>
                  <span className="text-on-surface-variant ml-auto">84% Rep Load</span>
                </div>
              </div>

              <div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container justify-between">
                <div className="flex items-center justify-between text-on-surface-variant mb-2">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">Booking Conversion</span>
                  <span className="material-symbols-outlined text-[20px] text-tertiary">bolt</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-numeral-lg text-3xl font-bold text-on-surface">49.5%</span>
                  <span className="font-label-caps text-[10px] text-primary bg-primary-fixed/40 px-1 rounded font-bold">+3.2% vs avg</span>
                </div>
                <div className="mt-2 text-on-surface-variant font-body-sm text-xs truncate">
                  From qualified inbound traffic (AI routed)
                </div>
              </div>

              <div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container justify-between">
                <div className="flex items-center justify-between text-on-surface-variant mb-2">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">No-Show Rate</span>
                  <span className="material-symbols-outlined text-[20px] text-primary">verified_user</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-numeral-lg text-3xl font-bold text-on-surface">1.8%</span>
                  <span className="font-body-sm text-xs text-on-surface-variant font-medium">(Target: &lt;4.0%)</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-on-surface-variant font-body-sm text-xs">
                  <span className="material-symbols-outlined text-[14px] text-primary">sms</span>
                  <span className="truncate">Protected by automated SMS reminders</span>
                </div>
              </div>

              <div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container justify-between">
                <div className="flex items-center justify-between text-on-surface-variant mb-2">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">Pipeline in Meetings</span>
                  <span className="material-symbols-outlined text-[20px] text-primary">payments</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-numeral-lg text-3xl font-bold text-on-surface">{formattedPipeline}</span>
                  <span className="font-body-sm text-sm text-on-surface-variant">this week</span>
                </div>
                <div className="mt-2 flex items-center justify-between font-body-sm text-xs text-on-surface-variant">
                  <span>32 slots occupied</span>
                  <span className="font-semibold text-primary">91% Pace</span>
                </div>
              </div>
            </div>

            {/* Main Execution Surface */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
              
              {/* Left Column: Calendar Schedule Grid (70%) */}
              <div className="lg:col-span-7 flex flex-col rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-surface-container-low border-b border-surface-container">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-surface-container-high transition-colors text-on-surface" type="button">
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                      </button>
                      <button className="p-1 rounded hover:bg-surface-container-high transition-colors text-on-surface" type="button">
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </button>
                    </div>
                    <span className="font-headline-sm text-lg font-bold text-on-surface">May 19 – May 23, 2025</span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-label-caps text-[10px] font-bold">WAT (UTC+1)</span>
                  </div>
                  <div className="flex items-center gap-3 font-label-md text-sm">
                    <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                      <span className="w-2.5 h-2.5 rounded bg-primary-container"></span> Enterprise
                    </span>
                    <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                      <span className="w-2.5 h-2.5 rounded bg-tertiary"></span> AI Auto-Booked
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto pb-4">
                  <div className="min-w-[760px] flex flex-col">
                    {/* Days Header */}
                    <div className="grid grid-cols-12 bg-surface-container-lowest shadow-sm border-b border-surface-container">
                      <div className="col-span-2 p-2 text-center font-label-caps text-xs font-bold text-on-surface-variant mt-auto">Time</div>
                      <div className="col-span-2 p-2 text-center border-l border-surface-container-high">
                        <div className="font-label-caps text-xs text-on-surface-variant uppercase font-bold">Mon 19</div>
                        <div className="font-headline-sm text-xl text-on-surface">19</div>
                      </div>
                      <div className="col-span-2 p-2 text-center bg-surface-container-low/60 rounded-t-lg border-l border-surface-container-high border-t-2 border-t-primary">
                        <div className="font-label-caps text-xs text-primary uppercase font-bold">Tue 20 (Today)</div>
                        <div className="font-headline-sm text-xl text-primary font-bold">20</div>
                      </div>
                      <div className="col-span-2 p-2 text-center border-l border-surface-container-high">
                        <div className="font-label-caps text-xs text-on-surface-variant uppercase font-bold">Wed 21</div>
                        <div className="font-headline-sm text-xl text-on-surface">21</div>
                      </div>
                      <div className="col-span-2 p-2 text-center border-l border-surface-container-high">
                        <div className="font-label-caps text-xs text-on-surface-variant uppercase font-bold">Thu 22</div>
                        <div className="font-headline-sm text-xl text-on-surface">22</div>
                      </div>
                      <div className="col-span-2 p-2 text-center border-l border-surface-container-high">
                        <div className="font-label-caps text-xs text-on-surface-variant uppercase font-bold">Fri 23</div>
                        <div className="font-headline-sm text-xl text-on-surface">23</div>
                      </div>
                    </div>

                    {/* Time Grid 09:00 - 12:00 */}
                    <div className="relative flex flex-col bg-surface-container-lowest">
                      
                      {/* 09:00 Slot */}
                      <div className="grid grid-cols-12 min-h-[72px] hover:bg-surface-container-low/30 transition-colors border-b border-surface-container-high/40">
                        <div className="col-span-2 p-2 font-label-caps text-xs text-on-surface-variant flex items-start justify-end pr-3">09:00</div>
                        <div className="col-span-2 p-1 border-l border-surface-container-high/40"></div>
                        <div className="col-span-2 p-1 bg-surface-container-low/40 border-l border-surface-container-high/40 border-r border-surface-container-high/40">
                          <div className="h-full p-2 rounded bg-surface-container-high/60 flex flex-col justify-center">
                            <span className="font-label-caps text-[10px] text-on-surface-variant font-bold">Pipeline Standup</span>
                            <span className="font-body-sm text-xs text-on-surface font-semibold truncate">SDR / AE Huddle</span>
                          </div>
                        </div>
                        <div className="col-span-2 p-1"></div>
                        <div className="col-span-2 p-1 border-l border-surface-container-high/40"></div>
                        <div className="col-span-2 p-1 border-l border-surface-container-high/40"></div>
                      </div>

                      {/* 10:00 Slot */}
                      <div className="grid grid-cols-12 min-h-[88px] hover:bg-surface-container-low/30 transition-colors border-b border-surface-container-high/40">
                        <div className="col-span-2 p-2 font-label-caps text-xs text-on-surface-variant flex items-start justify-end pr-3">10:00</div>
                        <div className="col-span-2 p-1 border-l border-surface-container-high/40"></div>
                        <div className="col-span-2 p-1 bg-surface-container-low/40 border-l border-surface-container-high/40 border-r border-surface-container-high/40">
                          <div className="h-full p-2 rounded-lg bg-primary-container text-on-primary shadow-sm flex flex-col justify-between cursor-pointer ring-2 ring-primary">
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-label-caps text-[10px] px-1 py-0.5 rounded bg-surface-container-lowest/20 font-bold">10:00 - 10:45</span>
                              <span className="font-label-caps text-[10px] font-bold">₦4.2M ACV</span>
                            </div>
                            <div>
                              <h2 className="font-headline-sm text-xs leading-tight font-bold truncate">Sterling & Sterling Ltd</h2>
                              <p className="font-body-sm text-[11px] opacity-90 truncate">Tunde Balogun (VP Ops)</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 p-1"></div>
                        <div className="col-span-2 p-1 border-l border-surface-container-high/40"></div>
                        <div className="col-span-2 p-1 border-l border-surface-container-high/40"></div>
                      </div>

                      {/* 11:00 Slot */}
                      <div className="grid grid-cols-12 min-h-[88px] hover:bg-surface-container-low/30 transition-colors border-b border-surface-container-high/40">
                        <div className="col-span-2 p-2 font-label-caps text-xs text-on-surface-variant flex items-start justify-end pr-3">11:00</div>
                        <div className="col-span-2 p-1 border-l border-surface-container-high/40"></div>
                        <div className="col-span-2 p-1 bg-surface-container-low/40 border-l border-surface-container-high/40 border-r border-surface-container-high/40">
                           <div className="h-full p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-all flex flex-col justify-between cursor-pointer mt-4">
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-label-caps text-[10px] px-1 py-0.5 rounded bg-surface-container-lowest text-primary font-bold">11:30 - 12:15</span>
                              <span className="font-label-caps text-[10px] font-bold text-on-surface">₦8.5M ACV</span>
                            </div>
                            <div>
                              <h2 className="font-headline-sm text-xs leading-tight font-bold text-on-surface truncate">PayPulse Africa</h2>
                              <p className="font-body-sm text-[11px] text-on-surface-variant truncate">Exec Demo</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 p-1"></div>
                        <div className="col-span-2 p-1 border-l border-surface-container-high/40"></div>
                        <div className="col-span-2 p-1 border-l border-surface-container-high/40"></div>
                      </div>

                      {/* 12:00 Slot */}
                      <div className="grid grid-cols-12 min-h-[64px] hover:bg-surface-container-low/30 transition-colors border-b border-surface-container-high/40">
                        <div className="col-span-2 p-2 font-label-caps text-xs text-on-surface-variant flex items-start justify-end pr-3">12:00</div>
                        <div className="col-span-2 p-1 border-l border-surface-container-high/40"></div>
                        <div className="col-span-2 p-1 bg-surface-container-low/40 border-l border-surface-container-high/40 border-r border-surface-container-high/40">
                          <div className="h-full flex items-center justify-center rounded bg-surface-container-low text-outline font-label-caps text-[10px] uppercase font-bold">Exec Buffer</div>
                        </div>
                        <div className="col-span-2 p-1"></div>
                        <div className="col-span-2 p-1 border-l border-surface-container-high/40"></div>
                        <div className="col-span-2 p-1 border-l border-surface-container-high/40"></div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Selected Appointment Intelligence Pack (30%) */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                <div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container gap-4">
                  
                  {firstApt ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-label-caps text-[10px] font-bold">
                          {new Date(firstApt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WAT
                        </span>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-caps text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[13px]">bolt</span>
                          <span>Score: {firstApt.lead.buyingIntent || 50}</span>
                        </div>
                      </div>
                      <h2 className="font-headline-lg text-xl font-bold text-on-surface mt-1">{firstApt.lead.name}</h2>
                      <div className="flex items-center justify-between font-body-md text-sm">
                        <span className="text-on-surface-variant font-medium">{firstApt.lead.email}</span>
                        <span className="font-metric-numeral-md text-lg font-bold text-primary">{formattedFirstAptDeal}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <h2 className="font-headline-lg text-xl font-bold text-on-surface mt-1">No Upcoming Appointments</h2>
                    </div>
                  )}

                  <div className="flex flex-col p-3 rounded-lg bg-surface-container-low gap-3 border border-surface-container">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-xs text-on-surface-variant uppercase font-bold">Buying Committee</span>
                      <span className="font-label-caps text-[10px] text-primary font-bold">1 Verified</span>
                    </div>
                    {firstApt && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between py-1.5 bg-surface-container-lowest px-2 rounded shadow-sm border border-surface-container">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary font-label-caps text-[10px] font-bold">
                              {firstApt.lead.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-body-sm text-xs font-semibold text-on-surface truncate">{firstApt.lead.name}</span>
                              <span className="font-label-caps text-[10px] text-on-surface-variant truncate">Decision Maker</span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1 font-label-caps text-xs text-primary uppercase font-bold">
                      <span className="material-symbols-outlined text-[14px]">psychology</span>
                      <span>Prescribed Playbook</span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-body-sm text-sm shadow-inner">
                      <p className="leading-relaxed">
                        Address <strong className="font-semibold text-primary">webhook latency</strong> and confirm <strong className="font-semibold text-on-surface">NDPR on-soil hosting</strong> compliance within Lagos tier-3 data centers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/70 font-body-sm text-xs text-on-surface-variant border border-surface-container">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      Zoom Bridge
                    </span>
                    <span className="font-label-caps text-[10px] text-primary font-bold">READY</span>
                  </div>

                  <div className="flex flex-col gap-2 mt-1">
                    <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-sm font-bold shadow-sm transition-all">
                      <span className="material-symbols-outlined text-[18px]">videocam</span>
                      <span>Join Meeting Link</span>
                    </button>
                    <button className="w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-inverse-surface text-inverse-on-surface hover:opacity-95 font-label-md text-sm font-bold transition-all">
                      <span className="material-symbols-outlined text-[16px]">task_alt</span>
                      <span>Log Call Outcome</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
