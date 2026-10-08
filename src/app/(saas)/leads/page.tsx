import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';
import { claimRevenueAction } from '@/app/(saas)/actions';
import { AddLeadModal } from './AddLeadModal';
import { getLeadsForTenant } from '@/lib/dal/lead';

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = session.organizationId;
  if (!organizationId) {
    redirect("/login");
  }

  // Fetch leads for this tenant via DAL
  const leads = await getLeadsForTenant(organizationId as string);

  const totalLeads = leads.length;
  // Calculate total pipeline from the deals attached to these leads
  const pipelineValue = leads.reduce((sum, lead) => {
    return sum + lead.deals.reduce((dealSum, deal) => dealSum + (deal.amount || 0), 0);
  }, 0);
  
  const formattedPipeline = `₦${(pipelineValue / 1000000).toFixed(1)}M`;
  const qualifiedCount = leads.filter(l => l.status === 'SCHEDULED' || l.buyingIntent && l.buyingIntent >= 80).length;
  const needsReviewCount = leads.filter(l => l.status === 'NEW').length;

  return (
    <>
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl z-40 flex items-center justify-between px-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <span className="font-label-md text-label-md text-secondary font-medium">Revenue Workspace</span>
              <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
              <span className="font-label-md text-label-md text-on-surface font-bold">Leads</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AddLeadModal />
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        <main className="relative pt-24 min-h-screen w-full px-8 pb-space-xl overflow-y-auto">
          {/* Command Header */}
          <div className="flex flex-col gap-2 pt-1 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Leads Management</h1>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-caps text-label-caps font-bold tracking-wider uppercase shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                      {totalLeads} Total Leads • {formattedPipeline} Qualified Pipeline
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Real-time ICP scoring, authority graphs, and AI pipeline orchestration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 bg-surface-container-lowest p-2 rounded-xl shadow-sm mb-4">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <button className="px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold bg-primary text-on-primary shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                <span>All</span>
                <span className="px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary font-label-caps text-label-caps leading-none">{totalLeads}</span>
              </button>
              <button className="px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <span>Qualified</span>
                <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-secondary font-label-caps text-label-caps leading-none">{qualifiedCount}</span>
              </button>
              <button className="px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                <span>Needs Review</span>
                <span className="px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-caps text-label-caps font-bold leading-none">{needsReviewCount}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex items-center w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-2 text-on-surface-variant text-[18px]">search</span>
                <input className="w-full h-8 pl-8 pr-12 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary shadow-inner" placeholder="Filter leads..." type="text"/>
              </div>
            </div>
          </div>

          {/* High-Density Data Ledger */}
          <div className="w-full bg-surface-container-lowest rounded-xl shadow-md overflow-hidden flex flex-col border border-surface-container">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                    <th className="py-2 px-4 w-10">
                      <input className="w-4 h-4 rounded bg-surface-container-lowest accent-primary cursor-pointer" type="checkbox"/>
                    </th>
                    <th className="py-2 px-3 min-w-[200px]">Lead & Contact</th>
                    <th className="py-2 px-3 min-w-[140px]">Source</th>
                    <th className="py-2 px-3 min-w-[90px]">Intent</th>
                    <th className="py-2 px-3 min-w-[220px]">Value & Status</th>
                    <th className="py-2 px-3 min-w-[250px]">Next Best Action</th>
                    <th className="py-2 px-4 text-right min-w-[150px]">Execute</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/40 font-body-sm text-body-sm">
                  {leads.map((lead, idx) => {
                    const initials = lead.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    
                    const intentSignal = lead.revenueSignals[0];
                    const intentScore = intentSignal ? intentSignal.value : (lead.buyingIntent || 50);
                    const isHot = intentScore > 80;

                    const nextAction = lead.revenueActions[0];
                    const pipeline = lead.deals[0] ? `₦${(lead.deals[0].amount / 1000000).toFixed(1)}M` : 'No Deal';
                    
                    return (
                      <tr key={lead.id} className={`hover:bg-surface-container-low/60 transition-colors ${idx % 2 !== 0 ? 'bg-surface-container-low/20' : ''}`}>
                        <td className="py-3 px-4">
                          <input className="w-4 h-4 rounded bg-surface-container-lowest accent-primary cursor-pointer" type="checkbox"/>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${isHot ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-secondary-container text-on-secondary-fixed'} font-headline-sm text-headline-sm font-bold flex items-center justify-center shrink-0`}>
                              {initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-headline-sm text-headline-sm font-bold text-on-surface hover:text-primary cursor-pointer truncate">{lead.name}</span>
                                {isHot && <span className="material-symbols-outlined text-[14px] text-primary" title="High Intent Signal">local_fire_department</span>}
                              </div>
                              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{lead.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md font-semibold text-on-surface">{lead.source || 'Direct'}</span>
                            <span className="font-body-sm text-body-sm text-secondary truncate max-w-[130px]">{new Date(lead.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${isHot ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-high text-on-surface'} font-headline-sm text-headline-sm font-bold`}>
                            {isHot && <span className="material-symbols-outlined text-[16px] text-primary">stars</span>}
                            {!isHot && <span className="material-symbols-outlined text-[16px] text-secondary">analytics</span>}
                            <span>{intentScore}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-label-md text-label-md font-semibold text-on-surface">{pipeline}</span>
                            {lead.status === 'NEW' ? (
                              <span className="inline-flex w-fit items-center gap-1 px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-caps text-[10px] uppercase font-bold tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                                Needs Review
                              </span>
                            ) : (
                              <span className="inline-flex w-fit items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface font-label-caps text-[10px] uppercase font-bold tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                {lead.status}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {nextAction ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-label-md text-label-md font-semibold text-on-surface">{nextAction.type.replace(/_/g, ' ')}</span>
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] text-secondary">
                                  {nextAction.recommendedActor === 'AI' ? 'smart_toy' : nextAction.recommendedActor === 'HUMAN' ? 'person' : 'settings'}
                                </span>
                                <span className="font-body-sm text-[11px] text-on-surface-variant truncate max-w-[200px]" title={nextAction.reason || ''}>{nextAction.reason || 'Automated Engine Action'}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-on-surface-variant text-body-sm italic">No action pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {nextAction && nextAction.recommendedActor === 'HUMAN' ? (
                            <form action={async () => {
                              "use server"
                              await claimRevenueAction(nextAction.id)
                            }}>
                              <button type="submit" className="h-8 px-2.5 bg-primary hover:bg-primary-container text-on-primary font-label-caps text-label-caps uppercase font-bold rounded flex items-center gap-1 shadow-sm transition-colors float-right">
                                <span className="material-symbols-outlined text-[15px]">call</span>
                                <span>Claim & Dial</span>
                              </button>
                            </form>
                          ) : nextAction && nextAction.recommendedActor === 'AUTOMATION' ? (
                            <button className="h-8 px-2.5 bg-inverse-surface hover:bg-inverse-surface/80 text-inverse-on-surface font-label-caps text-label-caps uppercase font-bold rounded flex items-center gap-1 shadow-sm transition-colors float-right">
                              <span className="material-symbols-outlined text-[15px]">robot</span>
                              <span>Auto</span>
                            </button>
                          ) : (
                            <button className="h-8 px-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-caps text-label-caps uppercase font-bold rounded flex items-center gap-1 shadow-sm transition-colors float-right">
                              <span className="material-symbols-outlined text-[15px]">visibility</span>
                              <span>View</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
    </>
  );
}
