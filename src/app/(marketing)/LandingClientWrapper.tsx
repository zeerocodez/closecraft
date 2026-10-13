"use client";

import { useState, type FormEvent } from 'react';

import EcosystemHero from "@/components/landing/EcosystemHero";
import ActivityStrip from "@/components/landing/ActivityStrip";
import DiscoveryTabs from "@/components/landing/DiscoveryTabs";
import HowItWorks from "@/components/landing/HowItWorks";
import JoinChooser from "@/components/landing/JoinChooser";
import SampleNote from "@/components/landing/SampleNote";
import type { LandingView } from "@/lib/landing/types";
import type { EcosystemFlags } from "@/lib/ecosystem/flags";

import Link from 'next/link';
import {
 ArrowRight,
 Check,
 Clock,
 Menu,
 Phone,
 Send,
 ShieldCheck,
 TrendingUp,
 X,
 Zap,
 Award,
 Bot,
 Sparkles,
 Users,
 CheckCircle,
} from 'lucide-react';
import './landing.css';

interface PipelineStage {
  step: string;
  title: string;
  desc: string;
  metric: string;
  tag: string;
}

const pipelineStages: PipelineStage[] = [
  {
    step: '01',
    title: 'Multi-Channel Inbound Capture',
    desc: 'Meta Ads, website forms, and WhatsApp chats ingested in under 800ms with zero manual data entry.',
    metric: '< 800ms',
    tag: 'Instant Ingestion',
  },
  {
    step: '02',
    title: 'AI Intent Scoring & Routing',
    desc: 'Determines buyer budget, urgency, and fit. Assigns deterministic Next Best Action with active SLA timers.',
    metric: '98% Fit Score',
    tag: 'Automated Triage',
  },
  {
    step: '03',
    title: 'Live Human Closer Handoff',
    desc: 'High-intent leads are passed directly to certified Digital Sales School closers for video discovery calls.',
    metric: '34.8% Close Rate',
    tag: 'DSS Verified Closers',
  },
  {
    step: '04',
    title: 'Instant Settlement & Accounting',
    desc: 'Contracts signed and client deposits settled immediately via Paystack with automated receipts and CRM updates.',
    metric: '₦45.2M Tracked',
    tag: 'Automated Payouts',
  },
];

export default function LandingClientWrapper({ eco, flags }: { eco: LandingView | null, flags: EcosystemFlags | null }) {
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [showAuditModal, setShowAuditModal] = useState(false);
 const [activePipelineStage, setActivePipelineStage] = useState(0);
 const [auditBusy, setAuditBusy] = useState(false);
 const [auditSuccess, setAuditSuccess] = useState<string | null>(null);
 const [auditError, setAuditError] = useState<string | null>(null);

 async function handleAuditSubmit(event: FormEvent<HTMLFormElement>) {
 event.preventDefault();
 setAuditBusy(true);
 setAuditSuccess(null);
 setAuditError(null);
 
 const formData = new FormData(event.target as HTMLFormElement);
 const data = Object.fromEntries(formData.entries());

 try {
 const res = await fetch('/api/leads', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(data),
 });

 if (!res.ok) {
 throw new Error('Failed to submit audit request.');
 }

 setAuditSuccess('Audit request received! We will examine your lead-to-sale process and show you where opportunities are being lost.');
 (event.target as HTMLFormElement).reset();
 } catch (error) {
 setAuditError(error instanceof Error ? error.message : 'An error occurred.');
 } finally {
 setAuditBusy(false);
 }
 }

 const openAudit = () => {
 setMobileMenuOpen(false);
 setShowAuditModal(true);
 };

 return (
 <div className="landing-shell" style={{ paddingTop: '80px' }}>
 {/* 1. Navigation */}
 <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
  {/* Announcement bar for DSS Academy */}
  <div className="bg-[#0f1214] border-b border-[#248277]/30 px-4 py-1.5 text-center text-xs text-gray-300 flex items-center justify-center gap-2">
    <span className="px-1.5 py-0.5 rounded bg-[#248277] text-white font-bold text-[10px] uppercase tracking-wider">ACADEMY</span>
    <span>Looking for Digital Sales School?</span>
    <Link href="/dss" className="text-[#45bfae] font-bold hover:underline flex items-center gap-1">
      Go to DSS Academy &rarr;
    </Link>
  </div>
  <div className="h-16 w-full px-4 sm:px-8 lg:px-12 max-w-[1440px] mx-auto flex items-center justify-between">
    <div className="flex items-center gap-6 xl:gap-8">
      <Link className="flex items-center gap-2 group" href="/">
        <div className="w-8 h-8 rounded-lg bg-inverse-surface flex items-center justify-center text-on-primary font-headline-lg text-headline-lg shadow-sm">
          <span className="material-symbols-outlined text-[20px] text-primary-fixed">bolt</span>
        </div>
        <span className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Closecraft</span>
      </Link>
      <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
        <Link className="px-3 py-1.5 text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors" href="/platform">Platform</Link>
        <Link className="px-3 py-1.5 text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors" href="/solutions">Solutions</Link>
        <Link className="px-3 py-1.5 text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors" href="/integrations">Integrations</Link>
        <Link className="px-3 py-1.5 text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors" href="/pricing">Pricing</Link>
        <Link className="px-3 py-1.5 text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors" href="/#faq">FAQ</Link>
      </nav>
    </div>
    <div className="flex items-center gap-2 sm:gap-3">
      <Link href="/dss" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#248277] text-white hover:bg-[#1f6f65] text-xs font-bold tracking-wide transition-all shadow-sm">
        <span className="material-symbols-outlined text-[15px]">school</span>
        <span>DSS Academy</span>
      </Link>
      <Link className="hidden sm:inline-flex items-center px-3 py-1.5 text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors" href="/login">Client Sign In</Link>
      <button onClick={openAudit} className="inline-flex items-center justify-center px-4 py-1.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-all">Book Demo</button>
      <Link href="/dashboard" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center" title="SaaS Dashboard">
        <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
      </Link>
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden p-1.5 text-on-surface hover:bg-surface-container rounded-lg transition-colors ml-1"
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  </div>
  {mobileMenuOpen && (
    <div className="lg:hidden bg-surface-container-lowest border-b border-surface-container px-6 py-4 flex flex-col gap-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
      <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-[#248277]/15 text-[#248277] font-bold text-sm flex items-center gap-2 border border-[#248277]/30" href="/dss">
        <span className="material-symbols-outlined text-[18px]">school</span>
        <span>Digital Sales School (DSS) Academy</span>
      </Link>
      <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-on-surface hover:bg-surface-container-low rounded-lg text-sm font-medium" href="/platform">Platform</Link>
      <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-on-surface hover:bg-surface-container-low rounded-lg text-sm font-medium" href="/solutions">Solutions</Link>
      <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-on-surface hover:bg-surface-container-low rounded-lg text-sm font-medium" href="/integrations">Integrations</Link>
      <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-on-surface hover:bg-surface-container-low rounded-lg text-sm font-medium" href="/pricing">Pricing</Link>
      <div className="pt-2 border-t border-surface-container flex flex-col gap-2">
        <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-on-surface hover:bg-surface-container-low rounded-lg text-sm font-medium" href="/login">Client Sign In</Link>
        <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-primary font-bold text-sm" href="/dashboard">SaaS Revenue Workspace</Link>
      </div>
    </div>
  )}
</header>


 {eco && flags ? (
 <>
 <EcosystemHero
 stats={eco.stats}
 links={{ courses: true, jobs: flags.publicJobs, organizations: flags.orgPages, trainees: flags.publicTrainees, events: flags.orgPages }}
 />
 <ActivityStrip items={eco.activity} skills={eco.skills} searchable={flags.orgPages} />
 <DiscoveryTabs
 view={eco}
 show={{ jobs: flags.publicJobs, organizations: flags.orgPages, trainees: flags.publicTrainees, events: flags.orgPages, videos: flags.orgPages && flags.education }}
 />
 <HowItWorks />
 {eco.hasSamples && <SampleNote />}
 <JoinChooser />
 </>
 ) : (
 <>
 {/* 2. Hero Section */}
 <section id="hero" className="section-wrap">
 <div className="hero">
 <div>
 <div className="eyebrow">
 <span className="eyebrow-dot" /> ZEEROCODES REVENUE ENGINE
 </div>
 <h1>
 Turn More of the Leads You Already Have Into <em>Sales.</em>
 </h1>
 <p className="hero-lede">
 Whether your leads come from Facebook Ads, website forms, or CSV uploads, pull them in instantly. Work them in real-time and hand verified prospects off to your closers or appointment setters before they go cold.
 </p>
 <div className="hero-actions">
 <button
 type="button"
 onClick={openAudit}
 className="button"
 >
 BOOK A REVENUE AUDIT <ArrowRight size={15} />
 </button>
 <Link href="/solutions" className="button button-ghost">
 See How It Works
 </Link>
 </div>
 <p className="hero-subtext" style={{ marginTop: '16px' }}>
 See where your leads are being lost. No obligation.
 </p>
 </div>

 {/* Hero Visual: 3D High-Definition Revenue Command Centre Mockup */}
 <div className="relative group w-full lg:max-w-xl xl:max-w-2xl">
   {/* Animated glow aura behind card */}
   <div className="absolute -inset-1 bg-gradient-to-r from-[#248277]/30 via-[#6AD6A7]/20 to-[#F5BF65]/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

   <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#090D12]">
     <img
       src="/images/closecraft_hero_dashboard.jpg"
       alt="Closecraft Revenue Command Centre Dashboard"
       className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
     />

     {/* Floating Telemetry Badge 1: Top-Left Revenue Metric */}
     <div className="absolute top-3 left-3 sm:top-5 sm:left-5 bg-[#0B1117]/90 backdrop-blur-md border border-[#6AD6A7]/30 rounded-2xl p-3 sm:p-3.5 shadow-xl animate-float-slow max-w-[220px]">
       <div className="flex items-center gap-1.5 mb-1">
         <span className="w-2 h-2 rounded-full bg-[#6AD6A7] animate-ping" />
         <span className="text-[10px] font-bold text-[#6AD6A7] uppercase tracking-wider">ENGINE ACTIVE</span>
       </div>
       <div className="text-xs sm:text-sm font-bold text-white">₦45,280,000 NGN</div>
       <div className="text-[10px] text-[#A7B7C7] mt-0.5">Live Pipeline Volume Tracked</div>
     </div>

     {/* Floating Telemetry Badge 2: Bottom-Right AI Next-Best-Action */}
     <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 bg-[#0B1117]/90 backdrop-blur-md border border-[#45BFAE]/40 rounded-2xl p-3 sm:p-3.5 shadow-xl animate-float-reverse max-w-[240px]">
       <div className="flex items-center justify-between gap-2 mb-1">
         <div className="flex items-center gap-1.5">
           <Zap size={13} className="text-[#F5BF65]" />
           <span className="text-[10px] font-bold text-[#45BFAE] uppercase tracking-wider">AI NEXT-BEST-ACTION</span>
         </div>
         <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#45BFAE]/20 text-[#45BFAE] font-bold">2.4s SLA</span>
       </div>
       <div className="text-xs sm:text-sm font-bold text-white">David — ABC Consulting</div>
       <div className="text-[10px] text-[#A7B7C7] mt-0.5">Assigned to Closer Somtochukwu O.</div>
     </div>

     {/* Floating Telemetry Badge 3: Bottom-Left Paystack Settlement */}
     <div className="hidden sm:block absolute bottom-5 left-5 bg-[#15352F]/90 backdrop-blur-md border border-[#6AD6A7]/40 rounded-2xl p-3 shadow-xl">
       <div className="flex items-center gap-2">
         <CheckCircle size={15} className="text-[#6AD6A7]" />
         <span className="text-xs font-bold text-white">₦1,250,000 Closed</span>
         <span className="text-[10px] text-[#6AD6A7] font-mono">PAYSTACK CLEARED</span>
       </div>
     </div>
   </div>

   {/* 4-Metric Command Strip Directly Below Hero Card */}
   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
     <div className="bg-[#111C26] border border-white/5 rounded-2xl p-3 text-center">
       <div className="text-xl font-black text-white">₦45M+</div>
       <div className="text-[10px] text-[#8A9CAE] mt-0.5">Pipeline Flow</div>
     </div>
     <div className="bg-[#111C26] border border-white/5 rounded-2xl p-3 text-center">
       <div className="text-xl font-black text-[#6AD6A7]">2.4s</div>
       <div className="text-[10px] text-[#8A9CAE] mt-0.5">Speed to Lead SLA</div>
     </div>
     <div className="bg-[#111C26] border border-white/5 rounded-2xl p-3 text-center">
       <div className="text-xl font-black text-[#45BFAE]">34.8%</div>
       <div className="text-[10px] text-[#8A9CAE] mt-0.5">Close Rate</div>
     </div>
     <div className="bg-[#111C26] border border-white/5 rounded-2xl p-3 text-center">
       <div className="text-xl font-black text-[#F5BF65]">100%</div>
       <div className="text-[10px] text-[#8A9CAE] mt-0.5">Audit Trail</div>
     </div>
   </div>
 </div>
 </div>
 </section>









 {/* STOP-SCROLL CONTINUOUS ANIMATED TICKER MARQUEE */}
 <div className="border-y border-white/5 bg-[#0D151D] py-3.5 overflow-hidden shadow-inner">
   <div className="animate-ticker text-xs font-mono text-[#A7B7C7] flex items-center gap-10">
     <span className="flex items-center gap-2">
       <span className="w-2 h-2 rounded-full bg-[#45BFAE] animate-ping" />
       <span className="text-white font-bold">REAL-TIME LEAD-TO-SALE OPERATING SYSTEM</span>
     </span>
     <span className="text-white/20">•</span>
     <span className="text-[#6AD6A7] font-bold">₦45,280,000+ IN PIPELINE REVENUE TRACKED</span>
     <span className="text-white/20">•</span>
     <span>AVERAGE SPEED TO LEAD: UNDER 2.4 SECONDS</span>
     <span className="text-white/20">•</span>
     <span className="text-[#F5BF65] font-bold">AI QUALIFICATION + HUMAN CLOSER HANDOFF</span>
     <span className="text-white/20">•</span>
     <span>POWERED BY ZEEROCODES AUTOMATION & DIGITAL SALES SCHOOL CLOSERS</span>
     <span className="text-white/20">•</span>
     <span className="text-[#45BFAE] font-bold">INSTANT PAYSTACK SETTLEMENTS & DEPOSIT TRACKING</span>
     <span className="text-white/20">•</span>
     <span>ZERO LEADS FALLING THROUGH THE CRACKS</span>
   </div>
 </div>

 {/* 4. Problem Section */}
 <section className="section-wrap problem-section">
 <div className="section-intro">
 <div className="eyebrow">THE REALITY</div>
 <h2>Your leads are not the problem.</h2>
 <p>
 The money is often lost after the lead comes in. When enquiry handling relies on ad-hoc memory, opportunities slip through the cracks every single day.
 </p>
 </div>

 <div className="problem-grid">
 <div className="problem-card">
 <span className="problem-card-num">GAP 01</span>
 <h3>LEADS GOING COLD</h3>
 <p>
 New leads sit in Facebook Ads or spreadsheets for hours. Nobody responds quickly enough while their buying intent is at its absolute highest.
 </p>
 </div>

 <div className="problem-card">
 <span className="problem-card-num">GAP 02</span>
 <h3>LOST FOLLOW-UP</h3>
 <p>
 The prospect showed genuine interest, but after one or two messages, the conversation goes cold.
 </p>
 </div>

 <div className="problem-card">
 <span className="problem-card-num">GAP 03</span>
 <h3>MISSED OPPORTUNITY</h3>
 <p>
 A qualified prospect is sitting in the pipeline, but nobody on the sales team knows what to do next.
 </p>
 </div>
 </div>

 <div className="problem-closer">
 <Check size={18} /> Zeerocodes is built to close those gaps.
 </div>
 </section>

 {/* 5. The Offer: One System. One Job. */}
 <section className="offer-section">
 <div className="section-wrap">
 <div className="eyebrow">THE OPERATING SYSTEM</div>
 <h2>One system. One job.</h2>
 <div className="offer-lead">Turn more of your existing leads into revenue.</div>

 <div className="offer-steps-grid">
 <div className="offer-step-card">
 <span>01. RESPOND</span>
 <h3>Real-Time Ingestion</h3>
 <p>Pull leads instantly from Facebook Ads or CSV and trigger automated, real-time responses before they go cold.</p>
 </div>

 <div className="offer-step-card">
 <span>02. QUALIFY</span>
 <h3>Filter Serious Fit</h3>
 <p>Identify who is actually worth your sales team's time and budget requirements.</p>
 </div>

 <div className="offer-step-card">
 <span>03. FOLLOW UP</span>
 <h3>Consistent Cadence</h3>
 <p>Keep opportunities moving instead of letting them disappear into silence.</p>
 </div>

 <div className="offer-step-card">
 <span>04. PRIORITISE</span>
 <h3>Clear Direction</h3>
 <p>Tell your team which opportunity needs immediate attention right now.</p>
 </div>

 <div className="offer-step-card">
 <span>05. CONVERT</span>
 <h3>Send to Closers</h3>
 <p>Seamlessly pass verified, warm leads directly to your appointment setters and closers so they can do what they do best.</p>
 </div>
 </div>
 </div>
 </section>

 {/* 6. "How It Works": Interactive 4-Stage Revenue Machine */}
 <section id="how-it-works" className="section-wrap how-it-works-section py-20">
   <div className="section-intro text-center mb-12">
     <div className="eyebrow justify-center">STEP-BY-STEP CONVERSION ENGINE</div>
     <h2>From Inbound Lead to Bank Settlement.</h2>
     <p className="max-w-2xl mx-auto">
       A disciplined progression connecting your paid traffic directly to qualified appointments and verified cash collections.
     </p>
   </div>

   {/* Two-Column Interactive Showcase */}
   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
     {/* Left Column: Interactive Stage Selector Pills & Details (5 cols) */}
     <div className="lg:col-span-5 space-y-3">
       {pipelineStages.map((stage, idx) => {
         const active = activePipelineStage === idx;
         return (
           <div
             key={stage.step}
             onClick={() => setActivePipelineStage(idx)}
             className={`p-5 rounded-2xl border transition-all cursor-pointer ${
               active
                 ? 'bg-[#111C26] border-[#45BFAE] shadow-lg shadow-[#45BFAE]/10 scale-[1.02]'
                 : 'bg-[#0B1117] border-white/5 hover:border-white/20'
             }`}
           >
             <div className="flex items-center justify-between mb-2">
               <span className="text-xs font-mono font-bold text-[#F5BF65]">STAGE {stage.step}</span>
               <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                 active ? 'bg-[#45BFAE]/20 text-[#45BFAE] font-bold' : 'bg-white/5 text-[#8A9CAE]'
               }`}>
                 {stage.tag}
               </span>
             </div>
             <h3 className={`text-base font-bold mb-1 ${active ? 'text-white' : 'text-[#A7B7C7]'}`}>
               {stage.title}
             </h3>
             <p className="text-xs text-[#8A9CAE] leading-relaxed">
               {stage.desc}
             </p>
             <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
               <span className="text-[#8A9CAE]">Benchmark Metric:</span>
               <span className="font-bold text-[#6AD6A7]">{stage.metric}</span>
             </div>
           </div>
         );
       })}
     </div>

     {/* Right Column: 3D Isometric Pipeline Asset (7 cols) */}
     <div className="lg:col-span-7 relative">
       <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#090D12] group">
         <img
           src="/images/closecraft_revenue_pipeline.jpg"
           alt="Closecraft 4-Stage Lead to Revenue Pipeline"
           className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
         />

         {/* Floating Active Stage Badge */}
         <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-[#0B1117]/90 backdrop-blur-md border border-[#45BFAE]/40 rounded-2xl p-4 shadow-xl max-w-xs">
           <div className="flex items-center gap-2 mb-1">
             <span className="w-2.5 h-2.5 rounded-full bg-[#45BFAE] animate-ping" />
             <span className="text-[10px] font-bold text-[#45BFAE] uppercase tracking-wider">ACTIVE ENGINE STAGE</span>
           </div>
           <div className="text-sm font-bold text-white">
             {pipelineStages[activePipelineStage].title}
           </div>
           <div className="text-xs text-[#A7B7C7] mt-1">
             Benchmark: <strong className="text-[#6AD6A7]">{pipelineStages[activePipelineStage].metric}</strong>
           </div>
         </div>

         {/* Bottom Callout */}
         <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#0B1117]/90 backdrop-blur-md border border-[#6AD6A7]/30 rounded-2xl p-3 shadow-xl">
           <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
             <CheckCircle size={14} className="text-[#6AD6A7]" />
             <span>Integrated with Paystack & Closecraft CRM</span>
           </div>
         </div>
       </div>
     </div>
   </div>
 </section>

 {/* 7. Revenue Leakage Funnel */}
 <section id="revenue-leakage" className="leakage-section">
 <div className="section-wrap">
 <div className="section-intro">
 <div className="eyebrow">REVENUE LEAKAGE AUDIT</div>
 <h2>Find the sales you're already losing.</h2>
 <p>
 Instead of immediately asking you to generate more leads, we first look at what is happening to the leads you already have.
 </p>
 </div>

 <div className="funnel-breakdown-card">
 <div className="funnel-table">
 <div className="funnel-row-item">
 <div className="funnel-row-stat">
 <strong>100 Leads</strong>
 <span>TOTAL ENQUIRIES</span>
 </div>
 <div className="funnel-progress-bar">
 <i style={{ width: '100%' }} />
 </div>
 <div className="funnel-row-gap" style={{ color: 'var(--muted)' }}>Initial Baseline</div>
 </div>

 <div className="funnel-row-item">
 <div className="funnel-row-stat">
 <strong>72 Contacted</strong>
 <span>REACHED IN TIME</span>
 </div>
 <div className="funnel-progress-bar">
 <i style={{ width: '72%' }} />
 </div>
 <div className="funnel-row-gap">28 lost to slow response</div>
 </div>

 <div className="funnel-row-item">
 <div className="funnel-row-stat">
 <strong>45 Engaged</strong>
 <span>ACTIVE DIALOGUE</span>
 </div>
 <div className="funnel-progress-bar">
 <i style={{ width: '45%' }} />
 </div>
 <div className="funnel-row-gap">27 ghosted / stalled</div>
 </div>

 <div className="funnel-row-item">
 <div className="funnel-row-stat">
 <strong>20 Qualified</strong>
 <span>FIT CONFIRMED</span>
 </div>
 <div className="funnel-progress-bar">
 <i style={{ width: '20%' }} />
 </div>
 <div className="funnel-row-gap">25 lost in qualification</div>
 </div>

 <div className="funnel-row-item">
 <div className="funnel-row-stat">
 <strong>8 Booked</strong>
 <span>MEETINGS ON CALENDAR</span>
 </div>
 <div className="funnel-progress-bar">
 <i style={{ width: '8%' }} />
 </div>
 <div className="funnel-row-gap">12 qualified but unbooked</div>
 </div>

 <div className="funnel-row-item" style={{ background: 'var(--accent-bg)', borderColor: '#cfe0cb' }}>
 <div className="funnel-row-stat">
 <strong style={{ color: 'var(--accent-deep)' }}>3 Won</strong>
 <span>CLOSED SALES</span>
 </div>
 <div className="funnel-progress-bar">
 <i style={{ width: '3%' }} />
 </div>
 <div className="funnel-row-gap" style={{ color: 'var(--accent-deep)' }}>5 lost post-meeting</div>
 </div>
 </div>

 <div className="funnel-footer-note">
 <span>* Illustrative example. Every gap is an opportunity to investigate.</span>
 <button
 type="button"
 onClick={openAudit}
 className="button button-small"
 >
 FIND MY REVENUE LEAKS <ArrowRight size={13} />
 </button>
 </div>
 </div>
 </div>
 </section>

 {/* 8. What Zeerocodes Does (4 Cards Only) */}
 <section className="section-wrap pillars-section">
 <div className="section-intro">
 <div className="eyebrow">CORE CAPABILITIES</div>
 <h2>What Zeerocodes does.</h2>
 <p>Four disciplined operational capabilities to prevent pipeline decay.</p>
 </div>

 <div className="pillars-grid">
 <div className="pillar-card">
 <div className="pillar-card-icon"><Clock size={20} /></div>
 <h3>FAST FOLLOW-UP</h3>
 <p>Respond to new opportunities before they go cold and establish immediate commercial dialogue.</p>
 </div>

 <div className="pillar-card">
 <div className="pillar-card-icon"><ShieldCheck size={20} /></div>
 <h3>SMART QUALIFICATION</h3>
 <p>Identify prospects that fit your offer, budget, and timeline so reps don't waste hours.</p>
 </div>

 <div className="pillar-card">
 <div className="pillar-card-icon"><TrendingUp size={20} /></div>
 <h3>SALES PRIORITY</h3>
 <p>Give your sales reps a clear, real-time answer to "who should I contact next?"</p>
 </div>

 <div className="pillar-card">
 <div className="pillar-card-icon"><Zap size={20} /></div>
 <h3>REVENUE RECOVERY</h3>
 <p>Find stalled opportunities in your pipeline that deserve another action before being lost.</p>
 </div>
 </div>
 </section>

 {/* 9. AI (One Short Block) */}
 <section className="section-wrap ai-block-section">
 <div className="ai-block-card">
 <div>
 <div className="eyebrow">HUMAN + MACHINE BALANCE</div>
 <h2>Let AI handle the repetition. Let your team handle the sale.</h2>
 <p>
 AI can respond, follow up and qualify. Your people handle conversations that require judgment, negotiation and closing.
 </p>
 </div>

 <div className="ai-division-box">
 <div className="ai-div-item">
 <strong>AI JOBS</strong>
 <span>Sub-minute greeting, qualification questionnaires, scheduled follow-up triggers.</span>
 </div>
 <div className="ai-div-item">
 <strong>REP JOBS</strong>
 <span>Discovery meetings, custom proposals, objection handling, final contract signing.</span>
 </div>
 </div>
 </div>
 </section>

 {/* 10. Product Screen: Realistic Opportunity Card */}
 <section className="section-wrap product-preview-section">
 <div className="product-preview-layout">
 <div>
 <div className="eyebrow">PRODUCT PREVIEW</div>
 <h2>What it actually looks like.</h2>
 <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: 1.6 }}>
 Every lead in your pipeline has a clear status, estimated deal value, SLA timer, and a deterministic <strong>Next Best Action</strong>.
 </p>
 <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '12px' }}>
 Your sales reps never have to guess who needs attention. The engine tells them exactly who to call, message, or escalate.
 </p>
 </div>

 <div className="opportunity-card-full">
 <div className="opp-full-header">
 <span>QUALIFIED OPPORTUNITY</span>
 <small>DEMO DATA</small>
 </div>

 <div className="opp-full-body">
 <h3>David — ABC Consulting</h3>
 <div className="opp-detail-table">
 <div>
 <small>ESTIMATED VALUE</small>
 <strong>₦2,000,000 NGN</strong>
 </div>
 <div>
 <small>BUYER INTENT</small>
 <strong>Ready to book</strong>
 </div>
 <div>
 <small>CURRENT STATE</small>
 <strong style={{ color: 'var(--accent)' }}>Qualified</strong>
 </div>
 <div>
 <small>SLA STATUS</small>
 <strong style={{ color: 'var(--warning)' }}>At risk (32m idle)</strong>
 </div>
 </div>
 </div>

 <div className="opp-nba-block">
 <small>NEXT BEST ACTION</small>
 <div className="opp-nba-callout">
 <div>
 <strong>CALL NOW</strong>
 <p>Why: High-value qualified lead with no appointment.</p>
 </div>
 <Link
 href="/dashboard"
 className="button button-small"
 style={{ whiteSpace: 'nowrap' }}
 >
 <Phone size={13} /> View SDR Queue
 </Link>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* 11. Who It Is For & Not For */}
 <section id="who-its-for" className="section-wrap audience-section">
 <div className="section-intro">
 <div className="eyebrow">TARGET FIT</div>
 <h2>Built for businesses that already have leads.</h2>
 <p>
 Zeerocodes is designed specifically for organizations that generate enquiries but lose deals due to operational follow-up friction.
 </p>
 </div>

 <div className="audience-grid">
 <div className="audience-card">
 <h3>SERVICE BUSINESSES</h3>
 <p>"Enquiries come in, but follow-up is inconsistent across busy weeks."</p>
 </div>

 <div className="audience-card">
 <h3>PROFESSIONAL SERVICES</h3>
 <p>"High-value prospects need disciplined qualification and structured follow-through."</p>
 </div>

 <div className="audience-card">
 <h3>SALES TEAMS</h3>
 <p>"Your reps need to know which opportunities deserve attention first."</p>
 </div>
 </div>

 {/* Who It Is Not For */}
 <div className="not-for-box">
 <div>
 <div className="eyebrow" style={{ color: '#88988a' }}>HONEST CRITERIA</div>
 <h3>This works best when you already have leads.</h3>
 </div>
 <div>
 <p style={{ margin: '0 0 8px', fontWeight: 650, fontSize: '13px', color: 'var(--ink)' }}>Not ideal if:</p>
 <ul>
 <li>You have no active lead flow</li>
 <li>You have no defined offer or pricing structure</li>
 <li>You expect software alone to magically close deals without sales execution</li>
 </ul>
 <p style={{ margin: '12px 0 0', fontWeight: 600, fontSize: '13px', color: 'var(--accent-deep)' }}>
 ✓ Ideal if: You already have enquiries and want to convert more of them.
 </p>
 </div>
 </div>
 </section>

 {/* 12. The Offer / Revenue Audit Form Section */}
 <section id="audit" className="audit-cta-section">
 <div className="section-wrap">
 <div className="audit-layout">
 <div className="audit-copy">
 <div className="eyebrow">START HERE</div>
 <h2>Start with a Revenue Audit.</h2>
 <p>
 We'll look at your current lead-to-sale process and identify where opportunities are being lost.
 </p>

 <ul className="audit-checklist">
 <li><Check size={18} /> Where leads are going cold</li>
 <li><Check size={18} /> Where follow-up is breaking down</li>
 <li><Check size={18} /> Where your sales team should focus first</li>
 </ul>

 <div className="pilot-tag">
 Followed by a structured 30-Day Revenue Pilot for qualified businesses.
 </div>

 <p style={{ fontSize: '13px', color: 'var(--dark-muted)', marginTop: '18px' }}>
 No obligation. We'll identify the gaps before recommending anything.
 </p>
 </div>

 {/* Inline Audit Form */}
 <div className="audit-form-card">
 <h3>Find Your Revenue Leaks</h3>
 <p>Submit your details to request a comprehensive revenue leak audit.</p>

 {auditSuccess ? (
 <div className="success-state">
 <div className="success-icon">
 <Check size={26} />
 </div>
 <h2>Audit Request Received</h2>
 <p>{auditSuccess}</p>
 <button
 type="button"
 onClick={() => setAuditSuccess(null)}
 className="button button-small"
 >
 Submit Another Request
 </button>
 </div>
 ) : (
 <form onSubmit={handleAuditSubmit}>
 {auditError && <p className="form-error">{auditError}</p>}

 <div className="form-row">
 <label>
 Name *
 <input name="name" required placeholder="Alex Rivera" />
 </label>
 <label>
 Business Name *
 <input name="business" required placeholder="Apex Consulting Ltd" />
 </label>
 </div>

 <div className="form-row">
 <label>
 Email *
 <input name="email" type="email" required placeholder="alex@apex.com" />
 </label>
 <label>
 Phone / WhatsApp *
 <input name="phone" required placeholder="+234 800 000 0000" />
 </label>
 </div>

 <label>
 Website (optional)
 <input name="website" placeholder="https://apex.com" />
 </label>

 <label>
 Approximate Monthly Lead Volume *
 <select name="monthlyLeadVolume" defaultValue="50–200 leads/mo">
 <option value="Under 50 leads/mo">Under 50 leads/mo</option>
 <option value="50–200 leads/mo">50–200 leads/mo</option>
 <option value="200–1,000 leads/mo">200–1,000 leads/mo</option>
 <option value="1,000+ leads/mo">1,000+ leads/mo</option>
 </select>
 </label>

 <label>
 Biggest Sales Problem *
 <select name="biggestSalesBottleneck" defaultValue="Slow response to inbound inquiries">
 <option value="Slow response to inbound inquiries">Slow response to inbound inquiries</option>
 <option value="Leads fall through cracks / unworked">Leads fall through cracks / inconsistent follow-up</option>
 <option value="Unqualified bookings wasting closer time">Unqualified bookings wasting closer time</option>
 <option value="Stalled deals with no follow-up triggers">Stalled deals with no follow-up triggers</option>
 <option value="No attribution from marketing spend to cash">No attribution from marketing spend to cash</option>
 </select>
 </label>

 <button
 type="submit"
 disabled={auditBusy}
 className="button button-full"
 style={{ marginTop: '8px' }}
 >
 {auditBusy ? 'Submitting Request…' : 'FIND MY REVENUE LEAKS'} <Send size={14} />
 </button>
 </form>
 )}
 </div>
 </div>
 </div>
 </section>

 {/* 11. Integrations */}
 <section id="integrations" className="section-wrap" style={{ marginTop: '60px', padding: '60px 0', borderTop: '1px solid var(--line)' }}>
 <div style={{ textAlign: 'center', marginBottom: '40px' }}>
 <div className="eyebrow">SEAMLESS INTEGRATIONS</div>
 <h2>Bring Your Leads From Anywhere</h2>
 <p style={{ color: 'var(--muted)', fontSize: '15px', marginTop: '12px', maxWidth: '600px', margin: '12px auto' }}>
 The Revenue Engine doesn't force you to change how you acquire leads. Plug it directly into your existing acquisition channels in minutes.
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container shadow-sm">
 <h3 className="font-medium font-bold text-lg mb-2 flex items-center gap-2">
 <span className="material-symbols-outlined text-primary">facebook</span> Facebook Lead Ads
 </h3>
 <p className="text-on-surface-variant text-sm mb-4">
 Stop downloading CSVs manually from Facebook Business Manager while leads go cold. 
 Our native webhook integration pulls new leads instantly into the Revenue Engine.
 </p>
 <ol className="text-sm text-on-surface-variant list-decimal pl-4 space-y-2">
 <li>Navigate to your Facebook Page Settings &gt; Lead Access.</li>
 <li>Add the Closecraft Webhook URL (found in your tenant settings).</li>
 <li>Every time a user submits your Facebook form, the Engine immediately qualifies them.</li>
 </ol>
 </div>
 <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container shadow-sm">
 <h3 className="font-medium font-bold text-lg mb-2 flex items-center gap-2">
 <span className="material-symbols-outlined text-primary">upload_file</span> Bulk CSV Upload
 </h3>
 <p className="text-on-surface-variant text-sm mb-4">
 Have an existing list of cold leads or a recent event roster? Upload them directly 
 into your workspace to initiate automated follow-up sequences.
 </p>
 <ol className="text-sm text-on-surface-variant list-decimal pl-4 space-y-2">
 <li>Prepare your CSV with headers: <code>Name</code>, <code>Email</code>, <code>Phone</code>.</li>
 <li>Go to your <strong>Leads</strong> workspace in the application.</li>
 <li>Click <strong>Add Lead &gt; Bulk Import</strong>, map your columns, and let the Engine process the batch.</li>
 </ol>
 </div>
 </div>
 </section>

 {/* 12. Pricing Section */}
 <section id="pricing" className="section-wrap" style={{ padding: '60px 0', borderTop: '1px solid var(--line)' }}>
 <div style={{ textAlign: 'center', marginBottom: '40px' }}>
 <div className="eyebrow">FLEXIBLE DEPLOYMENT</div>
 <h2>Affordable Revenue Scaling</h2>
 <p style={{ color: 'var(--muted)', fontSize: '15px', marginTop: '12px', maxWidth: '600px', margin: '12px auto' }}>
 Illustrative pricing models based on tenant usage. Choose the tier that matches your current sales volume. All plans include the core AI-triage engine.
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container flex flex-col">
 <h3 className="font-medium font-bold text-lg text-on-surface">Starter Engine</h3>
 <div className="mt-4 mb-6">
 <span className="text-3xl font-bold">₦15,000</span>
 <span className="text-on-surface-variant text-sm"> / month</span>
 </div>
 <ul className="space-y-3 mb-8 flex-1 text-sm text-on-surface-variant">
 <li className="flex items-start gap-2"><Check size={16} className="text-primary mt-0.5" /> Up to 500 leads/month</li>
 <li className="flex items-start gap-2"><Check size={16} className="text-primary mt-0.5" /> Automated Email Nurture</li>
 <li className="flex items-start gap-2"><Check size={16} className="text-primary mt-0.5" /> Basic Command Centre</li>
 </ul>
 <button onClick={openAudit} className="w-full py-2 rounded-lg border-2 border-primary text-primary font-bold hover:bg-primary-container transition-colors">Request Proposal</button>
 </div>
 
 <div className="bg-primary p-6 rounded-xl border border-primary text-on-primary shadow-md relative transform md:-translate-y-2 flex flex-col">
 <div className="absolute top-0 right-0 bg-accent text-ink text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">MOST POPULAR</div>
 <h3 className="font-medium font-bold text-lg text-on-primary">Growth Engine</h3>
 <div className="mt-4 mb-6">
 <span className="text-3xl font-bold">₦35,000</span>
 <span className="text-primary-container text-sm"> / month</span>
 </div>
 <ul className="space-y-3 mb-8 flex-1 text-sm text-on-primary/90">
 <li className="flex items-start gap-2"><Check size={16} className="text-accent mt-0.5" /> Up to 2,500 leads/month</li>
 <li className="flex items-start gap-2"><Check size={16} className="text-accent mt-0.5" /> Advanced AI Triage</li>
 <li className="flex items-start gap-2"><Check size={16} className="text-accent mt-0.5" /> WhatsApp Gateway Integration</li>
 <li className="flex items-start gap-2"><Check size={16} className="text-accent mt-0.5" /> Deal Pipeline Tracking</li>
 </ul>
 <button onClick={openAudit} className="w-full py-2 rounded-lg bg-accent text-ink font-bold hover:bg-[#b5f03d] transition-colors border border-transparent">Request Proposal</button>
 </div>

 <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container flex flex-col">
 <h3 className="font-medium font-bold text-lg text-on-surface">Enterprise Fleet</h3>
 <div className="mt-4 mb-6">
 <span className="text-3xl font-bold">₦75,000</span>
 <span className="text-on-surface-variant text-sm"> / month</span>
 </div>
 <ul className="space-y-3 mb-8 flex-1 text-sm text-on-surface-variant">
 <li className="flex items-start gap-2"><Check size={16} className="text-primary mt-0.5" /> Unlimited leads</li>
 <li className="flex items-start gap-2"><Check size={16} className="text-primary mt-0.5" /> Custom AI Models & Scoring</li>
 <li className="flex items-start gap-2"><Check size={16} className="text-primary mt-0.5" /> Dedicated SLA & Support</li>
 <li className="flex items-start gap-2"><Check size={16} className="text-primary mt-0.5" /> Multiple Workspaces</li>
 </ul>
 <button onClick={openAudit} className="w-full py-2 rounded-lg border-2 border-primary text-primary font-bold hover:bg-primary-container transition-colors">Request Proposal</button>
 </div>
 </div>
 </section>

 {/* 13. FAQ (5 Questions Only) */}
 <section id="faq" className="section-wrap faq-section">
 <div>
 <div className="eyebrow">COMMON QUESTIONS</div>
 <h2>Frequently Asked Questions</h2>
 <p style={{ color: 'var(--muted)', fontSize: '15px', marginTop: '12px' }}>
 Everything you need to know about how the Revenue Engine works.
 </p>
 </div>

 <div className="faq-list">
 <details open>
 <summary>Do I need more leads?</summary>
 <p>
 Not necessarily. Zeerocodes starts by helping you convert more of the leads you're already generating.
 </p>
 </details>

 <details>
 <summary>Does it replace my CRM?</summary>
 <p>
 No. Zeerocodes works around your existing lead and sales process.
 </p>
 </details>

 <details>
 <summary>Does it replace my sales team?</summary>
 <p>
 No. It helps your team know which opportunities need attention and what should happen next.
 </p>
 </details>

 <details>
 <summary>What does the system actually do?</summary>
 <p>
 It helps respond, follow up, qualify, prioritise and recover sales opportunities.
 </p>
 </details>

 <details>
 <summary>Can you guarantee more sales?</summary>
 <p>
 No. Results depend on lead quality, your offer, sales execution and market conditions. The system is designed to improve the process between lead and revenue.
 </p>
 </details>
 </div>
 </section>

 {/* 14. Final CTA */}
 <section className="final-cta">
 <div className="section-wrap">
 <h2>How many sales are sitting inside your existing leads?</h2>
 <p>
 Let's find out where your lead-to-sale process is leaking opportunities.
 </p>
 <div className="final-cta-actions">
 <button
 type="button"
 onClick={openAudit}
 className="button"
 >
 BOOK A REVENUE AUDIT <ArrowRight size={15} />
 </button>
 <Link
 href="/dashboard"
 className="button button-ghost"
 >
 Launch Operational Dashboard
 </Link>
 </div>
 </div>
 </section>

 {/* 15. Footer */}
 <footer className="site-footer">
 <div className="section-wrap">
 <div className="footer-grid">
 <div>
 <Link href="#hero" className="brand-lockup">
 <div className="brand-mark">Z</div>
 <div>
 <strong style={{ color: '#fff' }}>ZEEROCODES</strong>
 <small>REVENUE GROWTH ENGINE</small>
 </div>
 </Link>
 <p style={{ color: 'var(--dark-muted)', fontSize: '13px', marginTop: '14px', maxWidth: '320px' }}>
 "Turn more of the leads you already have into sales."
 </p>
 </div>

 <div>
 <small>WORKSPACES</small>
 <Link href="/dashboard" className="footer-button">Overview Control Plane</Link>
 <Link href="/inbox" className="footer-button">Lead Inbox</Link>
 <Link href="/leads" className="footer-button">Lead Sources & CSV</Link>
 <Link href="/pipeline" className="footer-button">SDR Work Queue</Link>
 <Link href="/dashboard" className="footer-button">Revenue Attribution</Link>
 <Link href="/settings" className="footer-button">Tenant Policy Settings</Link>
 </div>

 <div>
 <small>NAVIGATION</small>
 <Link href="/solutions">How It Works</Link>
 <Link href="/revenue-engine">Revenue Leakage</Link>
 <Link href="/platform">Who It's For</Link>
 <Link href="/#faq">FAQ</Link>
 <button onClick={openAudit} className="footer-button" style={{ display: 'inline-block', marginTop: '10px' }}>Book Revenue Audit</button>
 </div>
 </div>

 <div className="footer-bottom">
 <span>© {new Date().getFullYear()} Zeerocodes Revenue Growth Engine. All rights reserved.</span>
 <span>Turn more of the leads you already have into sales.</span>
 </div>
 </div>
 </footer>

 {/* Mobile Sticky Bottom CTA */}
 <div className="mobile-sticky-cta">
 <button
 type="button"
 onClick={openAudit}
 className="button button-full"
 >
 BOOK REVENUE AUDIT <ArrowRight size={14} />
 </button>
 </div>

 {/* 16. Revenue Leak Audit Modal */}
 {showAuditModal && (
 <div className="modal-backdrop">
 <div className="audit-modal">
 <button
 type="button"
 className="modal-close"
 onClick={() => {
 setShowAuditModal(false);
 setAuditSuccess(null);
 setAuditError(null);
 }}
 aria-label="Close modal"
 >
 <X size={20} />
 </button>

 {auditSuccess ? (
 <div className="success-state">
 <div className="success-icon">
 <Check size={26} />
 </div>
 <h2>Audit Request Received</h2>
 <p>{auditSuccess}</p>
 <button
 type="button"
 onClick={() => {
 setShowAuditModal(false);
 setAuditSuccess(null);
 }}
 className="button button-small"
 >
 Done
 </button>
 </div>
 ) : (
 <>
 <div className="eyebrow">ZEEROCODES REVENUE AUDIT</div>
 <h2>Find Your Revenue Leaks</h2>
 <p className="modal-copy">
 Tell us about your current sales process and lead flow. We'll identify where opportunities are slipping through the cracks.
 </p>

 {auditError && <p className="form-error">{auditError}</p>}

 <form onSubmit={handleAuditSubmit}>
 <div className="form-row">
 <label>
 Name *
 <input name="name" required placeholder="Alex Rivera" />
 </label>
 <label>
 Business Name *
 <input name="business" required placeholder="Apex Consulting Ltd" />
 </label>
 </div>

 <div className="form-row">
 <label>
 Email *
 <input name="email" type="email" required placeholder="alex@apex.com" />
 </label>
 <label>
 Phone / WhatsApp *
 <input name="phone" required placeholder="+234 800 000 0000" />
 </label>
 </div>

 <label>
 Website (optional)
 <input name="website" placeholder="https://apex.com" />
 </label>

 <label>
 Approximate Monthly Lead Volume *
 <select name="monthlyLeadVolume" defaultValue="50–200 leads/mo">
 <option value="Under 50 leads/mo">Under 50 leads/mo</option>
 <option value="50–200 leads/mo">50–200 leads/mo</option>
 <option value="200–1,000 leads/mo">200–1,000 leads/mo</option>
 <option value="1,000+ leads/mo">1,000+ leads/mo</option>
 </select>
 </label>

 <label>
 Biggest Sales Problem *
 <select name="biggestSalesBottleneck" defaultValue="Slow response to inbound inquiries">
 <option value="Slow response to inbound inquiries">Slow response to inbound inquiries</option>
 <option value="Leads fall through cracks / unworked">Leads fall through cracks / inconsistent follow-up</option>
 <option value="Unqualified bookings wasting closer time">Unqualified bookings wasting closer time</option>
 <option value="Stalled deals with no follow-up triggers">Stalled deals with no follow-up triggers</option>
 <option value="No attribution from marketing spend to cash">No attribution from marketing spend to cash</option>
 </select>
 </label>

 <button
 type="submit"
 disabled={auditBusy}
 className="button button-full"
 style={{ marginTop: '8px' }}
 >
 {auditBusy ? 'Submitting Request…' : 'FIND MY REVENUE LEAKS'} <Send size={14} />
 </button>
 </form>
 </>
 )}
 </div>
 </div>
 )}
 </>
 )}
 </div>
 );
}
