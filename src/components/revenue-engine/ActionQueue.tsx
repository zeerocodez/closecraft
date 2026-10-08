'use client';
import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { StatusBadge, ActorBadge } from './Badges';
import { formatDistanceToNow } from 'date-fns';
import { claimRevenueAction } from '@/app/(saas)/actions';
import type { RevenueActionWithRelations } from '@/lib/revenue-engine/dashboardService';

export function ActionQueue({ actions, emptyStateTitle, emptyStateDesc }: { actions: RevenueActionWithRelations[], emptyStateTitle: string, emptyStateDesc: string }) {
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedAction = selectedActionId ? actions.find(a => a.id === selectedActionId) : null;

  const handleClaim = () => {
    if (!selectedActionId) return;
    setErrorMsg(null);
    startTransition(async () => {
      const result = await claimRevenueAction(selectedActionId);
      if (result?.success === false) {
        setErrorMsg(result.error || "Unknown error occurred");
      } else {
        setSelectedActionId(null);
      }
    });
  };

  if (actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-outline-variant rounded-xl">
        <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
          <Icon name="Inbox" size={24} className="text-on-surface-variant" />
        </div>
        <h4 className="text-on-surface font-medium">{emptyStateTitle}</h4>
        <p className="text-sm text-on-surface-muted max-w-sm mt-1">{emptyStateDesc}</p>
        <div className="flex gap-3 mt-6">
          <button className="px-4 py-2 bg-primary text-on-primary rounded-md font-medium text-sm hover:bg-primary-fixed transition-colors">
            View leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-outline-variant bg-surface-container">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-outline-variant/50 bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            <th className="px-4 py-3 min-w-[200px]">Lead / Action</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 min-w-[240px]">Reason</th>
            <th className="px-4 py-3 text-right">Age</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/30">
          {actions.map(action => {
            const isSelected = selectedActionId === action.id;
            return (
              <tr 
                key={action.id} 
                onClick={() => setSelectedActionId(action.id)}
                className={`group cursor-pointer transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-surface-container-high'}`}
              >
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-on-surface">{action.lead.name}</span>
                    <span className="text-xs font-medium text-primary-fixed">{action.type.replace(/_/g, ' ')}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-surface-container-highest rounded-full h-1.5 min-w-[48px] max-w-[64px] overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${action.priority >= 80 ? 'bg-error' : action.priority >= 50 ? 'bg-warning' : 'bg-info'}`} 
                        style={{ width: `${Math.min(100, Math.max(0, action.priority))}%` }} 
                      />
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant">{action.priority}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <ActorBadge actor={action.recommendedActor} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={action.status} />
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-on-surface-variant line-clamp-2">{action.reason || 'No reason provided'}</p>
                </td>
                <td className="px-4 py-4 text-right text-xs text-on-surface-muted whitespace-nowrap">
                  {formatDistanceToNow(new Date(action.createdAt), { addSuffix: true })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Drawer Stub / Implementation */}
      {selectedAction && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-surface-container border-l border-outline-variant shadow-2xl z-[100] flex flex-col transform transition-transform">
          <div className="h-16 border-b border-outline-variant/50 px-6 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-lg text-on-surface">Action Details</h2>
            <button onClick={() => { setSelectedActionId(null); setErrorMsg(null); }} className="p-2 text-on-surface-variant hover:text-on-surface rounded-md hover:bg-surface-container-high transition-colors">
              <Icon name="X" size={20} />
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold text-on-surface">{selectedAction.lead.name}</h3>
              <p className="text-sm text-on-surface-variant mt-1">Recommended: {selectedAction.type.replace(/_/g, ' ')}</p>
            </div>
            
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-muted mb-2">Reasoning</h4>
              <p className="text-sm text-on-surface-variant">{selectedAction.reason || 'No reasoning provided.'}</p>
            </div>
            
            <div className="flex items-center gap-4">
               <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-muted mb-1">Priority</h4>
                  <span className="text-lg font-bold text-on-surface">{selectedAction.priority}</span>
               </div>
               <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-muted mb-1">Status</h4>
                  <StatusBadge status={selectedAction.status} />
               </div>
               <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-muted mb-1">Actor</h4>
                  <ActorBadge actor={selectedAction.recommendedActor} />
               </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-error-container text-error text-sm rounded-md border border-error/20 flex items-center gap-2">
                <Icon name="AlertCircle" size={16} />
                {errorMsg}
              </div>
            )}
            
            <div className="mt-auto pt-6 border-t border-outline-variant/50">
              <button 
                onClick={handleClaim}
                disabled={isPending || selectedAction.status !== 'PENDING'}
                className="w-full py-3 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary-fixed transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="CheckCircle2" size={18} />}
                {selectedAction.status !== 'PENDING' ? 'Already Claimed' : isPending ? 'Claiming...' : 'Claim Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
