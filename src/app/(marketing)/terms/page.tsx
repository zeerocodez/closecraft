import Link from 'next/link';
import type { Metadata } from 'next';
import Logo from '@/components/ui/Logo';

export const metadata: Metadata = {
  title: 'Terms of Service | Closecraft',
  description: 'Terms of service governing use of the Closecraft software platform, workspace subscriptions, and sales pilot services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col pt-24 px-4 pb-20">
      <div className="max-w-4xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
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
            <span className="text-xs text-on-surface-variant hidden sm:inline">Version 2026.1 · October 28, 2026</span>
          </div>
        </div>

        <div className="mb-10">
          <div className="eyebrow mb-3">SERVICE AGREEMENT</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
            Terms of Service
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            These Terms of Service (“Terms”) constitute a legally binding agreement between you or the entity you represent (“Customer”, “you”) and <strong>Zeerocodes Automation Limited</strong> (“Closecraft”, “we”, “our”), governing your access to and use of the Closecraft software application and associated services.
          </p>
        </div>

        <div className="space-y-10 text-on-surface text-sm md:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">01.</span> Service Scope & Tagline
            </h2>
            <p className="text-on-surface-variant mb-3">
              Closecraft provides a software platform designed to answer one central operational question: <strong>“Know who is following up.”</strong> The software facilitates multi-channel enquiry ingestion, qualification scoring, follow-up scheduling, and SLA monitoring.
            </p>
            <p className="text-on-surface-variant">
              Customer organizations may also separately request remote sales closers or appointment setters through distinct Managed Sales Pilot engagements governed under our <Link href="/managed-service-terms" className="text-primary hover:underline font-semibold">Managed Service Terms</Link>. The core software subscription does not guarantee specific revenue outcomes; it provides the operational visibility and tooling required for systematic sales execution.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">02.</span> Workspace Plans, Seats, and Free Trial
            </h2>
            <ul className="space-y-3 text-on-surface-variant list-disc pl-5">
              <li>
                <strong className="text-on-surface">14-Day Free Trial:</strong> New workspaces receive 14 days of complimentary Starter access. No credit card or upfront commitment is required to start.
              </li>
              <li>
                <strong className="text-on-surface">Starter Workspace (₦20,000 / month):</strong> Includes up to 3 internal team seats, enquiry management inbox, Today radar, SLA tracking, and Bachs checkout integration.
              </li>
              <li>
                <strong className="text-on-surface">Pro Workspace (₦45,000 / month):</strong> Includes up to 10 internal team seats, automated round-robin lead routing, manager call coaching queues, and priority notification dispatch.
              </li>
              <li>
                <strong className="text-on-surface">Seat Allocation:</strong> Internal roles (Owner, Admin, Manager, Closer, Setter, Member) consume allocated seat licenses. External remote sales professionals attached via authorized pilot engagements do not count against your internal seat quota.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">03.</span> Billing, Bachs Payments, and Manual Renewal
            </h2>
            <p className="text-on-surface-variant mb-3">
              Closecraft operates on a <strong>manual monthly renewal model</strong>. We do not perform unannounced auto-debits on your payment cards.
            </p>
            <ul className="space-y-2 text-on-surface-variant list-disc pl-5 text-sm">
              <li>Payments are settled in Nigerian Naira (NGN) via <strong>Bachs (Bachs.io)</strong> hosted checkout supporting bank transfers (dynamic virtual accounts), debit cards (Mastercard, Visa, Verve), and mobile money.</li>
              <li>Entitlement is granted strictly upon verified cryptographic confirmation of payment from Bachs (`collection.succeeded`). Browser redirects or return URLs do not independently grant paid status.</li>
              <li>If a subscription reaches expiration without manual renewal, the workspace enters a <strong>7-day grace period</strong> with full access. Following the grace period, the workspace reverts to read-only mode until a renewal invoice is settled.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">04.</span> Acceptable Use & Account Integrity
            </h2>
            <p className="text-on-surface-variant mb-2">You agree NOT to use Closecraft to:</p>
            <ul className="space-y-1.5 text-on-surface-variant list-disc pl-5 text-sm">
              <li>Upload spam lists, scraped personal contacts, or leads collected without lawful consent.</li>
              <li>Impersonate another enterprise or send deceptive, fraudulent, or harassing outreach.</li>
              <li>Circumvent multi-tenant isolation, tamper with database permissions, or attempt cross-tenant access.</li>
              <li>Share administrative credentials across unauthorized individuals.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">05.</span> Limitation of Liability & Warranties
            </h2>
            <p className="text-on-surface-variant mb-3">
              Closecraft provides the software “as is” and “as available”. While we implement rigorous testing and database row-level security, we do not warrant that service will be uninterrupted or error-free.
            </p>
            <p className="text-on-surface-variant">
              To the maximum extent permitted by applicable law, Closecraft’s aggregate liability for all claims arising out of or related to these Terms will not exceed the total fees paid by you to Closecraft in the three (3) months immediately preceding the event giving rise to liability.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">06.</span> Governing Law & Dispute Resolution
            </h2>
            <p className="text-on-surface-variant">
              These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any dispute, controversy, or claim arising out of or relating to this contract will first be submitted to good-faith commercial negotiation, failing which it shall be resolved by arbitration in Lagos, Nigeria.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
