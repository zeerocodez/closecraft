'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Zap,
  MessageSquare,
  Bot,
  Filter,
  BarChart2,
  Workflow
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import FindRightSupportModal from '@/components/marketing/FindRightSupportModal';

export default function LeadManagementClient() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const pillars = [
    {
      icon: Clock,
      title: 'Under 15-Minute Response Window',
      desc: 'The moment an enquiry enters from Facebook, Google, or your website, automated qualification messages fire via WhatsApp and email before prospect attention fades.',
    },
    {
      icon: Filter,
      title: 'Duplicate Prevention & Triage',
      desc: 'Cleanse duplicate entries automatically, match historical buyer records, and assign qualified leads directly to the right sales rep or SDR.',
    },
    {
      icon: MessageSquare,
      title: 'Multi-Channel Nurture Sequences',
      desc: 'Multi-touch sequences across email, WhatsApp, and SMS that warm up unresponsive prospects without spamming or degrading brand reputation.',
    },
    {
      icon: Workflow,
      title: 'Deterministic Next Best Action',
      desc: 'Clear operational cues for your team: who to call next, what objection was raised, and when SLA limits are breached.',
    },
  ];

  const faqs = [
    {
      q: 'Why is an under-15-minute response time critical?',
      a: 'Research across millions of inbound B2B and high-ticket leads proves that contacting an enquiry within 15 minutes increases qualification rates by over 300% compared to waiting even one hour.',
    },
    {
      q: 'Does this replace our existing sales reps?',
      a: 'No. Automated lead management handles the repetitive, immediate triage and organization so your sales professionals spend 100% of their time talking to qualified decision makers.',
    },
    {
      q: 'Can this integrate with our Meta Ads and Google Search campaigns?',
      a: 'Yes! Closecraft connects directly with Meta Lead Ads Webhooks, Google Ads, Zapier, and website webhooks with real-time deduplication and attribution.',
    },
    {
      q: 'How are client records protected?',
      a: 'Every customer-owned record belongs to an isolated organization with encrypted data isolation, immutable timestamps, and role-based access control.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
      {/* Navigation */}
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
              Request Assessment
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Lead Management & Automation
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Stop losing 60% of your enquiries to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              sluggish follow-up.
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Connect every marketing channel into one automated triage pipeline. Qualify prospects in under 15 minutes, eliminate manual spreadsheet chaos, and keep your pipeline flowing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowAssessment(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg"
            >
              Run 2-Minute Lead Assessment &rarr;
            </button>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              Explore CRM & Follow-Up Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 bg-[#090e1a] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Engine Architecture</h2>
            <p className="text-3xl font-extrabold text-white">How Closecraft automates your lead pipeline</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 mb-4">
                    <p.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#070b12]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Common Questions</h3>
            <p className="text-2xl font-bold text-white">Lead Management FAQ</p>
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

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} CloseCraft Technologies Limited. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-300">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link href="/services/lead-generation" className="hover:text-slate-300">Lead Generation</Link>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <FindRightSupportModal
        isOpen={showAssessment}
        onClose={() => setShowAssessment(false)}
        initialTrack="SOFTWARE_FOLLOWUP"
      />
    </div>
  );
}
