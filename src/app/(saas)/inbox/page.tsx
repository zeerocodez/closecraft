import React from 'react';
import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation';

export default async function InboxPage() {
 const session = await auth();
 if (!session?.user) {
 redirect('/login');
 }

 const organizationId = (session as any).organizationId;
 if (!organizationId) {
 redirect("/login");
 }

 return (
 <>
 <header className="fixed top-0 left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl z-40 flex items-center justify-between px-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
 <div className="flex items-center gap-6">
 <div className="flex items-center gap-space-xs text-on-surface-variant text-sm">
 <span className="text-sm font-medium text-secondary font-medium">Revenue Workspace</span>
 <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
 <span className="text-sm font-medium text-on-surface font-bold">Omni-Channel Inbox</span>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-low rounded-full">
 <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
 <span className="text-xs font-semibold uppercase font-semibold text-on-surface-variant tracking-wide">Twilio & SendGrid Online</span>
 </div>
 </div>
 </header>

 <main className="relative pt-16 min-h-screen w-full h-screen overflow-hidden flex">
 {/* Left Sidebar: Conversation List */}
 <div className="w-[350px] bg-surface-container-lowest border-r border-surface-container flex flex-col h-full shrink-0">
 <div className="p-4 border-b border-surface-container">
 <h1 className="font-medium text-lg font-bold text-on-surface mb-3">Active Conversations</h1>
 <div className="relative">
 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
 <input 
 type="text" 
 placeholder="Search messages, leads..." 
 className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary border border-surface-container"
 />
 </div>
 </div>
 
 <div className="flex-1 overflow-y-auto">
 {/* Mock Conversation Item 1 */}
 <div className="p-4 border-b border-surface-container hover:bg-surface-container-low cursor-pointer transition-colors bg-surface-container-low/30 border-l-2 border-l-primary">
 <div className="flex items-center justify-between mb-1">
 <span className="font-medium text-sm font-bold text-on-surface">Acme Corp Logistics</span>
 <span className="text-xs text-on-surface-variant">10:42 AM</span>
 </div>
 <p className="text-xs text-on-surface-variant line-clamp-1 mb-2">
 "Are you sure the webhook SLA covers tier-3 data centers in Lagos?"
 </p>
 <div className="flex items-center justify-between">
 <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-semibold text-[10px] font-bold">Email</span>
 <span className="w-4 h-4 bg-error text-on-error rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
 </div>
 </div>

 {/* Mock Conversation Item 2 */}
 <div className="p-4 border-b border-surface-container hover:bg-surface-container-low cursor-pointer transition-colors">
 <div className="flex items-center justify-between mb-1">
 <span className="font-medium text-sm font-bold text-on-surface">Tunde Balogun</span>
 <span className="text-xs text-on-surface-variant">Yesterday</span>
 </div>
 <p className="text-xs text-on-surface-variant line-clamp-1 mb-2">
 "Thanks, I will review the proposal this weekend."
 </p>
 <div className="flex items-center justify-between">
 <span className="px-2 py-0.5 rounded bg-[#25D366]/20 text-[#25D366] font-semibold text-[10px] font-bold">WhatsApp</span>
 </div>
 </div>
 </div>
 </div>

 {/* Center: Active Chat Interface */}
 <div className="flex-1 flex flex-col h-full bg-surface">
 {/* Chat Header */}
 <div className="h-[72px] px-6 border-b border-surface-container flex items-center justify-between bg-surface/50 backdrop-blur shrink-0">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center text-lg">
 AC
 </div>
 <div>
 <h2 className="font-medium text-base font-bold text-on-surface leading-tight">Acme Corp Logistics</h2>
 <span className="text-xs text-secondary flex items-center gap-1">
 <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> 
 Active Opportunity • ₦14.5M ACV
 </span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
 <span className="material-symbols-outlined">call</span>
 </button>
 <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
 <span className="material-symbols-outlined">videocam</span>
 </button>
 </div>
 </div>

 {/* Chat History */}
 <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest/30">
 
 <div className="flex items-center justify-center">
 <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-xs rounded-full font-medium">Today</span>
 </div>

 {/* Outbound Message */}
 <div className="flex flex-col items-end gap-1">
 <div className="max-w-[70%] bg-primary text-on-primary p-3 rounded-2xl rounded-tr-sm shadow-sm">
 <p className="text-sm">Hi team, I've attached the SLA metrics for the API webhook performance we discussed. Let me know if you need clarification.</p>
 </div>
 <span className="text-[10px] text-on-surface-variant mr-1">09:15 AM • Read</span>
 </div>

 {/* Inbound Message */}
 <div className="flex flex-col items-start gap-1">
 <div className="flex items-center gap-2 mb-1 ml-1">
 <span className="text-xs font-semibold text-on-surface">Zainab Bello</span>
 <span className="text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">Decision Maker</span>
 </div>
 <div className="max-w-[70%] bg-surface-container-low text-on-surface p-3 rounded-2xl rounded-tl-sm shadow-sm border border-surface-container">
 <p className="text-sm">Thanks Sarah. Are you sure the webhook SLA covers tier-3 data centers in Lagos? Our current provider drops payloads frequently.</p>
 </div>
 <span className="text-[10px] text-on-surface-variant ml-1">10:42 AM</span>
 </div>
 </div>

 {/* Chat Composer */}
 <div className="p-4 bg-surface border-t border-surface-container shrink-0">
 {/* AI Suggestion Chip */}
 <div className="mb-3 flex items-center gap-2">
 <span className="material-symbols-outlined text-[14px] text-tertiary">smart_toy</span>
 <span className="text-xs font-semibold text-tertiary">AI Recommended Reply:</span>
 <button className="px-3 py-1 bg-tertiary/10 hover:bg-tertiary/20 text-tertiary text-xs rounded-full font-medium transition-colors border border-tertiary/20">
 "Yes, our latency guarantees cover all NDPR-compliant tier-3 facilities..."
 </button>
 </div>

 <div className="flex flex-col bg-surface-container-lowest border border-surface-container rounded-xl overflow-hidden shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
 <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low border-b border-surface-container">
 <button className="text-[11px] font-bold text-on-surface-variant hover:text-on-surface uppercase tracking-wider px-2 py-1 rounded hover:bg-surface-container transition-colors flex items-center gap-1">
 <span className="material-symbols-outlined text-[14px]">mail</span> Email
 </button>
 <button className="text-[11px] font-bold text-on-surface-variant hover:text-on-surface uppercase tracking-wider px-2 py-1 rounded hover:bg-surface-container transition-colors flex items-center gap-1">
 <span className="material-symbols-outlined text-[14px]">forum</span> WhatsApp
 </button>
 </div>
 <textarea 
 placeholder="Type your message..."
 className="w-full p-3 bg-transparent text-sm text-on-surface focus:outline-none resize-none"
 rows={3}
 ></textarea>
 <div className="flex items-center justify-between px-3 py-2 bg-surface-container-lowest">
 <div className="flex items-center gap-2">
 <button className="p-1.5 text-on-surface-variant hover:text-on-surface rounded transition-colors"><span className="material-symbols-outlined text-[18px]">attach_file</span></button>
 <button className="p-1.5 text-on-surface-variant hover:text-on-surface rounded transition-colors"><span className="material-symbols-outlined text-[18px]">bolt</span></button>
 </div>
 <button className="px-5 py-1.5 bg-primary hover:bg-primary-container text-on-primary text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
 Send <span className="material-symbols-outlined text-[16px]">send</span>
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Right Sidebar: Lead Intelligence Pack */}
 <div className="w-[320px] bg-surface-container-lowest border-l border-surface-container flex flex-col h-full shrink-0 overflow-y-auto">
 <div className="p-6 border-b border-surface-container bg-surface-container-low/50">
 <h3 className="font-medium text-sm font-bold text-on-surface uppercase tracking-wider mb-4 text-center">Revenue Engine Context</h3>
 
 <div className="flex flex-col items-center gap-2 mb-6">
 <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
 <span className="text-2xl font-bold text-on-surface">94</span>
 <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent border-l-transparent transform rotate-45"></div>
 </div>
 <span className="text-xs font-bold uppercase text-primary">Intent Score</span>
 </div>

 <div className="space-y-3">
 <div className="flex justify-between items-center text-sm">
 <span className="text-on-surface-variant">Lifecycle Stage</span>
 <span className="font-semibold text-on-surface px-2 py-0.5 bg-surface-container rounded text-xs">Opportunity</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-on-surface-variant">Est. Deal Value</span>
 <span className="font-bold text-tertiary">₦14,500,000</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-on-surface-variant">Target Close</span>
 <span className="font-semibold text-on-surface">Nov 15, 2026</span>
 </div>
 </div>
 </div>

 <div className="p-6">
 <h4 className="font-semibold text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">AI Next Best Action</h4>
 <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-start gap-3">
 <span className="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
 <div>
 <p className="text-sm font-bold text-on-surface leading-tight">Escalate to Technical AE</p>
 <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Lead is raising deep technical architecture questions regarding data centers. Bring in a Sales Engineer.</p>
 </div>
 </div>

 <button className="w-full mt-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-sm font-bold rounded-lg transition-colors border border-surface-container-highest shadow-sm">
 Execute Action
 </button>
 </div>
 </div>

 </main>
 </>
 );
}
