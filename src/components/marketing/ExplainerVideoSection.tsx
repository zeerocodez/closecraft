"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface ExplainerVideoSectionProps {
  onOpenAudit?: () => void;
}

export default function ExplainerVideoSection({ onOpenAudit }: ExplainerVideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState<'video' | 'interactive'>('video');
  const [simStep, setSimStep] = useState<number>(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const chapters = [
    { title: "1. Revenue Leakage", time: 0, label: "0:00" },
    { title: "2. Ingestion & Priority", time: 15, label: "0:15" },
    { title: "3. Next-Best-Action", time: 30, label: "0:30" },
    { title: "4. Closing the Deal", time: 45, label: "0:45" },
  ];

  const jumpTo = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const simulationSteps = [
    {
      stage: "1. INCOMING ENQUIRY",
      badge: "Lead Ingestion",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      title: "Sarah Davies · FinTech Africa",
      details: "Enquiry submitted via Website Form · Requested 15-seat deployment",
      dealSize: "₦2,500,000 NGN",
      stateDesc: "Enquiry lands in Closecraft instantly. Zero spreadsheet delay.",
      actionIcon: Layers,
    },
    {
      stage: "2. QUALIFICATION & SLA",
      badge: "SLA Activated",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      title: "Assigned to Closer: Somtochukwu O.",
      details: "Qualification Score: 94% Fit · Urgent Timing (Q4 roll-out)",
      dealSize: "SLA: 30-min first touch",
      stateDesc: "Strict follow-up SLA begins countdown. Manager alerted if touch is missed.",
      actionIcon: Clock,
    },
    {
      stage: "3. AI NEXT-BEST-ACTION",
      badge: "AI Recommended",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      title: "Action: Schedule Commercial Discovery Call",
      details: "Context: Buyer requested pricing for 15-person team with active Q4 initiative.",
      dealSize: "Channel: WhatsApp / Direct Phone",
      stateDesc: "Closer receives pre-drafted contextual talking points and verified pricing bounds.",
      actionIcon: Sparkles,
    },
    {
      stage: "4. DEAL CLOSED & WON",
      badge: "Revenue Secured",
      badgeColor: "bg-[#248277]/25 text-[#45bfae] border-[#248277]/40",
      title: "Closed Won · ₦2,500,000 NGN",
      details: "Attribution: Website Form · Sales Cycle: 48 hours · 0 leaked follow-ups",
      dealSize: "₦2.5M Added to Pipeline",
      stateDesc: "Payment verified, CRM updated, full audit trail preserved for manager review.",
      actionIcon: CheckCircle2,
    },
  ];

  return (
    <section id="explainer-video" className="section-wrap py-16 sm:py-24 border-t border-white/10 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-[#248277]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#14A7F7]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#248277]/20 border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#45bfae] animate-pulse" />
            PRODUCT EXPLAINER &amp; WALKTHROUGH
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            See how Closecraft stops revenue leakage in 60 seconds.
          </h2>

          <p className="text-base sm:text-lg text-[#A7B7C7] leading-relaxed">
            Watch our explainer video or simulate how an inbound enquiry gets assigned, prioritized, and closed with zero missed follow-ups.
          </p>

          {/* Mode Switcher */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#090D12] border border-white/15 shadow-inner">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'video'
                  ? 'bg-[#248277] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Play size={16} className={activeTab === 'video' ? 'fill-white' : ''} />
              <span>Watch Explainer Video</span>
            </button>
            <button
              onClick={() => setActiveTab('interactive')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'interactive'
                  ? 'bg-[#248277] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles size={16} />
              <span>Interactive Lead Simulator</span>
            </button>
          </div>
        </div>

        {/* TAB 1: VIDEO PLAYER */}
        {activeTab === 'video' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="relative rounded-3xl overflow-hidden border border-[#248277]/40 bg-black shadow-2xl group">
              <video
                ref={videoRef}
                src="/videos/closecraft-onboarding.mp4"
                playsInline
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full aspect-video object-contain"
              />

              {/* Big Center Play Overlay when paused */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/30"
                >
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-24 h-24 rounded-full bg-[#248277]/40 animate-ping" />
                    <div className="w-20 h-20 rounded-full bg-[#248277] hover:bg-[#1f6f65] text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
                      <Play size={36} className="ml-1 fill-white" />
                    </div>
                  </div>
                  <span className="mt-4 text-sm font-bold text-white tracking-wide bg-black/60 px-4 py-1.5 rounded-full border border-white/20">
                    Click to Play Closecraft Explainer (60s)
                  </span>
                </div>
              )}

              {/* Video Bottom Floating Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex items-center justify-between opacity-90 transition-opacity">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <span className="text-xs text-[#A7B7C7] font-mono hidden sm:inline">
                    Closecraft Revenue Engine Walkthrough
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/signup"
                    className="px-3.5 py-1.5 rounded-lg bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all shadow-md"
                  >
                    Start 7-Day Free Trial &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Video Chapters bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2">
              {chapters.map((ch) => (
                <button
                  key={ch.title}
                  onClick={() => jumpTo(ch.time)}
                  className="p-3 rounded-xl bg-[#090D12] border border-white/10 hover:border-[#248277]/60 hover:bg-[#111C26] text-left transition-all group"
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

        {/* TAB 2: INTERACTIVE LEAD JOURNEY SIMULATOR */}
        {activeTab === 'interactive' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#090D12] border border-[#248277]/40 shadow-2xl space-y-6 animate-in fade-in duration-300">
            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-2 pb-4 border-b border-white/10">
              {simulationSteps.map((s, idx) => (
                <button
                  key={s.stage}
                  onClick={() => setSimStep(idx)}
                  className={`p-2 rounded-xl text-left transition-all ${
                    simStep === idx
                      ? 'bg-[#248277]/20 border border-[#248277]/60'
                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }`}
                >
                  <span className={`text-[10px] font-mono block ${simStep === idx ? 'text-[#45bfae] font-bold' : 'text-gray-500'}`}>
                    STEP 0{idx + 1}
                  </span>
                  <span className={`text-xs font-semibold truncate block mt-0.5 ${simStep === idx ? 'text-white' : 'text-gray-400'}`}>
                    {s.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Simulation Card */}
            {(() => {
              const current = simulationSteps[simStep];
              const Icon = current.actionIcon;
              return (
                <div className="p-6 rounded-2xl bg-[#111C26] border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
                        <Icon size={20} />
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded border font-bold ${current.badgeColor}`}>
                          {current.stage}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1">{current.title}</h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#45bfae]">{current.dealSize}</span>
                    </div>
                  </div>

                  <p className="text-sm text-[#A7B7C7]">{current.details}</p>

                  <div className="p-3.5 rounded-xl bg-[#0B1117] border border-white/10 flex items-center gap-3 text-xs text-emerald-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>{current.stateDesc}</span>
                  </div>

                  {/* Simulator Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <button
                      onClick={() => setSimStep((prev) => (prev + 1) % simulationSteps.length)}
                      className="px-4 py-2 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold inline-flex items-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <span>Next Step ({simStep < 3 ? `0${simStep + 2}` : 'Replay'})</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => setSimStep(0)}
                      className="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw size={12} />
                      <span>Reset Demo</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 3 Value Highlights Below Explainer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-[#0B1117] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#45bfae]">
              <Clock size={18} />
              <span className="font-bold text-sm text-white">Strict SLA Timers</span>
            </div>
            <p className="text-xs text-[#A7B7C7] leading-relaxed">
              Every qualified enquiry triggers an active follow-up timer so no buyer sits uncontacted in a queue.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1117] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#45bfae]">
              <Sparkles size={18} />
              <span className="font-bold text-sm text-white">AI Next-Best-Action</span>
            </div>
            <p className="text-xs text-[#A7B7C7] leading-relaxed">
              Gives closers explainable recommendations, objection talk tracks, and verified commercial scopes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1117] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#45bfae]">
              <ShieldCheck size={18} />
              <span className="font-bold text-sm text-white">Zero Revenue Leakage</span>
            </div>
            <p className="text-xs text-[#A7B7C7] leading-relaxed">
              Sales leaders see overdue follow-ups, stalled pipeline deals, and closer capacity in real time.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#111C26] via-[#0D151D] to-[#111C26] border border-[#248277]/40 text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Ready to test Closecraft with your real leads?
          </h3>
          <p className="text-sm text-[#A7B7C7] max-w-xl mx-auto">
            Start a 7-day Starter trial today with no credit card required, or request a complete Revenue Audit of your current follow-up process.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm inline-flex items-center gap-2 shadow-lg transition-all"
            >
              <span>Start My 7-Day Free Trial</span>
              <ArrowRight size={16} />
            </Link>
            {onOpenAudit && (
              <button
                type="button"
                onClick={onOpenAudit}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold text-sm transition-all"
              >
                Request a Revenue Audit
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
