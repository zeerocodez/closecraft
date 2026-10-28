import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col pt-24 px-4 pb-20">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface hover:text-primary transition-colors px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 shadow-sm"
          >
            &larr; Back to Home
          </Link>
          <Link
            href="/dss"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#45bfae] bg-[#248277]/15 hover:bg-[#248277]/25 px-3.5 py-2 rounded-lg border border-[#248277]/30 transition-colors shadow-sm"
          >
            DSS Academy &rarr;
          </Link>
        </div>

        <div className="text-center mb-10">
          <div className="eyebrow mb-4">AFFORDABLE GROWTH</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
            Scale your revenue engine without enterprise bloat. Start optimizing your pipeline today.
          </p>
        </div>

        {/* Free Pilot Highlight Banner */}
        <div className="mb-12 bg-gradient-to-r from-[#248277]/20 via-[#45bfae]/15 to-[#248277]/10 border-2 border-[#248277]/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#248277] text-white text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Public Testing Pilot</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mb-2">
              CloseCraft is 100% Free During Real-User Testing
            </h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              We are actively testing CloseCraft with real revenue teams. Get immediate access to your private multi-tenant workspace, AI lead qualification, explainable priority scoring, and 1-click WhatsApp outreach. No credit card required.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Link
              href="/signup"
              className="w-full md:w-auto px-7 py-4 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <span>Join Free Pilot Now</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Tier 1 - Starter */}
          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 flex flex-col">
            <h3 className="text-xl font-bold text-on-surface mb-2">Starter</h3>
            <p className="text-on-surface-variant text-sm mb-6">For small teams building their first structured follow-up pipeline.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-on-surface">₦20,000</span>
              <span className="text-on-surface-variant">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface"><strong>3 Internal Team Members</strong></span></li>
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Up to 1,000 active leads/mo</span></li>
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Enquiry Inbox & Leakage Radar</span></li>
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Bachs.io Hosted Checkout (Cards, Bank Transfer)</span></li>
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Attach Remote Sales Pilots Anytime</span></li>
            </ul>
            <Link href="/signup" className="w-full py-3 rounded-lg border border-outline text-on-surface text-center font-semibold hover:bg-surface-container transition-colors">
              Start 14-Day Trial
            </Link>
          </div>

          {/* Tier 2 - Pro (Recommended) */}
          <div className="bg-primary-container p-8 rounded-3xl border-2 border-primary flex flex-col relative transform md:-translate-y-4 shadow-xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
              Recommended for Teams
            </div>
            <h3 className="text-xl font-bold text-on-primary-container mb-2">Pro</h3>
            <p className="text-on-primary-container/80 text-sm mb-6">For high-velocity sales organizations needing multi-rep scale & routing.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-on-primary-container">₦45,000</span>
              <span className="text-on-primary-container/80">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-primary-container font-medium">Everything in Starter, plus:</span></li>
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-primary-container"><strong>10 Internal Team Members</strong></span></li>
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-primary-container">Round-Robin Automated Lead Routing</span></li>
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-primary-container">Manager Call Coaching & QA Review Queue</span></li>
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-primary-container">Priority Notification Dispatch</span></li>
            </ul>
            <Link href="/signup" className="w-full py-3 rounded-lg bg-primary text-on-primary text-center font-semibold hover:bg-primary/90 transition-colors shadow-sm">
              Start 14-Day Trial
            </Link>
          </div>

          {/* Tier 3 */}
          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 flex flex-col">
            <h3 className="text-xl font-bold text-on-surface mb-2">Enterprise</h3>
            <p className="text-on-surface-variant text-sm mb-6">Custom architectures and unlimited scale.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-on-surface">₦75,000</span>
              <span className="text-on-surface-variant">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Unlimited leads/mo</span></li>
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Custom CRM Integrations</span></li>
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Unlimited Team Members</span></li>
              <li className="flex items-start gap-3"><Check className="text-primary shrink-0 w-5 h-5" /><span className="text-sm text-on-surface">Dedicated Success Manager</span></li>
            </ul>
            <Link href="/signup" className="w-full py-3 rounded-lg border border-outline text-on-surface text-center font-semibold hover:bg-surface-container transition-colors">
              Start Free Pilot
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-on-surface-variant italic">
            * All features are unlocked for free during our initial live customer test phase. Paid tiers will only apply after the completion of the active pilot.
          </p>
          <div className="mt-6">
            <a
              href="https://wa.me/2349026365853?text=Hello%20CloseCraft%2C%20I%20have%20a%20question%20about%20the%20Free%20Pilot%20and%20pricing."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-on-surface hover:text-emerald-400 transition-colors py-2.5 px-4 rounded-xl bg-surface-container border border-outline-variant/30 shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Questions? Chat directly on WhatsApp: <strong className="text-emerald-400 font-bold">+234 902 636 5853</strong></span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
