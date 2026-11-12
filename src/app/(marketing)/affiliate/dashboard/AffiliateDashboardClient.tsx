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
  Settings,
  Download,
  MessageCircle,
  Mail,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Briefcase,
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
    organizationName?: string;
    plan?: string;
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
  const [activeTab, setActiveTab] = useState<'commissions' | 'payouts' | 'resources' | 'settings'>('commissions');
  const [selectedDest, setSelectedDest] = useState<'/' | '/early-access' | '/services' | '/services/lead-generation' | '/pricing'>('/');

  // Current active code (supports live vanity updates)
  const [currentAffiliateCode, setCurrentAffiliateCode] = useState(profile.affiliateCode);
  const [customCodeInput, setCustomCodeInput] = useState(profile.affiliateCode);
  const [bankSettings, setBankSettings] = useState({
    bankName: profile.bankName || 'Access Bank',
    bankAccountNumber: profile.bankAccountNumber || '',
    bankAccountName: profile.bankAccountName || userName,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);
  const [settingsErrorMsg, setSettingsErrorMsg] = useState<string | null>(null);

  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<string>(String(profile.clearedEarningsNgn));
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);
  const [payoutErrorMsg, setPayoutErrorMsg] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.closecrafthq.com';
  const referralUrl = `${baseUrl}/r/${currentAffiliateCode}${selectedDest !== '/' ? `?dest=${selectedDest}` : ''}`;

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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsErrorMsg(null);
    setSettingsSuccessMsg(null);
    setSettingsSaving(true);

    try {
      const res = await fetch('/api/affiliate/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCode: customCodeInput,
          bankName: bankSettings.bankName,
          bankAccountNumber: bankSettings.bankAccountNumber,
          bankAccountName: bankSettings.bankAccountName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update partner settings.');
      }

      setCurrentAffiliateCode(data.profile.referralCode);
      setSettingsSuccessMsg('Partner code and bank details updated successfully!');
    } catch (err: any) {
      setSettingsErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setSettingsSaving(false);
    }
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
    {
      title: 'Agency & Consultant Partnership Offer',
      channel: 'Client Advisory / Agency Pitch',
      content: `Hi [First Name],

If you're already delivering branding, web design, or digital advertising for your clients, the #1 complaint clients have is usually: "The leads aren't turning into sales."

CloseCraft allows agencies and consultants to plug in vetted remote sales closers, lead qualification pipelines, and Meta ad management without having to manage internal sales operations.

Explore how your clients can activate dedicated sales assistance: ${referralUrl}`,
    },
  ];

  const rateCards = [
    {
      title: 'Starter Package',
      adSpend: '₦2,000 / day included',
      monthlyPrice: '₦70,000 / 4 weeks',
      commission: '₦10,500 (15%)',
      deliverables: 'Lead capture funnel, creative setup, Meta targeting, automated CRM ingestion.',
      tag: 'Popular Choice',
    },
    {
      title: 'Growth Package',
      adSpend: '₦3,000 / day included',
      monthlyPrice: '₦100,000 / 4 weeks',
      commission: '₦15,000 (15%)',
      deliverables: 'Full-funnel campaign, daily ad monitoring, qualification triage, A/B creative variants.',
      tag: 'Most Recommended',
    },
    {
      title: 'Elite Digital Sales',
      adSpend: '₦4,000 / day included',
      monthlyPrice: '₦130,000 / 4 weeks',
      commission: '₦19,500 (15%)',
      deliverables: 'High-volume acquisition, dedicated appointment setter, custom conversion copy.',
      tag: 'High Impact Option',
    },
    {
      title: 'Enterprise Custom',
      adSpend: 'Tailored weekly spend',
      monthlyPrice: 'Custom Quote',
      commission: '15% of total fees',
      deliverables: 'Multi-brand campaigns, dedicated closer team, custom SLA reporting.',
      tag: 'Enterprise Scale',
    },
  ];

  const conversionRate = profile.lifetimeClicks > 0
    ? ((profile.lifetimeReferrals / profile.lifetimeClicks) * 100).toFixed(1)
    : '0.0';

  const shareText = `Check out CloseCraft to fix sales follow-up and acquire more qualified customers: ${referralUrl}`;

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
              You earn <strong>15% monthly recurring commission</strong> on every client who purchases CloseCraft services or software subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Your Referral Code</div>
              <div className="text-lg font-mono font-extrabold text-emerald-400">{currentAffiliateCode}</div>
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

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-medium mr-1">Target Page:</span>
              {[
                { dest: '/', label: 'Home' },
                { dest: '/early-access', label: 'Early Access' },
                { dest: '/services', label: 'Marketplace' },
                { dest: '/services/lead-generation', label: 'Meta Ads' },
                { dest: '/pricing', label: 'Pricing' },
              ].map((item) => (
                <button
                  key={item.dest}
                  onClick={() => setSelectedDest(item.dest as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    selectedDest === item.dest
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
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
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
            >
              {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* 1-Click Social Sharing */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Share directly:</span>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/50 text-[11px] font-semibold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('CloseCraft converts more enquiries into paying customers with under-15-minute qualification and dedicated sales closers.')}&url=${encodeURIComponent(referralUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-400 border border-sky-800/50 text-[11px] font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span>X (Twitter)</span>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-400 border border-blue-800/50 text-[11px] font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.96 0-1.74.78-1.74 1.74s.78 1.74 1.74 1.74 1.74-.78 1.74-1.74-.78-1.74-1.74-1.74Z"/></svg>
              <span>LinkedIn</span>
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent('CloseCraft Sales Revenue Platform')}&body=${encodeURIComponent(`Take a look at CloseCraft: ${referralUrl}`)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-semibold transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
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
              <span>Cleared & Available</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">
              ₦{profile.clearedEarningsNgn.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-1">
              {profile.clearedEarningsNgn >= 10000 ? 'Ready for withdrawal' : 'Min ₦10,000 threshold'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Lifetime Earned</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              ₦{profile.lifetimeEarningsNgn.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              ₦{profile.paidEarningsNgn.toLocaleString()} disbursed to bank
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="border-b border-slate-800">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab('commissions')}
              className={`pb-4 text-xs font-bold transition-all relative ${
                activeTab === 'commissions'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Commissions & Referrals ({commissions.length})
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`pb-4 text-xs font-bold transition-all relative ${
                activeTab === 'payouts'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Payouts & Withdrawals ({payouts.length})
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`pb-4 text-xs font-bold transition-all relative ${
                activeTab === 'resources'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Promotional Resources & Rates
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Partner & Payout Settings</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* TAB 1: COMMISSIONS & ATTRIBUTED REFERRALS */}
          {activeTab === 'commissions' && (
            <div className="space-y-8">
              {/* Attributed Workspaces Sub-table */}
              <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-400" />
                      Attributed Client Organizations ({attributions.length})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Businesses registered within your 60-day cookie attribution window.
                    </p>
                  </div>
                </div>

                {attributions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs rounded-xl bg-slate-900/40 border border-slate-800/60">
                    No referred workspaces yet. Share your tracking link to start attributing client accounts.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                          <th className="py-3 px-4">Organization Name</th>
                          <th className="py-3 px-4">Workspace Plan</th>
                          <th className="py-3 px-4">Registered Date</th>
                          <th className="py-3 px-4">Attribution Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {attributions.map((att) => (
                          <tr key={att.id} className="hover:bg-slate-900/40">
                            <td className="py-3 px-4 font-bold text-white">
                              {att.organizationName || 'Client Workspace'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                                {att.plan || 'STARTER'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                              {new Date(att.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Active (60-day Window)
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Commission Earnings Ledger */}
              <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Commission Earnings Ledger
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    15% recurring commissions awarded from customer package purchases and subscriptions.
                  </p>
                </div>

                {commissions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs rounded-xl bg-slate-900/40 border border-slate-800/60">
                    No commissions credited yet. When an attributed client purchases any service, 15% is automatically calculated and credited here.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Gross Sale (NGN)</th>
                          <th className="py-3 px-4">Your Commission (15%)</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Clearance Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {commissions.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-900/40">
                            <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-200">
                              ₦{c.grossAmountNgn.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-bold text-emerald-400">
                              ₦{c.commissionAmountNgn.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  c.status === 'PAYABLE' || c.status === 'APPROVED' || c.status === 'PAID'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                                    : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                              {c.clearedAt ? new Date(c.clearedAt).toLocaleDateString() : 'Instant'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PAYOUTS & WITHDRAWALS */}
          {activeTab === 'payouts' && (
            <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    Withdrawal & Bank Payout History
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Direct NIP bank disbursements to your verified Nigerian account.
                  </p>
                </div>
                {profile.clearedEarningsNgn >= 10000 && (
                  <button
                    onClick={() => setShowPayoutModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Request Withdrawal
                  </button>
                )}
              </div>

              {payouts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs rounded-xl bg-slate-900/40 border border-slate-800/60">
                  No payout withdrawals requested yet. Once your cleared commission reaches ₦10,000, you can request an instant bank payout.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-4">Request Date</th>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Amount (NGN)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Bank Details / Transaction Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {payouts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/40">
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                            {p.payoutReference || 'PENDING'}
                          </td>
                          <td className="py-3 px-4 font-bold text-white">
                            ₦{p.amountNgn.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === 'PAID'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                                  : p.status === 'REJECTED'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800/50'
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

          {/* TAB 3: PROMOTIONAL RESOURCES & RATES */}
          {activeTab === 'resources' && (
            <div className="space-y-8">
              {/* Official Rate Cards Showcase */}
              <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    CloseCraft Official Rate Cards & Commission Breakdown
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Every published rate includes both Meta ad spend and management fees. Share these exact pricing tiers with prospective clients.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {rateCards.map((rc) => (
                    <div key={rc.title} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                          {rc.tag}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-2">{rc.title}</h4>
                        <div className="text-xs text-slate-400 mt-0.5 font-medium">{rc.adSpend}</div>
                        <div className="text-base font-extrabold text-emerald-400 mt-2">{rc.monthlyPrice}</div>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{rc.deliverables}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 text-xs">
                        <span className="text-slate-400 text-[10px] block">Your Affiliate Commission:</span>
                        <span className="font-extrabold text-amber-400 text-sm">{rc.commission}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Swipe Copy Collateral */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Tested Promotional Swipe Copy
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pre-tested outreach messages with your unique tracking link automatically embedded.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {swipeResources.map((res, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                          {res.channel}
                        </div>
                        <h3 className="text-sm font-bold text-white mb-2">{res.title}</h3>
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                          {res.content}
                        </div>
                      </div>

                      <button
                        onClick={() => copySwipeText(res.content, i)}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        {copiedSwipeIdx === i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSwipeIdx === i ? 'Copied to Clipboard!' : 'Copy Swipe Text'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PARTNER & PAYOUT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-sm max-w-3xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-emerald-400" />
                  Partner Customization & Payout Account
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customize your memorable vanity referral code and maintain your verified Nigerian bank account for automated payouts.
                </p>
              </div>

              {settingsSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{settingsSuccessMsg}</span>
                </div>
              )}

              {settingsErrorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{settingsErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Vanity Code Setting */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" />
                    Custom Vanity Referral Code
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Referral Code (3-25 alphanumeric characters)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-3 flex items-center font-mono text-xs text-slate-500">
                          closecrafthq.com/r/
                        </span>
                        <input
                          type="text"
                          required
                          value={customCodeInput}
                          onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                          placeholder="MYCODE"
                          className="w-full pl-36 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Example: <strong>EMMANUEL</strong>, <strong>GROWTHDEALS</strong>, or <strong>SALESACADEMY</strong>. Changing this updates your live referral link.
                    </p>
                  </div>
                </div>

                {/* Bank Account Settings */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    Nigerian Bank Payout Details
                  </div>
                  <datalist id="settings-banks">
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
                        list="settings-banks"
                        value={bankSettings.bankName}
                        onChange={(e) => setBankSettings({ ...bankSettings, bankName: e.target.value })}
                        placeholder="e.g. Zenith Bank"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Account Number (10 Digits)</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={bankSettings.bankAccountNumber}
                        onChange={(e) => setBankSettings({ ...bankSettings, bankAccountNumber: e.target.value.replace(/\D/g, '') })}
                        placeholder="0123456789"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={bankSettings.bankAccountName}
                        onChange={(e) => setBankSettings({ ...bankSettings, bankAccountName: e.target.value })}
                        placeholder="Account name"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Overview Card */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs space-y-2 text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Commission Tier:</span>
                    <strong className="text-emerald-400">15.0% Recurring</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Attribution Duration:</span>
                    <strong className="text-white">60 Calendar Days</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Account Status:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      {profile.status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all shadow-md"
                  >
                    {settingsSaving ? 'Saving Settings...' : 'Save Partner Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Payout Request Modal */}
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
                  Available cleared balance: <strong>₦{profile.clearedEarningsNgn.toLocaleString()}</strong> (Min: ₦10,000)
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Payout Destination</div>
                <div className="text-white font-semibold">{bankSettings.bankName || 'Not configured'}</div>
                <div className="text-slate-300 font-mono text-[11px]">{bankSettings.bankAccountNumber} ({bankSettings.bankAccountName})</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. November referral clearance"
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
