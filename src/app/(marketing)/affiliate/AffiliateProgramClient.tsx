'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Logo from '@/components/ui/Logo';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Gift,
  Building2,
  Megaphone,
} from 'lucide-react';

interface Props {
  currentUser: any;
  existingProfile: any;
}

export default function AffiliateProgramClient({ currentUser, existingProfile }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Commission Calculator State
  const [clientCount, setClientCount] = useState<number>(5);
  const averageMonthlySpend = 200000; // ₦200,000 average package price
  const commissionRate = 0.15; // 15%
  const estimatedMonthlyCommission = clientCount * averageMonthlySpend * commissionRate;

  // Form State
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    password: '',
    whatsappNumber: '',
    marketingChannels: 'LinkedIn & Twitter (X)',
    promotionPlan: 'Content marketing, newsletter features, and direct consulting referrals.',
    bankName: 'Access Bank',
    bankAccountNumber: '',
    bankAccountName: currentUser?.name || '',
  });

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/affiliate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to activate affiliate profile.');
      }

      // If user was newly registered during affiliate onboarding, authenticate their session immediately
      if (!currentUser && formData.email && formData.password) {
        try {
          const authResult = await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });

          if (authResult?.error) {
            router.push(`/login?callbackUrl=/affiliate/dashboard&email=${encodeURIComponent(formData.email)}`);
            return;
          }
        } catch {
          router.push(`/login?callbackUrl=/affiliate/dashboard&email=${encodeURIComponent(formData.email)}`);
          return;
        }
      }

      router.push(data.verificationRequired ? '/verify-email' : '/affiliate/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How does the 15% recurring commission structure work?',
      a: 'When an organization registers through your unique referral link and purchases any CloseCraft service package (such as Meta Lead Generation or High-Ticket Closing) or workspace subscription, you receive 15% of the gross payment every single month they remain subscribed.',
    },
    {
      q: 'What is the attribution cookie window?',
      a: 'CloseCraft enforces a 60-day attribution window. If a prospect clicks your link and creates their workspace or completes an onboarding assessment anytime within 60 days, that account is permanently attributed to your affiliate profile.',
    },
    {
      q: 'When and how are payouts processed?',
      a: 'Commissions clear automatically upon verified customer invoice settlement via Bachs. Once your cleared balance reaches the minimum threshold of ₦10,000, you can request an instant withdrawal directly to your Nigerian bank account.',
    },
    {
      q: 'Can I refer my own company or workspace?',
      a: 'No. Self-referrals and affiliate abuse are prohibited by our platform terms. Commissions are strictly audited against verified independent organizations.',
    },
    {
      q: 'Do you provide marketing swipe copy and creative assets?',
      a: 'Yes! Inside your dedicated Partner Dashboard, you will have instant access to pre-written email sequences, WhatsApp messages, LinkedIn posts, and value proposition cards.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Banner */}
      <div className="bg-emerald-950/60 border-b border-emerald-800/40 px-4 py-2 text-center text-xs text-emerald-300 font-medium">
        <span className="inline-flex items-center gap-2">
          <Gift className="w-3.5 h-3.5 text-emerald-400" />
          Join the CloseCraft Affiliate Ecosystem — Earn up to 15% monthly recurring commission.
        </span>
      </div>

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-[#0a0f1d]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo variant="full" size="md" alt="Closecraft" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:inline"
            >
              Services Pricing
            </Link>
            {currentUser ? (
              existingProfile ? (
                <Link
                  href="/affiliate/dashboard"
                  className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                >
                  Partner Dashboard &rarr;
                </Link>
              ) : (
                <a
                  href="#apply-section"
                  className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                >
                  Activate Affiliate Access
                </a>
              )
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <a
                  href="#apply-section"
                  className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                >
                  Become an Affiliate
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-900/15 via-transparent to-transparent opacity-70" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            CloseCraft Partner Ecosystem
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
            Earn 15% recurring revenue.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Every month, on every client.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Refer businesses that need more customer enquiries, 15-minute qualification, or high-ticket sales closers. Earn reliable passive monthly commissions as long as their managed service or workspace remains active.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {existingProfile ? (
              <Link
                href="/affiliate/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg"
              >
                Go to My Partner Dashboard &rarr;
              </Link>
            ) : (
              <a
                href="#apply-section"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg"
              >
                Join Partner Program &rarr;
              </a>
            )}
            <a
              href="#calculator-section"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              Calculate My Earnings
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-emerald-400 text-xs font-bold mb-1">15% Recurring</div>
              <div className="text-slate-200 font-bold text-sm">Commission Rate</div>
              <div className="text-slate-400 text-xs mt-0.5">Paid on all client billings</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-teal-400 text-xs font-bold mb-1">60-Day Window</div>
              <div className="text-slate-200 font-bold text-sm">Attribution Lifetime</div>
              <div className="text-slate-400 text-xs mt-0.5">Cookie tracking for visitors</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-cyan-400 text-xs font-bold mb-1">₦10,000 Min</div>
              <div className="text-slate-200 font-bold text-sm">Payout Threshold</div>
              <div className="text-slate-400 text-xs mt-0.5">Direct Nigerian bank payout</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-amber-400 text-xs font-bold mb-1">Real-Time</div>
              <div className="text-slate-200 font-bold text-sm">Analytics Engine</div>
              <div className="text-slate-400 text-xs mt-0.5">Clicks, leads & revenue data</div>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Earnings Calculator */}
      <section id="calculator-section" className="py-16 bg-slate-950/80 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 uppercase tracking-widest">
              Commission Estimator
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-3">Calculate Your Monthly Recurring Revenue</h2>
            <p className="text-sm text-slate-400 mt-2">
              Based on the average client package spend of ₦200,000 per month (₦30,000 monthly commission per client).
            </p>
          </div>

          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-white">Active Referred Businesses:</label>
                <span className="text-xl font-mono font-extrabold text-emerald-400">{clientCount} Clients</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={clientCount}
                onChange={(e) => setClientCount(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>1 Client</span>
                <span>25 Clients</span>
                <span>50 Clients</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-center">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Monthly Gross Revenue</div>
                <div className="text-xl font-extrabold text-white">
                  ₦{(clientCount * averageMonthlySpend).toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50">
                <div className="text-xs text-emerald-400 font-semibold mb-1">Your 15% Monthly Payout</div>
                <div className="text-2xl font-extrabold text-emerald-300">
                  ₦{estimatedMonthlyCommission.toLocaleString()}
                  <span className="text-xs font-normal text-emerald-400">/mo</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Annual Recurring Value</div>
                <div className="text-xl font-extrabold text-white">
                  ₦{(estimatedMonthlyCommission * 12).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Succeeds as a CloseCraft Partner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Ideal Partners</h2>
            <p className="text-3xl font-extrabold text-white">Who promotes CloseCraft?</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <Building2 className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Agencies & Consultants</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add managed appointment setting and remote closers to your client retainers without hiring internal staff.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <Megaphone className="w-8 h-8 text-teal-400 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Growth Marketers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Refer founders frustrated with ad leads not turning into sales. CloseCraft solves the crucial follow-up gap.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <Users className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Community Leaders</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recommend an enterprise-grade sales OS to founders in your business network, mastermind, or tech incubator.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Sales Trainers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pair your training expertise with CloseCraft software, roleplay drills, and managed SDR teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration / Application Section */}
      <section id="apply-section" className="py-20 bg-[#090e1a] border-t border-slate-800/90 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 uppercase tracking-widest">
              Instant Partner Onboarding
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-3">Activate Your Partner Link</h2>
            <p className="text-sm text-slate-400 mt-2">
              Start earning 15% recurring commissions today. Zero upfront cost.
            </p>
          </div>

          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl shadow-xl p-6 sm:p-10">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {existingProfile ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Your Partner Account is Active!</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your unique partner code is <strong className="text-emerald-400 font-mono text-sm">{existingProfile.referralCode || existingProfile.affiliateCode}</strong>. Access your dashboard to track clicks and review commissions.
                </p>
                <div className="pt-4">
                  <Link
                    href="/affiliate/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all"
                  >
                    Open Partner Dashboard &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                {!currentUser && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Samuel Adebayo"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="samuel@gmail.com"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Create Password *</label>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="At least 8 characters"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp / Phone *</label>
                        <input
                          type="tel"
                          required
                          value={formData.whatsappNumber}
                          onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                          placeholder="08012345678"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Where will you promote CloseCraft?</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[
                      'B2B Consulting & Agency',
                      'LinkedIn & Twitter (X)',
                      'WhatsApp Communities',
                      'Email Newsletter',
                      'Sales Training / DSS'
                    ].map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setFormData({ ...formData, marketingChannels: ch })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          formData.marketingChannels === ch
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.marketingChannels}
                    onChange={(e) => setFormData({ ...formData, marketingChannels: e.target.value })}
                    placeholder="e.g. LinkedIn, WhatsApp Groups, Agency Clients, Podcast"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-emerald-400">Payout Details (Nigerian Bank Account)</div>
                  <datalist id="nigerian-banks">
                    <option value="Access Bank" />
                    <option value="Zenith Bank" />
                    <option value="Guaranty Trust Bank (GTBank)" />
                    <option value="First Bank of Nigeria" />
                    <option value="United Bank for Africa (UBA)" />
                    <option value="Kuda Bank" />
                    <option value="Moniepoint Microfinance Bank" />
                    <option value="OPay" />
                    <option value="Stanbic IBTC Bank" />
                    <option value="Fidelity Bank" />
                    <option value="Sterling Bank" />
                    <option value="Wema Bank (ALAT)" />
                    <option value="FCMB" />
                    <option value="Union Bank" />
                    <option value="PalmPay" />
                  </datalist>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Bank Name</label>
                      <input
                        type="text"
                        list="nigerian-banks"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="Select or type bank"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Account Number (10 Digits)</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={formData.bankAccountNumber}
                        onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value.replace(/\D/g, '') })}
                        placeholder="0123456789"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Account Name</label>
                      <input
                        type="text"
                        value={formData.bankAccountName}
                        onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                        placeholder="Account holder name"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Generating Partner Link...' : 'Activate Partner Account & Get Referral Link &rarr;'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#070b12]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Everything You Need To Know</h3>
            <p className="text-2xl font-bold text-white">Partner Program FAQ</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-white hover:text-emerald-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} CloseCraft Technologies Limited. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/early-access" className="hover:text-slate-300 transition-colors">Early Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
