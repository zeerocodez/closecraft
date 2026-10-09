'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InboxClient({ initialLeads }: { initialLeads: any[] }) {
 const router = useRouter();
 const [activeFilter, setActiveFilter] = useState<'ALL' | 'HANDOFF' | 'HOT'>('ALL');
 const [activeLeadId, setActiveLeadId] = useState(initialLeads[0]?.id || null);
 const [isSending, setIsSending] = useState(false);
 
 // Filter leads based on the active queue
 const filteredLeads = initialLeads.filter(lead => {
 if (activeFilter === 'HOT') return lead.buyingIntent && lead.buyingIntent > 90;
 
 if (activeFilter === 'HANDOFF') {
 // Check if there is an unresolved human handoff or if the last message is from the prospect
 const latestMsg = lead.conversations?.[0]?.messages?.[0];
 const needsHuman = lead.status === 'ENGAGED' || latestMsg?.senderType === 'PROSPECT';
 return needsHuman;
 }
 
 return true;
 });

 // Ensure activeLeadId is valid within the filtered list, otherwise default to the first
 let currentActiveId = activeLeadId;
 if (!filteredLeads.find(l => l.id === currentActiveId)) {
 currentActiveId = filteredLeads[0]?.id || null;
 }

 const activeLead = filteredLeads.find(l => l.id === currentActiveId);
 const activeDeal = activeLead?.deals?.[0];
 const activeDealAmount = activeDeal ? `₦${(activeDeal.amount / 1000000).toFixed(1)}M ACV` : 'No Deal';

 // For the MVP, we just render the first conversation of the active lead
 const activeConversation = activeLead?.conversations?.[0];
 const messages = activeConversation?.messages || [];
 
 const activeNextAction = activeLead?.revenueActions?.[0];

 return (
 <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden pb-4 h-[calc(100vh-140px)]">
 
 {/* PANE 1: Conversation List (28% ~ col-span-3) */}
 <section className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden h-full">
 <div className="p-3 bg-surface-container-lowest border-b border-surface-container">
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-semibold uppercase uppercase text-on-surface-variant">Live Triage</span>
 <span className="text-xs font-semibold uppercase px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{filteredLeads.length} Queued</span>
 </div>
 <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-nowrap">
 <button 
 onClick={() => setActiveFilter('ALL')}
 className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase font-bold transition-all shadow-sm ${activeFilter === 'ALL' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
 >
 All ({initialLeads.length})
 </button>
 <button 
 onClick={() => setActiveFilter('HANDOFF')}
 className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase font-bold transition-all shadow-sm ${activeFilter === 'HANDOFF' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
 >
 Human Handoff ({initialLeads.filter(l => l.status === 'ENGAGED' || l.conversations?.[0]?.messages?.[0]?.senderType === 'PROSPECT').length})
 </button>
 <button 
 onClick={() => setActiveFilter('HOT')}
 className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase font-bold transition-all shadow-sm flex items-center gap-1 ${activeFilter === 'HOT' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'}`}
 >
 <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'HOT' ? 'bg-error' : 'bg-on-surface-variant'}`}></span>
 Hot ({initialLeads.filter(l => l.buyingIntent && l.buyingIntent > 90).length})
 </button>
 </div>
 </div>
 
 <div className="flex-1 overflow-y-auto divide-y divide-surface-container-high/40 p-2 space-y-1 bg-surface-container-low">
 {filteredLeads.map((lead) => {
 const latestMsg = lead.conversations?.[0]?.messages?.[0];
 const deal = lead.deals?.[0];
 const dealAmount = deal ? `₦${(deal.amount / 1000000).toFixed(1)}M` : 'No Deal';
 const isActive = lead.id === currentActiveId;
 const isHot = lead.buyingIntent && lead.buyingIntent > 90;

 return (
 <article 
 key={lead.id} 
 onClick={() => setActiveLeadId(lead.id)}
 className={`p-2.5 rounded-lg ${isActive ? 'bg-surface-container-lowest shadow-sm border-l-4 border-primary relative overflow-hidden' : 'bg-surface-container-lowest/60 hover:bg-surface-container-lowest cursor-pointer border border-transparent'}`}
 >
 <div className="flex items-start justify-between gap-1">
 <div className="flex items-center gap-1 min-w-0">
 {isHot && <span className="w-2 h-2 rounded-full bg-error shrink-0"></span>}
 <span className="font-medium text-sm text-on-surface font-bold truncate">{lead.name}</span>
 </div>
 {latestMsg && (
 <span className="text-xs font-semibold uppercase text-outline shrink-0">
 {new Date(latestMsg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
 </span>
 )}
 </div>
 <div className="flex items-center justify-between text-on-surface-variant text-sm text-[11px] mt-0.5">
 <span className={`truncate ${isActive ? 'font-semibold text-on-surface' : ''}`}>{lead.phone || lead.email}</span>
 <span className={`text-xs font-semibold uppercase ${isActive ? 'px-1 py-0.5 rounded bg-surface-container text-primary font-bold' : ''}`}>{dealAmount}</span>
 </div>
 {isActive && latestMsg && (
 <p className="text-sm text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-tight">
 &quot;{latestMsg.content}&quot;
 </p>
 )}
 </article>
 );
 })}
 {filteredLeads.length === 0 && (
 <div className="p-4 text-center text-sm text-on-surface-variant">No conversations in this queue.</div>
 )}
 </div>
 </section>

 {/* PANE 2: Composer (44% ~ col-span-6) */}
 <section className="col-span-12 lg:col-span-8 xl:col-span-6 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden h-full">
 {activeLead && (
 <>
 <header className="p-3 bg-surface-container-low border-b border-surface-container flex flex-col gap-2 shrink-0">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-medium text-sm text-on-primary font-bold">
 {activeLead.name.substring(0,2).toUpperCase()}
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h2 className="font-headline-lg text-lg text-on-surface font-bold">{activeLead.name}</h2>
 <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-semibold">{activeLead.phone || activeLead.email}</span>
 </div>
 <div className="flex items-center gap-2 text-on-surface-variant text-sm text-[11px]">
 <span>{activeLead.source || 'WhatsApp'}</span>
 <span>•</span>
 <span>WhatsApp API</span>
 </div>
 </div>
 </div>
 </div>
 </header>
 
 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface flex flex-col-reverse">
 {messages.map((msg: any) => {
 const isProspect = msg.senderType === 'PROSPECT';
 return (
 <div key={msg.id} className={`flex flex-col max-w-[85%] mt-4 ${isProspect ? 'items-start self-start' : 'items-end self-end'}`}>
 <div className="flex items-center gap-2 mb-1">
 <span className="text-xs font-semibold uppercase text-outline">
 {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
 </span>
 </div>
 <div className={`p-3 rounded-2xl border shadow-sm ${isProspect ? 'rounded-tl-sm bg-surface-container-lowest border-surface-container text-on-surface' : 'rounded-tr-sm bg-primary border-primary text-on-primary'}`}>
 <p className="font-body-md text-sm whitespace-pre-wrap">{msg.content}</p>
 </div>
 </div>
 );
 })}
 {messages.length === 0 && (
 <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
 No messages yet.
 </div>
 )}
 </div>

 <div className="p-3 bg-surface-container-lowest border-t border-surface-container shrink-0">
 <form 
 onSubmit={async (e) => {
 e.preventDefault();
 const form = e.target as HTMLFormElement;
 const input = form.elements.namedItem('content') as HTMLTextAreaElement;
 const content = input.value.trim();
 
 if (!content || !activeConversation || isSending) return;
 
 setIsSending(true);
 try {
 const res = await fetch('/api/messages', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 conversationId: activeConversation.id,
 content,
 senderType: 'HUMAN'
 })
 });
 
 if (res.ok) {
 input.value = '';
 router.refresh();
 }
 } catch (error) {
 console.error('Failed to send message:', error);
 } finally {
 setIsSending(false);
 }
 }}
 >
 <textarea 
 name="content"
 disabled={isSending}
 className="w-full bg-surface-container-low text-on-surface placeholder:text-outline-variant font-body-md text-sm p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none border border-surface-container disabled:opacity-50" 
 placeholder="Type WhatsApp response..." 
 rows={2}
 />
 <div className="flex items-center justify-between mt-2">
 <div className="flex items-center gap-2">
 <span className="material-symbols-outlined text-[18px] text-outline cursor-pointer hover:text-on-surface">attach_file</span>
 </div>
 <button type="submit" disabled={isSending} className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-on-primary text-sm font-medium font-semibold hover:bg-primary-container shadow-sm disabled:opacity-50">
 <span className="material-symbols-outlined text-[16px]">send</span>
 <span>{isSending ? 'Sending...' : 'Send'}</span>
 </button>
 </div>
 </form>
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
 <section className="col-span-12 xl:col-span-3 flex flex-col gap-3 overflow-y-auto h-full">
 {activeLead && (
 <>
 <div className="p-3 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold uppercase uppercase text-on-surface-variant font-bold">Commercial Snapshot</span>
 </div>
 <div className="grid grid-cols-2 gap-2 mt-1">
 <div className="p-2 rounded-lg bg-surface-container-low border border-surface-container">
 <span className="text-xs font-semibold uppercase text-outline block">Est. ACV</span>
 <span className="font-metric-numeral-md text-lg text-on-surface font-bold">{activeDealAmount}</span>
 </div>
 <div className="p-2 rounded-lg bg-surface-container-low border border-surface-container">
 <span className="text-xs font-semibold uppercase text-outline block">Propensity</span>
 <span className="font-metric-numeral-md text-lg text-primary font-bold">{activeLead.buyingIntent || 50}</span>
 </div>
 </div>
 </div>

 {activeNextAction && (
 <div className="p-3 rounded-xl bg-primary-container text-on-primary-container shadow-sm border border-primary/20 flex flex-col gap-2 mt-2">
 <div className="flex items-center gap-1.5 text-xs font-semibold uppercase uppercase font-bold tracking-wider">
 <span className="material-symbols-outlined text-[16px]">priority</span>
 <span>Next Best Action</span>
 </div>
 <div className="flex flex-col mt-1">
 <span className="font-medium text-sm font-bold">{activeNextAction.type.replace(/_/g, ' ')}</span>
 <p className="text-sm text-[11px] opacity-90 mt-1 leading-tight">{activeNextAction.reason}</p>
 </div>
 <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary/20">
 <span className="font-semibold text-[10px] uppercase font-bold tracking-widest opacity-80">Actor: {activeNextAction.recommendedActor}</span>
 {activeNextAction.recommendedActor === 'HUMAN' && (
 <button className="h-6 px-2 bg-primary text-on-primary rounded text-[10px] font-bold uppercase hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors">
 Execute Now
 </button>
 )}
 </div>
 </div>
 )}
 </>
 )}
 </section>

 </div>
 );
}
