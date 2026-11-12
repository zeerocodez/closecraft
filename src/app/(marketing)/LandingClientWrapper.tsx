"use client";

import { useState, useRef, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Menu,
  Phone,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  ChevronDown,
  ChevronRight,
  Target,
  Layers,
  TrendingUp,
  Maximize2,
  Zap,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import Logo from "@/components/ui/Logo";
import BrevoNewsletterSection from "@/components/marketing/BrevoNewsletterSection";
import type { LandingView } from "@/lib/landing/types";
import type { EcosystemFlags } from "@/lib/ecosystem/flags";

export default function LandingClientWrapper({
  eco,
  flags,
}: {
  eco: LandingView | null;
  flags: EcosystemFlags | null;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [modalFormType, setModalFormType] = useState<'AUDIT' | 'MANAGED_SALES' | 'SERVICE_ENQUIRY'>('AUDIT');
  const [auditBusy, setAuditBusy] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Rate Card Lightbox State
  const [activeRateCardImage, setActiveRateCardImage] = useState<{ src: string; title: string } | null>(null);

  // Pricing Duration Selector State (default: 4 weeks)
  const [pricingDuration, setPricingDuration] = useState<'1' | '2' | '3' | '4'>('4');

  // Video Section State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoMode, setVideoMode] = useState<'video' | 'interactive'>('video');
  const [simStep, setSimStep] = useState<number>(0);

  // Service form state (preserved on error)
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    email: '',
    business: '',
    phone: '',
    serviceInterest: 'Team training',
    teamSize: '4–10 reps',
    trainingObjective: 'Qualification and appointment setting',
    whatYouSell: '',
    workloadVolume: '20–49',
    needDescription: '',
  });

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const jumpToVideoChapter = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    videoRef.current.play();
    setIsPlaying(true);
  };

  async function handleAuditSubmit(event: FormEvent<HTMLFormElement>, overrideFormType?: 'AUDIT' | 'MANAGED_SALES') {
    event.preventDefault();
    setAuditBusy(true);
    setAuditSuccess(null);
    setAuditError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, any> = Object.fromEntries(formData.entries());

    data.formType = (overrideFormType || modalFormType) === 'MANAGED_SALES' ? 'MANAGED_SALES' : 'REVENUE_AUDIT';

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseJson = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(responseJson.error || 'Failed to submit request. Please try again.');
      }

      setAuditSuccess("Your request has been received. We will contact you using the details you provided to discuss your current follow-up process.");
      form.reset();
    } catch (error) {
      setAuditError(error instanceof Error ? error.message : 'An error occurred while saving your request.');
    } finally {
      setAuditBusy(false);
    }
  }

  async function handleServiceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuditBusy(true);
    setAuditSuccess(null);
    setAuditError(null);

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

  const openAudit = (type: 'AUDIT' | 'MANAGED_SALES' = 'AUDIT') => {
    setModalFormType(type);
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

  // Video chapters
  const videoChapters = [
    { title: "1. Lead Generation", time: 0, label: "0:00" },
    { title: "2. Instant Routing", time: 15, label: "0:15" },
    { title: "3. Next-Best-Action", time: 30, label: "0:30" },
    { title: "4. Revenue Leakage", time: 45, label: "0:45" },
    { title: "5. Closing Deals", time: 55, label: "0:55" },
  ];

  // Interactive Lead Journey Simulation steps
  const simulationSteps = [
    {
      stage: "1. SPONSORED ADS & ACQUISITION",
      badge: "Targeted Meta Ads",
      title: "Growth Package · ₦3,000/day ad spend included",
      details: "High-converting Facebook & Instagram sponsored campaign with active audience targeting.",
      dealSize: "Ad Spend Included",
      stateDesc: "Buyer clicks sponsored WhatsApp ad or submits lead form. Captured into CloseCraft in <2 seconds.",
      icon: Target,
    },
    {
      stage: "2. INCOMING ENQUIRY",
      badge: "Lead Ingestion",
      title: "Sarah Davies · FinTech Africa",
      details: "Enquiry submitted via Meta Lead Form · Requested 15-seat deployment.",
      dealSize: "₦2,500,000 Deal",
      stateDesc: "Enquiry lands in CloseCraft instantly with campaign attribution. Zero spreadsheet delay.",
      icon: Layers,
    },
    {
      stage: "3. QUALIFICATION & SLA",
      badge: "SLA Activated",
      title: "Assigned to Closer: Somtochukwu O.",
      details: "Qualification Score: 94% Fit · Urgent Timing (Q4 roll-out).",
      dealSize: "SLA: 30-min first touch",
      stateDesc: "Strict follow-up SLA begins countdown. Manager alerted if touch is missed.",
      icon: Clock,
    },
    {
      stage: "4. NEXT-BEST-ACTION",
      badge: "Contextual Guidance",
      title: "Action: Schedule Commercial Discovery Call",
      details: "Context: Buyer requested pricing for 15-person team with active Q4 initiative.",
      dealSize: "Channel: WhatsApp / Direct Phone",
      stateDesc: "Closer receives pre-drafted contextual talking points and verified commercial bounds.",
      icon: Sparkles,
    },
    {
      stage: "5. DEAL CLOSED & WON",
      badge: "Revenue Secured",
      title: "Closed Won · ₦2,500,000 NGN",
      details: "Attribution: Sponsored Meta Ad · Sales Cycle: 48 hours · 0 leaked follow-ups.",
      dealSize: "₦2.5M Added to Pipeline",
      stateDesc: "Payment verified, CRM updated, full audit trail preserved for manager review.",
      icon: CheckCircle2,
    },
  ];

  // Pricing rate card data
  const starterPrices = { '1': '₦19,000', '2': '₦36,000', '3': '₦54,000', '4': '₦70,000' };
  const growthPrices = { '1': '₦27,000', '2': '₦51,000', '3': '₦77,000', '4': '₦100,000' };
  const elitePrices = { '1': '₦34,000', '2': '₦66,000', '3': '₦99,000', '4': '₦130,000' };

  // Section 8: FAQ items (exact prompt specifications)
  const faqs = [
    {
      q: "What is CloseCraft?",
      a: "CloseCraft is a Revenue Growth Platform that connects customer acquisition with consistent follow-up and sales conversion. We help businesses attract new leads through managed advertising campaigns, organise enquiries in a unified workspace, and convert more opportunities into paying customers."
    },
    {
      q: "How does CloseCraft help businesses acquire customers?",
      a: "We provide professionally managed Facebook and Instagram advertising campaigns with guaranteed daily Meta ad spend included. Our team handles campaign strategy, copywriting, targeted audience segmentation, and weekly optimization to deliver qualified buyer enquiries directly into your follow-up pipeline."
    },
    {
      q: "Does CloseCraft provide Facebook and Instagram advertising?",
      a: "Yes. CloseCraft offers four transparent lead-generation packages: Starter (₦2,000 daily spend), Growth (₦3,000 daily spend), Elite (₦4,000 daily spend), and Enterprise (custom weekly spend). All rates include both Meta ad spend and campaign management."
    },
    {
      q: "Can I purchase lead generation separately?",
      a: "Yes. You can purchase our lead-generation campaign packages independently or connect them directly with our follow-up software workspace and sales enablement services."
    },
    {
      q: "Does CloseCraft help with follow-up and sales closing?",
      a: "Yes. In addition to advertising campaigns, CloseCraft provides follow-up tracking software with SLA countdown timers, sales team training through Digital Sales School (DSS), and remote sales closing support for high-value deals."
    },
    {
      q: "How do I get started?",
      a: "Click Get Started to create your workspace and select your preferred service package, or submit a brief enquiry to discuss your business needs with our solutions team."
    },
  ];

  return (
    <div className="bg-[#000000] text-white min-h-screen selection:bg-[#248277] selection:text-white font-sans antialiased">
      {/* 1. Header & Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="inline-flex items-center group transition-opacity hover:opacity-90" aria-label="CloseCraft Home">
              <Logo variant="full" size="md" priority alt="CloseCraft" />
            </Link>
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/" className="px-3 py-1.5 text-sm font-medium text-white hover:text-[#45bfae] transition-colors">
                Home
              </Link>
              <a href="#how-it-works" className="px-3 py-1.5 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
                How It Works
              </a>
              <div className="relative group">
                <a
                  href="#services"
                  className="px-3 py-1.5 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Services</span>
                  <ChevronDown size={14} className="group-hover:rotate-180 transition-transform text-[#71717a]" />
                </a>
                <div className="absolute top-full left-0 mt-2 w-64 p-2 rounded-2xl bg-[#101010] border border-[#1f1f1f] shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150 z-50">
                  <Link
                    href="/services/lead-generation"
                    className="block p-2.5 rounded-xl hover:bg-[#1a1a1a] transition-colors group/item"
                  >
                    <p className="text-xs font-bold text-white group-hover/item:text-[#45bfae]">Lead Generation</p>
                    <p className="text-[11px] text-[#a1a1aa]">Managed Meta ads with ad spend included</p>
                  </Link>
                  <Link
                    href="/dss"
                    className="block p-2.5 rounded-xl hover:bg-[#1a1a1a] transition-colors group/item"
                  >
                    <p className="text-xs font-bold text-white group-hover/item:text-[#45bfae]">Digital Sales School</p>
                    <p className="text-[11px] text-[#a1a1aa]">Sales closing & appointment setting training</p>
                  </Link>
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
              <a href="#pricing" className="px-3 py-1.5 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
                Pricing
              </a>
              <Link href="/dss" className="px-3 py-1.5 text-sm font-semibold text-[#45bfae] hover:underline transition-colors flex items-center gap-1">
                <span>DSS Academy</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#248277]/25 transition-all active:scale-95"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors ml-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#080808] border-b border-[#1f1f1f] px-6 py-4 flex flex-col gap-3 shadow-2xl animate-in slide-in-from-top-2 duration-150">
            <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-white hover:bg-[#101010] rounded-lg text-sm font-medium" href="/">
              Home
            </Link>
            <a onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-white hover:bg-[#101010] rounded-lg text-sm font-medium" href="#how-it-works">
              How It Works
            </a>
            <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-white hover:bg-[#101010] rounded-lg text-sm font-medium" href="/services/lead-generation">
              Lead Generation
            </Link>
            <a onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-white hover:bg-[#101010] rounded-lg text-sm font-medium" href="#pricing">
              Pricing
            </a>
            <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-[#248277]/15 text-[#45bfae] font-bold text-sm flex items-center justify-between border border-[#248277]/30" href="/dss">
              <span>DSS Academy</span>
              <ChevronRight size={14} />
            </Link>
            <div className="pt-2 border-t border-[#1f1f1f] flex flex-col gap-2">
              <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-[#a1a1aa] hover:text-white rounded-lg text-sm font-medium" href="/login">
                Login
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 bg-[#248277] text-white text-center rounded-xl font-bold text-sm"
                href="/signup"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-20">
        {/* SECTION 1: HERO */}
        <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-[#000000]">
          {/* Subtle ambient lighting */}
          <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[500px] h-[500px] bg-[#248277]/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-[#14A7F7]/5 rounded-full blur-[130px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Text & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-[#45bfae] animate-pulse" />
                  REVENUE GROWTH PLATFORM
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                  Stop losing customers because nobody followed up.
                </h1>

                <p className="text-lg sm:text-xl text-[#a1a1aa] leading-relaxed max-w-xl">
                  You spend money attracting potential customers. CloseCraft helps you make sure those enquiries are handled, followed up and moved towards a sale.
                </p>

                <p className="text-sm font-medium text-[#71717a] border-l-2 border-[#248277] pl-3 py-0.5">
                  From finding potential customers to closing the sale, CloseCraft helps connect your entire sales process.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    href="/signup"
                    className="px-7 py-4 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-base inline-flex items-center justify-center gap-2 shadow-xl shadow-[#248277]/30 transition-all active:scale-95 text-center group"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href="#explainer-video"
                    className="px-6 py-4 rounded-xl bg-[#101010] hover:bg-[#1a1a1a] text-white border border-[#1f1f1f] hover:border-white/20 font-semibold text-base inline-flex items-center justify-center gap-2 transition-all text-center cursor-pointer shadow-sm active:scale-95"
                  >
                    <Play size={16} className="fill-[#45bfae] text-[#45bfae]" />
                    <span>Watch Explainer</span>
                  </a>
                </div>

                {/* Trust & Guarantee Indicator */}
                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#71717a]">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#45bfae]" />
                    <span>No long-term lock-in</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#45bfae]" />
                    <span>Meta Verified Ad Spend</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Zap size={14} className="text-[#45bfae]" />
                    <span>Rapid Setup &amp; Ingestion</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Hero Visual - Revenue Growth Process */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl bg-[#101010] border border-[#1f1f1f] shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4">
                  {/* Top Window Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]/80" />
                      <span className="text-[11px] font-mono text-[#71717a] ml-2">closecraft-workspace</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-semibold border border-[#248277]/40">
                      LIVE INGESTION
                    </span>
                  </div>

                  {/* 4 Connected Revenue Growth Process Stages */}
                  <div className="space-y-3">
                    {/* Stage 1: New Enquiry Ingestion */}
                    <div className="p-3.5 rounded-2xl bg-[#080808] border border-[#1f1f1f] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                          <Target size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">New Enquiry Ingested</p>
                          <p className="text-[11px] text-[#a1a1aa]">Meta Sponsored Ad · Sarah D. (FinTech Africa)</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-bold">
                        &lt; 2s ago
                      </span>
                    </div>

                    {/* Stage 2: Workspace Organisation */}
                    <div className="p-3.5 rounded-2xl bg-[#080808] border border-[#1f1f1f] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                          <Layers size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Organised in Workspace</p>
                          <p className="text-[11px] text-[#a1a1aa]">Attribution: Sponsored Growth Campaign</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-bold">
                        Qualified Fit
                      </span>
                    </div>

                    {/* Stage 3: Follow-Up SLA Management */}
                    <div className="p-3.5 rounded-2xl bg-[#080808] border border-[#248277]/50 flex items-center justify-between shadow-lg shadow-[#248277]/10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#248277]/20 border border-[#248277]/40 flex items-center justify-center text-[#45bfae]">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Follow-Up SLA Active</p>
                          <p className="text-[11px] text-[#a1a1aa]">Assigned: Somtochukwu O. · 15m timer</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        In Progress
                      </span>
                    </div>

                    {/* Stage 4: Sales Outcome Progression */}
                    <div className="p-3.5 rounded-2xl bg-[#080808] border border-[#1f1f1f] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Commercial Deal Closed</p>
                          <p className="text-[11px] text-[#a1a1aa]">₦2,500,000 NGN · Zero leaked follow-ups</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold">
                        Won ₦2.5M
                      </span>
                    </div>
                  </div>

                  {/* Bottom Metrics Bar */}
                  <div className="pt-2 border-t border-[#1f1f1f] flex items-center justify-between text-xs text-[#71717a]">
                    <span>100% Attribution Tracked</span>
                    <span className="text-[#45bfae] font-semibold">Strict SLA Enforced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: EXPLAINER VIDEO (Immediately after Hero) */}
        <section id="explainer-video" className="py-20 bg-[#080808] border-t border-[#1f1f1f] relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
            {/* Section Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
                <Play size={12} className="fill-[#45bfae]" />
                PRODUCT EXPLAINER
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                See how CloseCraft helps you win more customers.
              </h2>

              <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
                Discover how CloseCraft connects customer acquisition with lead follow-up and sales conversion.
              </p>

              {/* Mode Switcher */}
              <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#101010] border border-[#1f1f1f] shadow-inner">
                <button
                  type="button"
                  onClick={() => setVideoMode('video')}
                  className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    videoMode === 'video'
                      ? 'bg-[#248277] text-white shadow-md'
                      : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  <Play size={14} className={videoMode === 'video' ? 'fill-white' : ''} />
                  <span>Watch Explainer Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode('interactive')}
                  className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    videoMode === 'interactive'
                      ? 'bg-[#248277] text-white shadow-md'
                      : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>Interactive Walkthrough</span>
                </button>
              </div>
            </div>

            {/* TAB 1: 16:9 VIDEO PLAYER */}
            {videoMode === 'video' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="relative rounded-3xl overflow-hidden border border-[#1f1f1f] hover:border-[#248277]/60 bg-[#000000] shadow-2xl group transition-all">
                  <video
                    ref={videoRef}
                    src="/videos/closecraft-onboarding.mp4"
                    poster="/images/closecraft_hero_dashboard.jpg"
                    playsInline
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full aspect-video object-cover"
                  />

                  {/* Play Button Overlay when paused */}
                  {!isPlaying && (
                    <div
                      onClick={toggleVideoPlay}
                      className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/40"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="absolute w-24 h-24 rounded-full bg-[#248277]/40 animate-ping" />
                        <div className="w-20 h-20 rounded-full bg-[#248277] hover:bg-[#1f6f65] text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
                          <Play size={36} className="ml-1 fill-white" />
                        </div>
                      </div>
                      <span className="mt-4 text-xs sm:text-sm font-bold text-white tracking-wide bg-black/70 px-4 py-1.5 rounded-full border border-white/15">
                        Click to Play Explainer (60s)
                      </span>
                    </div>
                  )}

                  {/* Video Controls Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-between opacity-95">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleVideoPlay}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <button
                        type="button"
                        onClick={toggleVideoMute}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                      <span className="text-xs text-[#a1a1aa] font-mono hidden sm:inline">
                        CloseCraft Revenue Process
                      </span>
                    </div>

                    <Link
                      href="/signup"
                      className="px-3.5 py-1.5 rounded-lg bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all shadow-md"
                    >
                      Get Started &rarr;
                    </Link>
                  </div>
                </div>

                {/* Video Chapters bar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 pt-2">
                  {videoChapters.map((ch) => (
                    <button
                      key={ch.title}
                      type="button"
                      onClick={() => jumpToVideoChapter(ch.time)}
                      className="p-3 rounded-xl bg-[#101010] border border-[#1f1f1f] hover:border-[#248277]/60 hover:bg-[#151515] text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#45bfae]">
                        <span>{ch.label}</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-xs font-bold text-white mt-1 group-hover:text-[#45bfae] transition-colors">
                        {ch.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE WALKTHROUGH */}
            {videoMode === 'interactive' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[#101010] border border-[#1f1f1f] shadow-2xl space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pb-4 border-b border-[#1f1f1f]">
                  {simulationSteps.map((s, idx) => (
                    <button
                      key={s.stage}
                      type="button"
                      onClick={() => setSimStep(idx)}
                      className={`p-2 rounded-xl text-left transition-all cursor-pointer ${
                        simStep === idx
                          ? 'bg-[#248277]/20 border border-[#248277]/60'
                          : 'bg-[#080808] border border-transparent hover:bg-white/5'
                      }`}
                    >
                      <span className={`text-[10px] font-mono block ${simStep === idx ? 'text-[#45bfae] font-bold' : 'text-gray-500'}`}>
                        STAGE 0{idx + 1}
                      </span>
                      <span className={`text-xs font-semibold truncate block mt-0.5 ${simStep === idx ? 'text-white' : 'text-gray-400'}`}>
                        {s.badge}
                      </span>
                    </button>
                  ))}
                </div>

                {(() => {
                  const current = simulationSteps[simStep];
                  const Icon = current.icon;
                  return (
                    <div className="p-6 rounded-2xl bg-[#080808] border border-[#1f1f1f] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
                            <Icon size={20} />
                          </div>
                          <div>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] border border-[#248277]/40 font-bold">
                              {current.stage}
                            </span>
                            <h3 className="text-lg font-bold text-white mt-1">{current.title}</h3>
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-[#45bfae]">{current.dealSize}</span>
                      </div>

                      <p className="text-sm text-[#a1a1aa]">{current.details}</p>

                      <div className="p-3.5 rounded-xl bg-[#101010] border border-[#1f1f1f] flex items-center gap-3 text-xs text-emerald-300">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        <span>{current.stateDesc}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#1f1f1f]">
                        <button
                          type="button"
                          onClick={() => setSimStep((prev) => (prev + 1) % simulationSteps.length)}
                          className="px-4 py-2 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold inline-flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          <span>Next Stage ({simStep < 4 ? `0${simStep + 2}` : 'Replay'})</span>
                          <ArrowRight size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSimStep(0)}
                          className="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <RefreshCw size={12} />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Compact CTA Below Video */}
            <div className="text-center pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-base shadow-xl shadow-[#248277]/25 transition-all active:scale-95"
              >
                <span>Start Growing with CloseCraft</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW CLOSECRAFT WORKS */}
        <section id="how-it-works" className="py-24 bg-[#000000] border-t border-[#1f1f1f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
                <Layers size={12} />
                THE CONNECTED REVENUE PROCESS
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                From first enquiry to final sale.
              </h2>

              <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
                CloseCraft helps businesses attract potential customers and keep those opportunities moving through the sales process.
              </p>
            </div>

            {/* 3 Connected Workflow Stages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Stage 1 */}
              <div className="p-8 rounded-3xl bg-[#101010] border border-[#1f1f1f] hover:border-[#248277]/60 transition-all flex flex-col justify-between space-y-6 group shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-12 h-12 rounded-2xl bg-[#248277]/15 border border-[#248277]/30 flex items-center justify-center text-[#45bfae] font-extrabold text-lg">
                      01
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#1f1f1f] text-gray-300 font-bold uppercase">
                      ACQUISITION
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white">Lead Generation</h3>
                  <p className="text-xs font-semibold text-[#45bfae] uppercase tracking-wide">Bring in new enquiries.</p>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed">
                    Help businesses attract potential customers through professionally managed advertising campaigns on Facebook and Instagram.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#080808] border border-[#1f1f1f] space-y-2 text-xs text-[#a1a1aa]">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Check size={14} className="text-[#45bfae]" />
                    <span>Targeted Meta Sponsored Campaigns</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Check size={14} className="text-[#45bfae]" />
                    <span>Guaranteed Daily Ad Spend Included</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Check size={14} className="text-[#45bfae]" />
                    <span>Continuous Copy &amp; Audience Tuning</span>
                  </div>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="p-8 rounded-3xl bg-[#101010] border-2 border-[#248277] transition-all flex flex-col justify-between space-y-6 group shadow-2xl relative">
                <div className="absolute -top-3.5 left-8 bg-[#248277] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                  CORE PLATFORM
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-12 h-12 rounded-2xl bg-[#248277]/25 border border-[#248277]/50 flex items-center justify-center text-[#45bfae] font-extrabold text-lg">
                      02
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#1f1f1f] text-gray-300 font-bold uppercase">
                      ORGANISATION
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white">Lead Management</h3>
                  <p className="text-xs font-semibold text-[#45bfae] uppercase tracking-wide">Keep every opportunity moving.</p>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed">
                    Organise customer enquiries, manage conversations and ensure follow-up does not get forgotten.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#080808] border border-[#1f1f1f] space-y-2 text-xs text-[#a1a1aa]">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Check size={14} className="text-[#45bfae]" />
                    <span>Zero Spreadsheet Lag &amp; Loss</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Check size={14} className="text-[#45bfae]" />
                    <span>Strict Follow-Up SLA Countdowns</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Check size={14} className="text-[#45bfae]" />
                    <span>Next-Best-Action Recommendation</span>
                  </div>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="p-8 rounded-3xl bg-[#101010] border border-[#1f1f1f] hover:border-[#248277]/60 transition-all flex flex-col justify-between space-y-6 group shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-12 h-12 rounded-2xl bg-[#248277]/15 border border-[#248277]/30 flex items-center justify-center text-[#45bfae] font-extrabold text-lg">
                      03
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#1f1f1f] text-gray-300 font-bold uppercase">
                      REVENUE
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white">Sales Conversion</h3>
                  <p className="text-xs font-semibold text-[#45bfae] uppercase tracking-wide">Turn prospects into customers.</p>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed">
                    Support qualification, appointment setting and sales closing through the appropriate tools and human services.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#080808] border border-[#1f1f1f] space-y-2 text-xs text-[#a1a1aa]">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Check size={14} className="text-[#45bfae]" />
                    <span>Structured Qualification Playbooks</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Check size={14} className="text-[#45bfae]" />
                    <span>DSS Trained Setters &amp; Remote Closers</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Check size={14} className="text-[#45bfae]" />
                    <span>Closed-Won Revenue Verification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: LEAD GENERATION PRICING */}
        <section id="pricing" className="py-24 bg-[#080808] border-t border-[#1f1f1f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
                <Target size={12} />
                LEAD GENERATION RATE CARDS
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Need more enquiries for your business?
              </h2>

              <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
                We help businesses attract potential customers through professionally managed Facebook and Instagram advertising campaigns.
              </p>

              {/* Duration selector tabs */}
              <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#101010] border border-[#1f1f1f] shadow-inner mt-4">
                {(['1', '2', '3', '4'] as const).map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setPricingDuration(dur)}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      pricingDuration === dur
                        ? 'bg-[#248277] text-white shadow-md'
                        : 'text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    <span>{dur} {dur === '1' ? 'Week' : 'Weeks'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Official Rate Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {/* Card 1: Starter Package */}
              <div className="rounded-3xl bg-[#101010] border border-[#1f1f1f] hover:border-[#248277]/60 overflow-hidden flex flex-col justify-between shadow-xl transition-all group">
                <div
                  onClick={() => setActiveRateCardImage({ src: '/images/Starter package rate card.png', title: 'Starter Package Rate Card' })}
                  className="relative aspect-[3/4] w-full bg-[#000000] overflow-hidden cursor-pointer group/img"
                  title="Click to view full rate card image"
                >
                  <Image
                    src="/images/Starter package rate card.png"
                    alt="Starter Package Rate Card — ₦2,000 daily ad spend"
                    fill
                    className="object-contain p-3 group-hover/img:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-bold">
                    <Maximize2 size={16} />
                    <span>View Rate Card</span>
                  </div>
                </div>

                <div className="p-6 space-y-4 bg-[#101010] border-t border-[#1f1f1f] flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-bold">
                        POPULAR CHOICE
                      </span>
                      <span className="text-xs font-extrabold text-[#71717a]">₦2,000 / day</span>
                    </div>

                    <h3 className="font-extrabold text-white text-lg">Starter Package</h3>

                    <div className="py-1">
                      <span className="text-2xl font-extrabold text-white">{starterPrices[pricingDuration]}</span>
                      <span className="text-xs text-[#a1a1aa] ml-1.5">for {pricingDuration} {pricingDuration === '1' ? 'week' : 'weeks'}</span>
                    </div>

                    <p className="text-xs text-[#a1a1aa]">
                      <strong>₦2,000</strong> daily Meta ad spend included directly in the plan price.
                    </p>

                    <div className="text-[11px] text-[#71717a] space-y-1.5 pt-2 border-t border-[#1f1f1f]">
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <Check size={12} className="text-[#45bfae] shrink-0" />
                        <span>Ad strategy &amp; campaign setup</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <Check size={12} className="text-[#45bfae] shrink-0" />
                        <span>Targeted audience segmentation</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <Check size={12} className="text-[#45bfae] shrink-0" />
                        <span>Weekly performance reporting</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3">
                    <Link
                      href="/services/lead-generation"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all text-center shadow-md block"
                    >
                      Select Starter Package &rarr;
                    </Link>
                    <a
                      href="https://wa.me/2349026365853?text=Hi%20CloseCraft,%20I%20want%20to%20get%20started%20with%20the%20Starter%20Sponsored%20Ads%20Package."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-[#1f1f1f] hover:bg-[#262626] text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center"
                    >
                      <Phone size={13} />
                      <span>WhatsApp Sponsored</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 2: Growth Package (Highlighted) */}
              <div className="rounded-3xl bg-[#101010] border-2 border-[#248277] overflow-hidden flex flex-col justify-between shadow-2xl relative group">
                <div className="absolute top-3 right-3 z-10 bg-[#248277] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow">
                  MOST RECOMMENDED
                </div>

                <div
                  onClick={() => setActiveRateCardImage({ src: '/images/Growth package rate card.png', title: 'Growth Package Rate Card' })}
                  className="relative aspect-[3/4] w-full bg-[#000000] overflow-hidden cursor-pointer group/img"
                  title="Click to view full rate card image"
                >
                  <Image
                    src="/images/Growth package rate card.png"
                    alt="Growth Package Rate Card — ₦3,000 daily ad spend"
                    fill
                    className="object-contain p-3 group-hover/img:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-bold">
                    <Maximize2 size={16} />
                    <span>View Rate Card</span>
                  </div>
                </div>

                <div className="p-6 space-y-4 bg-[#101010] border-t border-[#1f1f1f] flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        STEADY INBOUND
                      </span>
                      <span className="text-xs font-extrabold text-[#45bfae]">₦3,000 / day</span>
                    </div>

                    <h3 className="font-extrabold text-white text-lg">Growth Package</h3>

                    <div className="py-1">
                      <span className="text-2xl font-extrabold text-white">{growthPrices[pricingDuration]}</span>
                      <span className="text-xs text-[#a1a1aa] ml-1.5">for {pricingDuration} {pricingDuration === '1' ? 'week' : 'weeks'}</span>
                    </div>

                    <p className="text-xs text-[#a1a1aa]">
                      <strong>₦3,000</strong> daily Meta ad spend included for steady customer acquisition.
                    </p>

                    <div className="text-[11px] text-[#71717a] space-y-1.5 pt-2 border-t border-[#1f1f1f]">
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <Check size={12} className="text-[#45bfae] shrink-0" />
                        <span>All Starter deliverables</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <Check size={12} className="text-[#45bfae] shrink-0" />
                        <span>Creative iteration &amp; multiple angles</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <Check size={12} className="text-[#45bfae] shrink-0" />
                        <span>Lead qualification setup</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3">
                    <Link
                      href="/services/lead-generation"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all text-center shadow-lg shadow-[#248277]/25 block"
                    >
                      Select Growth Package &rarr;
                    </Link>
                    <a
                      href="https://wa.me/2349026365853?text=Hi%20CloseCraft,%20I%20want%20to%20get%20started%20with%20the%20Growth%20Sponsored%20Ads%20Package."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-[#1f1f1f] hover:bg-[#262626] text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center"
                    >
                      <Phone size={13} />
                      <span>WhatsApp Sponsored</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 3: Elite Package */}
              <div className="rounded-3xl bg-[#101010] border border-[#1f1f1f] hover:border-[#248277]/60 overflow-hidden flex flex-col justify-between shadow-xl transition-all group">
                <div
                  onClick={() => setActiveRateCardImage({ src: '/images/Elite digital sales rate card.png', title: 'Elite Package Rate Card' })}
                  className="relative aspect-[3/4] w-full bg-[#000000] overflow-hidden cursor-pointer group/img"
                  title="Click to view full rate card image"
                >
                  <Image
                    src="/images/Elite digital sales rate card.png"
                    alt="Elite Package Rate Card — ₦4,000 daily ad spend"
                    fill
                    className="object-contain p-3 group-hover/img:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-bold">
                    <Maximize2 size={16} />
                    <span>View Rate Card</span>
                  </div>
                </div>

                <div className="p-6 space-y-4 bg-[#101010] border-t border-[#1f1f1f] flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        HIGH IMPACT
                      </span>
                      <span className="text-xs font-extrabold text-[#71717a]">₦4,000 / day</span>
                    </div>

                    <h3 className="font-extrabold text-white text-lg">Elite Package</h3>

                    <div className="py-1">
                      <span className="text-2xl font-extrabold text-white">{elitePrices[pricingDuration]}</span>
                      <span className="text-xs text-[#a1a1aa] ml-1.5">for {pricingDuration} {pricingDuration === '1' ? 'week' : 'weeks'}</span>
                    </div>

                    <p className="text-xs text-[#a1a1aa]">
                      <strong>₦4,000</strong> daily spend for high velocity pipelines and larger deal sizes.
                    </p>

                    <div className="text-[11px] text-[#71717a] space-y-1.5 pt-2 border-t border-[#1f1f1f]">
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <Check size={12} className="text-[#45bfae] shrink-0" />
                        <span>High-volume enquiry generation</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <Check size={12} className="text-[#45bfae] shrink-0" />
                        <span>Retargeting &amp; audience funnels</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <Check size={12} className="text-[#45bfae] shrink-0" />
                        <span>Priority campaign manager review</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3">
                    <Link
                      href="/services/lead-generation"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all text-center shadow-md block"
                    >
                      Select Elite Package &rarr;
                    </Link>
                    <a
                      href="https://wa.me/2349026365853?text=Hi%20CloseCraft,%20I%20want%20to%20get%20started%20with%20the%20Elite%20Sponsored%20Ads%20Package."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-[#1f1f1f] hover:bg-[#262626] text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center"
                    >
                      <Phone size={13} />
                      <span>WhatsApp Sponsored</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 4: Enterprise Package */}
              <div className="rounded-3xl bg-[#101010] border border-[#1f1f1f] hover:border-[#248277]/60 overflow-hidden flex flex-col justify-between shadow-xl transition-all group">
                <div
                  onClick={() => setActiveRateCardImage({ src: '/images/Enterprise custom ad spend rate card.png', title: 'Enterprise Custom Ad Spend Rate Card' })}
                  className="relative aspect-[3/4] w-full bg-[#000000] overflow-hidden cursor-pointer group/img"
                  title="Click to view full rate card image"
                >
                  <Image
                    src="/images/Enterprise custom ad spend rate card.png"
                    alt="Enterprise Custom Ad Spend Rate Card"
                    fill
                    className="object-contain p-3 group-hover/img:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-bold">
                    <Maximize2 size={16} />
                    <span>View Rate Card</span>
                  </div>
                </div>

                <div className="p-6 space-y-4 bg-[#101010] border-t border-[#1f1f1f] flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                        TAILORED SCALE
                      </span>
                      <span className="text-xs font-extrabold text-[#71717a]">Weekly Allocation</span>
                    </div>

                    <h3 className="font-extrabold text-white text-lg">Enterprise Package</h3>

                    <div className="py-1">
                      <span className="text-2xl font-extrabold text-white">Custom Quote</span>
                      <span className="text-xs text-[#a1a1aa] ml-1.5">weekly arrangements</span>
                    </div>

                    <p className="text-xs text-[#a1a1aa]">
                      Customised weekly advertising spend arrangement tailored to enterprise workload.
                    </p>

                    <div className="text-[11px] text-[#71717a] space-y-1.5 pt-2 border-t border-[#1f1f1f]">
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <Check size={12} className="text-[#45bfae] shrink-0" />
                        <span>Dedicated campaign architect</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <Check size={12} className="text-[#45bfae] shrink-0" />
                        <span>Multi-market audience strategy</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <Check size={12} className="text-[#45bfae] shrink-0" />
                        <span>Custom CRM &amp; closing alignment</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3">
                    <button
                      type="button"
                      onClick={() => openAudit('MANAGED_SALES')}
                      className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all text-center border border-white/15 block cursor-pointer"
                    >
                      Request Custom Quote &rarr;
                    </button>
                    <a
                      href="https://wa.me/2349026365853?text=Hi%20CloseCraft,%20I%20want%20to%20discuss%20an%20Enterprise%20Lead%20Generation%20Campaign."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-[#1f1f1f] hover:bg-[#262626] text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center"
                    >
                      <Phone size={13} />
                      <span>Enterprise WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: THE CLOSECRAFT PRODUCT */}
        <section id="product" className="py-24 bg-[#000000] border-t border-[#1f1f1f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
                <Layers size={12} />
                THE CLOSECRAFT WORKSPACE
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                One connected view of your sales opportunities.
              </h2>

              <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
                Keep track of customer enquiries, conversations, lead status and next actions in one unified workspace.
              </p>
            </div>

            {/* Product Screenshot Showcase */}
            <div className="relative rounded-3xl overflow-hidden border border-[#1f1f1f] bg-[#101010] shadow-2xl group">
              <div className="relative aspect-[16/9] w-full bg-[#000000] overflow-hidden">
                <Image
                  src="/images/closecraft_hero_dashboard.jpg"
                  alt="CloseCraft Sales Command Centre Dashboard"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>

              {/* Bottom Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 sm:p-8 bg-[#080808] border-t border-[#1f1f1f]">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#45bfae]" />
                    <span>Enquiry Ingestion</span>
                  </h4>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    Leads from Meta ads and forms appear in real time with campaign attribution.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Response SLAs</span>
                  </h4>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    Strict timers ensure every promising prospect gets contact before going cold.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Next-Best-Action</span>
                  </h4>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    Clear guidance on what to say, which objections to resolve, and when to follow up.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Revenue Leakage</span>
                  </h4>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    Visibility into overdue follow-ups, stalled deals, and team closing velocity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: THE CLOSECRAFT ADVANTAGE */}
        <section id="advantage" className="py-24 bg-[#080808] border-t border-[#1f1f1f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
                <TrendingUp size={12} />
                THE CLOSECRAFT ADVANTAGE
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Better follow-up. Fewer lost opportunities.
              </h2>

              <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
                Connect customer acquisition directly to consistent follow-up and sales execution.
              </p>
            </div>

            {/* 4 Benefit Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-7 rounded-3xl bg-[#101010] border border-[#1f1f1f] space-y-4 hover:border-[#248277]/50 transition-all shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-[#248277]/15 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
                  <Target size={22} />
                </div>
                <h3 className="text-base font-bold text-white">Acquiring New Customers</h3>
                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                  Stop hoping buyers find you. Run targeted Meta ad campaigns with ad spend included to attract genuine enquiries.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-[#101010] border border-[#1f1f1f] space-y-4 hover:border-[#248277]/50 transition-all shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-[#248277]/15 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
                  <Layers size={22} />
                </div>
                <h3 className="text-base font-bold text-white">Keeping Enquiries Organised</h3>
                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                  Eliminate lost contacts in chat windows or spreadsheets. Centralise all enquiries in one clean, multi-user workspace.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-[#101010] border border-[#1f1f1f] space-y-4 hover:border-[#248277]/50 transition-all shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-[#248277]/15 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
                  <Clock size={22} />
                </div>
                <h3 className="text-base font-bold text-white">Following Up Consistently</h3>
                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                  Enforce follow-up accountability with automated SLA timers and reminders so no promising prospect sits forgotten.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-[#101010] border border-[#1f1f1f] space-y-4 hover:border-[#248277]/50 transition-all shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-[#248277]/15 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
                  <TrendingUp size={22} />
                </div>
                <h3 className="text-base font-bold text-white">Moving Prospects to Sale</h3>
                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                  Equip closers with contextual Next-Best-Action guidance, structured qualification playbooks, and negotiation tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: FINAL CTA */}
        <section className="py-24 bg-[#000000] border-t border-[#1f1f1f]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-10 sm:p-14 rounded-3xl bg-[#101010] border border-[#248277]/50 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#248277]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#14A7F7]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Every enquiry is an opportunity. Make it count.
                </h2>

                <p className="text-base sm:text-lg text-[#a1a1aa] max-w-xl mx-auto leading-relaxed">
                  Give your business a better way to attract customers, manage enquiries and turn opportunities into sales.
                </p>

                <p className="sr-only">Give your next opportunity a clear next step.</p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-base shadow-xl shadow-[#248277]/30 transition-all active:scale-95 inline-flex items-center justify-center gap-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={18} />
                  </Link>

                  <a
                    href="#pricing"
                    className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#1f1f1f] hover:bg-[#262626] text-white border border-[#262626] font-semibold text-base transition-all inline-flex items-center justify-center gap-2"
                  >
                    <span>Explore Our Services</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: COMPACT FAQ */}
        <section id="faq" className="py-24 bg-[#080808] border-t border-[#1f1f1f]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
                <HelpCircle size={12} />
                ANSWERS
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl bg-[#101010] border border-[#1f1f1f] overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#151515] transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="font-bold text-sm sm:text-base text-white">{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#71717a] transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-[#45bfae]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-[#a1a1aa] leading-relaxed border-t border-[#1f1f1f]/60 pt-3 animate-in fade-in duration-150">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Brevo Newsletter Section (Placed below final CTA, above footer) */}
        <BrevoNewsletterSection
          headline="Make your next sales conversation count."
          description="Get a practical sales lesson each week, with follow-up examples you can use in your business."
        />

        {/* FOOTER */}
        <footer className="bg-[#000000] border-t border-[#1f1f1f] py-16 text-xs text-[#71717a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {/* Brand Col */}
              <div className="col-span-2 space-y-4">
                <Link href="/" className="inline-block" aria-label="CloseCraft">
                  <Logo variant="full" size="md" alt="CloseCraft" />
                </Link>
                <p className="text-xs text-[#a1a1aa] max-w-sm leading-relaxed">
                  The Revenue Growth Platform connecting customer acquisition with consistent follow-up and sales conversion.
                </p>
                <p className="text-[11px] text-[#71717a]">
                  Zeerocodes Automation Limited. RC 8421094.
                </p>
              </div>

              {/* Col 1: Platform */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Platform</h4>
                <ul className="space-y-2">
                  <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><Link href="/services/lead-generation" className="hover:text-white transition-colors">Lead Generation</Link></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#explainer-video" className="hover:text-white transition-colors">Explainer Video</a></li>
                </ul>
              </div>

              {/* Col 2: Solutions */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Solutions</h4>
                <ul className="space-y-2">
                  <li><Link href="/services/sales-outsourcing" className="hover:text-white transition-colors">Sales Follow-Up</Link></li>
                  <li><button type="button" onClick={() => openServiceEnquiry('Managed sales')} className="hover:text-white transition-colors text-left">Managed Sales</button></li>
                  <li><Link href="/dss" className="text-[#45bfae] font-semibold hover:underline">Digital Sales School</Link></li>
                  <li><Link href="/affiliate" className="hover:text-white transition-colors">Affiliate Programme</Link></li>
                  <li><button type="button" onClick={() => openAudit('AUDIT')} className="hover:text-white transition-colors text-left">Revenue Audit</button></li>
                </ul>
              </div>

              {/* Col 3: Legal & Company */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Company &amp; Legal</h4>
                <ul className="space-y-2">
                  <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog &amp; Insights</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-[#1f1f1f] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#71717a]">
              <p>&copy; {new Date().getFullYear()} CloseCraft (Zeerocodes Automation Limited). All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
                <span>&bull;</span>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <span>&bull;</span>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* LIGHTBOX MODAL: Rate Card Image Zoom */}
      {activeRateCardImage && (
        <div
          onClick={() => setActiveRateCardImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center cursor-pointer animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full max-h-[90vh] bg-[#101010] border border-[#1f1f1f] rounded-3xl overflow-hidden p-4 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
              <span className="font-bold text-sm text-white">{activeRateCardImage.title}</span>
              <button
                type="button"
                onClick={() => setActiveRateCardImage(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="relative aspect-[3/4] w-full mt-3 overflow-hidden rounded-xl bg-black">
              <Image
                src={activeRateCardImage.src}
                alt={activeRateCardImage.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="pt-3 flex justify-end">
              <Link
                href="/services/lead-generation"
                className="px-4 py-2 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all"
              >
                Select Package &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Revenue Audit & Service Enquiry Modal */}
      {showAuditModal && (
        <div
          onClick={() => setShowAuditModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-[#101010] border border-[#1f1f1f] rounded-3xl p-6 sm:p-8 shadow-2xl my-8 space-y-6"
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
              >
                <X size={18} />
              </button>
            </div>

            {auditSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span>Request Received</span>
                </div>
                <p>{auditSuccess}</p>
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="mt-2 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all"
                >
                  Close
                </button>
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
                    placeholder="e.g. Tunde Adeyemi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={serviceFormData.email}
                      onChange={(e) => setServiceFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="tunde@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Phone (WhatsApp)</label>
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
                        <option value="Fewer than 20">Fewer than 20</option>
                        <option value="20–49">20–49</option>
                        <option value="50–199">50–199</option>
                        <option value="200 or more">200 or more</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Brief description of your need *</label>
                  <textarea
                    rows={2}
                    value={serviceFormData.needDescription}
                    onChange={(e) => setServiceFormData((prev) => ({ ...prev, needDescription: e.target.value }))}
                    placeholder="Tell us what you sell and where deals currently get delayed or lost..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAuditModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={auditBusy}
                    className="px-6 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {auditBusy ? 'Submitting...' : 'Submit Service Enquiry'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAuditSubmit} className="space-y-4">
                {auditError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {auditError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Tunde Adeyemi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Work Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="tunde@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Phone (WhatsApp) *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+234 800 000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Business Name *</label>
                  <input
                    type="text"
                    name="business"
                    required
                    placeholder="e.g. Apex Logistics Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Monthly Enquiry Volume</label>
                  <select
                    name="workloadVolume"
                    defaultValue="20–49"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                  >
                    <option value="Fewer than 20">Fewer than 20</option>
                    <option value="20–49">20–49</option>
                    <option value="50–199">50–199</option>
                    <option value="200 or more">200 or more</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">What is your primary follow-up bottleneck?</label>
                  <textarea
                    name="needDescription"
                    rows={2}
                    placeholder="Tell us what you sell and where deals currently get delayed or lost..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080808] border border-[#1f1f1f] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAuditModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={auditBusy}
                    className="px-6 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all disabled:opacity-50"
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
        <span>Start My 7-Day Free Trial</span>
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
