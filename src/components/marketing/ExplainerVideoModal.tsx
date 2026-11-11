"use client";

import React, { useRef, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ExplainerVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc?: string;
}

export default function ExplainerVideoModal({
  isOpen,
  onClose,
  videoSrc = "/videos/closecraft-onboarding.mp4",
}: ExplainerVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  if (!isOpen) return null;

  const chapters = [
    { title: "Lead Gen & Ads", time: 0, label: "0:00", description: "Meta sponsored ads with ad spend included & targeted reach" },
    { title: "Instant Ingestion", time: 15, label: "0:15", description: "Instant WhatsApp & CRM routing without spreadsheet chaos" },
    { title: "Next-Best-Action", time: 30, label: "0:30", description: "AI qualification & 15-minute response SLA timers" },
    { title: "Revenue Leakage", time: 45, label: "0:45", description: "Radar prevents stalled deals and forgotten opportunities" },
    { title: "Closing Deals", time: 55, label: "0:55", description: "Appointment setting & remote sales closing to win" },
  ];

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

  const jumpTo = (time: number, idx: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    videoRef.current.play();
    setIsPlaying(true);
    setActiveChapter(idx);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const ct = videoRef.current.currentTime;
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (ct >= chapters[i].time) {
        setActiveChapter(i);
        break;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#0B1117] border border-[#248277]/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="explainer-video-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#0e1620] border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#45bfae] animate-pulse" />
            <span id="explainer-video-title" className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              Lead Generation to Sales Closing Walkthrough
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] border border-[#248277]/40">
              60s Growth Engine
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close explainer video"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
          />

          {/* Pause overlay button if paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#248277]/90 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
              aria-label="Play video"
            >
              <Play size={32} className="ml-1 fill-white" />
            </button>
          )}

          {/* Quick controls bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={togglePlay}
                className="p-1.5 text-white hover:text-[#45bfae] transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                onClick={toggleMute}
                className="p-1.5 text-white hover:text-[#45bfae] transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
            <div className="text-xs text-gray-300 font-mono">
              Closecraft AI Revenue OS
            </div>
          </div>
        </div>

        {/* Chapter Navigation */}
        <div className="px-4 sm:px-6 py-3 bg-[#090D12] border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            <span className="text-[11px] font-semibold text-gray-400 mr-1 hidden sm:inline">Chapters:</span>
            {chapters.map((ch, idx) => (
              <button
                key={ch.title}
                onClick={() => jumpTo(ch.time, idx)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeChapter === idx
                    ? "bg-[#248277] text-white shadow-sm font-semibold"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{ch.label}</span>
                <span>{ch.title}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-1 sm:pt-0">
            <Link
              href="/signup"
              onClick={onClose}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-[#248277] hover:bg-[#1f6f65] text-white font-bold transition-all shadow-sm flex items-center gap-1"
            >
              <span>Start 7-Day Free Trial</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
