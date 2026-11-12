'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  Award,
  FileCheck2,
  PhoneCall,
  Briefcase,
  Users2,
  CalendarCheck2,
  Target,
  BarChart3,
  Building2
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import FindRightSupportModal from '@/components/marketing/FindRightSupportModal';

export default function SalesOutsourcingClient() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const outsourcingFeatures = [
    {
      icon: Users2,
      title: 'Full Dedicated Revenue Team',
      desc: 'Receive qualified appointment setters, senior closers, and an account manager focused exclusively on working your inbound and outbound pipeline.',
    },
    {
      icon: Target,
      title: 'Proven Enterprise Playbooks',
      desc: 'We construct custom battle-tested objection trees, qualifying scripts, and follow-up cadences tailored directly to your high-ticket offer.',
    },
    {
      icon: BarChart3,
      title: 'End-to-End Pipeline Visibility',
      desc: 'Every call recording, CRM stage progression, lead status, and meeting note is synchronized directly inside your CloseCraft client workspace.',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Hiring & Training Overhead',
      desc: 'Skip the costly 3-month recruiter search and ramp period. Our talent is pre-vetted, certified, and supervised daily by seasoned sales leaders.',
    },
  ];

  const operationalStages = [
    {
      step: '01',
      title: 'Offer Diagnostic & Economics Mapping',
      desc: 'We analyze your current conversion rates, unit economics, target buyer persona, and average deal size to calibrate staffing ratios.',
    },
    {
      step: '02',
      title: 'Scripting & Cadence Engineering',
      desc: 'Our team formulates strict multi-touch follow-up rules, discovery questions, and calendar booking flows that prevent deal leakage.',
    },
    {
      step: '03',
      title: 'Deployment & Live Activation',
      desc: 'Certified remote representatives begin engaging inbound leads within 15 minutes and prospecting qualified accounts under manager oversight.',
    },
    {
      step: '04',
      title: 'Ongoing Quality Assurance & Review',
      desc: 'Weekly executive performance reviews, transcript spot-checks, and pipeline adjustments keep conversion velocity high.',
    },
  ];

  const faqs = [
    {
      q: 'What is managed sales outsourcing with CloseCraft?',
      a: 'Managed sales outsourcing provides your business with a complete, fully trained remote sales team—including appointment setters, high-ticket closers, and pipeline supervisors—handling your leads from initial enquiry to signed agreement.',
    },
    {
      q: 'How fast can our outsourced sales team deploy?',
      a: 'Following your onboarding diagnostic and playbook calibration, your dedicated representatives typically activate within 5 to 7 business days.',
    },
    {
      q: 'How do you prevent reps from misrepresenting our brand?',
      a: 'All representatives operate under strict certified playbooks. Calls and chat transcripts are recorded and audited daily by our quality assurance managers, with zero tolerance for manipulative or inaccurate promises.',
    },
    {
      q: 'What tools and CRM do you operate on?',
      a: 'We integrate directly with your CloseCraft SaaS workspace, and can synchronize updates into HubSpot, Salesforce, or your existing lead database via automated webhooks.',
    },
    {
      q: 'Do you work on pure commission?',
      a: 'No. Professional sales infrastructure requires dedicated operational capacity, quality assurance, and talent retention. We operate on a transparent monthly retainer plus success-based performance incentives.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070A0E] text-white selection:bg-[#248277] selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-white/10 bg-[#070A0E]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center" aria-label="Closecraft Home">
            <Logo variant="full" size="md" alt="Closecraft" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/pricing"
              className="text-xs sm:text-sm text-[#A7B7C7] hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="/services/lead-generation"
              className="hidden sm:inline-block text-xs sm:text-sm text-[#A7B7C7] hover:text-white transition-colors"
            >
              Lead Gen
            </Link>
            <Link 
              href="/services/sales-closing"
              className="hidden sm:inline-block text-xs sm:text-sm text-[#A7B7C7] hover:text-white transition-colors"
            >
              Sales Closing
            </Link>
            <Link
              href="/early-access"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#248277] hover:bg-[#1f6f65] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(36,130,119,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#248277]/10 border border-[#248277]/30 text-[#45bfae] text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>Managed Revenue Operations</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
            Complete Sales Outsourcing <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#45bfae] to-[#248277]">
              Built For High-Ticket Growth
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#A7B7C7] max-w-2xl mx-auto leading-relaxed">
            Deploy an elite team of certified remote setters, closers, and pipeline managers. We handle inbound response, discovery calls, and contract execution—so you focus entirely on delivery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/early-access"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm transition-all shadow-lg shadow-[#248277]/20 flex items-center justify-center gap-2"
            >
              <span>Apply For Managed Outsourcing</span>
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={() => setShowAssessment(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Take 2-Min Fit Diagnostic</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-white/10 text-left">
            <div>
              <p className="text-2xl font-bold text-white">15 Min</p>
              <p className="text-xs text-[#8A9CAE] mt-0.5">Average First Response SLA</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#45bfae]">100%</p>
              <p className="text-xs text-[#8A9CAE] mt-0.5">DSS Certified Representatives</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Daily</p>
              <p className="text-xs text-[#8A9CAE] mt-0.5">Pipeline QA & Manager Audit</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#45bfae]">Zero</p>
              <p className="text-xs text-[#8A9CAE] mt-0.5">Internal Hiring Headaches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#0B1117]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Why Forward-Thinking Businesses Outsource With CloseCraft
            </h2>
            <p className="text-sm text-[#8A9CAE]">
              We replace fragmented freelancers and expensive internal trial-and-error with a disciplined, audited sales engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {outsourcingFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl bg-[#111C26] border border-white/10 space-y-3 hover:border-[#248277]/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#248277]/10 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white">{feat.title}</h3>
                  <p className="text-xs text-[#8A9CAE] leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Operational Workflow */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              How The Engagement Operates
            </h2>
            <p className="text-sm text-[#8A9CAE]">
              From strategy alignment to real-time sales execution in four disciplined steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {operationalStages.map((stage, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-[#0B1117] border border-white/10 space-y-3 relative flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-bold text-[#45bfae]/60 font-mono block mb-2">
                    {stage.step}
                  </span>
                  <h3 className="text-sm font-bold text-white mb-1.5">{stage.title}</h3>
                  <p className="text-xs text-[#8A9CAE] leading-relaxed">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scope Matrix */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#0B1117]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              What Is Included In Managed Sales Outsourcing
            </h2>
            <p className="text-sm text-[#8A9CAE]">
              Clear deliverables, zero hidden fees, and transparent governance.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111C26]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-white font-semibold">
                <tr>
                  <th className="p-4">Operational Deliverable</th>
                  <th className="p-4">CloseCraft Managed Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#A7B7C7]">
                <tr>
                  <td className="p-4 font-medium text-white">Inbound Lead Speed-to-Contact</td>
                  <td className="p-4">&lt; 15 minutes during standard operational hours</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Appointment Setting & Calendar Booking</td>
                  <td className="p-4">Direct qualification and sync to closer calendars</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Discovery & Closing Calls</td>
                  <td className="p-4">Conducted by senior certified closers on recorded lines</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Pipeline Governance & CRM Updates</td>
                  <td className="p-4">All notes, stages, next steps logged inside CloseCraft</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Quality Assurance & Supervision</td>
                  <td className="p-4">Dedicated Account Manager auditing transcripts daily</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Weekly Strategic Executive Briefing</td>
                  <td className="p-4">Conversion analytics, bottleneck review, and objection updates</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-[#8A9CAE]">
              Everything you need to know about partnering with CloseCraft for sales outsourcing.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-xl border border-white/10 bg-[#0B1117] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} className="text-[#45bfae]" /> : <ChevronDown size={16} className="text-[#8A9CAE]" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-[#8A9CAE] leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-gradient-to-b from-[#0B1117] to-[#070A0E]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-white">
            Stop Losing High-Value Enquiries to Slow Follow-Up
          </h2>
          <p className="text-xs sm:text-sm text-[#A7B7C7] max-w-xl mx-auto">
            Book a confidential revenue diagnostic or apply for Early Access to deploy an outsourced sales team that closes for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/early-access"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Apply For Early Access</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs sm:text-sm transition-colors"
            >
              Contact Sales Team
            </Link>
          </div>
        </div>
      </section>

      {/* Diagnostic Modal */}
      <FindRightSupportModal
        isOpen={showAssessment}
        onClose={() => setShowAssessment(false)}
        initialTrack="MANAGED_SALES"
      />
    </div>
  );
}
