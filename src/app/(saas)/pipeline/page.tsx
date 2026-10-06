import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';

export default async function PipelinePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = session.organizationId;
  if (!organizationId) {
    redirect("/login");
  }

  // Fetch deals with their associated leads
  const deals = await db.deal.findMany({
    where: { organizationId },
    include: { lead: true },
    orderBy: { updatedAt: 'desc' }
  });

  const stages = ['OPPORTUNITY', 'PROPOSAL', 'WON', 'LOST'];

  return (
    <>
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

        <main className="relative pt-24 min-h-screen w-full px-gutter-desktop pb-space-xl overflow-x-auto overflow-y-hidden">
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
    </>
  );
}
