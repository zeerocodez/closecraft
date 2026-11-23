'use client';

import React, { useTransition } from 'react';
import { updateDealStage } from '@/app/(saas)/actions';
import { Badge } from '@/components/ui/Badge';
import {
  Trophy,
  ArrowRight,
  Flame,
  AlertTriangle,
  User,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

interface DealCardProps {
  deal: {
    id: string;
    title?: string | null;
    amount: number;
    stage: string;
    currency?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    closer?: {
      id: string;
      name?: string | null;
      email?: string;
    } | null;
    lead: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      buyingIntent?: number | null;
      revenueActions?: Array<{
        type: string;
        recommendedActor: string;
        priority: number;
        reason?: string | null;
      }>;
    };
  };
  onClick?: () => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const [isPending, startTransition] = useTransition();

  const nextAction = deal.lead.revenueActions?.[0];
  const isHot = deal.lead.buyingIntent && deal.lead.buyingIntent >= 70;

  // Stalled calculation: deal updated > 7 days ago and not won/lost
  const isStalled =
    deal.updatedAt &&
    !['WON', 'LOST'].includes(deal.stage) &&
    new Date().getTime() - new Date(deal.updatedAt).getTime() >
      7 * 24 * 60 * 60 * 1000;

  function handleStageChange(newStage: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    startTransition(async () => {
      try {
        await updateDealStage(deal.id, newStage);
      } catch (err) {
        console.error('Failed to move deal:', err);
      }
    });
  }

  const getNextStage = (current: string) => {
    switch (current) {
      case 'OPPORTUNITY':
        return 'PROPOSAL';
      case 'PROPOSAL':
        return 'NEGOTIATION';
      case 'NEGOTIATION':
        return 'WON';
      default:
        return null;
    }
  };

  const nextStage = getNextStage(deal.stage);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`p-4 rounded-2xl border transition-all space-y-3 shadow-xs cursor-pointer text-left ${
        isPending
          ? 'opacity-50 pointer-events-none'
          : isStalled
          ? 'bg-rose-500/[0.03] border-rose-500/30 hover:border-rose-500/50'
          : 'bg-surface-container-low border-outline-variant/40 hover:border-emerald-500/50 hover:bg-surface-container'
      }`}
    >
      {/* Header: Lead Name & Deal Amount */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {isHot && (
              <Flame size={14} className="text-amber-400 shrink-0 fill-amber-400" />
            )}
            <h4 className="font-bold text-sm text-on-surface truncate hover:text-emerald-400 transition-colors" title={deal.lead.name}>
              {deal.lead.name}
            </h4>
          </div>
          <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
            {deal.title || deal.lead.email}
          </p>
        </div>

        <span className="font-mono font-extrabold text-xs text-emerald-400 shrink-0">
          {deal.currency || '₦'}{deal.amount.toLocaleString()}
        </span>
      </div>

      {/* Flags & Intent Pill */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface-variant font-semibold">
          Intent: {deal.lead.buyingIntent ?? 50}%
        </span>

        {isStalled && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold flex items-center gap-1">
            <AlertTriangle size={10} />
            Stalled &gt;7d
          </span>
        )}

        {deal.closer && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant flex items-center gap-1">
            <User size={10} className="text-emerald-400" />
            {deal.closer.name || deal.closer.email?.split('@')[0]}
          </span>
        )}
      </div>

      {/* Next Best Action */}
      {nextAction && (
        <div className="p-2 rounded-xl bg-surface-container/70 border border-outline-variant/20 flex items-center justify-between gap-1 text-[11px]">
          <span className="truncate text-on-surface-variant font-medium">
            Action: <strong className="text-on-surface">{nextAction.type.replace(/_/g, ' ')}</strong>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold shrink-0">
            {nextAction.recommendedActor}
          </span>
        </div>
      )}

      {/* Stage Actions */}
      <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-1.5">
        <span className="text-[10px] font-mono uppercase font-bold text-on-surface-variant">
          Stage:
        </span>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {nextStage && (
            <button
              onClick={(e) => handleStageChange(nextStage, e)}
              disabled={isPending}
              className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface text-[11px] font-bold border border-outline-variant/30 flex items-center gap-1 transition-colors"
            >
              <span>{nextStage === 'WON' ? 'Close Won' : `To ${nextStage.toLowerCase()}`}</span>
              <ArrowRight size={11} />
            </button>
          )}

          {deal.stage !== 'WON' && deal.stage !== 'LOST' && (
            <>
              <button
                onClick={(e) => handleStageChange('WON', e)}
                disabled={isPending}
                className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Mark Closed-Won"
              >
                <Trophy size={11} />
                <span>Won</span>
              </button>

              <button
                onClick={(e) => handleStageChange('LOST', e)}
                disabled={isPending}
                className="px-2 py-1 rounded-lg bg-surface-container hover:bg-rose-500/20 text-on-surface-variant hover:text-rose-300 text-[11px] font-semibold transition-colors"
                title="Mark Lost"
              >
                Lost
              </button>
            </>
          )}

          {deal.stage === 'WON' && (
            <Badge variant="success" dot>Closed-Won</Badge>
          )}

          {deal.stage === 'LOST' && (
            <Badge variant="destructive">Lost</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
