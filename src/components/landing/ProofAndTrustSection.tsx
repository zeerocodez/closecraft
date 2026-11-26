'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Eye, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Database, 
  Workflow 
} from 'lucide-react';

export default function ProofAndTrustSection() {
  return (
    <section className="py-24 bg-[#080808] border-t border-[#1f1f1f] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
            <Eye size={12} />
            <span>OPERATIONAL VISIBILITY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Better Follow-Up Starts With Better Visibility.
          </h2>

          <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
            When business owners and sales leaders can see every active opportunity, response lag, and assigned next action, follow-up stops being an afterthought and becomes an accountable business process.
          </p>
        </div>

        {/* Real Product Screenshot Showcase */}
        <div className="rounded-3xl overflow-hidden border border-[#1f1f1f] bg-[#101010] shadow-2xl space-y-0 group">
          <div className="relative aspect-[16/9] w-full bg-[#000000] overflow-hidden">
            <Image
              src="/images/closecraft_hero_dashboard.jpg"
              alt="CloseCraft Sales Command Centre Dashboard"
              fill
              className="object-cover object-top"
              priority
            />
          </div>

          {/* Bottom Operational Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 sm:p-8 bg-[#0c0c0e] border-t border-[#1f1f1f]">
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#45bfae]" />
                <span>Enquiry Attribution</span>
              </h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Leads from Meta ads and forms appear instantly with campaign attribution and full source tracking.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Response Deadline (SLA) Timers &amp; Countdowns</span>
              </h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Strict response countdowns alert reps and owners before high-intent prospects go cold.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Explainable Next Steps</span>
              </h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Clear deterministic recommendations on what to say, what objection to address, and when to follow up.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Revenue Leakage Shield</span>
              </h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Proactive alerts for overdue follow-ups, stalled pipeline deals, and closing bottlenecks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

