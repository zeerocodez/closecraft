"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Sparkles,
  Clock,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Layers,
  ChevronRight,
  RefreshCw,
  Target,
  Zap,
} from 'lucide-react';

interface ExplainerVideoSectionProps {
  onOpenAudit?: () => void;
}

export default function ExplainerVideoSection({ onOpenAudit }: ExplainerVideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'video' | 'interactive'>('video');
  const [simStep, setSimStep] = useState<number>(0);
  const [activeChapter, setActiveChapter] = useState(0);

  const chapters = [
    { title: "Inbound Ingestion", time: 0, label: "0:00", badge: "Capture" },
    { title: "Instant Routing", time: 15, label: "0:15", badge: "Triage" },
    { title: "Next-Best-Action", time: 30, label: "0:30", badge: "AI Assist" },
    { title: "Revenue Leakage", time: 45, label: "0:45", badge: "Radar" },
    { title: "Closing Deals", time: 55, label: "0:55", badge: "Won" },
  ];

  const simulationSteps = [
    {
      stage: "1. LEAD INGESTION & ATTRIBUTION",
      badge: "WhatsApp & Meta Ads",
      badgeColor: "bg-[#C7F36B]/15 text-[#C7F36B] border-[#C7F36B]/40",
      title: "Inbound Buyer · Adeola Adebayo",
      details: "Clicked Meta Sponsored Lead Form · Requested Enterprise 15-Seat Deployment",
      dealSize: "₦2,500,000 NGN",
      stateDesc: "Enquiry lands in CloseCraft in <2 seconds with complete campaign attribution. Zero spreadsheet delay.",
      actionIcon: Target,
    },
    {
      stage: "2. QUALIFICATION & INSTANT ROUTING",
      badge: "BANT Qualification",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      title: "Assigned to Closer: Babatunde Fashola",
      details: "BANT Fit: 96% · Budget Confirmed · Decision-Maker verified · 30-day timeline",
      dealSize: "SLA: 15-Min Response",
      stateDesc: "Automated routing assigns dedicated closer. Strict response countdown starts with SLA alerts.",
      actionIcon: Layers,
    },
    {
      stage: "3. AI NEXT-BEST-ACTION",
      badge: "AI Action Queue",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      title: "Action: Schedule Commercial Discovery Call",
      details: "Context: Buyer requested pricing and timeline for Q4 deployment across 2 branches.",
      dealSize: "Channel: WhatsApp / Call",
      stateDesc: "Closer receives pre-drafted talking points, objection handles, and verified pricing boundaries.",
      actionIcon: Sparkles,
    },
    {
      stage: "4. REVENUE LEAK RADAR",
      badge: "Leakage Prevention",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      title: "Proactive Follow-up Monitored",
      details: "No follow-up allowed to expire. Stalled conversation alerts manager before lead cools down.",
      dealSize: "Zero Lost Deals",
      stateDesc: "Automated nudge triggers follow-up touchpoint via WhatsApp template within 24 hours.",
      actionIcon: Clock,
    },
    {
      stage: "5. DEAL CLOSED & PROMISE TRACKED",
      badge: "Closed Won & Delivery",
      badgeColor: "bg-[#C7F36B]/20 text-[#C7F36B] border-[#C7F36B]/50",
      title: "Closed Won · ₦2,500,000 NGN",
      details: "Payment verified, 10% closer commission attributed, customer onboarding commitment logged.",
      dealSize: "₦2.5M Added to Cash",
      stateDesc: "Payment verified, CRM updated, full audit trail preserved, deliverable logged to Promise Ledger.",
      actionIcon: CheckCircle2,
    },
  ];

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const jumpTo = (time: number, idx?: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    if (idx !== undefined) setActiveChapter(idx);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const ct = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 60;
    setCurrentTime(ct);
    setDuration(dur);

    for (let i = chapters.length - 1; i >= 0; i--) {
      if (ct >= chapters[i].time) {
        setActiveChapter(i);
        break;
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const cycleSpeed = () => {
    if (!videoRef.current) return;
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section
      id="demo-vsl"
      className="relative py-16 sm:py-24 border-t border-[#263342]/60 bg-[#070B0E] scroll-mt-24 overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-[#C7F36B]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-[#248277]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 sm:space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-3.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#C7F36B]/40 text-[#C7F36B] text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#C7F36B] animate-pulse" />
            <span>PLATFORM DEMO &amp; REVENUE VSL</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight leading-[1.15]">
            See How CloseCraft Stops Revenue Leakage in 60 Seconds.
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-[#94A3B8] leading-relaxed max-w-2xl mx-auto">
            Watch how inbound enquiries from WhatsApp and Meta Ads are qualified, routed with strict response SLAs, and tracked from first touch to closed revenue.
          </p>

          {/* Mode Switcher Pill */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-[#0D1117] border border-[#263342] shadow-inner mt-2">
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-[#C7F36B] text-[#111827] shadow-md shadow-[#C7F36B]/15'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Play size={14} className={activeTab === 'video' ? 'fill-[#111827]' : ''} />
              <span>Watch Demo VSL (60s)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('interactive')}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'interactive'
                  ? 'bg-[#C7F36B] text-[#111827] shadow-md shadow-[#C7F36B]/15'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Sparkles size={14} />
              <span>Interactive Simulator</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DEMO VSL PLAYER */}
        {activeTab === 'video' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Player Container */}
            <div
              ref={containerRef}
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#263342] bg-[#0A0E13] shadow-2xl transition-all"
            >
              {/* Clean External Header Bar (NO overlay covering the speaker) */}
              <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 bg-[#0A0E13] border-b border-[#263342]/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C7F36B] animate-pulse" />
                  <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-white uppercase">
                    CloseCraft Revenue Engine Walkthrough
                  </span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16202C] hover:bg-[#1E2C3D] text-white border border-[#263342] text-[11px] font-mono transition-colors cursor-pointer"
                    title={isMuted ? "Click to unmute sound" : "Sound on"}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX size={13} className="text-amber-400" />
                        <span className="text-amber-300 font-semibold">Tap to Unmute</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={13} className="text-[#C7F36B]" />
                        <span className="text-[#C7F36B] font-semibold">Sound On</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Uncut Video Canvas (object-contain ensures complete frame visibility) */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  src="/videos/closecraft-onboarding.mp4"
                  poster="/images/closecraft_hero_dashboard.jpg"
                  playsInline
                  preload="metadata"
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  onClick={togglePlay}
                  className="w-full h-full object-contain cursor-pointer"
                />

                {/* Big Center Play Overlay when paused */}
                {!isPlaying && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/30 z-10 px-4 text-center"
                  >
                    <div className="relative flex items-center justify-center mb-3">
                      <span className="absolute w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-[#C7F36B]/30 animate-ping" />
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95">
                        <Play size={28} className="ml-1 fill-[#111827] sm:w-8 sm:h-8" />
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide bg-black/80 px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
                      Watch CloseCraft in Action (60s)
                    </span>
                    <span className="text-[11px] text-zinc-300 mt-1.5 font-medium hidden sm:inline-block">
                      Inbound Triage &middot; AI Action Queue &middot; SLA Enforcement &middot; Closed Won
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Custom Scrub & Controls Bar */}
              <div className="bg-[#0A0E13] border-t border-[#263342]/80 px-3.5 sm:px-5 py-2.5 sm:py-3 space-y-2">
                {/* Scrub Progress Bar */}
                <div
                  onClick={handleSeek}
                  className="relative h-1.5 sm:h-2 w-full bg-[#1E293B] rounded-full cursor-pointer group/scrub overflow-hidden"
                  title="Click or drag to seek"
                >
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-[#C7F36B] transition-all rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                  {/* Chapter tick marks */}
                  {chapters.map((ch) => (
                    <div
                      key={ch.time}
                      className="absolute top-0 bottom-0 w-0.5 bg-white/30 pointer-events-none"
                      style={{ left: `${(ch.time / duration) * 100}%` }}
                    />
                  ))}
                </div>

                {/* Control Actions Row */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  {/* Left: Play/Pause, Mute, Timers */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-1.5 sm:p-2 rounded-lg bg-[#16202C] hover:bg-[#1E2C3D] text-white transition-colors cursor-pointer"
                      aria-label={isPlaying ? "Pause video" : "Play video"}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-white" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-1.5 sm:p-2 rounded-lg bg-[#16202C] hover:bg-[#1E2C3D] text-white transition-colors cursor-pointer"
                      aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                    >
                      {isMuted ? <VolumeX size={16} className="text-amber-400" /> : <Volume2 size={16} className="text-[#C7F36B]" />}
                    </button>

                    <span className="text-[11px] sm:text-xs text-[#94A3B8] font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Right: Playback Speed, Fullscreen, and Evaluation CTA */}
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <button
                      type="button"
                      onClick={cycleSpeed}
                      className="px-2 py-1 rounded-md bg-[#16202C] hover:bg-[#1E2C3D] text-[#C7F36B] text-[11px] font-mono font-bold transition-colors cursor-pointer"
                      title="Toggle playback speed"
                    >
                      {playbackSpeed}x
                    </button>

                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="p-1.5 sm:p-2 rounded-lg bg-[#16202C] hover:bg-[#1E2C3D] text-[#94A3B8] hover:text-white transition-colors cursor-pointer hidden sm:inline-flex"
                      aria-label="Toggle Fullscreen"
                    >
                      <Maximize size={16} />
                    </button>

                    <Link
                      href="/demo"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] text-xs font-extrabold shadow-sm transition-all"
                    >
                      <span>Interactive Demo</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Chapters: Mobile-first responsive navigation */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-[#94A3B8] px-1">
                <span className="font-semibold text-white">Video Chapters:</span>
                <span className="text-[11px] font-mono text-[#C7F36B]">Tap to jump directly to section</span>
              </div>

              {/* Responsive Chapter Grid: 2-col on small mobile, 5-col on tablet/desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
                {chapters.map((ch, idx) => {
                  const isActive = activeChapter === idx;
                  return (
                    <button
                      key={ch.title}
                      type="button"
                      onClick={() => jumpTo(ch.time, idx)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                        isActive
                          ? 'bg-[#16202C] border-[#C7F36B] shadow-md shadow-[#C7F36B]/10'
                          : 'bg-[#0D1117] border-[#263342]/70 hover:border-[#C7F36B]/50 hover:bg-[#131B24]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className={isActive ? 'text-[#C7F36B] font-bold' : 'text-[#64748B]'}>
                          {ch.label}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                            isActive
                              ? 'bg-[#C7F36B]/20 text-[#C7F36B]'
                              : 'bg-white/5 text-[#94A3B8]'
                          }`}
                        >
                          {ch.badge}
                        </span>
                      </div>
                      <p
                        className={`text-xs font-bold transition-colors line-clamp-1 ${
                          isActive ? 'text-white' : 'text-[#CBD5E1] group-hover:text-white'
                        }`}
                      >
                        {ch.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE LEAD JOURNEY SIMULATOR */}
        {activeTab === 'interactive' && (
          <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#0D1117] border border-[#263342] shadow-2xl space-y-5 animate-in fade-in duration-300">
            {/* Step Indicators Rail */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pb-3 border-b border-[#263342]/60">
              {simulationSteps.map((s, idx) => {
                const isCurrent = simStep === idx;
                return (
                  <button
                    key={s.stage}
                    type="button"
                    onClick={() => setSimStep(idx)}
                    className={`p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#16202C] border border-[#C7F36B]/70 shadow-sm'
                        : 'bg-[#111827]/60 border border-transparent hover:bg-[#16202C]'
                    }`}
                  >
                    <span className={`text-[10px] font-mono block ${isCurrent ? 'text-[#C7F36B] font-bold' : 'text-[#64748B]'}`}>
                      STAGE 0{idx + 1}
                    </span>
                    <span className={`text-xs font-bold truncate block mt-0.5 ${isCurrent ? 'text-white' : 'text-[#94A3B8]'}`}>
                      {s.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Simulation Card */}
            {(() => {
              const current = simulationSteps[simStep];
              const Icon = current.actionIcon;
              return (
                <div className="p-4 sm:p-6 rounded-2xl bg-[#111827] border border-[#263342] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C7F36B]/15 border border-[#C7F36B]/30 flex items-center justify-center text-[#C7F36B] shrink-0">
                        <Icon size={20} />
                      </div>
                      <div>
                        <span className={`text-[11px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${current.badgeColor}`}>
                          {current.stage}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white mt-1">{current.title}</h3>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs sm:text-sm font-extrabold text-[#C7F36B]">{current.dealSize}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">{current.details}</p>

                  <div className="p-3 sm:p-3.5 rounded-xl bg-[#090D12] border border-[#263342] flex items-start gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 size={16} className="text-[#C7F36B] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{current.stateDesc}</span>
                  </div>

                  {/* Simulator Next/Reset Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#263342]/60">
                    <button
                      type="button"
                      onClick={() => setSimStep((prev) => (prev + 1) % simulationSteps.length)}
                      className="px-4 py-2 rounded-xl bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] text-xs font-extrabold inline-flex items-center gap-2 shadow-md shadow-[#C7F36B]/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Next Step ({simStep < 4 ? `0${simStep + 2}` : 'Replay Demo'})</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimStep(0)}
                      className="text-xs text-[#94A3B8] hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>Reset Flow</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 3 Outcome Pillars: RECOVER, CONVERT, DELIVER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0D1117] border border-[#263342] space-y-2">
            <div className="flex items-center gap-2 text-[#C7F36B]">
              <Target size={18} />
              <span className="font-bold text-sm text-white">RECOVER: Inactive Enquiries</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Old enquiries and ghosted leads are automatically reactivated with personalized AI follow-ups without manual rep effort.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0D1117] border border-[#263342] space-y-2">
            <div className="flex items-center gap-2 text-[#C7F36B]">
              <Clock size={18} />
              <span className="font-bold text-sm text-white">CONVERT: Strict 15-Min SLAs</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Inbound prospects get instant BANT scoring, closer assignment, and countdown timers that alert managers before deals stall.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0D1117] border border-[#263342] space-y-2">
            <div className="flex items-center gap-2 text-[#C7F36B]">
              <ShieldCheck size={18} />
              <span className="font-bold text-sm text-white">DELIVER: Promise Ledger</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Every deliverable and customer commitment made during the sale is tracked with evidence URLs and audit logging.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
