'use client';

import React from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  MessageSquare, 
  FileSpreadsheet, 
  Users, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import RevenueLeakageCalculator from './RevenueLeakageCalculator';

interface RevenueLeakSectionProps {
  onOpenAuditModal?: (data?: { leadVolume: string; monthlyLeak: string; responseTime: string }) => void;
}

export default function RevenueLeakSection({ onOpenAuditModal }: RevenueLeakSectionProps) {
  return (
    <section className="py-24 bg-[#000000] border-t border-[#1f1f1f] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* SECTION 4: THE HIDDEN REVENUE LEAK */}
        <div className="space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle size={12} />
              <span>THE ROOT CAUSE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Your Business May Not Have a Lead Problem. It May Have a Follow-Up Problem.
            </h2>

            <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
              You run ads. People enquire. Some ask for prices, others want more details, and some are ready to buy. Then the follow-up process breaks down: a message gets buried, a callback is forgotten, a salesperson gets distracted, and an interested prospect buys from someone else.
            </p>
          </div>

          {/* Illustrative 200-Enquiry Breakdown Matrix */}
          <div className="p-6 sm:p-10 rounded-3xl bg-[#080808] border border-[#1f1f1f] space-y-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1f1f1f] gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold uppercase">
                  ILLUSTRATIVE CAMPAIGN SCENARIO
                </span>
                <h3 className="text-lg font-bold text-white">What happens to 200 incoming enquiries?</h3>
              </div>
              <span className="text-xs text-zinc-500 italic">
                *Hypothetical illustrative model. Not a guarantee of volume or individual results.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-[#101010] border border-[#1f1f1f] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white">200</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">TOTAL</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-300">Enquiries Received</h4>
                <p className="text-[11px] text-zinc-400">Ad budget invested across Facebook, Instagram, and web forms.</p>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-[#101010] border border-[#1f1f1f] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-zinc-400">40</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold">FILTERED</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-300">Unqualified / Spam</h4>
                <p className="text-[11px] text-zinc-400">Wrong location or outside budget. Identified and filtered promptly.</p>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-[#101010] border border-[#1f1f1f] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-amber-400">60</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">RESEARCH</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-300">Early Price Shoppers</h4>
                <p className="text-[11px] text-zinc-400">Asking for rates. Require education and consistent follow-up touches.</p>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-2xl bg-[#101010] border border-[#248277]/40 space-y-2 shadow-lg shadow-[#248277]/5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-[#45bfae]">100</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-bold">OPPORTUNITY</span>
                </div>
                <h4 className="text-xs font-bold text-white">Genuinely Interested</h4>
                <p className="text-[11px] text-zinc-300">High buying intent. Ready to make a purchase decision if engaged promptly.</p>
              </div>
            </div>

            {/* The Leak Comparison Callout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <XCircle size={16} />
                  <span>The Unmanaged Outcome (Without CloseCraft)</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>70 opportunities lost to friction:</strong> Responses arrive 8 hours late, callbacks are forgotten in spreadsheets, salespeople lose track, and buyers purchase from faster competitors. Only <strong>10 sales closed</strong>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#081714] border border-[#248277]/60 space-y-2 shadow-lg shadow-[#248277]/10">
                <div className="flex items-center gap-2 text-[#45bfae] font-bold text-sm">
                  <CheckCircle2 size={16} />
                  <span>The Managed Outcome (With CloseCraft System)</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Every enquiry has an assigned SLA:</strong> Inquiries are acknowledged instantly, follow-ups are scheduled deterministically, and reps receive Next Best Action guidance. <strong>30+ sales closed</strong> from the same ad spend.
                </p>
              </div>
            </div>

            {/* Closing Statement */}
            <div className="pt-2 text-center">
              <p className="text-base sm:text-lg font-bold text-white tracking-tight">
                Every missed follow-up is a potential missed sale.
              </p>
            </div>
          </div>

          {/* Interactive Follow-Up Revenue Leakage ROI Calculator */}
          <div className="pt-4">
            <RevenueLeakageCalculator onOpenAuditModal={onOpenAuditModal} />
          </div>
        </div>

        {/* SECTION 5: THE COST OF POOR FOLLOW-UP */}
        <div className="space-y-12 pt-6">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider">
              <TrendingDown size={12} />
              <span>FINANCIAL CONSEQUENCES</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              You Could Be Paying to Generate Leads You Never Convert.
            </h2>

            <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
              When sales follow-up is inconsistent, the cost extends far beyond a single missed deal. It cascades across your entire commercial operation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cost 1 */}
            <div className="p-7 rounded-3xl bg-[#080808] border border-[#1f1f1f] hover:border-red-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <DollarSign size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Wasted Advertising Spend</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                You spend good money generating clicks and forms. But when nobody follows up before the prospect cools down, that ad budget is completely wasted.
              </p>
            </div>

            {/* Cost 2 */}
            <div className="p-7 rounded-3xl bg-[#080808] border border-[#1f1f1f] hover:border-amber-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Loss of Buyer Confidence</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                When a prospective customer has to wait hours or days for pricing, they assume your delivery will be just as slow. Confidence drops, and they buy elsewhere.
              </p>
            </div>

            {/* Cost 3 */}
            <div className="p-7 rounded-3xl bg-[#080808] border border-[#1f1f1f] hover:border-blue-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileSpreadsheet size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Salespeople Relying on Memory</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Reps waste hours scrolling WhatsApp chats, scattered notepad tabs, and outdated spreadsheets trying to remember who needs a callback today.
              </p>
            </div>

            {/* Cost 4 */}
            <div className="p-7 rounded-3xl bg-[#080808] border border-[#1f1f1f] hover:border-purple-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Users size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Zero Owner Visibility</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Business owners have no real-time visibility into active opportunities, response lag, or rep closing velocity until the monthly numbers fall short.
              </p>
            </div>

            {/* Cost 5 */}
            <div className="p-7 rounded-3xl bg-[#080808] border border-[#1f1f1f] hover:border-[#248277]/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#248277]/10 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
                <TrendingDown size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Unpredictable Monthly Cash Flow</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Because follow-up is haphazard, revenue swings wildly between boom and bust cycles depending on individual rep motivation rather than a repeatable system.
              </p>
            </div>

            {/* Provocation Card */}
            <div className="p-7 rounded-3xl bg-[#0d1716] border border-[#248277]/60 space-y-3 flex flex-col justify-between shadow-lg shadow-[#248277]/10">
              <div className="space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-bold uppercase">
                  DIAGNOSTIC QUESTION
                </span>
                <h3 className="text-base font-bold text-white">Where are your leads sitting right now?</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  How many interested prospects are currently sitting in your WhatsApp chats, email inboxes, spreadsheets, and reps' phones with no clear next action?
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenAuditModal?.()}
                className="mt-3 w-full py-2.5 px-4 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>Check Your Follow-Up Health</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

