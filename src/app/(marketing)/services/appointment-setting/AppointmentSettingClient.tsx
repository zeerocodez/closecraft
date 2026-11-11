'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  PhoneCall,
  UserCheck,
  Target,
  BarChart3
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import FindRightSupportModal from '@/components/marketing/FindRightSupportModal';

export default function AppointmentSettingClient() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const benefits = [
    {
      icon: PhoneCall,
      title: 'Rapid Multi-Channel Outreach',
      desc: 'Our setters reach prospects across WhatsApp, voice calls, and email within minutes of enquiry arrival.',
    },
    {
      icon: UserCheck,
      title: 'Trained & Vetted via DSS',
      desc: 'Every SDR is trained and certified through the Digital Sales School with rigorous roleplay drills and qualification rubrics.',
    },
    {
      icon: Calendar,
      title: 'Direct Calendar Integration',
      desc: 'Meetings are placed directly into your Google or Outlook calendar with pre-call qualification notes and attendee reminders.',
    },
    {
      icon: ShieldCheck,
      title: 'Attendance Confirmation Protocol',
      desc: 'Automated 24-hour and 2-hour confirmation reminders ensure high meeting show-up rates, protecting your sales team time.',
    },
  ];

  const faqs = [
    {
      q: 'How does an external appointment setter represent our brand?',
      a: 'Setters use customized scripts, agreed qualification checklists, and official company communication channels. They represent your company professionally and courteously.',
    },
    {
      q: 'What criteria determines if a lead is qualified?',
      a: 'During onboarding, we define your exact Ideal Customer Profile (ICP), budget thresholds, authority requirements, and timeline parameters. Leads failing these criteria are not booked.',
    },
    {
      q: 'How do our sales closers receive the booked meetings?',
      a: 'Booked calls sync into your calendar with full contact information, lead history, and qualification answers attached to the calendar invite and CloseCraft CRM record.',
    },
    {
      q: 'What is the commitment term?',
      a: 'All appointment setting packages operate on standard 30-day agreements without long-term lock-in.',
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
              Request Setters
            </button>
          </div>
        </div>
      </header>

      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Dedicated Remote SDRs
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Fill your sales calendar with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              pre-qualified meetings.
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Stop forcing your closers to dial raw unverified leads. Our dedicated, DSS-trained appointment setters handle the dials, qualify decision makers, and book confirmed appointments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowAssessment(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg"
            >
              Get Dedicated Appointment Setters &rarr;
            </button>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              View Setting Packages (From ₦150,000/mo)
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#090e1a] border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Operational Precision</h2>
            <p className="text-3xl font-extrabold text-white">How our appointment setting team works</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 mb-4">
                    <b.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{b.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{b.desc}</p>
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
            <p className="text-2xl font-bold text-white">Appointment Setting FAQ</p>
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
            <Link href="/services/lead-generation" className="hover:text-slate-300">Lead Generation</Link>
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
