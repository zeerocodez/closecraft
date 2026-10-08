import React from 'react';
import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { db } from "@/lib/db";
import { getDashboardMetrics, getChartData } from '@/lib/revenue-engine/dashboardService';
import MetricCard from '@/components/dashboard/MetricCard';
import { Icon } from '@/components/ui/Icon';
import { RevenueChart } from '@/components/revenue-engine/RevenueChart';

export default async function DashboardPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!session.organizationId) redirect('/login');

  const { organizationId } = session;
  
  // Date range parsing from searchParams
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startDateStr = typeof searchParams.start === 'string' ? searchParams.start : null;
  const endDateStr = typeof searchParams.end === 'string' ? searchParams.end : null;
  
  const startDate = startDateStr ? new Date(startDateStr) : thirtyDaysAgo;
  const endDate = endDateStr ? new Date(endDateStr) : now;
  const currency = typeof searchParams.currency === 'string' ? searchParams.currency : 'USD';

  const [metrics, org, chartData] = await Promise.all([
    getDashboardMetrics(organizationId, startDate, endDate, currency),
    db.organization.findUnique({ where: { id: organizationId }, select: { name: true } }),
    getChartData(organizationId, startDate, endDate, currency)
  ]);
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  });

  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full">
      {/* Page Heading & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-on-surface">Revenue overview</h1>
          <p className="text-sm text-on-surface-variant mt-1">Working data for {org?.name || 'Workspace'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 px-3 bg-surface-container border border-outline-variant rounded-md flex items-center gap-2 text-sm text-on-surface-variant">
             <Icon name="Calendar" size={16} />
             <span>Last 30 days</span>
          </div>
          <button className="h-10 px-4 bg-primary text-on-primary rounded-md font-medium text-sm shadow-sm hover:bg-primary-fixed transition-colors flex items-center gap-2">
            <Icon name="Plus" size={16} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Primary Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <MetricCard 
          title="Closed-won value" 
          value={formatter.format(metrics.closedWon)} 
          subtitle="During selected period"
          icon="Trophy"
          color="success"
        />
        <MetricCard 
          title="Open pipeline" 
          value={formatter.format(metrics.openPipeline)} 
          subtitle="Excludes won/lost deals"
          icon="KanbanSquare"
          color="primary"
        />
        <MetricCard 
          title="Open revenue leaks" 
          value={metrics.openLeaks} 
          subtitle="Current unaddressed leaks"
          icon="AlertTriangle"
          color="error"
        />
        <MetricCard 
          title="Pending actions" 
          value={metrics.pendingHumanActions} 
          subtitle="Waiting for human input"
          icon="ListTodo"
          color="warning"
        />
      </div>

      {/* Secondary Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        <MetricCard 
          title="New leads" 
          value={metrics.newLeads} 
          subtitle="Created in selected period"
          icon="UserPlus"
          color="info"
        />
        <MetricCard 
          title="Upcoming appointments" 
          value={metrics.upcomingAppointments} 
          subtitle="Scheduled from now onward"
          icon="CalendarDays"
          color="default"
        />
      </div>

      {/* Main Panels Layout (Grid 12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Closed-won value over time: 8 cols */}
        <div className="lg:col-span-8 bg-surface-container border border-outline-variant rounded-xl p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Closed-won value</h3>
          <div className="flex-1 min-h-0 w-full">
            <RevenueChart data={chartData} currency={currency} />
          </div>
        </div>
        
        {/* Current deal-stage distribution: 4 cols */}
        <div className="lg:col-span-4 bg-surface-container border border-outline-variant rounded-xl p-6 h-[400px] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center text-center max-w-xs">
            <Icon name="PieChart" size={48} className="text-on-surface-muted mb-4 opacity-50" />
            <p className="text-on-surface-variant font-medium">Stage distribution</p>
            <p className="text-sm text-on-surface-muted mt-2">Active pipeline spread across stages.</p>
          </div>
        </div>

        {/* Needs attention action queue: 8 cols */}
        <div className="lg:col-span-8 bg-surface-container border border-outline-variant rounded-xl p-6 min-h-[400px]">
           <h3 className="text-lg font-semibold text-on-surface mb-4">Needs attention</h3>
           {metrics.pendingHumanActions === 0 ? (
             <div className="flex flex-col items-center justify-center h-[280px] text-center">
               <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
                 <Icon name="Inbox" size={24} className="text-on-surface-variant" />
               </div>
               <h4 className="text-on-surface font-medium">No human actions waiting.</h4>
               <p className="text-sm text-on-surface-muted max-w-sm mt-1">New recommendations will appear here when a lead needs your attention.</p>
             </div>
           ) : (
             <div className="flex items-center justify-center h-[280px] border border-dashed border-outline-variant rounded-lg">
               <p className="text-on-surface-muted">Action queue table rendering pending.</p>
             </div>
           )}
        </div>

        {/* Open revenue leaks: 4 cols */}
        <div className="lg:col-span-4 bg-surface-container border border-outline-variant rounded-xl p-6 min-h-[400px]">
           <h3 className="text-lg font-semibold text-on-surface mb-4">Open revenue leaks</h3>
           {metrics.openLeaks === 0 ? (
             <div className="flex flex-col items-center justify-center h-[280px] text-center">
               <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
                 <Icon name="ShieldCheck" size={24} className="text-success" />
               </div>
               <h4 className="text-on-surface font-medium">No open revenue leaks.</h4>
               <p className="text-sm text-on-surface-muted mt-1">There are no open leak records in this workspace.</p>
             </div>
           ) : (
             <div className="flex items-center justify-center h-[280px] border border-dashed border-outline-variant rounded-lg">
               <p className="text-on-surface-muted">Leak records rendering pending.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
