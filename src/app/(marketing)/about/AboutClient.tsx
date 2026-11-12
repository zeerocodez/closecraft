'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Target, 
  ShieldCheck, 
  TrendingUp, 
  Users2, 
  Award, 
  CheckCircle2, 
  Sparkles,
  Building2,
  Clock,
  HeartHandshake
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function AboutClient() {
  const values = [
    {
      icon: Target,
      title: 'No Fabricated Metrics',
      desc: 'We never report vanity impressions or artificial lead counts. We measure actual contacted prospects, confirmed appointments, and banked revenue.',
    },
    {
      icon: Clock,
      title: 'Enforced Follow-Up Accountability',
      desc: 'Deals die in the gap between lead capture and first contact. Our platform and operators ensure every single enquiry has a designated owner, a tight SLA, and a defined next step.',
    },
    {
      icon: ShieldCheck,
      title: 'Human Judgement + AI Scale',
      desc: 'AI handles speed, classification, and alert triggers. Trained, emotionally intelligent humans handle high-stakes objection handling, consultative negotiation, and closing.',
    },
    {
      icon: Award,
      title: 'Talent Excellence Via DSS',
      desc: 'We do not source unverified gig workers. Every setter and closer deployed on client pipelines has passed the rigorous curriculum and live roleplays of our Digital Sales School.',
    },
  ];

  const milestones = [
    {
      year: 'The Problem',
      headline: 'The Hidden Cost of Deal Leakage',
      text: 'Businesses invest millions in advertising and lead generation, only to see 60–70% of potential buyers go uncontacted or abandoned after a single unanswered WhatsApp message.',
    },
    {
      year: 'The Engine',
      headline: 'Building CloseCraft 2.0',
      text: 'We engineered an all-in-one revenue operating system: unifying advertising, instant CRM intake, priority scoring, automated follow-up cadences, and dedicated remote sales reps.',
    },
    {
      year: 'The School',
      headline: 'Digital Sales School (DSS)',
      text: 'To ensure client pipelines are worked with world-class discipline, we established the Digital Sales School to train and certify top-tier remote appointment setters and closers.',
    },
    {
      year: 'Today',
      headline: 'A Modern Revenue Operating System',
      text: 'CloseCraft powers thousands of customer conversations every month for B2B, consulting, real estate, and high-ticket service companies across Africa and international markets.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070A0E] text-white selection:bg-[#248277] selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#070A0E]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center" aria-label="Closecraft Home">
            <Logo variant="full" size="md" alt="Closecraft" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/platform"
              className="text-xs sm:text-sm text-[#A7B7C7] hover:text-white transition-colors"
            >
              Platform
            </Link>
            <Link 
              href="/pricing"
              className="text-xs sm:text-sm text-[#A7B7C7] hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="/dss"
              className="text-xs sm:text-sm text-[#45bfae] hover:underline transition-colors font-semibold"
            >
              DSS Academy
            </Link>
            <Link
              href="/early-access"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#248277] hover:bg-[#1f6f65] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(36,130,119,0.12),transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#248277]/10 border border-[#248277]/30 text-[#45bfae] text-xs font-semibold uppercase tracking-wider">
            <Building2 size={13} />
            <span>About CloseCraft</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            We Help Service Businesses Convert More Enquiries Into Paying Clients
          </h1>

          <p className="text-base sm:text-lg text-[#A7B7C7] max-w-2xl mx-auto leading-relaxed">
            CloseCraft is developed by Zeerocodes Automation Limited. We combine enterprise follow-up software, certified remote sales talent, and structured acquisition systems to eliminate deal leakage.
          </p>
        </div>
      </section>

      {/* Philosophy & Mission */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#0B1117]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold text-[#45bfae] uppercase tracking-wider">Our Thesis</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              The Problem Isn’t Your Market. <br />
              It’s What Happens After The Click.
            </h2>
            <p className="text-xs sm:text-sm text-[#8A9CAE] leading-relaxed">
              Most businesses obsess over getting more traffic and leads. Yet, when interested buyers reach out via WhatsApp, phone, or forms, they wait hours for a reply. Follow-ups stop after a single rejection. Valuable deals get lost in spreadsheet oblivion.
            </p>
            <p className="text-xs sm:text-sm text-[#8A9CAE] leading-relaxed">
              We built CloseCraft to bridge this exact revenue chasm: giving founders and sales leaders a command centre where speed-to-lead is guaranteed, follow-up cadence is non-negotiable, and every lead has an unambiguous owner.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#111C26] border border-white/10 space-y-6 shadow-xl">
            <h3 className="text-base font-bold text-white">The CloseCraft Operating Model</h3>
            <ul className="space-y-4 text-xs text-[#A7B7C7]">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                <span><strong>Unified Ingestion:</strong> Connect Meta Ads, website forms, and WhatsApp into one clear queue.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                <span><strong>Automated Cadences:</strong> Intelligent multi-touch follow-ups that wake up dormant prospects.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                <span><strong>Certified Sales Reps:</strong> Deploy dedicated appointment setters and high-ticket closers on demand.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                <span><strong>Audited Pipeline:</strong> Track deal value, reason-for-stall, and rep SLAs in real time.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Our Core Operating Principles</h2>
            <p className="text-xs sm:text-sm text-[#8A9CAE]">
              The non-negotiables that guide how we build software, train sales talent, and serve clients.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-[#0B1117] border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#248277]/10 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white">{v.title}</h3>
                  <p className="text-xs text-[#8A9CAE] leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company Journey */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#0B1117]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How CloseCraft Evolved</h2>
            <p className="text-xs sm:text-sm text-[#8A9CAE]">
              From an internal sales agency tool to an integrated revenue operating system.
            </p>
          </div>

          <div className="space-y-6">
            {milestones.map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#111C26] border border-white/10 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                <span className="px-3 py-1 rounded-lg bg-[#248277]/10 text-[#45bfae] font-mono text-xs font-bold shrink-0">
                  {item.year}
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-white">{item.headline}</h3>
                  <p className="text-xs text-[#8A9CAE] leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Info & Legal */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Operating Entity</h2>
          <p className="text-xs sm:text-sm text-[#8A9CAE] max-w-xl mx-auto leading-relaxed">
            CloseCraft is engineered and operated by <strong>Zeerocodes Automation Limited</strong>, a technology company incorporated in the Federal Republic of Nigeria.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#A7B7C7]">
            <span>Lagos, Nigeria</span>
            <span>•</span>
            <a href="mailto:info@closecrafthq.com" className="text-[#45bfae] hover:underline">info@closecrafthq.com</a>
            <span>•</span>
            <a href="tel:+2348000000000" className="hover:text-white">+234 800 000 0000</a>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-gradient-to-b from-[#0B1117] to-[#070A0E]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Join Ambitious Teams Accelerating Revenue</h2>
          <p className="text-xs sm:text-sm text-[#A7B7C7]">
            Start a 7-day Starter trial or speak with our solutions team about managed sales services.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Start 7-Day Free Trial</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs sm:text-sm transition-colors"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
