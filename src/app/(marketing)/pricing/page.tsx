import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { HomepagePricingSection } from '@/components/landing/HomepagePricingSection';

export const metadata = {
  title: 'Pricing & Commercial Infrastructure | CloseCraft HQ',
  description:
    'Start your 7-day free trial with no credit card required. Starter from ₦15,000 ($19), Growth Recommended at ₦35,000 ($49), Scale at ₦75,000 ($99), plus Enterprise custom plans, Lead Recovery tiers, and Introductory Growth Services.',
  openGraph: {
    title: 'CloseCraft HQ Pricing | Workspace Subscriptions, Growth Services & Lead Recovery',
    description:
      'Transparent workspace-based SaaS plans across NGN, USD, GBP, and CAD with ~2 months free on annual billing, plus Bachs.io invoicing and verified-payment sales enablement.',
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#060608] text-white font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-16 bg-[#080808]/95 backdrop-blur-md border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-semibold text-zinc-400 hover:text-white inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Home</span>
            </Link>
            <Link href="/" aria-label="CloseCraft HQ Home">
              <Logo variant="full" size="md" priority alt="CloseCraft HQ" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-white px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] text-xs sm:text-sm font-extrabold"
            >
              START 7-DAY FREE TRIAL
            </Link>
          </div>
        </div>
      </header>

      <main>
        <HomepagePricingSection />
      </main>

      <footer className="border-t border-[#1f1f1f] py-8 px-4 text-center text-xs text-zinc-500 space-y-1.5">
        <p>CloseCraft HQ is a revenue operations platform for businesses. It is not affiliated with CloseCraft App.</p>
        <p>&copy; {new Date().getFullYear()} Zeerocodes Automation Limited (RC 8421094). Payments processed securely via Bachs.io.</p>
      </footer>
    </div>
  );
}
