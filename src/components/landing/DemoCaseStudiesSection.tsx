'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  Eye,
  X,
  CheckCircle2,
  ShieldCheck,
  Quote,
} from 'lucide-react';

export interface DemoCaseStudyItem {
  id: string;
  businessName: string;
  industry: string;
  city: string;
  isVerifiedCustomer: boolean;
  headlineMetricLabel: string;
  headlineMetricValue: string;
  problemSummary: string;
  workflowSummary: string;
  demoWalkthroughSteps: string[];
  auditPreview: string;
}

const DEMO_CASE_STUDIES: DemoCaseStudyItem[] = [
  {
    id: 'primehaven',
    businessName: 'PrimeHaven Properties',
    industry: 'Real Estate & Property',
    city: 'Lagos, Nigeria',
    isVerifiedCustomer: false,
    headlineMetricLabel: 'Demo Scenario Focus',
    headlineMetricValue: 'Site Inspection Recovery',
    problemSummary:
      'Property enquiries from Meta Ads and WhatsApp sat unresponded for 6–18 hours over weekends, causing buyers to book inspections with faster competitors.',
    workflowSummary:
      'CloseCraft HQ triages inbound WhatsApp/ad messages under an automated SLA, qualifies budget and preferred Lekki/Ikoyi location, triggers inspection booking reminders, and escalates hot buyers to human closers.',
    demoWalkthroughSteps: [
      'Enquiry arrives from Instagram Click-to-WhatsApp Ad -> Logged as NEW with BUYER_INTENT signal.',
      'AI qualifies location, budget band, and cash/mortgage timeline without inventing pricing.',
      'CloseCraft HQ assigns a human closer with an SLA countdown before an inspection slot expires.',
      '48-hour dormant inspection requests enter automated Day-2 / Day-5 follow-up workflows.',
    ],
    auditPreview: 'NEXT_BEST_ACTION: ESCALATE -> HUMAN_CLOSER · REASON: High-budget Lekki Phase 1 buyer awaiting inspection confirmation.',
  },
  {
    id: 'brightpath',
    businessName: 'BrightPath Learning Centre',
    industry: 'Education & Training Institutes',
    city: 'Lagos, Nigeria',
    isVerifiedCustomer: false,
    headlineMetricLabel: 'Demo Scenario Focus',
    headlineMetricValue: 'Student Enrolment Follow-Up',
    problemSummary:
      'Prospective students asked for cohort fees and timetables, received a brochure once, and were never followed up before registration closed.',
    workflowSummary:
      'Every student enquiry is tagged by cohort interest, guided through structured admissions follow-ups, handed to admissions advisors for fee objections, and tracked from seat reservation to verified fee receipt.',
    demoWalkthroughSteps: [
      'Prospective student asks about Weekend Data & Sales cohort pricing via landing page form.',
      'Revenue Engine assigns qualification score and sends syllabus overview automatically.',
      'Fee-installment question triggers deterministic handoff to Admissions Rep with full context.',
      'Seat reserved -> Invoice & downloadable receipt issued via Bachs.io upon verified payment.',
    ],
    auditPreview: 'NEXT_BEST_ACTION: RESPOND -> ADMISSIONS_TEAM · REASON: Cohort registration deadline within 72 hours.',
  },
  {
    id: 'apex-solutions',
    businessName: 'Apex Business Solutions',
    industry: 'B2B Operations & Advisory',
    city: 'Abuja, Nigeria',
    isVerifiedCustomer: false,
    headlineMetricLabel: 'Demo Scenario Focus',
    headlineMetricValue: 'Dormant Pipeline Reactivation',
    problemSummary:
      'Hundreds of historical proposals and WhatsApp contacts stayed buried in spreadsheets with zero visibility into who was still willing to buy.',
    workflowSummary:
      'CloseCraft Lead Recovery imports past enquiries, filters out opt-outs cleanly, segments prior objections, dispatches consent-guarded reactivation campaigns, and monitors verified closed deals.',
    demoWalkthroughSteps: [
      'Historical CSV / WhatsApp enquiries imported safely within plan workspace limits.',
      'Segmentation classifies past contacts by stalled stage, timing objection, or budget fit.',
      'Consent-guarded reactivation wave goes out only after human campaign preview & approval.',
      'Interested replies re-open deals directly inside Sales Command Centre.',
    ],
    auditPreview: 'NEXT_BEST_ACTION: WAIT_OR_REACTIVATE -> LEAD_RECOVERY · REASON: 60-day dormant B2B proposal re-engaged.',
  },
];

const DEMO_TESTIMONIALS = [
  {
    quote:
      'Seeing every unfollowed WhatsApp buyer, their inspection request, and which advisor owns the next step removed the daily guessing game across our Lagos team.',
    author: 'Chidi O.',
    role: 'Real Estate Director — Lagos (Fictional Demo Persona)',
  },
  {
    quote:
      'Instead of losing paid student leads after sending a brochure, our admissions desk knows exactly who needs a callback today before cohort registration closes.',
    author: 'Amaka E.',
    role: 'Education Centre Founder — Lagos (Fictional Demo Persona)',
  },
];

export function DemoCaseStudiesSection() {
  const [activeCaseStudy, setActiveCaseStudy] = useState<DemoCaseStudyItem | null>(null);

  return (
    <section id="results-proof" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#1e1e1e] bg-[#09090b]">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Disclosure + Beta Status */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider">
              Founding Beta Results | Updated Nov 2026
            </span>
            <span className="px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-[11px] font-mono font-bold uppercase tracking-wider">
              Workflow Previews &amp; Walkthroughs
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-white">
            How CloseCraft HQ Operates Across High-Enquiry Businesses
          </h2>

          {/* Explicit Mandatory Disclosure */}
          <div className="p-3.5 rounded-2xl bg-amber-950/35 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-start sm:items-center justify-center gap-2.5 text-left sm:text-center">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <span className="font-bold tracking-wide">
              ILLUSTRATIVE DEMO DATA. FICTIONAL BUSINESSES AND SCENARIOS. NOT VERIFIED CUSTOMER RESULTS.
            </span>
          </div>
        </div>

        {/* 3 Case Study Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_CASE_STUDIES.map((cs, idx) => {
            const Icon = idx === 0 ? Building2 : idx === 1 ? GraduationCap : Briefcase;
            return (
              <div
                key={cs.id}
                className="p-6 rounded-3xl bg-[#111113] border border-[#232327] hover:border-[#248277]/60 transition-all flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#248277]/15 border border-[#248277]/30 flex items-center justify-center text-[#C7F36B]">
                      <Icon size={20} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-extrabold uppercase tracking-wider">
                      DEMO EXAMPLE
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-heading font-bold text-white">{cs.businessName}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {cs.industry} · {cs.city}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b0b0d] border border-[#1f1f24]">
                    <p className="text-[10px] font-mono uppercase text-zinc-500">{cs.headlineMetricLabel}</p>
                    <p className="text-xs font-bold text-[#C7F36B] mt-0.5">{cs.headlineMetricValue}</p>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
                    <p>
                      <span className="font-semibold text-zinc-200">Scenario Challenge: </span>
                      {cs.problemSummary}
                    </p>
                    <p>
                      <span className="font-semibold text-zinc-200">CloseCraft HQ Workflow: </span>
                      {cs.workflowSummary}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveCaseStudy(cs)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#19191d] hover:bg-[#222228] border border-[#2d2d34] text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Eye size={14} className="text-[#C7F36B]" />
                  <span>View Demo Workflow</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* 2 Clearly Labeled Fictional Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEMO_TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="p-6 rounded-3xl bg-[#0e0e11] border border-[#202026] space-y-3 relative"
            >
              <div className="flex items-center justify-between gap-2">
                <Quote size={18} className="text-[#248277]" />
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono uppercase">
                  DEMO EXAMPLE
                </span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="pt-1 border-t border-white/5 text-xs">
                <span className="font-bold text-white">{t.author}</span>
                <span className="text-zinc-500"> · {t.role}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trial CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/signup"
            className="px-8 py-4 rounded-xl bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] font-extrabold text-sm inline-flex items-center justify-center gap-2 shadow-xl shadow-[#C7F36B]/15 transition-all"
          >
            <span>START YOUR 7-DAY FREE TRIAL</span>
            <ArrowRight size={16} />
          </Link>
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            NO CREDIT CARD REQUIRED
          </span>
        </div>
      </div>

      {/* Interactive View Demo Modal */}
      {activeCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111114] border border-[#2a2a30] rounded-3xl w-full max-w-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase">
                  DEMO EXAMPLE · ILLUSTRATIVE SCENARIO
                </span>
                <h3 className="text-xl font-heading font-extrabold text-white mt-2">
                  {activeCaseStudy.businessName} ({activeCaseStudy.industry})
                </h3>
                <p className="text-xs text-zinc-400">{activeCaseStudy.city}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCaseStudy(null)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="Close demo preview"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/35 border border-amber-500/30 text-amber-200 text-[11px] font-bold">
              ILLUSTRATIVE DEMO DATA. FICTIONAL BUSINESSES AND SCENARIOS. NOT VERIFIED CUSTOMER RESULTS.
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Revenue Engine Execution Walkthrough
              </p>
              <div className="space-y-2">
                {activeCaseStudy.demoWalkthroughSteps.map((stepText, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#18181c] border border-white/5 flex items-start gap-2.5 text-xs text-zinc-200"
                  >
                    <CheckCircle2 size={15} className="text-[#C7F36B] shrink-0 mt-0.5" />
                    <span>{stepText}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0b1312] border border-[#248277]/40 text-xs font-mono text-[#45bfae] flex items-start gap-2">
              <ShieldCheck size={15} className="shrink-0 mt-0.5" />
              <span>{activeCaseStudy.auditPreview}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
              <Link
                href="/signup"
                onClick={() => setActiveCaseStudy(null)}
                className="px-6 py-3 rounded-xl bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] font-extrabold text-xs inline-flex items-center gap-2"
              >
                <span>START YOUR 7-DAY FREE TRIAL</span>
                <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setActiveCaseStudy(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
