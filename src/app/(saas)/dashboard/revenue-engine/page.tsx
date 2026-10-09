import React from 'react';
import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { getRevenueActions } from '@/lib/revenue-engine/dashboardService';
import { ActionQueue } from '@/components/revenue-engine/ActionQueue';
import { Icon } from '@/components/ui/Icon';
import Link from 'next/link';

export default async function RevenueEnginePage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
 const session = await auth();
 if (!session?.user) redirect('/login');
 if (!session.organizationId) redirect('/login');

 const { organizationId } = session;
 const currentTab = typeof searchParams.tab === 'string' ? searchParams.tab : 'needs_attention';
 const filter = currentTab === 'needs_attention' ? 'needs_attention' : currentTab === 'my_actions' ? 'my_actions' : 'all';
 
 const actions = await getRevenueActions(organizationId, filter, session.user.id);

 const tabs = [
 { id: 'needs_attention', label: 'Needs attention' },
 { id: 'my_actions', label: 'My actions' },
 { id: 'all', label: 'All actions' }
 ];

 return (
 <div className="flex flex-col gap-6 lg:gap-8 w-full">
 {/* Page Heading */}
 <div className="flex flex-col gap-1">
 <h1 className="text-2xl md:text-3xl font-heading font-semibold text-on-surface">Revenue Command Centre</h1>
 <p className="text-sm text-on-surface-variant">Review signals, prioritize leads, and execute the next best action.</p>
 </div>

 {/* Tabs & Filters */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
 <div className="flex items-center gap-6">
 {tabs.map(tab => {
 const isActive = tab.id === currentTab;
 return (
 <Link 
 key={tab.id}
 href={`/dashboard/revenue-engine?tab=${tab.id}`}
 className={`relative pb-4 font-medium text-sm transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
 >
 {tab.label}
 {isActive && (
 <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(69,191,174,0.5)]" />
 )}
 </Link>
 );
 })}
 </div>
 <div className="flex items-center gap-3">
 <div className="h-10 px-3 bg-surface-container border border-outline-variant rounded-md flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer hover:border-outline transition-colors">
 <Icon name="Filter" size={16} />
 <span>Filter</span>
 </div>
 </div>
 </div>

 {/* Queue */}
 <ActionQueue 
 actions={actions} 
 emptyStateTitle={
 currentTab === 'needs_attention' ? "No human actions waiting." :
 currentTab === 'my_actions' ? "You have no assigned actions." :
 "No actions recorded."
 }
 emptyStateDesc={
 currentTab === 'needs_attention' ? "New recommendations will appear here when a lead needs your attention." :
 "Actions claimed by you will appear here."
 }
 />
 </div>
 );
}
