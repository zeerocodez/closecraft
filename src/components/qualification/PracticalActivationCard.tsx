'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

interface PracticalActivationCardProps {
  softwareFit: string;
  recommendedAction: string;
  hasOlderPipeline?: boolean;
}

export default function PracticalActivationCard({
  softwareFit,
  recommendedAction,
  hasOlderPipeline,
}: PracticalActivationCardProps) {
  const steps = [
    {
      step: '01',
      title: 'Add or Import an Actual Enquiry',
      desc: hasOlderPipeline
        ? 'Import your backlog of older opportunities or add today’s newest inbound enquiry.'
        : 'Capture a real incoming prospect across WhatsApp, Facebook Ads, or web forms.',
      actionLabel: 'Add First Enquiry',
      href: '/today',
      icon: 'UserPlus',
    },
    {
      step: '02',
      title: 'Assign an Accountable Owner',
      desc: 'Eliminate confusion by giving every lead a single clear team owner so responsibility is visible.',
      actionLabel: 'Assign Ownership',
      href: '/leads',
      icon: 'UserCheck',
    },
    {
      step: '03',
      title: 'Schedule Next Best Action with Due Date',
      desc: 'Never let enthusiasm evaporate. Give the record an SLA date/time (e.g. Call to discuss pricing).',
      actionLabel: 'Set SLA Reminder',
      href: '/today',
      icon: 'Calendar',
    },
    {
      step: '04',
      title: 'Record Real Outcomes & Maintain Trail',
      desc: 'Log notes, update pipeline stage, and resolve blockers with transparent audit logging.',
      actionLabel: 'Explore Today View',
      href: '/today',
      icon: 'CheckSquare',
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/20">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
            Practical Software Activation
          </span>
          <h3 className="font-heading font-semibold text-lg text-on-surface mt-0.5">
            Your Immediate Starting Path
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed max-w-2xl">
            {recommendedAction}
          </p>
        </div>
        <Link
          href="/today"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-sm hover:opacity-90 shrink-0 self-start sm:self-auto"
        >
          <span>Open Sales Command</span>
          <Icon name="ArrowRight" size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((st) => (
          <div
            key={st.step}
            className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-primary">{st.step}</span>
                <div className="p-1.5 rounded-lg bg-surface-container-high text-on-surface-variant">
                  <Icon name={st.icon} size={16} />
                </div>
              </div>
              <h4 className="font-bold text-xs text-on-surface mb-1">{st.title}</h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">{st.desc}</p>
            </div>
            <Link
              href={st.href}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-2 border-t border-outline-variant/20"
            >
              <span>{st.actionLabel}</span>
              <Icon name="ArrowRight" size={12} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
