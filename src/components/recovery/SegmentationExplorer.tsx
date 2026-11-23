'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Send, 
  Sparkles, 
  ArrowRight, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ShieldAlert 
} from 'lucide-react';
import { CampaignBuilderModal } from '@/components/recovery/CampaignBuilderModal';

interface SegmentItem {
  id: string;
  name: string;
  description: string;
  leadCount: number;
  contactableCount: number;
  estimatedValue: number;
  currency: string;
  recommendedAction: string;
}

interface SegmentationExplorerProps {
  segments: SegmentItem[];
}

export function SegmentationExplorer({ segments }: SegmentationExplorerProps) {
  const [selectedSegment, setSelectedSegment] = useState<SegmentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLaunchCampaign = (segment: SegmentItem) => {
    setSelectedSegment(segment);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <Layers size={18} className="text-primary" />
            <span>Intelligent Lead Segmentation</span>
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            AI automatically buckets historical inquiries by past objections, stage, and reactivation readiness.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {segments.map((seg) => {
          const hasEligible = seg.contactableCount > 0;

          return (
            <div
              key={seg.id}
              className="p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 flex flex-col justify-between gap-4 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-on-surface leading-tight">{seg.name}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-[10px] font-bold shrink-0">
                    {seg.leadCount} leads
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  {seg.description}
                </p>

                {/* Stated/Estimated Value */}
                <div className="pt-2 flex items-center justify-between text-xs font-mono">
                  <span className="text-on-surface-variant text-[11px]">Potential Value:</span>
                  <span className="font-bold text-primary">
                    {seg.currency === 'USD' ? '$' : seg.currency === 'GBP' ? '£' : '₦'}
                    {seg.estimatedValue.toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/20 text-[10px] text-on-surface-variant leading-normal">
                  <span className="font-bold text-on-surface">AI Recommendation:</span> {seg.recommendedAction}
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                <span className="text-[10px] text-on-surface-variant">
                  {seg.contactableCount} contactable (no opt-out)
                </span>

                <button
                  type="button"
                  onClick={() => handleLaunchCampaign(seg)}
                  disabled={!hasEligible}
                  className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 text-on-primary font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Send size={12} />
                  <span>Reactivate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign Builder Modal */}
      {selectedSegment && (
        <CampaignBuilderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          segment={selectedSegment}
        />
      )}
    </div>
  );
}
