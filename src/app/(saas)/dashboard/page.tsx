import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = session.organizationId;
  if (!organizationId) {
    redirect("/login");
  }
  const user = session.user;

  // Fetch real data for this tenant
  const [
    totalLeads, 
    activeDealsCount, 
    totalPipeline,
    aiQualifiedCount,
    appointmentsCount,
    closedWonDeals
  ] = await Promise.all([
    db.lead.count({ where: { organizationId } }),
    db.deal.count({ where: { organizationId, stage: { notIn: ['WON', 'LOST'] } } }),
    db.deal.aggregate({
      where: { organizationId, stage: { notIn: ['WON', 'LOST'] } },
      _sum: { amount: true }
    }),
    db.lead.count({ where: { organizationId, buyingIntent: { gte: 70 } } }),
    db.appointment.count({ where: { organizationId } }),
    db.deal.aggregate({
      where: { organizationId, stage: 'WON' },
      _sum: { amount: true }
    })
  ]);

  const pipelineValue = totalPipeline._sum.amount || 0;
  const formattedPipeline = `₦${(pipelineValue / 1000000).toFixed(1)}M`;
  
  const closedWonValue = closedWonDeals._sum.amount || 0;
  const formattedClosedWon = `₦${(closedWonValue / 1000000).toFixed(1)}M`;
  
  const aiQualRate = totalLeads > 0 ? Math.round((aiQualifiedCount / totalLeads) * 100) : 0;
  const demoRate = aiQualifiedCount > 0 ? Math.round((appointmentsCount / aiQualifiedCount) * 100) : 0;

  // Revenue Leakage & Action Items
  // High intent leads that have not been updated in 5 minutes (for demo purposes)
  const thresholdDate = new Date(Date.now() - 5 * 60 * 1000);
  const leakedLeads = await db.lead.findMany({
    where: {
      organizationId,
      buyingIntent: { gte: 80 },
      updatedAt: { lt: thresholdDate }
    },
    take: 4,
    orderBy: { buyingIntent: 'desc' }
  });

  return (
    <>
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl z-40 flex items-center justify-between px-gutter-desktop shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <span className="font-label-md text-label-md text-secondary font-medium">Revenue Workspace</span>
              <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
              <span className="font-label-md text-label-md text-on-surface font-bold">Production Fleet</span>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-space-sm text-on-surface-variant text-[18px]">search</span>
              <input className="w-80 h-9 pl-9 pr-14 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-[0_1px_2px_rgba(0,0,0,0.03)]" placeholder="Search leads, companies, deals..." type="text"/>
              <div className="absolute right-space-xs flex items-center px-1.5 py-0.5 bg-surface-container text-on-surface-variant font-label-caps text-label-caps rounded font-medium">⌘K</div>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-low rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="font-label-caps text-label-caps font-semibold text-on-surface-variant tracking-wide">Telemetry: 340ms • 99.98% Integrity</span>
            </div>
            <button className="h-9 px-space-md bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold rounded-lg flex items-center gap-space-xs shadow-[0_1px_3px_rgba(21,80,211,0.25)] transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Lead</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        <main className="relative pt-24 min-h-screen w-full px-gutter-desktop pb-space-xl overflow-y-auto">
          {/* Operational Sub-Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-lg">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-sm mb-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps uppercase tracking-wider font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                  Live Ingest Fleet
                </span>
                <span className="font-body-sm text-body-sm text-secondary">• Engine v3.4 Active</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">Good morning, {user.name?.split(' ')[0] || 'Sarah'}.</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Here's what needs your revenue attention today across <span className="font-semibold text-on-surface">Acme Enterprise Ops</span>.</p>
            </div>
            <div className="flex items-center gap-space-sm self-start lg:self-center">
              <div className="inline-flex items-center bg-surface-container-lowest shadow-sm rounded-lg px-space-sm py-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary mr-1.5">calendar_month</span>
                <select className="bg-transparent font-label-md text-label-md font-semibold text-on-surface focus:outline-none cursor-pointer">
                  <option>Q3 2024 / MTD (Current)</option>
                  <option>Q2 2024 (Historical)</option>
                  <option>Trailing 30 Days</option>
                </select>
              </div>
              <button className="h-9 px-space-md bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold rounded-lg flex items-center gap-space-xs transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-tertiary">stream</span>
                <span>Autopilot Stream</span>
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              </button>
            </div>
          </div>

          {/* Compact Executive KPI Bar */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-space-sm mb-space-lg">
            <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-1">
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold">Inbound Leads</span>
                <span className="material-symbols-outlined text-[16px] text-primary">hub</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-metric-numeral-lg text-metric-numeral-lg font-bold text-on-surface">{totalLeads}</span>
                <span className="font-label-caps text-label-caps text-primary bg-primary-fixed/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>+18% MoM
                </span>
              </div>
              <div className="mt-2 w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[78%]"></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-1">
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold">AI Qualified</span>
                <span className="material-symbols-outlined text-[16px] text-tertiary">neurology</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-metric-numeral-lg text-metric-numeral-lg font-bold text-on-surface">{aiQualifiedCount}</span>
                <span className="font-label-caps text-label-caps text-secondary font-semibold">{aiQualRate}% rate</span>
              </div>
              <div className="mt-2 flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
                <span>Passed BANT threshold</span>
                <span className="font-medium text-tertiary">94.2% fidelity</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-1">
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold">Active Pipeline</span>
                <span className="material-symbols-outlined text-[16px] text-primary">view_kanban</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-metric-numeral-lg text-metric-numeral-lg font-bold text-on-surface">{formattedPipeline}</span>
                <span className="font-label-caps text-label-caps text-primary bg-primary-fixed/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">arrow_upward</span>+14% vs Q2
                </span>
              </div>
              <div className="mt-2 text-on-surface-variant font-body-sm text-body-sm">
                <span className="font-semibold text-on-surface">{activeDealsCount}</span> live enterprise deals
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-1">
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold">Appointments</span>
                <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-metric-numeral-lg text-metric-numeral-lg font-bold text-on-surface">{appointmentsCount}</span>
                <span className="font-label-caps text-label-caps text-on-surface font-semibold bg-surface-container px-1.5 py-0.5 rounded">{demoRate}% demo rate</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 font-body-sm text-body-sm text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>Scheduled via AI</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-secondary mb-1">
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold">Closed Won</span>
                <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-metric-numeral-lg text-metric-numeral-lg font-bold text-primary">{formattedClosedWon}</span>
                <span className="font-label-caps text-label-caps text-primary bg-primary-fixed/40 px-1.5 py-0.5 rounded font-bold">41.3% win rate</span>
              </div>
              <div className="mt-2 flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
                <span>Target: ₦45M</span>
                <span className="font-semibold text-on-surface">84.8% of goal</span>
              </div>
            </div>
          </div>

            <div className="bg-surface-container-lowest rounded-lg shadow-sm p-space-md mb-space-lg flex flex-col gap-space-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-xs gap-space-xs">
                <div className="flex items-center gap-space-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></div>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Revenue Leakage & Attention</h2>
                  <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-caps text-label-caps font-bold">{leakedLeads.length} Action(s)</span>
                </div>
                <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px]">timer</span>
                  <span>SLA Threshold: 5m stale</span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-sm">
                {leakedLeads.map(lead => (
                  <div key={lead.id} className="bg-surface-container-low/70 hover:bg-surface-container-low transition-colors p-space-md rounded-lg flex flex-col justify-between gap-space-sm">
                    <div className="flex items-start justify-between gap-space-sm">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-9 h-9 rounded-lg bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">pause_circle</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-space-xs">
                            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{lead.name}</span>
                            <span className="font-label-caps text-label-caps uppercase bg-error/10 text-error px-1.5 py-0.2 rounded font-bold">URGENT</span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                            High buying intent (Score: {lead.buyingIntent}) but no activity recently. AI follow-up exhausted or halted.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-space-xs">
                      <span className="font-label-caps text-label-caps text-secondary font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span> {Math.floor((Date.now() - new Date(lead.updatedAt).getTime()) / 60000)} mins overdue
                      </span>
                      <div className="flex items-center gap-space-xs">
                        <Link href="/inbox" className="h-8 px-space-sm rounded bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined text-[16px]">person_check</span>
                          <span>Triage in Inbox</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                
                {leakedLeads.length === 0 && (
                  <div className="col-span-1 xl:col-span-2 text-center p-6 text-on-surface-variant font-body-sm">
                    All high-intent leads are being actively managed. No leaks detected.
                  </div>
                )}
              </div>
            </div>
        </main>
    </>
  );
}

