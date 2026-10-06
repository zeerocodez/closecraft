import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = (session as any).organizationId;
  const user = session.user;

  // Fetch leads for this tenant
  const leads = await db.lead.findMany({
    where: { organizationId },
    include: {
      deals: true
    },
    orderBy: { buyingIntent: 'desc' }
  });

  const totalLeads = leads.length;
  // Calculate total pipeline from the deals attached to these leads
  const pipelineValue = leads.reduce((sum, lead) => {
    return sum + lead.deals.reduce((dealSum, deal) => dealSum + (deal.amount || 0), 0);
  }, 0);
  
  const formattedPipeline = `₦${(pipelineValue / 1000000).toFixed(1)}M`;
  const qualifiedCount = leads.filter(l => l.status === 'SCHEDULED' || l.buyingIntent && l.buyingIntent >= 80).length;
  const needsReviewCount = leads.filter(l => l.status === 'NEW').length;

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
                <a className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors bg-primary text-on-primary font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.2)]" href="/leads">
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
              <span className="font-label-md text-label-md text-on-surface font-bold">Leads</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-9 px-3 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold rounded-lg flex items-center gap-1 shadow-[0_1px_3px_rgba(21,80,211,0.25)] transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Lead</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        <main className="relative pt-24 min-h-screen w-full px-6 pb-8 overflow-y-auto">
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
                    <th className="py-2 px-3 min-w-[140px]">Company</th>
                    <th className="py-2 px-3 min-w-[90px]">Score</th>
                    <th className="py-2 px-3 min-w-[220px]">BANT Matrix</th>
                    <th className="py-2 px-3 min-w-[130px]">Status</th>
                    <th className="py-2 px-4 text-right min-w-[180px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/40 font-body-sm text-body-sm">
                  {leads.map((lead, idx) => {
                    const initials = lead.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    const isHot = lead.buyingIntent && lead.buyingIntent > 90;
                    
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
                                {isHot && <span className="material-symbols-outlined text-[14px] text-primary" title="Verified Authority Signer">verified</span>}
                              </div>
                              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{lead.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md font-semibold text-on-surface">Source</span>
                            <span className="font-body-sm text-body-sm text-secondary">{lead.source || 'Direct'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${isHot ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-high text-on-surface'} font-headline-sm text-headline-sm font-bold`}>
                            {isHot && <span className="material-symbols-outlined text-[16px] text-primary">stars</span>}
                            {!isHot && <span className="material-symbols-outlined text-[16px] text-secondary">analytics</span>}
                            <span>{lead.buyingIntent || 50}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="grid grid-cols-3 gap-1 text-[11px] leading-tight">
                            <span className="px-1.5 py-0.5 rounded bg-surface-container font-medium text-on-surface">
                              {lead.deals[0] ? `₦${(lead.deals[0].amount / 1000000).toFixed(1)}M` : 'No Deal'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-surface-container font-medium text-on-surface text-truncate">B2B</span>
                            <span className="px-1.5 py-0.5 rounded bg-surface-container font-medium text-on-surface">ASAP</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {lead.status === 'NEW' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-caps text-label-caps uppercase font-bold tracking-wider">
                              <span className="w-2 h-2 rounded-full bg-error"></span>
                              Needs Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-caps text-label-caps uppercase font-bold tracking-wider">
                              <span className="w-2 h-2 rounded-full bg-primary"></span>
                              {lead.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {lead.status === 'NEW' ? (
                            <button className="h-8 px-2.5 bg-inverse-surface hover:bg-inverse-surface/80 text-inverse-on-surface font-label-caps text-label-caps uppercase font-bold rounded flex items-center gap-1 shadow-sm transition-colors float-right">
                              <span className="material-symbols-outlined text-[15px]">rate_review</span>
                              <span>Inspect</span>
                            </button>
                          ) : (
                            <button className="h-8 px-2.5 bg-primary hover:bg-primary-container text-on-primary font-label-caps text-label-caps uppercase font-bold rounded flex items-center gap-1 shadow-sm transition-colors float-right">
                              <span className="material-symbols-outlined text-[15px]">call</span>
                              <span>Claim & Dial</span>
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
      </div>
    </div>
  );
}
