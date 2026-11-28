'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Users,
  Briefcase,
  ExternalLink,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface EvaluatorBannerProps {
  currentUserEmail?: string;
  currentUserName?: string;
  currentUserRole?: string;
}

export default function EvaluatorBanner({
  currentUserEmail,
  currentUserName,
  currentUserRole,
}: EvaluatorBannerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  const personas = [
    {
      email: 'demo.owner@apexconsulting.ng',
      name: 'Babajide Adeleke',
      role: 'OWNER',
      title: 'Managing Partner (Owner)',
      destination: '/dashboard/revenue-engine',
      badge: 'Full Workspace & Settings',
    },
    {
      email: 'demo.manager@apexconsulting.ng',
      name: 'Ngozi Eze',
      role: 'MANAGER',
      title: 'RevOps Lead (Manager)',
      destination: '/team',
      badge: 'Roster, Allocations & SLAs',
    },
    {
      email: 'demo.closer1@apexconsulting.ng',
      name: 'Chidi Okafor',
      role: 'CLOSER',
      title: 'Senior Closer (Closer)',
      destination: '/rep',
      badge: 'High-Focus Queue & Closing',
    },
    {
      email: 'demo.setter1@apexconsulting.ng',
      name: 'Tunde Bakare',
      role: 'SETTER',
      title: 'Appointment Setter (Setter)',
      destination: '/rep',
      badge: 'WhatsApp Triage & Meetings',
    },
  ];

  const handleSwitchPersona = async (persona: (typeof personas)[0]) => {
    if (persona.email === currentUserEmail) {
      setIsOpen(false);
      return;
    }

    setSwitchingTo(persona.email);
    try {
      const result = await signIn('credentials', {
        email: persona.email,
        password: 'DemoAccess2026!',
        redirect: false,
      });

      if (result?.ok) {
        window.location.assign(persona.destination);
      } else {
        console.error('Failed to switch persona:', result?.error);
        setSwitchingTo(null);
      }
    } catch (e) {
      console.error('Error switching persona:', e);
      setSwitchingTo(null);
    }
  };

  const activePersona =
    personas.find((p) => p.email === currentUserEmail) || personas[0];

  return (
    <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs shadow-md relative overflow-visible">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Evaluator Workspace Context */}
        <div className="flex items-start sm:items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse mt-1 sm:mt-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-white text-xs sm:text-sm">
                🎯 Dedicated Evaluator Workspace: Apex Professional Services
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-mono font-bold tracking-wider border border-emerald-500/30">
                Evaluation Build
              </span>
            </div>
            <p className="text-emerald-300/80 text-[11px] mt-0.5 leading-relaxed">
              Pre-seeded with 12 diverse lead scenarios, 7 sales reps, active WhatsApp triage, and real-time revenue leakage alerts.
            </p>
          </div>
        </div>

        {/* Right: Persona Switcher & Walkthrough Guide */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              disabled={!!switchingTo}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-emerald-500/40 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              title="Switch role-based perspective"
            >
              <UserCheck size={14} className="text-emerald-400" />
              <span>
                {switchingTo ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin text-emerald-400" />
                    <span>Switching...</span>
                  </span>
                ) : (
                  <span>Role: {activePersona.title}</span>
                )}
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-slate-950 border border-emerald-500/40 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                  1-Click Role-Based Switcher:
                </p>
                <div className="space-y-1">
                  {personas.map((p) => {
                    const isCurrent = p.email === currentUserEmail;
                    return (
                      <button
                        key={p.email}
                        type="button"
                        onClick={() => handleSwitchPersona(p)}
                        className={`w-full text-left p-2.5 rounded-xl transition-colors flex flex-col gap-0.5 ${
                          isCurrent
                            ? 'bg-emerald-500/15 border border-emerald-500/30'
                            : 'hover:bg-slate-900 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">
                            {p.title}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-mono text-emerald-400 font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {p.name} • {p.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/demo"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>Walkthrough Guide</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
