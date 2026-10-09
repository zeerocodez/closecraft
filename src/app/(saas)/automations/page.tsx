import React from 'react';
import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation';

export default async function AutomationsPage() {
 const session = await auth();
 if (!session?.user) {
 redirect('/login');
 }

 return (
 <>
 <header className="fixed top-0 left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl z-40 flex items-center justify-between px-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
 <div className="flex items-center gap-6">
 <div className="flex items-center gap-space-xs text-on-surface-variant text-sm">
 <span className="text-sm font-medium text-secondary font-medium">Revenue Workspace</span>
 <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
 <span className="text-sm font-medium text-on-surface font-bold">Automations</span>
 </div>
 </div>
 <button className="h-9 px-4 bg-primary hover:bg-primary-container text-on-primary text-sm font-medium font-semibold rounded-lg flex items-center gap-space-xs shadow-sm transition-colors">
 <span className="material-symbols-outlined text-[18px]">add</span>
 <span>Create Workflow</span>
 </button>
 </header>

 <main className="relative pt-24 min-h-screen w-full px-8 pb-space-xl overflow-y-auto">
 <div className="max-w-5xl mx-auto">
 <div className="mb-8">
 <h1 className="font-headline-xl text-3xl font-bold text-on-surface tracking-tight mb-2">Automations Engine</h1>
 <p className="text-on-surface-variant font-body-md">Configure native triggers, webhooks, and AI-driven background tasks.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Active Workflow 1 */}
 <div className="bg-surface-container-lowest border border-primary/30 shadow-md rounded-xl p-6 relative overflow-hidden group hover:border-primary/60 transition-colors cursor-pointer">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
 
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-primary-fixed/20 text-primary flex items-center justify-center">
 <span className="material-symbols-outlined text-[20px]">psychology</span>
 </div>
 <div>
 <h3 className="font-medium text-base font-bold text-on-surface">High Intent Auto-Deal</h3>
 <span className="text-[11px] uppercase tracking-wider font-bold text-primary">Active</span>
 </div>
 </div>
 <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
 <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
 </div>
 </div>

 <div className="bg-surface-container p-3 rounded-lg border border-surface-container-high mb-4">
 <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-2">
 <span className="material-symbols-outlined text-[16px] text-tertiary">bolt</span>
 <span className="uppercase tracking-widest text-[10px] font-bold text-on-surface">TRIGGER:</span> AI Intent Score &gt; 80
 </div>
 <div className="w-[2px] h-3 bg-surface-container-highest ml-3 mb-2"></div>
 <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
 <span className="material-symbols-outlined text-[16px] text-primary">play_arrow</span>
 <span className="uppercase tracking-widest text-[10px] font-bold text-on-surface">ACTION:</span> Create Pipeline Deal (Stage: Opportunity)
 </div>
 </div>

 <div className="flex items-center justify-between text-xs text-on-surface-variant border-t border-surface-container pt-3">
 <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">done_all</span> 240 Executions</span>
 <span>Last fired 12m ago</span>
 </div>
 </div>

 {/* Active Workflow 2 */}
 <div className="bg-surface-container-lowest border border-surface-container shadow-sm rounded-xl p-6 relative overflow-hidden group hover:border-primary/30 transition-colors cursor-pointer">
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
 <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
 </div>
 <div>
 <h3 className="font-medium text-base font-bold text-on-surface">DSS Entitlement Grant</h3>
 <span className="text-[11px] uppercase tracking-wider font-bold text-primary">Active</span>
 </div>
 </div>
 <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
 <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
 </div>
 </div>

 <div className="bg-surface-container p-3 rounded-lg border border-surface-container-high mb-4">
 <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-2">
 <span className="material-symbols-outlined text-[16px] text-tertiary">bolt</span>
 <span className="uppercase tracking-widest text-[10px] font-bold text-on-surface">TRIGGER:</span> Stripe Webhook (checkout.success)
 </div>
 <div className="w-[2px] h-3 bg-surface-container-highest ml-3 mb-2"></div>
 <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-2">
 <span className="material-symbols-outlined text-[16px] text-primary">play_arrow</span>
 <span className="uppercase tracking-widest text-[10px] font-bold text-on-surface">ACTION:</span> Grant LMS Access
 </div>
 <div className="w-[2px] h-3 bg-surface-container-highest ml-3 mb-2"></div>
 <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
 <span className="material-symbols-outlined text-[16px] text-primary">play_arrow</span>
 <span className="uppercase tracking-widest text-[10px] font-bold text-on-surface">ACTION:</span> Send Welcome Email Sequence
 </div>
 </div>

 <div className="flex items-center justify-between text-xs text-on-surface-variant border-t border-surface-container pt-3">
 <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">done_all</span> 1,294 Executions</span>
 <span>Last fired 1h ago</span>
 </div>
 </div>

 {/* Inactive Workflow */}
 <div className="bg-surface-container-lowest border border-surface-container opacity-60 shadow-sm rounded-xl p-6 relative overflow-hidden group transition-colors cursor-pointer">
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
 <span className="material-symbols-outlined text-[20px]">snooze</span>
 </div>
 <div>
 <h3 className="font-medium text-base font-bold text-on-surface">SLA Breach Alert</h3>
 <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant">Paused</span>
 </div>
 </div>
 <div className="w-10 h-6 bg-surface-container-high rounded-full relative cursor-pointer">
 <div className="absolute left-1 top-1 w-4 h-4 bg-on-surface-variant rounded-full"></div>
 </div>
 </div>

 <div className="bg-surface-container p-3 rounded-lg border border-surface-container-high mb-4">
 <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-2">
 <span className="material-symbols-outlined text-[16px] text-tertiary">timer</span>
 <span className="uppercase tracking-widest text-[10px] font-bold text-on-surface">TRIGGER:</span> Lead Status 'NEW' &gt; 48 hours
 </div>
 <div className="w-[2px] h-3 bg-surface-container-highest ml-3 mb-2"></div>
 <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
 <span className="material-symbols-outlined text-[16px] text-primary">play_arrow</span>
 <span className="uppercase tracking-widest text-[10px] font-bold text-on-surface">ACTION:</span> Slack Alert to Manager
 </div>
 </div>
 </div>

 </div>
 </div>
 </main>
 </>
 );
}
