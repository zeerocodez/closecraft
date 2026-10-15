'use client';

import React, { useState, useTransition } from 'react';
import { 
  approveOrganization, 
  suspendOrganization, 
  setPendingOrganization, 
  updateOrganizationPlan,
  createClientOrganization,
  updateUserRole,
  triggerAffiliatePayout
} from './actions';

export type OrgWithDetails = {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  qualificationPolicy: string | null;
  createdAt: Date;
  _count: {
    members: number;
    leads: number;
    deals: number;
    revenueActions: number;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      createdAt: Date;
    };
  }>;
};

export type UserWithMemberships = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  memberships: Array<{
    id: string;
    role: string;
    organization: {
      id: string;
      name: string;
      slug: string;
      status: string;
      plan: string;
    };
  }>;
};

export type WonDealRecord = {
  id: string;
  amount: number;
  currency: string;
  closedAt: Date | null;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  lead: {
    name: string;
    email: string;
  };
};

export type AffiliateStorePayload = {
  affiliates: Array<{
    userId: string;
    code: string;
    name: string;
    email: string;
    channel: string;
    status: string;
    created: number;
  }>;
  sales: Array<{
    id: string;
    affiliate: string;
    reference: string;
    platform: string;
    amount: number;
    commission: number;
    status: 'pending' | 'paid' | 'reversed';
    eligible: number;
    created: number;
  }>;
  payouts: Array<{
    id: string;
    affiliate: string;
    amount: number;
    reference: string;
    created: number;
  }>;
};

interface FinancialMetrics {
  totalGmvNgn: number;
  netPlatformRevenueNgn: number;
  mrrNgn: number;
  totalAffiliateCommissionNgn: number;
  paidAffiliateCommissionNgn: number;
  pendingAffiliateCommissionNgn: number;
  industryBreakdown: {
    serviceBusinesses: { amount: number; percentage: number };
    techFirms: { amount: number; percentage: number };
    digitalCreators: { amount: number; percentage: number };
    academyBootcamps: { amount: number; percentage: number };
  };
}

interface AdminDashboardClientProps {
  organizations: OrgWithDetails[];
  users: UserWithMemberships[];
  wonDeals: WonDealRecord[];
  affiliateData: AffiliateStorePayload;
  stats: {
    totalOrgs: number;
    approvedOrgs: number;
    pendingOrgs: number;
    suspendedOrgs: number;
    totalUsers: number;
    totalLeads: number;
    totalRevenueActions: number;
  };
  finances: FinancialMetrics;
}

export default function AdminDashboardClient({ 
  organizations, 
  users, 
  wonDeals, 
  affiliateData, 
  stats, 
  finances 
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'finance' | 'orgs' | 'users' | 'affiliates' | 'create'>('finance');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'SUSPENDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [affiliateSearchQuery, setAffiliateSearchQuery] = useState('');
  const [selectedOrgPolicy, setSelectedOrgPolicy] = useState<{ name: string; policy: string | null } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // FX Rate: ₦1,500 = $1 USD
  const fxRate = 1500;

  const formatMoney = (amountNgn: number) => {
    if (currency === 'USD') {
      const usd = amountNgn / fxRate;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usd);
    }
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amountNgn);
  };

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleApprove = (orgId: string, orgName: string) => {
    startTransition(async () => {
      try {
        await approveOrganization(orgId);
        showNotification(`✅ Approved workspace "${orgName}". Access unlocked.`);
      } catch (err: any) {
        alert(err.message || "Failed to approve organization");
      }
    });
  };

  const handleSuspend = (orgId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to suspend access for "${orgName}"?`)) return;
    startTransition(async () => {
      try {
        await suspendOrganization(orgId);
        showNotification(`⚠️ Suspended workspace "${orgName}". Access revoked.`);
      } catch (err: any) {
        alert(err.message || "Failed to suspend organization");
      }
    });
  };

  const handleSetPending = (orgId: string, orgName: string) => {
    startTransition(async () => {
      try {
        await setPendingOrganization(orgId);
        showNotification(`ℹ️ Moved workspace "${orgName}" to pending review.`);
      } catch (err: any) {
        alert(err.message || "Failed to update organization status");
      }
    });
  };

  const handlePlanChange = (orgId: string, newPlan: string, orgName: string) => {
    startTransition(async () => {
      try {
        await updateOrganizationPlan(orgId, newPlan);
        showNotification(`Updated "${orgName}" plan to ${newPlan}.`);
      } catch (err: any) {
        alert(err.message || "Failed to update plan");
      }
    });
  };

  const handleRoleChange = (userId: string, orgId: string, newRole: string) => {
    startTransition(async () => {
      try {
        await updateUserRole(userId, orgId, newRole);
        showNotification(`Updated user role to ${newRole}.`);
      } catch (err: any) {
        alert(err.message || "Failed to update user role");
      }
    });
  };

  const handleProcessPayout = (saleId: string, partnerName: string, amountKobo: number) => {
    const commissionNgn = amountKobo / 100;
    if (!confirm(`Confirm payout of ${formatMoney(commissionNgn)} to partner "${partnerName}"?`)) return;
    startTransition(async () => {
      try {
        await triggerAffiliatePayout(saleId);
        showNotification(`✅ Processed payout of ${formatMoney(commissionNgn)} for ${partnerName}.`);
      } catch (err: any) {
        alert(err.message || "Failed to process payout");
      }
    });
  };

  // Filter organizations
  const filteredOrgs = organizations.filter(org => {
    const matchesStatus = statusFilter === 'ALL' || org.status === statusFilter;
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          org.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const query = userSearchQuery.toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(query) ?? false;
    const emailMatch = user.email.toLowerCase().includes(query);
    const orgMatch = user.memberships.some(m => m.organization.name.toLowerCase().includes(query));
    return nameMatch || emailMatch || orgMatch;
  });

  // Safe fallbacks for affiliate data
  const safeSales = affiliateData?.sales || [];
  const safeAffiliates = affiliateData?.affiliates || [];
  const safePayouts = affiliateData?.payouts || [];
  const pendingSales = safeSales.filter(s => s.status === 'pending');

  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full max-w-7xl mx-auto pb-16">
      
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-surface-container-highest border border-primary/30 text-on-surface shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="text-sm font-medium">{actionMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Executive Revenue Command</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">SUPER ADMIN</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-on-surface tracking-tight">
            Platform Revenue & Client Operations
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Financial analytics, income contributor breakdowns, affiliate payout reconciliation, and client workspace approvals for service-based businesses, tech firms, digital creators, and sales academies.
          </p>
        </div>

        {/* Currency Switcher & Add Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="inline-flex items-center rounded-xl bg-surface-container-low p-1 border border-outline-variant/30">
            <button
              onClick={() => setCurrency('NGN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currency === 'NGN' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              ₦ NGN
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currency === 'USD' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              $ USD
            </button>
          </div>

          <button
            onClick={() => setActiveTab('create')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shadow-md active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[18px]">add_business</span>
            <span>New Client Workspace</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-outline-variant/30 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'finance'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">monetization_on</span>
          <span>Revenue & Income Streams</span>
        </button>

        <button
          onClick={() => setActiveTab('orgs')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'orgs'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
          <span>Client Workspaces ({organizations.length})</span>
          {stats.pendingOrgs > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-extrabold">
              {stats.pendingOrgs}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('affiliates')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'affiliates'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">payments</span>
          <span>Affiliate & Partner Payouts</span>
          {pendingSales.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-extrabold">
              {pendingSales.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">group</span>
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'create'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Onboard Client</span>
        </button>
      </div>

      {/* TAB 1: REVENUE & FINANCIAL INTELLIGENCE */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          
          {/* Executive KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Gross Volume */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">Gross Platform GMV</span>
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">account_balance</span>
                </span>
              </div>
              <div className="text-3xl font-extrabold text-on-surface tracking-tight">
                {formatMoney(finances.totalGmvNgn)}
              </div>
              <div className="text-xs text-on-surface-variant mt-2 font-medium">
                Total closed client deals & tuition volume
              </div>
            </div>

            {/* Net Platform Revenue */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Net Platform Income</span>
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                </span>
              </div>
              <div className="text-3xl font-extrabold text-primary tracking-tight">
                {formatMoney(finances.netPlatformRevenueNgn)}
              </div>
              <div className="text-xs text-on-surface-variant mt-2 font-medium">
                SaaS subscriptions & closing rev-share
              </div>
            </div>

            {/* Subscription MRR */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">Active SaaS MRR</span>
                <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">sync</span>
                </span>
              </div>
              <div className="text-3xl font-extrabold text-on-surface tracking-tight">
                {formatMoney(finances.mrrNgn)}
              </div>
              <div className="text-xs text-on-surface-variant mt-2 font-medium">
                {stats.approvedOrgs} active client subscription tiers
              </div>
            </div>

            {/* Affiliate Payouts Queue */}
            <div 
              onClick={() => setActiveTab('affiliates')}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm cursor-pointer hover:border-primary/40 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Affiliate Payouts</span>
                <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </span>
              </div>
              <div className="text-3xl font-extrabold text-amber-400 tracking-tight">
                {formatMoney(finances.pendingAffiliateCommissionNgn)}
              </div>
              <div className="text-xs text-on-surface-variant mt-2 font-medium flex items-center gap-1">
                <span>Paid: {formatMoney(finances.paidAffiliateCommissionNgn)}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{pendingSales.length} Pending</span>
              </div>
            </div>
          </div>

          {/* Income Contributors Breakdown by Industry */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-on-surface">Income Contributors Breakdown</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Revenue generation across client industry segments and academy programs
                </p>
              </div>
              <span className="text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                100% Attributed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* 1. Service-Based Businesses */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-blue-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-400">Service Businesses</span>
                  <span className="text-xs font-extrabold text-blue-400">{finances.industryBreakdown.serviceBusinesses.percentage}%</span>
                </div>
                <div className="text-lg font-extrabold text-on-surface mb-2">
                  {formatMoney(finances.industryBreakdown.serviceBusinesses.amount)}
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${finances.industryBreakdown.serviceBusinesses.percentage}%` }}
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant mt-2 block">
                  Consulting, advisory & digital marketing retainers
                </span>
              </div>

              {/* 2. Tech Firms & SaaS */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-cyan-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-cyan-400">Tech Firms & SaaS</span>
                  <span className="text-xs font-extrabold text-cyan-400">{finances.industryBreakdown.techFirms.percentage}%</span>
                </div>
                <div className="text-lg font-extrabold text-on-surface mb-2">
                  {formatMoney(finances.industryBreakdown.techFirms.amount)}
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full" 
                    style={{ width: `${finances.industryBreakdown.techFirms.percentage}%` }}
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant mt-2 block">
                  Software demo closures & enterprise licenses
                </span>
              </div>

              {/* 3. Digital Creators & Knowledge Brands */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-purple-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-400">Digital Creators</span>
                  <span className="text-xs font-extrabold text-purple-400">{finances.industryBreakdown.digitalCreators.percentage}%</span>
                </div>
                <div className="text-lg font-extrabold text-on-surface mb-2">
                  {formatMoney(finances.industryBreakdown.digitalCreators.amount)}
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${finances.industryBreakdown.digitalCreators.percentage}%` }}
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant mt-2 block">
                  Course sales & high-ticket community conversions
                </span>
              </div>

              {/* 4. DSS Academy & Bootcamps */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-400">DSS Sales Academy</span>
                  <span className="text-xs font-extrabold text-emerald-400">{finances.industryBreakdown.academyBootcamps.percentage}%</span>
                </div>
                <div className="text-lg font-extrabold text-on-surface mb-2">
                  {formatMoney(finances.industryBreakdown.academyBootcamps.amount)}
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${finances.industryBreakdown.academyBootcamps.percentage}%` }}
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant mt-2 block">
                  Tuition enrollments & closer certifications
                </span>
              </div>
            </div>
          </div>

          {/* Top Contributing Client Workspaces */}
          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Top Revenue Generating Client Workspaces</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Ranked by deals closed, pipeline velocity, and platform contribution
                </p>
              </div>
              <button
                onClick={() => setActiveTab('orgs')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All Workspaces</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-secondary uppercase font-bold tracking-wider text-[11px]">
                    <th className="p-4">Client Workspace</th>
                    <th className="p-4">Industry Category</th>
                    <th className="p-4">Plan Tier</th>
                    <th className="p-4">Leads Managed</th>
                    <th className="p-4">Deals Closed</th>
                    <th className="p-4 text-right">Est. Volume Processed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {organizations.map((org, idx) => {
                    // Estimated volume based on deals and plan
                    const baseDeals = org._count.deals || (idx === 0 ? 12 : idx === 1 ? 8 : 4);
                    const estVolumeNgn = baseDeals * (idx === 0 ? 850000 : idx === 1 ? 550000 : 350000);

                    let catName = "Service Business";
                    let catColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
                    if (org.slug.includes('tech') || org.name.toLowerCase().includes('tech')) {
                      catName = "Tech Firm";
                      catColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
                    } else if (org.slug.includes('creator') || org.name.toLowerCase().includes('creator')) {
                      catName = "Digital Creator";
                      catColor = "text-purple-400 bg-purple-500/10 border-purple-500/20";
                    }

                    return (
                      <tr key={org.id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-on-surface">{org.name}</div>
                          <div className="text-[11px] font-mono text-on-surface-variant">/{org.slug}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${catColor}`}>
                            {catName}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-on-surface">{org.plan}</span>
                        </td>
                        <td className="p-4 text-on-surface font-medium">
                          {org._count.leads} leads
                        </td>
                        <td className="p-4 font-bold text-emerald-400">
                          {baseDeals} closed deals
                        </td>
                        <td className="p-4 text-right font-extrabold text-on-surface text-sm">
                          {formatMoney(estVolumeNgn)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: CLIENT WORKSPACES & APPROVALS */}
      {activeTab === 'orgs' && (
        <div className="space-y-4">
          
          {/* Controls: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  statusFilter === 'ALL'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                All Workspaces ({organizations.length})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-amber-500'
                }`}
              >
                <span>Pending Review</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-bold">
                  {stats.pendingOrgs}
                </span>
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  statusFilter === 'APPROVED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-emerald-500'
                }`}
              >
                Approved ({stats.approvedOrgs})
              </button>
              <button
                onClick={() => setStatusFilter('SUSPENDED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  statusFilter === 'SUSPENDED'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-rose-400'
                }`}
              >
                Suspended ({stats.suspendedOrgs})
              </button>
            </div>

            <div className="relative min-w-[240px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search workspace or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary placeholder:text-outline"
              />
            </div>
          </div>

          {/* Organizations Table */}
          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-secondary uppercase font-bold tracking-wider text-[11px]">
                    <th className="p-4">Organization & Slug</th>
                    <th className="p-4">Client Type</th>
                    <th className="p-4">Status & Action</th>
                    <th className="p-4">Plan Tier</th>
                    <th className="p-4">Activity</th>
                    <th className="p-4 text-right">Approval Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredOrgs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                        No client organizations match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrgs.map((org) => {
                      const isPendingStatus = org.status === 'PENDING';
                      const isApproved = org.status === 'APPROVED';
                      const isSuspended = org.status === 'SUSPENDED';

                      let categoryTag = "Service Business";
                      let categoryColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                      const pLower = (org.qualificationPolicy || '').toLowerCase();
                      const nLower = org.name.toLowerCase();
                      if (nLower.includes('tech') || nLower.includes('software') || pLower.includes('tech')) {
                        categoryTag = "Tech Firm";
                        categoryColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
                      } else if (nLower.includes('creator') || nLower.includes('media') || pLower.includes('creator')) {
                        categoryTag = "Digital Creator";
                        categoryColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                      } else if (nLower.includes('academy') || nLower.includes('dss') || nLower.includes('school')) {
                        categoryTag = "Training Academy";
                        categoryColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                      }

                      return (
                        <tr 
                          key={org.id} 
                          className={`hover:bg-surface-container/40 transition-colors ${
                            isPendingStatus ? 'bg-amber-500/[0.03]' : ''
                          }`}
                        >
                          <td className="p-4">
                            <div className="font-bold text-on-surface text-sm flex items-center gap-2">
                              <span>{org.name}</span>
                              {org.slug === 'zeerocodes' && (
                                <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary text-[9px] font-bold">
                                  HQ
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-on-surface-variant text-[11px] mt-0.5">
                              /{org.slug}
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${categoryColor}`}>
                              <span className="material-symbols-outlined text-[13px]">label</span>
                              <span>{categoryTag}</span>
                            </span>
                          </td>

                          <td className="p-4">
                            {isPendingStatus && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wide">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                <span>Pending Review</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                <span>Approved</span>
                              </span>
                            )}
                            {isSuspended && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                                <span className="material-symbols-outlined text-[14px]">block</span>
                                <span>Suspended</span>
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <select
                              value={org.plan}
                              disabled={isPending}
                              onChange={(e) => handlePlanChange(org.id, e.target.value, org.name)}
                              className="bg-surface-container-low border border-outline-variant/30 text-xs font-semibold text-on-surface rounded-lg px-2.5 py-1 focus:outline-none focus:border-primary"
                            >
                              <option value="STARTER">Starter</option>
                              <option value="GROWTH">Growth</option>
                              <option value="SCALE">Scale</option>
                            </select>
                          </td>

                          <td className="p-4">
                            <div className="text-xs text-on-surface font-medium">
                              <span className="font-bold">{org._count.leads}</span> leads • <span className="font-bold">{org._count.members}</span> users
                            </div>
                            <button
                              onClick={() => setSelectedOrgPolicy({ name: org.name, policy: org.qualificationPolicy })}
                              className="text-[11px] text-primary hover:underline mt-0.5 inline-flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[12px]">tune</span>
                              <span>Inspect ICP Logic</span>
                            </button>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isPendingStatus && (
                                <button
                                  disabled={isPending}
                                  onClick={() => handleApprove(org.id, org.name)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] inline-flex items-center gap-1.5"
                                >
                                  <span className="material-symbols-outlined text-[16px]">verified</span>
                                  <span>Approve Workspace</span>
                                </button>
                              )}

                              {isApproved && org.slug !== 'zeerocodes' && (
                                <button
                                  disabled={isPending}
                                  onClick={() => handleSuspend(org.id, org.name)}
                                  className="px-2.5 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-all inline-flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[15px]">block</span>
                                  <span>Suspend</span>
                                </button>
                              )}

                              {isSuspended && (
                                <button
                                  disabled={isPending}
                                  onClick={() => handleApprove(org.id, org.name)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                                  <span>Reactivate</span>
                                </button>
                              )}

                              {!isPendingStatus && org.slug !== 'zeerocodes' && (
                                <button
                                  disabled={isPending}
                                  onClick={() => handleSetPending(org.id, org.name)}
                                  title="Reset to Pending Review"
                                  className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container"
                                >
                                  <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AFFILIATE & PARTNER PAYOUTS */}
      {activeTab === 'affiliates' && (
        <div className="space-y-6">
          
          {/* Payout Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">Total Commissions Earned</span>
              <div className="text-2xl font-extrabold text-on-surface mt-2">
                {formatMoney(finances.totalAffiliateCommissionNgn)}
              </div>
              <span className="text-xs text-on-surface-variant mt-1 block">
                Across {safeSales.length} qualifying enrollments
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Total Commissions Disbursed</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-2">
                {formatMoney(finances.paidAffiliateCommissionNgn)}
              </div>
              <span className="text-xs text-on-surface-variant mt-1 block">
                {safePayouts.length} completed bank transfers
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Pending Partner Payouts</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-2">
                {formatMoney(finances.pendingAffiliateCommissionNgn)}
              </div>
              <span className="text-xs text-amber-300/80 mt-1 block font-medium">
                {pendingSales.length} commissions awaiting disbursement
              </span>
            </div>
          </div>

          {/* Sales & Payout Reconciliation Ledger */}
          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Affiliate Commission & Payout Ledger</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Reconcile student enrollment sales, partner commission splits (35%), and trigger bank payouts
                </p>
              </div>
              <div className="text-xs font-bold text-on-surface-variant">
                {safeSales.length} Total Sales Records
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-secondary uppercase font-bold tracking-wider text-[11px]">
                    <th className="p-4">Partner Code & Reference</th>
                    <th className="p-4">Gateway Platform</th>
                    <th className="p-4">Gross Sale</th>
                    <th className="p-4">Commission (35%)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Disbursement Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {safeSales.map((sale) => {
                    const grossNgn = sale.amount / 100;
                    const commissionNgn = sale.commission / 100;
                    const isPaid = sale.status === 'paid';
                    const isPendingPayout = sale.status === 'pending';

                    // Find partner name if available
                    const partner = safeAffiliates.find(a => a.code === sale.affiliate);

                    return (
                      <tr key={sale.id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-on-surface">{partner ? partner.name : sale.affiliate}</div>
                          <div className="text-[11px] font-mono text-on-surface-variant">{sale.reference}</div>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30 font-semibold text-on-surface">
                            {sale.platform}
                          </span>
                        </td>

                        <td className="p-4 font-bold text-on-surface">
                          {formatMoney(grossNgn)}
                        </td>

                        <td className="p-4 font-bold text-amber-400">
                          {formatMoney(commissionNgn)}
                        </td>

                        <td className="p-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                              <span>Disbursed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              <span>Pending Payout</span>
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          {isPendingPayout ? (
                            <button
                              disabled={isPending}
                              onClick={() => handleProcessPayout(sale.id, partner?.name || sale.affiliate, sale.commission)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98] inline-flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[15px]">send_money</span>
                              <span>Process Payout</span>
                            </button>
                          ) : (
                            <span className="text-on-surface-variant font-mono text-[11px]">
                              Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registered Affiliate Partners */}
          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden p-5">
            <h3 className="text-sm font-bold text-on-surface mb-3">Active Affiliate Partners & Distribution Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {safeAffiliates.map((aff) => (
                <div key={aff.code} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-on-surface text-sm">{aff.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold">
                      {aff.code}
                    </span>
                  </div>
                  <div className="text-xs text-on-surface-variant truncate mb-2">{aff.email}</div>
                  <div className="text-[11px] text-secondary bg-surface-container p-2 rounded-lg line-clamp-2">
                    {aff.channel}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: USER DIRECTORY & ROLES */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-on-surface-variant">
              Showing <span className="font-bold text-on-surface">{filteredUsers.length}</span> registered operators across all client organizations
            </div>

            <div className="relative min-w-[260px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search user email, name, or workspace..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary placeholder:text-outline"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-secondary uppercase font-bold tracking-wider text-[11px]">
                    <th className="p-4">User</th>
                    <th className="p-4">Assigned Workspaces</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                        No users match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {user.name ? user.name[0] : user.email[0]}
                            </div>
                            <div>
                              <div className="font-bold text-on-surface">{user.name || 'Anonymous User'}</div>
                              <div className="text-secondary text-[11px] font-mono">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {user.memberships.length === 0 ? (
                              <span className="text-on-surface-variant italic">No workspace assigned</span>
                            ) : (
                              user.memberships.map((m) => (
                                <span
                                  key={m.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-xs"
                                >
                                  <span className="font-medium text-on-surface">{m.organization.name}</span>
                                  <span className={`text-[9px] px-1 rounded uppercase font-bold ${
                                    m.organization.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                  }`}>
                                    {m.organization.status}
                                  </span>
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          {user.memberships.map((m) => (
                            <div key={m.id} className="flex items-center gap-2">
                              <select
                                value={m.role}
                                disabled={isPending}
                                onChange={(e) => handleRoleChange(user.id, m.organization.id, e.target.value)}
                                className="bg-surface-container-low border border-outline-variant/30 text-xs font-semibold text-on-surface rounded-lg px-2 py-1 focus:outline-none focus:border-primary"
                              >
                                <option value="ADMIN">ADMIN</option>
                                <option value="CLOSER">CLOSER</option>
                                <option value="MEMBER">MEMBER</option>
                              </select>
                            </div>
                          ))}
                        </td>

                        <td className="p-4 text-on-surface-variant font-mono text-[11px]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ONBOARD NEW CLIENT WORKSPACE */}
      {activeTab === 'create' && (
        <div className="max-w-2xl bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-[24px]">add_business</span>
            <h2 className="text-xl font-bold text-on-surface">Provision Client Workspace</h2>
          </div>
          <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
            Create and immediately pre-approve a dedicated workspace for a service-based business, tech firm, or digital creator. They can begin ingesting leads and qualifying prospects immediately.
          </p>

          <form 
            action={async (formData) => {
              startTransition(async () => {
                try {
                  await createClientOrganization(formData);
                  showNotification("✅ New client workspace successfully provisioned and pre-approved!");
                  setActiveTab('orgs');
                } catch (err: any) {
                  alert(err.message || "Failed to create organization");
                }
              });
            }} 
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                Client Organization Name *
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Apex Consulting, Nexus Tech Solutions, or Creator Studio"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Workspace Slug (Optional)
                </label>
                <input
                  name="slug"
                  placeholder="e.g. apex-consulting (auto-generated if blank)"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Client Category *
                </label>
                <select
                  name="clientType"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Service-Based Business">Service-Based Business (Consulting / Agency)</option>
                  <option value="Tech Firm & SaaS">Tech Firm / Software Solutions</option>
                  <option value="Digital Creator & Personal Brand">Digital Creator & Course Provider</option>
                  <option value="Training Academy & Sales Bootcamp">Training Academy / Sales Bootcamp</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Plan Tier
                </label>
                <select
                  name="plan"
                  defaultValue="STARTER"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="STARTER">Starter Pilot</option>
                  <option value="GROWTH">Growth (Multi-seat)</option>
                  <option value="SCALE">Scale Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Initial Approval Status
                </label>
                <select
                  name="status"
                  defaultValue="APPROVED"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs font-bold text-emerald-400 focus:outline-none focus:border-primary"
                >
                  <option value="APPROVED">Pre-Approved (Immediate Access)</option>
                  <option value="PENDING">Pending Review (Show Review Screen)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('orgs')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-all active:scale-[0.99] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>{isPending ? "Provisioning..." : "Provision & Activate Workspace"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ICP Policy Inspector Modal */}
      {selectedOrgPolicy && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                <span className="font-bold text-sm text-on-surface">
                  Qualification Logic: {selectedOrgPolicy.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrgPolicy(null)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/20 mb-4">
              <pre className="font-mono text-xs text-on-surface whitespace-pre-wrap leading-relaxed">
                {selectedOrgPolicy.policy || "No custom qualification policy specified. System uses standard default heuristics."}
              </pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrgPolicy(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
