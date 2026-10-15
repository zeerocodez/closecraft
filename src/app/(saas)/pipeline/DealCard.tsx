"use client";

import React, { useState, useTransition } from 'react';
import { updateDealStage } from '@/app/(saas)/actions';

interface DealCardProps {
  deal: {
    id: string;
    amount: number;
    stage: string;
    lead: {
      id: string;
      name: string;
      email: string;
      buyingIntent?: number | null;
      revenueActions?: Array<{
        type: string;
        recommendedActor: string;
        priority: number;
        reason?: string | null;
      }>;
    };
  };
}

export function DealCard({ deal }: DealCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);

  const nextAction = deal.lead.revenueActions?.[0];
  const isHot = deal.lead.buyingIntent && deal.lead.buyingIntent >= 80;

  function handleStageChange(newStage: string) {
    setShowMenu(false);
    startTransition(async () => {
      try {
        await updateDealStage(deal.id, newStage);
      } catch (err) {
        console.error("Failed to move deal:", err);
      }
    });
  }

  return (
    <div className={`p-3 bg-surface border rounded-lg shadow-sm hover:shadow-md transition-all relative ${
      isPending ? 'opacity-50 pointer-events-none' : 'border-surface-container-high'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <h3 className="font-medium text-sm font-bold text-on-surface flex items-center gap-1.5 min-w-0">
          {isHot && (
            <span className="w-2 h-2 rounded-full bg-error shrink-0 animate-pulse" title="High Buying Intent" />
          )}
          <span className="truncate" title={deal.lead.name}>{deal.lead.name}</span>
        </h3>
        <span className="font-semibold text-xs text-primary font-bold shrink-0">
          ₦{(deal.amount / 1000000).toFixed(1)}M
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5 text-on-surface-variant text-[11px]">
        <div className="flex items-center justify-between">
          <span className="truncate text-on-surface-variant">{deal.lead.email}</span>
          <span className="font-semibold px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px]">
            Intent: {deal.lead.buyingIntent ?? 50}
          </span>
        </div>

        {nextAction && (
          <div className="mt-1 pt-1.5 border-t border-surface-container/60 flex items-center justify-between gap-1">
            <span className="truncate text-secondary font-medium">
              Action: {nextAction.type.replace(/_/g, ' ')}
            </span>
            <span className="material-symbols-outlined text-[13px] text-on-surface-variant">
              {nextAction.recommendedActor === 'HUMAN' ? 'person' : 'smart_toy'}
            </span>
          </div>
        )}
      </div>

      {/* Stage Transition Control Bar */}
      <div className="mt-2.5 pt-2 border-t border-surface-container/50 flex items-center justify-between gap-1">
        <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
          Stage:
        </span>
        <div className="flex items-center gap-1">
          {deal.stage === 'OPPORTUNITY' && (
            <button
              onClick={() => handleStageChange('PROPOSAL')}
              disabled={isPending}
              className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[10px] font-semibold transition-colors flex items-center gap-1"
            >
              <span>To Proposal</span>
              <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
            </button>
          )}

          {deal.stage === 'PROPOSAL' && (
            <>
              <button
                onClick={() => handleStageChange('WON')}
                disabled={isPending}
                className="px-2 py-0.5 rounded bg-primary text-on-primary hover:bg-primary-container text-[10px] font-bold transition-colors flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[11px]">trophy</span>
                <span>Won</span>
              </button>
              <button
                onClick={() => handleStageChange('LOST')}
                disabled={isPending}
                className="px-1.5 py-0.5 rounded bg-surface-container hover:bg-error-container hover:text-error text-on-surface-variant text-[10px] font-semibold transition-colors"
              >
                Lost
              </button>
            </>
          )}

          {deal.stage === 'WON' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/20 text-primary text-[10px] font-bold">
              <span className="material-symbols-outlined text-[12px]">check_circle</span>
              <span>Closed Won</span>
            </span>
          )}

          {deal.stage === 'LOST' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">
              <span>Lost</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
