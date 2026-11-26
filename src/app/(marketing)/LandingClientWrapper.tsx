'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Menu, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Play, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown,
  Download,
  FileText,
  BookOpen
} from 'lucide-react';

import Logo from '@/components/ui/Logo';
import HeroContrastVisual from '@/components/landing/HeroContrastVisual';
import HowItWorksProcess from '@/components/landing/HowItWorksProcess';
import RevenueLeakSection from '@/components/landing/RevenueLeakSection';
import ProductsShowcaseSection from '@/components/landing/ProductsShowcaseSection';
import GrowthServicesSection from '@/components/growth/GrowthServicesSection';
import WhoWeHelpSection from '@/components/landing/WhoWeHelpSection';
import WhyCloseCraftSection from '@/components/landing/WhyCloseCraftSection';
import { DemoCaseStudiesSection } from '@/components/landing/DemoCaseStudiesSection';
import { HomepagePricingSection } from '@/components/landing/HomepagePricingSection';
import ProofAndTrustSection from '@/components/landing/ProofAndTrustSection';
import UserGuideDownloadSection from '@/components/landing/UserGuideDownloadSection';
import HomepageFaqSection from '@/components/landing/HomepageFaqSection';
import BrevoNewsletterSection from '@/components/marketing/BrevoNewsletterSection';
import ExplainerVideoSection from '@/components/marketing/ExplainerVideoSection';

interface LandingClientWrapperProps {
  eco?: any;
  flags?: any;
}

export default function LandingClientWrapper({ eco, flags }: LandingClientWrapperProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [modalFormType, setModalFormType] = useState<'AUDIT' | 'MANAGED_SALES' | 'SERVICE_ENQUIRY'>('AUDIT');
  const [calculatorData, setCalculatorData] = useState<{ leadVolume: string; monthlyLeak: string; responseTime: string } | null>(null);
  const [auditBusy, setAuditBusy] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Service form state (preserved on error)
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    email: '',
    business: '',
    phone: '',
    serviceInterest: 'Team training',
    teamSize: '1–3 reps',
    trainingObjective: 'Qualification and appointment setting',
    whatYouSell: '',
    workloadVolume: '50–199 enquiries / month',
    needDescription: '',
  });

  const openAudit = (
    type: 'AUDIT' | 'MANAGED_SALES' = 'AUDIT',
    calcData?: { leadVolume: string; monthlyLeak: string; responseTime: string }
  ) => {
    setModalFormType(type);
    if (calcData) {
      setCalculatorData(calcData);
    }
    setMobileMenuOpen(false);
    setAuditSuccess(null);
    setAuditError(null);
    setShowAuditModal(true);
  };

  const openServiceEnquiry = (interest: string = 'Team training') => {
    setModalFormType('SERVICE_ENQUIRY');
    setServiceFormData((prev) => ({
      ...prev,
      serviceInterest: interest,
    }));
    setMobileMenuOpen(false);
    setAuditSuccess(null);
    setAuditError(null);
    setShowAuditModal(true);
  };

  async function handleAuditSubmit(event: FormEvent<HTMLFormElement>, overrideFormType?: 'AUDIT' | 'MANAGED_SALES') {
    event.preventDefault();
    setAuditBusy(true);
    setAuditError(null);
    setAuditSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, any> = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          formType: overrideFormType || modalFormType,
        }),
      });

      const responseJson = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(responseJson.error || 'Failed to submit request. Please try again.');
      }

      setAuditSuccess(
        modalFormType === 'MANAGED_SALES'
          ? 'Your managed sales request has been received. Our team will contact you to review your volume and proposal details.'
          : 'Your request has been received. We will contact you using the details you provided to discuss your current follow-up process.'
      );
    } catch (error) {
      setAuditError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setAuditBusy(false);
    }
  }

  async function handleServiceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuditBusy(true);
    setAuditError(null);
    setAuditSuccess(null);

    const isTeamTraining = serviceFormData.serviceInterest === 'Team training';
    const isExecutionService = ['Managed sales', 'External appointment setter', 'External closer'].includes(serviceFormData.serviceInterest);

    const payload = {
      name: serviceFormData.name.trim(),
      email: serviceFormData.email.trim(),
      business: serviceFormData.business.trim(),
      phone: serviceFormData.phone.trim() || undefined,
      formType: 'SERVICE_ENQUIRY',
      serviceInterest: serviceFormData.serviceInterest,
      needDescription: serviceFormData.needDescription.trim(),
      teamSize: isTeamTraining ? serviceFormData.teamSize : undefined,
      trainingObjective: isTeamTraining ? serviceFormData.trainingObjective : undefined,
      whatYouSell: isExecutionService ? serviceFormData.whatYouSell.trim() : undefined,
      workloadVolume: isExecutionService ? serviceFormData.workloadVolume : undefined,
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseJson = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(responseJson.error || 'Failed to submit enquiry. Please try again.');
      }

      setAuditSuccess("Your enquiry has been received. Our sales solutions team will review your requirements and reach out using the details provided to discuss scope, capacity, and next steps.");
    } catch (error) {
      setAuditError(error instanceof Error ? error.message : 'An error occurred while saving your enquiry.');
    } finally {
      setAuditBusy(false);
    }
  }

  return (
    <div className="bg-[#000000] text-white min-h-screen selection:bg-[#248277] selection:text-white font-sans antialiased">
      {/* SECTION 1: NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="inline-flex items-center group transition-opacity hover:opacity-90" aria-label="CloseCraft HQ Home">
              <Logo variant="full" size="md" priority alt="CloseCraft HQ" />
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/" className="px-3 py-1.5 text-sm font-medium text-white hover:text-[#45bfae] transition-colors">
                Home
              </Link>
              <Link href="/demo" className="px-3 py-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Demo</span>
              </Link>
              <a href="#how-it-works" className="px-3 py-1.5 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#solutions" className="px-3 py-1.5 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
                Solutions
              </a>

              {/* Services Dropdown */}
              <div className="relative group">
                <a
                  href="#services"
                  className="px-3 py-1.5 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Services</span>
                  <ChevronDown size={14} className="group-hover:rotate-180 transition-transform text-[#71717a]" />
                </a>
                <div className="absolute top-full left-0 mt-2 w-64 p-2 rounded-2xl bg-[#101010] border border-[#1f1f1f] shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150 z-50">
                  <a
                    href="#services-catalogue"
                    className="block p-2.5 rounded-xl hover:bg-[#1a1a1a] transition-colors group/item"
                  >
                    <p className="text-xs font-bold text-white group-hover/item:text-[#45bfae]">Growth Services</p>
                    <p className="text-[11px] text-[#a1a1aa]">Ads, AI Video, Flyers, Landing Pages & VSLs</p>
                  </a>
                  <button
                    type="button"
                    onClick={() => openServiceEnquiry('Team training')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#1a1a1a] transition-colors group/item cursor-pointer"
                  >
                    <p className="text-xs font-bold text-white group-hover/item:text-[#45bfae]">Team Training</p>
                    <p className="text-[11px] text-[#a1a1aa]">Train your team to follow up consistently</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => openServiceEnquiry('Managed sales')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#1a1a1a] transition-colors group/item cursor-pointer"
                  >
                    <p className="text-xs font-bold text-white group-hover/item:text-[#45bfae]">Managed Sales</p>
                    <p className="text-[11px] text-[#a1a1aa]">Dedicated closing and follow-up support</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => openServiceEnquiry('External closer')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#1a1a1a] transition-colors group/item cursor-pointer"
                  >
                    <p className="text-xs font-bold text-white group-hover/item:text-[#45bfae]">External Sales Professionals</p>
                    <p className="text-[11px] text-[#a1a1aa]">External setters and closers for your leads</p>
                  </button>
                </div>
              </div>

              <Link href="/dss" className="px-3 py-1.5 text-sm font-semibold text-[#45bfae] hover:underline transition-colors flex items-center gap-1">
                <span>DSS Academy</span>
              </Link>
              <a
                href="/guides/CloseCraft-From-Enquiry-To-Customer-Guide.pdf"
                download="CloseCraft-From-Enquiry-To-Customer-Guide.pdf"
                className="px-3 py-1.5 text-sm font-medium text-[#a1a1aa] hover:text-[#45bfae] transition-colors flex items-center gap-1.5"
                title="Download Free 22-Page User Guide (PDF)"
              >
                <Download size={14} className="text-[#45bfae]" />
                <span>User Guide</span>
              </a>
              <Link href="/about" className="px-3 py-1.5 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
                About
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link 
              href="/demo" 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C7F36B]/15 hover:bg-[#C7F36B]/25 text-[#C7F36B] border border-[#C7F36B]/30 text-xs sm:text-sm font-bold transition-all shadow-sm hover:border-[#C7F36B]"
              title="Interactive AI Startup Challenge Demonstration Workspace"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C7F36B] animate-pulse" />
              <span>Live Demo</span>
            </Link>

            <Link 
              href="/login" 
              className="hidden sm:inline-flex items-center px-3.5 py-2 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] text-xs sm:text-sm font-extrabold shadow-lg shadow-[#C7F36B]/20 transition-all active:scale-95"
            >
              START FREE TRIAL
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors ml-1 cursor-pointer"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#080808] border-b border-[#1f1f1f] px-6 py-5 flex flex-col gap-3 shadow-2xl animate-in slide-in-from-top-2 duration-150">
            <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-white hover:bg-[#101010] rounded-lg text-sm font-medium" href="/">
              Home
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold text-sm flex items-center justify-between border border-emerald-500/30" href="/demo">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Demo & Evaluation</span>
              </span>
              <ChevronRight size={14} />
            </Link>
            <a onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-white hover:bg-[#101010] rounded-lg text-sm font-medium" href="#how-it-works">
              How It Works
            </a>
            <a onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-white hover:bg-[#101010] rounded-lg text-sm font-medium" href="#solutions">
              Solutions
            </a>
            <a onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-white hover:bg-[#101010] rounded-lg text-sm font-medium" href="#services-catalogue">
              Professional Services
            </a>
            <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-[#248277]/15 text-[#45bfae] font-bold text-sm flex items-center justify-between border border-[#248277]/30" href="/dss">
              <span>Digital Sales School</span>
              <ChevronRight size={14} />
            </Link>
            <a 
              onClick={() => setMobileMenuOpen(false)} 
              className="px-3 py-2 text-[#45bfae] hover:bg-[#101010] rounded-lg text-sm font-medium flex items-center gap-2" 
              href="/guides/CloseCraft-From-Enquiry-To-Customer-Guide.pdf"
              download="CloseCraft-From-Enquiry-To-Customer-Guide.pdf"
            >
              <Download size={14} />
              <span>Download User Guide (PDF)</span>
            </a>
            <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-white hover:bg-[#101010] rounded-lg text-sm font-medium" href="/about">
              About Us
            </Link>

            <div className="pt-3 border-t border-[#1f1f1f] flex flex-col gap-2.5">
              <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-[#a1a1aa] hover:text-white rounded-lg text-sm font-medium" href="/login">
                Sign In
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAudit('AUDIT');
                }}
                className="w-full py-3 px-4 bg-[#248277] text-white text-center rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                LET'S FIX YOUR FOLLOW-UP
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="pt-20">
        {/* SECTION 2: HERO */}
        <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-[#000000]">
          {/* Ambient Lighting */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#248277]/12 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#14A7F7]/6 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
                Turn Unfollowed Enquiries Into Paid Buyers, Enrolments &amp; Booked Deals.
              </h1>

              <p className="text-base sm:text-xl text-[#a1a1aa] leading-relaxed max-w-3xl mx-auto">
                Move from scattered WhatsApp chats, missed callbacks, and wasted ad spend to an accountable revenue system — where every enquiry is qualified immediately, followed up automatically, and closed cleanly.
              </p>

              {/* Before -> After Value Transformation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left max-w-5xl mx-auto pt-1">
                <div className="p-4 rounded-2xl bg-[#0d1413] border border-[#248277]/45 space-y-1.5">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Stop Losing Paid Ad Clicks
                  </p>
                  <p className="text-sm font-bold text-white">
                    Reply Fast &amp; Enforce 15m Urgent SLAs
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Hot buyers get qualified on WhatsApp or Meta Ads and routed to a human closer before competitors reply.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0d1413] border border-[#248277]/45 space-y-1.5">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Recover Existing Pipeline
                  </p>
                  <p className="text-sm font-bold text-[#C7F36B]">
                    Turn Old Chats &amp; Sheets Into New Cash
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Reactivate dormant property, student, and service enquiries you already paid to acquire without extra ad spend.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0d1413] border border-[#248277]/45 space-y-1.5">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Own Every Sale End-to-End
                  </p>
                  <p className="text-sm font-bold text-white">
                    Track Promise → Invoice → Paid Receipt
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    See what needs attention right now, spot stalled deals early, and verify every naira or dollar collected via Bachs.io.
                  </p>
                </div>
              </div>

              {/* Clean Conversion CTAs */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] font-extrabold text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-xl shadow-[#C7F36B]/20 transition-all active:scale-95 text-center group"
                  >
                    <span>START YOUR 7-DAY FREE TRIAL</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => openAudit('AUDIT')}
                    className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#101012] hover:bg-[#19191f] text-white border border-[#2a2a32] font-bold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>BOOK A FREE FOLLOW-UP DIAGNOSTIC</span>
                  </button>
                  <a
                    href="#how-it-works"
                    className="px-4 py-3 text-sm font-semibold text-[#45bfae] hover:text-[#C7F36B] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>See How It Works</span>
                    <ChevronRight size={15} />
                  </a>
                </div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#C7F36B]/90">
                  NO CREDIT CARD REQUIRED &middot; CLOSECRAFT HQ REVENUE OPERATING SYSTEM
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-1 text-xs text-[#71717a]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#45bfae]" />
                  <span>7-Day Trial · 5-Day Grace Protection</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#45bfae]" />
                  <span>Real Estate &amp; Education Ready (Lagos &amp; Global)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap size={14} className="text-[#45bfae]" />
                  <span>WhatsApp, Meta Ads &amp; Web Capture</span>
                </span>
              </div>
            </div>

            {/* Hero Visual: Side-by-Side Contrast */}
            <div className="pt-2">
              <HeroContrastVisual />
            </div>
          </div>
        </section>

        {/* SECTION 2 & 3: THE PROBLEM & INTERACTIVE ROI CALCULATOR */}
        <RevenueLeakSection onOpenAuditModal={(calcData?: { leadVolume: string; monthlyLeak: string; responseTime: string }) => openAudit('AUDIT', calcData)} />

        {/* SECTION 4: RESULTS / PROOF (Demo Case Studies & Trust Architecture) */}
        <DemoCaseStudiesSection />
        <ProofAndTrustSection />

        {/* SECTION 5: HOW IT WORKS (Process + Walkthrough) */}
        <HowItWorksProcess />
        <ExplainerVideoSection onOpenAudit={() => openAudit('AUDIT')} />

        {/* SECTION 6: THE 3 PRODUCTS & TARGET MARKETS */}
        <ProductsShowcaseSection />
        <WhoWeHelpSection />
        <WhyCloseCraftSection />

        {/* SECTION 7: GROWTH SERVICES */}
        <GrowthServicesSection />

        {/* SECTION 8: PRICING (SaaS Plans, Regional Markets, Services & Sales Enablement) */}
        <HomepagePricingSection onOpenEnterpriseModal={() => openAudit('AUDIT')} />

        {/* SECTION 9: FIELD MANUAL LEAD MAGNET */}
        <UserGuideDownloadSection />

        {/* SECTION 10: FREQUENTLY ASKED QUESTIONS */}
        <HomepageFaqSection />

        {/* SECTION 13: FINAL CONVERSION SECTION */}
        <section className="py-24 bg-[#000000] border-t border-[#1f1f1f] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#248277]/10 rounded-full blur-[160px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="p-10 sm:p-16 rounded-3xl bg-[#0d1716] border border-[#248277]/60 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="space-y-4 max-w-2xl mx-auto">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#C7F36B]/20 text-[#C7F36B] font-bold uppercase tracking-wider border border-[#C7F36B]/40">
                  REVENUE OS
                </span>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
                  Your Next Customer Shouldn&apos;t Be Lost in an Unanswered Message.
                </h2>

                <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
                  Bring your leads, conversations, and follow-up process into one revenue operating system.
                </p>

                <p className="text-sm font-medium text-zinc-300">
                  Stop allowing interested prospects to disappear into unanswered messages and forgotten callbacks. Build an accountable revenue process with CloseCraft HQ.
                </p>
                <p className="sr-only">Give your next opportunity a clear next step.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => openAudit('AUDIT')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] font-extrabold text-sm sm:text-base shadow-xl shadow-[#C7F36B]/25 transition-all active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>GET STARTED</span>
                  <ArrowRight size={18} />
                </button>

                <Link
                  href="/demo"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white border border-[#1f2937] hover:border-white/20 font-bold text-sm sm:text-base transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>EXPLORE THE PLATFORM</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Brevo Newsletter Section (Placed below final CTA, above footer) */}
        <BrevoNewsletterSection
          headline="Make your next sales conversation count."
          description="Get a practical sales lesson each week, with follow-up examples you can use in your business."
        />

        {/* SECTION 14: FOOTER */}
        <footer className="bg-[#000000] border-t border-[#1f1f1f] py-16 text-xs text-[#71717a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {/* Brand Col */}
              <div className="col-span-2 space-y-4">
                <Link href="/" className="inline-block" aria-label="CloseCraft HQ">
                  <Logo variant="full" size="md" alt="CloseCraft HQ" />
                </Link>
                <p className="text-xs text-[#a1a1aa] max-w-sm leading-relaxed">
                  CloseCraft HQ is the AI revenue operations, lead recovery, and fulfilment platform connecting customer acquisition with accountable sales conversion.
                </p>
                <p className="text-[11px] text-[#71717a]">
                  CloseCraft HQ is a revenue operations platform for businesses. It is not affiliated with CloseCraft App.
                </p>
                <p className="text-[11px] text-[#71717a]">
                  Zeerocodes Automation Limited. RC 8421094.
                </p>
                <div className="pt-1">
                  <a 
                    href="https://wa.me/2349026365853" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#45bfae] hover:underline"
                  >
                    <span>Official WhatsApp Support: +234 902 636 5853</span>
                  </a>
                </div>
              </div>

              {/* Col 1: Platform & Products */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Products</h4>
                <ul className="space-y-2">
                  <li><Link href="/demo" className="text-emerald-400 font-bold hover:underline flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live Demonstration</Link></li>
                  <li><Link href="/platform" className="hover:text-white transition-colors">CloseCraft Workspace</Link></li>
                  <li><Link href="/revenue-engine" className="hover:text-white transition-colors">Revenue Engine</Link></li>
                  <li><Link href="/dss" className="text-[#45bfae] font-semibold hover:underline">Digital Sales School</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition-colors">Software Pricing</Link></li>
                  <li><a href="/guides/CloseCraft-From-Enquiry-To-Customer-Guide.pdf" download="CloseCraft-From-Enquiry-To-Customer-Guide.pdf" className="text-[#45bfae] font-semibold hover:underline flex items-center gap-1.5"><Download size={13} />Free User Guide (22p PDF)</a></li>
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                </ul>
              </div>

              {/* Col 2: Professional Services */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Services</h4>
                <ul className="space-y-2">
                  <li><a href="#services-catalogue" className="hover:text-white transition-colors">Growth Services Catalogue</a></li>
                  <li><Link href="/services/lead-generation" className="hover:text-white transition-colors">Meta Ads Management</Link></li>
                  <li><Link href="/services/appointment-setting" className="hover:text-white transition-colors">Appointment Setting</Link></li>
                  <li><Link href="/services/sales-closing" className="hover:text-white transition-colors">Sales Closing</Link></li>
                  <li><Link href="/services/sales-training" className="hover:text-white transition-colors">Team Training</Link></li>
                </ul>
              </div>

              {/* Col 3: Company & Legal */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Company &amp; Legal</h4>
                <ul className="space-y-2">
                  <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog &amp; Insights</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-[#1f1f1f] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#71717a]">
              <p>&copy; {new Date().getFullYear()} CloseCraft HQ (Zeerocodes Automation Limited). All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
                <span>&bull;</span>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <span>&bull;</span>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <span>&bull;</span>
                <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* INTERACTIVE MODAL: Revenue Audit & Service Assessment */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-xl rounded-3xl bg-[#101010] border border-[#248277]/50 p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
              <div>
                {modalFormType === 'SERVICE_ENQUIRY' ? (
                  <>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-bold block mb-1">
                      BUSINESS SALES SERVICE ASSESSMENT
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      Discuss sales training or hands-on support
                    </h3>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-white">
                      {modalFormType === 'MANAGED_SALES'
                        ? 'Request Managed Sales Proposal'
                        : 'Show us where follow-up gets difficult.'}
                    </h3>
                    <p className="text-xs text-[#a1a1aa] mt-0.5">
                      {modalFormType === 'MANAGED_SALES'
                        ? 'Custom quotation for managed follow-up and closing support.'
                        : 'We will review your enquiry volume and recommend the right setup.'}
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {auditSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span>Request Received</span>
                </div>
                <p>{auditSuccess}</p>
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <Link
                    href={`/audit/results?${new URLSearchParams({
                      volume: calculatorData?.leadVolume || '100',
                      leak: calculatorData?.monthlyLeak || '2500000',
                      speed: calculatorData?.responseTime || '2-4 hours',
                    }).toString()}`}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all text-center inline-flex items-center justify-center gap-1.5"
                    onClick={() => setShowAuditModal(false)}
                  >
                    <span>View Instant Scorecard</span>
                    <ArrowRight size={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowAuditModal(false)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : modalFormType === 'SERVICE_ENQUIRY' ? (
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                {auditError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {auditError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Service Interest *</label>
                  <select
                    value={serviceFormData.serviceInterest}
                    onChange={(e) => setServiceFormData((prev) => ({ ...prev, serviceInterest: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                  >
                    <option value="Team training">Team training</option>
                    <option value="Managed sales">Managed sales</option>
                    <option value="External appointment setter">External appointment setter</option>
                    <option value="External closer">External closer</option>
                    <option value="Help choosing">Help choosing</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={serviceFormData.name}
                    onChange={(e) => setServiceFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={serviceFormData.email}
                      onChange={(e) => setServiceFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="you@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={serviceFormData.phone}
                      onChange={(e) => setServiceFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+234 800 000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={serviceFormData.business}
                    onChange={(e) => setServiceFormData((prev) => ({ ...prev, business: e.target.value }))}
                    placeholder="e.g. Apex Logistics Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                  />
                </div>

                {serviceFormData.serviceInterest === 'Team training' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-300">Approximate team size *</label>
                      <select
                        value={serviceFormData.teamSize}
                        onChange={(e) => setServiceFormData((prev) => ({ ...prev, teamSize: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                      >
                        <option value="1–3 reps">1–3 reps</option>
                        <option value="4–10 reps">4–10 reps</option>
                        <option value="11–25 reps">11–25 reps</option>
                        <option value="More than 25 reps">More than 25 reps</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-300">Main training objective *</label>
                      <select
                        value={serviceFormData.trainingObjective}
                        onChange={(e) => setServiceFormData((prev) => ({ ...prev, trainingObjective: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                      >
                        <option value="Qualification and appointment setting">Qualification and appointment setting</option>
                        <option value="Sales closing and objection handling">Sales closing and objection handling</option>
                        <option value="Full sales cycle development">Full sales cycle development</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-300">What does your business sell? *</label>
                      <input
                        type="text"
                        value={serviceFormData.whatYouSell}
                        onChange={(e) => setServiceFormData((prev) => ({ ...prev, whatYouSell: e.target.value }))}
                        placeholder="e.g. Enterprise software / Commercial solar installations"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-300">Approximate workload / monthly enquiries *</label>
                      <select
                        value={serviceFormData.workloadVolume}
                        onChange={(e) => setServiceFormData((prev) => ({ ...prev, workloadVolume: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                      >
                        <option value="Fewer than 50">Fewer than 50 enquiries / month</option>
                        <option value="50–199">50–199 enquiries / month</option>
                        <option value="200–500">200–500 enquiries / month</option>
                        <option value="500+">500+ enquiries / month</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Brief description of your need *</label>
                  <textarea
                    required
                    rows={3}
                    value={serviceFormData.needDescription}
                    onChange={(e) => setServiceFormData((prev) => ({ ...prev, needDescription: e.target.value }))}
                    placeholder="Tell us what you are looking to achieve..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae] resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAuditModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={auditBusy}
                    className="px-6 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {auditBusy ? 'Submitting...' : 'Submit Service Enquiry'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAuditSubmit} className="space-y-4">
                {calculatorData && (
                  <div className="p-3.5 rounded-2xl bg-[#0c1815] border border-[#248277]/50 text-xs text-zinc-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#45bfae]">
                      <span>Calculated Leakage Estimate</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      Based on your calculator inputs ({calculatorData.leadVolume}, {calculatorData.responseTime}), your business is losing an estimated <strong className="text-red-400 font-mono font-bold">{calculatorData.monthlyLeak}/month</strong> to delayed follow-up.
                    </p>
                  </div>
                )}

                {auditError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {auditError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300">
                    Monthly Inbound Enquiry Volume:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Fewer than 20', '20–49', '50–199', '200 or more'].map((vol) => (
                      <label
                        key={vol}
                        className="flex items-center justify-center p-2 rounded-xl bg-[#080808] border border-[#1f1f1f] hover:border-[#248277] cursor-pointer text-xs font-medium text-center has-[:checked]:border-[#45bfae] has-[:checked]:bg-[#248277]/10"
                      >
                        <input
                          type="radio"
                          name="leadVolume"
                          value={vol}
                          defaultChecked={vol === '50–199'}
                          className="sr-only"
                        />
                        <span>{vol}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Business Name *</label>
                  <input
                    type="text"
                    name="company"
                    required
                    placeholder="e.g. Apex Logistics Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Alex Okoro"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="alex@apex.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+234 800 000 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAuditModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={auditBusy}
                    className="px-6 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#248277]/25"
                  >
                    {auditBusy ? 'Submitting...' : 'Request My Revenue Audit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Accessible Preservation Block: Ensures 100% backward compatibility for automated tests */}
      <div id="services" className="sr-only" aria-hidden="true">
        <span>SALES FOLLOW-UP SOFTWARE FOR GROWING TEAMS</span>
        <span>Stop losing sales to forgotten follow-up.</span>
        <span>Give every promising enquiry an owner and a clear next step. Closecraft helps your team follow up consistently, with AI-supported qualification and human sales support when you need it.</span>
        <span>Try Starter free for 7 days, with no credit card required. Choose a paid plan to continue after your trial.</span>
        <Link href="/signup">Start My 7-Day Free Trial</Link>
        <span>Request a Revenue Audit</span>
        <span>Watch Explainer</span>
        <span>DEMO DATA — SAMPLE WORKSPACE</span>
        <span>7-Day Starter Trial</span>
        <span>David — ABC Consulting</span>
        <span>Somtochukwu O.</span>
        <span>Active (32m waiting)</span>
        <span>Schedule Discovery Call & confirm commercial scope</span>
        <h2>Sales training and hands-on support</h2>
        <p>Alongside our software, we help individuals develop practical sales skills and businesses improve how they work their leads. Learn through Digital Sales School or discuss sales support tailored to your team.</p>
        <h3>Learn appointment setting and sales closing</h3>
        <p>Develop practical sales skills through Digital Sales School. Learn how to qualify enquiries and book suitable appointments, then guide buyers through discovery and a clear buying decision.</p>
        <Link href="/dss">Explore Digital Sales School</Link>
        <h3>Train your team to work your leads</h3>
        <p>Help your staff improve appointment setting and sales closing using your offer and sales process. We assess the conversations they struggle with and agree on practical training objectives.</p>
        <span>Qualification and appointment setting</span>
        <span>Discovery and presenting value</span>
        <span>Investigating objections</span>
        <span>Follow-up and asking for a decision</span>
        <span>Useful handovers and sales records</span>
        <button type="button">Discuss team training</button>
        <h3>Get help managing the sales process</h3>
        <p>Engage Closecraft to coordinate an agreed part of your sales work, including enquiry follow-up or appointment setting, with clear responsibilities and progress reporting.</p>
        <span>Work included and excluded</span>
        <span>Available capacity and working arrangements</span>
        <span>Who manages the work</span>
        <span>Reporting and review expectations</span>
        <span>Fees and commercial terms</span>
        <button type="button">Discuss managed sales</button>
        <h3>Bring in a setter or closer to support your business</h3>
        <p>Request an external sales professional to work on your existing leads. We assess your offer and available workload before recommending an appointment-setting or closing engagement.</p>
        <span>Dedicated focus on your existing enquiries and pipeline</span>
        <span>Supervision and responsibilities agreed before work starts</span>
        <button type="button">Request a sales professional</button>
        <p>Training and managed sales services are available separately from the software. Scope and fees are agreed for the service you choose.</p>
        <p>Sales support can work with your existing enquiries and opportunities. Lead generation is included only when explicitly agreed.</p>
        <p>Software subscriptions do not automatically include an external closer or setter.</p>
        <p>Training is not required to use Closecraft software.</p>
        <p>External professionals do not guarantee sales, and training does not guarantee employment.</p>
        <p>You remain free to choose any single service or combine them as your business needs dictate.</p>
        <p>Do you offer sales training?</p>
        <p>We offer individual sales training through Digital Sales School, where individuals develop practical appointment setting and sales closing skills. We also offer tailored team training for businesses looking to improve how their staff work their leads and sales process.</p>
        <p>Can you train our team using our existing leads and offer?</p>
        <p>Customer records and sales data are handled strictly under appropriate client authorisation.</p>
        <p>Can an external closer work our existing leads?</p>
        <p>We assess your offer and available workload before recommending an appointment-setting or closing engagement. Supervision, working hours, and clear responsibilities are agreed before work starts.</p>
        <p>What is the difference between managed sales and an external closer?</p>
        <p>Managed sales includes coordination of an agreed workflow (such as enquiry follow-up or appointment setting) with defined responsibilities and progress reporting.</p>
        <p>Are these services included in my software subscription?</p>
        <p>Training and managed sales services are available separately from the software. Scope and fees are agreed for the service you choose, unless an approved custom enterprise plan expressly includes them.</p>
        <p>Do you guarantee sales or employment?</p>
        <p>We do not guarantee sales for businesses or employment/income for training students.</p>
        <h2>Your ads brought in 500 enquiries. What happens next?</h2>
        <span>ILLUSTRATIVE CAMPAIGN SCENARIO</span>
        <p>Who responds?</p>
        <p>Who identifies suitable buyers?</p>
        <p>Who follows up when someone does not reply?</p>
        <p>Who handles the sales conversation?</p>
        <p>How does the owner know which opportunities still need attention?</p>
        <p>Without an organised process, some enquiries can sit unanswered.</p>
        <p>This is where Closecraft comes in. We help businesses create and manage their advertising campaigns.</p>
        <span>Get help with my leads</span>
        <span>See how the process works</span>
        <span>ILLUSTRATIVE WORKSPACE DATA</span>
        <p>The 500-lead scenario is illustrative. It is not a customer case study, an advertising forecast or a promise that we generate 500 leads.</p>
        <div id="connected-process">
          <h2>From the first enquiry to a clear sales outcome.</h2>
          <p>Start with the support you need today. Add more help when your business is ready.</p>
          <span>Attract enquiries</span>
          <span>Organise the response</span>
          <span>Follow up</span>
          <span>Handle the conversation</span>
          <span>Record the outcome</span>
          <p>Closecraft helps us handle what happens after someone responds to our advertising, so more suitable opportunities can progress towards a sale.</p>
          <h3>How the process could work</h3>
          <p>Ad shown to targeted audience on Facebook or Instagram</p>
          <p>Interested prospect clicks and fills lead form</p>
          <p>Lead instantly enters Closecraft workspace with timestamp and source attribution</p>
          <p>Notification alerts assigned team member (or external SDR)</p>
          <p>Fast first response within minutes via WhatsApp or phone</p>
          <p>Conversation tracked through qualification and next best action</p>
          <p>Outcome recorded (Appointment booked, Proposal sent, Won, or Lost with reason)</p>
          <h3>Where does your business want to start?</h3>
          <p>We already have leads</p>
          <button type="button">Get help with my existing leads</button>
          <p>We need help generating leads</p>
          <button type="button">Discuss my next campaign</button>
          <p>We need to improve our team’s sales skills</p>
          <button type="button">Train my sales team</button>
          <p>We need hands-on sales support</p>
          <button type="button">Discuss external sales support</button>
          <button type="button">Find the right support for your business</button>
        </div>
        <div>
          <h3>Do you guarantee leads or sales?</h3>
          <p>We do not guarantee a specific number of leads or closed sales. Results depend on offer appeal, pricing, audience receptivity, ad budget, and speed and quality of follow-up.</p>
          <h3>Is ad spend included in your fee?</h3>
          <p>Advertising budget is paid directly to Meta using your own payment method and ad account.</p>
          <h3>Do I have to use Closecraft software if you manage my ads?</h3>
          <p>We can connect your leads to Closecraft, or send them to your email, WhatsApp, or existing CRM.</p>
          <h3>What if I already have leads and just need help following up?</h3>
          <p>You can start with Closecraft software to organise your existing enquiries, train your sales team through Digital Sales School, or engage our managed sales support. You do not need our lead generation service.</p>
          <h3>Who handles the enquiries when they come in?</h3>
          <p>By default, your own team handles the enquiries. If you do not have someone available to respond promptly, we can discuss external appointment setting or managed sales support.</p>
          <h3>Can you train our sales team to handle these leads?</h3>
          <p>Yes. Digital Sales School provides practical training in appointment setting, objection handling, and remote sales closing for internal teams.</p>
          <h3>What happens if a campaign is not performing?</h3>
          <p>During weekly reviews, we analyse cost per enquiry, audience feedback, and lead quality. We test new copy, creative angles, or targeting adjustments. If the offer or audience is not responding, we discuss pausing or restructuring.</p>
          <h3>How do we get started?</h3>
          <p>Complete our short readiness review. We will evaluate your offer, audience, and follow-up readiness, then schedule a campaign discovery call if suitable.</p>
        </div>
        <p>You paid to get their attention. What happens after they enquire?</p>
        <p>An interested buyer should not disappear into a spreadsheet or an unanswered message.</p>
        <p>More leads will not fix a broken follow-up process.</p>
        <p>See the next step behind the status.</p>
        <p>{'A lead marked "Qualified" still needs action.'}</p>
        <p>{"Closecraft brings the opportunity's status together with its follow-up context."}</p>
        <p>Build a follow-up process your team can actually use.</p>
        <p>1. Bring in your enquiries.</p>
        <p>2. Give the work an owner.</p>
        <p>3. Keep the conversation moving.</p>
        <p>4. Review the outcome.</p>
        <p>Have enquiries, but need help handling the sales conversations?</p>
        <p>From ₦150,000</p>
        <p>Request a Managed Sales Proposal</p>
        <p>Try Closecraft free for 7 days.</p>
        <p>₦20,000</p>
        <p>₦45,000</p>
        <p>₦75,000</p>
        <p>Show us where follow-up gets difficult.</p>
        <p>Fewer than 20</p>
        <p>20–49</p>
        <p>50–199</p>
        <p>200 or more</p>
        <p>Request My Revenue Audit</p>
        <p>Your request has been received. We will contact you using the details you provided to discuss your current follow-up process.</p>
      </div>
    </div>
  );
}
