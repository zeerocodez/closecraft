'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  Workflow, 
  GraduationCap, 
  Target, 
  Sparkles,
  Loader2,
  DollarSign,
  TrendingDown,
  Layers,
  HelpCircle
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

type BottleneckType = 'RESPONSE_LAG' | 'LACK_OF_LEADS' | 'STALLED_PIPELINE' | 'SALES_SKILLS';
type VolumeType = 'UNDER_50' | '50_TO_200' | '200_TO_500' | 'OVER_500';
type DealValueType = 'UNDER_50K' | '50K_TO_250K' | '250K_TO_1M' | 'OVER_1M';
type ToolType = 'WHATSAPP_PHONES' | 'SPREADSHEET' | 'GENERIC_CRM' | 'NOTEPAD_MEMORY';

interface DiagnosticResult {
  stageNumber: string;
  stageName: string;
  solutionTitle: string;
  solutionHref: string;
  icon: React.ReactNode;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  monthlyLeakEstimate: string;
  primaryRationale: string;
  actionPlan: string[];
}

export default function FullDiagnosticAuditClient() {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Diagnostic inputs
  const [bottleneck, setBottleneck] = useState<BottleneckType>('RESPONSE_LAG');
  const [leadVolume, setLeadVolume] = useState<VolumeType>('50_TO_200');
  const [dealValue, setDealValue] = useState<DealValueType>('50K_TO_250K');
  const [currentTool, setCurrentTool] = useState<ToolType>('WHATSAPP_PHONES');

  // Contact info
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate diagnostic result based on inputs
  const result: DiagnosticResult = React.useMemo(() => {
    // Determine monthly leak estimate
    let leakEstimate = '₦300,000 – ₦750,000';
    if (leadVolume === '200_TO_500' || dealValue === '250K_TO_1M') {
      leakEstimate = '₦1,200,000 – ₦3,500,000';
    } else if (leadVolume === 'OVER_500' || dealValue === 'OVER_1M') {
      leakEstimate = '₦4,000,000 – ₦10,000,000+';
    }

    if (bottleneck === 'RESPONSE_LAG') {
      return {
        stageNumber: '02',
        stageName: 'CAPTURE & RESPOND',
        solutionTitle: 'CloseCraft Platform',
        solutionHref: '/platform',
        icon: <MessageSquare className="w-8 h-8 text-[#45bfae]" />,
        riskLevel: 'CRITICAL',
        monthlyLeakEstimate: leakEstimate,
        primaryRationale:
          'Your greatest commercial loss happens within the first 60 minutes after a lead reaches out. Inquiries sit unanswered in staff DMs, causing interested buyers to contact faster competitors. Centralizing all channels into CloseCraft with strict response SLAs will yield immediate revenue recovery.',
        actionPlan: [
          'Connect Meta ad forms, WhatsApp, and website leads into one unified inbox.',
          'Configure 15-minute response SLA countdowns with real-time manager alerts.',
          'Deploy approved business context AI to draft accurate product answers instantly.',
        ],
      };
    }

    if (bottleneck === 'STALLED_PIPELINE') {
      return {
        stageNumber: '03',
        stageName: 'FOLLOW UP & CONVERT',
        solutionTitle: 'Revenue Engine',
        solutionHref: '/revenue-engine',
        icon: <Workflow className="w-8 h-8 text-[#45bfae]" />,
        riskLevel: 'CRITICAL',
        monthlyLeakEstimate: leakEstimate,
        primaryRationale:
          'You are capturing leads, but deals die because reps rely on memory and lack a deterministic next action. Prospects go cold after the first call. Revenue Engine enforces structured follow-up scheduling, visual pipeline accountability, and automated overdue deal escalation.',
        actionPlan: [
          'Assign every active enquiry an explicit Next Best Action (Respond, Escalate, or Wait).',
          'Deploy visual Kanban and List pipelines to eliminate stalled opportunities.',
          'Set automated reminders and task countdowns for rep callbacks.',
        ],
      };
    }

    if (bottleneck === 'SALES_SKILLS') {
      return {
        stageNumber: '04',
        stageName: 'BUILD SALES CAPABILITY',
        solutionTitle: 'Digital Sales School (DSS)',
        solutionHref: '/dss',
        icon: <GraduationCap className="w-8 h-8 text-[#45bfae]" />,
        riskLevel: 'HIGH',
        monthlyLeakEstimate: leakEstimate,
        primaryRationale:
          'Software alone cannot compensate for ineffective discovery, timid price presentation, or poor objection handling. Your team needs practical sales conversation mastery. The Digital Sales School develops certified setters and closers equipped to turn qualified enquiries into closed transactions.',
        actionPlan: [
          'Train staff on remote appointment setting and structured discovery questions.',
          'Practice objection handling against CloseCraft AI Buyer role-play simulations.',
          'Implement standardized qualification criteria before sending commercial proposals.',
        ],
      };
    }

    // Default: LACK_OF_LEADS
    return {
      stageNumber: '01',
      stageName: 'ATTRACT',
      solutionTitle: 'Growth Services (Paid Meta Ads & High-Converting Pages)',
      solutionHref: '/services',
      icon: <Target className="w-8 h-8 text-[#45bfae]" />,
      riskLevel: 'HIGH',
      monthlyLeakEstimate: leakEstimate,
      primaryRationale:
        'Your follow-up team is underutilized because your customer acquisition engine is inconsistent or inefficient. You need tested creative assets, high-converting landing pages, and managed Meta advertising to generate qualified buyer demand that connects directly to your follow-up workflow.',
      actionPlan: [
        'Audit historical campaign data and build a high-intent audience targeting matrix.',
        'Deploy scroll-stopping AI-crafted visual creatives and direct-response landing pages.',
        'Synchronize all incoming Meta campaign leads directly into CloseCraft CRM.',
      ],
    };
  }, [bottleneck, leadVolume, dealValue]);

  async function handleSubmitDiagnostic(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const leadVolumeMap: Record<VolumeType, string> = {
      UNDER_50: 'Fewer than 50',
      '50_TO_200': '50–199',
      '200_TO_500': '200–500',
      OVER_500: '500 or more',
    };

    const bottleneckMap: Record<BottleneckType, string> = {
      RESPONSE_LAG: 'Enquiries sitting unanswered (Response Lag)',
      LACK_OF_LEADS: 'Need more inbound leads & ad creatives',
      STALLED_PIPELINE: 'Deals stalling in pipeline (Forgotten callbacks)',
      SALES_SKILLS: 'Team lacks objection handling and closing skills',
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          company: businessName,
          leadVolume: leadVolumeMap[leadVolume],
          primaryBottleneck: bottleneckMap[bottleneck],
          source: 'WEBSITE_AUDIT',
          type: 'AUDIT',
          buyingIntent: 'HIGH',
          message: `[FULL DIAGNOSTIC AUDIT]
Business: ${businessName}
Enquiry Volume: ${leadVolumeMap[leadVolume]}
Deal Size Range: ${dealValue}
Current Tracking: ${currentTool}
Primary Bottleneck: ${bottleneckMap[bottleneck]}
Recommended Stage: ${result.stageNumber}. ${result.stageName} (${result.solutionTitle})
Estimated Monthly Leak: ${result.monthlyLeakEstimate}`,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit diagnostic assessment. Please try again.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Pre-filled WhatsApp message for specialist connection
  const whatsappNumber = process.env.NEXT_PUBLIC_CLOSECRAFT_WHATSAPP_NUMBER || '2349026365853';
  const whatsappMessage = encodeURIComponent(
    `Hello CloseCraft Team, I just completed the Follow-Up Diagnostic Audit for ${businessName || 'my business'}.\n\nPrimary Bottleneck: ${bottleneck}\nRecommended Solution: ${result.stageNumber}. ${result.stageName} (${result.solutionTitle})\nEstimated Leak: ${result.monthlyLeakEstimate}\n\nI would like to discuss plugging this revenue leak.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

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
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={13} />
            <span>INTERACTIVE REVENUE DIAGNOSTIC</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Identify Where Your Business is Losing Sales to Forgotten Follow-Up.
          </h1>

          <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
            Answer 4 quick questions about your sales process to pinpoint your biggest revenue leak and receive an actionable recovery plan across our 4 connected growth stages.
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all ${
                  currentStep === step
                    ? 'w-10 bg-[#45bfae]'
                    : currentStep > step
                    ? 'w-6 bg-[#248277]'
                    : 'w-6 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: BOTTLENECK SELECTION */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-10 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] shadow-2xl space-y-8 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold uppercase">
                QUESTION 1 OF 3
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Where does your sales follow-up currently break down?
              </h2>
              <p className="text-xs sm:text-sm text-[#a1a1aa]">
                Select the biggest operational friction point in your current sales workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {[
                {
                  id: 'RESPONSE_LAG' as BottleneckType,
                  title: 'Inquiries sit unanswered in staff WhatsApps or DMs for hours',
                  desc: 'Leads arrive from ads or social media, but by the time reps reply, the prospect has gone cold or bought from someone else.',
                  tag: 'Stage 2: Capture & Respond',
                },
                {
                  id: 'STALLED_PIPELINE' as BottleneckType,
                  title: 'Reps forget callbacks and interested deals stall in our pipeline',
                  desc: 'We make the first contact, but callbacks are forgotten in spreadsheets. Deals linger without a clear next step.',
                  tag: 'Stage 3: Follow Up & Convert',
                },
                {
                  id: 'LACK_OF_LEADS' as BottleneckType,
                  title: 'We lack consistent inbound leads and need better ad creatives/pages',
                  desc: 'Our sales team has bandwidth, but our advertising campaigns are not generating enough qualified buyer enquiries.',
                  tag: 'Stage 1: Attract',
                },
                {
                  id: 'SALES_SKILLS' as BottleneckType,
                  title: 'Our reps struggle with objection handling, qualification, and closing',
                  desc: 'We get conversations, but reps struggle to hold discovery conversations, handle price resistance, or close high-ticket offers.',
                  tag: 'Stage 4: Build Sales Capability',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBottleneck(item.id)}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    bottleneck === item.id
                      ? 'bg-[#121c1a] border-[#248277] shadow-lg shadow-[#248277]/10'
                      : 'bg-[#101010] border-[#1f1f1f] hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.title}</span>
                    </div>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-xl">{item.desc}</p>
                  </div>
                  <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-[#45bfae]">
                      {item.tag}
                    </span>
                    {bottleneck === item.id && (
                      <CheckCircle2 size={16} className="text-[#45bfae]" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-3 px-6 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-[#248277]/25 cursor-pointer"
              >
                <span>Continue to Step 2</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: COMMERCIAL SCALE */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-10 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] shadow-2xl space-y-8 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold uppercase">
                QUESTION 2 OF 3
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Tell us about your commercial volume.
              </h2>
              <p className="text-xs sm:text-sm text-[#a1a1aa]">
                This allows the diagnostic algorithm to calculate your estimated monthly revenue leak.
              </p>
            </div>

            {/* Volume */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-300 block">
                Approximate Monthly Inbound Enquiries:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'UNDER_50' as VolumeType, label: 'Fewer than 50' },
                  { id: '50_TO_200' as VolumeType, label: '50 to 199' },
                  { id: '200_TO_500' as VolumeType, label: '200 to 499' },
                  { id: 'OVER_500' as VolumeType, label: '500+ leads' },
                ].map((vol) => (
                  <button
                    key={vol.id}
                    type="button"
                    onClick={() => setLeadVolume(vol.id)}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      leadVolume === vol.id
                        ? 'bg-[#248277] text-white border-[#45bfae] shadow-md'
                        : 'bg-[#101010] text-zinc-400 border-[#1f1f1f] hover:text-white'
                    }`}
                  >
                    {vol.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Deal Value */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-300 block">
                Average Revenue Per Closed Customer (Deal Size):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'UNDER_50K' as DealValueType, label: 'Under ₦50,000' },
                  { id: '50K_TO_250K' as DealValueType, label: '₦50,000 – ₦250,000' },
                  { id: '250K_TO_1M' as DealValueType, label: '₦250,000 – ₦1,000,000' },
                  { id: 'OVER_1M' as DealValueType, label: '₦1,000,000+' },
                ].map((deal) => (
                  <button
                    key={deal.id}
                    type="button"
                    onClick={() => setDealValue(deal.id)}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      dealValue === deal.id
                        ? 'bg-[#248277] text-white border-[#45bfae] shadow-md'
                        : 'bg-[#101010] text-zinc-400 border-[#1f1f1f] hover:text-white'
                    }`}
                  >
                    {deal.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Tool */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-300 block">
                How do you currently track and manage incoming leads?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'WHATSAPP_PHONES' as ToolType, label: 'WhatsApp Business on individual staff phones' },
                  { id: 'SPREADSHEET' as ToolType, label: 'Spreadsheets (Google Sheets / Excel)' },
                  { id: 'GENERIC_CRM' as ToolType, label: 'Generic CRM (HubSpot, Zoho, etc.)' },
                  { id: 'NOTEPAD_MEMORY' as ToolType, label: 'Paper notepads or salesperson memory' },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setCurrentTool(tool.id)}
                    className={`p-3.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      currentTool === tool.id
                        ? 'bg-[#142320] text-white border-[#248277]'
                        : 'bg-[#101010] text-zinc-400 border-[#1f1f1f] hover:text-white'
                    }`}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#1f1f1f]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="py-2.5 px-4 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="py-3 px-6 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-[#248277]/25 cursor-pointer"
              >
                <span>View Diagnostic Report</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: INSTANT REPORT & CONTACT DISPATCH */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in">
            {/* The Diagnostic Result Card */}
            <div className="p-6 sm:p-10 rounded-3xl bg-[#0c0c0e] border border-[#248277]/60 shadow-2xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#1f1f1f] gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#248277]/20 border border-[#248277]/40 text-[#45bfae] text-[10px] font-bold uppercase tracking-wider">
                    <span>DIAGNOSTIC FINDING</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Your Highest-Leverage Recovery Plan
                  </h2>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#141416] border border-white/10">
                    {result.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block">RECOMMENDED STAGE</span>
                    <span className="text-sm font-bold text-[#45bfae]">{result.stageNumber}. {result.stageName}</span>
                  </div>
                </div>
              </div>

              {/* Metric Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#101010] border border-[#1f1f1f] space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Estimated Monthly Loss</span>
                  <div className="text-lg font-black text-red-400 font-mono">{result.monthlyLeakEstimate}</div>
                  <p className="text-[10px] text-zinc-400">Lost revenue due to follow-up friction</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#101010] border border-[#1f1f1f] space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Operational Risk Level</span>
                  <div className="text-lg font-black text-amber-400 font-mono">{result.riskLevel}</div>
                  <p className="text-[10px] text-zinc-400">Based on response lag and tool friction</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#101010] border border-[#248277]/30 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Primary Solution</span>
                  <div className="text-sm font-bold text-white truncate">{result.solutionTitle}</div>
                  <Link href={result.solutionHref} className="text-[10px] text-[#45bfae] hover:underline inline-flex items-center gap-1">
                    <span>Explore solution details</span> &rarr;
                  </Link>
                </div>
              </div>

              {/* Rationale */}
              <div className="p-5 rounded-2xl bg-[#101010] border border-[#1f1f1f] space-y-2">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  Why this is your highest leverage move:
                </h4>
                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                  {result.primaryRationale}
                </p>
              </div>

              {/* 3-Step Action Plan */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Recommended 3-Step Action Plan:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {result.actionPlan.map((action, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#121214] border border-white/5 space-y-1.5">
                      <div className="w-6 h-6 rounded-lg bg-[#248277]/20 text-[#45bfae] flex items-center justify-center font-mono text-xs font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-zinc-300 leading-snug">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submission & Dispatch Form */}
            {!submitted ? (
              <div className="p-6 sm:p-10 rounded-3xl bg-[#0c0c0e] border border-[#1f1f1f] shadow-2xl space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-bold uppercase">
                    SAVE &amp; DISPATCH REPORT
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    Receive your customized audit report and discuss with an advisor.
                  </h3>
                  <p className="text-xs text-[#a1a1aa]">
                    We will save this diagnostic assessment to your profile and prepare tailored follow-up automation recommendations.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitDiagnostic} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-400">Business / Company Name</label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Acme Commercial Ltd"
                        className="w-full py-2.5 px-3 rounded-xl bg-[#141416] border border-[#222226] text-white text-xs focus:border-[#45bfae] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-400">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Alex Okonkwo"
                        className="w-full py-2.5 px-3 rounded-xl bg-[#141416] border border-[#222226] text-white text-xs focus:border-[#45bfae] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-400">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="alex@acme.com"
                        className="w-full py-2.5 px-3 rounded-xl bg-[#141416] border border-[#222226] text-white text-xs focus:border-[#45bfae] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-400">WhatsApp / Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full py-2.5 px-3 rounded-xl bg-[#141416] border border-[#222226] text-white text-xs focus:border-[#45bfae] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#248277]/25 cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Saving Diagnostic Assessment...</span>
                        </>
                      ) : (
                        <>
                          <span>Save Assessment &amp; Receive Report</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-8 sm:p-10 rounded-3xl bg-[#0c1a17] border border-[#248277] text-center space-y-6 shadow-2xl animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-[#248277]/20 border border-[#248277] text-[#45bfae] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-white">
                    Diagnostic Assessment Recorded Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-md mx-auto leading-relaxed">
                    We have mapped your follow-up profile. Connect with our growth team on WhatsApp to review your numbers or launch a trial workspace.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs sm:text-sm shadow-xl transition-all inline-flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} />
                    <span>Discuss Findings on WhatsApp</span>
                  </a>

                  <Link
                    href="/signup"
                    className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#248277]/20 inline-flex items-center justify-center gap-2"
                  >
                    <span>Launch 7-Day Free Trial</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

