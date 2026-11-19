'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  ArrowRight, 
  Zap, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface RevenueLeak {
  id: string;
  type: string;
  description: string;
  severity: string;
  status: string;
  lead?: {
    id: string;
    name: string;
    phone?: string | null;
  } | null;
}

interface StalledDeal {
  id: string;
  title?: string | null;
  stage: string;
  amount: number | string;
  updatedAt: string | Date;
  lead?: {
    id: string;
    name: string;
    phone?: string | null;
  } | null;
}

interface RevenueLeakSectionProps {
  openLeaks: RevenueLeak[];
  stalledDeals: StalledDeal[];
}

export function RevenueLeakSection({ openLeaks, stalledDeals }: RevenueLeakSectionProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ id: string; text: string; type: 'success' | 'error' } | null>(null);

  const handleRemediateLeak = async (leakId: string) => {
    setProcessingId(leakId);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/revenue-leaks/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leakId, action: 'RESOLVE_LEAK' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ id: leakId, text: data.message || 'Remediated successfully!', type: 'success' });
        router.refresh();
      } else {
        setStatusMessage({ id: leakId, text: data.error || 'Failed to remediate', type: 'error' });
      }
    } catch (e: any) {
      setStatusMessage({ id: leakId, text: e.message || 'Network error', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleNudgeDeal = async (dealId: string) => {
    setProcessingId(dealId);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/revenue-leaks/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, action: 'NUDGE_STALLED_DEAL' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ id: dealId, text: data.message || 'Deal nudged successfully!', type: 'success' });
        router.refresh();
      } else {
        setStatusMessage({ id: dealId, text: data.error || 'Failed to nudge deal', type: 'error' });
      }
    } catch (e: any) {
      setStatusMessage({ id: dealId, text: e.message || 'Network error', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const hasItems = openLeaks.length > 0 || stalledDeals.length > 0;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-3xl bg-surface-container border border-outline-variant/40 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-rose-400" />
          <h3 className="text-base font-bold text-on-surface">Revenue at Risk &amp; Leaks</h3>
        </div>
        <Link
          href="/pipeline"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>Inspect Deals</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {!hasItems ? (
        <div className="py-6 text-center space-y-1">
          <CheckCircle2 size={24} className="mx-auto text-emerald-400 opacity-80 mb-1" />
          <p className="text-xs font-bold text-white">Zero Open Revenue Leaks</p>
          <p className="text-[11px] text-on-surface-variant">
            All active deals and SLA follow-up timers are proceeding within expected bounds.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Active SLA Leaks */}
          {openLeaks.map((leak) => {
            const isProcessing = processingId === leak.id;
            const message = statusMessage?.id === leak.id ? statusMessage : null;

            return (
              <div
                key={leak.id}
                className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      {leak.type.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-on-surface truncate">
                      {leak.lead?.name || 'Unassigned Lead'}
                    </span>
                    <span className="font-mono text-[9px] font-bold text-rose-400 uppercase">
                      [{leak.severity}]
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-200/80 leading-snug">{leak.description}</p>

                  {message && (
                    <p className={`text-[10px] font-bold ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-300'}`}>
                      {message.text}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {leak.lead?.id && (
                    <Link
                      href={`/inbox?leadId=${leak.lead.id}`}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                      title="Open in Unified Inbox"
                    >
                      <span>Inbox</span>
                      <ExternalLink size={11} />
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemediateLeak(leak.id)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all"
                    title="Mark resolved and schedule immediate rep contact action"
                  >
                    {isProcessing ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Zap size={12} />
                    )}
                    <span>{isProcessing ? 'Fixing...' : 'Auto-Remediate'}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Stalled Deals */}
          {stalledDeals.map((deal) => {
            const isProcessing = processingId === deal.id;
            const message = statusMessage?.id === deal.id ? statusMessage : null;

            return (
              <div
                key={deal.id}
                className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      STALLED &gt; 7 DAYS
                    </span>
                    <span className="font-bold text-on-surface truncate">
                      {deal.lead?.name || deal.title || 'Deal'}
                    </span>
                    <span className="font-mono font-bold text-primary text-xs">
                      ₦{Number(deal.amount).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-snug">
                    Stage: <span className="font-semibold text-white">{deal.stage}</span> • Deal has had no pipeline activity for over 7 days.
                  </p>

                  {message && (
                    <p className={`text-[10px] font-bold ${message.type === 'success' ? 'text-emerald-400' : 'text-amber-300'}`}>
                      {message.text}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {deal.lead?.id && (
                    <Link
                      href={`/inbox?leadId=${deal.lead.id}`}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                      title="Open in Unified Inbox"
                    >
                      <span>Inbox</span>
                      <ExternalLink size={11} />
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => handleNudgeDeal(deal.id)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black font-extrabold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all"
                    title="Nudge deal and generate urgent re-engagement follow-up"
                  >
                    {isProcessing ? (
                      <Loader2 size={12} className="animate-spin text-black" />
                    ) : (
                      <Clock size={12} />
                    )}
                    <span>{isProcessing ? 'Nudging...' : 'Nudge Closer'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
