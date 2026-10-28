'use client';

import React from 'react';
import { BoundedPilotSpec } from '@/lib/qualification/types';
import { Icon } from '@/components/ui/Icon';

export default function BoundedPilotCard({
  pilot,
  onRequestProposal,
}: {
  pilot: BoundedPilotSpec;
  onRequestProposal?: () => void;
}) {
  const currencySymbol = pilot.currency === 'NGN' ? '₦' : '$';

  return (
    <div className="p-6 rounded-2xl bg-surface-container-low border border-primary/30 space-y-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold uppercase rounded-bl-xl tracking-wider">
        Bounded Pilot Scope
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Compass" size={18} className="text-primary" />
          <h4 className="font-heading font-semibold text-lg text-on-surface">Recommended 30-Day Bounded Pilot</h4>
        </div>
        <p className="text-xs text-on-surface-variant">
          When historical closer metrics are limited or unverified, a bounded trial tests real lead performance without committing to high long-term overhead.
        </p>
      </div>

      {/* Core Question Tested */}
      <div className="p-3.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/30">
        <span className="text-[10px] font-mono font-bold text-primary uppercase block mb-1">Hypothesis Under Test</span>
        <p className="text-xs font-medium text-on-surface leading-relaxed italic">
          "{pilot.question}"
        </p>
      </div>

      {/* Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20">
          <span className="text-[10px] text-on-surface-variant block mb-0.5">Capacity Allocation</span>
          <strong className="text-on-surface text-sm">{pilot.capacity}</strong>
        </div>
        <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20">
          <span className="text-[10px] text-on-surface-variant block mb-0.5">Duration</span>
          <strong className="text-on-surface text-sm">{pilot.period}</strong>
        </div>
        <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20">
          <span className="text-[10px] text-on-surface-variant block mb-0.5">Proposed Pilot Fee</span>
          <strong className="text-emerald-400 text-sm">{currencySymbol}{pilot.fee.toLocaleString()}</strong>
        </div>
      </div>

      {/* Client Obligations & Evidence to Collect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <span className="font-semibold text-on-surface flex items-center gap-1.5">
            <Icon name="CheckCircle2" size={14} className="text-primary" />
            <span>Client Responsibilities</span>
          </span>
          <ul className="space-y-1.5 text-on-surface-variant text-[11px]">
            {pilot.clientObligations.map((ob, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-primary shrink-0">•</span>
                <span>{ob}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <span className="font-semibold text-on-surface flex items-center gap-1.5">
            <Icon name="FileText" size={14} className="text-secondary" />
            <span>Evidence to Collect</span>
          </span>
          <ul className="space-y-1.5 text-on-surface-variant text-[11px]">
            {pilot.evidenceToCollect.map((ev, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-secondary shrink-0">•</span>
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stop Conditions */}
      <div className="pt-3 border-t border-outline-variant/20">
        <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider block mb-1.5">
          Safeguards & Stop Conditions
        </span>
        <ul className="space-y-1 text-[11px] text-on-surface-variant">
          {pilot.stopConditions.map((sc, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-rose-400 shrink-0">✕</span>
              <span>{sc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer and Next Step */}
      <div className="p-3 rounded-xl bg-surface-container/80 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <p className="text-[11px] text-on-surface-variant">
          <strong className="text-on-surface">Non-binding Recommendation:</strong> This pilot structure feeds into Closecraft's proposal review process. It does not automatically hire a professional or trigger payment.
        </p>
        {onRequestProposal && (
          <button
            onClick={onRequestProposal}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs whitespace-nowrap hover:opacity-90 shadow-sm transition-all"
          >
            Submit for Operator Proposal
          </button>
        )}
      </div>
    </div>
  );
}
