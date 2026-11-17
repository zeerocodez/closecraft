'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  TrendingDown, 
  ShieldCheck, 
  HelpCircle,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import RevenueLeakageCalculator from '@/components/landing/RevenueLeakageCalculator';
import DiagnosticAuditModal from '@/components/landing/DiagnosticAuditModal';

export default function FullCalculatorPageClient() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#248277] selection:text-white font-sans antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center group" aria-label="CloseCraft HQ Home">
            <Logo variant="full" size="md" alt="CloseCraft HQ" />
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-xl bg-[#101010] border border-[#1f1f1f]"
            >
              &larr; Back to Home
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all shadow-md shadow-[#248277]/25"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
            <Calculator size={13} />
            <span>COMMERCIAL IMPACT CALCULATOR</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            How Much Is Lead Response Friction Costing Your Business?
          </h1>

          <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
            When you run ads or generate organic interest, every minute of delay degrades conversion intent. Use this interactive calculator to estimate the revenue you can recover with systematic response SLAs.
          </p>
        </div>

        {/* The Calculator */}
        <RevenueLeakageCalculator onOpenAuditModal={() => setModalOpen(true)} />

        {/* Empirical Evidence & Benchmark Table */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-8">
          <div className="space-y-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
              INDUSTRY RESEARCH BENCHMARKS
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Why Lead Response Speed Dictates Revenue Outcomes
            </h2>
            <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
              Extensive studies across high-value sales (including the Harvard Business Review and Lead Response Management studies) demonstrate that prospective buyers contact multiple vendors simultaneously. The first business to respond substantively wins the sale up to 78% of the time.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1f1f1f] text-zinc-400 font-mono text-[11px]">
                  <th className="py-3 px-4">Response Timeframe</th>
                  <th className="py-3 px-4">Est. Conversion Rate</th>
                  <th className="py-3 px-4">Buyer Psychology</th>
                  <th className="py-3 px-4">CloseCraft Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                <tr className="bg-[#121c1a]/50 text-white">
                  <td className="py-3.5 px-4 font-bold text-[#45bfae] flex items-center gap-1.5">
                    <Clock size={13} />
                    <span>Under 15 Minutes</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#45bfae]">~18% - 25%</td>
                  <td className="py-3.5 px-4 text-zinc-300">Peak buying intent; prospect is still focused on their immediate need.</td>
                  <td className="py-3.5 px-4 text-zinc-300">SLA countdown timers and instant context AI support.</td>
                </tr>
                <tr className="text-zinc-300">
                  <td className="py-3.5 px-4 font-semibold text-amber-400">1 to 4 Hours</td>
                  <td className="py-3.5 px-4 font-mono text-amber-400">~8% - 12%</td>
                  <td className="py-3.5 px-4 text-zinc-400">Intent drops by 50%+; prospect has returned to daily work or contacted competitors.</td>
                  <td className="py-3.5 px-4 text-zinc-400">Automated reminder alerts before the lead cools down.</td>
                </tr>
                <tr className="text-zinc-300">
                  <td className="py-3.5 px-4 font-semibold text-orange-400">24+ Hours</td>
                  <td className="py-3.5 px-4 font-mono text-orange-400">~3% - 5%</td>
                  <td className="py-3.5 px-4 text-zinc-400">Prospect has likely already committed to a competitor or forgotten the inquiry.</td>
                  <td className="py-3.5 px-4 text-zinc-400">Overdue escalation routing to senior sales managers.</td>
                </tr>
                <tr className="text-zinc-400">
                  <td className="py-3.5 px-4 font-semibold text-red-400">Days later / Forgotten</td>
                  <td className="py-3.5 px-4 font-mono text-red-400">&lt; 1.5%</td>
                  <td className="py-3.5 px-4 text-zinc-500">Total revenue leakage; advertising spend is effectively forfeited.</td>
                  <td className="py-3.5 px-4 text-zinc-500">Deterministic Next Best Action prevents leads from stalling.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostic Audit Link Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0c1a17] border border-[#248277] text-center space-y-4">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#248277]/20 text-[#45bfae] font-bold uppercase tracking-wider">
            NEXT STEP
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Ready to audit your sales follow-up process?
          </h3>
          <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-xl mx-auto leading-relaxed">
            Take our 2-minute diagnostic audit to identify specific operational leaks in your CRM and sales team workflow.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/audit"
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#248277]/25 inline-flex items-center justify-center gap-2"
            >
              <span>Take Full Diagnostic Audit</span>
              <ArrowRight size={15} />
            </Link>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#141416] hover:bg-[#1b1b1e] text-zinc-300 font-semibold text-xs sm:text-sm border border-white/10"
            >
              Request Rapid Audit
            </button>
          </div>
        </div>
      </main>

      {/* Audit Modal */}
      <DiagnosticAuditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

