'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowUpRight,
  Download,
  Headphones,
  Sparkles,
  Wallet,
  Award,
  HelpCircle,
  X,
  CreditCard,
  Building,
  Bot,
} from 'lucide-react';
import { formatNaira } from '@/lib/dss/rules';
import { DSS_PRODUCTS } from '@/lib/dss/products';

const objectionScenarios = {
  price: {
    label: '"Too expensive / Above budget"',
    tag: 'Price Resistance',
    buyerSaid: '"Honestly ₦1,250,000 is way above what we budgeted for this quarter. Can you do ₦600k or break it into 4 instalments?"',
    closerResponse: '"I hear you. If we ignore the price for just 10 seconds—does this completely solve your customer acquisition problem, or do you still have doubts about whether it will actually work for your business?"',
    strategy: 'Isolate Budget vs Solution Fit',
    aiScore: '98%',
    badge: 'Tension Controlled',
    metric: '+₦1.25M Preserved (Zero Discounting)',
  },
  proposal: {
    label: '"Just send me a proposal / pitch deck"',
    tag: 'Delay & Avoidance',
    buyerSaid: '"Looks interesting! Just email me your PDF deck or proposal and I will run it through my team this week."',
    closerResponse: '"I can certainly do that. But usually when decision-makers ask for a PDF, it means either: 1. They are just being polite, or 2. We haven\'t covered what you actually care about. Which one is it for you?"',
    strategy: 'Direct Pattern-Interrupt',
    aiScore: '95%',
    badge: 'Commitment Secured',
    metric: 'Meeting Kept Alive & Closed',
  },
  partner: {
    label: '"I need to speak with my partner / board"',
    tag: 'Hidden Authority',
    buyerSaid: '"I love this, but I need to consult with my co-founder before making any financial commitment today."',
    closerResponse: '"Makes complete sense. When you walk in to tell them about this, what do you predict their #1 objection will be? Let\'s address that right now so you don\'t get blindsided."',
    strategy: 'Proxy Roleplay Preparation',
    aiScore: '96%',
    badge: 'Authority Isolated',
    metric: '92% Close Probability on Follow-up',
  },
};

const curriculumModules = [
  {
    number: '01',
    routeBadge: 'SETTERS ROUTE',
    title: 'Sales Foundations & Offer Understanding',
    duration: 'Week 1 • Lessons 1 & 2',
    desc: 'Understand the sales job. Learn to deconstruct any high-ticket offer into its core value transformation without hype or overselling.',
    output: 'An offer fact sheet and a calibrated 60-second value pitch.',
  },
  {
    number: '02',
    routeBadge: 'SETTERS ROUTE',
    title: 'Buyer Research, ICP & Lead Qualification',
    duration: 'Week 2 • Lessons 3 & 4',
    desc: 'Find and profile the exact decision-makers your offer can help. Learn to qualify for budget authority, urgency, and need before jumping on a call.',
    output: 'A justified buyer profile and qualification matrix for 20 researched prospects.',
  },
  {
    number: '03',
    routeBadge: 'SETTERS ROUTE',
    title: 'Outreach & Appointment Setting',
    duration: 'Week 3 • Lessons 5 & 6',
    desc: 'Master pattern-interrupt messaging across WhatsApp, LinkedIn, and email. Turn casual inbound queries into confirmed discovery meetings.',
    output: 'A scored meeting-booking roleplay recording and 5 personalized outreach scripts.',
  },
  {
    number: '04',
    routeBadge: 'CLOSERS ROUTE',
    title: 'Discovery & The Million-Dollar Call Framework',
    duration: 'Week 4 • Lessons 7 & 8',
    desc: 'Ask penetrating diagnostic questions. Uncover the cost of inaction, emotional drivers, and internal roadblocks. Discovery comes before the pitch.',
    output: 'An observed live discovery call recording scored against the DSS rubric.',
  },
  {
    number: '05',
    routeBadge: 'CLOSERS ROUTE',
    title: 'Value Engineering & High-Ticket Proposals',
    duration: 'Week 5 • Lessons 9 & 10',
    desc: 'Present your solution strictly in terms of what matters to this buyer. Frame your pricing so it feels trivial compared to their problem.',
    output: 'A bespoke high-ticket proposal matched precisely to agreed discovery notes.',
  },
  {
    number: '06',
    routeBadge: 'CLOSERS ROUTE',
    title: 'Objection Mastery & Authorized Negotiation',
    duration: 'Week 6 • Lessons 11 & 12',
    desc: 'Turn a "NO" into clarity. Handle "it’s too expensive", "need to speak to my partner", and "not right now" without flinching or discounting.',
    output: 'A complete objection response battlecard and live objection roleplay submission.',
  },
  {
    number: '07',
    routeBadge: 'CLOSERS ROUTE',
    title: 'Sales Operations & Closecraft AI CRM Integration',
    duration: 'Week 7 • Lessons 13 & 14',
    desc: 'Track next actions, manage pipelines, coordinate follow-up cadences, and review AI-generated revenue recommendations in Closecraft CRM.',
    output: 'A working Closecraft pipeline setup with active follow-up automations.',
  },
  {
    number: '08',
    routeBadge: 'LIVE ROLE PLAYS & INTERNSHIP',
    title: 'Applied Sales Lab & Observed Certification',
    duration: 'Week 8 • Lessons 15 & 16',
    desc: 'Put all the pieces together in a complete, unscripted high-ticket sales simulation observed by Emmanuel Effiong and senior assessors. Direct placement into Closecraft Network.',
    output: 'Official DSS Closer Certification and placement entry into Closecraft Network.',
  },
];

export default function DSSLandingClient() {
  const [route, setRoute] = useState<'business' | 'remote'>('remote');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [selectedRouteSlug, setSelectedRouteSlug] = useState<string>('dss-both-routes');
  const [dealValue, setDealValue] = useState(1000000); // ₦1,000,000
  const [dealsCount, setDealsCount] = useState(4);
  const [commissionRate, setCommissionRate] = useState(15); // 15%
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedObjection, setSelectedObjection] = useState<'price' | 'proposal' | 'partner'>('price');
  const [referral] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref && /^DSS-[A-F0-9]{12}$/.test(ref)) {
        try { sessionStorage.setItem('dss_ref', ref); } catch {}
        return ref;
      }
      try {
        return sessionStorage.getItem('dss_ref') || '';
      } catch {}
    }
    return '';
  });
  const [submitting, setSubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const totalCalculatedEarnings = (dealValue * dealsCount * commissionRate) / 100;

  async function handleEnquirySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    const email = form.get('email') as string;
    const phone = form.get('phone') as string;
    const goal = form.get('goal') as string;
    const selectedRoute = (form.get('route') as string) || selectedRouteSlug;
    const consent = form.get('consent') === 'on';
    const website = form.get('website') as string;

    try {
      const res = await fetch('/api/dss/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          goal,
          route: selectedRoute,
          consent,
          website,
          referral: referral || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      setEnquirySuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1117] text-[#F3F7FA] font-sans selection:bg-[#45BFAE]/30 selection:text-[#45BFAE]">
      {/* Top Notification Announcement Bar */}
      <div className="bg-gradient-to-r from-[#15352F] via-[#111C26] to-[#15352F] border-b border-[#45BFAE]/20 px-4 py-2 text-center text-xs text-[#A7B7C7] flex flex-wrap items-center justify-center gap-3">
        <span className="flex items-center gap-1.5 font-semibold text-white">
          <span className="h-2 w-2 rounded-full bg-[#45BFAE] animate-ping" />
          4 PRODUCTIZED TRACKS AVAILABLE:
        </span>
        <span>Setters (₦100k/$100) • Closers (₦100k/$100) • Live Roleplays/Internship (₦100k/$100) • Both Routes (₦150k/$150)</span>
        <span className="text-white/20">|</span>
        <Link href="/dss/affiliate" className="text-[#45BFAE] font-bold hover:underline">
          Earn 35% (₦35k - ₦52.5k) in Partner Program &rarr;
        </Link>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#0B1117]/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center px-6 md:px-12">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Navigation Breadcrumb */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#A7B7C7] hover:text-white transition-colors border border-white/10 flex items-center gap-1.5"
            >
              &larr; Back to Closecraft Home
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-7 h-7 rounded-lg bg-[#45BFAE]/10 border border-[#45BFAE]/30 flex items-center justify-center text-[#45BFAE] font-bold text-xs">
                DSS
              </div>
              <div>
                <span className="font-bold text-white text-xs block leading-tight">Digital Sales School</span>
                <span className="text-[10px] text-[#8A9CAE] block leading-none">Closecraft Flagship Academy</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#A7B7C7]">
            <a href="#routes" className="text-[#45BFAE] hover:underline font-bold">Tracks & Pricing</a>
            <a href="#why" className="hover:text-white transition-colors">Why Closing?</a>
            <a href="#curriculum" className="hover:text-white transition-colors">Curriculum</a>
            <a href="#calculator" className="hover:text-white transition-colors">Calculator</a>
            <a href="#proof" className="hover:text-white transition-colors">Payment Proof</a>
            <a href="#pipeline" className="hover:text-white transition-colors">Closecraft Pipeline</a>
            <Link href="/dss/affiliate" className="text-[#45BFAE] hover:underline font-bold flex items-center gap-1">
              Affiliates (35%)
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/dss/affiliate/dashboard"
              className="hidden sm:flex px-3.5 py-1.5 rounded-lg bg-[#111C26] hover:bg-[#172431] text-xs font-bold text-[#A7B7C7] hover:text-white border border-white/10 transition-colors"
            >
              Partner Portal
            </Link>
            <button
              onClick={() => { setSelectedRouteSlug('dss-both-routes'); setModalOpen(true); }}
              className="px-4 py-2 rounded-lg bg-[#45BFAE] hover:bg-[#5CD4C3] text-[#08231F] text-xs font-bold transition-all shadow-md shadow-[#45BFAE]/20"
            >
              Apply for Cohort &rarr;
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#15352F] border border-[#45BFAE]/30 text-[#45BFAE] text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={14} /> HIGH-TICKET CLOSING ACADEMY • POWERED BY CLOSECRAFT
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-8 font-sans">
            Great offers need<br />
            <span className="bg-gradient-to-r from-[#45BFAE] via-[#6AD6A7] to-[#F5BF65] bg-clip-text text-transparent">
              great closers.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#A7B7C7] max-w-3xl mx-auto leading-relaxed mb-10">
            You can build a brilliant product and still struggle to sell it. DSS teaches you the discovery frameworks, psychology, and objection-handling tactics that convert hesitant buyers into cleared payments.
            <span className="block mt-2 text-[#F3F7FA] font-medium">
              DSS certified graduates feed directly into Closecraft&apos;s Revenue Engine for placement with high-paying businesses.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="#routes"
              className="w-full sm:w-auto px-8 py-4 bg-[#45BFAE] hover:bg-[#5CD4C3] text-[#08231F] rounded-xl font-bold text-base transition-all shadow-xl shadow-[#45BFAE]/25 flex items-center justify-center gap-2"
            >
              Explore 4 Productized Routes &rarr;
            </a>
            <button
              onClick={() => { setSelectedRouteSlug('dss-both-routes'); setModalOpen(true); }}
              className="w-full sm:w-auto px-8 py-4 bg-[#111C26] hover:bg-[#172431] text-white rounded-xl font-bold text-base border border-[#45BFAE]/30 transition-all flex items-center justify-center gap-2"
            >
              Apply for Fit Review (From ₦100k / $100)
            </button>
            <a
              href="/DSS_Sample_Lesson.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-4 bg-transparent hover:bg-white/5 text-[#A7B7C7] hover:text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} className="text-[#45BFAE]" /> Sample Lesson (PDF)
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#8A9CAE]">
            <span className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-[#6AD6A7]" /> 8 Weeks Live Practice
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-[#6AD6A7]" /> Observed Roleplay Rubrics
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-[#6AD6A7]" /> Direct Closecraft CRM Placement
            </span>
          </div>
        </div>

        {/* Hero Visual Showcase: High-Definition Studio Closer with Floating Glass HUD Elements */}
        <div className="max-w-5xl mx-auto relative">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(69,191,174,0.15)] group">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1117] via-transparent to-transparent z-10" />

            <img
              src="/images/dss_hero_closer.jpg"
              alt="Elite High-Ticket Sales Closer in Studio"
              className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
            />

            {/* Floating Live Badge 1: Top-Left */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 bg-[#0B1117]/85 backdrop-blur-md border border-[#45BFAE]/30 rounded-2xl p-3 sm:p-4 shadow-xl animate-float-slow max-w-[240px] sm:max-w-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#45BFAE] animate-ping" />
                <span className="text-[10px] font-bold text-[#45BFAE] uppercase tracking-wider">LIVE CLOSING ROOM</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">Deal Closed: ₦1,250,000 NGN</div>
              <div className="text-[10px] text-[#A7B7C7] mt-0.5">High Intent B2B Lead • Verified Closed</div>
            </div>

            {/* Floating Live Badge 2: Bottom-Right */}
            <div className="absolute bottom-6 right-4 sm:bottom-8 sm:right-6 z-20 bg-[#0B1117]/85 backdrop-blur-md border border-[#6AD6A7]/30 rounded-2xl p-3 sm:p-4 shadow-xl animate-float-reverse max-w-[240px] sm:max-w-xs">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={14} className="text-[#6AD6A7]" />
                <span className="text-[10px] font-bold text-[#6AD6A7] uppercase tracking-wider">COMMISSION CLEARED</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">+₦187,500 NGN Payout</div>
              <div className="text-[10px] text-[#8A9CAE] mt-0.5">15% Closer Fee Paid to Account</div>
            </div>

            {/* Floating Live Badge 3: Bottom-Left Audio Waveform Preview */}
            <div className="hidden sm:flex absolute bottom-8 left-6 z-20 bg-[#15352F]/90 backdrop-blur-md border border-[#45BFAE]/40 rounded-2xl p-4 shadow-xl items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#45BFAE] text-[#08231F] flex items-center justify-center font-bold shrink-0">
                <Headphones size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Week 4 Discovery Call Simulation</div>
                <div className="flex items-center gap-1.5 h-4 mt-1.5 w-32">
                  {[35, 80, 50, 95, 60, 40, 90, 70, 85, 45, 65, 80].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h}%` }}
                      className="flex-1 bg-[#45BFAE] rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Under Visual */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-white">34.8%</div>
              <div className="text-[11px] text-[#8A9CAE] mt-0.5">Avg. Closing Rate</div>
            </div>
            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-[#6AD6A7]">₦42.5M+</div>
              <div className="text-[11px] text-[#8A9CAE] mt-0.5">Volume Closed</div>
            </div>
            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-[#45BFAE]">16 Lessons</div>
              <div className="text-[11px] text-[#8A9CAE] mt-0.5">Observed Rubrics</div>
            </div>
            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-[#F5BF65]">Direct Hires</div>
              <div className="text-[11px] text-[#8A9CAE] mt-0.5">Closecraft Pipeline</div>
            </div>
          </div>
        </div>
      </section>

      {/* STOP-SCROLL ANIMATED TICKER MARQUEE */}
      <div className="border-y border-white/5 bg-[#0D151D] py-3.5 overflow-hidden shadow-inner">
        <div className="animate-ticker text-xs font-mono text-[#A7B7C7] flex items-center gap-10">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#45BFAE] animate-ping" />
            LIVE ADMISSIONS: 11 OF 15 SEATS CLAIMED
          </span>
          <span className="text-white/20">•</span>
          <span className="text-[#6AD6A7] font-bold">₦42.5M+ DEAL VOLUME CLOSED BY GRADUATES</span>
          <span className="text-white/20">•</span>
          <span>AVERAGE COMMISSION: ₦150,000 – ₦350,000 PER CLOSED DEAL</span>
          <span className="text-white/20">•</span>
          <span className="text-[#F5BF65] font-bold">GRADUATES DIRECTLY PLACED IN CLOSECRAFT B2B FIRMS</span>
          <span className="text-white/20">•</span>
          <span>AFFILIATES EARN 35% (₦28,000) PER ENROLLED STUDENT</span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#45BFAE] animate-ping" />
            LIVE ADMISSIONS: 11 OF 15 SEATS CLAIMED
          </span>
          <span className="text-white/20">•</span>
          <span className="text-[#6AD6A7] font-bold">₦42.5M+ DEAL VOLUME CLOSED BY GRADUATES</span>
          <span className="text-white/20">•</span>
          <span>AVERAGE COMMISSION: ₦150,000 – ₦350,000 PER CLOSED DEAL</span>
          <span className="text-white/20">•</span>
          <span className="text-[#F5BF65] font-bold">GRADUATES DIRECTLY PLACED IN CLOSECRAFT B2B FIRMS</span>
        </div>
      </div>

      {/* WHY CLOSING: THE SALES GAP */}
      <section id="why" className="py-20 px-6 bg-[#0D151D] border-t border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider mb-2">THE REALITY IN NIGERIA & REMOTE SALES</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Your Leads Are Not The Problem.</h2>
            <p className="text-[#A7B7C7] mt-3 max-w-2xl mx-auto">
              A prospect asks for your price. You send it. They say, “Let me get back to you.” Then they disappear forever. Here is why high-ticket deals collapse:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6">
              <div className="text-xs font-mono text-[#F5BF65] font-bold mb-2">GAP 01</div>
              <h3 className="text-lg font-bold text-white mb-2">Pitching Before Diagnosing</h3>
              <p className="text-sm text-[#A7B7C7] leading-relaxed">
                When you quote price before the buyer verbalizes their pain, your offer becomes a generic expense instead of an urgent medical prescription.
              </p>
            </div>

            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6">
              <div className="text-xs font-mono text-[#F5BF65] font-bold mb-2">GAP 02</div>
              <h3 className="text-lg font-bold text-white mb-2">Fear of Objections</h3>
              <p className="text-sm text-[#A7B7C7] leading-relaxed">
                Untrained sellers cave in and offer immediate discounts when buyers say &ldquo;expensive&rdquo;. Closers know an objection is simply an unaddressed decision criterion.
              </p>
            </div>

            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6">
              <div className="text-xs font-mono text-[#F5BF65] font-bold mb-2">GAP 03</div>
              <h3 className="text-lg font-bold text-white mb-2">No Clear Next Action</h3>
              <p className="text-sm text-[#A7B7C7] leading-relaxed">
                Most sales calls end with vague promises instead of concrete scheduled commitments, clear onboarding criteria, or agreed payment methods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STOP-SCROLL INTERACTIVE AI BUYER ROLEPLAY SIMULATOR */}
      <section id="simulator" className="py-20 px-6 bg-gradient-to-b from-[#0D151D] via-[#0B1117] to-[#0D151D] border-t border-b border-white/5 relative overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#45BFAE]/10 blur-[130px] pointer-events-none rounded-full" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#45BFAE]/10 border border-[#45BFAE]/30 text-xs font-bold text-[#45BFAE] mb-3">
              <Bot size={14} className="text-[#45BFAE] animate-pulse" />
              <span>THE AI ADVANTAGE • ROLEPLAY UNTIL NATURAL</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Train Against Tough AI Buyers <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#45BFAE] via-[#6AD6A7] to-[#F5BF65] bg-clip-text text-transparent">
                Before You Put Real Deals On The Line.
              </span>
            </h2>
            <p className="text-[#A7B7C7] mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Untrained sales reps crumble in the first 3 minutes of objection pressure. At DSS, you roleplay against ruthless simulated AI buyers who provide instant real-time rubric feedback on confidence, objection reframing, and discovery pacing.
            </p>
          </div>

          {/* Interactive Objection Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
            <span className="text-xs font-bold text-[#8A9CAE] mr-2 uppercase tracking-wider">Test Scenario:</span>
            {(['price', 'proposal', 'partner'] as const).map((key) => {
              const item = objectionScenarios[key];
              const active = selectedObjection === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedObjection(key)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-[#45BFAE] text-[#08231F] shadow-lg shadow-[#45BFAE]/20 scale-105'
                      : 'bg-[#111C26] text-[#A7B7C7] border border-white/10 hover:border-[#45BFAE]/40 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${active ? 'bg-[#08231F]' : 'bg-[#45BFAE]'}`} />
                  <span>{item.tag}: {item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Two-Column Dribbble-Style Interactive Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Visual 3D Mockup with Floating Telemetry (7 cols) */}
            <div className="lg:col-span-7 relative">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#090D12] group">
                <img
                  src="/images/dss_roleplay_ai_mockup.jpg"
                  alt="DSS AI Buyer Roleplay Simulator"
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Floating Telemetry Badge 1: Top-Left AI Feedback */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-[#0B1117]/90 backdrop-blur-md border border-[#45BFAE]/40 rounded-2xl p-3.5 shadow-xl animate-float-slow max-w-[240px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#45BFAE] uppercase tracking-wider">LIVE AI ASSESSOR</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#6AD6A7]/20 text-[#6AD6A7]">PASSED</span>
                  </div>
                  <div className="text-xs font-bold text-white">Rubric Score: {objectionScenarios[selectedObjection].aiScore}</div>
                  <div className="text-[10px] text-[#A7B7C7] mt-0.5">{objectionScenarios[selectedObjection].badge}</div>
                </div>

                {/* Floating Telemetry Badge 2: Bottom-Right Voice Cadence */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#0B1117]/90 backdrop-blur-md border border-[#6AD6A7]/40 rounded-2xl p-3.5 shadow-xl animate-float-reverse max-w-[220px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#6AD6A7] animate-ping" />
                    <span className="text-[10px] font-bold text-[#6AD6A7] uppercase tracking-wider">TONE ANALYSIS</span>
                  </div>
                  <div className="text-xs font-bold text-white">Calm Doctor Persona</div>
                  <div className="text-[10px] text-[#8A9CAE] mt-0.5">Zero defensive panic detected</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Roleplay Script & Live Scoring (5 cols) */}
            <div className="lg:col-span-5 bg-[#111C26] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#F5BF65] uppercase tracking-wider font-mono">
                    ACTIVE SIMULATION
                  </span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white">
                    {objectionScenarios[selectedObjection].strategy}
                  </span>
                </div>

                {/* Buyer Dialogue Bubble */}
                <div className="bg-[#0B1117] border border-white/5 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#EF4444]">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                    AI B2B BUYER (RESISTANCE LEVEL: 8.5/10)
                  </div>
                  <p className="text-xs sm:text-sm text-[#F3F7FA] italic leading-relaxed">
                    {objectionScenarios[selectedObjection].buyerSaid}
                  </p>
                </div>

                {/* Trained Closer Reaction */}
                <div className="bg-[#15352F]/70 border border-[#45BFAE]/30 rounded-2xl p-4 mb-5">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#45BFAE]">
                    <Sparkles size={14} className="text-[#45BFAE]" />
                    DSS VERIFIED CLOSER FRAMEWORK
                  </div>
                  <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                    {objectionScenarios[selectedObjection].closerResponse}
                  </p>
                </div>

                {/* AI Rubric Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#8A9CAE]">CONFIDENCE SCORE</div>
                    <div className="text-lg font-black text-[#6AD6A7] mt-0.5">{objectionScenarios[selectedObjection].aiScore}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#8A9CAE]">DEAL IMPACT</div>
                    <div className="text-xs font-bold text-white mt-1">{objectionScenarios[selectedObjection].metric}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-[#A7B7C7]">16 Rubric Scenarios in W1-W8</span>
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#45BFAE] hover:text-[#5CD4C3] transition-colors"
                >
                  <span>Practice In Sandbox</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DUAL CAREER ROUTE SWITCHER */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider mb-2">TWO TAILORED LEARNING PATHS</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Choose Your High-Ticket Path</h2>
          <p className="text-[#A7B7C7] mt-3">Whether you are growing your own company or want to close for remote clients.</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#111C26] border border-white/10 p-1.5 rounded-2xl flex gap-2">
            <button
              onClick={() => setRoute('remote')}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${
                route === 'remote'
                  ? 'bg-[#45BFAE] text-[#08231F] shadow-md shadow-[#45BFAE]/20'
                  : 'text-[#A7B7C7] hover:text-white'
              }`}
            >
              Remote Sales Closer (Earn Commissions)
            </button>
            <button
              onClick={() => setRoute('business')}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${
                route === 'business'
                  ? 'bg-[#45BFAE] text-[#08231F] shadow-md shadow-[#45BFAE]/20'
                  : 'text-[#A7B7C7] hover:text-white'
              }`}
            >
              Business Builder (Sell My Own Offer)
            </button>
          </div>
        </div>

        {/* Selected Route Content */}
        <div className="bg-[#111C26] border border-[#45BFAE]/20 rounded-3xl p-8 md:p-12">
          {route === 'remote' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider">TRACK A: REMOTE CLOSER</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-4">
                  Close High-Ticket Deals for Foreign & Local Businesses.
                </h3>
                <p className="text-sm text-[#A7B7C7] leading-relaxed mb-6">
                  You don&apos;t need your own product, website, or ad budget. High-ticket businesses generate leads every day and need hungry, skilled closers to take the calls and collect payments.
                </p>
                <div className="space-y-3 text-xs text-[#F3F7FA]">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#6AD6A7]" /> Practice with standardized real-world offer simulations
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#6AD6A7]" /> Graduate with a verified portfolio of scored discovery calls
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#6AD6A7]" /> Fast-track placement into companies using Closecraft CRM
                  </div>
                </div>
              </div>

              <div className="bg-[#0B1117] border border-white/5 rounded-2xl p-6">
                <div className="text-xs font-bold text-[#8A9CAE] uppercase mb-4">TYPICAL REMOTE CLOSER ECONOMICS</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                    <span className="text-[#A7B7C7]">Average Deal Size:</span>
                    <span className="font-bold text-white">₦500,000 – ₦2,500,000</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                    <span className="text-[#A7B7C7]">Commission Per Deal (10–20%):</span>
                    <span className="font-bold text-[#45BFAE]">₦100,000 – ₦350,000</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                    <span className="text-[#A7B7C7]">Monthly Volume (3–6 closed deals):</span>
                    <span className="font-bold text-[#6AD6A7]">₦450,000 – ₦1,800,000/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-2">
                    <span className="text-[#A7B7C7]">Location Requirement:</span>
                    <span className="font-bold text-white">100% Remote (Laptop + Good Internet)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-[#F5BF65] uppercase tracking-wider">TRACK B: BUSINESS OWNER</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-4">
                  Turn Your Existing Product or Agency Leads Into Cash.
                </h3>
                <p className="text-sm text-[#A7B7C7] leading-relaxed mb-6">
                  Stop settling for low-ticket transactions. Learn to structure your consulting, software, or agency offer at ₦500k – ₦3M and close suitable clients with conviction.
                </p>
                <div className="space-y-3 text-xs text-[#F3F7FA]">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#6AD6A7]" /> Bring your live business offer directly into classroom clinics
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#6AD6A7]" /> Receive direct line-by-line pitch corrections from Emmanuel Effiong
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#6AD6A7]" /> Set up a predictable closing pipeline that stops revenue leaks
                  </div>
                </div>
              </div>

              <div className="bg-[#0B1117] border border-white/5 rounded-2xl p-6">
                <div className="text-xs font-bold text-[#8A9CAE] uppercase mb-4">FOUNDER OUTCOMES</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                    <span className="text-[#A7B7C7]">Average Price Increase:</span>
                    <span className="font-bold text-white">2.5× – 4× Deal Value</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                    <span className="text-[#A7B7C7]">Closing Rate Improvement:</span>
                    <span className="font-bold text-[#45BFAE]">From 10% to 35%+</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                    <span className="text-[#A7B7C7]">Follow-up Cadence:</span>
                    <span className="font-bold text-[#6AD6A7]">Closecraft CRM Auto-Cadence</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-2">
                    <span className="text-[#A7B7C7]">Objection Response Kit:</span>
                    <span className="font-bold text-white">Custom Battlecards for Your Niche</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* INTERACTIVE COMMISSION CALCULATOR */}
      <section id="calculator" className="py-20 px-6 bg-[#0D151D] border-t border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider mb-2">THE NUMBERS BEHIND HIGH-TICKET</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">High-Ticket Closer Earnings Calculator</h2>
            <p className="text-[#A7B7C7] mt-2">See what closing 3 to 8 deals a month produces in commission earnings.</p>
          </div>

          <div className="bg-[#111C26] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="space-y-8 mb-8">
              {/* Slider 1: Average Deal Value */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[#A7B7C7]">Average Deal Value Being Sold:</span>
                  <span className="text-lg font-bold text-white">{formatNaira(dealValue * 100)}</span>
                </div>
                <input
                  type="range"
                  min="200000"
                  max="5000000"
                  step="100000"
                  value={dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value))}
                  className="w-full h-2 bg-[#1C2D3C] rounded-lg appearance-none cursor-pointer accent-[#45BFAE]"
                />
                <div className="flex justify-between text-[11px] text-[#8A9CAE] mt-1">
                  <span>₦200k</span>
                  <span>₦1.5M</span>
                  <span>₦3M</span>
                  <span>₦5M</span>
                </div>
              </div>

              {/* Slider 2: Deals Closed Per Month */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[#A7B7C7]">Deals Closed Per Month:</span>
                  <span className="text-lg font-bold text-white">{dealsCount} deals</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={dealsCount}
                  onChange={(e) => setDealsCount(Number(e.target.value))}
                  className="w-full h-2 bg-[#1C2D3C] rounded-lg appearance-none cursor-pointer accent-[#45BFAE]"
                />
                <div className="flex justify-between text-[11px] text-[#8A9CAE] mt-1">
                  <span>1 deal</span>
                  <span>5 deals</span>
                  <span>10 deals</span>
                  <span>15 deals</span>
                </div>
              </div>

              {/* Slider 3: Commission Percentage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[#A7B7C7]">Commission Percentage:</span>
                  <span className="text-lg font-bold text-[#45BFAE]">{commissionRate}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="1"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full h-2 bg-[#1C2D3C] rounded-lg appearance-none cursor-pointer accent-[#45BFAE]"
                />
                <div className="flex justify-between text-[11px] text-[#8A9CAE] mt-1">
                  <span>10% (Entry)</span>
                  <span>15% (Standard)</span>
                  <span>20% (Senior)</span>
                  <span>30% (High-Margin)</span>
                </div>
              </div>
            </div>

            {/* Calculated Result Box */}
            <div className="bg-[#15352F]/40 border border-[#45BFAE]/30 rounded-2xl p-6 text-center">
              <div className="text-xs uppercase tracking-wider text-[#A7B7C7] font-semibold mb-1">
                Projected Monthly Closer Commission
              </div>
              <div className="text-4xl sm:text-5xl font-black text-[#45BFAE] mb-2">
                {formatNaira(totalCalculatedEarnings * 100)}
              </div>
              <p className="text-xs text-[#8A9CAE] max-w-md mx-auto">
                {dealsCount} deals closed at {formatNaira(dealValue * 100)} with a {commissionRate}% commission. Illustrative math based on standard market rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM ACCORDION */}
      <section id="curriculum" className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider mb-2">8 WEEKS • 16 LESSONS • LIVE COACHING</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">The Founding Cohort Curriculum</h2>
          <p className="text-[#A7B7C7] mt-3 max-w-2xl mx-auto">
            Every single week culminates in a concrete practical submission scored against the published DSS rubric.
          </p>
        </div>

        <div className="space-y-4">
          {curriculumModules.map((m, idx) => {
            const isOpen = openModule === idx;
            return (
              <div
                key={m.number}
                className={`border rounded-2xl transition-all overflow-hidden ${
                  isOpen ? 'bg-[#111C26] border-[#45BFAE]/30' : 'bg-[#0B1117] border-white/5 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => setOpenModule(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-xl bg-[#15352F] text-[#45BFAE] font-mono font-bold flex items-center justify-center shrink-0">
                      {m.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#15352F] text-[#45BFAE] border border-[#45BFAE]/30">
                          {m.routeBadge}
                        </span>
                        <span className="text-xs text-[#8A9CAE]">{m.duration}</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white">{m.title}</h4>
                    </div>
                  </div>
                  <span className="text-[#45BFAE] text-xl font-bold">{isOpen ? '−' : '+'}</span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-white/5 text-sm text-[#A7B7C7] space-y-4">
                    <p className="leading-relaxed">{m.desc}</p>
                    <div className="p-4 rounded-xl bg-[#0B1117] border border-white/5 flex items-start gap-3">
                      <CheckCircle size={18} className="text-[#6AD6A7] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white text-xs block mb-0.5">Your Practical Output:</strong>
                        <span className="text-xs text-[#A7B7C7]">{m.output}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/DSS_Sample_Lesson.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#45BFAE] hover:underline"
          >
            <Download size={15} /> Download Full Sample Lesson & Syllabus PDF &rarr;
          </a>
        </div>
      </section>

      {/* PAYMENT PROOF & TESTIMONIALS */}
      <section id="proof" className="py-20 px-6 bg-[#0D151D] border-t border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider mb-2">VERIFIED REAL-WORLD RESULTS</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Proof of Closing & Commission Payouts</h2>
            <p className="text-[#A7B7C7] mt-3">From students and closers trained under Emmanuel Effiong’s frameworks.</p>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#F5BF65] mb-4">
                  {'★'.repeat(5)}
                </div>
                <p className="text-sm text-[#F3F7FA] italic mb-6 leading-relaxed">
                  “After joining DSS and learning discovery calls from Emmanuel, I closed my first £3,500 consulting package for a London agency. Commission was £525 straight to my Wise account.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#45BFAE]/20 text-[#45BFAE] font-bold flex items-center justify-center">
                  RA
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Ruth Adebayo</div>
                  <div className="text-xs text-[#8A9CAE]">Remote Closer, London / Lagos</div>
                </div>
              </div>
            </div>

            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#F5BF65] mb-4">
                  {'★'.repeat(5)}
                </div>
                <p className="text-sm text-[#F3F7FA] italic mb-6 leading-relaxed">
                  “I used to struggle selling ₦10,000 ebooks on WhatsApp. DSS completely broke down high-ticket closing. Last month I closed 4 high-ticket retainer clients for a B2B SaaS company.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#6AD6A7]/20 text-[#6AD6A7] font-bold flex items-center justify-center">
                  SO
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Somtochukwu O.</div>
                  <div className="text-xs text-[#8A9CAE]">B2B Closer, Lagos</div>
                </div>
              </div>
            </div>

            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#F5BF65] mb-4">
                  {'★'.repeat(5)}
                </div>
                <p className="text-sm text-[#F3F7FA] italic mb-6 leading-relaxed">
                  “We raised our agency price from ₦250k to ₦1.2M. Our closing rate actually went UP because we stopped pitching features and started using the DSS discovery framework.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#F5BF65]/20 text-[#F5BF65] font-bold flex items-center justify-center">
                  DK
                </div>
                <div>
                  <div className="text-sm font-bold text-white">David K.</div>
                  <div className="text-xs text-[#8A9CAE]">Agency Founder, Abuja</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Proof Badges & Receipts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0B1117] border border-[#6AD6A7]/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#6AD6A7]/10 text-[#6AD6A7] flex items-center justify-center font-bold">
                <CreditCard size={22} />
              </div>
              <div>
                <div className="text-xs text-[#8A9CAE]">Paystack Verified Transfer</div>
                <div className="text-base font-bold text-[#6AD6A7]">₦480,000 Commission</div>
                <div className="text-[10px] text-[#A7B7C7]">Ref: PAY-882194 • Cleared</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1117] border border-[#45BFAE]/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#45BFAE]/10 text-[#45BFAE] flex items-center justify-center font-bold">
                <Building size={22} />
              </div>
              <div>
                <div className="text-xs text-[#8A9CAE]">Zenith Bank Client Deal</div>
                <div className="text-base font-bold text-white">₦1,250,000 Closed</div>
                <div className="text-[10px] text-[#A7B7C7]">B2B Retainer • W7 Pipeline</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1117] border border-[#7AA2FF]/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#7AA2FF]/10 text-[#7AA2FF] flex items-center justify-center font-bold">
                <Wallet size={22} />
              </div>
              <div>
                <div className="text-xs text-[#8A9CAE]">Wise International Settlement</div>
                <div className="text-base font-bold text-[#7AA2FF]">£1,400 Remote Retainer</div>
                <div className="text-[10px] text-[#A7B7C7]">UK SaaS Placement</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSECRAFT STRATEGIC ECOSYSTEM PIPELINE */}
      <section id="pipeline" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-[#111C26] via-[#0D151D] to-[#15352F]/40 border border-[#45BFAE]/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle background ambient pulse */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#45BFAE]/10 blur-[100px] pointer-events-none rounded-full" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Column: Mission & 3-Step Pipeline (7 cols) */}
            <div className="lg:col-span-7">
              <span className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider">
                ONE PLATFORM • THE TALENT ENGINE OF CLOSECRAFT
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-6">
                DSS feeds the entire Closecraft ecosystem with verified sales closers.
              </h2>
              <p className="text-sm md:text-base text-[#A7B7C7] leading-relaxed mb-8">
                Closecraft builds the AI Revenue Operating System used by growing businesses to capture and qualify inbound leads.
                <strong className="text-white block mt-2">
                  When partner companies need elite, trained closers to turn those high-intent opportunities into revenue, they recruit directly from our DSS graduate directory.
                </strong>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#0B1117] border border-white/5 rounded-2xl p-4">
                  <div className="text-[#45BFAE] font-bold text-sm mb-1">01. Train & Test</div>
                  <p className="text-xs text-[#8A9CAE]">Pass W8 observed live roleplay to earn cryptographically verifiable certification.</p>
                </div>
                <div className="bg-[#0B1117] border border-white/5 rounded-2xl p-4">
                  <div className="text-[#6AD6A7] font-bold text-sm mb-1">02. Talent Match</div>
                  <p className="text-xs text-[#8A9CAE]">Listed in Closecraft&apos;s verified closer network for SaaS and agency client hires.</p>
                </div>
                <div className="bg-[#0B1117] border border-white/5 rounded-2xl p-4">
                  <div className="text-[#F5BF65] font-bold text-sm mb-1">03. Earn & Scale</div>
                  <p className="text-xs text-[#8A9CAE]">Close deals inside Closecraft CRM and collect 10–20% commissions seamlessly.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-6 py-3.5 bg-[#45BFAE] hover:bg-[#5CD4C3] text-[#08231F] font-bold text-xs rounded-xl transition-all shadow-lg shadow-[#45BFAE]/20"
                >
                  Apply to Become a Verified Closer &rarr;
                </button>
                <Link
                  href="/login"
                  className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl border border-white/10 transition-colors"
                >
                  Access Closecraft CRM
                </Link>
              </div>
            </div>

            {/* Right Column: Holographic Closer Certification Card (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#45BFAE]/30 shadow-2xl bg-[#090D12] group">
                <img
                  src="/images/dss_closer_certification.jpg"
                  alt="Closecraft DSS Verified Closer Holographic Credential"
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                />

                {/* Glassmorphic Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#0B1117]/90 backdrop-blur-md border border-[#45BFAE]/30 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-[#F5BF65]" />
                      <span className="text-xs font-bold text-white">Closecraft Talent Roster</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#6AD6A7]/20 text-[#6AD6A7] font-bold">
                      VERIFIED PASS
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A7B7C7]">
                    Cryptographic ID #CC-8420 • Unlocks placement into active client pipelines across Nigeria, UK & US.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AFFILIATE PROGRAM SPOTLIGHT */}
      <section className="py-20 px-6 bg-[#0D151D] border-t border-b border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider mb-2">
              DSS PARTNER & AFFILIATE PROGRAM
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Know someone who needs this skill?<br />
              <span className="text-[#45BFAE]">Earn ₦28,000 per referral.</span>
            </h2>
            <p className="text-sm text-[#A7B7C7] leading-relaxed mb-6">
              Approved partners receive a dedicated referral link, 30-day tracking cookie, real-time analytics dashboard, and automated payouts.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dss/affiliate"
                className="px-6 py-3 bg-[#45BFAE] hover:bg-[#5CD4C3] text-[#08231F] font-bold text-xs rounded-xl transition-all shadow-md"
              >
                Join Affiliate Program &rarr;
              </Link>
              <Link
                href="/dss/affiliate/dashboard"
                className="px-6 py-3 bg-[#111C26] hover:bg-[#172431] text-white font-semibold text-xs rounded-xl border border-white/10 transition-colors"
              >
                Partner Dashboard
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 bg-[#111C26] border border-[#45BFAE]/20 rounded-2xl p-6 shadow-xl">
            <div className="text-xs font-bold text-white mb-4 flex items-center justify-between">
              <span>PARTNER SNAPSHOT</span>
              <span className="px-2 py-0.5 rounded bg-[#6AD6A7]/20 text-[#6AD6A7] text-[10px] font-bold">ACTIVE</span>
            </div>
            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-[#8A9CAE]">Commission:</span>
                <span className="font-bold text-white">35% Flat (₦28k)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-[#8A9CAE]">Cookie Duration:</span>
                <span className="font-bold text-white">30 Days</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-[#8A9CAE]">Clearance Hold:</span>
                <span className="font-bold text-white">14 Days</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8A9CAE]">Minimum Transfer:</span>
                <span className="font-bold text-[#6AD6A7]">₦20,000</span>
              </div>
            </div>
            <Link
              href="/dss/affiliate/dashboard?demo=1"
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-1"
            >
              Preview Partner Portal <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOUNDER SECTION */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="bg-[#111C26] border border-white/5 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#15352F] to-[#45BFAE] text-[#08231F] font-bold text-3xl flex items-center justify-center shrink-0 shadow-lg">
            EE
          </div>
          <div>
            <div className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider mb-1">FOUNDER & LEAD INSTRUCTOR</div>
            <h3 className="text-2xl font-bold text-white mb-2">Emmanuel Effiong</h3>
            <p className="text-xs text-[#8A9CAE] mb-4">Founder, Zeerocodes Automation Limited & Closecraft</p>
            <p className="text-sm text-[#A7B7C7] leading-relaxed">
              “DSS was born because I saw too many talented Nigerian founders and professionals building incredible products that nobody bought. Selling is not an aggressive trick; it is an organized, diagnostic conversation. In DSS, we give you the exact rubric and practice environment so you never have to wing a sales call again.”
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCTIZED ROUTES & TUITION OFFER SECTION */}
      <section id="routes" className="py-24 px-6 bg-[#0D151D] border-t border-b border-white/5 scroll-mt-20">
        <div id="enrol" className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#15352F] border border-[#45BFAE]/30 text-[#45BFAE] text-xs font-bold uppercase tracking-wider mb-4">
              PRODUCTIZED SALES TRACKS • CHOOSE YOUR SPECIALIZATION
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Transparent, Value-Engineered Pricing
            </h2>
            <p className="text-base text-[#A7B7C7] leading-relaxed">
              Tailored curriculum tracks designed for specific deal-making milestones. Learn appointment setting, master high-ticket closing, spar in live unscripted roleplays, or bundle both routes for complete sales mastery.
            </p>

            {/* Currency Selector Toggle */}
            <div className="inline-flex items-center gap-2 mt-8 p-1.5 rounded-full bg-[#111C26] border border-white/10 shadow-lg">
              <button
                type="button"
                onClick={() => setCurrency('NGN')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  currency === 'NGN'
                    ? 'bg-[#45BFAE] text-[#08231F] shadow-md shadow-[#45BFAE]/25'
                    : 'text-[#8A9CAE] hover:text-white'
                }`}
              >
                🇳🇬 Nigerian Naira (NGN ₦)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-[#45BFAE] text-[#08231F] shadow-md shadow-[#45BFAE]/25'
                    : 'text-[#8A9CAE] hover:text-white'
                }`}
              >
                🌐 US Dollar (USD $)
              </button>
            </div>
          </div>

          {/* 4 Productized Routes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DSS_PRODUCTS.map((prod) => {
              const priceDisplay = currency === 'NGN' ? `₦${prod.priceNGN.toLocaleString()}` : `$${prod.priceUSD}`;
              const altPriceDisplay = currency === 'NGN' ? `$${prod.priceUSD} USD` : `₦${prod.priceNGN.toLocaleString()} NGN`;

              return (
                <div
                  key={prod.id}
                  className={`relative rounded-3xl p-6 md:p-8 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 ${
                    prod.isBestValue
                      ? 'bg-gradient-to-b from-[#15352F]/90 via-[#111C26] to-[#0D151D] border-2 border-[#45BFAE] shadow-[0_0_35px_rgba(69,191,174,0.2)]'
                      : prod.isPopular
                      ? 'bg-[#111C26] border border-[#45BFAE]/40 shadow-xl'
                      : 'bg-[#111C26] border border-white/10 hover:border-white/20'
                  }`}
                >
                  {prod.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap shadow-md ${
                        prod.isBestValue
                          ? 'bg-[#45BFAE] text-[#08231F]'
                          : 'bg-[#15352F] text-[#45BFAE] border border-[#45BFAE]/40'
                      }`}>
                        {prod.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-4 mt-2">
                    <h3 className="text-xl font-bold text-white mb-1">{prod.title}</h3>
                    <p className="text-xs text-[#8A9CAE] min-h-[32px]">{prod.tagline}</p>
                  </div>

                  <div className="mb-6 pb-6 border-b border-white/5">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">{priceDisplay}</span>
                      <span className="text-xs text-[#8A9CAE]">/ {altPriceDisplay}</span>
                    </div>
                    {prod.savingsNGN && (
                      <div className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-[#6AD6A7]/10 text-[#6AD6A7] text-[11px] font-bold border border-[#6AD6A7]/20">
                        Save {currency === 'NGN' ? `₦${prod.savingsNGN.toLocaleString()}` : `$${prod.savingsUSD}`} vs separate routes
                      </div>
                    )}
                    <div className="text-[11px] text-[#A7B7C7] mt-3 flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#45BFAE]" />
                      <span>{prod.duration}</span>
                    </div>
                  </div>

                  <div className="text-xs text-[#A7B7C7] mb-6 flex-1 space-y-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A9CAE] mb-2">What’s Included:</div>
                    {prod.features.slice(0, 5).map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-[#6AD6A7] shrink-0 mt-0.5" />
                        <span className="leading-tight text-[#E0E7EC]">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <button
                      onClick={() => {
                        setSelectedRouteSlug(prod.slug);
                        setModalOpen(true);
                      }}
                      className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                        prod.isBestValue
                          ? 'bg-[#45BFAE] hover:bg-[#5CD4C3] text-[#08231F] shadow-[#45BFAE]/20'
                          : 'bg-[#15352F] hover:bg-[#1C473E] text-white border border-[#45BFAE]/40'
                      }`}
                    >
                      {prod.isBestValue ? 'Get Both Routes (Save ₦50k / $50)' : `Select ${prod.shortTitle}`} <ArrowRight size={15} />
                    </button>
                    <div className="text-center text-[10px] text-[#8A9CAE] mt-2">
                      Instant invoice • Verified Certificate
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guarantee & Financing Banner */}
          <div className="mt-12 p-6 rounded-2xl bg-[#111C26] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A7B7C7]">
            <div className="flex items-center gap-3">
              <ShieldCheck size={28} className="text-[#45BFAE] shrink-0" />
              <div>
                <strong className="text-white block mb-0.5">Corporate Sponsorships & Installments Available</strong>
                <span>Company tax invoices provided for sponsored teams. Two-part installment arrangements available upon fit review.</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedRouteSlug('dss-both-routes');
                setModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold whitespace-nowrap border border-white/10 transition-colors"
            >
              Request Custom Invoice / Fit Review
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider mb-2">FREQUENTLY ASKED QUESTIONS</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Before You Enrol</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Do I need prior sales experience to join DSS?',
              a: 'No. The first weeks establish basic sales conduct and offer deconstruction. Beginners use our defined simulation kits to practice discovery and objection handling safely.',
            },
            {
              q: 'Can my business sponsor a staff member or co-founder?',
              a: 'Yes. You can sponsor yourself or an employee. We will issue a formal corporate invoice addressed to your company.',
            },
            {
              q: 'What if I am already running a business?',
              a: 'You can bring your live product or service directly into classroom roleplays. Emmanuel Effiong will help calibrate your pricing and objection responses for your actual buyers.',
            },
            {
              q: 'Is a job or client placement guaranteed?',
              a: 'Graduates who pass the W8 observed assessment with 80%+ rubric scores are entered into Closecraft’s active client pipeline. Client selection remains performance-based.',
            },
            {
              q: 'What is the schedule and attendance requirement?',
              a: 'Orientation is Saturday 7 November at 10 AM WAT. Live sessions are Mondays and Wednesdays from 7:00 PM to 8:30 PM WAT. 80% attendance is required for graduation.',
            },
            {
              q: 'How does the affiliate program work?',
              a: 'You receive 35% commission (₦28,000) for every student who enrolls through your referral link. Payouts are made directly to your bank account after 14 days clearance.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-[#111C26] border border-white/5 rounded-xl p-6">
              <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <HelpCircle size={18} className="text-[#45BFAE]" /> {item.q}
              </h4>
              <p className="text-sm text-[#A7B7C7] pl-7 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#0B1117] text-xs text-[#8A9CAE]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-bold text-white text-sm mb-1">Digital Sales School (DSS)</div>
            <div>The Flagship Closer Talent Engine of Closecraft • Zeerocodes Automation Limited</div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Closecraft Home</Link>
            <Link href="/dss/affiliate" className="hover:text-white transition-colors">Affiliate Program</Link>
            <Link href="/dss/affiliate/dashboard" className="hover:text-white transition-colors">Partner Dashboard</Link>
            <Link href="/dss/clinic" className="hover:text-white transition-colors">Sales Clinic</Link>
            <Link href="/login" className="hover:text-white transition-colors">Student Login</Link>
          </div>
        </div>
      </footer>

      {/* ENROLMENT & FIT REVIEW MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111C26] border border-[#45BFAE]/30 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-[#8A9CAE] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {enquirySuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#6AD6A7]/20 text-[#6AD6A7] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={36} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Application Received!</h3>
                <p className="text-sm text-[#A7B7C7] mb-6 leading-relaxed">
                  Thank you. Emmanuel Effiong and the admissions desk will review your schedule fit and contact details. We will send the orientation details and official invoice to your email.
                </p>
                <a
                  href="/DSS_Sample_Lesson.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-[#45BFAE] hover:bg-[#5CD4C3] text-[#08231F] font-bold text-xs rounded-xl"
                >
                  Download Free Sample Lesson (PDF)
                </a>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#45BFAE]">
                    DSS ADMISSIONS • FIT REVIEW APPLICATION
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-1">Apply for Your Track</h3>
                  <p className="text-xs text-[#8A9CAE] mt-1">
                    Free application. We review your background and schedule fit before issuing your official invoice.
                  </p>
                </div>

                {formError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A7B7C7] mb-1">Select Training Track *</label>
                    <select
                      name="route"
                      value={selectedRouteSlug}
                      onChange={(e) => setSelectedRouteSlug(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0B1117] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#45BFAE]"
                    >
                      {DSS_PRODUCTS.map((prod) => (
                        <option key={prod.slug} value={prod.slug}>
                          {prod.title} — {currency === 'NGN' ? `₦${prod.priceNGN.toLocaleString()} / $${prod.priceUSD}` : `$${prod.priceUSD} / ₦${prod.priceNGN.toLocaleString()}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A7B7C7] mb-1">Full Name *</label>
                    <input
                      name="name"
                      required
                      placeholder="e.g. Babatunde Lawal"
                      className="w-full px-4 py-2.5 bg-[#0B1117] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#45BFAE]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A7B7C7] mb-1">Email Address *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. babatunde@gmail.com"
                      className="w-full px-4 py-2.5 bg-[#0B1117] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#45BFAE]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A7B7C7] mb-1">Phone / WhatsApp Number</label>
                    <input
                      name="phone"
                      placeholder="e.g. +234 803 123 4567"
                      className="w-full px-4 py-2.5 bg-[#0B1117] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#45BFAE]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A7B7C7] mb-1">Your Primary Goal *</label>
                    <select
                      name="goal"
                      defaultValue={route === 'business' ? 'Business Builder (Own Offer)' : 'Remote Sales Closer'}
                      className="w-full px-4 py-2.5 bg-[#0B1117] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#45BFAE]"
                    >
                      <option>Remote Sales Closer (Earn Commissions)</option>
                      <option>Appointment Setter (Book Qualified Discovery Calls)</option>
                      <option>Business Builder (Sell Own High-Ticket Offer)</option>
                      <option>Deal Sparring & Live Placement Internship</option>
                      <option>Company Sponsorship (Train Staff Member)</option>
                    </select>
                  </div>

                  {referral && (
                    <div className="p-2.5 rounded-lg bg-[#15352F]/40 border border-[#45BFAE]/30 text-[11px] text-[#45BFAE]">
                      ✓ Partner Referral Applied: <strong>{referral}</strong>
                    </div>
                  )}

                  {/* Honeypot trap */}
                  <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      name="consent"
                      id="enquiry-consent"
                      required
                      defaultChecked
                      className="mt-1 rounded bg-[#0B1117] border-white/20 text-[#45BFAE]"
                    />
                    <label htmlFor="enquiry-consent" className="text-[11px] text-[#8A9CAE] leading-relaxed">
                      I agree that DSS can review my details and send admissions guidance and cohort schedules.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#45BFAE] hover:bg-[#5CD4C3] disabled:opacity-50 text-[#08231F] font-bold text-xs rounded-xl transition-all shadow-md shadow-[#45BFAE]/20 mt-2"
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Fit Review Application'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
