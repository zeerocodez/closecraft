'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  Target, 
  Layers, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  Sparkles,
  Users,
  AlertCircle
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import FindRightSupportModal from '@/components/marketing/FindRightSupportModal';

export default function LeadGenClient() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const deliverySteps = [
    {
      num: '01',
      title: 'Review the offer',
      desc: 'Confirm suitability, past buyers, and commercial model. We evaluate whether your unit economics and buyer proof support paid advertising.',
    },
    {
      num: '02',
      title: 'Agree the campaign plan',
      desc: 'Target audience, key message, budget, and timeline. We define who we are reaching and agree on the test parameters before creating assets.',
    },
    {
      num: '03',
      title: 'Prepare the material',
      desc: 'Write ad copy, assemble creative angles, and build the lead capture form to gather relevant qualification data from prospective buyers.',
    },
    {
      num: '04',
      title: 'Client approval',
      desc: 'Client reviews ad copy and creative before launch. Nothing goes live on your Facebook or Instagram page without your explicit sign-off.',
    },
    {
      num: '05',
      title: 'Launch and monitor',
      desc: 'Manage the live campaign, monitor enquiries, and make necessary audience or creative adjustments based on real response signals.',
    },
    {
      num: '06',
      title: 'Connect the enquiries',
      desc: 'Incoming leads arrive in Closecraft or supported destination for prompt follow-up, ensuring your team has context and assigned ownership.',
    },
  ];

  const faqs = [
    {
      q: 'Do you guarantee leads or sales?',
      a: 'No. We do not guarantee a specific number of leads or closed sales. Results depend on offer appeal, pricing, audience receptivity, ad budget, and speed and quality of follow-up.',
    },
    {
      q: 'Is ad spend included in your fee?',
      a: 'No. Advertising budget is paid directly to Meta using your own payment method and ad account. Our fee covers strategy, campaign setup, copywriting, creative preparation, technical integration, and weekly management.',
    },
    {
      q: 'Do I have to use Closecraft software if you manage my ads?',
      a: 'No, but you do need an organised way to receive and follow up enquiries. We can connect your leads to Closecraft, or send them to your email, WhatsApp, or existing CRM.',
    },
    {
      q: 'What if I already have leads and just need help following up?',
      a: 'You can start with Closecraft software to organise your existing enquiries, train your sales team through Digital Sales School, or engage our managed sales support. You do not need our lead generation service.',
    },
    {
      q: 'Who handles the enquiries when they come in?',
      a: 'By default, your own team handles the enquiries. If you do not have someone available to respond promptly, we can discuss external appointment setting or managed sales support.',
    },
    {
      q: 'Can you train our sales team to handle these leads?',
      a: 'Yes. Digital Sales School provides practical training in appointment setting, objection handling, and remote sales closing for internal teams.',
    },
    {
      q: 'What happens if a campaign is not performing?',
      a: 'During weekly reviews, we analyse cost per enquiry, audience feedback, and lead quality. We test new copy, creative angles, or targeting adjustments. If the offer or audience is not responding, we discuss pausing or restructuring.',
    },
    {
      q: 'How do we get started?',
      a: 'Complete our short readiness review. We will evaluate your offer, audience, and follow-up readiness, then schedule a campaign discovery call if suitable.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B1117] text-white">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#0B1117]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center group py-1" aria-label="Closecraft Home">
            <Logo variant="full" size="md" alt="Closecraft" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-[#A7B7C7]">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/platform" className="hover:text-white transition-colors">
              Platform
            </Link>
            <Link href="/dss" className="hover:text-white transition-colors">
              Sales School
            </Link>
            <a href="#process" className="hover:text-white transition-colors">
              Process
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAssessment(true)}
              className="px-4 py-2 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              Discuss my campaign
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-20 space-y-20">
        {/* 2. Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#248277]/20 border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
            <Target size={14} />
            <span>MANAGED FACEBOOK & INSTAGRAM LEAD GENERATION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Bring in enquiries your business is ready to follow up.
          </h1>

          <p className="text-base sm:text-lg text-[#A7B7C7] leading-relaxed">
            Get hands-on Facebook and Instagram campaign management, connected to a clearer follow-up process through Closecraft.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setShowAssessment(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-lg shadow-[#248277]/20 transition-all active:scale-95"
            >
              <span>Discuss my campaign</span>
              <ArrowRight size={16} />
            </button>
            <a
              href="#included"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold text-sm sm:text-base transition-all text-center"
            >
              See what’s included
            </a>
          </div>

          {/* Customer perspective callout */}
          <div className="p-4 rounded-2xl bg-[#111C26] border border-white/10 text-xs sm:text-sm text-[#8A9CAE] italic max-w-xl mx-auto">
            “I want more paying customers. Show me where to start, explain what you will do, and make the next step easy.”
          </div>
        </section>

        {/* 3. The Central Scenario: Illustrative 500 Enquiries */}
        <section className="p-6 sm:p-10 rounded-3xl bg-[#090D12] border border-white/15 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                ILLUSTRATIVE CAMPAIGN SCENARIO
              </span>
            </div>
            <span className="text-[11px] text-[#8A9CAE]">
              Not a customer case study or lead count guarantee
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Your ads brought in 500 enquiries. What happens next?
              </h2>

              <p className="text-sm text-[#A7B7C7] leading-relaxed">
                The campaign has generated attention. Now the business has to turn that attention into useful conversations.
              </p>

              <div className="space-y-2 pt-2">
                {[
                  'Who responds to each new enquiry?',
                  'Who identifies suitable buyers and screens out bad fits?',
                  'Who follows up when someone does not reply to the first message?',
                  'Who handles the sales conversation and asks for the decision?',
                  'How does the owner know which opportunities still need attention?',
                ].map((question, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white">
                    <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>{question}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs sm:text-sm text-[#A7B7C7] leading-relaxed pt-2">
                Without an organised process, some enquiries can sit unanswered. Others receive one reply and are forgotten. Interested prospects lose interest while the business continues paying for advertising.
              </p>

              <p className="text-xs sm:text-sm font-semibold text-white">
                This is where Closecraft comes in. We manage your advertising campaigns, connect the resulting leads into a visible follow-up workflow, and offer optional sales training or external sales support.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="p-5 rounded-2xl bg-[#111C26] border border-[#248277]/40 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-bold text-[#45bfae] uppercase tracking-wider text-[11px]">
                    ILLUSTRATIVE WORKSPACE DATA
                  </span>
                  <span className="text-emerald-400 font-mono">Meta Lead Ads</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#0B1117] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white">Lead #492 — Corporate Inquiry</span>
                      <span className="text-amber-300 font-semibold">Waiting (18m)</span>
                    </div>
                    <p className="text-[#8A9CAE] text-[11px]">Attributed: Instagram Ads · Regional B2B Campaign</p>
                    <p className="text-emerald-300 font-medium text-[11px]">Assigned to: Inbound SDR · Action: WhatsApp intro</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0B1117] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white">Lead #491 — Wholesale Account</span>
                      <span className="text-emerald-400 font-semibold">Responded</span>
                    </div>
                    <p className="text-[#8A9CAE] text-[11px]">Attributed: Facebook Feed · Product Demo Offer</p>
                    <p className="text-white text-[11px]">Call booked for Thursday 2:00 PM</p>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#8A9CAE] flex items-center justify-between border-t border-white/10">
                  <span>Enquiries logged in CRM</span>
                  <span className="text-white font-semibold">No forgotten messages</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 6-Step Delivery Process */}
        <section id="process" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">
              TRANSPARENT EXECUTION
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Our 6-step campaign delivery process
            </h2>
            <p className="text-xs sm:text-sm text-[#A7B7C7]">
              Every campaign follows a structured sequence with explicit client approval before ad spend begins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliverySteps.map((step) => (
              <div 
                key={step.num}
                className="p-6 rounded-2xl bg-[#111C26] border border-white/10 space-y-3 relative group hover:border-[#248277]/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-[#248277] group-hover:text-[#45bfae] transition-colors">
                    {step.num}
                  </span>
                  <CheckCircle2 size={18} className="text-[#8A9CAE] group-hover:text-emerald-400 transition-colors" />
                </div>
                <h3 className="font-bold text-white text-base">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[#A7B7C7] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Scope of 30-Day Pilot: What is Included & What is Excluded */}
        <section id="included" className="p-6 sm:p-10 rounded-3xl bg-[#090D12] border border-white/15 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#248277]/20 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>30-DAY PILOT SCOPE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              What you receive, what we need, and how budget works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: What you receive */}
            <div className="p-5 rounded-2xl bg-[#111C26] border border-white/10 space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider text-[#45bfae]">
                What you receive
              </h3>
              <ul className="space-y-2.5 text-xs text-[#A7B7C7]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Client ad account setup and Meta verification guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Audience research & campaign structure on Meta</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Ad copy and creative variations for client review</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Direct lead form integration into Closecraft follow-up</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Weekly reporting: ad spend, enquiry count, cost per enquiry</span>
                </li>
              </ul>
            </div>

            {/* Column 2: What we need from you */}
            <div className="p-5 rounded-2xl bg-[#111C26] border border-white/10 space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider text-amber-300">
                What we need from you
              </h3>
              <ul className="space-y-2.5 text-xs text-[#A7B7C7]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Access to client Facebook page and Meta business account</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Clear details on your target audience and proven offer</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Dedicated team member to respond promptly (or Closecraft sales service)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Active payment method attached to your Meta ad account</span>
                </li>
              </ul>
            </div>

            {/* Column 3: What happens after the pilot */}
            <div className="p-5 rounded-2xl bg-[#111C26] border border-white/10 space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider text-cyan-300">
                After the pilot
              </h3>
              <ul className="space-y-2.5 text-xs text-[#A7B7C7]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>Comprehensive review of qualified enquiries and unit economics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>Decide whether to scale ad budget, maintain, or pause</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>Option to transition to monthly ongoing management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>No long-term lock-in: campaigns remain under your ownership</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Advertising Budget Separation Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs sm:text-sm text-amber-200/90 space-y-1">
            <p className="font-bold text-white flex items-center gap-2">
              <HelpCircle size={16} className="text-amber-400" />
              <span>Advertising Budget is Separate from Closecraft Fees</span>
            </p>
            <p>
              Your advertising budget is paid directly to Meta using your own payment method and ad account. Closecraft’s fee covers campaign strategy, audience research, ad copy, creative assembly, lead form integration, and ongoing weekly optimisation. We do not mark up your ad spend.
            </p>
          </div>
        </section>

        {/* 6. How the Services Work Together */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              From the first enquiry to a clear sales outcome.
            </h2>
            <p className="text-xs sm:text-sm text-[#A7B7C7]">
              Start with the support you need today. Add more help when your business is ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#111C26] border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-[#45bfae] uppercase tracking-wider">PILLAR 1</span>
              <h4 className="font-bold text-white text-sm">Attract enquiries</h4>
              <p className="text-xs text-[#8A9CAE] leading-relaxed">
                Managed Facebook & Instagram campaigns introduce your offer to relevant potential customers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#111C26] border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-[#45bfae] uppercase tracking-wider">PILLAR 2</span>
              <h4 className="font-bold text-white text-sm">Organise & follow up</h4>
              <p className="text-xs text-[#8A9CAE] leading-relaxed">
                Closecraft software brings leads into a shared workspace with assigned owners and next steps.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#111C26] border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-[#45bfae] uppercase tracking-wider">PILLAR 3</span>
              <h4 className="font-bold text-white text-sm">Handle conversation</h4>
              <p className="text-xs text-[#8A9CAE] leading-relaxed">
                Your team manages the lead, with optional DSS sales training or external sales closers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#111C26] border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-[#45bfae] uppercase tracking-wider">PILLAR 4</span>
              <h4 className="font-bold text-white text-sm">Record outcome</h4>
              <p className="text-xs text-[#8A9CAE] leading-relaxed">
                Track whether the deal was won, lost, or postponed. Hand won customers to delivery.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#090D12] border border-[#248277]/40 text-center text-xs sm:text-sm text-[#45bfae] font-semibold">
            “Closecraft helps us handle what happens after someone responds to our advertising, so more suitable opportunities can progress towards a sale.”
          </div>
        </section>

        {/* 7. FAQs */}
        <section id="faq" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Frequently asked questions
            </h2>
            <p className="text-xs sm:text-sm text-[#A7B7C7]">
              Clear answers about our lead generation and follow-up support.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#111C26] border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base text-white">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-[#8A9CAE] transition-transform shrink-0 ${
                      openFaq === idx ? 'rotate-180 text-[#45bfae]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[#A7B7C7] leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 8. Bottom CTA Banner */}
        <section className="p-8 sm:p-12 rounded-3xl bg-[#090D12] border border-[#248277]/40 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to bring in enquiries you can actually follow up?
          </h2>
          <p className="text-sm text-[#A7B7C7] max-w-xl mx-auto leading-relaxed">
            Take our 2-minute readiness review to evaluate your offer, advertising budget, and follow-up capacity.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowAssessment(true)}
              className="px-8 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm sm:text-base inline-flex items-center gap-2 shadow-lg shadow-[#248277]/20 transition-all active:scale-95"
            >
              <span>Discuss my campaign</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </main>

      {/* Interactive Assessment Modal */}
      <FindRightSupportModal
        isOpen={showAssessment}
        onClose={() => setShowAssessment(false)}
        initialTrack="LEAD_GENERATION"
      />
    </div>
  );
}
