import React from 'react';
import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { getChartData } from '@/lib/revenue-engine/dashboardService';
import { RevenueChart } from '@/components/revenue-engine/RevenueChart';
import { Icon } from '@/components/ui/Icon';

export default async function AnalyticsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const session = await auth();
  if (!session?.user || !session.organizationId) redirect('/login');

  const { organizationId } = session;
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startDate = searchParams.start ? new Date(searchParams.start as string) : thirtyDaysAgo;
  const endDate = searchParams.end ? new Date(searchParams.end as string) : now;
  const currency = typeof searchParams.currency === 'string' ? searchParams.currency : 'USD';

  const chartData = await getChartData(organizationId, startDate, endDate, currency);

  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-on-surface">Revenue Analytics</h1>
          <p className="text-sm text-on-surface-variant mt-1">Deep dive into performance, conversion, and growth trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 px-3 bg-surface-container border border-outline-variant rounded-md flex items-center gap-2 text-sm text-on-surface-variant">
             <Icon name="Calendar" size={16} />
             <span>Last 30 days</span>
          </div>
          <button className="h-10 px-4 bg-surface-container border border-outline-variant text-on-surface rounded-md font-medium text-sm shadow-sm hover:bg-surface-container-high transition-colors flex items-center gap-2">
            <Icon name="Download" size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Closed-won value over time */}
        <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-xl p-6 h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Closed-won value over time</h3>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <RevenueChart data={chartData} currency={currency} />
          </div>
        </div>

        {/* Current pipeline value by stage */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-6 h-[400px] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center text-center max-w-sm">
            <Icon name="BarChart" size={48} className="text-on-surface-muted mb-4 opacity-50" />
            <p className="text-on-surface-variant font-medium">Pipeline by stage</p>
            <p className="text-sm text-on-surface-muted mt-2">Active pipeline spread across stages rendering pending.</p>
          </div>
        </div>

        {/* Leads by source */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-6 h-[400px] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center text-center max-w-sm">
            <Icon name="PieChart" size={48} className="text-on-surface-muted mb-4 opacity-50" />
            <p className="text-on-surface-variant font-medium">Leads by source</p>
            <p className="text-sm text-on-surface-muted mt-2">Lead source distribution rendering pending.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
