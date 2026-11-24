'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { StatusBadge, ActorBadge } from './Badges';
import { formatDistanceToNow } from 'date-fns';
import { claimRevenueAction } from '@/app/(saas)/actions';
import { formatWhatsAppUrl } from '@/lib/whatsapp';
import type { RevenueActionWithRelations } from '@/lib/revenue-engine/dashboardService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Inbox,
  UserCheck,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Phone,
  ArrowRight,
  ChevronRight,
  X,
  Target,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface ExtendedRevenueAction extends RevenueActionWithRelations {
  lead: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
    buyingIntent?: number | null;
  };
}

export function ActionQueue({
  actions,
  emptyStateTitle,
  emptyStateDesc,
}: {
  actions: ExtendedRevenueAction[];
  emptyStateTitle: string;
  emptyStateDesc: string;
}) {
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedAction = selectedActionId
    ? actions.find((a) => a.id === selectedActionId)
    : null;

  const handleClaim = () => {
    if (!selectedActionId) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    startTransition(async () => {
      const result = await claimRevenueAction(selectedActionId);
      if (result?.success === false) {
        setErrorMsg(result.error || 'Failed to claim action.');
      } else {
        setSuccessMsg('Action claimed successfully.');
        setTimeout(() => setSelectedActionId(null), 1200);
      }
    });
  };

  if (actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-outline-variant/40 rounded-3xl bg-surface-container-low/40">
        <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center mb-3 text-on-surface-variant">
          <Inbox size={24} />
        </div>
        <h4 className="text-on-surface font-bold text-base">{emptyStateTitle}</h4>
        <p className="text-xs text-on-surface-variant max-w-sm mt-1 leading-relaxed">
          {emptyStateDesc}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-container-low shadow-sm">
        {/* Desktop & Tablet Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container/60 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="px-5 py-3.5 min-w-[200px]">Lead / Recommended Action</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 min-w-[260px]">Explainable Reason</th>
                <th className="px-5 py-3.5 text-right">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {actions.map((action) => {
                const isSelected = selectedActionId === action.id;
                const priorityColor =
                  action.priority >= 80
                    ? 'bg-rose-500'
                    : action.priority >= 50
                    ? 'bg-amber-400'
                    : 'bg-primary';

                return (
                  <tr
                    key={action.id}
                    onClick={() => {
                      setSelectedActionId(action.id);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`group cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10'
                        : 'hover:bg-surface-container'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                          {action.lead.name}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-primary">
                          {action.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${priorityColor}`}
                            style={{
                              width: `${Math.min(100, Math.max(0, action.priority))}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-on-surface">
                          {action.priority}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <ActorBadge actor={action.recommendedActor} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={action.status} />
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                        {action.reason || 'No explainable factor recorded.'}
                      </p>
                    </td>

                    <td
                      suppressHydrationWarning
                      className="px-5 py-4 text-right text-[11px] text-on-surface-variant font-mono whitespace-nowrap"
                    >
                      <span suppressHydrationWarning>
                        {formatDistanceToNow(new Date(action.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="md:hidden divide-y divide-outline-variant/20">
          {actions.map((action) => (
            <div
              key={action.id}
              onClick={() => {
                setSelectedActionId(action.id);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="p-4 space-y-3 cursor-pointer hover:bg-surface-container transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">
                    {action.lead.name}
                  </h4>
                  <p className="text-xs font-mono font-semibold text-primary">
                    {action.type.replace(/_/g, ' ')}
                  </p>
                </div>
                <StatusBadge status={action.status} />
              </div>

              <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                {action.reason || 'No explainable factor recorded.'}
              </p>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <ActorBadge actor={action.recommendedActor} />
                  <span className="font-mono text-[11px] text-on-surface-variant font-bold">
                    P: {action.priority}
                  </span>
                </div>
                <span suppressHydrationWarning className="text-[10px] text-on-surface-variant font-mono">
                  {formatDistanceToNow(new Date(action.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-over Action Inspector Drawer */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface-container-low border-l border-outline-variant/40 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="h-16 border-b border-outline-variant/30 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  ACTION INSPECTOR
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedActionId(null);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="p-2 text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container transition-colors"
                aria-label="Close action drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Lead & Recommended Action Header */}
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-on-surface">
                  {selectedAction.lead.name}
                </h3>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded-lg bg-surface-container">
                    Action: {selectedAction.type.replace(/_/g, ' ')}
                  </span>
                  <ActorBadge actor={selectedAction.recommendedActor} />
                  <StatusBadge status={selectedAction.status} />
                </div>
              </div>

              {/* Feedback messages */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  {successMsg}
                </div>
              )}

              {/* Explainable Factor / Reasoning */}
              <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                  Explainable Factor &amp; Reasoning
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {selectedAction.reason ||
                    'Generated deterministically based on lead activity and revenue priority policies.'}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-on-surface-variant font-mono">
                  <span>Priority Weight:</span>
                  <span className="font-bold text-primary">
                    {selectedAction.priority} / 100
                  </span>
                </div>
              </div>

              {/* Contact & WhatsApp Outreach Trigger */}
              <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                  Lead Direct Outreach
                </span>
                <div className="space-y-1.5 text-xs">
                  {selectedAction.lead.email && (
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Email:</span>
                      <span className="text-on-surface font-medium">
                        {selectedAction.lead.email}
                      </span>
                    </div>
                  )}
                  {selectedAction.lead.phone && (
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Phone:</span>
                      <span className="text-on-surface font-medium">
                        {selectedAction.lead.phone}
                      </span>
                    </div>
                  )}
                </div>

                {selectedAction.lead.phone && (
                  <div className="pt-2">
                    <a
                      href={
                        formatWhatsAppUrl(
                          selectedAction.lead.phone || '',
                          `Hello ${selectedAction.lead.name}, this is regarding your recent inquiry with CloseCraft.`
                        ) || undefined
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/30 transition-colors"
                    >
                      <MessageSquare size={15} />
                      <span>Send WhatsApp Outreach</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 border-t border-outline-variant/30 bg-surface-container shrink-0 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedActionId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleClaim}
                disabled={isPending || selectedAction.status === 'COMPLETED'}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <UserCheck size={14} />
                <span>
                  {isPending
                    ? 'Claiming...'
                    : selectedAction.assignedUserId
                    ? 'Claimed'
                    : 'Claim Action'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
