import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = (session as any).organizationId;
  const user = session.user;

  // Fetch real data for this tenant
  const [totalLeads, activeDealsCount, totalPipeline] = await Promise.all([
    db.lead.count({ where: { organizationId } }),
    db.deal.count({ where: { organizationId, stage: { notIn: ['WON', 'LOST'] } } }),
    db.deal.aggregate({
      where: { organizationId, stage: { notIn: ['WON', 'LOST'] } },
      _sum: { amount: true }
    })
  ]);

  const pipelineValue = totalPipeline._sum.amount || 0;
  // Format pipeline value nicely (e.g. ₦142.8M)
  const formattedPipeline = `₦${(pipelineValue / 1000000).toFixed(1)}M`;

  return (
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
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors bg-primary text-on-primary font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.2)]" href="/dashboard">
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
                  <span className="px-1.5 py-0.5 rounded-full font-label-caps text-label-caps bg-primary text-on-primary font-bold">5</span>
                </a>
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-body-md text-body-md text-inverse-on-surface/80 hover:bg-surface-container-highest/20 hover:text-inverse-on-surface transition-colors" href="/pipeline">
                  <span className="material-symbols-outlined text-[18px]">view_kanban</span>
                  <span>Pipeline</span>
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
              <span className="font-label-md text-label-md text-on-surface font-bold">Production Fleet</span>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2 text-on-surface-variant text-[18px]">search</span>
              <input className="w-80 h-9 pl-9 pr-14 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-[0_1px_2px_rgba(0,0,0,0.03)]" placeholder="Search leads, companies, deals..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-9 px-3 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold rounded-lg flex items-center gap-1 shadow-[0_1px_3px_rgba(21,80,211,0.25)] transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Lead</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        <main className="relative pt-24 min-h-screen w-full px-6 pb-8 overflow-y-auto">
          {/* Operational Sub-Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps uppercase tracking-wider font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                  Live Ingest Fleet
                </span>
                <span className="font-body-sm text-body-sm text-secondary">• Engine v3.4 Active</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">Good morning, {user.name?.split(' ')[0] || 'there'}.</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Here's what needs your revenue attention today across <span className="font-semibold text-on-surface">your workspace</span>.</p>
            </div>
          </div>

          {/* KPI Bar */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
            <div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-1">
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold">Inbound Leads</span>
                <span className="material-symbols-outlined text-[16px] text-primary">hub</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-metric-numeral-lg text-metric-numeral-lg font-bold text-on-surface">{totalLeads.toLocaleString()}</span>
                <span className="font-label-caps text-label-caps text-primary bg-primary-fixed/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>+18% MoM
                </span>
              </div>
              <div className="mt-2 w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[78%]"></div>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-1">
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold">AI Qualified</span>
                <span className="material-symbols-outlined text-[16px] text-tertiary">neurology</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-metric-numeral-lg text-metric-numeral-lg font-bold text-on-surface">524</span>
                <span className="font-label-caps text-label-caps text-secondary font-semibold">36.7% rate</span>
              </div>
              <div className="mt-2 flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
                <span>Pass-through peak</span>
                <span className="font-medium text-tertiary">94.2% fidelity</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm flex flex-col justify-between">
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
            
            {/* Additional KPI cards hidden for brevity */}
          </div>

          {/* Action Ledger */}
          <div className="bg-surface-container-lowest rounded-lg shadow-sm p-4 flex flex-col gap-3 border border-surface-container-low">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-1">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></div>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Needs Your Attention</h2>
                  <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-caps text-label-caps font-bold">Action Required</span>
                </div>
             </div>
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-2">
                <div className="bg-surface-container-low/70 p-4 rounded-lg flex flex-col justify-between border border-surface-container">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">shield</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">David Chen</span>
                        <span className="font-body-sm text-body-sm text-secondary font-medium">@ PayPulse Africa</span>
                        <span className="font-label-caps text-label-caps bg-primary-fixed text-on-primary-fixed px-1.5 py-0.5 rounded font-bold">SCORE 79</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Sensitive compliance inquiry regarding Central Bank of Nigeria (CBN) on-soil data residency & auditing.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-surface-container-high">
                    <span className="font-label-caps text-label-caps text-secondary font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">mark_chat_unread</span> Live conversation queued
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="h-8 px-3 rounded bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">forum</span>
                        <span>Take Over Chat</span>
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
