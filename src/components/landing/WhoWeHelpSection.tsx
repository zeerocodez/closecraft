'use client';

import React from 'react';
import {
  Building2,
  GraduationCap,
  CheckCircle2,
  Stethoscope,
  Sun,
  Briefcase,
  Scale,
  Car,
  Plane,
  MapPin,
  Wrench,
  Users,
  Video,
} from 'lucide-react';

const PRIMARY_MARKETS = [
  {
    name: 'Real Estate & Property',
    badge: 'PRIMARY LAUNCH MARKET · LAGOS FIRST',
    headline: 'Stop losing property buyers because nobody followed up.',
    description:
      'Property developers, brokerages, and land firms spend heavily on Meta and Instagram ads only to leave high-ticket buyer enquiries waiting hours in WhatsApp. CloseCraft HQ triages every enquiry immediately, qualifies budget and preferred Lekki/Ikoyi/Mainland location, schedules inspections with human closers, and recovers cold buyers automatically.',
    highlights: [
      'Instant WhatsApp & ad enquiry capture with human escalation',
      'Inspection scheduling & automated reminder workflows',
      'Reactivate dormant buyers from previous property launches',
    ],
    icon: Building2,
  },
  {
    name: 'Education & Training Institutes',
    badge: 'PRIMARY LAUNCH MARKET · LAGOS FIRST',
    headline: 'Turn more student enquiries into completed registrations.',
    description:
      'Training academies, tech schools, and executive institutes get flooded with fee and timetable questions before every cohort. CloseCraft HQ sends clear programme details, scores enrolment readiness, hands fee objections to admissions advisors, and keeps prospective students warm until payment.',
    highlights: [
      '24/7 AI enquiry qualification for cohort fit & fee readiness',
      'Deterministic advisor handoff before registration deadlines',
      'Automated follow-up until verified enrolment receipt',
    ],
    icon: GraduationCap,
  },
];

const ALSO_BUILT_FOR = [
  { name: 'Service Businesses', desc: 'Home, beauty, fitness, events, and local service firms turning inbound chats into booked jobs.', icon: Wrench },
  { name: 'Consultants & Agencies', desc: 'Strategy, HR, B2B, and marketing consultants tracking discovery calls through to signed retainers.', icon: Briefcase },
  { name: 'Coaches & Mentors', desc: 'Business, executive, and career coaches nurturing applicants cleanly until cohort or 1-on-1 enrolment.', icon: Users },
  { name: 'Remote Creators & Course Sellers', desc: 'Digital creators, solo experts, and online educators converting social DMs and link-in-bio enquiries.', icon: Video },
  { name: 'Clinics & Diagnostics', desc: 'Convert consultation enquiries into booked patient appointments.', icon: Stethoscope },
  { name: 'Solar & Clean Energy', desc: 'Follow up seamlessly on site audits and system quotes.', icon: Sun },
  { name: 'Luxury Retail & Auto', desc: 'Keep showroom and high-ticket vehicle buyers engaged.', icon: Car },
  { name: 'Legal & Advisory', desc: 'Respond cleanly and manage confidential consultations.', icon: Scale },
  { name: 'Travel & Hospitality', desc: 'Turn tour, visa, and booking chats into confirmed orders.', icon: Plane },
];

export function WhoWeHelpSection() {
  return (
    <section id="who-we-help" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#1e1e1e] bg-[#070709]">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#248277]/15 border border-[#248277]/30 text-[#45bfae] text-[11px] font-mono font-bold uppercase tracking-wider">
            <MapPin size={13} />
            <span>Built for High-Enquiry Growth Markets — Starting in Lagos, Nigeria</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-white">
            Who CloseCraft HQ Helps First
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Designed around WhatsApp-heavy, high-consideration sales cycles where delayed follow-up silently drains marketing ROI.
          </p>
        </div>

        {/* 2 Primary Launch Verticals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {PRIMARY_MARKETS.map((market) => {
            const Icon = market.icon;
            return (
              <div
                key={market.name}
                className="p-7 rounded-3xl bg-gradient-to-b from-[#121918] to-[#0c0d10] border border-[#248277]/45 space-y-5 shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent-lime/15 border border-accent-lime/30 flex items-center justify-center text-accent-lime">
                    <Icon size={24} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-accent-lime/15 border border-accent-lime/30 text-accent-lime text-[10px] font-mono font-extrabold uppercase tracking-wider">
                    {market.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">{market.name}</p>
                  <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white leading-snug">
                    {market.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{market.description}</p>
                </div>

                <ul className="space-y-2 pt-2 border-t border-white/10 text-xs text-zinc-200">
                  {market.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-accent-lime shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Secondary Audience Grid: ALSO BUILT FOR */}
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500">
              ALSO BUILT FOR
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ALSO_BUILT_FOR.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="p-4 rounded-2xl bg-[#101014] border border-[#202026] flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a22] flex items-center justify-center text-[#45bfae] shrink-0">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhoWeHelpSection;
