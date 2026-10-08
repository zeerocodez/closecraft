import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';
import { NewDealModal } from './NewDealModal';
import { getDealsForTenant } from '@/lib/dal/deal';

export default async function PipelinePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = session.organizationId;
  if (!organizationId) {
    redirect("/login");
  }

  // Fetch deals via DAL
  const deals = await getDealsForTenant(organizationId as string);

  const availableLeads = await db.lead.findMany({
    where: { organizationId },
    select: { id: true, name: true }
  });

  const stages = ['OPPORTUNITY', 'PROPOSAL', 'WON', 'LOST'];

  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-on-surface">Pipeline</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage and move deals through the revenue process.</p>
        </div>
        <div className="flex items-center gap-3">
          <NewDealModal leads={availableLeads} />
        </div>
      </div>

      <div className="flex-1 w-full overflow-x-auto overflow-y-hidden pb-8">
        <div className="flex items-start gap-4 h-[calc(100vh-220px)] min-h-[500px]">
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
                    {stageDeals.map((deal) => {
                      const nextAction = deal.lead.revenueActions?.[0];
                      const isHot = deal.lead.buyingIntent && deal.lead.buyingIntent >= 80;

                      return (
                        <div key={deal.id} className="p-3 bg-surface border border-surface-container-high rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-1">
                              {isHot && <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0 animate-pulse"></span>}
                              <span className="truncate">{deal.lead.name}</span>
                            </h3>
                            <span className="font-label-caps text-[10px] text-primary font-bold">₦{(deal.amount / 1000000).toFixed(1)}M</span>
                          </div>
                          <div className="flex flex-col gap-1.5 text-on-surface-variant font-body-sm text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="truncate">{deal.lead.email}</span>
                              <span className="font-label-caps px-1 py-0.5 rounded bg-surface-container text-on-surface-variant">Q3</span>
                            </div>
                            {nextAction && (
                              <div className="mt-1 pt-1.5 border-t border-surface-container/50 flex items-center justify-between gap-1">
                                <span className="truncate text-secondary font-medium">Action: {nextAction.type.replace(/_/g, ' ')}</span>
                                <span className="material-symbols-outlined text-[12px]">{nextAction.recommendedActor === 'HUMAN' ? 'person' : 'smart_toy'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
