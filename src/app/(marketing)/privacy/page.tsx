import Link from 'next/link';
import type { Metadata } from 'next';
import Logo from '@/components/ui/Logo';

export const metadata: Metadata = {
  title: 'Privacy Notice | Closecraft',
  description: 'Understand how Closecraft collects, uses, protects, and handles personal data and customer prospects.',
};

export default function PrivacyPolicyPage() {
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
            <span className="text-xs text-on-surface-variant hidden sm:inline">Effective Date: October 28, 2026</span>
          </div>
        </div>

        <div className="mb-10">
          <div className="eyebrow mb-3">DATA PROTECTION & TRANSPARENCY</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
            Privacy Notice
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            Closecraft (“we”, “us”, “our”) is operated by <strong>Zeerocodes Automation Limited</strong>, an incorporated Nigerian enterprise. This Privacy Notice explains our data handling practices for account holders, workspace members, website visitors, and prospect records managed within the Closecraft Revenue Operating System.
          </p>
        </div>

        <div className="space-y-10 text-on-surface text-sm md:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">01.</span> Crucial Distinction: Account Information vs. Prospect Records
            </h2>
            <p className="text-on-surface-variant mb-4">
              To understand your rights and our obligations under data protection regulations (including the Nigeria Data Protection Act 2023 - NDPA), it is necessary to distinguish two separate categories of data handled by Closecraft:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <h3 className="font-bold text-sm text-on-surface mb-1">Account & Customer Information (Data Controller)</h3>
                <p className="text-xs md:text-sm text-on-surface-variant">
                  We act as a <strong>Data Controller</strong> for information you provide when registering, creating an organization workspace, subscribing to billing, or communicating with our support desk (e.g., your name, business email, password hash, workspace name, and billing contact details).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <h3 className="font-bold text-sm text-on-surface mb-1">Prospect & Lead Records (Data Processor)</h3>
                <p className="text-xs md:text-sm text-on-surface-variant">
                  We act as a <strong>Data Processor</strong> on behalf of our customer organizations. When your business inputs, syncs, or captures prospective buyer enquiries (names, phone numbers, WhatsApp notes, deal stages), your organization is the Data Controller. We process prospect data solely in accordance with your workspace configuration and instructions.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">02.</span> Information We Collect & Why
            </h2>
            <ul className="space-y-3 text-on-surface-variant list-disc pl-5">
              <li>
                <strong className="text-on-surface">Identity & Authentication:</strong> Name, work email address, and securely salted bcrypt password hashes. We collect this to authenticate authorized workspace users and assign sales responsibilities.
              </li>
              <li>
                <strong className="text-on-surface">Workspace Configuration:</strong> Organization name, slug, team member roles, seat allocations, and custom follow-up pipeline stages.
              </li>
              <li>
                <strong className="text-on-surface">Commercial & Sales Operations Data:</strong> Enquiry contact details, communication notes, appointments scheduled, deal stages, and opportunity values. Used strictly to compute Next Best Actions, follow-up SLAs, and prevent revenue leakage within your isolated tenant.
              </li>
              <li>
                <strong className="text-on-surface">Audit Trails:</strong> Timestamped records of consequential system actions (emergency support access, member role updates, invoice verification). Kept for tenant security and regulatory compliance.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">03.</span> Role of Bachs (Payment Provider)
            </h2>
            <p className="text-on-surface-variant mb-3">
              Closecraft partners with <strong>Bachs (Bachs.io)</strong> as our authorized payment gateway for workspace subscriptions and managed service pilot settlements.
            </p>
            <ul className="space-y-2 text-on-surface-variant list-disc pl-5 text-sm">
              <li>Closecraft <strong>never</strong> collects, stores, or processes your raw credit/debit card numbers or bank credentials on our servers.</li>
              <li>When you choose to pay, you are redirected to Bachs secure hosted checkout. Bachs collects and processes payment details under their own regulated security and PCI-DSS compliance frameworks.</li>
              <li>Bachs transmits cryptographic server-to-server webhook events (`collection.succeeded`) to notify Closecraft of verified collections. We store only the transaction reference (`bachsCheckoutId`), amount, and timestamp.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">04.</span> Multi-Tenant Isolation & Database Security
            </h2>
            <p className="text-on-surface-variant mb-3">
              We enforce strict multi-tenancy and <strong>Database Row-Level Security (RLS)</strong> at the PostgreSQL database engine level. Every enquiry, conversation, deal, and invoice is cryptographically and logically bound to its parent organization ID.
            </p>
            <p className="text-on-surface-variant">
              Tenant isolation policies prevent cross-tenant data access. No member of another organization can query, update, or view your customer records. AI qualification models operate on scoped prompt context and never cross-train on or disclose data between customer workspaces.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">05.</span> Data Retention & Justified Records
            </h2>
            <p className="text-on-surface-variant mb-3">
              We retain account data for the duration of your active workspace subscription. If a workspace is closed or subscription cancelled:
            </p>
            <ul className="space-y-2 text-on-surface-variant list-disc pl-5 text-sm">
              <li>Workspace data remains accessible in read-only mode during the 7-day grace period.</li>
              <li>Customer organizations may request an export or permanent erasure of prospect records at any time.</li>
              <li>Financial records, invoice numbers, and verified transaction receipts are retained for a statutory period of 6 years in compliance with Nigerian tax and accounting legislation.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">06.</span> Your Privacy Rights & Request Route
            </h2>
            <p className="text-on-surface-variant mb-4">
              Under applicable data protection laws, you have the right to access, rectify, port, or request the deletion of your personal data.
            </p>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-on-surface text-sm">Submit an Authoritative Privacy Request</h3>
                <p className="text-xs text-on-surface-variant">
                  Access your data, correct records, or request deletion through our verified operator route.
                </p>
              </div>
              <Link
                href="/privacy/request"
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-colors shadow-sm shrink-0"
              >
                Submit Privacy Request &rarr;
              </Link>
            </div>
          </section>

          {/* Section 7 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">07.</span> Contacting Our Privacy Officer
            </h2>
            <p className="text-on-surface-variant mb-2">
              For any questions regarding this Privacy Notice or our data handling practices, please contact:
            </p>
            <div className="text-sm font-medium space-y-1 text-on-surface">
              <p><strong>Zeerocodes Automation Limited (Closecraft)</strong></p>
              <p>Privacy & Data Protection Contact: <a href="mailto:privacy@closecraft.com" className="text-primary hover:underline">privacy@closecraft.com</a></p>
              <p>General Support: <a href="mailto:support@closecraft.com" className="text-primary hover:underline">support@closecraft.com</a></p>
              <p>WhatsApp Support: <a href="https://wa.me/2349026365853" className="text-primary hover:underline">+234 902 636 5853</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
