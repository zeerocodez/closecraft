'use client';

import React, { useState } from 'react';
import {
  GROWTH_SERVICES,
  GrowthServiceKey,
  GrowthServiceDefinition,
} from '@/lib/growth/services';
import ProjectBriefModal from './ProjectBriefModal';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  Video,
  Image as ImageIcon,
  Layout,
  Layers,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

export default function GrowthServicesSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInitialService, setSelectedInitialService] = useState<GrowthServiceKey | null>(
    null
  );

  function handleOpenBrief(serviceKey?: GrowthServiceKey) {
    setSelectedInitialService(serviceKey || null);
    setModalOpen(true);
  }

  function getIcon(key: GrowthServiceKey) {
    switch (key) {
      case 'ADS_MANAGEMENT':
        return <Target className="w-5 h-5 text-[#45bfae]" />;
      case 'AI_FLYER_DESIGN':
        return <ImageIcon className="w-5 h-5 text-amber-400" />;
      case 'AI_VIDEO_CREATION':
        return <Video className="w-5 h-5 text-blue-400" />;
      case 'LANDING_PAGE_DESIGN':
        return <Layout className="w-5 h-5 text-emerald-400" />;
      case 'VSL_DESIGN':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  }

  const serviceKeys: GrowthServiceKey[] = [
    'ADS_MANAGEMENT',
    'AI_FLYER_DESIGN',
    'AI_VIDEO_CREATION',
    'LANDING_PAGE_DESIGN',
    'VSL_DESIGN',
  ];

  return (
    <>
      <section id="services-catalogue" className="py-24 bg-[#080808] border-t border-[#1f1f1f] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
              <Layers size={12} />
              INTRODUCTORY GROWTH SERVICES
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Commercial execution to acquire and convert customers.
            </h2>

            <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
              From targeted customer acquisition to persuasive creatives and high-converting pages, our growth services help connect every stage of your sales funnel.
            </p>

            <div className="inline-flex items-center gap-2 text-xs text-[#71717a] pt-1">
              <ShieldCheck size={14} className="text-[#45bfae]" />
              <span>
                Consultation-based services. Scope and pricing are determined after reviewing your project brief.
              </span>
            </div>
          </div>

          {/* 5 Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {serviceKeys.map((key) => {
              const service = GROWTH_SERVICES[key];

              return (
                <div
                  key={key}
                  className="rounded-3xl bg-[#101010] border border-[#1f1f1f] hover:border-[#248277]/50 transition-all p-7 sm:p-8 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:shadow-[#248277]/5"
                >
                  <div className="space-y-6">
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#181818] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {getIcon(key)}
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#a1a1aa] uppercase tracking-wider">
                        {service.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#45bfae] transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                        {service.outcomeDescription}
                      </p>
                    </div>

                    {/* Deliverables Checklist */}
                    <div className="space-y-2.5 pt-2 border-t border-[#1c1c1c]">
                      <p className="text-xs font-semibold text-white uppercase tracking-wider">
                        What You Receive:
                      </p>
                      <ul className="space-y-2">
                        {service.deliverables.slice(0, 4).map((d) => (
                          <li key={d} className="flex items-start gap-2 text-xs text-[#a1a1aa]">
                            <CheckCircle2 size={14} className="text-[#45bfae] shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Action Area */}
                  <div className="pt-6 mt-6 border-t border-[#1c1c1c] space-y-3">
                    <button
                      type="button"
                      onClick={() => handleOpenBrief(key)}
                      className="w-full py-3 px-4 rounded-xl bg-[#181818] hover:bg-[#248277] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer group/btn shadow-md active:scale-95"
                    >
                      <span>GET STARTED</span>
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-[11px] text-center text-[#71717a]">
                      Custom quotation based on project requirements
                    </p>
                  </div>
                </div>
              );
            })}

            {/* 6th Card: Multi-Service Custom Growth Package */}
            <div className="rounded-3xl bg-gradient-to-b from-[#141c1a] to-[#101010] border border-[#248277]/40 p-7 sm:p-8 flex flex-col justify-between shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#248277]/20 border border-[#248277]/40 flex items-center justify-center text-[#45bfae]">
                    <Sparkles size={24} />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#248277]/20 border border-[#248277]/40 text-[#45bfae] uppercase tracking-wider font-bold">
                    Multi-Service Bundle
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Combined Revenue Growth Funnel
                  </h3>
                  <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                    Need Facebook ads combined with a high-converting landing page, AI videos, and VSL presentation? Combine multiple services into one streamlined project.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[#1c1c1c]">
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">
                    Package Benefits:
                  </p>
                  <ul className="space-y-2 text-xs text-[#a1a1aa]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-[#45bfae] shrink-0 mt-0.5" />
                      <span>Single consolidated project brief and single dedicated point of contact</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-[#45bfae] shrink-0 mt-0.5" />
                      <span>Unified creative direction across ads, landing pages, and videos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-[#45bfae] shrink-0 mt-0.5" />
                      <span>Coordinated milestone reviews with transparent delivery SLAs</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#1c1c1c] space-y-3">
                <button
                  type="button"
                  onClick={() => handleOpenBrief()}
                  className="w-full py-3 px-4 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#248277]/25 active:scale-95"
                >
                  <MessageSquare size={14} />
                  <span>START CUSTOM BRIEF</span>
                  <ArrowRight size={14} />
                </button>
                <p className="text-[11px] text-center text-[#71717a]">
                  Select multiple services in our interactive brief
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Brief Modal */}
      <ProjectBriefModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialServiceKey={selectedInitialService}
      />
    </>
  );
}
