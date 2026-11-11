'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Users,
  TrendingUp,
  Headphones,
  FileCheck2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PhoneCall,
  Clock,
  Layers,
} from 'lucide-react';

interface AssessmentForm {
  contactName: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  currentLeads: string;
  primaryBottleneck: string;
  targetService: string;
}

export default function EarlyAccessClient() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedReference, setCompletedReference] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [formData, setFormData] = useState<AssessmentForm>({
    contactName: '',
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    industry: 'B2B Services',
    currentLeads: '10-50 leads/mo',
    primaryBottleneck: 'Slow follow-up & qualification',
    targetService: 'FULL_GROWTH_SYSTEM',
  });

  const handleInputChange = (field: keyof AssessmentForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getRecommendedPackage = () => {
    if (formData.currentLeads === 'Under 10 leads/mo' || formData.primaryBottleneck === 'Not enough new enquiries') {
      return {
        title: 'Managed Facebook & Instagram Lead Generation',
        slug: 'meta-ad-acquisition',
        price: '₦180,000/mo',
        description: 'Targeted paid customer acquisition on Meta & Instagram, connected directly to 15-minute qualification workflows.',
        sla: '7 Days Setup SLA',
        highlights: [
          'Custom creative design & ad copywriting',
          'Pixel, conversion API & lead routing integration',
          'Audience targeting & continuous split testing',
          'Instant CRM lead synchronization',
        ],
      };
    }

    if (formData.primaryBottleneck === 'Closing high-value deals' || formData.targetService === 'SALES_CLOSING') {
      return {
        title: 'High-Ticket Remote Sales Closing',
        slug: 'high-ticket-sales-closing',
        price: '₦250,000/mo',
        description: 'Elite remote sales closers vetted and trained through DSS to manage pipeline discovery, negotiations, and deal closing.',
        sla: 'Dedicated Certified Closer',
        highlights: [
          'Discovery & solution consultation calls',
          'Objection handling & value-based negotiation',
          'Pipeline management & deal acceleration',
          'Strict audit trail & call recording reviews',
        ],
      };
    }

    return {
      title: 'Dedicated Remote Appointment Setting',
      slug: 'remote-appointment-setting',
      price: '₦150,000/mo',
      description: 'Dedicated sales development representatives qualifying incoming leads and booking confirmed meetings directly into your sales calendar.',
      sla: '15-Minute Response SLA',
      highlights: [
        'Rapid multi-channel qualification (WhatsApp, phone, email)',
        'Pre-call qualification filters & attendance confirmation',
        'Direct calendar booking into your team diary',
        'Transparent conversion reporting',
      ],
    };
  };

  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.contactName || !formData.contactEmail || !formData.companyName) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/services/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: formData.contactName,
          companyName: formData.companyName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          serviceType: 'EARLY_ACCESS',
          sourceAttribution: 'Early Access Landing Funnel',
          answers: {
            industry: formData.industry,
            currentLeads: formData.currentLeads,
            primaryBottleneck: formData.primaryBottleneck,
            targetService: formData.targetService,
            recommendedPackage: getRecommendedPackage().slug,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit early access assessment.');
      }

      setCompletedReference(data.reference || 'REQ-EA-CONFIRMED');
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting your application.');
    } finally {
      setSubmitting(false);
    }
  };

  const recommended = getRecommendedPackage();

  const faqs = [
    {
      q: 'What is the CloseCraft Early Access Programme?',
      a: 'CloseCraft Early Access is an invitation-backed onboarding track for businesses looking to unify lead acquisition, instant qualification, remote appointment setting, and sales closing into one predictable system. Early access partners receive subsidized onboarding rates and direct revenue strategist assignment.',
    },
    {
      q: 'Do you guarantee sales revenue or lead numbers?',
      a: 'No. CloseCraft provides managed marketing infrastructure, rigorous operational execution, qualified human personnel, and revenue intelligence software. We do not fabricate leads or guarantee speculative financial returns. All performance is grounded in genuine market demand and rigorous follow-up execution.',
    },
    {
      q: 'How does CloseCraft integrate with our existing team?',
      a: 'CloseCraft can operate as your complete remote revenue team or augment your current sales staff. If you already have closers, our appointment setters feed pre-qualified meetings into their calendar. If you have an in-house marketer, our CRM and setters handle the critical 15-minute qualification window.',
    },
    {
      q: 'How quickly can our campaigns and setters be deployed?',
      a: 'Once your onboarding details and intake requirements are completed, our technical setup SLA is 5 to 7 business days for campaign architecture, CRM routing, and setter deployment.',
    },
    {
      q: 'Are there long-term locked contracts?',
      a: 'No. All CloseCraft managed service packages operate on flexible 30-day terms. You retain complete ownership of your ad assets, lead database, customer contacts, and operational records.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Notification Banner */}
      <div className="bg-emerald-950/60 border-b border-emerald-800/40 px-4 py-2 text-center text-xs text-emerald-300 font-medium">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          CloseCraft 2.0 Early Access Cohort is actively accepting applications. Pilot rates locked for 30 days.
        </span>
      </div>

      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0a0f1d]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo variant="full" size="md" alt="Closecraft" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:inline"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <a
              href="#assessment-section"
              className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              Apply for Early Access
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-900/15 via-transparent to-transparent opacity-70" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            CloseCraft Early Access Programme
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
            From lead generation to sales closing.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              One integrated growth system.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Stop losing qualified prospects to sluggish follow-up. CloseCraft brings together targeted Meta & Google acquisition, under-15-minute response, vetted remote appointment setters, and high-ticket closers into one unified operational machine.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#assessment-section"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-900/20"
            >
              Start Free Assessment &rarr;
            </a>
            <Link
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              View Service Packages
            </Link>
          </div>

          {/* Metric Highlights */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <Clock className="w-4 h-4" /> &lt; 15 Mins
              </div>
              <div className="text-slate-200 font-bold text-sm">Response Window</div>
              <div className="text-slate-400 text-xs mt-0.5">Automated multi-channel reach</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold mb-1">
                <Target className="w-4 h-4" /> 100% Vetted
              </div>
              <div className="text-slate-200 font-bold text-sm">Remote Setters</div>
              <div className="text-slate-400 text-xs mt-0.5">Trained via Digital Sales School</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
                <Layers className="w-4 h-4" /> 5 Categories
              </div>
              <div className="text-slate-200 font-bold text-sm">Modular Services</div>
              <div className="text-slate-400 text-xs mt-0.5">Add services as you scale</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4" /> Strict Tenant
              </div>
              <div className="text-slate-200 font-bold text-sm">Data Isolation</div>
              <div className="text-slate-400 text-xs mt-0.5">Encrypted workspace source of truth</div>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Fatal Revenue Bottlenecks */}
      <section className="py-16 bg-slate-950/80 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">The Revenue Leakage Reality</h2>
            <p className="text-3xl font-extrabold text-white">Why most businesses lose 60% of their enquiries</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400 font-bold mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Sluggish Lead Follow-Up</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  When a prospective buyer submits an enquiry on Facebook or Google, their intent drops by over 80% if not contacted within 15 minutes. Most teams reply hours or days later.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> CloseCraft delivers instant 15-minute qualification.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400 font-bold mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Hiring Remote Sales Talent is Risky</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Recruiting, onboarding, and monitoring commission-only reps without standardized playbooks leads to ghosting, unprofessional communication, and wasted pipeline value.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Pre-vetted, certified DSS setters and closers.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400 font-bold mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Fragmented & Blind Systems</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Ads run in Meta Ads Manager, leads sit in personal WhatsApp chats, appointments get lost in Google Calendar, and executives have no verifiable visibility into where revenue is stalling.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> One unified Sales Command Centre.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works: The 5-Pillar Operating Architecture */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Operational Framework</h2>
            <p className="text-3xl font-extrabold text-white">How CloseCraft powers your revenue loop</p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-emerald-400 text-xs font-bold uppercase mb-2">Pillar 1</div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Acquisition
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Managed Meta and Google advertising targeting high-intent decision makers, connected to dedicated funnels.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-emerald-400 text-xs font-bold uppercase mb-2">Pillar 2</div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-400" /> Rapid Triage
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated CRM ingestion with WhatsApp and SMS notifications alerting reps within seconds of form submission.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-emerald-400 text-xs font-bold uppercase mb-2">Pillar 3</div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-cyan-400" /> Setting
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trained remote SDRs conduct qualification calls, filter out unqualified prospects, and book warm meetings.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-emerald-400 text-xs font-bold uppercase mb-2">Pillar 4</div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Closing
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-ticket closers conduct discovery and proposal presentations to negotiate terms and collect payment.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-emerald-400 text-xs font-bold uppercase mb-2">Pillar 5</div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" /> Enablement
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Continuous playbooks, AI roleplay simulations, and DSS sales coaching keep reps sharp and audit-compliant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Assessment & Early Access Application Section */}
      <section id="assessment-section" className="py-20 bg-[#090e1a] border-t border-slate-800/90 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 uppercase tracking-widest">
              Application & Diagnostic
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-3">Find Your Recommended Growth Stack</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Answer 4 quick questions. Our Revenue Engine will analyze your current sales barrier and configure your tailored package.
            </p>
          </div>

          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-10">
            {step < 3 && (
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>Step {step} of 2</span>
                  <span>{step === 1 ? 'Business Profile' : 'Sales Diagnostic'}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: step === 1 ? '50%' : '100%' }}
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Step 1: Business Profile */}
            {step === 1 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!formData.contactName || !formData.contactEmail || !formData.companyName) {
                    setErrorMsg('Please fill in your name, business name, and email address.');
                    return;
                  }
                  setErrorMsg(null);
                  setStep(2);
                }}
                className="space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      placeholder="e.g. Samuel Adebayo"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Business / Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="e.g. Zenith Tech Solutions"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Work Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="samuel@zenithtech.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Industry / Business Type
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="B2B Services">B2B Corporate & Consulting</option>
                    <option value="Technology & SaaS">Technology & Software</option>
                    <option value="Real Estate">Real Estate & Property Development</option>
                    <option value="Education & Professional Training">Education & Academy</option>
                    <option value="High-Ticket Products">High-Ticket Consumer / Luxury Products</option>
                    <option value="Healthcare & Wellness">Healthcare & Medical Services</option>
                    <option value="Other">Other Enterprise Services</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all"
                  >
                    Next: Sales Diagnostic &rarr;
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Sales Diagnostic */}
            {step === 2 && (
              <form onSubmit={handleSubmitAssessment} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    How many enquiries / leads does your business receive each month?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['Under 10 leads/mo', '10-50 leads/mo', '50-200 leads/mo', '200+ leads/mo'].map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleInputChange('currentLeads', opt)}
                        className={`p-3 rounded-xl text-xs font-medium border text-center transition-all ${
                          formData.currentLeads === opt
                            ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    What is your biggest customer acquisition bottleneck right now?
                  </label>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {[
                      { label: 'Not enough new enquiries', sub: 'Need paid ad acquisition setup' },
                      { label: 'Slow follow-up & qualification', sub: 'Leads get cold before we contact them' },
                      { label: 'No dedicated appointment setters', sub: 'We need qualified SDRs booking meetings' },
                      { label: 'Closing high-value deals', sub: 'Need experienced closers to pitch and convert' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.label}
                        onClick={() => handleInputChange('primaryBottleneck', item.label)}
                        className={`p-3.5 rounded-xl text-left border transition-all ${
                          formData.primaryBottleneck === item.label
                            ? 'bg-emerald-950/70 border-emerald-500 text-white font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-200">{item.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Primary Service Interest
                  </label>
                  <select
                    value={formData.targetService}
                    onChange={(e) => handleInputChange('targetService', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FULL_GROWTH_SYSTEM">Full Integrated System (Ads + Setting + Closing)</option>
                    <option value="LEAD_GENERATION">Lead Generation Only (Meta & Google Ads)</option>
                    <option value="APPOINTMENT_SETTING">Remote Appointment Setting Only</option>
                    <option value="SALES_CLOSING">High-Ticket Sales Closing Only</option>
                    <option value="SALES_ENABLEMENT">Sales Training & DSS Enablement Playbooks</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-400 leading-relaxed">
                    By submitting your assessment, you will receive our recommended service architecture and access your personalized workspace. No credit card is required to submit this assessment.
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Analyzing & Submitting...' : 'See My Recommendation &rarr;'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Recommendation & Activation */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center py-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-400 mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Assessment Complete!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Application Reference:{' '}
                    <span className="font-mono text-emerald-400 font-bold">{completedReference}</span>
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0e1628] border border-emerald-500/40 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                      Recommended Stack for {formData.companyName}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{recommended.sla}</span>
                  </div>

                  <h4 className="text-xl font-bold text-white mb-2">{recommended.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{recommended.description}</p>

                  <div className="text-2xl font-extrabold text-white mb-4">
                    {recommended.price}{' '}
                    <span className="text-xs font-normal text-slate-400">/ 30-day term</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    {recommended.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/signup?intent=early-access&email=${encodeURIComponent(
                        formData.contactEmail
                      )}&name=${encodeURIComponent(formData.contactName)}&company=${encodeURIComponent(
                        formData.companyName
                      )}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md"
                    >
                      Create Account & Access Workspace &rarr;
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
                    >
                      Compare All Packages
                    </Link>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                  A confirmation email with your reference has been dispatched to{' '}
                  <strong className="text-slate-200">{formData.contactEmail}</strong>. Our revenue team will review your diagnostic within 2 business hours.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Built on Reliable Infrastructure</h3>
            <p className="text-2xl font-bold text-white">Enterprise Standards for High-Performing Teams</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Strict Multi-Tenant Security</h4>
              <p className="text-xs text-slate-400">
                Your leads, deals, recordings, and conversations remain completely isolated at the database level.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
              <FileCheck2 className="w-8 h-8 text-teal-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Transparent Auditability</h4>
              <p className="text-xs text-slate-400">
                Every action, call attempt, and status update has an immutable timestamp and owner assignment.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
              <Headphones className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Dedicated Growth Support</h4>
              <p className="text-xs text-slate-400">
                Your account manager coordinates deliverables, reviews conversion data, and adjusts strategy continuously.
              </p>
            </div>
          </div>

          {/* Legal Compliance Disclaimer */}
          <div className="mt-12 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-[11px] text-slate-500 leading-relaxed max-w-3xl mx-auto">
            <strong>Notice & Operating Standard:</strong> CloseCraft provides managed sales and marketing infrastructure, vetted personnel, and revenue intelligence software. We do not advertise, promise, or fabricate guaranteed revenue outcomes or speculative lead quotas. Results depend on your product-market fit, offer positioning, and joint execution.
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#070b12]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Got Questions?</h3>
            <p className="text-2xl font-bold text-white">Frequently Asked Questions</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-white hover:text-emerald-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} CloseCraft Technologies Limited. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">
              Pricing
            </Link>
            <Link href="/dss" className="hover:text-slate-300 transition-colors">
              Digital Sales School
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
