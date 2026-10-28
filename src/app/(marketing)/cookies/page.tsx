import Link from 'next/link';
import type { Metadata } from 'next';
import ManageCookiesButton from '@/components/layout/ManageCookiesButton';

export const metadata: Metadata = {
  title: 'Cookie Notice | Closecraft',
  description: 'Inventory of cookies, browser storage, and tracking controls used by Closecraft.',
};

export default function CookiePolicyPage() {
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
          <div className="eyebrow mb-3">TRANSPARENCY & CONSENT</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
            Cookie & Storage Notice
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            This Cookie Notice explains how Closecraft uses cookies, local storage, and similar browser technologies to deliver our software platform, secure your account session, and honor your privacy choices.
          </p>
        </div>

        <div className="space-y-10 text-on-surface text-sm md:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">01.</span> Complete Storage Inventory
            </h2>
            <p className="text-on-surface-variant mb-4">
              We classify all browser storage items into two explicit categories: strictly necessary functional storage, and optional referral/analytics cookies.
            </p>

            <div className="space-y-4">
              <div className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-low">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-on-surface">Category A: Strictly Necessary (Always Active)</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">ESSENTIAL</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-3">
                  These storage items are required for the basic operation of the Closecraft application (security, login sessions, CSRF protection, and UI navigation). They cannot be switched off in our systems.
                </p>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-on-surface font-semibold">
                        <th className="py-2 pr-4">Storage Key</th>
                        <th className="py-2 pr-4">Type</th>
                        <th className="py-2 pr-4">Duration</th>
                        <th className="py-2">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-on-surface-variant">
                      <tr>
                        <td className="py-2 pr-4 font-mono">authjs.session-token</td>
                        <td className="py-2 pr-4">HttpOnly Cookie</td>
                        <td className="py-2 pr-4">30 Days</td>
                        <td className="py-2">Authenticates your user session and maintains multi-tenant security.</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono">authjs.csrf-token</td>
                        <td className="py-2 pr-4">HttpOnly Cookie</td>
                        <td className="py-2 pr-4">Session</td>
                        <td className="py-2">Protects forms against cross-site request forgery attacks.</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono">closecraft_cookie_consent</td>
                        <td className="py-2 pr-4">LocalStorage</td>
                        <td className="py-2 pr-4">Persistent</td>
                        <td className="py-2">Stores your cookie preferences (accepted or rejected).</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono">closecraft_sidebar_expanded</td>
                        <td className="py-2 pr-4">LocalStorage</td>
                        <td className="py-2 pr-4">Persistent</td>
                        <td className="py-2">Remembers your preference for the CRM navigation sidebar state.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-low">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-on-surface">Category B: Optional Referral & Analytics</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">REQUIRES CONSENT</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-3">
                  These cookies are only activated if you explicitly give consent. If rejected, they are completely blocked from loading.
                </p>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-on-surface font-semibold">
                        <th className="py-2 pr-4">Storage Key</th>
                        <th className="py-2 pr-4">Type</th>
                        <th className="py-2 pr-4">Duration</th>
                        <th className="py-2">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-on-surface-variant">
                      <tr>
                        <td className="py-2 pr-4 font-mono">dss_visitor</td>
                        <td className="py-2 pr-4">Cookie</td>
                        <td className="py-2 pr-4">30 Days</td>
                        <td className="py-2">Credits student referrals and affiliate partner enrollments from verified links.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">02.</span> No Invasive Ad Trackers
            </h2>
            <p className="text-on-surface-variant">
              Closecraft does not deploy invasive cross-site advertising networks, third-party data broker scripts, or hidden fingerprinters. We do not sell your navigation history or customer records to marketing aggregators.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="text-primary font-mono text-sm">03.</span> How to Change Your Preferences
            </h2>
            <p className="text-on-surface-variant mb-4">
              You can adjust or revoke your cookie choices at any time. When you click “Reset Preferences”, our consent manager re-opens and prevents non-essential cookies from firing until you submit a new choice.
            </p>
            <ManageCookiesButton />
          </section>
        </div>
      </div>
    </div>
  );
}
