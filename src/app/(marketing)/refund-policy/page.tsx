import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation and Refund Policy | Closecraft',
  description: 'Understand subscription cancellation, manual renewal terms, and refund eligibility for Closecraft.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col pt-24 px-4 pb-20">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface hover:text-primary transition-colors px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 shadow-sm"
          >
            &larr; Back to Home
          </Link>
          <span className="text-xs text-on-surface-variant">Effective Date: October 28, 2026</span>
        </div>

        <div className="mb-10">
          <div className="eyebrow mb-3">BILLING & FAIR PLAY</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
            Cancellation & Refund Policy
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            At Closecraft (operated by <strong>Zeerocodes Automation Limited</strong>), we maintain transparent, predictable pricing. This policy sets forth the cancellation procedures, renewal behaviour, and refund rules for software subscriptions and managed service engagements.
          </p>
        </div>

        <div className="space-y-10 text-on-surface text-sm md:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">01.</span> Manual Monthly Renewal Model (No Surprise Charges)
            </h2>
            <p className="text-on-surface-variant mb-3">
              Closecraft operates on a <strong>manual monthly renewal model</strong>. We do not automatically charge your payment card or bank account upon cycle expiration.
            </p>
            <p className="text-on-surface-variant">
              Each month, an approved renewal invoice is generated in your workspace billing dashboard. You maintain complete control over whether and when to settle your renewal through our payment partner, <strong>Bachs (Bachs.io)</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">02.</span> How to Cancel Your Software Subscription
            </h2>
            <p className="text-on-surface-variant mb-3">
              Because renewals are manual, cancelling your subscription is straightforward:
            </p>
            <ul className="space-y-2 text-on-surface-variant list-disc pl-5 text-sm">
              <li><strong>Zero Action Required to Stop:</strong> Simply decline or ignore the monthly renewal invoice. No recurring charges will occur.</li>
              <li><strong>Formal Workspace Deactivation:</strong> Workspace Owners can initiate immediate workspace closure from <em>Settings &gt; Workspace &gt; Danger Zone</em> or by notifying our support desk at <a href="mailto:support@closecraft.com" className="text-primary hover:underline">support@closecraft.com</a>.</li>
              <li><strong>Grace Period:</strong> Following the end of any paid-through period, you receive a <strong>7-day grace period</strong> with uninterrupted access to export customer records and follow up on pending opportunities.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">03.</span> Software Subscription Refund Eligibility
            </h2>
            <ul className="space-y-3 text-on-surface-variant list-disc pl-5 text-sm">
              <li>
                <strong className="text-on-surface">14-Day Free Trial:</strong> Because all workspaces start with an uncharged 14-day trial, customers have full opportunity to evaluate the platform before any fee is requested.
              </li>
              <li>
                <strong className="text-on-surface">Billing Errors & Technical Failures:</strong> In the event of a duplicated Bachs payment, erroneous charge, or significant prolonged service disruption attributable directly to Closecraft infrastructure, we will issue a full 100% refund of the affected billing transaction.
              </li>
              <li>
                <strong className="text-on-surface">Ordinary Monthly Usage:</strong> Monthly subscription fees (Starter ₦20,000, Pro ₦45,000) compensate for active multi-tenant server compute, database storage, and AI qualification routing during the paid 30-day window and are non-refundable once the billing month has commenced.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">04.</span> Managed Sales Pilots & Professional Engagements
            </h2>
            <p className="text-on-surface-variant mb-3">
              Fees for dedicated remote sales professionals (starting from ₦150,000 for 30-day pilots) are subject to custom terms agreed in the commercial worksheet:
            </p>
            <ul className="space-y-2 text-on-surface-variant list-disc pl-5 text-sm">
              <li>Pilot engagements require mutual prerequisite confirmation (accepted terms, sales brief approval, operator readiness) before activation.</li>
              <li>If Closecraft is unable to provide an approved professional matching your agreed language and industry criteria within 14 days of proposal acceptance, your deposit will be refunded in full.</li>
              <li>Once an engagement is activated and the professional begins lead outreach, fixed compensation and management fees are disbursed according to logged capacity and are non-refundable.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">05.</span> Refund Processing Method
            </h2>
            <p className="text-on-surface-variant">
              Approved refunds are credited back to the original source account via <strong>Bachs</strong> within 5 to 10 Nigerian banking business days. Cash or third-party bank account diversions are strictly prohibited for anti-money laundering compliance.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
