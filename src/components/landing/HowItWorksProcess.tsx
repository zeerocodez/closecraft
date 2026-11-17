'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Target, 
  MessageSquare, 
  Workflow, 
  GraduationCap, 
  ArrowRight, 
  Check, 
  Layers 
} from 'lucide-react';

interface HowItWorksProcessProps {
  onOpenServiceBrief?: (serviceKey?: any) => void;
}

export default function HowItWorksProcess({ onOpenServiceBrief }: HowItWorksProcessProps) {
  const stages = [
    {
      number: '01',
      tag: 'ACQUISITION',
      title: 'ATTRACT',
      tagline: 'Bring potential customers in.',
      description: 'Bring potential customers into your business through targeted advertising and compelling digital experiences.',
      icon: <Target className="w-5 h-5 text-blue-400" />,
      solutions: [
        'Facebook & Instagram Ads Management',
        'AI Image & Flyer Creation',
        'AI Video Creation',
        'Landing Page Design',
        'Video Sales Letter (VSL) Design'
      ],
      productBadge: 'Professional Services',
      ctaLabel: 'View Services',
      ctaHref: '#services-catalogue'
    },
    {
      number: '02',
      tag: 'ENGAGEMENT',
      title: 'CAPTURE & RESPOND',
      tagline: 'Give every enquiry a place.',
      description: 'Make sure customer enquiries have a dedicated place and receive immediate, contextual attention across WhatsApp and social channels.',
      icon: <MessageSquare className="w-5 h-5 text-[#45bfae]" />,
      solutions: [
        'Real-time Lead & Enquiry Ingestion',
        'Multichannel Inbox (WhatsApp, Meta, Web)',
        'Contextual AI-Powered Support',
        'Instant Team Lead Notification',
        'Customer Profile & History Context'
      ],
      productBadge: 'CloseCraft Software',
      ctaLabel: 'Explore CloseCraft',
      ctaHref: '/platform'
    },
    {
      number: '03',
      tag: 'EXECUTION',
      title: 'FOLLOW UP & CONVERT',
      tagline: 'Give every lead a next action.',
      description: 'Give every qualified opportunity a clear next action, assigned owner, strict SLA countdown timer, and structured closing playbook.',
      icon: <Workflow className="w-5 h-5 text-amber-400" />,
      solutions: [
        'Deterministic Next Best Action',
        'Strict Follow-Up SLA Countdowns',
        'Visual Sales Pipeline (Kanban & List)',
        'Revenue Leakage Detection',
        'Closer & Setter Workspaces'
      ],
      productBadge: 'Revenue Engine',
      ctaLabel: 'Explore Revenue Engine',
      ctaHref: '/revenue-engine'
    },
    {
      number: '04',
      tag: 'CAPABILITY',
      title: 'BUILD SALES CAPABILITY',
      tagline: 'Develop your revenue talent.',
      description: 'Develop the people responsible for turning conversations into paying customers through live practice and practical evaluation.',
      icon: <GraduationCap className="w-5 h-5 text-purple-400" />,
      solutions: [
        'Remote Appointment Setting',
        'Discovery & High-Ticket Closing',
        'Objection Handling Playbooks',
        'AI Buyer Roleplay Simulation',
        'Certified Setter & Closer Pool'
      ],
      productBadge: 'Digital Sales School',
      ctaLabel: 'Explore DSS',
      ctaHref: '/dss'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#080808] border-t border-[#1f1f1f] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
            <Layers size={12} />
            <span>THE CONNECTED REVENUE PROCESS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            From the First Enquiry to the Final Sale.
          </h2>

          <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
            CloseCraft connects the essential stages of your revenue process. From attracting potential customers to managing conversations, following up on leads and improving sales performance, we help your business create a more organised path from enquiry to purchase.
          </p>
        </div>

        {/* 4 Connected Stages: Horizontal Journey on Desktop, Vertical on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {stages.map((stage, idx) => (
            <div
              key={stage.number}
              className="rounded-3xl bg-[#101010] border border-[#1f1f1f] hover:border-[#248277]/60 transition-all p-6 sm:p-7 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:shadow-[#248277]/5 relative"
            >
              {/* Connector line for desktop (between items) */}
              {idx < stages.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-[#248277]/60">
                  <ArrowRight size={18} />
                </div>
              )}

              <div className="space-y-5">
                {/* Top Badge & Number */}
                <div className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-2xl bg-[#181818] border border-[#248277]/30 flex items-center justify-center text-[#45bfae] font-extrabold text-base">
                    {stage.number}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-bold uppercase tracking-wider">
                    {stage.tag}
                  </span>
                </div>

                {/* Title & Tagline */}
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-white group-hover:text-[#45bfae] transition-colors">
                    {stage.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#45bfae] uppercase tracking-wide">
                    {stage.tagline}
                  </p>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed pt-1">
                    {stage.description}
                  </p>
                </div>

                {/* Solutions List */}
                <div className="p-3.5 rounded-2xl bg-[#080808] border border-[#1f1f1f] space-y-1.5 text-xs text-[#a1a1aa]">
                  {stage.solutions.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-zinc-300 font-medium">
                      <Check size={13} className="text-[#45bfae] shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Badge & Link */}
              <div className="pt-5 border-t border-[#1f1f1f] mt-4 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
                  {stage.productBadge}
                </span>
                <Link
                  href={stage.ctaHref}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#45bfae] hover:text-white transition-colors"
                >
                  <span>{stage.ctaLabel}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 30-Second Bottom Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#101010] border border-[#248277]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a1a1aa] text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#45bfae] animate-pulse shrink-0" />
            <span>
              <strong className="text-white">One connected system:</strong> You can engage any stage independently (software alone, ads alone, or training alone) while maintaining an integrated revenue path.
            </span>
          </div>
          <Link
            href="#services-catalogue"
            className="text-xs font-bold text-[#45bfae] hover:underline shrink-0"
          >
            Explore Solutions &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

