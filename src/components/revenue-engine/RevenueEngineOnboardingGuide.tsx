'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QualificationPolicyModal } from './QualificationPolicyModal';
import { AddLeadModal } from '@/app/(saas)/leads/AddLeadModal';

interface RevenueEngineOnboardingGuideProps {
  currentPolicy?: string | null;
  orgName?: string;
}

interface StepItem {
  id: number;
  title: string;
  shortLabel: string;
  badge: string;
  icon: string;
}

const STEPS: StepItem[] = [
  {
    id: 1,
    title: 'Set Your Qualification Policy & ICP Rules',
    shortLabel: '1. Policy & ICP',
    badge: 'Step 1 of 5',
    icon: 'rule',
  },
  {
    id: 2,
    title: 'Connect Inbound Lead Ingestion Channels',
    shortLabel: '2. Ingestion',
    badge: 'Step 2 of 5',
    icon: 'hub',
  },
  {
    id: 3,
    title: 'Understand AI Signal Extraction & Priority Scoring',
    shortLabel: '3. AI Signals',
    badge: 'Step 3 of 5',
    icon: 'neurology',
  },
  {
    id: 4,
    title: 'The 3 Actors: Automation vs. AI vs. Human Closers',
    shortLabel: '4. Actors & Routing',
    badge: 'Step 4 of 5',
    icon: 'diversity_3',
  },
  {
    id: 5,
    title: 'Claiming Leads, Prescribed Scripts & Closing the Loop',
    shortLabel: '5. Execution & Close',
    badge: 'Step 5 of 5',
    icon: 'verified',
  },
];

export function RevenueEngineOnboardingGuide({
  currentPolicy,
  orgName = 'Workspace',
}: RevenueEngineOnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const savedStep = localStorage.getItem('closecraft_rev_onboarding_step');
      const savedCompleted = localStorage.getItem('closecraft_rev_onboarding_completed');
      const savedExpanded = localStorage.getItem('closecraft_rev_onboarding_expanded');

      if (savedStep) setCurrentStep(Number(savedStep));
      if (savedCompleted) setCompletedSteps(JSON.parse(savedCompleted));
      if (savedExpanded !== null) setIsExpanded(savedExpanded === 'true');
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  const handleConfirmStep = (stepId: number) => {
    const updated = Array.from(new Set([...completedSteps, stepId]));
    setCompletedSteps(updated);
    try {
      localStorage.setItem('closecraft_rev_onboarding_completed', JSON.stringify(updated));
    } catch (e) {}

    if (stepId < STEPS.length) {
      const next = stepId + 1;
      setCurrentStep(next);
      try {
        localStorage.setItem('closecraft_rev_onboarding_step', String(next));
      } catch (e) {}
    }
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('closecraft_rev_onboarding_expanded', String(next));
      } catch (e) {}
      return next;
    });
  };

  const isCurrentStepConfirmed = completedSteps.includes(currentStep);
  const allCompleted = STEPS.every((s) => completedSteps.includes(s.id));

  return (
    <div className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden transition-all">
      {/* Ambient gradient glow in background */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-heading font-bold text-on-surface">
                Revenue Engine Launch & Onboarding Guide
              </h2>
              {allCompleted && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  100% Certified
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Interactive 5-step operational walkthrough to qualify leads, route reps, and prevent revenue leakage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setShowVideoModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">play_circle</span>
            <span>Watch Video</span>
          </button>
          <span className="text-xs font-mono font-semibold text-primary">
            {completedSteps.length} / {STEPS.length} Completed
          </span>
          <button
            onClick={toggleExpand}
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
            <span>{isExpanded ? 'Minimize Guide' : 'Open Guided Tour'}</span>
          </button>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="pt-4 pb-2 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                onClick={() => {
                  setCurrentStep(step.id);
                  if (!isExpanded) setIsExpanded(true);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-500/5 border-emerald-500/30 text-on-surface hover:bg-surface-container'
                    : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="material-symbols-outlined text-[18px]">
                    {isCompleted ? 'check_circle' : step.icon}
                  </span>
                  <span className="text-[10px] font-mono uppercase font-bold">
                    {isCompleted ? 'Done' : `Step ${step.id}`}
                  </span>
                </div>
                <div className="text-xs font-bold truncate leading-tight">
                  {step.shortLabel}
                </div>
                {isCurrent && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Step Body */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-outline-variant/30 relative z-10 animate-in fade-in-50 duration-200">
          
          {/* STEP 1: QUALIFICATION POLICY & ICP */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Left: Text Explanation */}
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">tune</span>
                    Step 1 • The Organization Brain
                  </div>
                  <h3 className="text-xl font-bold text-on-surface">
                    Define Your Ideal Customer Profile (ICP) & Disqualification Rules
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    The Revenue Engine is not a generic chatbot. It strictly executes your specific commercial criteria. When a lead enters, the engine reads their stated budget, business model, and timeline, then compares them directly against your <strong>Organization Qualification Policy</strong>.
                  </p>

                  <div className="space-y-2 text-xs text-on-surface">
                    <div className="flex items-start gap-2 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                      <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <div>
                        <strong>Minimum Budget Thresholds:</strong> Enforce deal sizes (e.g., ₦500,000+ or $2,000). Leads below this are automatically diverted to automated nurture rather than wasting closer time.
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                      <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <div>
                        <strong>Executive Authority:</strong> Require Founder, CEO, or Director seniority for high-ticket closing calls.
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                      <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <div>
                        <strong>Routing Mode:</strong> Choose between <code>OPEN_POOL</code> (fastest rep claims) or <code>ROUND_ROBIN</code> (automatic distribution across active team members).
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <QualificationPolicyModal currentPolicy={currentPolicy} buttonLabel="Open Policy Editor" />
                    <Link
                      href="/settings"
                      className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface border border-outline-variant/30 flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">settings</span>
                      <span>Review Workspace Settings</span>
                    </Link>
                  </div>
                </div>

                {/* Right: Graphical Simulation */}
                <div className="w-full lg:w-96 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 text-on-surface-variant font-sans font-bold">
                    <span>ACTIVE ICP POLICY SIMULATION</span>
                    <span className="text-[10px] text-emerald-400">● LIVE RUNTIME</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/20 space-y-1.5">
                    <div className="text-[11px] text-primary font-bold">Prospect: "Orbit Tech Solutions"</div>
                    <div className="text-on-surface-variant">Stated Budget: ₦500,000</div>
                    <div className="text-on-surface-variant">Title: Managing Director</div>
                    <div className="text-on-surface-variant">Timeline: Immediate (&lt; 14 days)</div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1 font-sans">
                    <div className="font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Policy Evaluation: PASSED</span>
                    </div>
                    <div className="text-[11px] text-emerald-200/80">
                      • Budget ≥ ₦500k threshold ✓<br />
                      • Executive authority confirmed ✓<br />
                      • Result: Route to Closer with 15m SLA
                    </div>
                  </div>
                </div>

              </div>

              {/* Confirmation Action */}
              <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-on-surface-variant">
                  Confirm you have reviewed or customized your organization’s Qualification Policy before moving forward.
                </p>
                <button
                  onClick={() => handleConfirmStep(1)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
                    isCurrentStepConfirmed
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-primary hover:bg-primary-container text-on-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isCurrentStepConfirmed ? 'check_circle' : 'arrow_forward'}
                  </span>
                  <span>
                    {isCurrentStepConfirmed
                      ? '✓ Policy Configured — Proceed to Step 2'
                      : 'I Have Set/Reviewed My Policy — Next Step'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: INGESTION CHANNELS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Left: Text Explanation */}
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">sensors</span>
                    Step 2 • The Ingestion Funnel
                  </div>
                  <h3 className="text-xl font-bold text-on-surface">
                    Connect Inbound Channels: Web, Meta Ads, WhatsApp & CSV
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Leads enter the Revenue Engine through zero-latency webhooks. No manual copying into spreadsheets, and no delays where leads go cold. Every entry is stamped with the prospect’s source, message, and organization ID.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                        <span className="material-symbols-outlined text-[16px]">web</span>
                        <span>Website Demo & Audit Forms</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Embedded directly on your public marketing pages. Submissions immediately trigger the engine.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-blue-400">
                        <span className="material-symbols-outlined text-[16px]">campaign</span>
                        <span>Meta & Facebook Lead Ads</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Instant webhook at <code>/api/webhooks/facebook</code> routes ad responses in under 2 seconds.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400">
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                        <span>WhatsApp Business Webhook</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Inbound messages at <code>/api/webhooks/whatsapp</code> sync straight into the Unified Inbox.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400">
                        <span className="material-symbols-outlined text-[16px]">upload_file</span>
                        <span>CSV Bulk Lead Import</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Import past spreadsheets on <code>/leads</code>. The engine evaluates every row retroactively.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <AddLeadModal />
                    <Link
                      href="/leads"
                      className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface border border-outline-variant/30 flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">table_view</span>
                      <span>Go to Leads Master Sheet</span>
                    </Link>
                  </div>
                </div>

                {/* Right: Graphical Convergence Diagram */}
                <div className="w-full lg:w-96 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 space-y-4">
                  <div className="text-xs font-bold text-on-surface uppercase tracking-wider text-center">
                    Omni-Channel Ingestion Architecture
                  </div>

                  {/* Flow visualization */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container text-xs">
                      <span className="flex items-center gap-1.5 text-primary font-bold">
                        <span className="material-symbols-outlined text-[16px]">web</span> Website Form
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">→ Ingestion API</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container text-xs">
                      <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                        <span className="material-symbols-outlined text-[16px]">campaign</span> Meta Lead Ad
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">→ Facebook Webhook</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <span className="material-symbols-outlined text-[16px]">chat</span> WhatsApp DM
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">→ WhatsApp Webhook</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <span className="material-symbols-outlined text-primary text-[28px] animate-bounce">
                      arrow_downward
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-center">
                    <div className="font-bold text-xs text-primary flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">psychology</span>
                      <span>REVENUE ENGINE CORE</span>
                    </div>
                    <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                      Extracts Signals • Calculates Priority • Assigns Actor
                    </div>
                  </div>
                </div>

              </div>

              {/* Confirmation Action */}
              <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-on-surface-variant">
                  Confirm you understand how leads enter the engine and have tested capturing or creating a lead.
                </p>
                <button
                  onClick={() => handleConfirmStep(2)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
                    isCurrentStepConfirmed
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-primary hover:bg-primary-container text-on-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isCurrentStepConfirmed ? 'check_circle' : 'arrow_forward'}
                  </span>
                  <span>
                    {isCurrentStepConfirmed
                      ? '✓ Ingestion Verified — Proceed to Step 3'
                      : 'I Understand Ingestion — Next Step'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SIGNALS & PRIORITY SCORING */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Left: Text Explanation */}
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">analytics</span>
                    Step 3 • The Intelligence Layer
                  </div>
                  <h3 className="text-xl font-bold text-on-surface">
                    Transparent Signal Extraction & Priority Scoring
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Closecraft never uses opaque or arbitrary AI scores. Every lead is evaluated across <strong>4 explainable signals</strong> that any team member can inspect and understand at a glance:
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                      <div>
                        <strong className="text-on-surface">1. INTENT (0 – 100):</strong>
                        <p className="text-on-surface-variant">Evaluates buyer intent keywords (e.g. "pricing", "ready to hire", "contract") vs. casual browsing.</p>
                      </div>
                      <span className="font-mono font-bold text-primary px-2 py-1 bg-surface-container rounded">Weight: 50%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                      <div>
                        <strong className="text-on-surface">2. URGENCY (0 – 100):</strong>
                        <p className="text-on-surface-variant">Evaluates purchase timeframe (e.g. "this week" / "today" = 95/100, "next quarter" = 35/100).</p>
                      </div>
                      <span className="font-mono font-bold text-amber-400 px-2 py-1 bg-surface-container rounded">Weight: 30%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                      <div>
                        <strong className="text-on-surface">3. FIT (0 – 100):</strong>
                        <p className="text-on-surface-variant">Alignment with your Tenant ICP Policy (Executive title, corporate email, commercial scale).</p>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 px-2 py-1 bg-surface-container rounded">Weight: 20%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                      <div>
                        <strong className="text-on-surface">4. ESTIMATED VALUE:</strong>
                        <p className="text-on-surface-variant">Extracted deal size (e.g. ₦500k, ₦3.5M) automatically attaches a Deal to your Pipeline.</p>
                      </div>
                      <span className="font-mono font-bold text-blue-400 px-2 py-1 bg-surface-container rounded">Deal Size</span>
                    </div>
                  </div>
                </div>

                {/* Right: Math Gauge & Formula Box */}
                <div className="w-full lg:w-96 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 space-y-4 font-mono text-xs">
                  <div className="text-xs font-sans font-bold text-on-surface uppercase tracking-wider text-center">
                    The Priority Score Formula
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 text-center space-y-2 font-mono">
                    <div className="text-primary font-bold text-sm">
                      Priority = (Intent × 0.5) + (Urgency × 0.3) + (Fit × 0.2)
                    </div>
                    <div className="text-[11px] text-on-surface-variant font-sans">
                      Calculates an explainable ranking from 1 to 100 for your Action Queue.
                    </div>
                  </div>

                  <div className="space-y-2 font-sans">
                    <div className="flex justify-between items-center text-xs">
                      <span>Priority 80 – 100 (Hot Deals)</span>
                      <span className="text-error font-bold font-mono">15m SLA</span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div className="bg-error h-full rounded-full" style={{ width: '90%' }} />
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span>Priority 50 – 79 (Qualified)</span>
                      <span className="text-warning font-bold font-mono">AI Triage</span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div className="bg-warning h-full rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Confirmation Action */}
              <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-on-surface-variant">
                  Confirm you understand how the engine extracts signals and calculates lead priority.
                </p>
                <button
                  onClick={() => handleConfirmStep(3)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
                    isCurrentStepConfirmed
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-primary hover:bg-primary-container text-on-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isCurrentStepConfirmed ? 'check_circle' : 'arrow_forward'}
                  </span>
                  <span>
                    {isCurrentStepConfirmed
                      ? '✓ Scoring Understood — Proceed to Step 4'
                      : 'I Understand Signals & Priority — Next Step'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ACTORS & ROUTING */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Left: Text Explanation */}
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">alt_route</span>
                    Step 4 • The Routing Matrix
                  </div>
                  <h3 className="text-xl font-bold text-on-surface">
                    The 3 Actors: Why Are All Actions Pending?
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    A core question new organizations ask is: <em>"Why are all entries marked as PENDING in the Command Centre?"</em> In Closecraft, the AI Engine generates prescriptive proposals. It does not replace human judgement; it prioritizes it.
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                          <span>Actor: HUMAN (Intent ≥ 80 or High Fit)</span>
                        </span>
                        <span className="font-mono">Action: ASSIGN_HUMAN</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        High-value opportunities are immediately surfaced for a closer or setter. Stays <code>PENDING</code> until a rep clicks <strong>Claim Action</strong>, moving it to <code>EXECUTING</code>.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">psychology</span>
                          <span>Actor: AI ENGINE (Intent 55 – 79)</span>
                        </span>
                        <span className="font-mono">Action: SEND_BOOKING_LINK</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Qualified prospects who need initial scheduling or triage. AI drafts responses and shares interactive booking calendars.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">autorenew</span>
                          <span>Actor: AUTOMATION (Intent &lt; 55 or Disqualified)</span>
                        </span>
                        <span className="font-mono">Action: SEND_NURTURE_SEQUENCE</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Runs automated drip sequences in the background via cron. Zero closer time is wasted on unready leads.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Graphical Routing Matrix */}
                <div className="w-full lg:w-96 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 space-y-4">
                  <div className="text-xs font-bold text-on-surface uppercase tracking-wider text-center">
                    Next Best Action State Machine
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse" />
                        <span className="font-bold">PENDING</span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant">Queued in Command Centre</span>
                    </div>

                    <div className="flex justify-center">
                      <span className="text-[10px] text-primary font-mono">Rep clicks "Claim Action" ↓</span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <span className="font-bold">EXECUTING</span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant">Assigned & SLA Clock Active</span>
                    </div>

                    <div className="flex justify-center">
                      <span className="text-[10px] text-emerald-400 font-mono">Call made / demo booked ↓</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span className="font-bold">COMPLETED</span>
                      </div>
                      <span className="text-[11px]">Audited in AuditLog</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Confirmation Action */}
              <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-on-surface-variant">
                  Confirm you understand the 3 Actors and the PENDING → EXECUTING → COMPLETED lifecycle.
                </p>
                <button
                  onClick={() => handleConfirmStep(4)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
                    isCurrentStepConfirmed
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-primary hover:bg-primary-container text-on-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isCurrentStepConfirmed ? 'check_circle' : 'arrow_forward'}
                  </span>
                  <span>
                    {isCurrentStepConfirmed
                      ? '✓ Routing Verified — Proceed to Step 5'
                      : 'I Understand the Actor Model — Next Step'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CLAIMING & CLOSING THE LOOP */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Left: Text Explanation */}
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                    Step 5 • The Closing Loop
                  </div>
                  <h3 className="text-xl font-bold text-on-surface">
                    Claiming Leads, Prescribed Coaching & Closing Deals
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Now that your engine is configured, here is how your sales closers and setters win every day using Closecraft:
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">touch_app</span>
                      <div>
                        <strong className="text-on-surface">1. Click Any Lead Row:</strong>
                        <p className="text-on-surface-variant">The unified AI Assessment modal slides in showing the exact budget, decision-maker authority, and deal health.</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0 mt-0.5">content_copy</span>
                      <div>
                        <strong className="text-on-surface">2. Copy the Prescribed Opener Script:</strong>
                        <p className="text-on-surface-variant">Reps don't guess what to say. The AI provides a tailored opener, target closing objective, and recommended channel (WhatsApp Direct Audio vs. Zoom).</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-400 text-[20px] shrink-0 mt-0.5">kanban</span>
                      <div>
                        <strong className="text-on-surface">3. Move Deal to Won on Pipeline:</strong>
                        <p className="text-on-surface-variant">Drag the deal from Opportunity to Discovery, Proposal Sent, and Deal Won. All metrics update live across analytics and rep commissions.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      href="/rep"
                      className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">target</span>
                      <span>Go to Closer & Setter Hub</span>
                    </Link>
                    <Link
                      href="/pipeline"
                      className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant/30 flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">view_kanban</span>
                      <span>View Sales Pipeline</span>
                    </Link>
                  </div>
                </div>

                {/* Right: Closing Celebration Card */}
                <div className="w-full lg:w-96 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 space-y-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                    <span className="material-symbols-outlined text-[32px]">trophy</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-on-surface">You Are Ready to Close</h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Your Revenue Operating System is active. Every lead has a clear state, an interpretable score, and an assigned actor.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 text-left text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>15-Minute SLA Protection Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Revenue Leakage Detection Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Multi-Tenant Isolation Enforced</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Confirmation Action */}
              <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-on-surface-variant">
                  Confirm your onboarding completion to certify your organization in the Revenue Engine.
                </p>
                <button
                  onClick={() => handleConfirmStep(5)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>✓ Complete & Certify Onboarding</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Video Walkthrough Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 md:p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">smart_display</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">Revenue Engine Walkthrough & Masterclass</h3>
                  <p className="text-xs text-on-surface-variant font-mono">Step-by-step explainer for {orgName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden aspect-video bg-black shadow-inner border border-outline-variant/30">
              <video
                src="/videos/closecraft-onboarding.mp4"
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-on-surface-variant">
              <span>💡 Follow along with the 5 interactive steps below to certify your workspace.</span>
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold transition-colors"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
