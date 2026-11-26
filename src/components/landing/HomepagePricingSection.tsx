'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ArrowRight,
  Globe,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Database,
  Users,
  ShieldCheck,
} from 'lucide-react';

type MarketCode = 'NG' | 'US' | 'GB' | 'CA';
type BillingInterval = 'MONTHLY' | 'ANNUAL';

interface PlanView {
  code: 'STARTER' | 'GROWTH' | 'SCALE' | 'ENTERPRISE';
  name: string;
  tagline: string;
  recommended?: boolean;
  ctaLabel: string;
  ctaHref: string;
  prices: Record<MarketCode, number | null>;
  limits: {
    workspaces: string;
    leads: string;
    seats: string;
    aiOps: string;
  };
  features: string[];
}

const MARKET_META: Record<MarketCode, { label: string; symbol: string; currency: string }> = {
  NG: { label: 'Nigeria (NGN)', symbol: '₦', currency: 'NGN' },
  US: { label: 'United States (USD)', symbol: '$', currency: 'USD' },
  GB: { label: 'United Kingdom (GBP)', symbol: '£', currency: 'GBP' },
  CA: { label: 'Canada (CAD)', symbol: 'CA$', currency: 'CAD' },
};

const SAAS_PLANS: PlanView[] = [
  {
    code: 'STARTER',
    name: 'Starter',
    tagline: 'Solo entrepreneurs and early-stage businesses establishing daily follow-up.',
    ctaLabel: 'START FREE',
    ctaHref: '/signup?plan=STARTER',
    prices: { NG: 15000, US: 19, GB: 15, CA: 25 },
    limits: {
      workspaces: '1 Workspace',
      leads: '500 Active Leads',
      seats: '2 Team Members',
      aiOps: '250 AI Ops / mo',
    },
    features: [
      'One business workspace',
      'Maximum 500 active leads & contact records',
      'Up to 2 team members',
      'Basic sales pipeline & enquiry triage',
      'Follow-up reminders & basic reporting',
      'Limited AI qualification assistance',
    ],
  },
  {
    code: 'GROWTH',
    name: 'Growth',
    tagline: 'Growing businesses running active acquisition and multi-stage follow-up.',
    recommended: true,
    ctaLabel: 'START FREE',
    ctaHref: '/signup?plan=GROWTH',
    prices: { NG: 35000, US: 49, GB: 39, CA: 65 },
    limits: {
      workspaces: '1 Workspace',
      leads: '2,000 Active Leads',
      seats: '5 Team Members',
      aiOps: '1,000 AI Ops / mo',
    },
    features: [
      'One business workspace',
      'Maximum 2,000 active leads & segmentation',
      'Up to 5 team members with activity tracking',
      'Multi-channel WhatsApp & web lead management',
      'AI-powered lead qualification & reactivation tools',
      'Automated follow-up workflows & multiple stages',
    ],
  },
  {
    code: 'SCALE',
    name: 'Scale',
    tagline: 'Established sales teams handling high enquiry volumes across multiple pipelines.',
    ctaLabel: 'START FREE',
    ctaHref: '/signup?plan=SCALE',
    prices: { NG: 75000, US: 99, GB: 79, CA: 129 },
    limits: {
      workspaces: '1 Workspace (Multi-Pipeline)',
      leads: '10,000 Active Leads',
      seats: '15 Team Members',
      aiOps: '3,500 AI Ops / mo',
    },
    features: [
      'Up to 10,000 active leads & advanced segmentation',
      'Up to 15 team members & team intelligence',
      'Advanced AI qualification & follow-up automation',
      'Multiple independent sales pipelines',
      'Advanced revenue leakage & attribution analytics',
      'Priority support & higher AI allowance',
    ],
  },
  {
    code: 'ENTERPRISE',
    name: 'Enterprise',
    tagline: 'Multi-location organisations requiring custom capacities, branches, and agreed response targets (SLAs).',
    ctaLabel: 'TALK TO SALES',
    ctaHref: '#contact-sales',
    prices: { NG: null, US: null, GB: null, CA: null },
    limits: {
      workspaces: 'Multiple Workspaces / Branches',
      leads: 'Custom Lead Capacity',
      seats: 'Custom Team Capacity',
      aiOps: 'Custom AI Allowance',
    },
    features: [
      'Superadmin-configured lead & seat limits',
      'Multiple workspaces & branch-level isolation',
      'Advanced roles, permissions & audit governance',
      'Custom integrations & bespoke AI workflows',
      'Dedicated onboarding & Service Level Agreements (SLAs)',
      'Custom commercial quotation & invoicing',
    ],
  },
];

const RECOVERY_TIERS_PUBLIC = [
  { code: 'TIER_500', name: 'Tier 1 — Up to 500 Historical Leads', ngn: '₦25,000', usd: '$35', detail: 'Import, segmentation, context messaging & tracked responses.' },
  { code: 'TIER_2000', name: 'Tier 2 — 501 to 2,000 Historical Leads', ngn: '₦50,000', usd: '$69', detail: 'Multi-segment reactivation waves & objection tagging.' },
  { code: 'TIER_5000', name: 'Tier 3 — 2,001 to 5,000 Historical Leads', ngn: '₦100,000', usd: '$129', detail: 'High-volume campaign batching & closer handoff.' },
  { code: 'CUSTOM', name: '5,000+ Enterprise Reactivation', ngn: 'Custom Quote', usd: 'Custom Quote', detail: 'Dedicated data cleanup & staged regional delivery.' },
];

const SALES_ENABLEMENT_MODELS = [
  { tier: 'Foundation Sales Executive', range: '2% – 5%', model: 'Commission / Hybrid', desc: 'Trained DSS reps assigned for consistent lead response & appointment setting.' },
  { tier: 'Growth Revenue Executive', range: '5% – 10%', model: 'Commission / Retainer + Commission', desc: 'Experienced closers managing full negotiation & follow-up.' },
  { tier: 'Managed Dedicated Closing', range: '8% – 15%', model: 'Verified-Payment Commission', desc: 'End-to-end objection resolution and high-value closing.' },
  { tier: 'Managed Sales Pod (Team)', range: 'Monthly Retainer + Commission', model: 'Enterprise Team Agreement', desc: 'Multi-rep sales capacity audited by human review.' },
];

export function HomepagePricingSection({ onOpenEnterpriseModal }: { onOpenEnterpriseModal?: () => void }) {
  const [market, setMarket] = useState<MarketCode>('NG');
  const [interval, setInterval] = useState<BillingInterval>('MONTHLY');
  const [showCompare, setShowCompare] = useState(false);

  const meta = MARKET_META[market];

  const formatPlanPrice = (monthlyPrice: number | null) => {
    if (monthlyPrice === null) return 'Custom';
    const effective = interval === 'ANNUAL' ? monthlyPrice * 10 : monthlyPrice;
    return `${meta.symbol}${effective.toLocaleString()}`;
  };

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#1e1e1e] bg-[#060608]">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Heading + Trial Notice */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C7F36B]/10 border border-[#C7F36B]/30 text-[#C7F36B] text-[11px] font-mono font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>Workspace Pricing &amp; Commercial Infrastructure</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-white">
            Transparent Pricing Built for Real Revenue Operations
          </h2>

          <p className="text-sm sm:text-base text-zinc-400">
            Pricing is based primarily on business workspace and usage capacity — not per-user licence penalties.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101917] border border-[#248277]/40 text-xs font-semibold text-[#C7F36B]">
            <ShieldCheck size={15} className="text-[#45bfae]" />
            <span>Experience CloseCraft HQ free for 7 days. No credit card required.</span>
          </div>
        </div>

        {/* Regional Currency & Billing Interval Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#111114] border border-[#222226]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400 font-semibold inline-flex items-center gap-1.5 mr-1">
              <Globe size={14} className="text-[#45bfae]" />
              Market:
            </span>
            {(Object.keys(MARKET_META) as MarketCode[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setMarket(code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  market === code
                    ? 'bg-[#C7F36B] text-[#111827]'
                    : 'bg-[#1a1a1f] text-zinc-300 hover:bg-[#23232a]'
                }`}
              >
                {MARKET_META[code].label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-[#1a1a1f] p-1 rounded-xl border border-[#2a2a30]">
            <button
              type="button"
              onClick={() => setInterval('MONTHLY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                interval === 'MONTHLY' ? 'bg-white text-[#111827]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setInterval('ANNUAL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                interval === 'ANNUAL' ? 'bg-[#C7F36B] text-[#111827]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded bg-[#111827]/15 text-[10px] font-extrabold">
                ~2 Months Free
              </span>
            </button>
          </div>
        </div>

        {/* 4 Subscription Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SAAS_PLANS.map((plan) => {
            const monthly = plan.prices[market];
            const annualSavings = monthly !== null ? monthly * 2 : null;
            const isRecommended = Boolean(plan.recommended);
            const signupHref =
              plan.code === 'ENTERPRISE'
                ? '/signup?plan=ENTERPRISE'
                : `${plan.ctaHref}&market=${market}&interval=${interval}`;

            return (
              <div
                key={plan.code}
                className={`p-6 rounded-3xl flex flex-col justify-between gap-6 border transition-all ${
                  isRecommended
                    ? 'bg-gradient-to-b from-[#131e1c] to-[#0d1112] border-[#C7F36B] shadow-2xl shadow-[#C7F36B]/10'
                    : 'bg-[#101013] border-[#222227]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-heading font-extrabold text-white">{plan.name}</h3>
                    {isRecommended && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#C7F36B] text-[#111827] text-[10px] font-extrabold uppercase tracking-wider">
                        RECOMMENDED PLAN
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed min-h-[38px]">{plan.tagline}</p>

                  <div className="pt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-mono font-black text-white">
                        {formatPlanPrice(monthly)}
                      </span>
                      {monthly !== null && (
                        <span className="text-xs text-zinc-400">
                          / {interval === 'ANNUAL' ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    {monthly !== null && interval === 'ANNUAL' && annualSavings !== null && (
                      <p className="text-[11px] font-mono font-bold text-[#C7F36B] mt-1">
                        Save {meta.symbol}{annualSavings.toLocaleString()} / year (2 months free)
                      </p>
                    )}
                    {monthly === null && (
                      <p className="text-[11px] font-mono text-zinc-400 mt-1">
                        Custom quotation configured by Superadmin
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-[11px] font-mono text-zinc-300">
                    <div>{plan.limits.workspaces}</div>
                    <div>{plan.limits.leads}</div>
                    <div>{plan.limits.seats}</div>
                    <div className="text-[#45bfae]">{plan.limits.aiOps}</div>
                  </div>

                  <ul className="space-y-2 text-xs text-zinc-300 pt-1">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-[#C7F36B] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.code === 'ENTERPRISE' && onOpenEnterpriseModal ? (
                  <button
                    type="button"
                    onClick={onOpenEnterpriseModal}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-extrabold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{plan.ctaLabel}</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <Link
                    href={signupHref}
                    className={`w-full py-3 rounded-xl font-extrabold text-xs inline-flex items-center justify-center gap-2 transition-colors ${
                      isRecommended
                        ? 'bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827]'
                        : 'bg-[#1c1c22] hover:bg-[#272730] text-white border border-white/10'
                    }`}
                  >
                    <span>{plan.ctaLabel}</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Expandable Feature Comparison Table */}
        <div className="rounded-2xl bg-[#101013] border border-[#222227] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCompare((prev) => !prev)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div>
              <span className="text-sm font-bold text-white">Compare SaaS Plan Capacities &amp; Governance</span>
              <p className="text-xs text-zinc-400">
                Workspaces, active lead caps, team seats, AI operations, and Service Level Agreement (SLA) protections
              </p>
            </div>
            {showCompare ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
          </button>

          {showCompare && (
            <div className="overflow-x-auto border-t border-[#222227]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#16161a] text-zinc-300 border-b border-[#222227]">
                    <th className="p-4 font-bold">Capability</th>
                    <th className="p-4 font-bold">Starter</th>
                    <th className="p-4 font-bold text-[#C7F36B]">Growth</th>
                    <th className="p-4 font-bold">Scale</th>
                    <th className="p-4 font-bold">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e24] text-zinc-300">
                  <tr>
                    <td className="p-4 font-semibold text-white">Business Workspaces</td>
                    <td className="p-4">1</td>
                    <td className="p-4">1</td>
                    <td className="p-4">1 (Multi-Pipeline)</td>
                    <td className="p-4">Multiple / Branches</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Active Leads Cap</td>
                    <td className="p-4 font-mono">500</td>
                    <td className="p-4 font-mono text-[#C7F36B] font-bold">2,000</td>
                    <td className="p-4 font-mono">10,000</td>
                    <td className="p-4 font-mono">Configurable</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Team Seats</td>
                    <td className="p-4 font-mono">2</td>
                    <td className="p-4 font-mono">5</td>
                    <td className="p-4 font-mono">15</td>
                    <td className="p-4 font-mono">Configurable</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">AI Qualification &amp; Metering</td>
                    <td className="p-4">Limited allowance</td>
                    <td className="p-4">1,000 AI ops / mo</td>
                    <td className="p-4">3,500 AI ops / mo</td>
                    <td className="p-4">Custom Workflows &amp; Cap</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Trial &amp; Grace Protection</td>
                    <td className="p-4" colSpan={4}>
                      7-day free trial · 5-day payment grace period · Existing customer data is never deleted on expiry
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Separated Commercial Streams (Services + Lead Recovery + Sales Enablement) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stream B & C: Introductory Services & Lead Recovery Tiers */}
          <div className="p-6 rounded-3xl bg-[#101013] border border-[#222227] space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#45bfae] font-bold">
                  Independent Commercial Streams
                </span>
                <h3 className="text-lg font-heading font-extrabold text-white mt-1 flex items-center gap-2">
                  <Database size={18} className="text-[#C7F36B]" />
                  <span>Lead Recovery &amp; Introductory Services</span>
                </h3>
              </div>
              <Link
                href="/services"
                className="px-4 py-2 rounded-xl bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] font-extrabold text-xs shrink-0"
              >
                GET STARTED
              </Link>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Combine Meta/Instagram Ad Campaigns, AI Flyers, AI Videos, Landing Pages, or VSL Production in a custom quotation request — or run structured dormant lead reactivation waves powered by Bachs.io invoicing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {RECOVERY_TIERS_PUBLIC.map((tier) => (
                <div key={tier.code} className="p-3 rounded-xl bg-[#17171c] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">{tier.name}</span>
                  </div>
                  <div className="text-xs font-mono font-extrabold text-[#C7F36B]">
                    {market === 'NG' ? tier.ngn : tier.usd}
                  </div>
                  <p className="text-[11px] text-zinc-400">{tier.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stream D: Sales Enablement & DSS Commissions */}
          <div className="p-6 rounded-3xl bg-[#101013] border border-[#222227] space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#45bfae] font-bold">
                  Digital Sales School &amp; Closers
                </span>
                <h3 className="text-lg font-heading font-extrabold text-white mt-1 flex items-center gap-2">
                  <Users size={18} className="text-[#C7F36B]" />
                  <span>Sales Enablement &amp; Commission Structure</span>
                </h3>
              </div>
              {onOpenEnterpriseModal ? (
                <button
                  type="button"
                  onClick={onOpenEnterpriseModal}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-extrabold text-xs shrink-0 cursor-pointer"
                >
                  DISCUSS SALES SUPPORT
                </button>
              ) : (
                <Link
                  href="/signup?intent=sales-enablement"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-extrabold text-xs shrink-0"
                >
                  DISCUSS SALES SUPPORT
                </Link>
              )}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Need trained sales capacity to follow up and close your leads? Commissions accrue strictly upon verified customer payments and reverse automatically if an invoice is refunded.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SALES_ENABLEMENT_MODELS.map((item) => (
                <div key={item.tier} className="p-3 rounded-xl bg-[#17171c] border border-white/5 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Briefcase size={12} className="text-[#45bfae]" />
                    <span>{item.tier}</span>
                  </div>
                  <div className="text-xs font-mono font-extrabold text-[#C7F36B]">{item.range}</div>
                  <p className="text-[11px] text-zinc-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
