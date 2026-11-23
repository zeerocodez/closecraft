import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getOrganizationSegmentSummaries } from '@/lib/recovery/segmentationService';
import { RecoveryAttributionMetrics } from '@/components/recovery/RecoveryAttributionMetrics';
import { LeadImportZone } from '@/components/recovery/LeadImportZone';
import { SegmentationExplorer } from '@/components/recovery/SegmentationExplorer';
import { Sparkles, Database, Layers, Send, TrendingUp, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Revenue Recovery & Reactivation Hub | CloseCraft HQ',
  description: 'Recover overlooked sales opportunities from historical inquiries through AI extraction and compliant reactivation campaigns.'
};

export default async function RevenueRecoveryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = (session as any)?.organizationId;
  if (!organizationId) {
    redirect('/login');
  }

  // 1. Fetch Segment Summaries
  const segments = await getOrganizationSegmentSummaries(organizationId);

  // 2. Fetch Aggregated Attribution Stats
  const totalImported = await db.lead.count({ where: { organizationId } });
  const contactable = await db.lead.count({ where: { organizationId, optedOutOfMarketing: false } });

  const campaigns = await db.reactivationCampaign.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const totalDispatched = campaigns.reduce((acc, c) => acc + c.dispatchedCount, 0);
  const totalResponses = campaigns.reduce((acc, c) => acc + c.responseCount, 0);
  const totalConverted = campaigns.reduce((acc, c) => acc + c.convertedCount, 0);

  // 3. Verified Recovered Revenue (Deals in WON stage linked to leads in this org)
  const wonDeals = await db.deal.findMany({
    where: {
      organizationId,
      stage: 'WON'
    },
    select: { amount: true, currency: true }
  });

  const recoveredRevenue = wonDeals.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const currency = wonDeals[0]?.currency || 'NGN';

  const stats = {
    totalImported,
    contactable,
    messagesDispatched: totalDispatched,
    responsesReceived: totalResponses,
    opportunitiesCreated: totalConverted,
    recoveredRevenue,
    currency
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-16">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#C7F36B]/15 text-[#C7F36B] border border-[#C7F36B]/30 flex items-center gap-1.5 shadow-xs">
              <Sparkles size={12} />
              <span>RECOVER PILLAR</span>
            </span>
            <span className="text-xs text-on-surface-variant font-medium">CloseCraft Revenue Operating System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-on-surface">
            Your old enquiries could still become customers.
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
            CloseCraft parses historical chats, spreadsheets, and inactive inquiries to identify previous intent, filter eligible contacts, and deploy personalized, consent-guarded reactivation campaigns to revive dormant cash.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-mono text-on-surface flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#C7F36B]" />
            <span>Consent &amp; 24h Guard Active</span>
          </span>
        </div>
      </div>

      {/* Campaign Lifecycle Step Flow Visual */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[640px] text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#C7F36B] text-[#111827] font-extrabold text-[11px] flex items-center justify-center">1</span>
            <span className="font-bold text-on-surface">Choose Audience</span>
          </div>
          <span className="text-on-surface-variant/40">→</span>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#C7F36B] text-[#111827] font-extrabold text-[11px] flex items-center justify-center">2</span>
            <span className="font-bold text-on-surface">Verify Eligibility</span>
          </div>
          <span className="text-on-surface-variant/40">→</span>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#C7F36B] text-[#111827] font-extrabold text-[11px] flex items-center justify-center">3</span>
            <span className="font-bold text-on-surface">Context Message</span>
          </div>
          <span className="text-on-surface-variant/40">→</span>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#C7F36B] text-[#111827] font-extrabold text-[11px] flex items-center justify-center">4</span>
            <span className="font-bold text-on-surface">Preview &amp; Approve</span>
          </div>
          <span className="text-on-surface-variant/40">→</span>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#C7F36B] text-[#111827] font-extrabold text-[11px] flex items-center justify-center">5</span>
            <span className="font-bold text-on-surface">Deploy &amp; Track</span>
          </div>
        </div>
      </div>

      {/* 1. Recovery Attribution Metrics */}
      <RecoveryAttributionMetrics stats={stats} />

      {/* 2. Ingestion & Import Centre */}
      <LeadImportZone />

      {/* 3. Intelligent Lead Segmentation & Campaign Launcher */}
      <SegmentationExplorer segments={segments} />

      {/* 4. Active Reactivation Campaigns Table */}
      <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <Send size={16} className="text-primary" />
            <span>Recent Reactivation Campaigns</span>
          </h3>
          <span className="text-xs text-on-surface-variant font-mono">{campaigns.length} campaigns</span>
        </div>

        {campaigns.length === 0 ? (
          <div className="py-8 text-center text-on-surface-variant text-xs space-y-1">
            <p className="font-semibold text-on-surface">No Reactivation Campaigns Dispatched Yet</p>
            <p className="text-[11px]">Select any intelligent segment above to generate context-aware messages and launch your first recovery wave.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant/20 text-on-surface-variant text-[11px] font-bold">
                  <th className="pb-3">Campaign Name</th>
                  <th className="pb-3">Segment</th>
                  <th className="pb-3">Channel</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Dispatched</th>
                  <th className="pb-3">Responses</th>
                  <th className="pb-3">Re-Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="py-3 font-bold">{c.name}</td>
                    <td className="py-3 font-mono text-[11px] text-primary">{c.targetSegment}</td>
                    <td className="py-3">{c.channel}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        c.status === 'ACTIVE' || c.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono">{c.dispatchedCount}</td>
                    <td className="py-3 font-mono text-amber-400">{c.responseCount}</td>
                    <td className="py-3 font-mono text-emerald-400 font-bold">{c.convertedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
