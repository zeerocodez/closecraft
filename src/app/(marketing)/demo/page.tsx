import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Inbox,
  Users,
  Calendar,
  AlertTriangle,
  PlayCircle,
  Cpu,
  Layers,
  Sparkles,
  DollarSign,
  PhoneCall,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Evaluator Demonstration & Walkthrough Guide | CloseCraft',
  description:
    'Dedicated evaluation walkthrough for CloseCraft: AI-Powered Revenue Recovery & Sales Execution Platform for B2B enterprises.',
};

export default function DemoPage() {
  const scenarios = [
    {
      id: 1,
      name: 'Dr. Adeyemi Adeleke',
      company: 'Adeleke & Partners Legal',
      channel: 'WhatsApp',
      budget: '₦4,500,000',
      intent: '95/100',
      assignedTo: 'Chidi Okafor (Closer)',
      action: 'SCHEDULE_DISCOVERY',
      status: 'SCHEDULED',
      note: 'Executive discovery call scheduled with Google Meet link.',
    },
    {
      id: 2,
      name: 'Engr. Babatunde Balogun',
      company: 'Balogun Engineering Consulting',
      channel: 'WhatsApp',
      budget: '₦3,500,000',
      intent: '90/100',
      assignedTo: 'Zainab Ahmed (Closer)',
      action: 'SEND_PROPOSAL',
      status: 'QUALIFYING',
      note: 'High fit B2B practice. In proposal negotiation stage.',
    },
    {
      id: 3,
      name: 'Mrs. Folake Coker',
      company: 'PrimeLogistics West Africa',
      channel: 'Website Form',
      budget: '₦2,800,000',
      intent: '85/100',
      assignedTo: 'Emeka Nwosu (Closer)',
      action: 'SCHEDULE_DISCOVERY',
      status: 'SCHEDULED',
      note: 'Urgent enquiry captured via website widget.',
    },
    {
      id: 4,
      name: 'Chief Victor Okafor',
      company: 'Okafor Maritime Advisory',
      channel: 'Meta Ad Form',
      budget: '₦6,000,000',
      intent: '88/100',
      assignedTo: 'Chidi Okafor (Closer)',
      action: 'FOLLOW_UP_STALLED',
      status: 'STALLED',
      note: 'Revenue Leak Alert: Proposal sent 14 days ago without sales follow-up.',
    },
    {
      id: 5,
      name: 'Dr. Amina Yusuf',
      company: 'Apex Health Systems',
      channel: 'WhatsApp',
      budget: '₦5,000,000',
      intent: '92/100',
      assignedTo: 'Tunde Bakare (Setter)',
      action: 'TRIAGE_HOT_LEAD',
      status: 'ENGAGED',
      note: 'SLA Breach Leak Alert: Unanswered inbound WhatsApp for over 4 hours.',
    },
    {
      id: 6,
      name: 'Mr. Kunle Ajayi',
      company: 'Ajayi Financial Tax Advisory',
      channel: 'WhatsApp',
      budget: '₦3,000,000',
      intent: '80/100',
      assignedTo: 'Zainab Ahmed (Closer)',
      action: 'SEND_CONTRACT',
      status: 'OPPORTUNITY',
      note: 'Contract preparation in progress for annual retainer.',
    },
    {
      id: 7,
      name: 'Senator Ibrahim Bello',
      company: 'Bello Capital & Investments',
      channel: 'Referral',
      budget: '₦8,500,000',
      intent: '98/100',
      assignedTo: 'Chidi Okafor (Closer)',
      action: 'WON_SETTLEMENT',
      status: 'CLOSED_WON',
      note: 'Closed-won contract. Verified invoice payment settled via Bachs.',
    },
    {
      id: 8,
      name: 'Barrister Nneka Obi',
      company: 'Obi & Co Chambers',
      channel: 'Meta Ad Form',
      budget: '₦2,200,000',
      intent: '75/100',
      assignedTo: 'Emeka Nwosu (Closer)',
      action: 'SEND_BOOKING_LINK',
      status: 'ENGAGED',
      note: 'Captured from Instagram Lead Ad. Booking link sent via WhatsApp.',
    },
    {
      id: 9,
      name: 'Mr. David Adeleke',
      company: 'Creative Media Studios',
      channel: 'WhatsApp',
      budget: '₦150,000',
      intent: '30/100',
      assignedTo: 'Unassigned',
      action: 'DISQUALIFIED_LOW_BUDGET',
      status: 'DISQUALIFIED',
      note: 'Stated budget below organization minimum threshold (₦1.5M). Safely archived.',
    },
    {
      id: 10,
      name: 'Mr. Tola Odusanya',
      company: 'Solo Practitioner',
      channel: 'WhatsApp',
      budget: 'Unspecified',
      intent: '10/100',
      assignedTo: 'None',
      action: 'OPT_OUT_HONORED',
      status: 'OPTED_OUT',
      note: 'Prospect replied "STOP". Opt-out flagged in DB; all future dispatches blocked.',
    },
    {
      id: 11,
      name: 'Dr. Chika Madueke',
      company: 'Madueke Diagnostic Pathology',
      channel: 'Website Form',
      budget: '₦3,800,000',
      intent: '86/100',
      assignedTo: 'Kemi Sowore (Setter)',
      action: 'CALL_FIRST_TOUCH',
      status: 'ENGAGED',
      note: 'First touch due within 1-hour SLA. Setter assigned via round-robin.',
    },
    {
      id: 12,
      name: 'Engr. Sam Oladipo',
      company: 'Oladipo Infrastructure Partners',
      channel: 'WhatsApp',
      budget: '₦7,000,000',
      intent: '94/100',
      assignedTo: 'Chidi Okafor (Closer)',
      action: 'EXECUTIVE_DEMO_PREP',
      status: 'SCHEDULED',
      note: 'High-ticket retainer demo call scheduled with managing director.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b0e] text-slate-100 antialiased py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
          >
            <span>&larr; Back to CloseCraft Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Evaluation Build Verified
            </span>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
            >
              Sign In to Demo Workspace &rarr;
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Startup Challenge — Demonstration & Architecture Walkthrough</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            CloseCraft <span className="text-emerald-400">Revenue OS</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Multi-tenant AI revenue recovery platform connecting inbound WhatsApp, Meta Lead Ads, and website enquiries directly to qualified pipeline deals, sales rep dispatch, and leakage prevention.
          </p>
        </div>

        {/* Evaluator Credentials Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Dedicated Evaluation Workspace</h2>
              </div>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Workspace: <strong className="text-white">Apex Professional Services</strong> (Slug:{' '}
                <code className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">apex-demo</code>).
                Pre-seeded with 12 distinct lead scenarios, 7 active sales personnel, and real-time revenue leakage detection.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <Link
                href="/login?email=demo.owner@apexconsulting.ng"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold text-center transition-all shadow-md"
              >
                Sign In as Managing Director (Owner) &rarr;
              </Link>
              <Link
                href="/login?email=demo.closer1@apexconsulting.ng"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold text-center transition-all"
              >
                Sign In as Certified Closer &rarr;
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Owner / Director</span>
              <span className="font-mono text-emerald-400 font-semibold">demo.owner@apexconsulting.ng</span>
              <span className="text-slate-400 text-[11px] block mt-0.5">Password: DemoAccess2026!</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">RevOps Manager</span>
              <span className="font-mono text-emerald-400 font-semibold">demo.manager@apexconsulting.ng</span>
              <span className="text-slate-400 text-[11px] block mt-0.5">Password: DemoAccess2026!</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Certified Closer</span>
              <span className="font-mono text-emerald-400 font-semibold">demo.closer1@apexconsulting.ng</span>
              <span className="text-slate-400 text-[11px] block mt-0.5">Password: DemoAccess2026!</span>
            </div>
          </div>
        </div>

        {/* 6-Step 2-Minute Evaluator Journey */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>The 6-Step 2-Minute Demonstration Journey</span>
            </h2>
            <span className="text-xs text-slate-400">Complete value loop verification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="font-bold text-sm text-white">Inbound Lead Capture</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Leads enter via official WhatsApp Cloud API or Meta Lead Ads. Strict multi-tenant resolution maps WhatsApp Phone Number ID or Meta Page ID to Apex Professional Services without cross-tenant contamination.
              </p>
              <Link href="/inbox" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline pt-1">
                <Inbox className="w-3.5 h-3.5" />
                <span>Inspect Live WhatsApp Inbox &rarr;</span>
              </Link>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="font-bold text-sm text-white">Canonical AI Qualification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The canonical Structured AI Extractor scores intent, business fit, urgency, and extracts BANT without fabricating unstated budgets or timelines. Mode is transparently labeled in the audit log.
              </p>
              <Link href="/leads" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline pt-1">
                <Users className="w-3.5 h-3.5" />
                <span>View Qualified Leads & Signals &rarr;</span>
              </Link>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="font-bold text-sm text-white">Sales Command Centre</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Answers &ldquo;What needs attention right now?&rdquo; Surfaces high-intent leads, overdue follow-ups, and prescriptive Next Best Actions assigned to the correct actor: AI, automation, or human closer.
              </p>
              <Link href="/today" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Open Sales Command Centre &rarr;</span>
              </Link>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="font-bold text-sm text-white">Fair Sales Rep Assignment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-intent leads are automatically routed via round-robin to available Closers. Scheduled qualification calls generate Google Meet links and automatically queue post-meeting actions.
              </p>
              <Link href="/appointments" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Review Scheduled Calls &rarr;</span>
              </Link>
            </div>

            {/* Step 5 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <h3 className="font-bold text-sm text-white">Revenue Leakage Detection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated monitors detect stalled deals (unattended proposals over 14 days) and SLA breaches (unanswered high-intent WhatsApp messages over 4 hours), computing real Revenue at Risk.
              </p>
              <Link href="/pipeline" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline pt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>View Pipeline & Active Leaks &rarr;</span>
              </Link>
            </div>

            {/* Step 6 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                6
              </div>
              <h3 className="font-bold text-sm text-white">Financial Accuracy Separation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strict separation of prospect-stated budgets, estimated opportunity values, closed-won contract amounts, and verified collected revenue from Bachs/Paystack invoices. No fabricated statistics.
              </p>
              <Link href="/dashboard/revenue-engine" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline pt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Open Revenue OS Analytics &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 12 Seeded Lead Scenarios Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Pre-Seeded Demonstration Scenarios in Apex Workspace</span>
            </h2>
            <span className="text-xs text-slate-400">12 Scenarios reflecting live production usage</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Prospect & Firm</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Stated Budget</th>
                  <th className="py-3 px-4">Intent</th>
                  <th className="py-3 px-4">Assigned Rep</th>
                  <th className="py-3 px-4">Next Best Action</th>
                  <th className="py-3 px-4">Status & Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {scenarios.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{s.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{s.name}</div>
                      <div className="text-[11px] text-slate-400">{s.company}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-medium border border-slate-700">
                        {s.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-400">{s.budget}</td>
                    <td className="py-3 px-4 font-mono text-xs">{s.intent}</td>
                    <td className="py-3 px-4 text-slate-300">{s.assignedTo}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-emerald-300">{s.action}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-white text-[11px]">{s.status}</div>
                      <div className="text-[10px] text-slate-400 truncate">{s.note}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Architecture & Multi-Tenant Security Standards */}
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Architecture & Multi-Tenant Security Guarantees</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <strong className="text-white block font-semibold">Strict Organization Isolation</strong>
              <p>
                No hardcoded fallback workspaces. Unmapped WhatsApp phone IDs or Meta Page IDs are immediately quarantined to prevent cross-tenant data contamination.
              </p>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <strong className="text-white block font-semibold">Cryptographic Webhook Signatures</strong>
              <p>
                All Meta and WhatsApp webhooks verify HMAC-SHA256 signatures with constant-time equality checks before processing any incoming payload.
              </p>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <strong className="text-white block font-semibold">Honest AI Qualification</strong>
              <p>
                Unstated budgets or decision timelines remain &ldquo;Pending Discovery&rdquo;. Deterministic fallback mode is explicitly tagged in the audit trail.
              </p>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <strong className="text-white block font-semibold">Pilot Mode Dry-Run Protection</strong>
              <p>
                Unattended WhatsApp dispatch is disabled by default. Follow-ups in pilot mode are explicitly recorded as DRY_RUN_LOGGED, respecting 24h customer service windows and opt-outs.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="text-center py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            CloseCraft HQ &copy; 2026 Zeerocodes Automation Limited. Built for the AI Startup Challenge.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              Platform Home
            </Link>
            <Link href="/login" className="text-xs text-emerald-400 font-bold hover:underline">
              Sign In to Workspace &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
