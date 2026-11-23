'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  MessageSquare, 
  Clock,
  Layers,
  FileText
} from 'lucide-react';
import { generateContextAwareReactivationText } from '@/lib/recovery/campaignService';

interface SegmentItem {
  id: string;
  name: string;
  contactableCount: number;
}

interface CampaignBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment: SegmentItem;
}

export function CampaignBuilderModal({ isOpen, onClose, segment }: CampaignBuilderModalProps) {
  const router = useRouter();
  const [campaignName, setCampaignName] = useState(`Reactivate ${segment.name} - ${new Date().toLocaleDateString('en-GB')}`);
  const [channel, setChannel] = useState<'WHATSAPP' | 'EMAIL' | 'SMS'>('WHATSAPP');
  const [tone, setTone] = useState<'PROFESSIONAL' | 'FRIENDLY' | 'VALUE_OFFER' | 'DIRECT_CHECKIN'>('PROFESSIONAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preview generated text
  const previewText = generateContextAwareReactivationText({
    leadName: 'Alhaji Garba Danladi',
    productInterest: 'Enterprise ERP Suite',
    pastObjection: 'Timeline review',
    tone,
    orgName: 'Apex Professional Services'
  });

  const handleCreateAndDispatch = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setResult(null);

    try {
      // 1. Create campaign
      const createRes = await fetch('/api/recovery/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          targetSegment: segment.id,
          channel,
          tone
        })
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error || 'Failed to create campaign');
      }

      // 2. Dispatch campaign
      const dispatchRes = await fetch(`/api/recovery/campaigns/${createData.campaignId}/dispatch`, {
        method: 'POST'
      });

      const dispatchData = await dispatchRes.json();
      if (!dispatchRes.ok || !dispatchData.success) {
        throw new Error(dispatchData.error || 'Failed to dispatch campaign');
      }

      setResult(dispatchData);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface">Reactivation Campaign Builder</h3>
              <p className="text-[11px] text-on-surface-variant">
                Targeting <span className="font-semibold text-primary">{segment.name}</span> ({segment.contactableCount} eligible leads)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Campaign Name */}
          <div className="space-y-1">
            <label className="font-bold text-on-surface">Campaign Name</label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface font-medium focus:outline-none focus:border-primary"
            />
          </div>

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-on-surface">Message Tone &amp; Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'PROFESSIONAL', label: 'Executive Professional' },
                { id: 'FRIENDLY', label: 'Warm Check-in' },
                { id: 'VALUE_OFFER', label: 'Value & Terms Offer' },
                { id: 'DIRECT_CHECKIN', label: 'Direct Quick-Check' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    tone === t.id
                      ? 'bg-primary/10 border-primary text-primary font-bold'
                      : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <p className="text-[11px]">{t.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Channel Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-on-surface">Outbound Delivery Channel</label>
            <div className="flex items-center gap-3">
              {[
                { id: 'WHATSAPP', label: 'WhatsApp Cloud API', icon: MessageSquare },
                { id: 'EMAIL', label: 'Verified Email', icon: FileText }
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannel(c.id as any)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      channel === c.id
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context-Aware Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-on-surface">AI Personalization Preview (Sample Contact):</span>
              <span className="text-[10px] text-primary font-mono">Dynamic per prospect history</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-on-surface font-sans leading-relaxed text-xs">
              <p className="whitespace-pre-wrap">{previewText}</p>
            </div>
          </div>

          {/* Compliance & WhatsApp 24h Guard */}
          <div className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant/20 flex items-start gap-2.5 text-[11px] text-on-surface-variant">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-on-surface">Messaging Compliance &amp; Pilot Protection Active</p>
              <p className="mt-0.5 leading-normal">
                Opted-out contacts are suppressed automatically. If unattended dispatch is in pilot dry-run, messages are safely recorded without false external claims.
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          {result && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <CheckCircle2 size={15} />
                <span>Campaign Dispatched Successfully!</span>
              </div>
              <p className="text-[11px]">
                {result.dispatchedCount} personalized messages processed {result.pilotMode ? '(Pilot Dry-Run mode)' : '(Live WhatsApp Cloud API)'}. Inbound responses will automatically trigger Next Best Actions.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low/40 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-bold"
          >
            {result ? 'Close' : 'Cancel'}
          </button>

          {!result && (
            <button
              type="button"
              onClick={handleCreateAndDispatch}
              disabled={isSubmitting || segment.contactableCount === 0}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-on-primary font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              <span>{isSubmitting ? 'Dispatching...' : `Approve & Dispatch (${segment.contactableCount})`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
