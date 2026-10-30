import Link from 'next/link';
import { Check } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export const metadata = {
  title: 'Pricing | Closecraft 7-Day Free Trial',
  description: 'Try Closecraft free for 7 days. Starter at ₦20,000/mo, Pro at ₦45,000/mo, Enterprise at ₦75,000/mo. No credit card required.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col pt-24 px-4 pb-20">
      <div className="max-w-6xl mx-auto w-full">
        {/* Navigation Bar */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center group py-1" aria-label="Closecraft Home">
            <Logo variant="full" size="md" alt="Closecraft" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface hover:text-primary transition-colors px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 shadow-sm"
            >
              &larr; Back to Home
            </Link>
            <Link
              href="/dss"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#45bfae] bg-[#248277]/15 hover:bg-[#248277]/25 px-3 py-1.5 rounded-lg border border-[#248277]/30 transition-colors shadow-sm"
            >
              DSS Academy &rarr;
            </Link>
          </div>
        </div>

        {/* Pricing Introduction (Section 4.C Approved Copy) */}
        <div className="text-center mb-12">
          <div className="eyebrow mb-3 text-primary text-xs font-bold uppercase tracking-widest">
            7-DAY FREE TRIAL
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
            Try Closecraft free for 7 days.
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Start with seven days of Starter access, then choose the paid workspace your team needs. No credit card is required to begin, and we will not charge you automatically when your trial ends.
          </p>
          <p className="text-xs text-on-surface-variant mt-3 italic">
            The free trial includes Starter features. Managed sales services and DSS training are priced separately.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* Starter Plan */}
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-on-surface">Starter</h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  7-Day Trial
                </span>
              </div>
              <p className="text-on-surface-variant text-xs mb-4">
                Lean teams, with 3 internal seats and up to 1,000 active leads/month
              </p>
              <div className="mb-6">
                <span className="text-3xl font-extrabold text-on-surface">₦20,000</span>
                <span className="text-on-surface-variant text-xs">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface font-medium"><strong>3 internal team seats</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface"><strong>Up to 1,000 active leads/month</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface">Shared enquiry workspace</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface">SLA tracking & leakage radar</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface">No credit card required</span>
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="w-full py-3 rounded-xl bg-primary text-on-primary text-center text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm block"
            >
              Start My 7-Day Free Trial
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-surface-container p-6 rounded-3xl border-2 border-primary flex flex-col justify-between relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow">
              Recommended for Teams
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-on-surface">Pro</h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">
                  Scale
                </span>
              </div>
              <p className="text-on-surface-variant text-xs mb-4">
                Growing teams, with 10 internal seats and automated lead distribution
              </p>
              <div className="mb-6">
                <span className="text-3xl font-extrabold text-on-surface">₦45,000</span>
                <span className="text-on-surface-variant text-xs">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface font-medium"><strong>10 internal team seats</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface"><strong>Automated lead distribution</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface">Round-robin lead routing</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface">Manager QA review queues</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface">Priority follow-up dispatch</span>
                </li>
              </ul>
            </div>
            <div>
              <Link
                href="/signup"
                className="w-full py-3 rounded-xl bg-primary text-on-primary text-center text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm block"
              >
                Start My 7-Day Free Trial
              </Link>
              <p className="text-[10px] text-on-surface-variant text-center mt-2">
                Your free trial includes Starter features. Upgrade to Pro after selecting a paid plan.
              </p>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-on-surface">Enterprise</h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-bold">
                  Custom
                </span>
              </div>
              <p className="text-on-surface-variant text-xs mb-4">
                Larger teams needing custom integrations and expanded capacity
              </p>
              <div className="mb-6">
                <span className="text-3xl font-extrabold text-on-surface">₦75,000</span>
                <span className="text-on-surface-variant text-xs">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface">Custom team seat allocations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface">Custom CRM & ERP integrations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface">SLA guarantees & audit logs</span>
                </li>
              </ul>
            </div>
            <a
              href="mailto:sales@closecrafthq.com?subject=Discuss%20Enterprise%20Inquiry"
              className="w-full py-3 rounded-xl border border-outline text-on-surface text-center text-xs font-semibold hover:bg-surface-container transition-colors block"
            >
              Discuss Enterprise
            </a>
          </div>

          {/* Managed Sales Engagement */}
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-on-surface">Managed Sales</h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Service
                </span>
              </div>
              <p className="text-on-surface-variant text-xs mb-4">
                Suitable businesses needing remote sales support with workspace access included
              </p>
              <div className="mb-6">
                <span className="text-2xl font-extrabold text-on-surface">From ₦150,000</span>
                <span className="text-on-surface-variant text-xs"> for 30 days</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface"><strong>Workspace access included</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface">Remote sales support for approved offers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface">Lead flow & offer economics review</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="text-primary shrink-0 w-4 h-4 mt-0.5" />
                  <span className="text-xs text-on-surface">Responsibilities confirmed before work begins</span>
                </li>
              </ul>
            </div>
            <a
              href="mailto:sales@closecrafthq.com?subject=Managed%20Sales%20Proposal%20Request"
              className="w-full py-3 rounded-xl border border-outline text-on-surface text-center text-xs font-semibold hover:bg-surface-container transition-colors block"
            >
              Request a Managed Sales Proposal
            </a>
          </div>
        </div>

        {/* Commercial terms footer */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-xs text-on-surface-variant">
            No automatic charge at trial expiry. Choose and pay for a plan to continue using paid features.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://wa.me/2349026365853?text=Hello%20Closecraft%2C%20I%20have%20a%20question%20about%20Closecraft%20pricing."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-on-surface hover:text-emerald-400 transition-colors py-2.5 px-4 rounded-xl bg-surface-container border border-outline-variant/30 shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>WhatsApp: <strong className="text-emerald-400 font-bold">+234 902 636 5853</strong></span>
            </a>
            <a
              href="mailto:sales@closecrafthq.com"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-on-surface hover:text-primary transition-colors py-2.5 px-4 rounded-xl bg-surface-container border border-outline-variant/30 shadow-sm"
            >
              <span>Sales: <strong className="text-primary font-bold">sales@closecrafthq.com</strong></span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
