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
 <div className="flex flex-col gap-6 lg:gap-8 w-full h-full">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2">
 <h1 className="text-2xl md:text-3xl font-heading font-semibold text-on-surface">Leads Management</h1>
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary text-xs font-bold tracking-wider uppercase shadow-sm">
 <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
 {totalLeads} Total Leads • {formattedPipeline} Pipeline
 </span>
 </div>
 <p className="text-sm text-on-surface-variant mt-1">Real-time ICP scoring, authority graphs, and AI pipeline orchestration.</p>
 </div>
 <div className="flex items-center gap-3">
 <AddLeadModal />
 </div>
 </div>

 {/* Filters & Actions */}
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 bg-surface-container-lowest p-2 rounded-xl shadow-sm mb-4">
 <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
 <button className="px-3 py-1.5 rounded-lg font-medium text-sm bg-primary text-on-primary shadow-sm flex items-center gap-1.5 whitespace-nowrap">
 <span>All</span>
 <span className="px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary text-[10px] font-semibold uppercase leading-none">{totalLeads}</span>
 </button>
 <button className="px-3 py-1.5 rounded-lg font-medium text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors flex items-center gap-1.5 whitespace-nowrap">
 <span>Qualified</span>
 <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-secondary text-[10px] font-semibold uppercase leading-none">{qualifiedCount}</span>
 </button>
 <button className="px-3 py-1.5 rounded-lg font-medium text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors flex items-center gap-1.5 whitespace-nowrap">
 <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
 <span>Needs Review</span>
 <span className="px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase leading-none">{needsReviewCount}</span>
 </button>
 </div>
 
 <div className="flex items-center gap-2">
 <div className="relative flex items-center w-full sm:w-64">
 <span className="material-symbols-outlined absolute left-2 text-on-surface-variant text-[18px]">search</span>
 <input className="w-full h-8 pl-8 pr-12 bg-surface-container-low text-on-surface text-sm rounded-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary shadow-inner" placeholder="Filter leads..." type="text"/>
 </div>
 </div>
 </div>

 {/* High-Density Data Ledger */}
 <div className="w-full bg-surface-container-lowest rounded-xl shadow-md overflow-hidden flex flex-col border border-surface-container">
 <div className="w-full overflow-x-auto">
 <table className="w-full text-left border-collapse select-none">
 <thead>
 <tr className="bg-surface-container text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
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
 <tbody className="divide-y divide-surface-container-high/40 text-sm">
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
 <div className={`w-9 h-9 rounded-full ${isHot ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-secondary-container text-on-secondary-fixed'} text-sm font-semibold flex items-center justify-center shrink-0`}>
 {initials}
 </div>
 <div className="flex flex-col min-w-0">
 <div className="flex items-center gap-1.5">
 <span className="font-medium text-on-surface hover:text-primary cursor-pointer truncate">{lead.name}</span>
 {isHot && <span className="material-symbols-outlined text-[14px] text-primary" title="High Intent Signal">local_fire_department</span>}
 </div>
 <span className="text-xs font-medium text-on-surface-variant truncate">{lead.email}</span>
 </div>
 </div>
 </td>
 <td className="py-3 px-3">
 <div className="flex flex-col">
 <span className="font-medium text-sm text-on-surface">{lead.source || 'Direct'}</span>
 <span className="text-xs text-secondary truncate max-w-[130px]">{new Date(lead.createdAt).toLocaleDateString()}</span>
 </div>
 </td>
 <td className="py-3 px-3">
 <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${isHot ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-high text-on-surface'} font-medium text-sm`}>
 {isHot && <span className="material-symbols-outlined text-[16px] text-primary">stars</span>}
 {!isHot && <span className="material-symbols-outlined text-[16px] text-secondary">analytics</span>}
 <span>{intentScore}</span>
 </div>
 </td>
 <td className="py-3 px-3">
 <div className="flex flex-col gap-1">
 <span className="font-medium text-sm text-on-surface">{pipeline}</span>
 {lead.status === 'NEW' ? (
 <span className="inline-flex w-fit items-center gap-1 px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] uppercase font-semibold tracking-wider">
 <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
 Needs Review
 </span>
 ) : (
 <span className="inline-flex w-fit items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] uppercase font-semibold tracking-wider">
 <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
 {lead.status}
 </span>
 )}
 </div>
 </td>
 <td className="py-3 px-3">
 {nextAction ? (
 <div className="flex flex-col gap-1">
 <span className="font-medium text-sm text-on-surface">{nextAction.type.replace(/_/g, ' ')}</span>
 <div className="flex items-center gap-1">
 <span className="material-symbols-outlined text-[14px] text-secondary">
 {nextAction.recommendedActor === 'AI' ? 'smart_toy' : nextAction.recommendedActor === 'HUMAN' ? 'person' : 'settings'}
 </span>
 <span className="text-xs text-on-surface-variant truncate max-w-[200px]" title={nextAction.reason || ''}>{nextAction.reason || 'Automated Engine Action'}</span>
 </div>
 </div>
 ) : (
 <span className="text-on-surface-variant text-sm italic">No action pending</span>
 )}
 </td>
 <td className="py-3 px-4 text-right">
 {nextAction && nextAction.recommendedActor === 'HUMAN' ? (
 <form action={async () => {
 "use server"
 await claimRevenueAction(nextAction.id)
 }}>
 <button type="submit" className="h-8 px-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs uppercase font-bold rounded flex items-center gap-1 shadow-sm transition-colors float-right">
 <span className="material-symbols-outlined text-[15px]">call</span>
 <span>Claim & Dial</span>
 </button>
 </form>
 ) : nextAction && nextAction.recommendedActor === 'AUTOMATION' ? (
 <button className="h-8 px-2.5 bg-inverse-surface hover:bg-inverse-surface/80 text-inverse-on-surface text-xs uppercase font-bold rounded flex items-center gap-1 shadow-sm transition-colors float-right">
 <span className="material-symbols-outlined text-[15px]">robot</span>
 <span>Auto</span>
 </button>
 ) : (
 <button className="h-8 px-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs uppercase font-bold rounded flex items-center gap-1 shadow-sm transition-colors float-right">
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
 </div>
 );
}
