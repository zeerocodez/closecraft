'use client';

import React from 'react';
import { 
  Download, 
  FileText, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Users,
  Target,
  Clock
} from 'lucide-react';

export default function UserGuideDownloadSection() {
  const guidePdfUrl = '/guides/CloseCraft-From-Enquiry-To-Customer-Guide.pdf';
  const fileName = 'CloseCraft-From-Enquiry-To-Customer-Guide.pdf';

  const chapters = [
    {
      number: '01',
      title: 'The Real Cost of Delayed Follow-Up',
      desc: 'Why responding in under 5 minutes increases conversion rates by 391% and how leads grow cold when left in WhatsApp silos.'
    },
    {
      number: '02',
      title: 'Connecting Inbound WhatsApp & Meta Ads',
      desc: 'Simple step-by-step setup to capture leads automatically from Facebook and Instagram forms into your central revenue engine.'
    },
    {
      number: '03',
      title: 'The 3-Tier Lead Triage & Qualification Framework',
      desc: 'How to separate hot buyers from window shoppers instantly using clear intent signals, budget checks, and urgency.'
    },
    {
      number: '04',
      title: 'Assigning Next Best Actions & SLAs',
      desc: 'Ensure no deal is ever left without an assigned owner, clear deadline, and predetermined follow-up cadence.'
    },
    {
      number: '05',
      title: 'Overcoming Common Closing Objections',
      desc: 'Grade-4, simple English objection-handling scripts for pricing, timing, trust, and competitor comparisons.'
    },
    {
      number: '06',
      title: 'The Promise Ledger: Delivering What You Closed',
      desc: 'Protect customer trust after the payment: tracking commitments, onboarding milestones, and repeat referrals.'
    }
  ];

  return (
    <section id="user-guide" className="py-20 md:py-28 bg-[#040807] border-t border-[#1f2937] relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#248277]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-[#C7F36B]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-[#45bfae]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider shadow-inner">
            <BookOpen size={13} className="text-[#45bfae]" />
            <span>Official 22-Page Field Manual</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
            From Enquiry to Customer
          </h2>

          <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
            A simple, practical guide to attracting qualified leads, managing every enquiry in one place, and closing more high-value sales. No technical jargon required.
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Guide Card Preview */}
          <div className="lg:col-span-5">
            <div className="relative group rounded-3xl bg-gradient-to-b from-[#0c1816] to-[#060c0b] border border-[#248277]/50 p-6 sm:p-8 shadow-2xl shadow-[#248277]/15 overflow-hidden">
              {/* Corner badge */}
              <div className="absolute top-5 right-5">
                <span className="px-3 py-1 rounded-full bg-[#C7F36B] text-[#111827] font-black text-xs uppercase tracking-wider shadow-lg">
                  FREE DOWNLOAD
                </span>
              </div>

              {/* Book Front Preview Mock */}
              <div className="space-y-6 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-[#248277]/20 border border-[#45bfae]/40 flex items-center justify-center text-[#45bfae]">
                  <FileText size={26} />
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#45bfae]">
                    CLOSECRAFT HANDBOOK &bull; EDITION 2026
                  </div>
                  <h3 className="text-2xl font-extrabold text-white leading-snug">
                    FROM ENQUIRY TO CUSTOMER
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    A simple guide to attracting the right leads, managing every enquiry and closing more sales.
                  </p>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#1f2937] text-center">
                  <div className="p-2 rounded-xl bg-[#111827]/70 border border-zinc-800">
                    <div className="text-lg font-black text-[#C7F36B]">22</div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Pages</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#111827]/70 border border-zinc-800">
                    <div className="text-lg font-black text-white">6</div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Chapters</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#111827]/70 border border-zinc-800">
                    <div className="text-lg font-black text-[#45bfae]">Grade 4</div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Simple English</div>
                  </div>
                </div>

                {/* Primary Download Button */}
                <div className="space-y-3 pt-2">
                  <a
                    href={guidePdfUrl}
                    download={fileName}
                    className="w-full py-4 px-6 rounded-xl bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] font-extrabold text-sm sm:text-base inline-flex items-center justify-center gap-2.5 shadow-xl shadow-[#C7F36B]/25 transition-all active:scale-98 text-center cursor-pointer group"
                  >
                    <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                    <span>DOWNLOAD FREE GUIDE (PDF)</span>
                  </a>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={13} className="text-[#45bfae]" />
                      <span>Instant direct download</span>
                    </span>
                    <span>&bull;</span>
                    <span>PDF format (845 KB)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Chapters & Content Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C7F36B]">
                WHAT YOU WILL LEARN INSIDE
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Turn Ignored Inquiries Into Paid Invoices
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Whether you run a high-growth service agency, a medical practice, an e-commerce brand, or a sales team, this field guide gives you the exact blueprint to stop losing leads.
              </p>
            </div>

            {/* Chapters list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {chapters.map((ch) => (
                <div 
                  key={ch.number} 
                  className="p-4 rounded-2xl bg-[#0a1110] border border-[#1b2b28] hover:border-[#248277]/60 transition-colors space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-extrabold text-[#C7F36B] px-1.5 py-0.5 rounded bg-[#111827] border border-[#248277]/40">
                      PART {ch.number}
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{ch.title}</h4>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{ch.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom Actions Row */}
            <div className="p-4 rounded-2xl bg-[#111827]/70 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#248277]/20 border border-[#45bfae]/40 flex items-center justify-center text-[#45bfae] shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">Free for All Businesses &amp; Teams</div>
                  <div className="text-zinc-400">Read on your phone, tablet or desktop anytime.</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={guidePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#1f2937] hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors text-center w-full sm:w-auto"
                >
                  Read Online
                </a>
                <a
                  href={guidePdfUrl}
                  download={fileName}
                  className="px-5 py-2.5 rounded-xl bg-[#45bfae] hover:bg-[#389e90] text-[#040807] text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 text-center w-full sm:w-auto shadow-md"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
