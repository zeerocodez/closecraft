'use client';

import React, { useState, FormEvent, useId } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  HelpCircle,
  X,
  Bot,
  Sparkles,
  ChevronDown,
  Clock,
  Layers,
  BookOpen,
  Award,
  Users,
  Compass,
  AlertCircle,
  Briefcase,
  Check,
} from 'lucide-react';
import { Logo, DSSLogo } from '@/components/ui/Logo';
import {
  DSS_SPRINT_FACTS,
  SPRINT_WEEKS,
  SPRINT_WORKSHOPS,
  SPRINT_RUBRIC_CRITERIA,
  SPRINT_PORTFOLIO_GROUPS,
  DSS_FLAGSHIP_SPRINT_CONFIG,
} from '@/lib/dss/sprint-curriculum';

export default function DSSLandingClient() {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'rubric'>('curriculum');
  const [openWeek, setOpenWeek] = useState<number>(1);
  const [openWorkshop, setOpenWorkshop] = useState<number | null>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<'Remote Sales Starter' | 'Business Builder'>('Remote Sales Starter');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    timezone: 'WAT (GMT+1)',
    salesExperience: 'Beginner / No previous sales experience',
    learningGoal: '',
    canProtectHours: false,
    companySponsorship: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Referral tracking
  const [referral] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref && /^DSS-[A-F0-9]{12}$/.test(ref)) {
          sessionStorage.setItem('dss_ref', ref);
          return ref;
        }
        return sessionStorage.getItem('dss_ref') || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const timezoneId = useId();
  const routeId = useId();
  const experienceId = useId();
  const goalId = useId();
  const hoursId = useId();
  const sponsorshipId = useId();

  async function handleApplicationSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem('company_website_url') as HTMLInputElement)?.value;

    try {
      const res = await fetch('/api/dss/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          timezone: formData.timezone,
          route: selectedRoute,
          salesExperience: formData.salesExperience,
          learningGoal: formData.learningGoal,
          canProtectHours: formData.canProtectHours,
          companySponsorship: formData.companySponsorship,
          referral: referral || undefined,
          website: honeypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application. Please check your information and try again.');
      }

      setSubmitSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#071126] text-[#F3F7FA] font-sans selection:bg-[#0066FF]/30 selection:text-white">
      {/* 4.A NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#071126]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10"
              title="Return to Closecraft Platform"
            >
              <Logo variant="icon" size="xs" />
              <span className="hidden sm:inline">Closecraft</span>
            </Link>

            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <DSSLogo variant="full" size="md" alt="Digital Sales School" />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[#94A3B8]">
            <a href="#curriculum" className="hover:text-white transition-colors">
              Curriculum
            </a>
            <a href="#how-you-learn" className="hover:text-white transition-colors">
              How You Learn
            </a>
            <a href="#ai-practice" className="hover:text-white transition-colors">
              AI Practice
            </a>
            <a href="#fees-and-dates" className="hover:text-white transition-colors">
              Fees & Dates
            </a>
            <a href="#faqs" className="hover:text-white transition-colors">
              FAQs
            </a>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-3.5 py-2 text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
            >
              Student Login
            </Link>

            <a
              href="#apply"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white transition-colors shadow-sm shadow-[#0066FF]/20 flex items-center gap-1.5"
            >
              <span>Apply for the Sprint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Small ecosystem link */}
        <div className="bg-[#0B1733] border-t border-white/5 py-1.5 px-4 text-center text-[11px] text-[#94A3B8]">
          Looking for sales software for your business?{' '}
          <Link href="/" className="text-[#38BDF8] font-medium hover:underline inline-flex items-center gap-1">
            Explore Closecraft →
          </Link>
        </div>
      </header>

      {/* 4.B HERO */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gradient-to-b from-[#071126] via-[#0B1A3A] to-[#071126] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066FF]/15 border border-[#0066FF]/30 text-[#60A5FA] text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FOUR-WEEK REMOTE SALES SPRINT</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.15]">
            Learn remote sales. <span className="text-[#38BDF8]">Build work you can show.</span>
          </h1>

          {/* Body */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-[#CBD5E1] mb-8 leading-relaxed">
            Develop practical appointment-setting and closing skills through live workshops and guided practice. Finish
            with corrected work samples you can explain to a prospective employer or apply in your business.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="#apply"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-bold transition-all shadow-lg shadow-[#0066FF]/25 flex items-center justify-center gap-2"
            >
              <span>Apply for the Sprint</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#curriculum"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors border border-white/15 flex items-center justify-center gap-2"
            >
              <span>View the Curriculum</span>
            </a>
          </div>

          {/* Four Key Programme Facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mb-6">
            <div className="bg-[#0D1C3D]/80 backdrop-blur border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">4 weeks</div>
              <div className="text-xs text-[#94A3B8]">Structured teaching</div>
            </div>
            <div className="bg-[#0D1C3D]/80 backdrop-blur border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#38BDF8] mb-1">12</div>
              <div className="text-xs text-[#94A3B8]">Live practical workshops</div>
            </div>
            <div className="bg-[#0D1C3D]/80 backdrop-blur border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">24</div>
              <div className="text-xs text-[#94A3B8]">Lesson topics</div>
            </div>
            <div className="bg-[#0D1C3D]/80 backdrop-blur border border-white/10 rounded-xl p-4 text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-[#60A5FA] mb-1">~21 hrs</div>
              <div className="text-xs text-[#94A3B8]">Commitment per week</div>
            </div>
          </div>

          {/* Supporting line */}
          <p className="text-xs sm:text-sm text-[#94A3B8] italic">
            No previous sales experience is required. You do need time to practise.
          </p>

          {/* Cohort Notice (Honest fee/schedule state - no fake countdowns) */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-[#CBD5E1]">
            <Calendar className="w-4 h-4 text-[#38BDF8]" />
            <span>Next Cohort: Accepting initial applications • </span>
            <span className="text-[#38BDF8] font-medium">
              {DSS_FLAGSHIP_SPRINT_CONFIG.priceNGN
                ? `₦${DSS_FLAGSHIP_SPRINT_CONFIG.priceNGN.toLocaleString()}`
                : 'Request the current cohort fee and schedule.'}
            </span>
          </div>
        </div>
      </section>

      {/* 4.C THE LEARNING GAP */}
      <section className="py-20 bg-[#071126] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0C1A38] to-[#0F234D] border border-white/10 rounded-2xl p-8 sm:p-12 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 leading-snug">
              Watching sales lessons is useful. Being able to handle the conversation takes practice.
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
              <p>
                You may know what an appointment setter or closer does, yet still feel unsure about the next message to send
                or the question to ask.
              </p>
              <p>
                That gap becomes obvious when a buyer hesitates. It also shows up when an employer asks you to explain
                your process.
              </p>
              <p>
                DSS gives you structured tasks and feedback, so you can practise the work and improve it before presenting
                it as evidence of your ability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.D THE PRACTICAL OUTCOMES */}
      <section className="py-20 bg-[#0B1733] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              Build the skills behind a useful sales conversation.
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8]">
              Observable capabilities developed through authentic commercial exercises, reviewed against verified rubrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Outcome 1 */}
            <div className="bg-[#071126] border border-white/10 rounded-2xl p-7 hover:border-[#0066FF]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/15 border border-[#0066FF]/30 text-[#60A5FA] flex items-center justify-center font-bold text-base mb-5">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Research before reaching out.</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Identify a suitable buyer and use real observations to write relevant opening messages.
              </p>
            </div>

            {/* Outcome 2 */}
            <div className="bg-[#071126] border border-white/10 rounded-2xl p-7 hover:border-[#0066FF]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/15 border border-[#0066FF]/30 text-[#60A5FA] flex items-center justify-center font-bold text-base mb-5">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Qualify and book with purpose.</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Understand whether an enquiry fits, then arrange a meeting with a clear purpose and a useful handoff.
              </p>
            </div>

            {/* Outcome 3 */}
            <div className="bg-[#071126] border border-white/10 rounded-2xl p-7 hover:border-[#0066FF]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/15 border border-[#0066FF]/30 text-[#60A5FA] flex items-center justify-center font-bold text-base mb-5">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Lead discovery and explain value.</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Investigate the buyer's situation and connect your recommendation to what they have actually told you.
              </p>
            </div>

            {/* Outcome 4 */}
            <div className="bg-[#071126] border border-white/10 rounded-2xl p-7 hover:border-[#0066FF]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/15 border border-[#0066FF]/30 text-[#60A5FA] flex items-center justify-center font-bold text-base mb-5">
                04
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Handle concerns and document the decision.</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Clarify objections, stay within approved terms and keep accurate records of the next action.
              </p>
            </div>
          </div>

          {/* Supporting copy */}
          <div className="bg-[#071126]/60 border border-white/10 rounded-xl p-5 text-center max-w-3xl mx-auto text-sm text-[#CBD5E1]">
            You will also work on a sales pipeline and prepare an onboarding handover, so your portfolio shows how the
            process connects.
          </div>
        </div>
      </section>

      {/* 4.E TWO WAYS TO APPLY THE LEARNING */}
      <section className="py-20 bg-[#071126] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Choose the goal you want your work to support.</h2>
            <p className="text-sm sm:text-base text-[#94A3B8]">
              Both application routes learn the same foundational skills through the four-week sprint. Your final project
              records reflect your objective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Route 1: Remote Sales Starter */}
            <div
              onClick={() => setSelectedRoute('Remote Sales Starter')}
              className={`cursor-pointer rounded-2xl p-8 border transition-all ${
                selectedRoute === 'Remote Sales Starter'
                  ? 'bg-[#0E2046] border-[#0066FF] shadow-lg shadow-[#0066FF]/15'
                  : 'bg-[#091633] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] bg-[#0066FF]/20 px-3 py-1 rounded-full border border-[#0066FF]/30">
                  Career Track
                </span>
                {selectedRoute === 'Remote Sales Starter' && (
                  <CheckCircle2 className="w-5 h-5 text-[#38BDF8]" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Remote Sales Starter</h3>
              <p className="text-sm text-[#CBD5E1] leading-relaxed mb-6">
                Build practical samples for suitable appointment-setting or sales roles. Prepare a tailored application and
                learn to review the compensation terms before accepting an opportunity.
              </p>
              <div className="text-xs text-[#94A3B8] pt-4 border-t border-white/10 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#38BDF8]" />
                <span>Focus: Demonstrable evidence for sales hiring teams & SDR/BDR managers</span>
              </div>
            </div>

            {/* Route 2: Business Builder */}
            <div
              onClick={() => setSelectedRoute('Business Builder')}
              className={`cursor-pointer rounded-2xl p-8 border transition-all ${
                selectedRoute === 'Business Builder'
                  ? 'bg-[#0E2046] border-[#0066FF] shadow-lg shadow-[#0066FF]/15'
                  : 'bg-[#091633] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] bg-[#0066FF]/20 px-3 py-1 rounded-full border border-[#0066FF]/30">
                  Founder & Team Track
                </span>
                {selectedRoute === 'Business Builder' && (
                  <CheckCircle2 className="w-5 h-5 text-[#38BDF8]" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Business Builder</h3>
              <p className="text-sm text-[#CBD5E1] leading-relaxed mb-6">
                Use an authorised offer from your business, or begin with the DSS fictional training offer. Develop a scoped
                plan for improving how enquiries and sales conversations are handled.
              </p>
              <div className="text-xs text-[#94A3B8] pt-4 border-t border-white/10 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#38BDF8]" />
                <span>Focus: Immediate conversion and pipeline improvement for real business offers</span>
              </div>
            </div>
          </div>

          {/* Shared line */}
          <p className="text-center text-xs sm:text-sm text-[#94A3B8] italic max-w-2xl mx-auto">
            Both routes use the same core curriculum. Your final application task reflects your goal. Choosing a route
            describes your learning focus and does not purchase an unverified placement.
          </p>
        </div>
      </section>

      {/* 4.F CURRICULUM */}
      <section id="curriculum" className="py-20 bg-[#0B1733] border-b border-white/5 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#94A3B8] mb-3">
              <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Comprehensive 24-Topic Syllabus</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              Four focused weeks. A connected sales process.
            </h2>
            <p className="text-sm sm:text-base text-[#CBD5E1]">
              All 24 original topics are taught through 12 practical workshops. You will use the same approved offer across
              the programme, then improve the connected work after feedback.
            </p>
          </div>

          {/* Tab Selector: Weeks Overview vs 8-Criterion Rubric */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 rounded-xl bg-[#071126] border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('curriculum')}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'curriculum'
                    ? 'bg-[#0066FF] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                12 Workshops by Week
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rubric')}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'rubric'
                    ? 'bg-[#0066FF] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Assessment Rubric (8 Criteria)
              </button>
            </div>
          </div>

          {activeTab === 'curriculum' ? (
            <div className="space-y-6 max-w-5xl mx-auto">
              {SPRINT_WEEKS.map((wk) => {
                const isOpen = openWeek === wk.weekNumber;
                const weekWorkshops = SPRINT_WORKSHOPS.filter((w) => w.week === wk.weekNumber);

                return (
                  <div
                    key={wk.weekNumber}
                    className="bg-[#071126] border border-white/10 rounded-2xl overflow-hidden transition-all shadow-sm"
                  >
                    {/* Week Header / Accordion trigger */}
                    <button
                      type="button"
                      onClick={() => setOpenWeek(isOpen ? 0 : wk.weekNumber)}
                      className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                      aria-expanded={isOpen}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0066FF]/20 text-[#60A5FA] border border-[#0066FF]/30">
                            Week {wk.weekNumber}
                          </span>
                          <span className="text-xs text-[#94A3B8]">
                            3 Workshops • 9 Scheduled Live Hours • 12 Guided Study Hours
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white">{wk.title}</h3>
                        <p className="text-sm text-[#94A3B8] max-w-3xl">{wk.copy}</p>
                        <div className="text-xs text-[#38BDF8] font-medium pt-1">
                          Evidence: {wk.evidence}
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-[#94A3B8] shrink-0 mt-1 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-white' : ''
                        }`}
                      />
                    </button>

                    {/* Expandable Workshops for this week */}
                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 border-t border-white/10 space-y-4 bg-[#091530]/50">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                          Workshops in Week {wk.weekNumber}:
                        </div>
                        {weekWorkshops.map((ws) => {
                          const isWsOpen = openWorkshop === ws.workshopNumber;
                          return (
                            <div
                              key={ws.workshopNumber}
                              className="rounded-xl border border-white/10 bg-[#071126] overflow-hidden"
                            >
                              <button
                                type="button"
                                onClick={() => setOpenWorkshop(isWsOpen ? null : ws.workshopNumber)}
                                className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                              >
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="font-mono text-xs font-bold text-[#38BDF8] bg-white/5 px-2 py-1 rounded">
                                    WS {ws.workshopNumber.toString().padStart(2, '0')}
                                  </span>
                                  <span className="text-xs text-[#94A3B8]">Lessons {ws.lessons}</span>
                                  <span className="text-sm font-semibold text-white">{ws.focus}</span>
                                </div>
                                <ChevronDown
                                  className={`w-4 h-4 text-[#94A3B8] shrink-0 transition-transform ${
                                    isWsOpen ? 'rotate-180 text-white' : ''
                                  }`}
                                />
                              </button>

                              {isWsOpen && (
                                <div className="p-4 pt-1 border-t border-white/5 text-xs text-[#CBD5E1] space-y-3 bg-[#0B1A3A]/40">
                                  <p className="leading-relaxed text-[#94A3B8]">{ws.overview}</p>

                                  <div>
                                    <div className="font-semibold text-white mb-1.5">Learning Outcomes:</div>
                                    <ul className="list-disc pl-4 space-y-1 text-[#CBD5E1]">
                                      {ws.publicOutcomes.map((out, idx) => (
                                        <li key={idx}>{out}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5 text-[11px]">
                                    <div>
                                      <span className="text-[#94A3B8]">Deliverable: </span>
                                      <span className="text-white font-medium">{ws.deliverableEvidence}</span>
                                    </div>
                                    <div>
                                      <span className="text-[#94A3B8]">Assessed Rubric: </span>
                                      <span className="text-[#38BDF8] font-medium">
                                        {ws.assessedCriteria.join(', ')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Rubric Criteria View */
            <div className="max-w-5xl mx-auto bg-[#071126] border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">The 8-Criterion Assessment Rubric</h3>
                <p className="text-sm text-[#94A3B8]">
                  Every live role-play and final capstone demonstration is scored against these eight criteria (0–2 points
                  each, 16 maximum). Passing threshold is 12/16 with no critical failure.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SPRINT_RUBRIC_CRITERIA.map((criterion, idx) => (
                  <div key={criterion.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white text-sm">
                        {idx + 1}. {criterion.name}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0066FF]/20 text-[#60A5FA]">
                        0 – 2 pts
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-[#94A3B8]">
                      <div>
                        <strong className="text-white">Score 2 (Proficient):</strong> {criterion.scoringGuide.two}
                      </div>
                      <div>
                        <strong className="text-white">Score 0 (Unacceptable):</strong> {criterion.scoringGuide.zero}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4.G HOW YOU LEARN */}
      <section id="how-you-learn" className="py-20 bg-[#071126] border-b border-white/5 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Learn the skill, then put it to work.</h2>
            <p className="text-sm sm:text-base text-[#94A3B8]">
              A continuous loop of live demonstration, structured deliberate practice, and objective instructor feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/20 text-[#60A5FA] flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Live demonstrations</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Watch how a task is handled and inspect the decisions behind it.
              </p>
            </div>

            <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/20 text-[#60A5FA] flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Guided practice</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Work through role-plays and practical assignments using approved offer facts.
              </p>
            </div>

            <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/20 text-[#60A5FA] flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Focused feedback</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Identify the part that needs correction, then save an improved attempt.
              </p>
            </div>

            <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/20 text-[#60A5FA] flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Connected project work</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Keep the offer and buyer information consistent across your messages and operating records.
              </p>
            </div>
          </div>

          {/* Workload panel & Access line */}
          <div className="bg-gradient-to-r from-[#0C1B3B] to-[#0E224C] border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto space-y-4">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-[#38BDF8] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-bold text-white mb-1">Time Commitment</h4>
                <p className="text-sm text-[#CBD5E1] leading-relaxed">
                  Plan approximately 21 hours each week: 9 scheduled live hours and 12 hours of guided preparation and
                  practice. Each live workshop includes breaks.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-white/10 text-xs text-[#94A3B8]">
              A computer supports the final project records. Written practice alternatives are available where recording is
              unsuitable.
            </div>
          </div>
        </div>
      </section>

      {/* 4.H AI PRACTICE */}
      <section id="ai-practice" className="py-20 bg-[#0B1733] border-b border-white/5 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#071126] border border-white/10 rounded-3xl p-8 sm:p-12 overflow-hidden relative shadow-2xl">
            <div className="max-w-3xl space-y-6">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066FF]/20 border border-[#0066FF]/40 text-[#60A5FA] text-xs font-bold uppercase tracking-wider">
                <Bot className="w-4 h-4 text-[#38BDF8]" />
                <span>SALES PRACTICE POWERED BY CLOSECRAFT</span>
              </div>

              {/* Heading */}
              <h2 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
                Practise the conversation before the next real buyer.
              </h2>

              {/* Main Copy */}
              <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                Use an AI buyer to rehearse a sales situation with approved offer facts. After the attempt, review feedback
                connected to the saved conversation.
              </p>
              <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                See which assessed behaviours met the standard and what needs correction. Use the next exercise to practise
                that correction under a different buyer condition.
              </p>

              {/* Feature Explanation */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-xs sm:text-sm text-[#94A3B8] space-y-1">
                <p>
                  <strong className="text-white">Performance Intelligence</strong> helps you revisit the evidence behind your
                  results.
                </p>
                <p>
                  Your <strong className="text-white">Coach Plan</strong> identifies a useful next exercise.
                </p>
              </div>

              {/* Supporting Line */}
              <p className="text-xs text-[#94A3B8] italic">
                AI practice feedback supports learning. Formal DSS readiness decisions include an authorised trainer's review.
              </p>

              {/* Action Buttons based on status */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPracticeModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>See a Practice Example</span>
                </button>

                <Link
                  href="/practice"
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors border border-white/15 flex items-center gap-1.5"
                >
                  <span>Open Practice Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href="#apply"
                  className="px-4 py-2.5 text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
                >
                  Ask About Practice Access &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.I PORTFOLIO */}
      <section className="py-20 bg-[#071126] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Finish with work you can explain.</h2>
            <p className="text-sm sm:text-base text-[#CBD5E1]">
              Your portfolio should show how you think and how you respond to feedback. You will build connected work
              samples, rather than a folder of copied templates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
            {SPRINT_PORTFOLIO_GROUPS.map((grp) => (
              <div key={grp.groupNumber} className="bg-[#0B1733] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-[#0066FF]/20 text-[#60A5FA] flex items-center justify-center font-bold text-xs">
                    {grp.groupNumber}
                  </span>
                  <h3 className="text-base font-bold text-white">{grp.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">{grp.description}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs sm:text-sm text-[#94A3B8] italic max-w-2xl mx-auto">
            Simulation work stays labelled as simulation work. You can explain the task and your actual contribution
            without claiming a client result you did not produce.
          </p>
        </div>
      </section>

      {/* 4.J ASSESSMENT */}
      <section className="py-20 bg-[#0B1733] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              Completion should mean you demonstrated the work.
            </h2>
            <p className="text-sm sm:text-base text-[#CBD5E1]">
              You will submit the required project evidence and complete a final demonstration. Reviewers assess observable
              work, using a published rubric.
            </p>
          </div>

          {/* Standards Panel */}
          <div className="bg-[#071126] border border-white/10 rounded-2xl p-8 mb-6 shadow-lg">
            <h3 className="text-base font-bold uppercase tracking-wider text-[#38BDF8] mb-6">
              Published Passing Standards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <Check className="w-5 h-5 text-[#38BDF8] shrink-0 mt-0.5" />
                <span className="text-sm text-white font-medium">Performance assessment: at least 12 out of 16.</span>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <Check className="w-5 h-5 text-[#38BDF8] shrink-0 mt-0.5" />
                <span className="text-sm text-white font-medium">Knowledge check: at least 8 out of 10.</span>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <Check className="w-5 h-5 text-[#38BDF8] shrink-0 mt-0.5" />
                <span className="text-sm text-white font-medium">All required evidence submitted.</span>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <Check className="w-5 h-5 text-[#38BDF8] shrink-0 mt-0.5" />
                <span className="text-sm text-white font-medium">No unresolved critical failure.</span>
              </div>
            </div>
          </div>

          {/* Supporting copy */}
          <div className="space-y-3 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            <p>
              If a task needs correction, you receive a focused repeat. Attendance and completed lessons are recorded
              separately from assessed competence.
            </p>
            <p className="text-[#CBD5E1] font-medium">
              A Certificate of Completion is subject to the programme's completion requirements.
            </p>
          </div>
        </div>
      </section>

      {/* 4.K FOUNDER */}
      <section className="py-20 bg-[#071126] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#0066FF]/20 border border-[#0066FF]/30 text-[#60A5FA] flex items-center justify-center font-bold text-xl shrink-0">
                EE
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Meet Emmanuel Effiong.</h2>
                <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                  Emmanuel Effiong is the founder of Digital Sales School and Closecraft under Zeerocodes Automation Limited.
                  He is an educator focused on helping learners connect technology with practical business work.
                </p>
                <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                  DSS uses structured exercises and evidence-based review to make progress visible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.L THE CLOSECRAFT CONNECTION */}
      <section className="py-16 bg-[#0B1733] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">A training pathway connected to real sales work.</h2>
          <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-3xl mx-auto">
            Closecraft provides sales software and separately scoped sales support for businesses. DSS develops practical
            skills through its training programme. Relevant assessed work can support an application for an available
            opportunity. Any internship or client assignment requires a separately confirmed arrangement.
          </p>
          <p className="text-xs text-[#94A3B8] italic">Training does not guarantee employment, placement or income.</p>
        </div>
      </section>

      {/* 4.M FEES AND DATES */}
      <section id="fees-and-dates" className="py-20 bg-[#071126] border-b border-white/5 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Check the commitment. Choose your next step.</h2>
            <p className="text-sm sm:text-base text-[#94A3B8]">
              Review the structured programme deliverables, calendar requirements, and transparent terms before applying.
            </p>
          </div>

          {/* Dominant Enrolment Card */}
          <div className="bg-gradient-to-b from-[#0D1C3D] to-[#071126] border-2 border-[#0066FF]/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            {/* Top Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#0066FF] text-white uppercase tracking-wider">
                Flagship Offering
              </span>
              <span className="text-xs text-[#94A3B8]">{DSS_FLAGSHIP_SPRINT_CONFIG.timeZone}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              DSS Four-Week Remote Sales Sprint
            </h3>

            {/* Facts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6 border-y border-white/10 mb-6 text-center">
              <div>
                <div className="text-lg font-bold text-white">4 weeks</div>
                <div className="text-xs text-[#94A3B8]">Teaching span</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#38BDF8]">12</div>
                <div className="text-xs text-[#94A3B8]">Practical workshops</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">Virtual</div>
                <div className="text-xs text-[#94A3B8]">Live delivery</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#60A5FA]">~21 hrs</div>
                <div className="text-xs text-[#94A3B8]">Weekly workload</div>
              </div>
            </div>

            {/* Core Value Copy */}
            <p className="text-sm text-[#CBD5E1] leading-relaxed mb-6">
              Your programme includes the student manual and practical workbook, with guided project work and assessment
              feedback.
            </p>

            {/* Fee & Calendar Status */}
            <div className="p-5 rounded-2xl bg-[#071126]/80 border border-white/10 mb-8 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#94A3B8]">Tuition Fee:</span>
                <span className="font-semibold text-white">
                  {DSS_FLAGSHIP_SPRINT_CONFIG.priceNGN
                    ? `₦${DSS_FLAGSHIP_SPRINT_CONFIG.priceNGN.toLocaleString()}`
                    : 'Request the current cohort fee and schedule.'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#94A3B8]">Intake Schedule:</span>
                <span className="font-semibold text-[#38BDF8]">{DSS_FLAGSHIP_SPRINT_CONFIG.unconfiguredDateNotice}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#94A3B8]">Live Calendar:</span>
                <span className="text-right text-[#CBD5E1]">
                  3 workshops/week (3 hours each with two 10-minute breaks)
                </span>
              </div>
            </div>

            {/* Enrolment Action */}
            <div className="space-y-4 text-center">
              <a
                href="#apply"
                className="w-full py-4 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold text-base transition-all shadow-lg shadow-[#0066FF]/30 flex items-center justify-center gap-2"
              >
                <span>Apply for the Sprint</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <p className="text-xs text-[#94A3B8]">
                Payment initiation is currently paused pending cohort schedule confirmation. Submit an application to
                receive confirmed cohort dates and invoice terms.
              </p>
            </div>
          </div>

          {/* Legacy Catalog link preserved for previous customer commitments */}
          <div className="mt-8 text-center">
            <span className="text-xs text-[#94A3B8]">Looking for historical 8-week course records or legacy tracks? </span>
            <Link href="/dss/admin" className="text-xs text-[#38BDF8] hover:underline font-medium">
              Student Records & Support &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 4.N APPLICATION */}
      <section id="apply" className="py-20 bg-[#0B1733] border-b border-white/5 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#94A3B8] mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Direct Admissions Review</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">
              Tell us what you want to use the skill for.
            </h2>
            <p className="text-sm text-[#CBD5E1]">
              Share your goal and the time you can commit. We will help you check whether this sprint fits before you proceed with enrolment.
            </p>
          </div>

          <div className="bg-[#071126] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
            {submitSuccess ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#0066FF]/20 text-[#38BDF8] flex items-center justify-center mx-auto mb-2 border border-[#0066FF]/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Application Received</h3>
                <p className="text-sm sm:text-base text-[#CBD5E1] max-w-md mx-auto leading-relaxed">
                  Your application has been received. We will contact you using the details provided with programme information and the next step.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccess(false);
                      setFormData({
                        fullName: '',
                        email: '',
                        phone: '',
                        timezone: 'WAT (GMT+1)',
                        salesExperience: 'Beginner / No previous sales experience',
                        learningGoal: '',
                        canProtectHours: false,
                        companySponsorship: '',
                      });
                    }}
                    className="text-xs text-[#38BDF8] hover:underline"
                  >
                    Submit another enquiry or update details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="space-y-6">
                {/* Honeypot field (hidden from humans) */}
                <input
                  type="text"
                  name="company_website_url"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {submitError && (
                  <div className="p-4 rounded-xl bg-red-900/30 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Full name */}
                <div>
                  <label htmlFor={nameId} className="block text-xs font-bold uppercase tracking-wider text-white mb-2">
                    Full name <span className="text-[#38BDF8]">*</span>
                  </label>
                  <input
                    id={nameId}
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Adeola Johnson"
                    className="w-full h-12 px-4 rounded-xl bg-[#0B1733] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0066FF] transition-colors"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={emailId} className="block text-xs font-bold uppercase tracking-wider text-white mb-2">
                      Email address <span className="text-[#38BDF8]">*</span>
                    </label>
                    <input
                      id={emailId}
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@domain.com"
                      className="w-full h-12 px-4 rounded-xl bg-[#0B1733] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0066FF] transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor={phoneId} className="block text-xs font-bold uppercase tracking-wider text-white mb-2">
                      Phone or WhatsApp number <span className="text-[#38BDF8]">*</span>
                    </label>
                    <input
                      id={phoneId}
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+234..."
                      className="w-full h-12 px-4 rounded-xl bg-[#0B1733] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0066FF] transition-colors"
                    />
                  </div>
                </div>

                {/* Time zone & Application route */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={timezoneId} className="block text-xs font-bold uppercase tracking-wider text-white mb-2">
                      Time zone <span className="text-[#38BDF8]">*</span>
                    </label>
                    <select
                      id={timezoneId}
                      required
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full h-12 px-3 rounded-xl bg-[#0B1733] border border-white/10 text-white text-sm focus:outline-none focus:border-[#0066FF] transition-colors"
                    >
                      <option value="WAT (GMT+1)">West Africa Time (WAT / GMT+1)</option>
                      <option value="GMT (GMT+0)">Greenwich Mean Time (GMT+0)</option>
                      <option value="CAT (GMT+2)">Central Africa Time (CAT / GMT+2)</option>
                      <option value="EAT (GMT+3)">East Africa Time (EAT / GMT+3)</option>
                      <option value="EST (GMT-5)">Eastern Standard Time (EST / GMT-5)</option>
                      <option value="Other">Other (specified during admissions review)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={routeId} className="block text-xs font-bold uppercase tracking-wider text-white mb-2">
                      Application route <span className="text-[#38BDF8]">*</span>
                    </label>
                    <select
                      id={routeId}
                      required
                      value={selectedRoute}
                      onChange={(e) =>
                        setSelectedRoute(e.target.value as 'Remote Sales Starter' | 'Business Builder')
                      }
                      className="w-full h-12 px-3 rounded-xl bg-[#0B1733] border border-white/10 text-white text-sm focus:outline-none focus:border-[#0066FF] transition-colors"
                    >
                      <option value="Remote Sales Starter">Remote Sales Starter (Career Track)</option>
                      <option value="Business Builder">Business Builder (Founder & Team Track)</option>
                    </select>
                  </div>
                </div>

                {/* Current sales experience */}
                <div>
                  <label htmlFor={experienceId} className="block text-xs font-bold uppercase tracking-wider text-white mb-2">
                    Current sales experience, including beginner <span className="text-[#38BDF8]">*</span>
                  </label>
                  <select
                    id={experienceId}
                    required
                    value={formData.salesExperience}
                    onChange={(e) => setFormData({ ...formData, salesExperience: e.target.value })}
                    className="w-full h-12 px-3 rounded-xl bg-[#0B1733] border border-white/10 text-white text-sm focus:outline-none focus:border-[#0066FF] transition-colors"
                  >
                    <option value="Beginner / No previous sales experience">
                      Beginner / No previous sales experience
                    </option>
                    <option value="Some outbound or customer-facing experience">
                      Some outbound or customer-facing experience
                    </option>
                    <option value="Practicing appointment setter or SDR">
                      Practicing appointment setter or SDR
                    </option>
                    <option value="Experienced closer / account executive">
                      Experienced closer / account executive
                    </option>
                    <option value="Business owner selling own offer">
                      Business owner selling own offer
                    </option>
                  </select>
                </div>

                {/* Main learning goal */}
                <div>
                  <label htmlFor={goalId} className="block text-xs font-bold uppercase tracking-wider text-white mb-2">
                    Your main learning goal <span className="text-[#38BDF8]">*</span>
                  </label>
                  <textarea
                    id={goalId}
                    required
                    rows={3}
                    value={formData.learningGoal}
                    onChange={(e) => setFormData({ ...formData, learningGoal: e.target.value })}
                    placeholder="Describe what you want to be able to handle better after the sprint..."
                    className="w-full p-4 rounded-xl bg-[#0B1733] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0066FF] transition-colors"
                  />
                </div>

                {/* Protect 21 hours confirmation */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <label htmlFor={hoursId} className="flex items-start gap-3 cursor-pointer">
                    <input
                      id={hoursId}
                      type="checkbox"
                      required
                      checked={formData.canProtectHours}
                      onChange={(e) => setFormData({ ...formData, canProtectHours: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-[#0066FF] bg-[#0B1733] border-white/20 focus:ring-[#0066FF]"
                    />
                    <span className="text-xs sm:text-sm text-[#CBD5E1]">
                      I confirm that I can protect approximately 21 hours each week (9 scheduled live workshop hours and
                      12 guided study hours) for the sprint duration. <span className="text-[#38BDF8]">*</span>
                    </span>
                  </label>
                </div>

                {/* Company sponsorship (optional) */}
                <div>
                  <label htmlFor={sponsorshipId} className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                    Existing company sponsorship details (only when relevant)
                  </label>
                  <input
                    id={sponsorshipId}
                    type="text"
                    value={formData.companySponsorship}
                    onChange={(e) => setFormData({ ...formData, companySponsorship: e.target.value })}
                    placeholder="Company name or corporate invoice contact (optional)"
                    className="w-full h-12 px-4 rounded-xl bg-[#0B1733] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0066FF] transition-colors"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-4 rounded-xl ${
                    submitting ? 'bg-gray-600 opacity-60 cursor-not-allowed' : 'bg-[#0066FF] hover:bg-[#0052CC]'
                  } text-white font-bold text-sm transition-all shadow-lg shadow-[#0066FF]/25 flex items-center justify-center gap-2`}
                >
                  <span>{submitting ? 'Submitting Application...' : 'Submit My Application'}</span>
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>

                {/* Microcopy */}
                <p className="text-center text-xs text-[#94A3B8]">
                  Submitting an application does not confirm admission or payment. You will receive the current programme details and the next step.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 4.O FAQs */}
      <section id="faqs" className="py-20 bg-[#071126] border-b border-white/5 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#94A3B8] mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Programme Clarity</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-sm sm:text-base text-[#94A3B8]">
              Straightforward answers about our expectations, curriculum, tools, and certification terms.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Do I need previous sales experience?',
                a: 'No. You can begin with the DSS training offer and guided exercises. You do need time to practise and improve your work.',
              },
              {
                q: 'Is this only for people looking for remote jobs?',
                a: 'No. The Business Builder route helps owners and staff apply the same process to an authorised offer.',
              },
              {
                q: 'How much time should I plan each week?',
                a: 'Approximately 21 hours: 9 scheduled live hours and 12 hours of guided preparation and practice.',
              },
              {
                q: 'Will I learn appointment setting and closing?',
                a: 'Yes. The core sprint covers the connected process, including qualification and discovery, as well as documented buying decisions.',
              },
              {
                q: 'Do I need my own product or paying client?',
                a: 'No. You can use the programme’s fictional offer and simulated records. Keep that work clearly labelled when presenting your portfolio.',
              },
              {
                q: 'Can I use only a phone?',
                a: 'A phone can support some activities, but a computer is recommended for the final records and portfolio work. Check your access requirements before enrolling.',
              },
              {
                q: 'Is AI practice included?',
                a: 'Check the published access terms for your cohort. AI tools support practice and feedback; they do not replace the final authorised assessment.',
              },
              {
                q: 'Does the Closecraft seven-day trial make DSS free?',
                a: 'No. That trial applies to Starter business software access. DSS tuition and any separately priced services have their own terms.',
              },
              {
                q: 'What does the certificate confirm?',
                a: 'It records completion against the programme’s requirements. It does not guarantee a job or income.',
              },
              {
                q: 'Are internships or placements guaranteed?',
                a: 'No. Any opportunity depends on availability and a separately confirmed selection process. Course enrolment does not purchase a placement.',
              },
              {
                q: 'What happens if I need to correct my work?',
                a: 'You will receive focused correction tasks. Completion follows review of the required evidence, rather than attendance alone.',
              },
              {
                q: 'Can my business sponsor someone?',
                a: 'Yes, where a suitable cohort is available. Request the current sponsorship and invoicing details.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#0B1733] border border-white/10 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02]"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-semibold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#94A3B8] shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-white' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-white/5 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4.P FINAL CTA */}
      <section className="py-20 bg-gradient-to-b from-[#071126] via-[#0D1C3D] to-[#071126] border-b border-white/5 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Give yourself practical work to show.
          </h2>
          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-2xl mx-auto leading-relaxed">
            Choose structured learning and make time to practise. Build a portfolio you can explain, with feedback that
            shows what to improve.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#apply"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-bold transition-all shadow-lg shadow-[#0066FF]/25 flex items-center justify-center gap-2"
            >
              <span>Apply for the Sprint</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#curriculum"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors border border-white/15"
            >
              View the Curriculum
            </a>
          </div>

          <p className="text-xs text-[#94A3B8] italic pt-4">
            Four teaching weeks. A clear commitment to practical work.
          </p>
        </div>
      </section>

      {/* 4.Q FOOTER */}
      <footer className="bg-[#050B1A] py-14 border-t border-white/10 text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <DSSLogo variant="full" size="sm" alt="Digital Sales School" />
              </div>
              <p className="text-[#CBD5E1] text-xs">Practical sales training powered by Closecraft.</p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link href="/" className="hover:text-white transition-colors">
                Closecraft Home
              </Link>
              <Link href="/login" className="hover:text-white transition-colors">
                Student Login
              </Link>
              <Link href="/dss/affiliate" className="hover:text-white transition-colors font-medium text-[#38BDF8]">
                Affiliate Programme
              </Link>
              <a href="mailto:dss@closecrafthq.com" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/terms" className="hover:text-white transition-colors">
                Learner Terms
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Notice
              </Link>
              <Link href="/refund-policy" className="hover:text-white transition-colors">
                Refund Policy
              </Link>
            </div>
            <div>
              &copy; {new Date().getFullYear()} Zeerocodes Automation Limited. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Practice Example Modal */}
      {showPracticeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-[#071126] border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowPracticeModal(false)}
              className="absolute top-5 right-5 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#38BDF8] bg-[#0066FF]/20 px-2.5 py-0.5 rounded border border-[#0066FF]/30">
                Practice Studio Walkthrough
              </span>
              <h3 className="text-xl font-bold text-white">AI Buyer Conversation & Feedback Example</h3>
            </div>

            <div className="space-y-3 bg-[#0B1733] border border-white/10 rounded-2xl p-5 text-xs">
              <div className="flex items-start gap-3">
                <span className="font-bold text-[#F87171] shrink-0">Simulated Buyer:</span>
                <span className="text-[#CBD5E1] italic">
                  "₦1,250,000 is way above what we budgeted for this quarter. Can you do ₦600k or break it into four instalments?"
                </span>
              </div>
              <div className="flex items-start gap-3 pt-3 border-t border-white/5">
                <span className="font-bold text-[#38BDF8] shrink-0">Learner Rep:</span>
                <span className="text-white">
                  "I understand budget constraints are real. If we pause on the price for a moment—does this recommendation
                  fully resolve the pipeline leakage you shared earlier, or do you still have questions about implementation fit?"
                </span>
              </div>
            </div>

            {/* Assessed Behaviours */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
              <div className="font-bold text-white flex items-center justify-between">
                <span>Rubric Evidence Analysis:</span>
                <span className="text-[#38BDF8] font-mono">Score: 2 / 2</span>
              </div>
              <p className="text-[#94A3B8]">
                <strong>Criterion - Objection Diagnosis:</strong> The learner isolated price resistance from solution fit without
                reacting defensively or offering an unapproved discount.
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] text-[#38BDF8]">
                <strong>Next Recommended Drill:</strong> Practise authority diagnosis when the buyer states they need board sign-off.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPracticeModal(false)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/15 transition-colors"
              >
                Close Preview
              </button>
              <a
                href="#apply"
                onClick={() => setShowPracticeModal(false)}
                className="px-4 py-2 rounded-lg bg-[#0066FF] text-white text-xs font-bold hover:bg-[#0052CC] transition-colors"
              >
                Apply for Practice Access
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
