import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = (session as any).organizationId;

  // Fetch leads with conversations
  const leadsWithConversations = await db.lead.findMany({
    where: { 
      organizationId,
      conversations: { some: {} } // Only leads with messages
    },
    include: {
      conversations: {
        orderBy: { createdAt: 'desc' }
      },
      deals: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  const activeLead = leadsWithConversations.length > 0 ? leadsWithConversations[0] : null;
  const activeDeal = activeLead?.deals[0];
  const activeDealAmount = activeDeal ? `₦${(activeDeal.amount / 1000000).toFixed(1)}M` : 'No Deal';
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
                <a className="flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors bg-primary text-on-primary font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.2)]" href="/inbox">
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
              <span className="font-label-md text-label-md text-on-surface font-bold">Inbox</span>
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

        <main className="relative pt-16 min-h-screen w-full px-4 pb-4 overflow-hidden flex flex-col">
          {/* Operational Triage Sub-Bar */}
          <div className="flex items-center justify-between gap-4 mt-2 mb-3 px-3 py-2 bg-surface-container-low rounded-xl">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Revenue Inbox</span>
              </div>
              <div className="h-4 w-[1px] bg-outline-variant"></div>
              <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                <span>Active Ingestion:</span>
                <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded bg-surface-container-highest text-primary font-semibold">WhatsApp Gateway v2.4</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-container text-on-surface-variant font-label-caps text-label-caps">
                <span className="material-symbols-outlined text-[14px] text-tertiary">bolt</span>
                <span>SLA Target: &lt; 3 mins</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span>Auto-Triage Active (89%)</span>
              </div>
            </div>
          </div>

          {/* 3-Pane Desktop Grid Layout */}
          <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden pb-4">
            
            {/* PANE 1: Conversation List (28% ~ col-span-3) */}
            <section className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
              <div className="p-3 bg-surface-container-lowest border-b border-surface-container">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Live Triage</span>
                  <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">18 Queued</span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-nowrap">
                  <button className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-label-caps text-label-caps font-bold transition-all shadow-sm">All (18)</button>
                  <button className="px-2 py-1 rounded-lg bg-surface-container text-on-surface-variant font-label-caps text-label-caps">Unread (5)</button>
                  <button className="px-2 py-1 rounded-lg bg-error-container text-on-error-container font-label-caps text-label-caps font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span>Hot (4)
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto divide-y divide-surface-container-high/40 p-2 space-y-1 bg-surface-container-low">
                {leadsWithConversations.map((lead, idx) => {
                  const latestMsg = lead.conversations[0];
                  const deal = lead.deals[0];
                  const dealAmount = deal ? `₦${(deal.amount / 1000000).toFixed(1)}M ACV` : 'No Deal';
                  const isActive = idx === 0;
                  const isHot = lead.buyingIntent && lead.buyingIntent > 90;

                  return (
                    <article key={lead.id} className={`p-2.5 rounded-lg ${isActive ? 'bg-surface-container-lowest shadow-sm border-l-4 border-primary relative overflow-hidden' : 'bg-surface-container-lowest/60 hover:bg-surface-container-lowest cursor-pointer border border-transparent'}`}>
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          {isHot && <span className="w-2 h-2 rounded-full bg-error shrink-0"></span>}
                          <span className="font-headline-sm text-sm text-on-surface font-bold truncate">{lead.name}</span>
                        </div>
                        <span className="font-label-caps text-label-caps text-outline shrink-0">
                          {new Date(latestMsg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-[11px] mt-0.5">
                        <span className={`truncate ${isActive ? 'font-semibold text-on-surface' : ''}`}>{lead.company || lead.email}</span>
                        <span className={`font-label-caps text-label-caps ${isActive ? 'px-1 py-0.5 rounded bg-surface-container text-primary font-bold' : ''}`}>{dealAmount}</span>
                      </div>
                      {isActive && (
                        <p className="font-body-sm text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-tight">
                          "{latestMsg.content}"
                        </p>
                      )}
                    </article>
                  );
                })}
                {leadsWithConversations.length === 0 && (
                  <div className="p-4 text-center font-body-sm text-on-surface-variant">No active conversations.</div>
                )}
              </div>
            </section>

            {/* PANE 2: Composer (44% ~ col-span-6) */}
            <section className="col-span-12 lg:col-span-8 xl:col-span-6 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
              {activeLead && (
                <>
                  <header className="p-3 bg-surface-container-low border-b border-surface-container flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-headline-sm text-headline-sm text-on-primary font-bold">
                          {activeLead.name.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-headline-lg text-lg text-on-surface font-bold">{activeLead.name}</h2>
                            <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-semibold">{activeLead.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-[11px]">
                            <span>{activeLead.source || 'Web'}</span>
                            <span>•</span>
                            <span>WhatsApp API</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-error-container text-on-error-container font-label-caps text-label-caps font-bold">
                        <span className="material-symbols-outlined text-[14px] animate-spin">timelapse</span>
                        <span>SLA: 11m 48s</span>
                      </div>
                    </div>
                  </header>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface flex flex-col-reverse">
                    {activeLead.conversations.map((msg) => (
                      <div key={msg.id} className="flex flex-col items-start max-w-[85%] mt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-label-caps text-label-caps text-on-surface font-bold">{activeLead.name}</span>
                          <span className="font-label-caps text-label-caps text-outline">
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl rounded-tl-sm bg-surface-container-lowest border border-surface-container text-on-surface shadow-sm">
                          <p className="font-body-md text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                <div className="flex flex-col items-stretch bg-surface-container-low border border-surface-container rounded-xl p-3 shadow-sm">
                  <div className="flex items-center justify-between pb-1 mb-1 border-b border-surface-container">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
                      <span className="font-headline-sm text-sm text-primary font-bold">AI Copilot Draft</span>
                    </div>
                    <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold">94% Confidence</span>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant mb-2">
                    Identified Driver: Local Data Sovereignty. Verified via Knowledge Base.
                  </p>
                  <div className="p-2 rounded bg-surface-container-lowest text-on-surface font-body-md text-sm shadow-inner border border-surface-container">
                    <p>
                      "Hello Tunde, absolutely. All Sterling telemetry and metadata are hosted natively at the MainOne MDXi Lekki DC, fully compliant with NDPR guidelines. I am attaching our signed Data Sovereignty Certificate directly for your auditor."
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button className="px-3 py-1 rounded bg-primary text-on-primary font-label-caps text-label-caps font-bold shadow-sm hover:opacity-90">Insert Draft</button>
                  </div>
                </div>
              </div>

                  <div className="p-3 bg-surface-container-lowest border-t border-surface-container">
                    <textarea 
                      className="w-full bg-surface-container-low text-on-surface placeholder:text-outline-variant font-body-md text-sm p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none border border-surface-container" 
                      placeholder="Type WhatsApp response..." 
                      rows={2}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-outline cursor-pointer hover:text-on-surface">attach_file</span>
                      </div>
                      <button className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
              {!activeLead && (
                <div className="flex-1 flex items-center justify-center bg-surface">
                  <p className="font-body-md text-on-surface-variant">Select a conversation to start triaging.</p>
                </div>
              )}
            </section>

            {/* PANE 3: Context (28% ~ col-span-3) */}
            <section className="col-span-12 xl:col-span-3 flex flex-col gap-3 overflow-y-auto">
              {activeLead && (
                <>
                  <div className="p-3 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">Commercial Snapshot</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="p-2 rounded-lg bg-surface-container-low border border-surface-container">
                        <span className="font-label-caps text-label-caps text-outline block">Est. ACV</span>
                        <span className="font-metric-numeral-md text-lg text-on-surface font-bold">{activeDealAmount}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-container-low border border-surface-container">
                        <span className="font-label-caps text-label-caps text-outline block">Propensity</span>
                        <span className="font-metric-numeral-md text-lg text-primary font-bold">{activeLead.buyingIntent || 50}</span>
                      </div>
                    </div>
                  </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">MEDDPICC Rigor</span>
                  <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container text-on-surface font-bold">6/7</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-primary h-full rounded-full w-[85%]"></div>
                </div>
                  <div className="space-y-1.5 text-xs text-on-surface">
                    <div className="flex items-center justify-between">
                      <span className="flex gap-1 items-center"><span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>Metrics</span>
                      <span className="text-outline">Verified</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex gap-1 items-center"><span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>Econ Buyer</span>
                      <span className="text-outline">{activeLead.name.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex gap-1 items-center text-error"><span className="material-symbols-outlined text-[14px]">pending</span>Paper Process</span>
                      <span className="text-error">Awaiting Audit</span>
                    </div>
                  </div>
                </div>
                </>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
