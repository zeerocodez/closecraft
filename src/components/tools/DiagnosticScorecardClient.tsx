'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  TrendingDown, 
  Layers, 
  Share2, 
  Copy, 
  Check, 
  Workflow, 
  MessageSquare, 
  DollarSign,
  Sparkles,
  Lock
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { 
  CurrencyCode, 
  CURRENCY_CONFIGS, 
  formatCurrencyAmount, 
  computeDiagnosticScorecard,
  ScorecardParams 
} from '@/lib/tools/diagnostic-scoring';

export default function DiagnosticScorecardClient() {
  const searchParams = useSearchParams();

  // Extract query parameters
  const businessName = searchParams.get('business') || searchParams.get('company') || 'Your Business';
  const contactName = searchParams.get('name') || '';
  const contactEmail = searchParams.get('email') || '';
  const contactPhone = searchParams.get('phone') || '';
  const bottleneck = searchParams.get('bottleneck') || 'RESPONSE_LAG';
  const speed = searchParams.get('speed') || 'HOURS_1_TO_4';
  const leadVolume = searchParams.get('volume') || '50_TO_200';
  const dealValue = searchParams.get('dealValue') || '50K_TO_250K';
  const currentTool = searchParams.get('tool') || 'SPREADSHEET';

  // Currency State
  const initialCurrency = (searchParams.get('currency')?.toUpperCase() as CurrencyCode) || 'NGN';
  const [currency, setCurrency] = useState<CurrencyCode>(
    ['NGN', 'USD', 'GBP'].includes(initialCurrency) ? initialCurrency : 'NGN'
  );

  const [copiedLink, setCopiedLink] = useState(false);

  // Compute scorecard results
  const report = useMemo(() => {
    const params: ScorecardParams = {
      leadVolume,
      dealValue,
      bottleneck,
      currentTool,
      responseTime: speed,
      businessName,
      contactName,
      contactEmail,
      contactPhone,
    };
    return computeDiagnosticScorecard(params);
  }, [leadVolume, dealValue, bottleneck, currentTool, speed, businessName, contactName, contactEmail, contactPhone]);

  // Copy shareable scorecard link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // WhatsApp connection link
  const whatsappNumber = process.env.NEXT_PUBLIC_CLOSECRAFT_WHATSAPP_NUMBER || '2349026365853';
  const whatsappMessage = encodeURIComponent(
    `Hello CloseCraft Team, I just reviewed my Follow-Up Diagnostic Scorecard for ${businessName}.\n\nScore: ${report.score}/100 (Grade ${report.grade})\nEstimated Monthly Leak: ${formatCurrencyAmount(report.monthlyLeakNGN, currency)}\nTop Bottleneck: ${bottleneck}\n\nI want to discuss plugging this leakage.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Pre-filled signup URL
  const signupParams = new URLSearchParams({
    name: contactName,
    companyName: businessName,
    email: contactEmail,
    whatsappNumber: contactPhone,
    score: report.score.toString(),
    leak: formatCurrencyAmount(report.monthlyLeakNGN, currency),
  });
  const signupUrl = `/signup?${signupParams.toString()}`;

  // Dynamic Grade Color Classes
  const gradeColors: Record<string, { badge: string; border: string; glow: string }> = {
    A: { badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/10' },
    B: { badge: 'text-[#45bfae] bg-[#248277]/20 border-[#248277]/40', border: 'border-[#248277]/50', glow: 'shadow-[#248277]/10' },
    C: { badge: 'text-amber-400 bg-amber-500/10 border-amber-500/40', border: 'border-amber-500/50', glow: 'shadow-amber-500/10' },
    D: { badge: 'text-orange-400 bg-orange-500/10 border-orange-500/40', border: 'border-orange-500/50', glow: 'shadow-orange-500/10' },
    F: { badge: 'text-red-400 bg-red-500/10 border-red-500/40', border: 'border-red-500/50', glow: 'shadow-red-500/10' },
  };
  const activeColor = gradeColors[report.grade] || gradeColors.D;

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#248277] selection:text-white font-sans antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center group" aria-label="CloseCraft HQ Home">
            <Logo variant="full" size="md" alt="CloseCraft HQ" />
          </Link>

          <div className="flex items-center gap-3">
            {/* Currency Switcher */}
            <div className="flex items-center bg-[#101010] p-1 rounded-xl border border-[#1f1f1f] text-xs font-mono font-bold">
              {(['NGN', 'USD', 'GBP'] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    currency === c ? 'bg-[#248277] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {CURRENCY_CONFIGS[c].symbol} {c}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101010] hover:bg-[#181818] border border-[#1f1f1f] text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check size={14} className="text-[#45bfae]" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Scorecard'}</span>
            </button>

            <Link
              href={signupUrl}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all shadow-md shadow-[#248277]/25"
            >
              Claim Workspace
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Identification Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f1f]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-[10px] font-bold uppercase tracking-wider">
              <span>OFFICIAL DIAGNOSTIC FINDING</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Follow-Up Health Scorecard
            </h1>
            <p className="text-xs sm:text-sm text-[#a1a1aa]">
              Generated for <span className="text-white font-semibold">{businessName}</span> &middot; Based on response speed, lead volume, and tool friction.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">STATUS:</span>
            <span className={`text-xs font-bold font-mono px-3 py-1 rounded-xl border ${activeColor.badge}`}>
              GRADE {report.grade} &middot; {report.score}/100
            </span>
          </div>
        </div>

        {/* Hero Scorecard Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Grade Dial & Summary (5 Cols) */}
          <div className={`lg:col-span-5 p-8 rounded-3xl bg-[#0c0c0e] border ${activeColor.border} shadow-2xl ${activeColor.glow} flex flex-col justify-between space-y-6 text-center relative overflow-hidden`}>
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                OVERALL FOLLOW-UP HEALTH
              </span>

              {/* Visual Score Ring */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#1a1a1e"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={301.6}
                    strokeDashoffset={301.6 - (301.6 * report.score) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className={report.score >= 70 ? 'text-[#45bfae]' : report.score >= 50 ? 'text-amber-400' : 'text-red-400'}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white font-mono">{report.score}</span>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">OUT OF 100</span>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {report.gradeTitle}
                </h2>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  {report.gradeDescription}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141416] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">PRIMARY LEAKAGE CAUSE</span>
              <span className="text-xs font-bold text-white">
                {bottleneck === 'RESPONSE_LAG' && 'Delayed Responses in WhatsApp DMs'}
                {bottleneck === 'STALLED_PIPELINE' && 'Deals Stalling in Pipeline & Spreadsheets'}
                {bottleneck === 'LACK_OF_LEADS' && 'Inconsistent Ad Creative & Top-of-Funnel Traffic'}
                {bottleneck === 'SALES_SKILLS' && 'Rep Objection Handling & Closing Friction'}
              </span>
            </div>
          </div>

          {/* Right Column: Financial Quantification (7 Cols) */}
          <div className="lg:col-span-7 p-8 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                  <TrendingDown size={14} />
                  <span>ESTIMATED REVENUE LEAKAGE</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  *Illustrative Benchmark Model
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#121214] border border-red-500/20 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">MONTHLY LOSS</span>
                  <div className="text-2xl sm:text-3xl font-black text-red-400 font-mono">
                    {formatCurrencyAmount(report.monthlyLeakNGN, currency)}
                  </div>
                  <p className="text-[11px] text-zinc-500">Revenue slipping through response delay</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#121214] border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">ANNUALIZED RUN-RATE LOSS</span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                    {formatCurrencyAmount(report.annualLeakNGN, currency)}
                  </div>
                  <p className="text-[11px] text-zinc-500">Cumulative loss without systematic follow-up</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#081513] border border-[#248277]/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#45bfae]">
                  <Sparkles size={14} />
                  <span>Plug Your Leakage with CloseCraft</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  By centralizing enquiries into a multi-user workspace with strict 15-minute SLA countdowns, your business can recover an estimated <strong>30%–65%</strong> of this leaked revenue from the leads you already pay to generate.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href={signupUrl}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-extrabold text-xs sm:text-sm text-center shadow-xl shadow-[#248277]/25 transition-all inline-flex items-center justify-center gap-2"
              >
                <span>CLAIM 7-DAY WORKSPACE FOR THIS LEAK</span>
                <ArrowRight size={15} />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-[#141416] hover:bg-[#1a1a1d] text-zinc-300 font-semibold text-xs border border-white/10 transition-colors inline-flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} className="text-[#25D366]" />
                <span>Discuss on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4-STAGE REVENUE LOOP BREAKDOWN */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight">
              4-Stage Revenue Growth System Health
            </h3>
            <p className="text-xs text-[#a1a1aa]">
              How your current sales process performs across the 4 essential stages from enquiry to purchase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {report.stageBreakdown.map((stage) => {
              const isCritical = stage.status === 'CRITICAL_LEAK';
              const isModerate = stage.status === 'MODERATE_FRICTION';
              return (
                <div
                  key={stage.stageNumber}
                  className={`p-5 rounded-2xl bg-[#0c0c0e] border space-y-3 flex flex-col justify-between ${
                    isCritical
                      ? 'border-red-500/40 bg-red-950/10'
                      : isModerate
                      ? 'border-amber-500/30'
                      : 'border-[#248277]/30'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-[#141416] border border-white/10 flex items-center justify-center text-xs font-bold text-[#45bfae]">
                        {stage.stageNumber}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          isCritical
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : isModerate
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-[#248277]/20 text-[#45bfae] border border-[#248277]/30'
                        }`}
                      >
                        {stage.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-white">
                      {stage.stageName}
                    </h4>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {stage.insight}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-500">Stage Health:</span>
                    <span className={`font-bold ${isCritical ? 'text-red-400' : isModerate ? 'text-amber-400' : 'text-[#45bfae]'}`}>
                      {stage.score} / 100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRESCRIBED SYSTEM INTERVENTIONS */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-bold uppercase">
              RECOMMENDED INTERVENTIONS
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              3 Deterministic System Fixes to Stop This Leak
            </h3>
            <p className="text-xs text-[#a1a1aa]">
              These automated operational capabilities will be pre-configured when you launch your workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.prescribedInterventions.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#121214] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-[#248277]/20 text-[#45bfae] font-mono text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">{item.targetStage}</span>
                </div>
                <h4 className="text-xs font-bold text-white">{item.title}</h4>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Final Callout Bar */}
          <div className="p-6 rounded-2xl bg-[#0d1a17] border border-[#248277]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-white">
                Ready to plug the follow-up leak in {businessName}?
              </h4>
              <p className="text-xs text-zinc-300">
                Your 7-day Starter trial begins immediately with no credit card required.
              </p>
            </div>

            <Link
              href={signupUrl}
              className="py-3 px-6 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-extrabold text-xs shadow-lg shadow-[#248277]/20 transition-all shrink-0 inline-flex items-center gap-1.5"
            >
              <span>LAUNCH WORKSPACE NOW</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
