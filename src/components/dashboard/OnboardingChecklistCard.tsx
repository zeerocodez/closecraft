'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Database,
  Trash2,
  Sliders,
  Users,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { seedSampleWorkspaceAction, clearSampleWorkspaceAction } from '@/app/(saas)/actions';

interface OnboardingChecklistCardProps {
  organizationName: string;
  leadCount: number;
  hasDemoSeed: boolean;
  isProfileComplete: boolean;
  isPolicyConfigured: boolean;
}

export default function OnboardingChecklistCard({
  organizationName,
  leadCount,
  hasDemoSeed,
  isProfileComplete,
  isPolicyConfigured,
}: OnboardingChecklistCardProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const steps = [
    {
      id: 1,
      title: 'Workspace Identity & WhatsApp Channel',
      desc: 'Set your organization brand name and official WhatsApp number.',
      isDone: isProfileComplete,
      href: '/settings',
      actionLabel: 'Configure in Settings',
    },
    {
      id: 2,
      title: 'Lead Qualification Policy',
      desc: 'Tune automated ICP fit thresholds, budget benchmarks, and routing rules.',
      isDone: isPolicyConfigured,
      href: '/settings',
      actionLabel: 'View Policy Presets',
    },
    {
      id: 3,
      title: 'Commercial Lead Pipeline',
      desc: 'Capture active opportunities or seed sample workspace data to test operations.',
      isDone: leadCount > 0,
      href: '/leads',
      actionLabel: 'Explore Leads Hub',
    },
    {
      id: 4,
      title: 'Unified Revenue Inbox & WhatsApp Outreach',
      desc: 'Execute Next Best Actions and one-click WhatsApp outreach directly from the triage stage.',
      isDone: leadCount > 0,
      href: '/inbox',
      actionLabel: 'Launch Revenue Inbox',
    },
  ];

  const completedCount = steps.filter((s) => s.isDone).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  const handleSeed = () => {
    setFeedback(null);
    startTransition(async () => {
      try {
        const res = await seedSampleWorkspaceAction();
        setFeedback('Successfully seeded 3 sample leads and 1 demonstration appointment.');
        window.location.reload();
      } catch (err: any) {
        setFeedback(err.message || 'Failed to seed sample workspace.');
      }
    });
  };

  const handleClear = () => {
    setFeedback(null);
    startTransition(async () => {
      try {
        await clearSampleWorkspaceAction();
        setFeedback('Sample workspace data cleared successfully.');
        window.location.reload();
      } catch (err: any) {
        setFeedback(err.message || 'Failed to clear sample workspace.');
      }
    });
  };

  return (
    <div className="bg-[#0f1214] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#248277]/10 text-[#45bfae] border border-[#248277]/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#45bfae]" />
              Trial Activation & Setup
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {completedCount} of {steps.length} Steps Completed ({progressPercent}%)
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Getting Started with {organizationName}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Complete workspace initialization to activate automated WhatsApp follow-ups, lead qualification, and appointment scheduling.
          </p>
        </div>

        {/* Quick Seed / Clear Trigger */}
        <div className="flex items-center gap-2">
          {hasDemoSeed ? (
            <button
              onClick={handleClear}
              disabled={isPending}
              className="px-4 py-2 bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isPending ? 'Clearing...' : 'Clear Demo Leads'}</span>
            </button>
          ) : (
            <button
              onClick={handleSeed}
              disabled={isPending}
              className="px-4 py-2 bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm shadow-[#248277]/20 disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isPending ? 'Seeding...' : 'Seed Sample Workspace'}</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-[#13171a] border border-[#248277]/30 rounded-xl text-xs text-[#45bfae] flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-[#13171a] rounded-full h-2 overflow-hidden border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-[#248277] to-[#45bfae] rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-4 rounded-2xl border transition-all ${
              step.isDone
                ? 'bg-[#13171a] border-white/5'
                : 'bg-[#0a0d12] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {step.isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-semibold ${step.isDone ? 'text-slate-200 line-through' : 'text-white'}`}>
                    {step.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                <div className="pt-2">
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#45bfae] hover:text-[#5cd4c3] transition"
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
