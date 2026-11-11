'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Sparkles,
  Bot,
  Flame,
  Award,
  Video
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import FindRightSupportModal from '@/components/marketing/FindRightSupportModal';

export default function SalesTrainingClient() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const modules = [
    {
      icon: BookOpen,
      title: 'Customized Company Playbooks',
      desc: 'We map your target personas, core objections, pricing tiers, and competitive differentiators into operational sales playbooks.',
    },
    {
      icon: Bot,
      title: 'AI Buyer Roleplay Simulator',
      desc: 'Your reps practice discovery conversations and objection handling with adaptive AI buyer personas before calling real prospects.',
    },
    {
      icon: Flame,
      title: 'High-Stakes Live Roleplays',
      desc: 'Weekly live roleplay sessions evaluated by senior sales directors using the standardized 8-criterion DSS rubric.',
    },
    {
      icon: Award,
      title: 'DSS Competency Certification',
      desc: 'Reps must prove measurable competence across qualifying, value presentation, and objection handling to earn certification.',
    },
  ];

  const faqs = [
    {
      q: 'Who is this training suitable for?',
      a: 'This training is engineered for inside sales reps, appointment setters, account executives, and business founders who conduct sales consultations and need higher close rates.',
    },
    {
      q: 'How does the AI roleplay practice work?',
      a: 'Our AI buyer simulator replicates realistic prospect pushback, skeptical questions, and budget objections. Reps receive immediate feedback on clarity, listening, and value positioning.',
    },
    {
      q: 'Can the curriculum be tailored to our specific industry?',
      a: 'Yes. The playbooks and simulated drills are customized around your exact product offering, contract sizes, and sales cycles.',
    },
    {
      q: 'Is there a limit on how many team seats can participate?',
      a: 'Standard enablement packages cover up to 5 sales representatives, with modular add-ons available for larger enterprise sales divisions.',
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
            <Link href="/dss" className="text-xs font-semibold text-teal-400 hover:text-teal-300">
              DSS Academy
            </Link>
            <button
              onClick={() => setShowAssessment(true)}
              className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Request Training Plan
            </button>
          </div>
        </div>
      </header>

      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Digital Sales School Corporate Enablement
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Turn your sales team into an elite,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              high-converting revenue unit.
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Stop relying on guesswork and unmonitored calls. Equip your reps with structured sales playbooks, adaptive AI buyer roleplays, and rigorous DSS coaching.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowAssessment(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg"
            >
              Request Team Training Assessment &rarr;
            </button>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              View Training Retainers (From ₦160,000/mo)
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#090e1a] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Enablement Architecture</h2>
            <p className="text-3xl font-extrabold text-white">How we build sales competence</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((m, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 mb-4">
                    <m.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{m.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#070b12]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Frequently Asked Questions</h3>
            <p className="text-2xl font-bold text-white">Sales Training FAQ</p>
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
            <Link href="/dss" className="hover:text-teal-400">Digital Sales School</Link>
          </div>
        </div>
      </footer>

      <FindRightSupportModal
        isOpen={showAssessment}
        onClose={() => setShowAssessment(false)}
        initialTrack="TEAM_TRAINING"
      />
    </div>
  );
}
