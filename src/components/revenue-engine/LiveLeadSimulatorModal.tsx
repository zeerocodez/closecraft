'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  UserCheck,
  ShieldAlert,
  Loader2,
  TrendingUp,
} from 'lucide-react';

interface SimulationResult {
  lead: any;
  signals: any[];
  primaryAction: any;
  assignedRep: any;
}

export function LiveLeadSimulatorModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<
    'high_intent_enterprise' | 'meta_ad_sme' | 'low_budget_disqualified'
  >('high_intent_enterprise');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      key: 'high_intent_enterprise' as const,
      title: 'High-Intent Enterprise (₦5,000,000)',
      channel: 'WhatsApp Business API',
      sender: 'Alhaji Garba Danladi (Danladi Agro Industries)',
      badge: 'B2B Advisory Sprint',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      description:
        '"Managing Director here. 150 field distributors, orders leaking because follow-ups take 24 hours. We need enterprise advisory sprint & WhatsApp CRM in 3 weeks. Budget: ₦5M. Can we speak today?"',
      expected: 'Escalates immediately to Human Closer (P: 94).',
    },
    {
      key: 'meta_ad_sme' as const,
      title: 'Meta Lead Ad Campaign (₦2,500,000)',
      channel: 'Instagram Lead Form',
      sender: 'Mrs. Bukola Adeniran (Nexus Retail Lagos)',
      badge: 'Multi-Location Retail',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      description:
        '"Interested in sales process automation for our 4 store locations in Lagos. Stated budget ₦2.5M. Looking for appointment setting and objection handling support."',
      expected: 'AI schedules discovery session and sends booking link (P: 82).',
    },
    {
      key: 'low_budget_disqualified' as const,
      title: 'Disqualified Out-of-Scope (₦50,000)',
      channel: 'WhatsApp',
      sender: 'Emeka Junior (Student Startup)',
      badge: 'Disqualification Gate',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      description:
        '"Hello, I am an undergraduate student. Can you review my CV and help me with my university project? My budget is ₦50,000."',
      expected: 'Disqualified by deterministic policy (< ₦500k minimum, student). Zero rep time wasted.',
    },
  ];

  const handleSimulate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/demo/simulate-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioKey: selectedScenario }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Simulation failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to simulate lead');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAndRefresh = () => {
    setIsOpen(false);
    setResult(null);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
      >
        <Zap size={14} className="fill-white" />
        <span>⚡ Simulate Inbound Lead</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-surface-container-low border border-outline-variant/40 rounded-3xl shadow-2xl p-6 sm:p-7 relative overflow-hidden">
            {/* Ambient highlight */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-on-surface">
                    Interactive Inbound Lead Simulator
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Inject a live prospect scenario directly into the Revenue Engine and watch real-time AI qualification.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!result ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Select Prospect Scenario:
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {presets.map((preset) => (
                    <div
                      key={preset.key}
                      onClick={() => setSelectedScenario(preset.key)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        selectedScenario === preset.key
                          ? 'bg-surface-container border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                          : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              selectedScenario === preset.key ? 'bg-emerald-400' : 'bg-slate-600'
                            }`}
                          />
                          <h4 className="font-bold text-xs sm:text-sm text-on-surface">
                            {preset.title}
                          </h4>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${preset.badgeColor}`}
                        >
                          {preset.channel}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant italic pl-4 mb-1.5 border-l-2 border-outline-variant/30">
                        {preset.description}
                      </p>
                      <p className="text-[11px] text-emerald-400 font-semibold pl-4">
                        Outcome: {preset.expected}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleSimulate}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Running Canonical AI Extractor...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={14} />
                        <span>Inject Lead into Revenue Engine</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Live Result View */
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                  <div>
                    <p className="font-bold text-white text-xs">
                      Live Lead Successfully Ingested &amp; Evaluated!
                    </p>
                    <p className="text-[11px] text-emerald-300/80">
                      Signals extracted, policy rules checked, priority calculated, and next action assigned.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">
                        {result.lead.name}
                      </h4>
                      <p className="text-xs text-on-surface-variant font-mono">
                        {result.lead.phone} • {result.lead.source}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-xs">
                      Priority Score: {result.lead.buyingIntent ?? 80}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-outline-variant/20 text-xs">
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Stated Budget</span>
                      <span className="font-bold font-mono text-emerald-400">
                        {result.lead.estimatedValue ? `₦${result.lead.estimatedValue.toLocaleString()}` : 'Disqualified'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Next Action</span>
                      <span className="font-bold text-primary truncate block">
                        {result.primaryAction?.type || result.lead.nextAction || 'TRIAGE'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Responsible Actor</span>
                      <span className="font-bold text-on-surface block">
                        {result.primaryAction?.recommendedActor || 'HUMAN'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Assigned Closer</span>
                      <span className="font-bold text-on-surface truncate block">
                        {result.assignedRep?.name || 'Round-Robin Pool'}
                      </span>
                    </div>
                  </div>

                  {result.primaryAction?.reason && (
                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                        AI Reasoning &amp; Explainable Factor:
                      </p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {result.primaryAction.reason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    &larr; Simulate Another Scenario
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyAndRefresh}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <span>View in Command Centre Queue</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
