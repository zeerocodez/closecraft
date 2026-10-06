import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';

export default async function PipelinePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = (session as any).organizationId;

  // Fetch deals with their associated leads
  const deals = await db.deal.findMany({
    where: { organizationId },
    include: { lead: true },
    orderBy: { updatedAt: 'desc' }
  });

  const stages = ['OPPORTUNITY', 'PROPOSAL', 'WON', 'LOST'];

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
                </a>
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors bg-primary text-on-primary font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.2)]" href="/pipeline">
                  <span className="material-symbols-outlined text-[18px]">view_kanban</span>
                  <span>Pipeline</span>
                </a>
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-body-md text-body-md text-inverse-on-surface/80 hover:bg-surface-container-highest/20 hover:text-inverse-on-surface transition-colors" href="/appointments">
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
              <span className="font-label-md text-label-md text-on-surface font-bold">Pipeline</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-9 px-3 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold rounded-lg flex items-center gap-1 shadow-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New Deal</span>
            </button>
          </div>
        </header>

        <main className="relative pt-24 min-h-screen w-full px-6 pb-8 overflow-x-auto overflow-y-hidden">
          <div className="flex items-start gap-4 h-[calc(100vh-120px)]">
            {stages.map((stage) => {
              const stageDeals = deals.filter(d => d.stage === stage);
              const stageValue = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
              
              return (
                <div key={stage} className="flex flex-col w-80 shrink-0 h-full bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container">
                  <div className="p-3 border-b border-surface-container bg-surface-container-low/50 rounded-t-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label-caps text-label-caps font-bold text-on-surface uppercase tracking-wider">{stage}</span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-caps text-[10px] font-bold">{stageDeals.length}</span>
                    </div>
                    <span className="font-metric-numeral-md text-sm font-bold text-primary">₦{(stageValue / 1000000).toFixed(1)}M</span>
                  </div>
                  
                  <div className="flex-1 p-2 overflow-y-auto space-y-2 bg-surface-container-lowest/30">
                    {stageDeals.map((deal) => (
                      <div key={deal.id} className="p-3 bg-surface border border-surface-container-high rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-headline-sm text-sm font-bold text-on-surface">{deal.lead.name}</h3>
                          <span className="font-label-caps text-[10px] text-primary font-bold">₦{(deal.amount / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-[11px]">
                          <span className="truncate">{deal.lead.email}</span>
                          <span className="font-label-caps px-1 py-0.5 rounded bg-surface-container text-on-surface-variant">Q3</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
