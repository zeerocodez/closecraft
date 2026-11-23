'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateDealStage } from '@/app/(saas)/actions';
import { formatWhatsAppUrl } from '@/lib/whatsapp';
import { 
  X, 
  Trophy, 
  ArrowRight, 
  Flame, 
  AlertTriangle, 
  User, 
  Phone, 
  Mail, 
  Sparkles, 
  Calendar, 
  Clock, 
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Tag
} from 'lucide-react';

interface DealRecord {
  id: string;
  title?: string | null;
  amount: number;
  stage: string;
  currency: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  closer?: {
    id: string;
    name?: string | null;
    email: string;
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
}

interface DealDetailsModalProps {
  deal: DealRecord;
  onClose: () => void;
  onStageChange?: (newStage: string) => void;
}

const STAGES = ['OPPORTUNITY', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;

export function DealDetailsModal({ deal, onClose, onStageChange }: DealDetailsModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isHot = deal.lead.buyingIntent && deal.lead.buyingIntent >= 70;
  const nextAction = deal.lead.revenueActions?.[0];

  const handleStageChange = (newStage: string) => {
    startTransition(async () => {
      try {
        await updateDealStage(deal.id, newStage);
        if (onStageChange) onStageChange(newStage);
        router.refresh();
      } catch (err) {
        console.error('Failed to update stage:', err);
      }
    });
  };

  const handleOpenWhatsApp = () => {
    if (!deal.lead.phone) return;
    const msg = `Hi ${deal.lead.name}, this is regarding your proposal for "${deal.title || 'CloseCraft Enterprise Solution'}". Are you available for a quick discussion?`;
    const url = formatWhatsAppUrl(deal.lead.phone, msg);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0f1214] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-[#0a0d12] border-b border-white/5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                deal.stage === 'WON'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : deal.stage === 'LOST'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {deal.stage}
              </span>

              {isHot && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Flame size={11} className="fill-amber-400" />
                  High Win Propensity ({deal.lead.buyingIntent}%)
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
              {deal.title || `${deal.lead.name}'s Commercial Opportunity`}
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              Deal ID: {deal.id} &bull; Created {new Date(deal.createdAt).toLocaleDateString()}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Amount & Commercial Metric Hero */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-emerald-950/20">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Confirmed Deal Value
              </span>
              <span className="text-3xl font-extrabold text-white font-mono mt-0.5 block">
                {deal.currency || '₦'}{deal.amount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {deal.lead.phone && (
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
                >
                  <Phone size={14} />
                  <span>WhatsApp Prospect</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/inbox`);
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <MessageSquare size={14} className="text-emerald-400" />
                <span>Open in Inbox</span>
              </button>
            </div>
          </div>

          {/* Prospect Contact & Closer Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Prospect Contact Card
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <User size={14} className="text-emerald-400 shrink-0" />
                  <span>{deal.lead.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail size={14} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{deal.lead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone size={14} className="text-emerald-400 shrink-0" />
                  <span>{deal.lead.phone || 'No phone recorded'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Assigned Closer
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">
                  {deal.closer?.name ? deal.closer.name.substring(0, 2).toUpperCase() : 'CC'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">
                    {deal.closer?.name || 'Assigned Workspace Closer'}
                  </p>
                  <p className="text-xs text-gray-400 truncate font-mono">
                    {deal.closer?.email || 'sales@closecrafthq.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Best Action Card */}
          {nextAction && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c1a] to-[#0f1214] border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} /> Recommended Next Action
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px]">
                  Actor: {nextAction.recommendedActor}
                </span>
              </div>
              <p className="text-sm font-semibold text-white">
                {nextAction.type?.replace(/_/g, ' ')}
              </p>
              {nextAction.reason && (
                <p className="text-xs text-gray-300 leading-relaxed">
                  {nextAction.reason}
                </p>
              )}
            </div>
          )}

          {/* Stage Progression Controller */}
          <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Move Pipeline Stage
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STAGES.map((s) => {
                const isCurrent = deal.stage === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStageChange(s)}
                    disabled={isPending || isCurrent}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-950/30'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/5 disabled:opacity-40'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0d12] border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">
            CloseCraft Tenant Isolated Deal Store
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
