'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  MousePointer2,
  Wallet,
  FolderOpen,
  UserRound,
  ArrowUpRight,
  ArrowRight,
  Copy,
  Check,
  Download,
  TrendingUp,
  ChevronRight,
  Link2,
  RefreshCw,
  Sparkles,
  HelpCircle,
  FileText,
  Share2,
} from 'lucide-react';
import { formatNaira } from '@/lib/dss/rules';

type Sale = {
  id: string;
  reference: string;
  platform: string;
  amount: number;
  commission: number;
  status: 'pending' | 'paid' | 'reversed';
  eligible: number;
  created: number;
};

type Payout = {
  id: string;
  amount: number;
  reference: string;
  created: number;
};

type AffiliateProfile = {
  name: string;
  email: string;
  code: string;
  status: string;
  channel: string;
};

type DashboardData = {
  profile: AffiliateProfile | null;
  clicks: number;
  enquiries: number;
  sales: Sale[];
  payouts: Payout[];
};

export default function DSSAffiliateDashboardPage() {
  const [tab, setTab] = useState<'overview' | 'referrals' | 'payouts' | 'toolkit' | 'profile'>('overview');
  const [isDemo, setIsDemo] = useState(false);
  const [data, setData] = useState<DashboardData>({
    profile: null,
    clicks: 0,
    enquiries: 0,
    sales: [],
    payouts: [],
  });
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'reversed'>('all');

  async function loadData(demoMode: boolean) {
    setLoading(true);
    try {
      const res = await fetch(`/api/dss/affiliate${demoMode ? '?demo=1' : ''}`, { cache: 'no-store' });
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load affiliate dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Check if ?demo=1 is in URL
    const params = new URLSearchParams(window.location.search);
    const demoParam = params.get('demo') === '1';
    setIsDemo(demoParam);
    loadData(demoParam);
  }, []);

  function toggleDemo() {
    const next = !isDemo;
    setIsDemo(next);
    loadData(next);
  }

  const profile = data.profile;
  const affiliateCode = profile?.code || 'DSS-DEMO8820A1';
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/r/${affiliateCode}`
    : `https://closecraft.ng/r/${affiliateCode}`;

  function copyText(text: string, type: 'link' | string) {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCaption(type);
      setTimeout(() => setCopiedCaption(null), 2000);
    }
  }

  // Calculate totals
  const totalCommissionEarned = data.sales.reduce((acc, s) => acc + s.commission, 0);
  const now = Date.now();
  const availableCommission = data.sales
    .filter((s) => s.status === 'pending' && s.eligible <= now)
    .reduce((acc, s) => acc + s.commission, 0);
  const pendingClearance = data.sales
    .filter((s) => s.status === 'pending' && s.eligible > now)
    .reduce((acc, s) => acc + s.commission, 0);
  const totalPaidOut = data.payouts.reduce((acc, p) => acc + p.amount, 0);

  // CSV Export
  function exportCSV() {
    const rows = [
      ['Order Reference', 'Platform', 'Sale Amount (NGN)', 'Commission (NGN)', 'Status', 'Date'],
      ...data.sales.map((s) => [
        s.reference,
        s.platform,
        (s.amount / 100).toFixed(2),
        (s.commission / 100).toFixed(2),
        s.status,
        new Date(s.created).toISOString(),
      ]),
    ];
    const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DSS_Referrals_${affiliateCode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Toolkit captions
  const captions = {
    whatsapp: `🔥 If you are in Nigeria and looking to land high-paying remote sales clients or improve how you close deals, check out Digital Sales School (DSS).\n\nEmmanuel Effiong is running an intensive 8-week founding cohort starting this November. You practice real discovery calls and roleplays instead of just reading boring theories. Tuition is ₦80k and includes placement into Closecraft's sales engine.\n\nRead the full program and get a free sample lesson here: ${referralLink}`,
    twitter: `Most people struggle to sell not because their offer is bad, but because they don't know how to handle "it's too expensive".\n\nDigital Sales School (DSS) is launching its founding cohort. 8 weeks of live practice, discovery call roleplays, and direct placement opportunities.\n\nCheck out the syllabus & free sample lesson:\n${referralLink}`,
    linkedin: `Excited to recommend Digital Sales School (DSS) by Zeerocodes Automation. In B2B sales and high-ticket consulting, the ability to lead a structured discovery conversation determines your revenue.\n\nDSS bridges the gap between having an offer and knowing how to close it. The founding cohort tuition is ₦80,000 for 8 weeks of observed roleplays and rubric-based feedback.\n\nLearn more here: ${referralLink}`,
  };

  return (
    <div className="min-h-screen bg-[#0B1117] text-[#F3F7FA] font-sans flex flex-col">
      {/* Top Banner */}
      <div className="bg-[#111C26] border-b border-white/5 px-6 py-2.5 text-xs text-[#A7B7C7] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:text-white font-medium flex items-center gap-1">
            &larr; Back to Closecraft
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/dss" className="hover:text-white font-medium">
            DSS Academy Home
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/dss/affiliate" className="text-[#45BFAE] hover:underline font-medium">
            Affiliate Program Details
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="px-2 py-0.5 rounded bg-[#F5BF65]/20 text-[#F5BF65] font-bold text-[10px] uppercase border border-[#F5BF65]/30">
              Demo Preview Mode
            </span>
          )}
          <button
            onClick={toggleDemo}
            className="px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-colors border border-white/10 flex items-center gap-1.5"
          >
            <Sparkles size={12} className="text-[#45BFAE]" />
            {isDemo ? 'Switch to My Account' : 'Preview Demo Mode'}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-6 md:p-8 gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          <div className="bg-[#111C26] border border-white/5 rounded-2xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A9CAE] mb-1">PARTNER PORTAL</div>
            <div className="font-extrabold text-white text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#45BFAE]" />
              DSS Partner Hub
            </div>
            {profile && (
              <div className="mt-3 pt-3 border-t border-white/5 text-xs text-[#A7B7C7]">
                <div className="font-semibold text-white">{profile.name}</div>
                <div className="text-[11px] font-mono text-[#45BFAE] mt-0.5">{profile.code}</div>
              </div>
            )}
          </div>

          <nav className="bg-[#111C26] border border-white/5 rounded-2xl p-3 space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'referrals', label: 'Referrals & Sales', icon: MousePointer2 },
              { id: 'payouts', label: 'Payouts & Balance', icon: Wallet },
              { id: 'toolkit', label: 'Promotion Toolkit', icon: FolderOpen },
              { id: 'profile', label: 'Partner Profile', icon: UserRound },
            ].map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#15352F] text-[#45BFAE] border border-[#45BFAE]/30'
                      : 'text-[#A7B7C7] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight size={14} />}
                </button>
              );
            })}
          </nav>

          {/* Quick Referral Box */}
          <div className="bg-gradient-to-br from-[#111C26] to-[#0D151D] border border-[#45BFAE]/20 rounded-2xl p-5">
            <div className="text-xs font-bold text-white mb-1 flex items-center gap-2">
              <Link2 size={14} className="text-[#45BFAE]" /> Your Referral Link
            </div>
            <p className="text-[11px] text-[#8A9CAE] mb-3 leading-relaxed">
              Earn ₦28,000 commission on each verified enrolment.
            </p>
            <div className="bg-[#0B1117] border border-white/10 rounded-lg p-2.5 text-[11px] font-mono text-[#45BFAE] break-all mb-3 select-all">
              {referralLink}
            </div>
            <button
              onClick={() => copyText(referralLink, 'link')}
              className="w-full py-2 bg-[#45BFAE] hover:bg-[#5CD4C3] text-[#08231F] text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              {copiedLink ? 'Copied to Clipboard!' : 'Copy Referral Link'}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-6">
          {loading ? (
            <div className="bg-[#111C26] border border-white/5 rounded-2xl p-12 text-center text-[#8A9CAE] flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin text-[#45BFAE]" size={18} />
              Loading your partner analytics...
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {tab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#111C26] border border-white/5 rounded-2xl p-5">
                      <div className="flex items-center justify-between text-xs text-[#8A9CAE] mb-2">
                        <span>Link Visits</span>
                        <MousePointer2 size={16} className="text-[#45BFAE]" />
                      </div>
                      <div className="text-3xl font-extrabold text-white">{data.clicks}</div>
                      <div className="text-[11px] text-[#8A9CAE] mt-1">Unique tracked visitors</div>
                    </div>

                    <div className="bg-[#111C26] border border-white/5 rounded-2xl p-5">
                      <div className="flex items-center justify-between text-xs text-[#8A9CAE] mb-2">
                        <span>Verified Sales</span>
                        <TrendingUp size={16} className="text-[#6AD6A7]" />
                      </div>
                      <div className="text-3xl font-extrabold text-[#6AD6A7]">{data.sales.length}</div>
                      <div className="text-[11px] text-[#8A9CAE] mt-1">
                        {data.clicks > 0
                          ? `${((data.sales.length / data.clicks) * 100).toFixed(1)}% conversion`
                          : 'Awaiting first sale'}
                      </div>
                    </div>

                    <div className="bg-[#111C26] border border-white/5 rounded-2xl p-5">
                      <div className="flex items-center justify-between text-xs text-[#8A9CAE] mb-2">
                        <span>Total Commission</span>
                        <Wallet size={16} className="text-[#45BFAE]" />
                      </div>
                      <div className="text-3xl font-extrabold text-[#45BFAE]">
                        {formatNaira(totalCommissionEarned)}
                      </div>
                      <div className="text-[11px] text-[#8A9CAE] mt-1">35% credited rate</div>
                    </div>

                    <div className="bg-[#111C26] border border-white/5 rounded-2xl p-5">
                      <div className="flex items-center justify-between text-xs text-[#8A9CAE] mb-2">
                        <span>Payouts Settled</span>
                        <Check size={16} className="text-white" />
                      </div>
                      <div className="text-3xl font-extrabold text-white">{formatNaira(totalPaidOut)}</div>
                      <div className="text-[11px] text-[#8A9CAE] mt-1">Direct bank transfers</div>
                    </div>
                  </div>

                  {/* Activity Visualizer & Conversion Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-[#111C26] border border-white/5 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-base font-bold text-white">Referral Traffic & Activity</h3>
                          <p className="text-xs text-[#8A9CAE]">Visitor flow over recent promotional windows</p>
                        </div>
                        <span className="px-2 py-1 rounded bg-[#15352F] text-[#45BFAE] text-[10px] font-bold uppercase">
                          ACTIVE
                        </span>
                      </div>

                      <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-white/5 pb-2">
                        {[
                          { day: 'Mon', h: 35, count: 14 },
                          { day: 'Tue', h: 60, count: 28 },
                          { day: 'Wed', h: 45, count: 19 },
                          { day: 'Thu', h: 80, count: 36 },
                          { day: 'Fri', h: 55, count: 24 },
                          { day: 'Sat', h: 95, count: 42 },
                          { day: 'Sun', h: 70, count: 31 },
                        ].map((bar, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                            <div className="text-[10px] text-[#45BFAE] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                              {bar.count}
                            </div>
                            <div
                              style={{ height: `${bar.h}%` }}
                              className="w-full rounded-t-md bg-gradient-to-t from-[#15352F] to-[#45BFAE] hover:to-[#5CD4C3] transition-all"
                            />
                            <span className="text-[10px] text-[#8A9CAE]">{bar.day}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-[#8A9CAE]">
                        <span>Attributed Enquiries: <strong className="text-white">{data.enquiries}</strong></span>
                        <span>Verified Enrolments: <strong className="text-[#6AD6A7]">{data.sales.length}</strong></span>
                      </div>
                    </div>

                    <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white mb-1">Clearance & Balance</h3>
                        <p className="text-xs text-[#8A9CAE] mb-6">Commission clearance cycle</p>

                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-[#0B1117] border border-white/5">
                            <div className="text-xs text-[#8A9CAE] mb-1">Available for Payout</div>
                            <div className="text-2xl font-black text-[#6AD6A7]">
                              {formatNaira(availableCommission)}
                            </div>
                            <div className="text-[10px] text-[#8A9CAE] mt-1">Cleared 14-day hold period</div>
                          </div>

                          <div className="p-4 rounded-xl bg-[#0B1117] border border-white/5">
                            <div className="text-xs text-[#8A9CAE] mb-1">Pending Clearance</div>
                            <div className="text-2xl font-bold text-[#F5BF65]">
                              {formatNaira(pendingClearance)}
                            </div>
                            <div className="text-[10px] text-[#8A9CAE] mt-1">Subject to verification</div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setTab('payouts')}
                        className="mt-6 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                      >
                        View Payout Records <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Recent Referred Sales Summary */}
                  <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-white">Recent Referred Sales</h3>
                      <button
                        onClick={() => setTab('referrals')}
                        className="text-xs text-[#45BFAE] hover:underline flex items-center gap-1"
                      >
                        View All ({data.sales.length}) &rarr;
                      </button>
                    </div>

                    {data.sales.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#8A9CAE]">
                        No verified sales yet. Share your referral link to record your first commission!
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-white/5 text-[#8A9CAE]">
                              <th className="pb-3 font-semibold">Reference</th>
                              <th className="pb-3 font-semibold">Platform</th>
                              <th className="pb-3 font-semibold">Sale Value</th>
                              <th className="pb-3 font-semibold">Commission</th>
                              <th className="pb-3 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {data.sales.slice(0, 4).map((sale) => (
                              <tr key={sale.id} className="hover:bg-white/[0.02]">
                                <td className="py-3 font-mono text-white">{sale.reference}</td>
                                <td className="py-3 text-[#A7B7C7]">{sale.platform}</td>
                                <td className="py-3 text-white">{formatNaira(sale.amount)}</td>
                                <td className="py-3 font-bold text-[#45BFAE]">{formatNaira(sale.commission)}</td>
                                <td className="py-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      sale.status === 'paid'
                                        ? 'bg-[#6AD6A7]/20 text-[#6AD6A7]'
                                        : sale.status === 'pending'
                                        ? 'bg-[#F5BF65]/20 text-[#F5BF65]'
                                        : 'bg-red-500/20 text-red-400'
                                    }`}
                                  >
                                    {sale.status}
                                  </span>
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

              {/* TAB 2: REFERRALS & SALES */}
              {tab === 'referrals' && (
                <div className="space-y-6">
                  <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">Referred Sales & Attributions</h2>
                      <p className="text-xs text-[#8A9CAE] mt-1">
                        All transactions generated through link {affiliateCode}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-[#0B1117] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#45BFAE]"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="reversed">Reversed</option>
                      </select>

                      <button
                        onClick={exportCSV}
                        disabled={data.sales.length === 0}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white text-xs font-semibold rounded-lg border border-white/10 transition-colors flex items-center gap-1.5"
                      >
                        <Download size={14} /> Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6">
                    {data.sales.length === 0 ? (
                      <div className="py-12 text-center text-sm text-[#8A9CAE]">
                        No sales recorded yet. When prospects enroll using your link, their transactions will appear here.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-white/5 text-[#8A9CAE]">
                              <th className="pb-3 font-semibold">Order Reference</th>
                              <th className="pb-3 font-semibold">Platform</th>
                              <th className="pb-3 font-semibold">Sale Amount</th>
                              <th className="pb-3 font-semibold">Commission (35%)</th>
                              <th className="pb-3 font-semibold">Status</th>
                              <th className="pb-3 font-semibold">Eligible Clearance</th>
                              <th className="pb-3 font-semibold">Created Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {data.sales
                              .filter((s) => statusFilter === 'all' || s.status === statusFilter)
                              .map((sale) => (
                                <tr key={sale.id} className="hover:bg-white/[0.02]">
                                  <td className="py-3 font-mono text-white">{sale.reference}</td>
                                  <td className="py-3 text-[#A7B7C7]">{sale.platform}</td>
                                  <td className="py-3 text-white">{formatNaira(sale.amount)}</td>
                                  <td className="py-3 font-bold text-[#45BFAE]">{formatNaira(sale.commission)}</td>
                                  <td className="py-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        sale.status === 'paid'
                                          ? 'bg-[#6AD6A7]/20 text-[#6AD6A7]'
                                          : sale.status === 'pending'
                                          ? 'bg-[#F5BF65]/20 text-[#F5BF65]'
                                          : 'bg-red-500/20 text-red-400'
                                      }`}
                                    >
                                      {sale.status}
                                    </span>
                                  </td>
                                  <td className="py-3 text-[#8A9CAE]">
                                    {new Date(sale.eligible).toLocaleDateString('en-GB')}
                                  </td>
                                  <td className="py-3 text-[#8A9CAE]">
                                    {new Date(sale.created).toLocaleDateString('en-GB')}
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

              {/* TAB 3: PAYOUTS */}
              {tab === 'payouts' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#111C26] border border-[#6AD6A7]/30 rounded-2xl p-6">
                      <div className="text-xs text-[#8A9CAE] font-medium mb-1">Available for Next Transfer</div>
                      <div className="text-3xl font-black text-[#6AD6A7] mb-2">
                        {formatNaira(availableCommission)}
                      </div>
                      <p className="text-xs text-[#A7B7C7] leading-relaxed">
                        Funds that have completed the 14-day clearance hold. Payouts are transferred automatically on the 1st and 15th of every month.
                      </p>
                    </div>

                    <div className="bg-[#111C26] border border-[#F5BF65]/30 rounded-2xl p-6">
                      <div className="text-xs text-[#8A9CAE] font-medium mb-1">Pending Clearance Hold</div>
                      <div className="text-3xl font-bold text-[#F5BF65] mb-2">
                        {formatNaira(pendingClearance)}
                      </div>
                      <p className="text-xs text-[#A7B7C7] leading-relaxed">
                        Recent enrolments currently within the 14-day clearance period. Once cleared, they move automatically to your available balance.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-base font-bold text-white mb-4">Historical Payout Ledger</h3>
                    {data.payouts.length === 0 ? (
                      <div className="py-10 text-center text-xs text-[#8A9CAE]">
                        No completed payouts recorded yet. Minimum payout threshold is ₦20,000.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-white/5 text-[#8A9CAE]">
                              <th className="pb-3 font-semibold">Transfer Reference</th>
                              <th className="pb-3 font-semibold">Amount Disbursed</th>
                              <th className="pb-3 font-semibold">Settlement Date</th>
                              <th className="pb-3 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {data.payouts.map((payout) => (
                              <tr key={payout.id} className="hover:bg-white/[0.02]">
                                <td className="py-3 font-mono text-white">{payout.reference}</td>
                                <td className="py-3 font-bold text-[#6AD6A7]">{formatNaira(payout.amount)}</td>
                                <td className="py-3 text-[#8A9CAE]">
                                  {new Date(payout.created).toLocaleDateString('en-GB')}
                                </td>
                                <td className="py-3">
                                  <span className="px-2 py-0.5 rounded-full bg-[#6AD6A7]/20 text-[#6AD6A7] text-[10px] font-bold uppercase">
                                    CONFIRMED
                                  </span>
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

              {/* TAB 4: PROMOTION TOOLKIT */}
              {tab === 'toolkit' && (
                <div className="space-y-6">
                  <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-1">Done-For-You Promotion Toolkit</h2>
                    <p className="text-xs text-[#8A9CAE]">
                      Copy and adapt these high-converting promotional scripts. They include your unique tracking link.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* WhatsApp Script */}
                    <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-[#6AD6A7] uppercase tracking-wider">
                            WHATSAPP STATUS / COMMUNITY
                          </span>
                          <span className="text-[10px] text-[#8A9CAE]">High Conversion</span>
                        </div>
                        <div className="bg-[#0B1117] border border-white/5 rounded-xl p-4 text-xs text-[#F3F7FA] whitespace-pre-line leading-relaxed font-sans mb-4">
                          {captions.whatsapp}
                        </div>
                      </div>
                      <button
                        onClick={() => copyText(captions.whatsapp, 'whatsapp')}
                        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                      >
                        {copiedCaption === 'whatsapp' ? <Check size={14} /> : <Copy size={14} />}
                        {copiedCaption === 'whatsapp' ? 'Copied WhatsApp Script!' : 'Copy WhatsApp Script'}
                      </button>
                    </div>

                    {/* Twitter/X Thread */}
                    <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-[#7AA2FF] uppercase tracking-wider">
                            TWITTER / X HOOK
                          </span>
                          <span className="text-[10px] text-[#8A9CAE]">Tech & Freelancers</span>
                        </div>
                        <div className="bg-[#0B1117] border border-white/5 rounded-xl p-4 text-xs text-[#F3F7FA] whitespace-pre-line leading-relaxed font-sans mb-4">
                          {captions.twitter}
                        </div>
                      </div>
                      <button
                        onClick={() => copyText(captions.twitter, 'twitter')}
                        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                      >
                        {copiedCaption === 'twitter' ? <Check size={14} /> : <Copy size={14} />}
                        {copiedCaption === 'twitter' ? 'Copied Twitter Hook!' : 'Copy Twitter Hook'}
                      </button>
                    </div>

                    {/* LinkedIn Post */}
                    <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-[#45BFAE] uppercase tracking-wider">
                            LINKEDIN B2B POST
                          </span>
                          <span className="text-[10px] text-[#8A9CAE]">Founders & Executives</span>
                        </div>
                        <div className="bg-[#0B1117] border border-white/5 rounded-xl p-4 text-xs text-[#F3F7FA] whitespace-pre-line leading-relaxed font-sans mb-4">
                          {captions.linkedin}
                        </div>
                      </div>
                      <button
                        onClick={() => copyText(captions.linkedin, 'linkedin')}
                        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                      >
                        {copiedCaption === 'linkedin' ? <Check size={14} /> : <Copy size={14} />}
                        {copiedCaption === 'linkedin' ? 'Copied LinkedIn Post!' : 'Copy LinkedIn Post'}
                      </button>
                    </div>

                    {/* Downloadable Assets */}
                    <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-[#F5BF65] uppercase tracking-wider mb-2">
                          FREE VALUE LEAD MAGNETS
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2">DSS Sample Lesson & Rubric Sheet</h4>
                        <p className="text-xs text-[#A7B7C7] leading-relaxed mb-4">
                          Instead of asking people to buy directly, share the free sample lesson worksheet. When they see the depth of Emmanuel Effiong's discovery framework, they convert on their own.
                        </p>
                      </div>
                      <Link
                        href="/dss"
                        className="w-full py-2.5 rounded-xl bg-[#45BFAE] hover:bg-[#5CD4C3] text-[#08231F] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <FileText size={14} /> View Free Lesson & Offer
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PROFILE */}
              {tab === 'profile' && (
                <div className="space-y-6">
                  <div className="bg-[#111C26] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-1">Your Partner Profile</h2>
                    <p className="text-xs text-[#8A9CAE]">Account details and verified tracking identity</p>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#0B1117] border border-white/5">
                        <div className="text-xs text-[#8A9CAE] mb-1">Partner Name</div>
                        <div className="text-sm font-semibold text-white">{profile?.name || 'Partner Account'}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#0B1117] border border-white/5">
                        <div className="text-xs text-[#8A9CAE] mb-1">Account Email</div>
                        <div className="text-sm font-semibold text-white">{profile?.email || 'partner@closecraft.ng'}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#0B1117] border border-white/5">
                        <div className="text-xs text-[#8A9CAE] mb-1">Assigned Partner Code</div>
                        <div className="text-sm font-mono font-bold text-[#45BFAE]">{affiliateCode}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#0B1117] border border-white/5">
                        <div className="text-xs text-[#8A9CAE] mb-1">Promotion Channel / Plan</div>
                        <div className="text-sm text-white">{profile?.channel || 'Direct Network & Online Community'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
