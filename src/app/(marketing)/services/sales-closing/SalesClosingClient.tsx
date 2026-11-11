'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  Award,
  FileCheck2,
  PhoneCall,
  Briefcase
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import FindRightSupportModal from '@/components/marketing/FindRightSupportModal';

export default function SalesClosingClient() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const closersFeatures = [
    {
      icon: Award,
      title: 'Top-Decile DSS Certified Closers',
      desc: 'Our closers have passed rigorous objective rubrics, simulated client objection roleplays, and behavioral vetting before deployment.',
    },
    {
      icon: Briefcase,
      title: 'Solution & Consultative Discovery',
      desc: 'Calls are structured around pain diagnostic, commercial urgency, and business value rather than high-pressure manipulative tactics.',
    },
    {
      icon: FileCheck2,
      title: 'Strict Deal Pipeline Governance',
      desc: 'Every call summary, proposal revision, and outcome is logged directly into your CloseCraft deal pipeline for executive auditability.',
    },
    {
      icon: TrendingUp,
      title: 'Contract Acceleration & Collection',
      desc: 'Closers guide qualified prospects through terms negotiation, contract signing, and initial invoice payment execution.',
    },
  ];

  const faqs = [
    {
      q: 'What price point is appropriate for remote sales closers?',
      a: 'Remote closers are ideal for offers priced at ₦150,000 ($100) and above, including B2B services, corporate training, high-ticket tech subscriptions, real estate, and professional consulting.',
    },
    {
      q: 'Do you promise or guarantee closed revenue figures?',
      a: 'No. As a matter of strict company policy, CloseCraft provides vetted high-calibre sales talent, battle-tested playbooks, and revenue infrastructure. Deal closing velocity depends on genuine market fit and joint operational alignment.',
    },
    {
      q: 'Can we listen to recordings of the sales calls?',
      a: 'Yes. Full call logs, recordings, and lead notes are accessible within your secure client workspace for continuous quality assurance.',
    },
    {
      q: 'How does the commercial model work?',
      a: 'CloseCraft managed closing pairs a predictable monthly operational retainer with optional performance commissions agreed upon onboarding.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-[#0a0f1d] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo variant="full" size="md" alt="Closecraft" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-xs font-semibold text-slate-300 hover:text-white">
              Pricing
            </Link>
            <button
              onClick={() => setShowAssessment(true)}
              className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Request Closers
            </button>
          </div>
        </div>
      </header>

      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            High-Ticket Remote Closers
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Deploy elite sales closers trained to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              convert high-value deals.
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Stop letting qualified sales opportunities stall in the pipeline. Our remote sales closers conduct deep discovery consultations, handle complex objections, and accelerate contract closing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowAssessment(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg"
            >
              Deploy Certified Closers &rarr;
            </button>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              Explore Closing Packages
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#090e1a] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Talent Standards</h2>
            <p className="text-3xl font-extrabold text-white">Why DSS-trained closers stand out</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {closersFeatures.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 mb-4">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#070b12]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Common Questions</h3>
            <p className="text-2xl font-bold text-white">Sales Closing FAQ</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-white hover:text-emerald-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} CloseCraft Technologies Limited. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-300">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link href="/services/appointment-setting" className="hover:text-slate-300">Appointment Setting</Link>
          </div>
        </div>
      </footer>

      <FindRightSupportModal
        isOpen={showAssessment}
        onClose={() => setShowAssessment(false)}
        initialTrack="MANAGED_SALES"
      />
    </div>
  );
}
