'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AddLeadModal } from '@/app/(saas)/leads/AddLeadModal';

interface RevenuePilotGuideProps {
  workspaceName: string;
  totalLeads: number;
  hasQualifiedLeads: boolean;
  hasExecutedAction: boolean;
  dealsWonCount: number;
  totalPipelineValue: number;
  qualificationPolicy?: string | null;
}

export function RevenuePilotGuide({
  workspaceName,
  totalLeads,
  hasQualifiedLeads,
  hasExecutedAction,
  dealsWonCount,
  totalPipelineValue,
  qualificationPolicy,
}: RevenuePilotGuideProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('closecraft_pilot_guide_collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('closecraft_pilot_guide_collapsed', String(nextState));
  };

  // 5 Step Milestones
  const steps = [
    {
      id: 1,
      title: 'Free Pilot Workspace Ready',
      desc: 'Your multi-tenant workspace is active on the Free Pilot tier with full AI Autopilot enabled.',
      completed: true,
      current: false,
      badge: 'Active & Verified',
      actionLabel: 'View Settings',
      actionHref: '/settings',
      icon: 'verified',
    },
    {
      id: 2,
      title: 'Ingest Inbound Lead',
      desc: 'Add a live prospect (phone or email). Phone-only WhatsApp contacts are fully supported.',
      completed: totalLeads > 0,
      current: totalLeads === 0,
      badge: totalLeads > 0 ? `${totalLeads} Lead${totalLeads > 1 ? 's' : ''} Ingested` : 'Action Required',
      modal: true,
      icon: 'person_add',
    },
    {
      id: 3,
      title: 'AI Qualification & Standardized Signals',
      desc: 'The Revenue Engine derives Intent, ICP Fit, Urgency, and Deal Value explainably.',
      completed: hasQualifiedLeads,
      current: totalLeads > 0 && !hasQualifiedLeads,
      badge: hasQualifiedLeads ? 'Signals Evaluated' : 'Awaiting Lead',
      actionLabel: 'Review Leads Queue',
      actionHref: '/leads',
      icon: 'psychology',
    },
    {
      id: 4,
      title: 'Execute Next Best Action via WhatsApp',
      desc: 'Review the prescribed consultative opener and click "Open in WhatsApp" (wa.me) to connect directly.',
      completed: hasExecutedAction,
      current: hasQualifiedLeads && !hasExecutedAction,
      badge: hasExecutedAction ? 'Outreach Connected' : 'Ready to Send',
      actionLabel: 'Open Inbox Triage',
      actionHref: '/inbox',
      icon: 'chat',
    },
    {
      id: 5,
      title: 'Advance & Close Deal in Pipeline',
      desc: 'Drag deal from Opportunity to Proposal and mark Closed-Won to confirm revenue and closer payout.',
      completed: dealsWonCount > 0,
      current: hasExecutedAction && dealsWonCount === 0,
      badge: dealsWonCount > 0 ? `${dealsWonCount} Won` : 'Open Pipeline',
      actionLabel: 'Go to Pipeline',
      actionHref: '/pipeline',
      icon: 'trophy',
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-lg overflow-hidden transition-all mb-2">
      {/* Top Banner Header */}
      <div className="p-4 md:p-5 bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base md:text-lg text-on-surface">
                Pilot Flow: Lead to Closing
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wider">
                Free Pilot Tier
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Testing with real users for <strong className="text-on-surface font-semibold">{workspaceName}</strong>. Step-by-step guidance from onboarding to closed deal.
            </p>
          </div>
        </div>

        {/* Progress & Collapse Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-2">
            <div className="w-24 md:w-32 bg-surface-container-highest rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-on-surface">
              {completedCount}/{steps.length}
            </span>
          </div>

          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Guide' : 'Collapse Guide'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isCollapsed ? 'expand_more' : 'expand_less'}
            </span>
            <span className="text-[11px] font-medium">{isCollapsed ? 'Expand' : 'Collapse'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Steps Content */}
      {!isCollapsed && (
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-5 gap-3 bg-surface-container-lowest">
          {steps.map((step) => {
            const isDone = step.completed;
            const isCurrent = step.current;

            return (
              <div
                key={step.id}
                className={`relative rounded-xl p-4 flex flex-col justify-between transition-all border ${
                  isDone
                    ? 'bg-emerald-500/[0.04] border-emerald-500/20 shadow-sm'
                    : isCurrent
                    ? 'bg-primary/[0.06] border-primary/40 ring-1 ring-primary/30 shadow-md'
                    : 'bg-surface-container-low/40 border-outline-variant/10 opacity-75'
                }`}
              >
                {/* Step header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-primary text-on-primary animate-pulse'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {isDone ? (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        Step {step.id}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono ${
                        isDone
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isCurrent
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs md:text-sm text-on-surface mb-1 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Step Action Button */}
                <div className="mt-4 pt-3 border-t border-outline-variant/10 flex items-center justify-between">
                  {step.modal ? (
                    <AddLeadModal
                      buttonLabel="Add Inbound Lead"
                      className="w-full h-8 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                    />
                  ) : step.actionHref ? (
                    <Link
                      href={step.actionHref}
                      className={`w-full h-8 px-3 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                        isCurrent
                          ? 'bg-primary text-on-primary hover:bg-primary-container shadow-sm'
                          : isDone
                          ? 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span>{step.actionLabel}</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
