'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import {
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  Users,
  MousePointerClick,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Building,
  CreditCard,
  FileText,
  MessageSquare,
  Share2,
} from 'lucide-react';

interface Props {
  profile: {
    id: string;
    affiliateCode: string;
    status: string;
    commissionRateBps: number;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountName: string | null;
    payoutCurrency: string;
    lifetimeClicks: number;
    lifetimeReferrals: number;
    lifetimeEarningsNgn: number;
    clearedEarningsNgn: number;
    paidEarningsNgn: number;
  };
  commissions: Array<{
    id: string;
    grossAmountNgn: number;
    commissionAmountNgn: number;
    status: string;
    clearedAt: string | null;
    createdAt: string;
  }>;
  payouts: Array<{
    id: string;
    amountNgn: number;
    status: string;
    payoutReference: string | null;
    notes: string | null;
    createdAt: string;
  }>;
  attributions: Array<{
    id: string;
    status: string;
    expiresAt: string;
    createdAt: string;
  }>;
  userName: string;
  userEmail: string;
}

export default function AffiliateDashboardClient({
  profile,
  commissions,
  payouts,
  attributions,
  userName,
  userEmail,
}: Props) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSwipeIdx, setCopiedSwipeIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'commissions' | 'payouts' | 'resources'>('commissions');
  const [selectedDest, setSelectedDest] = useState<'/' | '/early-access' | '/pricing'>('/');

  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<string>(String(profile.clearedEarningsNgn));
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);
  const [payoutErrorMsg, setPayoutErrorMsg] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.closecrafthq.com';
  const referralUrl = `${baseUrl}/r/${profile.affiliateCode}${selectedDest !== '/' ? `?dest=${selectedDest}` : ''}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copySwipeText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSwipeIdx(idx);
    setTimeout(() => setCopiedSwipeIdx(null), 2000);
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutErrorMsg(null);
    setPayoutSubmitting(true);

    try {
      const res = await fetch('/api/affiliate/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountNgn: parseFloat(payoutAmount),
          notes: payoutNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payout request.');
      }

      setPayoutSuccessMsg(`Payout requested successfully! Ref: ${data.payoutReference}`);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setPayoutErrorMsg(err.message || 'An error occurred.');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  const swipeResources = [
    {
      title: 'WhatsApp Message for Business Owners',
      channel: 'WhatsApp / Direct Message',
      content: `Hey [First Name], saw you guys are running ads for [Company Name]. One quick question: how fast does your sales team reply when an enquiry comes in?

Most businesses lose over 60% of their ad spend simply because leads sit uncalled for hours. CloseCraft gives you a complete managed setup: targeted Meta/Google ads, under-15-minute qualification, plus vetted remote appointment setters and closers so nothing falls through the cracks.

Take a look at their early access program here: ${referralUrl}`,
    },
    {
      title: 'LinkedIn Post for Founders & B2B Leaders',
      channel: 'LinkedIn / X (Twitter)',
      content: `The biggest lie in B2B growth is that you just need "more leads".

In reality, most companies are leaking revenue because of sluggish follow-up. If a prospect fills a form and doesn't get contacted within 15 minutes, their conversion likelihood drops by 80%.

Instead of hiring expensive in-house SDRs or letting ads go cold, Closecraft connects targeted acquisition with dedicated remote appointment setters and trained high-ticket closers into one unified operational machine.

If you are scaling revenue this quarter, check out their Early Access cohort: ${referralUrl}`,
    },
    {
      title: 'Cold Email Template for CEOs & Sales Directors',
      channel: 'Email Newsletter / Outreach',
      content: `Subject: Quick question about [Company Name]'s lead follow-up speed

Hi [First Name],

I noticed [Company Name] is actively growing customer acquisition in [Industry].

A major bottleneck most sales leaders face is that inbound enquiries don't get qualified quickly enough—turning expensive ad spend into wasted pipeline.

Closecraft solves this by deploying a fully integrated growth system:
1. Managed Meta & Google ad funnels
2. Automated multi-channel triage (<15 min response window)
3. Dedicated remote appointment setters & trained high-ticket closers

You can explore their modular services and run a quick 2-minute diagnostic here: ${referralUrl}

Best regards,
${userName}`,
    },
  ];

  const conversionRate = profile.lifetimeClicks > 0
    ? ((profile.lifetimeReferrals / profile.lifetimeClicks) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0a0f1d] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Logo variant="full" size="md" alt="Closecraft" />
            </Link>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/50 hidden sm:inline">
              Partner Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
            >
              SaaS Workspace &rarr;
            </Link>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{userName}</div>
              <div className="text-[10px] text-slate-400">{userEmail}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Welcome & Partner Code Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0d1629] to-[#0a1828] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Affiliate Partner Status: {profile.status}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Partner Command Centre</h1>
            <p className="text-xs text-slate-400 mt-1">
              You earn <strong>15% monthly recurring commission</strong> on every client who purchases CloseCraft services.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Your Partner Code</div>
              <div className="text-lg font-mono font-extrabold text-emerald-400">{profile.affiliateCode}</div>
            </div>
            {profile.clearedEarningsNgn >= 10000 && (
              <button
                onClick={() => setShowPayoutModal(true)}
                className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Request Payout
              </button>
            )}
          </div>
        </div>

        {/* Link Generator Card */}
        <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                Your Unique Tracking Link
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Clicks set a 60-day attribution cookie linking client registrations to your account.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Landing Page:</span>
              <button
                onClick={() => setSelectedDest('/')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedDest === '/'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setSelectedDest('/early-access')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedDest === '/early-access'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Early Access Funnel
              </button>
              <button
                onClick={() => setSelectedDest('/pricing')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedDest === '/pricing'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Pricing & Packages
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 font-mono text-xs text-emerald-400 focus:outline-none"
            />
            <button
              onClick={() => copyToClipboard(referralUrl)}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Lifetime Link Clicks</span>
              <MousePointerClick className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{profile.lifetimeClicks.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-1">Unique visitor clicks tracked</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Referred Workspaces</span>
              <Users className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{profile.lifetimeReferrals.toLocaleString()}</div>
            <div className="text-[11px] text-teal-400 mt-1">{conversionRate}% click-to-client conversion</div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40">
            <div className="flex items-center justify-between text-emerald-400 text-xs mb-2">
              <span>Available for Payout</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-300">
              ₦{profile.clearedEarningsNgn.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Cleared balance (Min. ₦10,000)</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Lifetime Earnings</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              ₦{profile.lifetimeEarningsNgn.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              ₦{profile.paidEarningsNgn.toLocaleString()} successfully paid out
            </div>
          </div>
        </div>

        {/* Tabbed Views */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('commissions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'commissions'
                  ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Commissions ({commissions.length})
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'payouts'
                  ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Payout History ({payouts.length})
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'resources'
                  ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Promotion Swipe Copy & Assets
            </button>
          </div>

          {/* TAB 1: COMMISSIONS */}
          {activeTab === 'commissions' && (
            <div className="bg-[#0c1222] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {commissions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No commissions recorded yet. Share your referral link with business owners to earn your first commission!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Client Gross Payment</th>
                        <th className="py-3 px-4">Your 15% Commission</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Cleared At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {commissions.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-medium">
                            ₦{c.grossAmountNgn.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                            +₦{c.commissionAmountNgn.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.status === 'CLEARED'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
                                  : c.status === 'PAID'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-700/40'
                                  : 'bg-amber-950 text-amber-300 border border-amber-700/40'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {c.clearedAt
                              ? new Date(c.clearedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                              : 'Pending Verification'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAYOUT HISTORY */}
          {activeTab === 'payouts' && (
            <div className="bg-[#0c1222] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {payouts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No payout requests submitted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-3 px-4">Requested On</th>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {payouts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-200">
                            {p.payoutReference}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-400">
                            ₦{p.amountNgn.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.status === 'COMPLETED'
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-amber-950 text-amber-300'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                            {p.notes || 'Direct bank disbursement'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROMOTION RESOURCES & SWIPE COPY */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
                Use these pre-tested swipe copies for reaching out to founders, CEOs, and agency owners. Your unique affiliate tracking link is already embedded!
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {swipeResources.map((res, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                        {res.channel}
                      </div>
                      <h3 className="text-sm font-bold text-white mb-3">{res.title}</h3>
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                        {res.content}
                      </div>
                    </div>

                    <button
                      onClick={() => copySwipeText(res.content, i)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all"
                    >
                      {copiedSwipeIdx === i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSwipeIdx === i ? 'Copied Copy!' : 'Copy Swipe Text'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c1222] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Request Commission Payout
              </h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                &times;
              </button>
            </div>

            {payoutErrorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {payoutErrorMsg}
              </div>
            )}

            {payoutSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
                {payoutSuccessMsg}
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Withdrawal Amount (NGN) *
                </label>
                <input
                  type="number"
                  min="10000"
                  max={profile.clearedEarningsNgn}
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Available cleared balance: <strong>₦{profile.clearedEarningsNgn.toLocaleString()}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Payout Destination</div>
                <div className="text-white font-semibold">{profile.bankName || 'Not configured'}</div>
                <div className="text-slate-300 font-mono text-[11px]">{profile.bankAccountNumber} ({profile.bankAccountName})</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. October referral clearance"
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50"
                >
                  {payoutSubmitting ? 'Submitting...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
