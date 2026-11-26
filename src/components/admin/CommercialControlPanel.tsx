'use client';

import React, { useEffect, useState } from 'react';
import { formatMoneyDisplay } from '@/lib/billing/catalog';
import {
  DollarSign,
  Tag,
  Sliders,
  ShieldCheck,
  Users,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Plus,
} from 'lucide-react';

interface CommercialAnalytics {
  mrrNgn: number;
  arrNgn: number;
  activePaidSubscriptions: number;
  trialAccountsCount: number;
  graceOrPastDueCount: number;
  cancelledOrExpiredCount: number;
  churnRatePercent: number;
  arpaNgn: number;
  verifiedCollectedRevenueNgn: number;
  subscriptionRevenueNgn: number;
  serviceRevenueNgn: number;
  leadRecoveryRevenueNgn: number;
  outstandingInvoicesNgn: number;
  outstandingInvoicesCount: number;
  refundedInvoicesNgn: number;
  failedPaymentAttemptsCount: number;
  commissionPayableNgn: number;
  commissionPaidNgn: number;
  revenueByPlan: Record<string, { count: number; revenueNgn: number }>;
  revenueByCountry: Record<string, { count: number; revenueNgn: number }>;
}

export default function CommercialControlPanel({
  analytics,
}: {
  analytics: CommercialAnalytics;
}) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'analytics' | 'pricing' | 'promos' | 'subscriptions' | 'commissions'>('analytics');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Promo form state
  const [promoCode, setPromoCode] = useState('');
  const [promoType, setPromoType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [promoValue, setPromoValue] = useState('15');
  const [promoCurrency, setPromoCurrency] = useState('NGN');

  // Policy state
  const [trialDays, setTrialDays] = useState('7');
  const [graceDays, setGraceDays] = useState('5');

  // Price edit state
  const [priceEdits, setPriceEdits] = useState<Record<string, { monthly: string; annual: string }>>({});

  // Manual subscription override state
  const [adjustOrgId, setAdjustOrgId] = useState('');
  const [adjustStatus, setAdjustStatus] = useState('ACTIVE');
  const [adjustPlan, setAdjustPlan] = useState('ENTERPRISE');
  const [adjustLeads, setAdjustLeads] = useState('25000');
  const [adjustSeats, setAdjustSeats] = useState('30');
  const [adjustReason, setAdjustReason] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/commercial');
      const json = await res.json();
      if (res.ok) {
        setData(json);
        if (json.settings) {
          setTrialDays(String(json.settings.defaultTrialDays ?? 7));
          setGraceDays(String(json.settings.defaultGracePeriodDays ?? 5));
        }
        const initialEdits: Record<string, { monthly: string; annual: string }> = {};
        for (const p of json.plans || []) {
          for (const rp of p.regionalPrices || []) {
            initialEdits[rp.id] = { monthly: String(rp.monthlyPrice), annual: String(rp.annualPrice) };
          }
        }
        setPriceEdits(initialEdits);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const callAdminAction = async (payload: Record<string, any>, successMessage: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/commercial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Operation failed');
      setMsg(successMessage);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error updating commercial configuration');
    } finally {
      setBusy(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container border border-outline-variant/30 text-center text-sm text-on-surface-variant">
        Loading Superadmin Commercial Control Centre...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      {/* Sub-navigation */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'analytics', label: 'Verified Revenue Analytics', icon: <DollarSign size={14} /> },
          { id: 'pricing', label: 'Plans, Regional Prices & Policy', icon: <Sliders size={14} /> },
          { id: 'promos', label: 'Promo Codes', icon: <Tag size={14} /> },
          { id: 'subscriptions', label: 'Subscriptions & Enterprise Custom', icon: <Users size={14} /> },
          { id: 'commissions', label: 'Sales Agreements & Commissions', icon: <ShieldCheck size={14} /> },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              subTab === t.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface border border-outline-variant/30'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* 1. VERIFIED FINANCIAL ANALYTICS */}
      {subTab === 'analytics' && (
        <div className="space-y-6">
          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
            <span>
              <strong>Verified Accounting Policy:</strong> All revenue figures below are aggregated solely from confirmed, settled invoices in the database. Uncollected invoices are isolated separately and never counted as revenue received.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30">
              <div className="text-[11px] uppercase font-bold text-on-surface-variant">Monthly Recurring Revenue (MRR)</div>
              <div className="text-2xl font-black text-on-surface font-mono mt-1">{formatMoneyDisplay(analytics.mrrNgn, 'NGN')}</div>
              <div className="text-xs text-emerald-400 mt-1">ARR: {formatMoneyDisplay(analytics.arrNgn, 'NGN')}</div>
            </div>
            <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30">
              <div className="text-[11px] uppercase font-bold text-on-surface-variant">Verified Collected Revenue</div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatMoneyDisplay(analytics.verifiedCollectedRevenueNgn, 'NGN')}</div>
              <div className="text-xs text-on-surface-variant mt-1">ARPA: {formatMoneyDisplay(analytics.arpaNgn, 'NGN')}</div>
            </div>
            <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30">
              <div className="text-[11px] uppercase font-bold text-on-surface-variant">Subscriptions &amp; Churn</div>
              <div className="text-2xl font-black text-on-surface font-mono mt-1">{analytics.activePaidSubscriptions} Active</div>
              <div className="text-xs text-on-surface-variant mt-1">
                {analytics.trialAccountsCount} Trials · {analytics.graceOrPastDueCount} Grace · {analytics.churnRatePercent}% Churn
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30">
              <div className="text-[11px] uppercase font-bold text-on-surface-variant">Outstanding &amp; Risk</div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">{formatMoneyDisplay(analytics.outstandingInvoicesNgn, 'NGN')}</div>
              <div className="text-xs text-on-surface-variant mt-1">
                {analytics.outstandingInvoicesCount} Unpaid · {analytics.failedPaymentAttemptsCount} Failed Attempts · Refunds: {formatMoneyDisplay(analytics.refundedInvoicesNgn, 'NGN')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2 text-xs">
              <h4 className="font-bold text-on-surface uppercase tracking-wider">Revenue by Stream (Collected)</h4>
              <div className="flex justify-between py-1.5 border-b border-outline-variant/20"><span>SaaS Subscriptions</span><strong className="font-mono">{formatMoneyDisplay(analytics.subscriptionRevenueNgn, 'NGN')}</strong></div>
              <div className="flex justify-between py-1.5 border-b border-outline-variant/20"><span>Growth Services</span><strong className="font-mono">{formatMoneyDisplay(analytics.serviceRevenueNgn, 'NGN')}</strong></div>
              <div className="flex justify-between py-1.5 border-b border-outline-variant/20"><span>Lead Recovery Campaigns</span><strong className="font-mono">{formatMoneyDisplay(analytics.leadRecoveryRevenueNgn, 'NGN')}</strong></div>
              <div className="flex justify-between py-1.5"><span>Sales Commissions (Paid / Payable)</span><strong className="font-mono">{formatMoneyDisplay(analytics.commissionPaidNgn, 'NGN')} / {formatMoneyDisplay(analytics.commissionPayableNgn, 'NGN')}</strong></div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2 text-xs">
              <h4 className="font-bold text-on-surface uppercase tracking-wider">Active Workspaces by Plan</h4>
              {Object.entries(analytics.revenueByPlan || {}).map(([plan, info]) => (
                <div key={plan} className="flex justify-between py-1.5 border-b border-outline-variant/20 last:border-0">
                  <span>{plan} ({info.count} orgs)</span>
                  <strong className="font-mono">{formatMoneyDisplay(info.revenueNgn, 'NGN')}</strong>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2 text-xs">
              <h4 className="font-bold text-on-surface uppercase tracking-wider">Subscriptions by Market Region</h4>
              {Object.entries(analytics.revenueByCountry || {}).map(([region, info]) => (
                <div key={region} className="flex justify-between py-1.5 border-b border-outline-variant/20 last:border-0">
                  <span>{region} ({info.count} orgs)</span>
                  <strong className="font-mono">{formatMoneyDisplay(info.revenueNgn, 'NGN')}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PRICING & POLICY MANAGEMENT */}
      {subTab === 'pricing' && data && (
        <div className="space-y-6">
          {/* Trial & Grace Policy */}
          <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-4">
            <h3 className="font-bold text-sm text-on-surface">Global Trial &amp; Grace Period Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-xs text-on-surface-variant block mb-1">Free Trial Duration (Days)</label>
                <input
                  type="number"
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="text-xs text-on-surface-variant block mb-1">Failed Payment Grace Period (Days)</label>
                <input
                  type="number"
                  value={graceDays}
                  onChange={(e) => setGraceDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface"
                />
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  callAdminAction(
                    { action: 'UPDATE_BILLING_POLICY', defaultTrialDays: trialDays, defaultGracePeriodDays: graceDays },
                    'Updated platform trial & grace period policy.'
                  )
                }
                className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold"
              >
                Save Policy
              </button>
            </div>
          </div>

          {/* Plans & Regional Prices */}
          {(data.plans || []).map((plan: any) => (
            <div key={plan.id} className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-on-surface">{plan.name} ({plan.code})</h3>
                  <p className="text-xs text-on-surface-variant">{plan.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    callAdminAction(
                      { action: 'TOGGLE_PLAN', planId: plan.id, isActive: !plan.isActive },
                      `${plan.name} plan ${!plan.isActive ? 'enabled' : 'disabled'}.`
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    plan.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {plan.isActive ? 'Active (Click to Disable)' : 'Disabled (Click to Enable)'}
                </button>
              </div>

              {!plan.isCustomQuote && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-outline-variant/30 text-on-surface-variant">
                      <tr>
                        <th className="py-2">Market / Currency</th>
                        <th className="py-2">Monthly Price</th>
                        <th className="py-2">Annual Price</th>
                        <th className="py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {(plan.regionalPrices || []).map((rp: any) => {
                        const edit = priceEdits[rp.id] || { monthly: String(rp.monthlyPrice), annual: String(rp.annualPrice) };
                        return (
                          <tr key={rp.id}>
                            <td className="py-2 font-mono font-bold">{rp.marketRegion} · {rp.currency}</td>
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                value={edit.monthly}
                                onChange={(e) =>
                                  setPriceEdits((prev) => ({
                                    ...prev,
                                    [rp.id]: { ...edit, monthly: e.target.value },
                                  }))
                                }
                                className="w-28 px-2 py-1 rounded bg-surface-container-low border border-outline-variant/40 text-xs font-mono"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                value={edit.annual}
                                onChange={(e) =>
                                  setPriceEdits((prev) => ({
                                    ...prev,
                                    [rp.id]: { ...edit, annual: e.target.value },
                                  }))
                                }
                                className="w-28 px-2 py-1 rounded bg-surface-container-low border border-outline-variant/40 text-xs font-mono"
                              />
                            </td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  callAdminAction(
                                    {
                                      action: 'UPSERT_REGIONAL_PRICE',
                                      planId: plan.id,
                                      marketRegion: rp.marketRegion,
                                      currency: rp.currency,
                                      monthlyPrice: edit.monthly,
                                      annualPrice: edit.annual,
                                    },
                                    `Updated ${plan.code} ${rp.marketRegion}/${rp.currency} pricing.`
                                  )
                                }
                                className="px-3 py-1 rounded bg-primary text-on-primary font-bold text-[11px]"
                              >
                                Save Price
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. PROMOTIONAL CODES */}
      {subTab === 'promos' && data && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-4">
            <h3 className="font-bold text-sm text-on-surface">Create Promotional Code</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="CODE20"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono"
              />
              <select
                value={promoType}
                onChange={(e) => setPromoType(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
              <input
                type="number"
                placeholder="Value"
                value={promoValue}
                onChange={(e) => setPromoValue(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono"
              />
              <select
                value={promoCurrency}
                onChange={(e) => setPromoCurrency(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs"
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
              </select>
              <button
                type="button"
                disabled={busy || !promoCode.trim()}
                onClick={() =>
                  callAdminAction(
                    {
                      action: 'CREATE_PROMO',
                      code: promoCode,
                      discountType: promoType,
                      discountValue: promoValue,
                      currency: promoType === 'FIXED' ? promoCurrency : null,
                    },
                    `Promotional code ${promoCode} created.`
                  )
                }
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold inline-flex items-center justify-center gap-1"
              >
                <Plus size={14} />
                <span>Create Code</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-outline-variant/30 text-on-surface-variant">
                <tr>
                  <th className="py-2">Code</th>
                  <th className="py-2">Discount</th>
                  <th className="py-2">Redemptions</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {(data.promos || []).map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-2.5 font-mono font-bold">{p.code}</td>
                    <td className="py-2.5">{p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : formatMoneyDisplay(p.discountValue, p.currency || 'NGN')}</td>
                    <td className="py-2.5 font-mono">{p.redemptionsCount} {p.maxRedemptions ? `/ ${p.maxRedemptions}` : ''}</td>
                    <td className="py-2.5">{p.isActive ? 'ACTIVE' : 'INACTIVE'}</td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => callAdminAction({ action: 'TOGGLE_PROMO', promoId: p.id, isActive: !p.isActive }, `Promo ${p.code} updated.`)}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        {p.isActive ? 'Disable' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SUBSCRIPTIONS & ENTERPRISE CUSTOM ENTITLEMENTS */}
      {subTab === 'subscriptions' && data && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-4">
            <h3 className="font-bold text-sm text-on-surface">Manual Subscription Adjustment &amp; Enterprise Entitlement Override</h3>
            <p className="text-xs text-on-surface-variant">Every adjustment records an immutable event in SubscriptionEvent and AuditLog.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={adjustOrgId}
                onChange={(e) => setAdjustOrgId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs"
              >
                <option value="">Select Workspace...</option>
                {(data.subscriptions || []).map((s: any) => (
                  <option key={s.organizationId} value={s.organizationId}>
                    {s.organization?.name} ({s.plan} · {s.status})
                  </option>
                ))}
              </select>
              <select
                value={adjustPlan}
                onChange={(e) => setAdjustPlan(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs"
              >
                <option value="STARTER">STARTER</option>
                <option value="GROWTH">GROWTH</option>
                <option value="SCALE">SCALE</option>
                <option value="ENTERPRISE">ENTERPRISE (Custom)</option>
              </select>
              <select
                value={adjustStatus}
                onChange={(e) => setAdjustStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="TRIALING">TRIALING</option>
                <option value="GRACE_PERIOD">GRACE_PERIOD</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
              <input
                type="number"
                placeholder="Custom Max Active Leads"
                value={adjustLeads}
                onChange={(e) => setAdjustLeads(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs"
              />
              <input
                type="number"
                placeholder="Custom Max Team Seats"
                value={adjustSeats}
                onChange={(e) => setAdjustSeats(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs"
              />
              <input
                type="text"
                placeholder="Mandatory audit reason (e.g. Enterprise SLA approved)"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs"
              />
            </div>
            <button
              type="button"
              disabled={busy || !adjustOrgId || !adjustReason.trim()}
              onClick={() =>
                callAdminAction(
                  {
                    action: 'ADJUST_SUBSCRIPTION',
                    organizationId: adjustOrgId,
                    toPlan: adjustPlan,
                    toStatus: adjustStatus,
                    reason: adjustReason,
                    customEntitlements:
                      adjustPlan === 'ENTERPRISE'
                        ? { maxActiveLeads: Number(adjustLeads), maxTeamMembers: Number(adjustSeats), featureFlags: { customIntegrations: true, dedicatedOnboarding: true, prioritySupport: true } }
                        : undefined,
                  },
                  'Subscription updated and logged in audit trail.'
                )
              }
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-50"
            >
              Apply Audited Override
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-outline-variant/30 text-on-surface-variant">
                <tr>
                  <th className="py-2">Workspace</th>
                  <th className="py-2">Plan &amp; Interval</th>
                  <th className="py-2">Region</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Paid Through / Trial End</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {(data.subscriptions || []).map((s: any) => (
                  <tr key={s.id}>
                    <td className="py-2.5 font-bold">{s.organization?.name}</td>
                    <td className="py-2.5 font-mono">{s.plan} ({s.billingInterval})</td>
                    <td className="py-2.5 font-mono">{s.marketRegion} · {s.currency}</td>
                    <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-white/10 font-bold">{s.status}</span></td>
                    <td className="py-2.5 font-mono">{s.paidThroughDate ? new Date(s.paidThroughDate).toLocaleDateString() : new Date(s.trialEndsAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. COMMISSION AGREEMENTS & PAYOUTS */}
      {subTab === 'commissions' && data && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3">
            <h3 className="font-bold text-sm text-on-surface">Sales Commission Reference Tiers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {(data.commissionTiers || []).map((t: any) => (
                <div key={t.id} className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
                  <div className="font-bold text-on-surface">{t.displayName}</div>
                  <div className="text-lg font-black text-primary font-mono">{t.minCommissionPercent}% – {t.maxCommissionPercent}%</div>
                  {t.defaultRetainerNgn && <div className="text-[11px] text-emerald-400">+ Retainer from {formatMoneyDisplay(t.defaultRetainerNgn, 'NGN')}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 overflow-x-auto space-y-3">
            <h3 className="font-bold text-sm text-on-surface">Sales Commission Ledger (Verified Collections Only)</h3>
            {(data.commissions || []).length === 0 ? (
              <p className="text-xs text-on-surface-variant italic">No sales commission records accrued yet.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-outline-variant/30 text-on-surface-variant">
                  <tr>
                    <th className="py-2">Workspace</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Verified Payment</th>
                    <th className="py-2">Rate / Commission</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {(data.commissions || []).map((c: any) => (
                    <tr key={c.id}>
                      <td className="py-2.5 font-bold">{c.organization?.name}</td>
                      <td className="py-2.5">{c.commissionType}</td>
                      <td className="py-2.5 font-mono">{formatMoneyDisplay(c.verifiedPaymentAmount, c.currency)}</td>
                      <td className="py-2.5 font-mono font-bold">{c.commissionRatePercent}% &rarr; {formatMoneyDisplay(c.commissionAmount, c.currency)}</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-white/10 font-bold">{c.status}</span></td>
                      <td className="py-2.5 text-right space-x-2">
                        {c.status === 'QUALIFIED' && (
                          <button
                            type="button"
                            onClick={() => callAdminAction({ action: 'TRANSITION_COMMISSION', commissionId: c.id, nextStatus: 'PAYABLE' }, 'Commission approved and marked PAYABLE.')}
                            className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold"
                          >
                            Approve Payable
                          </button>
                        )}
                        {c.status === 'PAYABLE' && (
                          <button
                            type="button"
                            onClick={() => {
                              const ref = prompt('Enter Bank / Bachs Payout Reference:');
                              if (ref) callAdminAction({ action: 'TRANSITION_COMMISSION', commissionId: c.id, nextStatus: 'PAID', payoutReference: ref }, 'Commission marked PAID.');
                            }}
                            className="px-2.5 py-1 rounded bg-primary text-on-primary font-bold"
                          >
                            Disburse
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
