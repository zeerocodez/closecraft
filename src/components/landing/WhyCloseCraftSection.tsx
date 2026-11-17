'use client';

import React from 'react';
import { 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

export default function WhyCloseCraftSection() {
  const comparisons = [
    {
      feature: 'Enquiry Management',
      without: 'Scattered across individual WhatsApp chats, personal phone notes, and inbox tabs.',
      withCloseCraft: 'Centralised in one shared workspace with instant team alerts and full context.'
    },
    {
      feature: 'Follow-Up Accountability',
      without: 'Reps rely on memory or paper notepads. Promises of "call back tomorrow" get lost.',
      withCloseCraft: 'Strict SLA timers with Next Best Action guidance ensuring prompt callbacks.'
    },
    {
      feature: 'Lead Prioritisation',
      without: 'Reps spend equal time on cold tyre-kickers while high-intent buyers wait for hours.',
      withCloseCraft: 'Explainable qualification scoring highlights high-fit prospects immediately.'
    },
    {
      feature: 'Customer Context',
      without: 'Different team members ask the prospect the same discovery questions repeatedly.',
      withCloseCraft: 'Every conversation, note, and qualification answer is unified in one lead profile.'
    },
    {
      feature: 'Sales Consistency',
      without: 'Closing performance depends on individual rep memory and inconsistent motivation.',
      withCloseCraft: 'Structured qualification playbooks and roleplay practice guide every conversation.'
    },
    {
      feature: 'Business Owner Visibility',
      without: 'Owners discover lost opportunities only after monthly revenue falls short.',
      withCloseCraft: 'Real-time visibility into active pipeline, response velocity, and stalled deals.'
    }
  ];

  return (
    <section className="py-24 bg-[#000000] border-t border-[#1f1f1f] scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={12} />
            <span>OPERATIONAL PROCESS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Stop Depending on Memory. Build a Process That Follows Through.
          </h2>

          <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
            CloseCraft helps your team do their work more consistently. By giving every enquiry an owner and an accountable next step, your business turns more conversations into closed sales.
          </p>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="rounded-3xl bg-[#080808] border border-[#1f1f1f] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-6 bg-[#101010] border-b border-[#1f1f1f] text-xs font-bold uppercase tracking-wider">
            <div className="md:col-span-4 text-zinc-400">Area of Operation</div>
            <div className="md:col-span-4 text-red-400 flex items-center gap-1.5 pt-2 md:pt-0">
              <X size={14} />
              <span>Without a Reliable System</span>
            </div>
            <div className="md:col-span-4 text-[#45bfae] flex items-center gap-1.5 pt-2 md:pt-0">
              <Check size={14} />
              <span>With CloseCraft System</span>
            </div>
          </div>

          <div className="divide-y divide-[#1a1a1a]">
            {comparisons.map((row, idx) => (
              <div
                key={row.feature}
                className="grid grid-cols-1 md:grid-cols-12 p-5 sm:p-6 gap-3 md:gap-4 text-xs hover:bg-[#0c0c0e] transition-colors"
              >
                <div className="md:col-span-4 font-bold text-white flex items-center">
                  <span>{row.feature}</span>
                </div>
                <div className="md:col-span-4 text-zinc-400 leading-relaxed flex items-start gap-2">
                  <span className="md:hidden font-semibold text-red-400">Without:</span>
                  <span>{row.without}</span>
                </div>
                <div className="md:col-span-4 text-zinc-200 leading-relaxed flex items-start gap-2">
                  <span className="md:hidden font-semibold text-[#45bfae]">With CloseCraft:</span>
                  <span className="font-medium text-white">{row.withCloseCraft}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

