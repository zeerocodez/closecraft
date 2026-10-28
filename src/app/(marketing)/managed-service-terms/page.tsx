import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Managed Service Terms | Closecraft',
  description: 'Terms governing dedicated remote sales closers, appointment setters, and 30-day managed sales pilots.',
};

export default function ManagedServiceTermsPage() {
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
          <span className="text-xs text-on-surface-variant">Version 2026.1 · October 28, 2026</span>
        </div>

        <div className="mb-10">
          <div className="eyebrow mb-3">MANAGED SALES PILOT TERMS</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
            Managed Service Terms
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            These Managed Service Terms govern separately agreed 30-day sales engagements where a customer organization engages approved remote sales professionals (closers or setters) trained through the <strong>Digital Sales School (DSS)</strong> and managed via Closecraft.
          </p>
        </div>

        <div className="space-y-10 text-on-surface text-sm md:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">01.</span> Distinction from Software Subscription
            </h2>
            <p className="text-on-surface-variant mb-3">
              The Closecraft SaaS subscription (Starter ₦20,000/mo, Pro ₦45,000/mo) provides software for your existing internal sales personnel.
            </p>
            <p className="text-on-surface-variant">
              A <strong>Managed Sales Pilot</strong> (starting from ₦150,000 / 30 days) is a distinct operational engagement that provides human sales capacity—trained remote closers or appointment setters. Full Closecraft software workspace access is included during the pilot period without duplicate software charges.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">02.</span> Pre-Activation Requirements & Dual Approval
            </h2>
            <p className="text-on-surface-variant mb-3">
              To ensure service quality, a pilot cannot commence until all four activation prerequisites are verified:
            </p>
            <ul className="space-y-2 text-on-surface-variant list-disc pl-5 text-sm">
              <li><strong>Signed Proposal & Agreed Scope:</strong> Customer agrees to the worksheet capacity (e.g. 40 hours or agreed opportunity quota).</li>
              <li><strong>Client Sales Brief & Materials:</strong> Customer provides verifiable offer pricing, refund terms, and clear qualification criteria.</li>
              <li><strong>Professional Readiness Review:</strong> The designated DSS professional completes simulated objection handling and passes operator review.</li>
              <li><strong>Deposit Verification:</strong> Pilot deposit is verified via Bachs.io hosted checkout.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">03.</span> Operational Boundaries & Working Hours
            </h2>
            <ul className="space-y-2 text-on-surface-variant list-disc pl-5 text-sm">
              <li>Assigned professionals work within agreed business windows (standard 9am – 5pm West Africa Time, Monday through Friday).</li>
              <li>All sales communications must occur through logged channels (integrated WhatsApp outreach, CRM email, or recorded video calls). Offline, unrecorded agreements are unauthorized.</li>
              <li>Professionals have no authority to alter your company’s public pricing, make unauthorized discount commitments, or modify delivery scopes.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">04.</span> Performance Attribution & Verified Collections
            </h2>
            <p className="text-on-surface-variant mb-3">
              Where a pilot includes a variable performance fee:
            </p>
            <ul className="space-y-2 text-on-surface-variant list-disc pl-5 text-sm">
              <li>Performance fees are calculated strictly against <strong>verified collected cash</strong> settled through Bachs or verified bank records, never against uncollected booked proposals or estimated valuations.</li>
              <li>Leads with documented customer contact within the 30 days preceding the pilot are disqualified from performance share to prevent attribution disputes.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">05.</span> Completion, Continuity & Handover
            </h2>
            <p className="text-on-surface-variant">
              Upon conclusion of a 30-day pilot, the operator conducts a formal handover review. The customer receives an export of all conversation transcripts, lead stages, and follow-up history. External professional operational access to the workspace is revoked automatically upon engagement completion.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
