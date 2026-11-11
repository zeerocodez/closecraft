'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import {
  GraduationCap,
  Sparkles,
  Bot,
  Award,
  BookOpen,
  CheckCircle2,
  Users,
  Flame,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import FindRightSupportModal from '@/components/marketing/FindRightSupportModal';

export default function DSSProductClient() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const packages = [
    {
      title: 'DSS 4-Week Career Sprint',
      badge: 'Individual Capability',
      price: '₦100,000',
      frequency: 'one-time',
      slug: 'dss-individual-sprint',
      summary: 'For ambitious individual reps & sales professionals',
      highlights: [
        'Full 4-week LMS curriculum & 12 workshops',
        'Unlimited AI Buyer Role-play Studio practice',
        'Weekly live review clinics with certified instructors',
        'Standardized 8-criterion competency scoring',
        'Verifiable Closecraft Certificate of Competence',
        'Placement eligibility for Closecraft remote talent pool',
      ],
      ctaText: 'Apply for Career Sprint &rarr;',
      ctaLink: '/dss/apply',
    },
    {
      title: 'Corporate Team Enablement',
      badge: 'Most Popular',
      price: '₦160,000',
      frequency: '/month',
      slug: 'dss-team-enablement',
      summary: 'Custom playbooks & roleplay drills for 5 company reps',
      highlights: [
        'Custom company Sales Playbook & objection battlecards',
        '5 team seats on AI Buyer Roleplay Practice Studio',
        'Weekly asynchronous roleplay grading and feedback',
        'Monthly team competency & objection gap reports',
        'Official competency certification for passing reps',
        'Ongoing curriculum updates tailored to your offer',
      ],
      ctaText: 'Deploy for Sales Team &rarr;',
      ctaLink: '/services/sales-training',
    },
    {
      title: 'Sales Leadership Architecture',
      badge: 'Advisory Retainer',
      price: '₦280,000',
      frequency: '/month',
      slug: 'dss-sales-leadership',
      summary: 'Executive advisory for Founders & Sales Directors',
      highlights: [
        'Bi-weekly strategic deal desk pipeline review sessions',
        'Sales compensation & quota model engineering',
        'Hiring rubrics & interview frameworks for remote closers',
        'Unlimited team access to DSS practice scenario library',
        'Direct async access to senior revenue directors',
      ],
      ctaText: 'Schedule Advisory Review &rarr;',
      ctaLink: 'mailto:sales@closecrafthq.com?subject=DSS%20Sales%20Leadership%20Inquiry',
    },
  ];

  const faqs = [
    {
      q: 'How does Digital Sales School operate within CloseCraft?',
      a: 'Digital Sales School (DSS) is CloseCraft’s flagship sales enablement and training product suite. It provides both individual career sprints and corporate team enablement retainers, integrated directly with CloseCraft’s CRM and AI Practice Studio.',
    },
    {
      q: 'How does the AI Buyer Role-play Studio work?',
      a: 'Our AI engine simulates authentic prospective buyers with skeptical objections, budget constraints, and industry-specific context. Reps practice live spoken or written dialogue and receive objective rubric scoring.',
    },
    {
      q: 'What is the Closecraft Verifiable Certificate of Competence?',
      a: 'Unlike certificate-of-completion programs, DSS certification requires passing structured live clinics and AI assessments with a minimum score of 12 out of 16 across our 8 objective competence criteria.',
    },
    {
      q: 'Can we purchase DSS corporate seats directly through the client marketplace?',
      a: 'Yes. Existing CloseCraft workspaces can add DSS enablement directly from their Services dashboard (/services) with instant one-click activation.',
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
            <Link href="/dss" className="text-xs font-bold text-teal-400 hover:text-teal-300">
              LMS Academy
            </Link>
            <button
              onClick={() => setShowAssessment(true)}
              className="text-xs font-bold px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors"
            >
              Request Enablement
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-700/50 text-teal-300 text-xs font-bold uppercase tracking-wider mb-6">
            <GraduationCap className="w-4 h-4" />
            Digital Sales School (DSS) Products & Services
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Measurable sales competence,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
              powered by playbooks and AI drills.
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Whether accelerating your personal sales career or standardizing objection handling across your company’s sales team, Digital Sales School delivers verifiable commercial capability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowAssessment(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg"
            >
              Find The Right Training Track &rarr;
            </button>
            <Link
              href="/practice"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              Explore AI Roleplay Studio
            </Link>
          </div>
        </div>
      </section>

      {/* Product Packages Grid */}
      <section className="py-16 bg-[#090e1a] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">Service Catalogue</h2>
            <p className="text-3xl font-extrabold text-white">Choose your DSS product or service</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {packages.map((pkg, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#0c1222] border border-slate-800 flex flex-col justify-between shadow-sm relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{pkg.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 font-bold">
                      {pkg.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{pkg.summary}</p>

                  <div className="mb-6">
                    <span className="text-3xl font-extrabold text-white">{pkg.price}</span>
                    <span className="text-xs text-slate-400"> {pkg.frequency}</span>
                  </div>

                  <ul className="space-y-2.5 mb-6 text-xs text-slate-300">
                    {pkg.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={pkg.ctaLink}
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-center text-xs font-bold transition-colors block shadow-md"
                >
                  {pkg.ctaText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#070b12]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">Frequently Asked Questions</h3>
            <p className="text-2xl font-bold text-white">DSS Product FAQ</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-white hover:text-teal-400 transition-colors"
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
            <Link href="/pricing" className="hover:text-slate-300">Pricing</Link>
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

