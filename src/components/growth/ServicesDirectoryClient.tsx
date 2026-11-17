'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Target, 
  Image as ImageIcon, 
  Video, 
  Layout, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  MessageSquare,
  Clock
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { GROWTH_SERVICES, GrowthServiceKey } from '@/lib/growth/services';
import ProjectBriefModal from '@/components/growth/ProjectBriefModal';

export default function ServicesDirectoryClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInitialService, setSelectedInitialService] = useState<GrowthServiceKey | null>(null);

  function handleOpenBrief(serviceKey?: GrowthServiceKey) {
    setSelectedInitialService(serviceKey || null);
    setModalOpen(true);
  }

  const serviceList: { key: GrowthServiceKey; href: string; icon: React.ReactNode }[] = [
    { key: 'ADS_MANAGEMENT', href: '/services/ads-management', icon: <Target className="w-6 h-6 text-[#45bfae]" /> },
    { key: 'AI_FLYER_DESIGN', href: '/services/ai-flyers', icon: <ImageIcon className="w-6 h-6 text-amber-400" /> },
    { key: 'AI_VIDEO_CREATION', href: '/services/ai-video', icon: <Video className="w-6 h-6 text-blue-400" /> },
    { key: 'LANDING_PAGE_DESIGN', href: '/services/landing-pages', icon: <Layout className="w-6 h-6 text-emerald-400" /> },
    { key: 'VSL_DESIGN', href: '/services/vsl-design', icon: <Sparkles className="w-6 h-6 text-purple-400" /> },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#248277] selection:text-white font-sans antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center group" aria-label="CloseCraft HQ Home">
            <Logo variant="full" size="md" alt="CloseCraft HQ" />
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-xl bg-[#101010] border border-[#1f1f1f]"
            >
              &larr; Back to Home
            </Link>
            <button
              type="button"
              onClick={() => handleOpenBrief()}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all shadow-md shadow-[#248277]/25 cursor-pointer"
            >
              Request Services
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Hero */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
            <Layers size={12} />
            <span>GROWTH SERVICES DIRECTORY</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Commercial Execution to Acquire &amp; Convert Customers.
          </h1>

          <p className="text-lg sm:text-xl text-[#a1a1aa] leading-relaxed">
            Our professional growth services help you execute your acquisition strategy with precision. From targeted Meta advertising to high-converting landing pages and video sales letters, we provide the assets your sales team needs.
          </p>

          <div className="inline-flex items-center gap-2 text-xs text-zinc-400 pt-1">
            <ShieldCheck size={14} className="text-[#45bfae]" />
            <span>Consultation-based execution &middot; Select one or combine multiple services in a single brief.</span>
          </div>
        </div>

        {/* 5 Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {serviceList.map(({ key, href, icon }) => {
            const service = GROWTH_SERVICES[key];
            return (
              <div
                key={key}
                className="rounded-3xl bg-[#101010] border border-[#1f1f1f] hover:border-[#248277]/50 transition-all p-7 sm:p-8 flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#181818] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {icon}
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#a1a1aa] uppercase tracking-wider">
                      {service.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#45bfae] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed">
                      {service.outcomeDescription}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#1f1f1f]">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Deliverables Include:
                    </span>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {service.deliverables.slice(0, 3).map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#45bfae] shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#1f1f1f] mt-6 flex items-center justify-between gap-3">
                  <Link
                    href={href}
                    className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Details &rarr;
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenBrief(key)}
                    className="py-2.5 px-4 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-md shadow-[#248277]/20 cursor-pointer"
                  >
                    <span>GET STARTED</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5 Core Questions for Professional Services */}
        <div className="space-y-12 pt-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              How Our Professional Services Work
            </h2>
            <p className="text-sm text-[#a1a1aa]">
              A predictable, verified execution model from project brief to live delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-bold uppercase">
                1. THE PROBLEM
              </span>
              <h3 className="text-lg font-bold text-white">What problem do these services solve?</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                Many businesses understand what they need—more leads, better creative angles, high-converting pages—but lack the in-house creative and media buying bandwidth to execute. Our services provide expert execution without expensive agency retainers.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold uppercase">
                2. TARGET AUDIENCE
              </span>
              <h3 className="text-lg font-bold text-white">Who are these services for?</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                For growth-minded founders, sales leaders, and marketing teams who want tested creative assets and managed paid acquisition that connect directly to their CloseCraft follow-up workflow.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold uppercase">
                3. HOW IT WORKS
              </span>
              <h3 className="text-lg font-bold text-white">What is the consultation &amp; delivery workflow?</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                Select your required services &rarr; complete a tailored project brief &rarr; receive a unique reference code &rarr; connect on official WhatsApp with your assigned specialist &rarr; review and approve a scoped commercial proposal &rarr; track milestones in your client portal.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase">
                4. DELIVERABLES
              </span>
              <h3 className="text-lg font-bold text-white">What does the customer receive?</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                Production-ready advertising creatives, conversion-engineered landing pages, high-definition promotional videos, and fully managed Meta ad campaigns configured to sync directly into CloseCraft.
              </p>
            </div>
          </div>

          {/* 5. What is the next step? */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0d1716] border border-[#248277]/60 text-center space-y-4">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#248277]/20 text-[#45bfae] font-bold uppercase">
              5. NEXT STEP
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Ready to launch your growth project?
            </h3>
            <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-xl mx-auto leading-relaxed">
              Complete our short project brief. Select one or more services to receive a consolidated review and proposal.
            </p>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => handleOpenBrief()}
                className="py-3.5 px-8 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#248277]/25 cursor-pointer inline-flex items-center gap-2"
              >
                <span>GET STARTED WITH A BRIEF</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Project Brief Modal */}
      <ProjectBriefModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialServiceKey={selectedInitialService}
      />
    </div>
  );
}

