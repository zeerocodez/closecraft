'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Layers, 
  MessageSquare, 
  Workflow, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Bot 
} from 'lucide-react';

export default function ProductsShowcaseSection() {
  return (
    <section id="solutions" className="py-24 bg-[#080808] border-t border-[#1f1f1f] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* SECTION 6: THE CLOSECRAFT SOLUTION */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
            <Layers size={12} />
            <span>THE CLOSECRAFT SYSTEM</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            One Connected System to Help You Stop Losing Leads.
          </h2>

          <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
            CloseCraft brings together the tools, people and professional support needed to manage the journey from first enquiry to completed sale.
          </p>
        </div>

        {/* SECTION 7: THE PRODUCTS THAT POWER THE SYSTEM */}
        <div className="space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              The Right Tools for Every Stage of Your Sales Process.
            </h3>
            <p className="text-sm text-[#a1a1aa]">
              Purpose-built software and practical sales capability designed to support your team at every stage.
            </p>
          </div>

          {/* 3 Dedicated Product Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* PRODUCT 1: CLOSECRAFT */}
            <div className="rounded-3xl bg-[#101010] border border-[#1f1f1f] hover:border-[#248277]/60 transition-all p-7 sm:p-8 flex flex-col justify-between space-y-6 group shadow-xl">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#248277]/15 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
                    <MessageSquare size={24} />
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#181818] text-zinc-300 font-bold uppercase tracking-wider border border-white/5">
                    CUSTOMER ENGAGEMENT
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-extrabold text-white group-hover:text-[#45bfae] transition-colors">
                    CloseCraft
                  </h4>
                  <p className="text-xs font-semibold text-[#45bfae] uppercase tracking-wide">
                    Never lose track of an important customer conversation.
                  </p>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    CloseCraft helps businesses manage enquiries, customer conversations and AI-powered support across connected channels like WhatsApp and social media.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#080808] border border-[#1f1f1f] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <CheckCircle2 size={13} className="text-[#45bfae] shrink-0" />
                    <span>Instant WhatsApp &amp; Meta Ingestion</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-200">
                    <CheckCircle2 size={13} className="text-[#45bfae] shrink-0" />
                    <span>Approved Business Information AI Responses</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-200">
                    <CheckCircle2 size={13} className="text-[#45bfae] shrink-0" />
                    <span>Human Escalation on High-Value Leads</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1f1f1f]">
                <Link
                  href="/platform"
                  className="w-full py-3 px-4 rounded-xl bg-[#181818] hover:bg-[#202020] text-white font-bold text-xs inline-flex items-center justify-center gap-2 border border-white/10 transition-all group-hover:border-[#248277]/50"
                >
                  <span>EXPLORE CLOSECRAFT</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* PRODUCT 2: REVENUE ENGINE */}
            <div className="rounded-3xl bg-[#101010] border-2 border-[#248277]/80 hover:border-[#45bfae] transition-all p-7 sm:p-8 flex flex-col justify-between space-y-6 group shadow-2xl relative">
              <div className="absolute -top-3 left-8 bg-[#248277] text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-md">
                CORE WORKSPACE
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#248277]/25 border border-[#248277]/50 flex items-center justify-center text-[#45bfae]">
                    <Workflow size={24} />
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#181818] text-zinc-300 font-bold uppercase tracking-wider border border-white/5">
                    SALES OPERATIONS
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-extrabold text-white group-hover:text-[#45bfae] transition-colors">
                    Revenue Engine
                  </h4>
                  <p className="text-xs font-semibold text-[#45bfae] uppercase tracking-wide">
                    Turn more enquiries into managed sales opportunities.
                  </p>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    Revenue Engine helps businesses organise leads, manage follow-ups, track opportunities and improve sales performance with explainable Next Best Action.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#080808] border border-[#1f1f1f] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <CheckCircle2 size={13} className="text-[#45bfae] shrink-0" />
                    <span>Explainable Next Best Action (Respond, Escalate, Wait)</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-200">
                    <CheckCircle2 size={13} className="text-[#45bfae] shrink-0" />
                    <span>Strict Follow-Up SLA Countdowns</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-200">
                    <CheckCircle2 size={13} className="text-[#45bfae] shrink-0" />
                    <span>Revenue Leakage &amp; Stalled Deal Shield</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1f1f1f]">
                <Link
                  href="/revenue-engine"
                  className="w-full py-3 px-4 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-[#248277]/20 transition-all"
                >
                  <span>EXPLORE REVENUE ENGINE</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* PRODUCT 3: THE DIGITAL SALES SCHOOL */}
            <div className="rounded-3xl bg-[#101010] border border-[#1f1f1f] hover:border-[#248277]/60 transition-all p-7 sm:p-8 flex flex-col justify-between space-y-6 group shadow-xl">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <GraduationCap size={24} />
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#181818] text-zinc-300 font-bold uppercase tracking-wider border border-white/5">
                    SALES CAPABILITY
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-extrabold text-white group-hover:text-[#45bfae] transition-colors">
                    The Digital Sales School
                  </h4>
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
                    Build the people behind your revenue growth.
                  </p>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    DSS develops practical sales skills for individuals and business teams, including appointment setting, discovery conversations and high-ticket sales closing.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#080808] border border-[#1f1f1f] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <CheckCircle2 size={13} className="text-[#45bfae] shrink-0" />
                    <span>Four-Week Remote Sales Sprint &amp; 12 Workshops</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-200">
                    <CheckCircle2 size={13} className="text-[#45bfae] shrink-0" />
                    <span>AI Buyer Roleplay Studio &amp; Objection Coaching</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-200">
                    <CheckCircle2 size={13} className="text-[#45bfae] shrink-0" />
                    <span>Certified Remote Closer &amp; Setter Talent Pool</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1f1f1f]">
                <Link
                  href="/dss"
                  className="w-full py-3 px-4 rounded-xl bg-[#181818] hover:bg-[#202020] text-white font-bold text-xs inline-flex items-center justify-center gap-2 border border-white/10 transition-all group-hover:border-purple-500/50"
                >
                  <span>EXPLORE DSS</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
