'use client';

import React from 'react';
import { 
  Users, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight 
} from 'lucide-react';

interface RecoveryMetricsProps {
  stats: {
    totalImported: number;
    contactable: number;
    messagesDispatched: number;
    responsesReceived: number;
    opportunitiesCreated: number;
    recoveredRevenue: number;
    currency: string;
  };
}

export function RecoveryAttributionMetrics({ stats }: RecoveryMetricsProps) {
  const responseRate = stats.messagesDispatched > 0
    ? ((stats.responsesReceived / stats.messagesDispatched) * 100).toFixed(1)
    : '0.0';

  const conversionRate = stats.responsesReceived > 0
    ? ((stats.opportunitiesCreated / stats.responsesReceived) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Historical Leads */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
        <div className="flex items-center justify-between text-on-surface-variant mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Leads Ingested</span>
          <Users size={15} className="text-primary" />
        </div>
        <div>
          <p className="text-xl font-mono font-bold text-on-surface">{stats.totalImported.toLocaleString()}</p>
          <p className="text-[10px] text-on-surface-variant mt-0.5">{stats.contactable.toLocaleString()} contactable</p>
        </div>
      </div>

      {/* 2. Messages Dispatched */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
        <div className="flex items-center justify-between text-on-surface-variant mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Dispatched</span>
          <Send size={15} className="text-cyan-400" />
        </div>
        <div>
          <p className="text-xl font-mono font-bold text-on-surface">{stats.messagesDispatched.toLocaleString()}</p>
          <p className="text-[10px] text-cyan-300 mt-0.5">WhatsApp / Email</p>
        </div>
      </div>

      {/* 3. Responses */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
        <div className="flex items-center justify-between text-on-surface-variant mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Responses</span>
          <MessageSquare size={15} className="text-amber-400" />
        </div>
        <div>
          <p className="text-xl font-mono font-bold text-on-surface">{stats.responsesReceived.toLocaleString()}</p>
          <p className="text-[10px] text-amber-300 mt-0.5">{responseRate}% response rate</p>
        </div>
      </div>

      {/* 4. Recovered Deals */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
        <div className="flex items-center justify-between text-on-surface-variant mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Deals Re-Opened</span>
          <TrendingUp size={15} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-xl font-mono font-bold text-on-surface">{stats.opportunitiesCreated.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-300 mt-0.5">{conversionRate}% conversion</p>
        </div>
      </div>

      {/* 5. Recovered Revenue */}
      <div className="col-span-2 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
        <div className="flex items-center justify-between text-emerald-300 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Verified Recovered Revenue</span>
          <DollarSign size={16} className="text-emerald-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-mono font-bold text-white">
            {stats.currency === 'USD' ? '$' : stats.currency === 'GBP' ? '£' : '₦'}
            {stats.recoveredRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-300/80 font-mono">100% Attributed</span>
        </div>
      </div>
    </div>
  );
}
