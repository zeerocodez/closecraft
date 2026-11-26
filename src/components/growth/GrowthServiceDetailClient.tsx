'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Target, 
  Image as ImageIcon, 
  Video, 
  Layout, 
  Sparkles,
  Workflow,
  MessageSquare,
  GraduationCap,
  Clock,
  HelpCircle
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { GROWTH_SERVICES, GrowthServiceKey, GrowthServiceDefinition } from '@/lib/growth/services';
import ProjectBriefModal from '@/components/growth/ProjectBriefModal';
import JsonLd from '@/components/seo/JsonLd';
import { getServiceJsonLd } from '@/lib/seo/schema';

interface GrowthServiceDetailClientProps {
  serviceKey: GrowthServiceKey;
  categoryBadge: string;
  problemStatement: string;
  targetAudience: string;
  workflowExplanation: string;
  nextStepCopy: string;
}

export default function GrowthServiceDetailClient({
  serviceKey,
  categoryBadge,
  problemStatement,
  targetAudience,
  workflowExplanation,
  nextStepCopy,
}: GrowthServiceDetailClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const service = GROWTH_SERVICES[serviceKey];

  const serviceJsonLd = getServiceJsonLd({
    name: service.name,
    description: service.outcomeDescription,
    url: `/services/${serviceKey.toLowerCase().replace(/_/g, '-')}`,
    serviceType: service.badge,
    category: 'Commercial Growth Services',
  });

  function getIcon(key: GrowthServiceKey) {
    switch (key) {
      case 'ADS_MANAGEMENT':
        return <Target className="w-8 h-8 text-[#45bfae]" />;
      case 'AI_FLYER_DESIGN':
        return <ImageIcon className="w-8 h-8 text-amber-400" />;
      case 'AI_VIDEO_CREATION':
        return <Video className="w-8 h-8 text-blue-400" />;
      case 'LANDING_PAGE_DESIGN':
        return <Layout className="w-8 h-8 text-emerald-400" />;
      case 'VSL_DESIGN':
        return <Sparkles className="w-8 h-8 text-purple-400" />;
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#248277] selection:text-white font-sans antialiased">
      <JsonLd data={serviceJsonLd} />
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center group" aria-label="CloseCraft HQ Home">
            <Logo variant="full" size="md" alt="CloseCraft HQ" />
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              href="/services" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-xl bg-[#101010] border border-[#1f1f1f]"
            >
              &larr; Services Directory
            </Link>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all shadow-md shadow-[#248277]/25 cursor-pointer"
            >
              GET STARTED
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Service Hero */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
            <Layers size={12} />
            <span>STAGE 1: ATTRACT &middot; {categoryBadge}</span>
          </div>

          <div className="flex justify-center pt-2">
            <div className="w-16 h-16 rounded-2xl bg-[#141416] border border-white/10 flex items-center justify-center shadow-lg">
              {getIcon(serviceKey)}
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            {service.name}
          </h1>

          <p className="text-lg sm:text-xl text-[#a1a1aa] leading-relaxed">
            {service.tagline}
          </p>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {service.outcomeDescription}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm shadow-xl shadow-[#248277]/25 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>GET STARTED</span>
              <ArrowRight size={16} />
            </button>
            <Link
              href="/platform"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#141416] hover:bg-[#1a1a1d] text-white border border-[#222226] font-semibold text-sm transition-all inline-flex items-center justify-center gap-2"
            >
              <span>See Follow-Up Workflow</span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-zinc-400 pt-2">
            <ShieldCheck size={14} className="text-[#45bfae]" />
            <span>Consultation-based scoping &middot; Directly connected to your CloseCraft CRM workspace.</span>
          </div>
        </div>

        {/* The 4-Stage Revenue System Connection */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#248277]/20 text-[#45bfae] font-bold uppercase tracking-wider">
              THE COMPLETE REVENUE LOOP
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Part of One Connected Growth System
            </h2>
            <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
              Attracting potential customers is only the first step. When new enquiries arrive, CloseCraft ensures no lead is lost to forgotten follow-up.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#141416] border-2 border-[#248277] space-y-2">
              <span className="text-[10px] font-mono text-[#45bfae] font-bold block uppercase">
                01. ATTRACT (THIS SERVICE)
              </span>
              <p className="text-xs font-semibold text-white">{service.name}</p>
              <p className="text-[11px] text-zinc-400">Generate qualified inbound buyer interest across digital touchpoints.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#101010] border border-[#1f1f1f] space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 font-bold block uppercase">
                02. CAPTURE &amp; RESPOND
              </span>
              <p className="text-xs font-semibold text-white">CloseCraft Platform</p>
              <p className="text-[11px] text-zinc-400">Centralize WhatsApp, Meta ads, and web leads into one rapid-response inbox.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#101010] border border-[#1f1f1f] space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 font-bold block uppercase">
                03. FOLLOW UP &amp; CONVERT
              </span>
              <p className="text-xs font-semibold text-white">Revenue Engine</p>
              <p className="text-[11px] text-zinc-400">Allocate deterministic Next Best Actions and enforce strict response deadline (SLA) timers.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#101010] border border-[#1f1f1f] space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 font-bold block uppercase">
                04. BUILD SALES CAPABILITY
              </span>
              <p className="text-xs font-semibold text-white">Digital Sales School</p>
              <p className="text-[11px] text-zinc-400">Equip your team or certified setters and closers with proven closing skills.</p>
            </div>
          </div>
        </div>

        {/* 5 Core Questions */}
        <div className="space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Understanding {service.name}
            </h2>
            <p className="text-sm text-[#a1a1aa]">
              Everything you need to know about our scope, process, and deliverables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. What problem does this solve? */}
            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-bold uppercase">
                1. THE PROBLEM
              </span>
              <h3 className="text-lg font-bold text-white">What problem does this solve?</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                {problemStatement}
              </p>
            </div>

            {/* 2. Who is it for? */}
            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold uppercase">
                2. TARGET AUDIENCE
              </span>
              <h3 className="text-lg font-bold text-white">Who is this service for?</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                {targetAudience}
              </p>
            </div>

            {/* 3. How does it work? */}
            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold uppercase">
                3. HOW IT WORKS
              </span>
              <h3 className="text-lg font-bold text-white">How does execution work?</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                {workflowExplanation}
              </p>
            </div>

            {/* 4. What does the customer receive? */}
            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase">
                4. DELIVERABLES
              </span>
              <h3 className="text-lg font-bold text-white">What does the customer receive?</h3>
              <div className="space-y-2 pt-1 text-xs text-zinc-300">
                {service.deliverables.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-[#45bfae] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. What is the next step? */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0d1716] border border-[#248277]/60 text-center space-y-4">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#248277]/20 text-[#45bfae] font-bold uppercase">
              5. NEXT STEP
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Ready to begin?
            </h3>
            <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-xl mx-auto leading-relaxed">
              {nextStepCopy}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#248277]/25 cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>GET STARTED</span>
                <ArrowRight size={16} />
              </button>
              <Link
                href="/services"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#181818] hover:bg-[#202020] text-zinc-300 font-semibold text-xs sm:text-sm border border-white/10 text-center"
              >
                Browse All Services
              </Link>
            </div>
          </div>
        </div>

        {/* Full Deliverables Detail Cards */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-white">
              Scope &amp; Included Activities
            </h2>
            <p className="text-sm text-[#a1a1aa]">
              Everything included in our professional execution package.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {service.deliverables.map((deliverable, index) => (
              <div 
                key={deliverable}
                className="p-6 rounded-2xl bg-[#101010] border border-[#1f1f1f] space-y-3"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1a1a1d] border border-white/10 flex items-center justify-center text-[#45bfae] text-xs font-mono font-bold">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h4 className="text-sm font-bold text-white">{deliverable}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Engineered and verified according to CloseCraft revenue standards for maximum commercial impact.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Transparent Scoping Notice */}
        <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-white">Need multiple services or custom campaign sizing?</h4>
            <p className="text-xs text-[#a1a1aa]">
              You can select multiple services in your project brief for a consolidated commercial proposal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#1a1a1d] hover:bg-[#25252a] text-white border border-white/10 text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            GET STARTED
          </button>
        </div>
      </main>

      {/* Project Brief Modal */}
      <ProjectBriefModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialServiceKey={serviceKey}
      />
    </div>
  );
}

