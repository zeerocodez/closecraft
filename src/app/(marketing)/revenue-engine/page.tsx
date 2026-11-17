import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Workflow, 
  Clock, 
  ShieldCheck, 
  Target, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  Check, 
  Bot 
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

export const metadata: Metadata = {
  title: "Revenue Engine — Sales Operations & Next Best Action Allocation",
  description: "Turn more enquiries into managed sales opportunities. Revenue Engine provides explainable priority scoring, deterministic Next Best Action allocation, and visual pipeline management.",
  openGraph: {
    title: "Revenue Engine — Sales Operations & Next Best Action Allocation",
    description: "Turn more enquiries into managed sales opportunities with explainable Next Best Action.",
    url: "https://www.closecrafthq.com/revenue-engine",
    siteName: "CloseCraft",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/closecraft-og.png",
        width: 1200,
        height: 630,
        alt: "Revenue Engine Overview",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Revenue Engine — Sales Operations & Next Best Action Allocation",
    description: "Deterministic Next Best Action and visual pipeline management.",
    images: ["/images/closecraft-og.png"],
    creator: "@closecrafthq",
  },
};

export default function RevenueEnginePage() {
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
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all shadow-md shadow-[#248277]/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Hero & Executive Positioning */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
            <Workflow size={12} />
            <span>SALES OPERATIONS &amp; EXECUTION</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Turn More Enquiries into Managed Sales Opportunities.
          </h1>

          <p className="text-lg sm:text-xl text-[#a1a1aa] leading-relaxed">
            Revenue Engine gives every viable lead an assigned owner, a deterministic Next Best Action, and strict follow-up countdowns so no deal stalls in your pipeline.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm shadow-xl shadow-[#248277]/25 transition-all inline-flex items-center justify-center gap-2"
            >
              <span>Start 7-Day Free Trial</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/platform"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#141416] hover:bg-[#1a1a1d] text-white border border-[#222226] font-semibold text-sm transition-all inline-flex items-center justify-center gap-2"
            >
              <span>Explore CloseCraft Platform</span>
            </Link>
          </div>
        </div>

        {/* Product Screenshot Showcase */}
        <div className="rounded-3xl overflow-hidden border border-[#1f1f1f] bg-[#101010] shadow-2xl space-y-0">
          <div className="relative aspect-[16/9] w-full bg-[#000000] overflow-hidden">
            <Image
              src="/images/closecraft_revenue_pipeline.jpg"
              alt="Revenue Engine Pipeline and Action Queue"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>

        {/* 5 CORE PRODUCT QUESTIONS */}
        <div className="space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Understanding Revenue Engine
            </h2>
            <p className="text-sm text-[#a1a1aa]">
              How the core algorithm drives explainable priority and eliminates sales follow-up leakage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. What problem does this solve? */}
            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-bold uppercase">
                1. THE PROBLEM
              </span>
              <h3 className="text-lg font-bold text-white">What problem does Revenue Engine solve?</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                Sales reps often rely on memory or paper notepads. They spend too much time on unresponsive tire-kickers while high-intent buyers wait for callbacks. Deals stall across pipeline stages, and owners have zero visibility into overdue opportunities. Revenue Engine provides a structured, enforceable follow-up discipline.
              </p>
            </div>

            {/* 2. Who is it for? */}
            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold uppercase">
                2. TARGET AUDIENCE
              </span>
              <h3 className="text-lg font-bold text-white">Who is Revenue Engine built for?</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                Designed for sales leaders, remote closers, appointment setters, and business operators who need to move prospects systematically from initial discovery call through commercial proposal to closed revenue.
              </p>
            </div>

            {/* 3. How does it work? */}
            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold uppercase">
                3. HOW IT WORKS
              </span>
              <h3 className="text-lg font-bold text-white">How does the engine operate?</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                The engine processes lead signals (fit, intent, urgency) and calculates an explainable priority score. It deterministically allocates a Next Best Action (Respond, Escalate, or Wait) to the designated actor (AI for routine reminders, Human closer for negotiations), enforced by SLA timers.
              </p>
            </div>

            {/* 4. What does the customer receive? */}
            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase">
                4. DELIVERABLES
              </span>
              <h3 className="text-lg font-bold text-white">What does the customer receive?</h3>
              <div className="space-y-2 pt-1 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#45bfae] shrink-0" />
                  <span>Explainable Next Best Action Queue with Slide-over Inspector</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#45bfae] shrink-0" />
                  <span>Visual Dual-Mode Pipeline (Interactive Kanban &amp; List Views)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#45bfae] shrink-0" />
                  <span>Dedicated Closer &amp; Setter Workspaces with Active SLA Counts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#45bfae] shrink-0" />
                  <span>Revenue Leakage Shield (Stalled Deals &amp; Overdue Alerts)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. What is the next step? */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0d1716] border border-[#248277]/60 text-center space-y-4">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#248277]/20 text-[#45bfae] font-bold uppercase">
              5. NEXT STEP
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Ready to give every lead a clear next action?
            </h3>
            <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-xl mx-auto leading-relaxed">
              Start your 7-day Starter trial today. No credit card required. Experience explainable lead priority and strict follow-up accountability.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#248277]/25"
              >
                Create My Trial Workspace
              </Link>
              <Link
                href="/dss"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#181818] hover:bg-[#202020] text-zinc-300 font-semibold text-xs sm:text-sm border border-white/10"
              >
                Explore Sales Training (DSS)
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
