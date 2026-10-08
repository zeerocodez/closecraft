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
    closedWonDeals,
    revenueLeaksCount
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
    }),
    db.revenueLeak.count({ where: { organizationId, status: 'OPEN' } })
  ]);

  const pipelineValue = totalPipeline._sum.amount || 0;
  const formattedPipeline = `₦${(pipelineValue / 1000000).toFixed(1)}M`;
  
  const closedWonValue = closedWonDeals._sum.amount || 0;
  const formattedClosedWon = `₦${(closedWonValue / 1000000).toFixed(1)}M`;
  
  const aiQualRate = totalLeads > 0 ? Math.round((aiQualifiedCount / totalLeads) * 100) : 0;
  const demoRate = aiQualifiedCount > 0 ? Math.round((appointmentsCount / aiQualifiedCount) * 100) : 0;

  // Revenue Action Items
  // High priority actions assigned to Humans
  const pendingHumanActions = await db.revenueAction.findMany({
    where: {
      organizationId,
      status: 'PENDING',
      recommendedActor: 'HUMAN'
    },
    include: {
      lead: true
    },
    take: 6,
    orderBy: { priority: 'desc' }
  });

  return (
    <>
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl z-40 flex items-center justify-between px-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-6">
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
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-low rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="font-label-caps text-label-caps font-semibold text-on-surface-variant tracking-wide">Telemetry: 340ms • 99.98% Integrity</span>
            </div>
            <button className="h-9 px-4 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold rounded-lg flex items-center gap-space-xs shadow-[0_1px_3px_rgba(21,80,211,0.25)] transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Lead</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        <main className="relative pt-24 min-h-screen w-full px-8 pb-space-xl overflow-y-auto">
          {/* Operational Sub-Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-space-lg">
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
              <button className="h-9 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold rounded-lg flex items-center gap-space-xs transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-tertiary">stream</span>
                <span>Autopilot Stream</span>
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              </button>
            </div>
          </div>

          {/* Premium Spacious KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-surface-container flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-4">
                <span className="font-label-caps text-label-caps uppercase tracking-widest font-semibold text-xs">Inbound Leads</span>
                <span className="material-symbols-outlined text-[20px] text-primary">hub</span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-4xl font-bold text-on-surface font-serif">{totalLeads}</span>
                <span className="font-label-caps text-label-caps text-primary bg-primary-container px-2 py-1 rounded font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>+18%
                </span>
              </div>
              <div className="mt-4 w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[78%]"></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-surface-container flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-4">
                <span className="font-label-caps text-label-caps uppercase tracking-widest font-semibold text-xs">AI Qualified</span>
                <span className="material-symbols-outlined text-[20px] text-tertiary">neurology</span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-4xl font-bold text-on-surface font-serif">{aiQualifiedCount}</span>
                <span className="font-label-caps text-label-caps text-secondary font-bold bg-surface-container-high px-2 py-1 rounded">{aiQualRate}% rate</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-on-surface-variant font-medium">
                <span>Passed BANT threshold</span>
                <span className="text-tertiary">94.2% fidelity</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-surface-container flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-4">
                <span className="font-label-caps text-label-caps uppercase tracking-widest font-semibold text-xs">Active Pipeline</span>
                <span className="material-symbols-outlined text-[20px] text-primary">view_kanban</span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-4xl font-bold text-on-surface font-serif">{formattedPipeline}</span>
                <span className="font-label-caps text-label-caps text-primary bg-primary-container px-2 py-1 rounded font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+14%
                </span>
              </div>
              <div className="mt-4 text-sm text-on-surface-variant font-medium">
                <span className="font-bold text-on-surface">{activeDealsCount}</span> live enterprise deals
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-surface-container flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-4">
                <span className="font-label-caps text-label-caps uppercase tracking-widest font-semibold text-xs">Appointments</span>
                <span className="material-symbols-outlined text-[20px] text-secondary">calendar_today</span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-4xl font-bold text-on-surface font-serif">{appointmentsCount}</span>
                <span className="font-label-caps text-label-caps text-on-surface font-bold bg-surface-container-high px-2 py-1 rounded">{demoRate}% rate</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-secondary font-medium">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span>Scheduled via AI</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-surface-container flex flex-col justify-between col-span-1 md:col-span-2 xl:col-span-1">
              <div className="flex items-center justify-between text-secondary mb-4">
                <span className="font-label-caps text-label-caps uppercase tracking-widest font-semibold text-xs">Closed Won</span>
                <span className="material-symbols-outlined text-[20px] text-primary">verified</span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-4xl font-bold text-primary font-serif">{formattedClosedWon}</span>
                <span className="font-label-caps text-label-caps text-primary bg-primary-container px-2 py-1 rounded font-bold">41.3% win</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-on-surface-variant font-medium">
                <span>Target: ₦45M</span>
                <span className="font-bold text-on-surface">84.8% of goal</span>
              </div>
            </div>
          </div>

            <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-lg p-8 mb-12 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 border-b border-surface-container">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-error animate-pulse"></div>
                  <h2 className="text-2xl font-bold text-on-surface font-serif">Command Centre: Needs Attention</h2>
                  <span className="px-3 py-1 rounded-full bg-error-container text-on-error-container text-xs font-bold uppercase tracking-widest">{pendingHumanActions.length} Action(s)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {pendingHumanActions.map(action => (
                  <div key={action.id} className="bg-surface-container-low hover:bg-surface-container transition-colors p-6 rounded-xl flex flex-col justify-between gap-6 border border-surface-container">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[24px]">priority</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-on-surface">{action.lead.name}</span>
                            <span className="text-xs uppercase bg-error/10 text-error px-2 py-1 rounded font-bold tracking-widest">Priority {action.priority}</span>
                          </div>
                          <p className="text-base text-on-surface mt-2 font-medium">
                            {action.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                            {action.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-surface-container">
                      <span className="text-sm text-secondary font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">schedule</span> Pending for {Math.floor((Date.now() - new Date(action.createdAt).getTime()) / 60000)} mins
                      </span>
                      <div className="flex items-center gap-3">
                        <Link href="/inbox" className="h-10 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-bold transition-colors flex items-center gap-2 shadow-sm">
                          <span className="material-symbols-outlined text-[18px]">call</span>
                          <span>Execute in Inbox</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                
                {pendingHumanActions.length === 0 && revenueLeaksCount === 0 && (
                  <div className="col-span-1 xl:col-span-2 text-center p-6 text-on-surface-variant font-body-sm border border-dashed border-surface-container rounded-lg">
                    All high-intent leads are being actively managed. No leaks detected.
                  </div>
                )}
                {revenueLeaksCount > 0 && (
                  <div className="col-span-1 xl:col-span-2 bg-error/10 text-error p-4 rounded-lg flex items-center justify-between border border-error/20">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">warning</span>
                      <span className="font-bold">{revenueLeaksCount} Active Revenue Leak(s) Detected!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </main>
    </>
  );
}

