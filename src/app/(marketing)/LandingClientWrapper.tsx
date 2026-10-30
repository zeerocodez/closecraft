"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Menu,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Logo from "@/components/ui/Logo";
import type { LandingView } from "@/lib/landing/types";
import type { EcosystemFlags } from "@/lib/ecosystem/flags";
import './landing.css';

export default function LandingClientWrapper({
  eco,
  flags,
}: {
  eco: LandingView | null;
  flags: EcosystemFlags | null;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [modalFormType, setModalFormType] = useState<'AUDIT' | 'MANAGED_SALES'>('AUDIT');
  const [auditBusy, setAuditBusy] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  async function handleAuditSubmit(event: FormEvent<HTMLFormElement>, overrideFormType?: 'AUDIT' | 'MANAGED_SALES') {
    event.preventDefault();
    setAuditBusy(true);
    setAuditSuccess(null);
    setAuditError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, any> = Object.fromEntries(formData.entries());

    // Include formType to distinguish audit from managed sales
    data.formType = (overrideFormType || modalFormType) === 'MANAGED_SALES' ? 'MANAGED_SALES' : 'REVENUE_AUDIT';

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseJson = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(responseJson.error || 'Failed to submit request. Please try again.');
      }

      setAuditSuccess("Your request has been received. We will contact you using the details you provided to discuss your current follow-up process.");
      form.reset();
    } catch (error) {
      setAuditError(error instanceof Error ? error.message : 'An error occurred while saving your request.');
    } finally {
      setAuditBusy(false);
    }
  }

  const openAudit = (type: 'AUDIT' | 'MANAGED_SALES' = 'AUDIT') => {
    setModalFormType(type);
    setMobileMenuOpen(false);
    setAuditSuccess(null);
    setAuditError(null);
    setShowAuditModal(true);
  };

  const faqs = [
    {
      q: "Is Closecraft a lead-generation service?",
      a: "The core software helps you manage and follow up on enquiries you already receive. It does not replace a clear offer or the work needed to attract suitable buyers."
    },
    {
      q: "How does the seven-day free trial work?",
      a: "Create a workspace to start seven days of Starter access. No credit card is required. Use the trial to organise your enquiries and test the follow-up process with your team."
    },
    {
      q: "What happens when my trial ends?",
      a: "Choose a paid plan to continue using paid features. We will not charge you automatically. You can still access your account and billing options, subject to the applicable data-retention policy."
    },
    {
      q: "Do I need to enter my card details?",
      a: "No. You can start the trial without a credit card. Payment is required only when you choose a paid plan."
    },
    {
      q: "Can I upgrade before the trial ends?",
      a: "Yes. Choose an available paid plan from your workspace. Your paid access starts after payment is verified."
    },
    {
      q: "Which plan should I choose?",
      a: "Starter is designed for a lean team. Pro adds capacity for a larger team and automated lead distribution. View the full pricing page for the published plan details."
    },
    {
      q: "Does the trial include remote closers or DSS tuition?",
      a: "No. The trial covers Starter software access. Managed sales support and DSS training are separate paid offers."
    },
    {
      q: "Can I use my existing team?",
      a: "Yes. Assign opportunities to your own team within your workspace's seat allowance. Managed sales support is an optional service."
    },
    {
      q: "Can I bring in leads I already have?",
      a: "Bring in an existing list through CSV import, or use a supported lead-source integration. Check the available connection options before choosing how to bring your enquiries into the workspace."
    },
    {
      q: "What is the difference between Closecraft and DSS?",
      a: "Closecraft provides the sales workspace and shared practice technology. Digital Sales School provides structured training and programme assessment."
    },
    {
      q: "Will Closecraft guarantee more sales?",
      a: "No. Results depend on your offer and the buyers you attract, as well as the work your team does. Closecraft helps you make follow-up more visible and consistent."
    },
  ];

  return (
    <div className="landing-shell" style={{ paddingTop: '80px' }}>
      {/* 1. Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B1117]/95 backdrop-blur-xl border-b border-white/10 shadow-md">
        {/* Academy announcement */}
        <div className="bg-[#0f1214] border-b border-[#248277]/30 px-3 py-1.5 text-center text-xs text-gray-300 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <span className="px-1.5 py-0.5 rounded bg-[#248277] text-white font-bold text-[10px] uppercase tracking-wider">
            ACADEMY
          </span>
          <span>Building your remote sales skills?</span>
          <Link href="/dss" className="text-[#45bfae] font-bold hover:underline flex items-center gap-1">
            Explore Digital Sales School &rarr;
          </Link>
        </div>

        <div className="h-16 w-full px-4 sm:px-8 lg:px-12 max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 xl:gap-8">
            <Link className="flex items-center group py-1" href="/" aria-label="Closecraft Home">
              <Logo variant="full" size="lg" priority alt="Closecraft" />
            </Link>
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <Link className="px-3 py-1.5 text-[#A7B7C7] hover:text-white text-sm font-medium transition-colors" href="/platform">
                Platform
              </Link>
              <Link className="px-3 py-1.5 text-[#A7B7C7] hover:text-white text-sm font-medium transition-colors" href="#how-it-works">
                How It Works
              </Link>
              <Link className="px-3 py-1.5 text-[#A7B7C7] hover:text-white text-sm font-medium transition-colors" href="/pricing">
                Pricing
              </Link>
              <Link className="px-3 py-1.5 text-[#45bfae] hover:underline text-sm font-semibold transition-colors flex items-center gap-1" href="/dss">
                <span>DSS Academy</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link className="hidden sm:inline-flex items-center px-3 py-1.5 text-[#A7B7C7] hover:text-white text-sm font-medium transition-colors" href="/login">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-4 py-2 bg-[#248277] text-white hover:bg-[#1f6f65] text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <span className="hidden sm:inline">Start My 7-Day Free Trial</span>
              <span className="sm:hidden">Start 7-Day Trial</span>
            </Link>
            <button
              onClick={() => openAudit('AUDIT')}
              className="hidden md:inline-flex items-center justify-center px-3.5 py-2 bg-white/5 text-white border border-white/10 hover:bg-white/10 text-xs sm:text-sm font-medium rounded-xl shadow-sm transition-all"
            >
              Request a Revenue Audit
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors ml-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#090D12] border-b border-white/10 px-6 py-4 flex flex-col gap-3 shadow-2xl animate-in slide-in-from-top-2 duration-150">
            <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-white hover:bg-white/5 rounded-lg text-sm font-medium" href="/platform">
              Platform
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-white hover:bg-white/5 rounded-lg text-sm font-medium" href="#how-it-works">
              How It Works
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-white hover:bg-white/5 rounded-lg text-sm font-medium" href="/pricing">
              Pricing
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-[#248277]/15 text-[#45bfae] font-bold text-sm flex items-center gap-2 border border-[#248277]/30" href="/dss">
              <span>DSS Academy &rarr;</span>
            </Link>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-[#A7B7C7] hover:text-white rounded-lg text-sm font-medium" href="/login">
                Sign In
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 bg-[#248277] text-white text-center rounded-xl font-bold text-sm"
                href="/signup"
              >
                Start 7-Day Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section id="hero" className="section-wrap py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#248277]/20 border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#45bfae] animate-pulse"></span>
              SALES FOLLOW-UP SOFTWARE FOR GROWING TEAMS
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Stop losing sales to forgotten follow-up.
            </h1>

            <p className="text-base sm:text-lg text-[#A7B7C7] leading-relaxed max-w-xl">
              Give every promising enquiry an owner and a clear next step. Closecraft helps your team follow up consistently, with AI-supported qualification and human sales support when you need it.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/signup"
                className="px-6 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-lg shadow-[#248277]/20 transition-all active:scale-95 text-center"
              >
                <span>Start My 7-Day Free Trial</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={() => openAudit('AUDIT')}
                className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold text-sm sm:text-base transition-all text-center"
              >
                Request a Revenue Audit
              </button>
            </div>

            <p className="text-xs text-[#8A9CAE] pt-1">
              Try Starter free for 7 days, with no credit card required. Choose a paid plan to continue after your trial.
            </p>
          </div>

          {/* Hero Sanitized Product Screen: Clearly labeled Demo Data */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0B1117] p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">DEMO DATA — SAMPLE WORKSPACE</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-emerald-300 font-semibold">
                  7-Day Starter Trial
                </span>
              </div>

              {/* Sample Opportunity Card */}
              <div className="p-4 rounded-2xl bg-[#111C26] border border-[#248277]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">David — ABC Consulting</h3>
                    <p className="text-xs text-[#A7B7C7]">Enquiry Source: Website Form · ₦2,000,000 deal size</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-[#248277]/20 text-[#45bfae] font-bold border border-[#248277]/40">
                    Qualified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                  <div>
                    <span className="text-[#8A9CAE]">Assigned Owner:</span>
                    <p className="font-semibold text-white mt-0.5">Somtochukwu O.</p>
                  </div>
                  <div>
                    <span className="text-[#8A9CAE]">SLA Follow-up:</span>
                    <p className="font-semibold text-amber-300 mt-0.5">Active (32m waiting)</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#090D12] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#45bfae] uppercase tracking-wider">NEXT BEST ACTION</span>
                    <span className="text-amber-400 font-medium">Action Required</span>
                  </div>
                  <p className="text-xs font-semibold text-white">
                    Schedule Discovery Call & confirm commercial scope
                  </p>
                  <p className="text-[11px] text-[#8A9CAE]">
                    Reason: Buyer requested pricing for 15-person team with active Q4 follow-up initiative.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#8A9CAE] pt-1">
                <span>Starter: 3 seats · 1,000 leads/mo</span>
                <span className="text-emerald-400 font-medium">Real-time Lead Routing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem Section */}
      <section className="section-wrap py-16 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
            You paid to get their attention. What happens after they enquire?
          </h2>
          <div className="space-y-4 text-base sm:text-lg text-[#A7B7C7] leading-relaxed text-left sm:text-center">
            <p>
              An interested buyer should not disappear into a spreadsheet or an unanswered message.
            </p>
            <p>
              Yet when follow-up depends on memory, a busy day can leave good opportunities waiting. Your team may be working hard while you still cannot see which conversations need attention.
            </p>
            <p className="font-semibold text-white">
              More leads will not fix a broken follow-up process.
            </p>
            <p>
              Closecraft gives you a shared view of the work, so you can see where an opportunity stands and take the next useful action.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Product Value Section */}
      <section id="platform" className="section-wrap py-16 border-t border-white/10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Open your workspace. Know where to focus.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-[#0B1117] border border-white/10 space-y-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
              <Sparkles size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">See the enquiries that need attention.</h3>
            <p className="text-sm text-[#A7B7C7] leading-relaxed">
              Bring enquiries into a shared workspace using supported lead sources or CSV import. Review what is new and what has been waiting.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-[#0B1117] border border-white/10 space-y-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Make ownership clear.</h3>
            <p className="text-sm text-[#A7B7C7] leading-relaxed">
              Assign opportunities to the right person. Know who is responsible for the next conversation, rather than relying on someone to remember.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-[#0B1117] border border-white/10 space-y-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
              <Clock size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Follow up with context.</h3>
            <p className="text-sm text-[#A7B7C7] leading-relaxed">
              Use qualification information and reminders to guide the next action. Your team can understand why an opportunity needs attention before reaching out.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-[#0B1117] border border-white/10 space-y-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Keep stalled deals visible.</h3>
            <p className="text-sm text-[#A7B7C7] leading-relaxed">
              Review opportunities with no recent activity and decide whether another follow-up is useful. Close records accurately when an opportunity has ended.
            </p>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/signup"
            className="px-6 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>Start My 7-Day Free Trial</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 5. Product Demonstration Section */}
      <section className="section-wrap py-16 border-t border-white/10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              See the next step behind the status.
            </h2>
            <p className="text-lg font-semibold text-[#45bfae]">
              A lead marked "Qualified" still needs action.
            </p>
            <p className="text-sm sm:text-base text-[#A7B7C7] max-w-2xl mx-auto leading-relaxed">
              Closecraft brings the opportunity's status together with its follow-up context. See the assigned owner and the next action, with the reason that action matters.
            </p>
            <p className="text-sm sm:text-base text-[#A7B7C7] max-w-2xl mx-auto leading-relaxed">
              Use that information to guide the work. Keep your team responsible for the judgement behind the sale.
            </p>
          </div>

          {/* Sanitized Product Screenshot / Interface Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#090D12] border border-white/15 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">
                  OPPORTUNITY DETAIL · DEMO DATA
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Acme Logistics — Regional Account</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#248277]/20 text-[#45bfae] font-bold text-xs border border-[#248277]/30">
                  Status: Qualified
                </span>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                  SLA: Follow-up Overdue (45m)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[#8A9CAE]">Assigned Owner</span>
                <p className="text-sm font-semibold text-white mt-1">David Adeleke (Sales Rep)</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[#8A9CAE]">Estimated Value</span>
                <p className="text-sm font-semibold text-white mt-1">₦3,500,000 NGN</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[#8A9CAE]">Lead Source</span>
                <p className="text-sm font-semibold text-white mt-1">Meta Inbound Webhook</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111C26] border border-[#248277]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#45bfae] uppercase tracking-wider">
                  Next Action & Context
                </span>
                <span className="text-[11px] font-mono text-[#8A9CAE]">Confidence: Deterministic</span>
              </div>
              <p className="text-sm font-bold text-white">
                Reach out via WhatsApp or phone to confirm stakeholder availability for discovery presentation.
              </p>
              <p className="text-xs text-[#A7B7C7] leading-relaxed">
                Why this matters: Buyer confirmed a ₦3.5M budget and active 30-day timeline during intake questionnaire, but calendar slot has not been scheduled.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How It Works Section */}
      <section id="how-it-works" className="section-wrap py-16 border-t border-white/10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Build a follow-up process your team can actually use.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-[#0B1117] border border-white/10 space-y-3 shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#45bfae] uppercase tracking-wider font-mono">01. INTAKE</span>
              <h3 className="text-lg font-bold text-white">1. Bring in your enquiries.</h3>
              <p className="text-xs sm:text-sm text-[#A7B7C7] leading-relaxed">
                Connect a supported source or import an existing list. Start with the opportunities you already have.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-[#0B1117] border border-white/10 space-y-3 shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#45bfae] uppercase tracking-wider font-mono">02. ASSIGN</span>
              <h3 className="text-lg font-bold text-white">2. Give the work an owner.</h3>
              <p className="text-xs sm:text-sm text-[#A7B7C7] leading-relaxed">
                Assign responsibility and review the available qualification information. Make the next step clear.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-[#0B1117] border border-white/10 space-y-3 shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#45bfae] uppercase tracking-wider font-mono">03. ENGAGE</span>
              <h3 className="text-lg font-bold text-white">3. Keep the conversation moving.</h3>
              <p className="text-xs sm:text-sm text-[#A7B7C7] leading-relaxed">
                Use reminders and visible priorities to organise follow-up. Bring in a person when the buyer needs a deeper conversation.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-[#0B1117] border border-white/10 space-y-3 shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#45bfae] uppercase tracking-wider font-mono">04. CLOSE</span>
              <h3 className="text-lg font-bold text-white">4. Review the outcome.</h3>
              <p className="text-xs sm:text-sm text-[#A7B7C7] leading-relaxed">
                Record the decision and agreed actions. Use the pipeline to see what is progressing and where your process needs attention.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>Start My 7-Day Free Trial</span>
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={() => openAudit('AUDIT')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold text-sm transition-all"
          >
            Request a Revenue Audit
          </button>
        </div>
      </section>

      {/* 7. AI and People Section */}
      <section className="section-wrap py-16 border-t border-white/10">
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-[#0B1117] border border-white/15 shadow-xl space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">
              HUMAN + MACHINE COLLABORATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Let AI support the follow-up. Keep people in charge of the sale.
            </h2>
          </div>
          <div className="space-y-4 text-sm sm:text-base text-[#A7B7C7] leading-relaxed">
            <p>
              Use AI-supported qualification and follow-up workflows to reduce repetitive work.
            </p>
            <p>
              Your people handle discovery and recommendations. They make the commercial decisions and work through concerns that need judgement.
            </p>
            <p className="font-semibold text-white">
              The result is a clearer division of responsibility, with a visible handover when human attention is needed.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Managed Sales Section */}
      <section className="section-wrap py-16 border-t border-white/10">
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-[#0B1117] to-[#111C26] border border-[#248277]/40 shadow-xl space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">
              MANAGED SALES ENGAGEMENT
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Have enquiries, but need help handling the sales conversations?
            </h2>
          </div>

          <div className="space-y-3 text-sm sm:text-base text-[#A7B7C7] leading-relaxed">
            <p>You may need sales capacity as well as software.</p>
            <p>
              Closecraft's managed sales engagement gives suitable businesses access to remote sales support around an approved offer and agreed responsibilities.
            </p>
            <p>
              We review your lead flow and offer economics before recommending an engagement. Then we confirm capacity and define the work.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#090D12] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-2xl font-extrabold text-white">From ₦150,000</span>
              <span className="text-xs text-[#A7B7C7]"> for 30 days</span>
              <p className="text-xs text-[#45bfae] font-medium mt-0.5">
                Workspace access is included in the agreed engagement scope.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openAudit('MANAGED_SALES')}
              className="px-6 py-3 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm shrink-0 transition-all shadow-md"
            >
              Request a Managed Sales Proposal
            </button>
          </div>

          <p className="text-xs text-[#8A9CAE] italic">
            Sales support is subject to fit and availability. Responsibilities and commercial terms are confirmed before work begins.
          </p>
        </div>
      </section>

      {/* 9. Pricing Section */}
      <section id="pricing" className="section-wrap py-16 border-t border-white/10">
        <div className="text-center mb-10 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">
            COMMERCIAL PLANS
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Try Closecraft free for 7 days.
          </h2>
          <p className="text-sm sm:text-base text-[#A7B7C7] max-w-2xl mx-auto leading-relaxed">
            Use the Starter workspace with your team and test the follow-up process with your own enquiries. After your trial, choose the paid plan that fits your business.
          </p>
          <p className="text-xs text-[#8A9CAE] italic">
            The free trial includes Starter features. Managed sales services and DSS training are priced separately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch">
          {/* Starter Plan */}
          <div className="p-6 rounded-3xl bg-[#0B1117] border border-white/10 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-bold">
                  7-Day Trial
                </span>
              </div>
              <div className="mb-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">₦20,000</span>
                <span className="text-xs text-[#A7B7C7]">/month</span>
              </div>
              <p className="text-xs text-[#A7B7C7] mb-6">
                Lean teams, with 3 internal seats and up to 1,000 active leads/month
              </p>
              <ul className="space-y-2.5 text-xs text-[#A7B7C7] mb-6">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span><strong>3 internal seats</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span><strong>Up to 1,000 active leads/mo</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span>Shared enquiry workspace</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span>Follow-up SLA tracking</span>
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="w-full py-3 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-center text-xs font-bold transition-all shadow-md block"
            >
              Start My 7-Day Free Trial
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="p-6 rounded-3xl bg-[#111C26] border-2 border-[#248277] flex flex-col justify-between relative shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#248277] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
              Recommended for Teams
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Pro</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-bold">
                  Scale
                </span>
              </div>
              <div className="mb-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">₦45,000</span>
                <span className="text-xs text-[#A7B7C7]">/month</span>
              </div>
              <p className="text-xs text-[#A7B7C7] mb-6">
                Growing teams, with 10 internal seats and automated lead distribution
              </p>
              <ul className="space-y-2.5 text-xs text-[#A7B7C7] mb-6">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span><strong>10 internal seats</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span><strong>Automated lead distribution</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span>Manager call coaching queues</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span>Priority notification dispatch</span>
                </li>
              </ul>
            </div>
            <div>
              <Link
                href="/signup"
                className="w-full py-3 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white text-center text-xs font-bold transition-all shadow-md block"
              >
                Start My 7-Day Free Trial
              </Link>
              <p className="text-[10px] text-[#8A9CAE] text-center mt-2">
                Your free trial includes Starter features. Upgrade to Pro after selecting a paid plan.
              </p>
            </div>
          </div>

          {/* Enterprise */}
          <div className="p-6 rounded-3xl bg-[#0B1117] border border-white/10 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Enterprise</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                  Custom
                </span>
              </div>
              <div className="mb-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">₦75,000</span>
                <span className="text-xs text-[#A7B7C7]">/month</span>
              </div>
              <p className="text-xs text-[#A7B7C7] mb-6">
                Larger teams needing custom integrations and expanded capacity
              </p>
              <ul className="space-y-2.5 text-xs text-[#A7B7C7] mb-6">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span>Custom team seat allocations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span>Custom CRM & ERP integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span>Dedicated success manager</span>
                </li>
              </ul>
            </div>
            <a
              href="mailto:sales@closecrafthq.com?subject=Discuss%20Enterprise%20Inquiry"
              className="w-full py-3 rounded-xl border border-white/20 text-white text-center text-xs font-semibold hover:bg-white/5 transition-colors block"
            >
              Discuss Enterprise
            </a>
          </div>

          {/* Managed Sales Engagement */}
          <div className="p-6 rounded-3xl bg-[#0B1117] border border-white/10 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Managed Sales</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-bold">
                  Service
                </span>
              </div>
              <div className="mb-4">
                <span className="text-xl sm:text-2xl font-extrabold text-white">From ₦150,000</span>
                <span className="text-xs text-[#A7B7C7]"> for 30 days</span>
              </div>
              <p className="text-xs text-[#A7B7C7] mb-6">
                Suitable businesses needing remote sales support with workspace access included
              </p>
              <ul className="space-y-2.5 text-xs text-[#A7B7C7] mb-6">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span><strong>Workspace access included</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span>Remote sales professionals</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#45bfae] mt-0.5 shrink-0" />
                  <span>Lead flow and offer review</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => openAudit('MANAGED_SALES')}
              className="w-full py-3 rounded-xl border border-white/20 text-white text-center text-xs font-semibold hover:bg-white/5 transition-colors block"
            >
              Request a Managed Sales Proposal
            </button>
          </div>
        </div>

        <div className="text-center mt-8 text-xs text-[#8A9CAE]">
          No automatic charge at trial expiry. Choose and pay for a plan to continue using paid features.
        </div>
      </section>

      {/* 10. Revenue Audit Form Section */}
      <section id="audit" className="section-wrap py-16 border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-5xl mx-auto">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">
              REVENUE AUDIT
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Find the follow-up gaps before you spend more on leads.
            </h2>
            <div className="space-y-3 text-sm text-[#A7B7C7] leading-relaxed">
              <p className="font-semibold text-white">Not sure where the problem sits?</p>
              <p>
                Request a Revenue Audit of your current lead-to-sale process. We will review how enquiries are handled and where follow-up loses momentum.
              </p>
              <p>
                You will have a clearer starting point for deciding whether you need software support or a managed sales engagement.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#0B1117] border border-white/15 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Show us where follow-up gets difficult.</h3>

            {auditSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                  <CheckCircle2 size={20} />
                  <span>Request Received</span>
                </div>
                <p>{auditSuccess}</p>
                <button
                  type="button"
                  onClick={() => setAuditSuccess(null)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-semibold text-xs hover:bg-emerald-500/30 transition-colors"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => handleAuditSubmit(e, 'AUDIT')} className="space-y-4">
                {auditError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {auditError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#A7B7C7]">Your name *</label>
                    <input
                      name="name"
                      required
                      placeholder="e.g. Alex Rivera"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#8A9CAE] focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#A7B7C7]">Business name *</label>
                    <input
                      name="business"
                      required
                      placeholder="e.g. Apex Operations"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#8A9CAE] focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#A7B7C7]">Work email *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="alex@example.com"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#8A9CAE] focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#A7B7C7]">Phone / WhatsApp *</label>
                    <input
                      name="phone"
                      required
                      placeholder="+234 800 000 0000"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#8A9CAE] focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#A7B7C7]">Website, optional</label>
                  <input
                    name="website"
                    placeholder="https://example.com"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#8A9CAE] focus:outline-none focus:border-[#45bfae]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#A7B7C7]">Approximate monthly enquiries *</label>
                  <select
                    name="monthlyLeadVolume"
                    required
                    defaultValue=""
                    className="w-full h-11 px-3.5 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs focus:outline-none focus:border-[#45bfae]"
                  >
                    <option value="" disabled>Select enquiry volume</option>
                    <option value="Fewer than 20">Fewer than 20</option>
                    <option value="20–49">20–49</option>
                    <option value="50–199">50–199</option>
                    <option value="200 or more">200 or more</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#A7B7C7]">Biggest follow-up problem *</label>
                  <select
                    name="biggestSalesBottleneck"
                    required
                    defaultValue=""
                    className="w-full h-11 px-3.5 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs focus:outline-none focus:border-[#45bfae]"
                  >
                    <option value="" disabled>Select follow-up problem</option>
                    <option value="Leads sit unassigned or slow to reach">Leads sit unassigned or slow to reach</option>
                    <option value="Follow-up stops after one message">Follow-up stops after one message</option>
                    <option value="Unclear who is responsible for next step">Unclear who is responsible for next step</option>
                    <option value="Stalled opportunities never get reviewed">Stalled opportunities never get reviewed</option>
                    <option value="Unqualified enquiries taking up team time">Unqualified enquiries taking up team time</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={auditBusy}
                  className="w-full py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 mt-2"
                >
                  {auditBusy ? 'Submitting Request...' : 'Request My Revenue Audit'}
                </button>

                <p className="text-[11px] text-[#8A9CAE] leading-relaxed pt-1">
                  Tell us how to reach you about this request. Submitting the form does not commit you to a paid plan or managed service.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 11. AI Practice and DSS Section */}
      <section className="section-wrap py-16 border-t border-white/10">
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-[#0B1117] border border-white/15 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">
              SALES LEARNING & PERFORMANCE TECHNOLOGY
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase border border-amber-500/30">
              Practice Framework In development
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Better follow-up needs better sales conversations.
          </h2>

          <div className="space-y-3 text-sm sm:text-base text-[#A7B7C7] leading-relaxed">
            <p>
              Digital Sales School helps you develop practical appointment-setting and closing skills through guided exercises and feedback.
            </p>
            <p>
              Closecraft is adding AI buyer practice and evidence-based performance feedback to that learning experience. The planned workflow lets you rehearse a conversation and review the evidence behind your feedback.
            </p>
            <p>
              Explore DSS for the training options and current practice availability.
            </p>
          </div>

          <div>
            <Link
              href="/dss"
              className="px-6 py-3 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md transition-all"
            >
              <span>Explore DSS Training & Practice</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <p className="text-xs text-[#8A9CAE] italic pt-2">
            AI practice feedback supports development. Formal DSS readiness decisions include authorised trainer review. Training does not guarantee employment or income.
          </p>
        </div>
      </section>

      {/* 12. Fit Section */}
      <section className="section-wrap py-16 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">
            TARGET FIT
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Built for businesses with enquiries worth following up.
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-[#A7B7C7] leading-relaxed text-left sm:text-center">
            <p>
              Closecraft is especially useful when your offer is already defined and buyers are contacting your business, but follow-up becomes difficult to coordinate.
            </p>
            <p>
              It can support an owner managing enquiries or a team that needs clearer accountability.
            </p>
            <p className="font-semibold text-white">
              If your main challenge is generating your first enquiries, start by addressing that need. The right follow-up system depends on having opportunities to work.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>Start My 7-Day Free Trial</span>
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={() => openAudit('AUDIT')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold text-sm transition-all"
            >
              Request a Revenue Audit
            </button>
          </div>
        </div>
      </section>

      {/* 13. FAQs Section */}
      <section id="faq" className="section-wrap py-16 border-t border-white/10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Questions & Answers
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0B1117] border border-white/10 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-sm sm:text-base hover:bg-white/5 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-[#45bfae] shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-[#8A9CAE] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#A7B7C7] leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 14. Final CTA Section */}
      <section className="section-wrap py-16 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center space-y-6 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#111C26] to-[#0B1117] border border-[#248277]/40 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Give your next opportunity a clear next step.
          </h2>
          <p className="text-sm sm:text-base text-[#A7B7C7] leading-relaxed max-w-xl mx-auto">
            Try Closecraft with the enquiries you already have. Give your team a shared place to manage follow-up and see what needs attention.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>Start My 7-Day Free Trial</span>
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={() => openAudit('AUDIT')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold text-sm transition-all"
            >
              Request a Revenue Audit
            </button>
          </div>
          <p className="text-xs text-[#8A9CAE] pt-2">
            7-day Starter trial, with no credit card required. No automatic charge when your trial ends.
          </p>
        </div>
      </section>

      {/* 15. Footer */}
      <footer className="border-t border-white/10 bg-[#070A0E] py-12 text-xs text-[#8A9CAE]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div>
              <Link href="/" className="inline-flex items-center group mb-2" aria-label="Closecraft Home">
                <Logo variant="full" size="lg" alt="Closecraft" />
              </Link>
              <p className="text-sm font-semibold text-white">Know who is following up.</p>
              <p className="text-xs text-[#8A9CAE] mt-1">
                By Zeerocodes Automation Limited.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-medium">
              <Link href="/platform" className="hover:text-white transition-colors">Platform</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/dss" className="text-[#45bfae] hover:underline font-bold">DSS Academy</Link>
              <a href="mailto:info@closecrafthq.com" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-[#8A9CAE]">
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/privacy" className="hover:underline">Privacy Notice</Link>
              <span>•</span>
              <Link href="/terms" className="hover:underline">Terms of Service</Link>
              <span>•</span>
              <Link href="/refund-policy" className="hover:underline">Cancellation & Refund Policy</Link>
              <span>•</span>
              <Link href="/cookies" className="hover:underline">Cookie Notice</Link>
              <span>•</span>
              <Link href="/managed-service-terms" className="hover:underline">Managed Service Terms</Link>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a href="mailto:sales@closecrafthq.com" className="text-[#45bfae] hover:underline">sales@closecrafthq.com</a>
              <span>•</span>
              <a href="mailto:info@closecrafthq.com" className="text-[#45bfae] hover:underline">info@closecrafthq.com</a>
              <span>•</span>
              <a href="mailto:dss@closecrafthq.com" className="text-[#45bfae] hover:underline">dss@closecrafthq.com</a>
            </div>
          </div>

          <div className="text-center pt-4 text-[11px] text-[#6A7B8C]">
            © {new Date().getFullYear()} Zeerocodes Automation Limited • www.closecrafthq.com. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Conversion Bar (< 640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1117]/95 backdrop-blur-xl border-t border-white/10 p-3 flex items-center gap-2.5 shadow-2xl">
        <Link
          href="/signup"
          className="flex-1 py-3 px-4 rounded-xl bg-[#248277] text-white text-xs font-bold text-center shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <span>Start 7-Day Trial</span>
          <ArrowRight size={14} />
        </Link>
        <button
          onClick={() => openAudit('AUDIT')}
          className="py-3 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition-colors"
        >
          Audit
        </button>
      </div>

      {/* Revenue Audit / Managed Sales Proposal Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#0B1117] border border-white/20 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowAuditModal(false)}
              className="absolute top-4 right-4 p-2 text-[#8A9CAE] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {auditSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="font-bold text-lg text-white">Request Received</h3>
                <p>{auditSuccess}</p>
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#248277] text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">
                    {modalFormType === 'MANAGED_SALES' ? 'MANAGED SALES PROPOSAL' : 'REVENUE AUDIT REQUEST'}
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {modalFormType === 'MANAGED_SALES'
                      ? 'Request a Managed Sales Proposal'
                      : 'Show us where follow-up gets difficult.'}
                  </h3>
                  <p className="text-xs text-[#A7B7C7]">
                    {modalFormType === 'MANAGED_SALES'
                      ? 'Tell us about your lead flow and offer. We review fit and economics before confirming scope.'
                      : 'We will review how enquiries are handled and where follow-up loses momentum.'}
                  </p>
                </div>

                {auditError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {auditError}
                  </div>
                )}

                <form onSubmit={(e) => handleAuditSubmit(e, modalFormType)} className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#A7B7C7]">Your name *</label>
                    <input
                      name="name"
                      required
                      placeholder="e.g. Alex Rivera"
                      className="w-full h-10 px-3 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#8A9CAE] focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#A7B7C7]">Business name *</label>
                    <input
                      name="business"
                      required
                      placeholder="e.g. Apex Operations"
                      className="w-full h-10 px-3 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#8A9CAE] focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#A7B7C7]">Work email *</label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="alex@example.com"
                        className="w-full h-10 px-3 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#8A9CAE] focus:outline-none focus:border-[#45bfae]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#A7B7C7]">Phone / WhatsApp *</label>
                      <input
                        name="phone"
                        required
                        placeholder="+234 800 000 0000"
                        className="w-full h-10 px-3 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#8A9CAE] focus:outline-none focus:border-[#45bfae]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#A7B7C7]">Website, optional</label>
                    <input
                      name="website"
                      placeholder="https://example.com"
                      className="w-full h-10 px-3 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#8A9CAE] focus:outline-none focus:border-[#45bfae]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#A7B7C7]">Approximate monthly enquiries *</label>
                    <select
                      name="monthlyLeadVolume"
                      required
                      defaultValue=""
                      className="w-full h-10 px-3 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs focus:outline-none focus:border-[#45bfae]"
                    >
                      <option value="" disabled>Select enquiry volume</option>
                      <option value="Fewer than 20">Fewer than 20</option>
                      <option value="20–49">20–49</option>
                      <option value="50–199">50–199</option>
                      <option value="200 or more">200 or more</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#A7B7C7]">Biggest follow-up problem *</label>
                    <select
                      name="biggestSalesBottleneck"
                      required
                      defaultValue=""
                      className="w-full h-10 px-3 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs focus:outline-none focus:border-[#45bfae]"
                    >
                      <option value="" disabled>Select follow-up problem</option>
                      <option value="Leads sit unassigned or slow to reach">Leads sit unassigned or slow to reach</option>
                      <option value="Follow-up stops after one message">Follow-up stops after one message</option>
                      <option value="Unclear who is responsible for next step">Unclear who is responsible for next step</option>
                      <option value="Stalled opportunities never get reviewed">Stalled opportunities never get reviewed</option>
                      <option value="Unqualified enquiries taking up team time">Unqualified enquiries taking up team time</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={auditBusy}
                    className="w-full py-3 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 mt-2"
                  >
                    {auditBusy
                      ? 'Submitting Request...'
                      : modalFormType === 'MANAGED_SALES'
                      ? 'Request My Managed Sales Proposal'
                      : 'Request My Revenue Audit'}
                  </button>

                  <p className="text-[10px] text-[#8A9CAE] leading-relaxed pt-1">
                    Tell us how to reach you about this request. Submitting the form does not commit you to a paid plan or managed service.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
