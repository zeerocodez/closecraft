'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  Copy,
  Check,
  Wallet,
  Award,
  Share2,
  Sparkles,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { formatNaira } from '@/lib/dss/rules';

export default function DSSAffiliateProgramPage() {
  const [referralCount, setReferralCount] = useState(10);
  const [registered, setRegistered] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // 35% commission on ₦100,000 route is ₦35,000 ($35); on ₦150,000 route is ₦52,500 ($52.50)
  const commissionPerSale = 35000;
  const totalProjectedEarnings = referralCount * commissionPerSale;

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    const email = form.get('email') as string;
    const channel = form.get('channel') as string;
    const consent = form.get('consent') === 'on';

    try {
      const res = await fetch('/api/dss/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, channel, consent }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      setPartnerCode(data.affiliate.code);
      setRegistered(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  const referralLink = partnerCode
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://closecraft.ng'}/r/${partnerCode}`
    : '';

  function copyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0B1117] text-[#F3F7FA] font-sans selection:bg-[#45BFAE]/30 selection:text-[#45BFAE]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#15352F] via-[#111C26] to-[#15352F] border-b border-[#45BFAE]/20 px-4 py-2.5 text-center text-xs text-[#A7B7C7] flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-[#45BFAE] animate-ping" />
        <span className="font-semibold text-white">DSS PARTNER & AFFILIATE PROGRAM:</span> Earn 35% (₦28,000) per enrolled student. 14-day clearance.
        <Link href="/dss/affiliate/dashboard" className="text-[#45BFAE] font-bold hover:underline ml-2">
          Open Partner Dashboard &rarr;
        </Link>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#0B1117]/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center px-6 md:px-12">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#A7B7C7] hover:text-white transition-colors border border-white/10">
              &larr; Back to Closecraft
            </Link>
            <Link href="/dss" className="text-xs font-semibold text-[#45BFAE] hover:underline">
              &larr; DSS Academy Home
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dss/affiliate/dashboard"
              className="px-4 py-2 rounded-lg bg-[#111C26] hover:bg-[#172431] text-white text-xs font-bold border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Wallet size={14} className="text-[#45BFAE]" />
              Partner Dashboard
            </Link>
            <a
              href="#join-now"
              className="px-4 py-2 rounded-lg bg-[#45BFAE] hover:bg-[#5CD4C3] text-[#08231F] text-xs font-bold transition-all shadow-md shadow-[#45BFAE]/20"
            >
              Become an Affiliate &rarr;
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#15352F] border border-[#45BFAE]/30 text-[#45BFAE] text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles size={14} /> High-Ticket Sales Commission Engine
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
          Recommend Nigeria’s #1 Closer Academy.<br />
          <span className="bg-gradient-to-r from-[#45BFAE] to-[#6AD6A7] bg-clip-text text-transparent">
            Earn ₦28,000 for Every Single Enrolment.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-[#A7B7C7] max-w-3xl mx-auto leading-relaxed mb-10">
          Digital Sales School (DSS) trains and certifies elite high-ticket sales closers. When you introduce founders, job-seekers, or professionals looking to close deals, you earn an instant 35% commission with automated tracking and bi-weekly payouts.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#join-now"
            className="w-full sm:w-auto px-8 py-4 bg-[#45BFAE] hover:bg-[#5CD4C3] text-[#08231F] rounded-xl font-bold text-base transition-all shadow-xl shadow-[#45BFAE]/20 flex items-center justify-center gap-2"
          >
            Get Your Referral Link Now <ArrowRight size={18} />
          </a>
          <Link
            href="/dss/affiliate/dashboard?demo=1"
            className="w-full sm:w-auto px-8 py-4 bg-[#111C26] hover:bg-[#172431] text-white rounded-xl font-bold text-base border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            Preview Partner Dashboard <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-[#111C26] border border-white/5 rounded-2xl p-5 text-left">
            <div className="text-xs text-[#8A9CAE] font-medium mb-1">Commission Rate</div>
            <div className="text-2xl font-bold text-[#45BFAE]">35% Flat</div>
            <div className="text-[11px] text-[#A7B7C7] mt-1">₦35k - ₦52.5k ($35 - $52.5) per sale</div>
          </div>
          <div className="bg-[#111C26] border border-white/5 rounded-2xl p-5 text-left">
            <div className="text-xs text-[#8A9CAE] font-medium mb-1">Cookie Window</div>
            <div className="text-2xl font-bold text-white">30 Days</div>
            <div className="text-[11px] text-[#A7B7C7] mt-1">First-touch & return attribution</div>
          </div>
          <div className="bg-[#111C26] border border-white/5 rounded-2xl p-5 text-left">
            <div className="text-xs text-[#8A9CAE] font-medium mb-1">Payout Clearance</div>
            <div className="text-2xl font-bold text-white">14 Days</div>
            <div className="text-[11px] text-[#A7B7C7] mt-1">Bank transfer or Paystack</div>
          </div>
          <div className="bg-[#111C26] border border-white/5 rounded-2xl p-5 text-left">
            <div className="text-xs text-[#8A9CAE] font-medium mb-1">Minimum Payout</div>
            <div className="text-2xl font-bold text-[#6AD6A7]">₦20,000</div>
            <div className="text-[11px] text-[#A7B7C7] mt-1">Cleared on your first sale</div>
          </div>
        </div>
      </section>

      {/* Interactive Affiliate Earnings Calculator */}
      <section className="py-20 px-6 bg-[#0D151D] border-t border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider mb-2">EARNINGS POTENTIAL</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">How much can you earn with DSS?</h2>
            <p className="text-[#A7B7C7] mt-2">Adjust the slider below to project your monthly affiliate payout.</p>
          </div>

          <div className="bg-[#111C26] border border-[#45BFAE]/20 rounded-2xl p-8 md:p-10 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
              <div className="w-full md:w-3/5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-white">Enrolled Students Referred Per Month:</span>
                  <span className="text-2xl font-black text-[#45BFAE]">{referralCount} students</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={referralCount}
                  onChange={(e) => setReferralCount(Number(e.target.value))}
                  className="w-full h-2 bg-[#1C2D3C] rounded-lg appearance-none cursor-pointer accent-[#45BFAE]"
                />
                <div className="flex justify-between text-xs text-[#8A9CAE] mt-2">
                  <span>1 sale (₦35k)</span>
                  <span>10 sales (₦350k)</span>
                  <span>25 sales (₦875k)</span>
                  <span>50 sales (₦1.75M)</span>
                </div>
              </div>

              <div className="w-full md:w-2/5 bg-[#15352F]/40 border border-[#45BFAE]/30 rounded-xl p-6 text-center">
                <div className="text-xs uppercase tracking-wider text-[#A7B7C7] font-semibold mb-1">
                  Estimated Monthly Payout
                </div>
                <div className="text-4xl font-extrabold text-[#45BFAE] mb-2">
                  {formatNaira(totalProjectedEarnings * 100)}
                </div>
                <div className="text-xs text-[#8A9CAE]">
                  ₦35,000 baseline commission × {referralCount} confirmed enrolments (up to ₦52,500 per bundle)
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A9CAE]">
              <div>⚡ Direct bank transfer to any Nigerian bank or PayPal/Stripe for diaspora partners.</div>
              <a href="#join-now" className="text-[#45BFAE] font-bold hover:underline flex items-center gap-1">
                Start earning now <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Promote DSS (The Advantage) */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider mb-2">WHY PARTNER WITH DSS</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">An Offer That Sells Itself</h2>
          <p className="text-[#A7B7C7] mt-3 max-w-2xl mx-auto">
            High-ticket closing is the most in-demand digital skill in 2026. People are actively searching for practical training that gets them paid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-[#45BFAE]/10 border border-[#45BFAE]/20 flex items-center justify-center text-[#45BFAE] mb-5">
              <Flame size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">High Demand & Urgent Pain</h3>
            <p className="text-sm text-[#A7B7C7] leading-relaxed">
              Every founder struggles to close leads. Every job-seeker wants to earn in foreign currencies or high commissions without building a software product.
            </p>
          </div>

          <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-[#45BFAE]/10 border border-[#45BFAE]/20 flex items-center justify-center text-[#45BFAE] mb-5">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Closecraft Pipeline Backing</h3>
            <p className="text-sm text-[#A7B7C7] leading-relaxed">
              DSS isn&apos;t just an ebook course. It’s the talent engine for Closecraft SaaS. Graduates get listed in the Closecraft Closer Network for business placement.
            </p>
          </div>

          <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-[#45BFAE]/10 border border-[#45BFAE]/20 flex items-center justify-center text-[#45BFAE] mb-5">
              <Share2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Done-For-You Marketing Kit</h3>
            <p className="text-sm text-[#A7B7C7] leading-relaxed">
              We provide you with proven WhatsApp status captions, Twitter threads, email swipes, and a free sample lesson lead magnet so you don&apos;t start from scratch.
            </p>
          </div>
        </div>
      </section>

      {/* Affiliate Testimonials / Partner Proof */}
      <section className="py-20 px-6 bg-[#0D151D] border-t border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider mb-2">PROOF OF PERFORMANCE</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">From Our Early Partners</h2>
            <p className="text-[#A7B7C7] mt-2">See how our community promoters are generating monthly revenue.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#F5BF65] mb-4">
                  {'★'.repeat(5)}
                </div>
                <p className="text-sm text-[#F3F7FA] italic mb-6 leading-relaxed">
                  &ldquo;I shared my referral link with my tech community WhatsApp group of 800 members. Within 5 days, 8 people enrolled for the November cohort. I received ₦224,000 paid directly to my Access Bank account.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#45BFAE]/20 text-[#45BFAE] font-bold flex items-center justify-center">
                  KA
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Kelechi Anya</div>
                  <div className="text-xs text-[#8A9CAE]">Tech Community Lead, Lagos</div>
                </div>
              </div>
            </div>

            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#F5BF65] mb-4">
                  {'★'.repeat(5)}
                </div>
                <p className="text-sm text-[#F3F7FA] italic mb-6 leading-relaxed">
                  &ldquo;The free sample lesson PDF makes promoting effortless. I didn’t pitch anything; I simply shared the sample rubric on Twitter/X. People read it, realized the value, and enrolled through my link.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#6AD6A7]/20 text-[#6AD6A7] font-bold flex items-center justify-center">
                  TA
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Tolani Adeleke</div>
                  <div className="text-xs text-[#8A9CAE]">Remote Career Creator, Ibadan</div>
                </div>
              </div>
            </div>

            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#F5BF65] mb-4">
                  {'★'.repeat(5)}
                </div>
                <p className="text-sm text-[#F3F7FA] italic mb-6 leading-relaxed">
                  &ldquo;The real-time dashboard gives 100% transparency. I can see my clicks, visitor conversions, and exact eligible payout dates. Closecraft and DSS do not play games with affiliates.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#7AA2FF]/20 text-[#7AA2FF] font-bold flex items-center justify-center">
                  DO
                </div>
                <div>
                  <div className="text-sm font-bold text-white">David Oladipo</div>
                  <div className="text-xs text-[#8A9CAE]">B2B Growth Strategist, Abuja</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="join-now" className="py-20 px-6 max-w-3xl mx-auto">
        <div className="bg-[#111C26] border border-[#45BFAE]/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#45BFAE]/5 rounded-full blur-3xl pointer-events-none" />

          {registered ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#6AD6A7]/20 text-[#6AD6A7] flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Welcome to the DSS Partner Family!</h3>
              <p className="text-[#A7B7C7] text-sm mb-6 max-w-md mx-auto">
                Your affiliate code is active. Share your unique link below to start earning ₦28,000 for every enrolled student.
              </p>

              <div className="bg-[#0B1117] border border-white/10 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-lg mx-auto">
                <code className="text-[#45BFAE] text-sm font-mono break-all">{referralLink}</code>
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-[#45BFAE] hover:bg-[#5CD4C3] text-[#08231F] text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dss/affiliate/dashboard"
                  className="w-full sm:w-auto px-6 py-3 bg-[#45BFAE] hover:bg-[#5CD4C3] text-[#08231F] rounded-xl font-bold text-sm transition-all shadow-md"
                >
                  Go to Partner Dashboard &rarr;
                </Link>
                <Link
                  href="/dss"
                  className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm border border-white/10"
                >
                  View DSS Academy Offer
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <div className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider mb-2">INSTANT APPROVAL</div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">Join the DSS Affiliate Program</h3>
                <p className="text-sm text-[#A7B7C7] mt-2">
                  Fill in your details below to instantly generate your tracking code and access your dashboard.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B7C7] uppercase tracking-wider mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Chinedu Eze"
                    className="w-full px-4 py-3 bg-[#0B1117] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#45BFAE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B7C7] uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. chinedu@gmail.com"
                    className="w-full px-4 py-3 bg-[#0B1117] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#45BFAE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B7C7] uppercase tracking-wider mb-2">
                    Where/How Will You Promote DSS? *
                  </label>
                  <textarea
                    name="channel"
                    required
                    rows={3}
                    placeholder="e.g. WhatsApp status, LinkedIn network, Twitter tech audience, personal mailing list..."
                    className="w-full px-4 py-3 bg-[#0B1117] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#45BFAE]"
                  />
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    name="consent"
                    id="consent"
                    required
                    className="mt-1 rounded bg-[#0B1117] border-white/20 text-[#45BFAE] focus:ring-0"
                  />
                  <label htmlFor="consent" className="text-xs text-[#8A9CAE] leading-relaxed">
                    I agree to ethical promotion: I will not make false earnings guarantees, spam groups, or misrepresent the DSS curriculum. I understand commissions are credited on verified sales.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#45BFAE] hover:bg-[#5CD4C3] disabled:opacity-50 text-[#08231F] font-bold rounded-xl transition-all shadow-lg shadow-[#45BFAE]/20 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? 'Generating Your Partner Link...' : 'Register as Affiliate & Get Link'} <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto border-t border-white/5">
        <div className="text-center mb-12">
          <div className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider mb-2">QUESTIONS & ANSWERS</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Affiliate Program FAQ</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'How much do I get paid per referral?',
              a: 'You receive a 35% commission on all productized DSS tracks. For the Setters Route, Closers Route, and Live Roleplays/Internship (₦100,000 / $100), your commission is ₦35,000 ($35). For the Both Routes bundle (₦150,000 / $150), your commission is ₦52,500 ($52.50) per paid student.',
            },
            {
              q: 'When and how do I receive my commission payout?',
              a: 'Commissions clear 14 days after payment verification. Payouts are transferred directly to your bank account via Nigerian bank transfer or Paystack.',
            },
            {
              q: 'What if someone clicks my link but pays two weeks later?',
              a: 'Our visitor cookie tracks the referral for 30 full days. If they return and enroll within 30 days, you are fully credited.',
            },
            {
              q: 'Can I track my referrals in real time?',
              a: 'Yes! Your dedicated Partner Dashboard shows tracked clicks, attributed enquiries, verified sales, and pending vs paid balances.',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#111C26] border border-white/5 rounded-xl p-6">
              <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <HelpCircle size={18} className="text-[#45BFAE]" />
                {item.q}
              </h4>
              <p className="text-sm text-[#A7B7C7] pl-7 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#0B1117] text-xs text-[#8A9CAE]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-bold text-white text-sm mb-1">Digital Sales School (DSS) Partner Network</div>
            <div>Powered by Closecraft • Zeerocodes Automation Limited</div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Closecraft Home</Link>
            <Link href="/dss" className="hover:text-white transition-colors">DSS Academy</Link>
            <Link href="/dss/affiliate/dashboard" className="hover:text-white transition-colors">Partner Dashboard</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
