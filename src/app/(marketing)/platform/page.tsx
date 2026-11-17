import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Bot, 
  Check, 
  Users 
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import JsonLd from '@/components/seo/JsonLd';
import { getSoftwareApplicationJsonLd } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: "CloseCraft Platform — Customer Engagement & Follow-Up System",
  description: "Never lose track of an important customer conversation. CloseCraft unifies WhatsApp, Meta ads, and web enquiries with real-time response SLAs and contextual AI support.",
  openGraph: {
    title: "CloseCraft Platform — Customer Engagement & Follow-Up System",
    description: "Never lose track of an important customer conversation. Real-time response SLAs, multichannel inbox, and contextual AI support.",
    url: "https://www.closecrafthq.com/platform",
    siteName: "CloseCraft",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/closecraft-og.png",
        width: 1200,
        height: 630,
        alt: "CloseCraft Platform Overview",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CloseCraft Platform — Customer Engagement & Follow-Up System",
    description: "Never lose track of an important customer conversation.",
    images: ["/images/closecraft-og.png"],
    creator: "@closecrafthq",
  },
};

export default function PlatformPage() {
  const jsonLd = getSoftwareApplicationJsonLd({
    name: 'CloseCraft Platform',
    url: 'https://www.closecrafthq.com/platform',
    description: 'Never lose track of an important customer conversation. Multichannel intake, strict response SLAs, and approved contextual AI assistance.',
    applicationCategory: 'CustomerRelationshipManagement',
  });

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#248277] selection:text-white font-sans antialiased">
      <JsonLd data={jsonLd} />
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
            <MessageSquare size={12} />
            <span>CUSTOMER ENGAGEMENT &amp; INTAKE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Never Lose Track of an Important Customer Conversation.
          </h1>

          <p className="text-lg sm:text-xl text-[#a1a1aa] leading-relaxed">
            CloseCraft helps businesses manage customer enquiries, respond faster using approved business information, and ensure no promising opportunity disappears into an unanswered message.
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
              href="/revenue-engine"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#141416] hover:bg-[#1a1a1d] text-white border border-[#222226] font-semibold text-sm transition-all inline-flex items-center justify-center gap-2"
            >
              <span>Explore Revenue Engine</span>
            </Link>
          </div>
        </div>

        {/* Product Screenshot Showcase */}
        <div className="rounded-3xl overflow-hidden border border-[#1f1f1f] bg-[#101010] shadow-2xl space-y-0">
          <div className="relative aspect-[16/9] w-full bg-[#000000] overflow-hidden">
            <Image
              src="/images/closecraft_hero_dashboard.jpg"
              alt="CloseCraft Customer Conversation Command Centre"
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
              Understanding CloseCraft
            </h2>
            <p className="text-sm text-[#a1a1aa]">
              How the platform centralises customer conversations and eliminates enquiry lag.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. What problem does this solve? */}
            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-bold uppercase">
                1. THE PROBLEM
              </span>
              <h3 className="text-lg font-bold text-white">What problem does CloseCraft solve?</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                When enquiries arrive across WhatsApp, Meta ads, Instagram DMs, and website forms, messages get buried on individual staff phones. Responses are delayed by hours, context is lost between team members, and buyers go to competitors. CloseCraft centralises all conversations into one accountable workspace.
              </p>
            </div>

            {/* 2. Who is it for? */}
            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold uppercase">
                2. TARGET AUDIENCE
              </span>
              <h3 className="text-lg font-bold text-white">Who is CloseCraft built for?</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                Designed for businesses that generate inbound interest through advertising or social media and have a sales or customer support team. Perfect for real estate firms, educational institutions, service consultancies, B2B technology providers, and high-value merchants.
              </p>
            </div>

            {/* 3. How does it work? */}
            <div className="p-7 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] space-y-3">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold uppercase">
                3. HOW IT WORKS
              </span>
              <h3 className="text-lg font-bold text-white">How does CloseCraft operate?</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                Incoming leads are instantly ingested from Meta ad forms and website widgets into a unified queue. The system acknowledges the enquiry, assists staff with approved business knowledge, starts an SLA response countdown timer, and automatically routes high-value prospects to designated closers.
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
                  <span>Unified Multichannel Lead Inbox (WhatsApp, Meta, Web)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#45bfae] shrink-0" />
                  <span>Approved Knowledge Contextual AI Assistance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#45bfae] shrink-0" />
                  <span>Strict Response SLA Timers &amp; Overdue Notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#45bfae] shrink-0" />
                  <span>Customer Profile, Enquiry Source Attribution &amp; Notes</span>
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
              Ready to centralise your customer conversations?
            </h3>
            <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-xl mx-auto leading-relaxed">
              Start with our 7-day Starter trial. No credit card required. Connect your first campaign and experience real-time follow-up accountability.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#248277]/25"
              >
                Create My Trial Workspace
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#181818] hover:bg-[#202020] text-zinc-300 font-semibold text-xs sm:text-sm border border-white/10"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
