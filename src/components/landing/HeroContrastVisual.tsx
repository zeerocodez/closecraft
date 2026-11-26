'use client';

import React from 'react';
import { 
  MessageSquare, 
  Clock, 
  FileSpreadsheet, 
  XCircle, 
  CheckCircle2, 
  Target, 
  Layers, 
  TrendingUp, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function HeroContrastVisual() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative">
      {/* LEFT: WITHOUT A SYSTEM */}
      <div className="rounded-3xl bg-[#0c0c0e] border border-red-500/20 p-5 sm:p-6 space-y-4 relative overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 animate-pulse" />
            <span className="text-xs font-bold text-red-400 tracking-wide uppercase">Without a System</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">
            LEAKING REVENUE
          </span>
        </div>

        {/* Leaked Event 1: Unanswered WhatsApp */}
        <div className="p-3.5 rounded-2xl bg-[#141416] border border-[#222226] space-y-2 opacity-90">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <MessageSquare size={14} className="text-emerald-500" />
              <span>WhatsApp Enquiry</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">14 hours ago</span>
          </div>
          <p className="text-xs text-zinc-300 italic">"Hi, is this package still available? What is the pricing?"</p>
          <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium">
            <XCircle size={12} />
            <span>Unanswered · Lead growing cold</span>
          </div>
        </div>

        {/* Leaked Event 2: Missed Callback in Spreadsheet */}
        <div className="p-3.5 rounded-2xl bg-[#141416] border border-[#222226] space-y-2 opacity-80">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <FileSpreadsheet size={14} className="text-amber-500" />
              <span>Lead_Export_v2.xlsx</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Row 48</span>
          </div>
          <p className="text-xs text-zinc-400">Note: "Call back Tuesday 2pm with updated proposal"</p>
          <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium">
            <XCircle size={12} />
            <span>Forgotten callback · Rep moved to another call</span>
          </div>
        </div>

        {/* Summary Outcome */}
        <div className="pt-2 border-t border-[#1f1f1f] flex items-center justify-between text-xs text-zinc-500">
          <span>Ad Spend Invested: ₦150,000</span>
          <span className="text-red-400 font-bold">Lost to Competitor</span>
        </div>
      </div>

      {/* RIGHT: WITH CLOSECRAFT */}
      <div className="rounded-3xl bg-[#08100f] border border-[#248277]/60 p-5 sm:p-6 space-y-4 relative overflow-hidden shadow-2xl shadow-[#248277]/10">
        <div className="flex items-center justify-between pb-3 border-b border-[#248277]/30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#45bfae] animate-pulse" />
            <span className="text-xs font-bold text-[#45bfae] tracking-wide uppercase">With CloseCraft HQ</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-semibold border border-[#248277]/40" title="Service Level Agreement — guaranteed maximum response time">
            RESPONSE SLA ACTIVE
          </span>
        </div>

        {/* Managed Event 1: Ingested & Assigned */}
        <div className="p-3.5 rounded-2xl bg-[#0d1716] border border-[#248277]/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Target size={14} className="text-[#45bfae]" />
              <span>Sarah D. · FinTech Africa</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-bold">
              Meta Sponsored Ad
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span className="text-[11px]">Assigned Closer: Somtochukwu O.</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1" title="Response deadline target">
              <Clock size={10} />
              <span>15m SLA Timer (Response Deadline)</span>
            </span>
          </div>
        </div>

        {/* Managed Event 2: Next Best Action & Won */}
        <div className="p-3.5 rounded-2xl bg-[#0d1716] border border-[#248277]/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Sparkles size={14} className="text-[#45bfae]" />
              <span>Next Best Action: Qualified High Intent</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              Discovery Booked
            </span>
          </div>
          <p className="text-xs text-zinc-300">Sent verified commercial proposal &middot; Handled payment objection</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
            <CheckCircle2 size={12} />
            <span>Closed Won · ₦2,500,000 Revenue Captured</span>
          </div>
        </div>

        {/* Summary Outcome */}
        <div className="pt-2 border-t border-[#248277]/30 flex items-center justify-between text-xs text-zinc-400">
          <span>Attribution: 100% Tracked</span>
          <span className="text-[#45bfae] font-bold">Zero Leaked Opportunities</span>
        </div>
      </div>
    </div>
  );
}

