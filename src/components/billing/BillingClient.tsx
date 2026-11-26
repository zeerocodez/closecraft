'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Check,
  FileText,
  Sparkles,
  Download,
  X,
  Printer,
  Tag,
  Zap,
  RefreshCw,
  XCircle,
  Globe,
  Cpu,
  MessageSquare,
} from 'lucide-react';
import { formatMoneyDisplay } from '@/lib/billing/catalog';

interface BillingClientProps {
  subscription: any;
  plans: any[];
  creditPacks: any[];
  invoices: any[];
  events: any[];
  credits: any[];
  activeInvoice?: any | null;
  isOwnerOrAdmin: boolean;
}

const REGIONS = [
  { region: 'NG', currency: 'NGN', label: 'Nigeria (₦ NGN)' },
  { region: 'US', currency: 'USD', label: 'United States ($ USD)' },
  { region: 'GB', currency: 'GBP', label: 'United Kingdom (£ GBP)' },
  { region: 'CA', currency: 'CAD', label: 'Canada (CA$ CAD)' },
];

export default function BillingClient({
  subscription,
  plans,
  creditPacks,
  invoices,
  events,
  credits,
  activeInvoice,
  isOwnerOrAdmin,
}: BillingClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentQuery = searchParams?.get('payment') || searchParams?.get('status');

  const [billingInterval, setBillingInterval] = useState<'MONTHLY' | 'ANNUAL'>(
    subscription.billingInterval === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY'
  );
  const [selectedRegion, setSelectedRegion] = useState<string>(subscription.marketRegion || 'NG');
  const [selectedCurrency, setSelectedCurrency] = useState<string>(subscription.currency || 'NGN');

  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<any | null>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);

  const [creditConsent, setCreditConsent] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const usageSummary = subscription.usageSummary;
  const ent = usageSummary?.entitlements || {};
  const usage = usageSummary?.usage || {};
  const activePlanCode = usageSummary?.planCode || subscription.plan || 'STARTER';

  const handleRegionChange = (regionCode: string) => {
    const found = REGIONS.find((r) => r.region === regionCode) || REGIONS[0];
    setSelectedRegion(found.region);
    setSelectedCurrency(found.currency);
    setPromoStatus(null);
  };

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return;
    setIsCheckingPromo(true);
    setPromoStatus(null);
    try {
      const res = await fetch('/api/billing/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.trim(),
          planCode: 'GROWTH',
          currency: selectedCurrency,
          subtotalAmount: selectedCurrency === 'NGN' ? 35000 : 49,
        }),
      });
      const data = await res.json();
      setPromoStatus(data);
    } catch {
      setPromoStatus({ valid: false, reason: 'Failed to validate code' });
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const startBachsCheckout = async (payload: Record<string, any>, targetKey: string) => {
    setIsLoadingCheckout(true);
    setCheckoutTarget(targetKey);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout initialization failed');
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('Checkout URL not returned by Bachs.io');
      }
    } catch (err: any) {
      alert(err.message || 'Checkout error');
      setIsLoadingCheckout(false);
      setCheckoutTarget(null);
    }
  };

  const handleSubscriptionAction = async (action: 'CANCEL' | 'REACTIVATE') => {
    if (action === 'CANCEL' && !confirm('Schedule subscription cancellation at the end of your current paid period? All your workspace data will remain preserved.')) {
      return;
    }
    setActionBusy(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setFeedbackMsg(
        action === 'CANCEL'
          ? 'Cancellation scheduled. Your paid access remains active until period end and all data is preserved.'
          : 'Subscription reactivated!'
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setActionBusy(false);
    }
  };

  const renderProgressMeter = (label: string, used: number, limit: number, icon: React.ReactNode, bonusCredits: number = 0) => {
    const totalCap = limit + bonusCredits;
    const pct = totalCap > 0 ? Math.min(100, Math.round((used / totalCap) * 100)) : 0;
    const isNearLimit = pct >= 85;
    const isAtLimit = used >= totalCap;

    return (
      <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-white flex items-center gap-1.5">
            {icon}
            <span>{label}</span>
          </span>
          <span className="font-bold text-white font-mono">
            {used.toLocaleString()} / {limit.toLocaleString()}
            {bonusCredits > 0 && <span className="text-[#45bfae] text-[10px]"> (+{bonusCredits.toLocaleString()} credits)</span>}
          </span>
        </div>
        <div className="w-full bg-[#161a1d] rounded-full h-2 overflow-hidden border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isAtLimit ? 'bg-rose-500' : isNearLimit ? 'bg-amber-400' : 'bg-gradient-to-r from-[#248277] to-[#45bfae]'
            }`}
            style={{ width: `${Math.max(4, pct)}%` }}
          />
        </div>
        {isAtLimit && (
          <p className="text-[11px] text-rose-300">
            Limit reached: Existing records remain accessible, while creating new entries is paused until you upgrade or add credits.
          </p>
        )}
      </div>
    );
  };

  const getStatusBadge = () => {
    const st = subscription.status;
    if (st === 'ACTIVE' || st === 'PILOT_INCLUDED') {
      return (
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {st === 'PILOT_INCLUDED' ? 'Included with Managed Pilot' : subscription.cancelAtPeriodEnd ? 'Active (Cancels at Period End)' : 'Active Subscription'}
        </span>
      );
    }
    if (st === 'TRIALING') {
      return (
        <span className="text-xs px-3 py-1 rounded-full bg-[#248277]/20 text-[#45bfae] font-semibold border border-[#248277]/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#45bfae] animate-pulse" />
          7-Day Free Trial ({subscription.trialDaysLeft} days left)
        </span>
      );
    }
    if (st === 'GRACE_PERIOD' || st === 'GRACE' || st === 'PAST_DUE') {
      return (
        <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          {st === 'PAST_DUE' ? 'Past Due' : `Grace Period (${subscription.gracePeriodDays || 5}-Day Window)`}
        </span>
      );
    }
    return (
      <span className="text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        {st}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-2.5 py-1 rounded-full border border-[#248277]/20 mb-2">
            <CreditCard size={13} />
            <span>Commercial Operations &amp; Bachs.io Checkout</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
            Billing, Usage &amp; Subscription
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Manage your Revenue Engine plan, monitor real-time capacity usage, and download verified financial receipts.
          </p>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)}><X size={14} /></button>
        </div>
      )}

      {/* Payment Return Query Banners */}
      {paymentQuery === 'pending' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <Clock size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-semibold text-amber-300 text-sm">Payment Verification in Progress</h3>
            <p className="text-gray-300">Paid entitlements activate immediately once Bachs.io webhook verification confirms settlement.</p>
          </div>
        </div>
      )}

      {(subscription.status === 'GRACE_PERIOD' || subscription.status === 'GRACE' || subscription.status === 'PAST_DUE') && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={22} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h3 className="font-bold text-amber-300 text-sm">Action Required: {subscription.gracePeriodDays || 5}-Day Grace Period Active</h3>
              <p className="text-gray-300">
                Your latest renewal is past due. All existing customer data is safely preserved until{' '}
                <strong className="text-white">{subscription.gracePeriodEndsAt ? new Date(subscription.gracePeriodEndsAt).toLocaleDateString() : 'period expiry'}</strong>. Complete payment via Bachs.io to prevent service suspension.
              </p>
            </div>
          </div>
          {isOwnerOrAdmin && activeInvoice && (
            <button
              type="button"
              onClick={() => startBachsCheckout({ invoiceId: activeInvoice.id }, 'grace_resolve')}
              className="px-5 py-2.5 rounded-xl bg-amber-400 text-[#0f1214] font-bold text-xs shrink-0"
            >
              Resolve Payment Now
            </button>
          )}
        </div>
      )}

      {subscription.status === 'TRIALING' && (
        <div className="p-5 rounded-2xl bg-[#121c1a] border border-[#248277]/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={22} className="text-[#45bfae] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h3 className="font-serif font-bold text-white text-sm">7-Day Free Trial Active (No Credit Card Required)</h3>
              <p className="text-gray-300">
                Your free trial ends on <strong className="text-white">{new Date(subscription.trialEndsAt).toLocaleString()}</strong>. You will never be charged automatically at trial expiry.
              </p>
            </div>
          </div>
          <a href="#available-plans" className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] shrink-0">
            Choose a Paid Plan
          </a>
        </div>
      )}

      {(subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED' || subscription.status === 'SUSPENDED') && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={22} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h3 className="font-bold text-rose-300 text-sm">Subscription {subscription.status}</h3>
              <p className="text-gray-300">All existing leads, conversations, and reports remain preserved. Select a plan below to restore full operational access.</p>
            </div>
          </div>
          {isOwnerOrAdmin && subscription.paidThroughDate && new Date(subscription.paidThroughDate) > new Date() && (
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => handleSubscriptionAction('REACTIVATE')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#45bfae] text-[#0f1214] shrink-0 inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Reactivate Subscription</span>
            </button>
          )}
        </div>
      )}

      {/* Current Subscription Summary & Real-Time Usage Metering */}
      <div className="p-6 rounded-2xl bg-[#0f1214] border border-white/5 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#45bfae]">Current Workspace Plan</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#248277] text-white font-bold">
                {activePlanCode}
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-white mt-1">
              CloseCraft HQ {usageSummary?.planName || activePlanCode} ({subscription.billingInterval || 'MONTHLY'})
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Next Billing / Renewal Date:{' '}
              <strong className="text-white font-mono">
                {subscription.paidThroughDate
                  ? new Date(subscription.paidThroughDate).toLocaleDateString()
                  : new Date(subscription.trialEndsAt).toLocaleDateString() + ' (Trial End)'}
              </strong>
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {formatMoneyDisplay(subscription.pricePerMonth || 15000, subscription.currency || 'NGN')}
              <span className="text-xs text-gray-400 font-normal"> / month</span>
            </span>
            {isOwnerOrAdmin && subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => handleSubscriptionAction('CANCEL')}
                className="text-[11px] text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <XCircle size={12} />
                <span>Cancel at Period End</span>
              </button>
            )}
            {isOwnerOrAdmin && subscription.cancelAtPeriodEnd && (
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => handleSubscriptionAction('REACTIVATE')}
                className="text-[11px] text-[#45bfae] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Undo Cancellation (Reactivate)</span>
              </button>
            )}
          </div>
        </div>

        {/* Non-aggressive Upgrade Recommendation */}
        {usageSummary?.upgradeRecommendation?.needed && (
          <div className="p-4 rounded-xl bg-[#248277]/15 border border-[#45bfae]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Zap size={16} className="text-[#C7F36B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Capacity Notice: </span>
                <span className="text-gray-300">{usageSummary.upgradeRecommendation.reason}</span>
              </div>
            </div>
            <a href="#available-plans" className="px-3.5 py-1.5 rounded-lg bg-[#C7F36B] text-[#111827] font-bold shrink-0">
              View {usageSummary.upgradeRecommendation.recommendedPlanName} Plan
            </a>
          </div>
        )}

        {/* Usage Meters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderProgressMeter(
            'Active Leads',
            usage.activeLeads || 0,
            ent.maxActiveLeads || 500,
            <Sparkles size={14} className="text-[#45bfae]" />,
            usageSummary?.credits?.leads || 0
          )}
          {renderProgressMeter(
            'Team Seats',
            usage.teamMembers || 1,
            ent.maxTeamMembers || 2,
            <Users size={14} className="text-[#45bfae]" />
          )}
          {renderProgressMeter(
            `AI Operations (${usageSummary?.periodKey || 'Current Period'})`,
            usage.aiQualifications || 0,
            ent.maxAiQualificationsPerMonth || 200,
            <Cpu size={14} className="text-[#C7F36B]" />,
            usageSummary?.credits?.aiOps || 0
          )}
          {renderProgressMeter(
            'Automated Follow-Ups',
            usage.automatedFollowUps || 0,
            ent.maxAutomatedFollowUpsPerMonth || 500,
            <MessageSquare size={14} className="text-blue-400]" />,
            usageSummary?.credits?.followUps || 0
          )}
        </div>
      </div>

      {/* Plans & Regional Pricing Switcher */}
      <div className="space-y-6" id="available-plans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-white">Revenue Engine Subscription Plans</h2>
            <p className="text-xs text-gray-400">
              Pricing scales by workspace capacity, not individual per-seat taxes. Verified checkout via Bachs.io.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Market/Currency Selector */}
            <div className="inline-flex items-center gap-2 bg-[#0f1214] border border-white/10 rounded-xl px-3 py-1.5">
              <Globe size={14} className="text-[#45bfae]" />
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
                aria-label="Select regional currency"
              >
                {REGIONS.map((r) => (
                  <option key={r.region} value={r.region} className="bg-[#0f1214] text-white">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center bg-[#0f1214] border border-white/10 rounded-xl p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setBillingInterval('MONTHLY')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  billingInterval === 'MONTHLY' ? 'bg-[#248277] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval('ANNUAL')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  billingInterval === 'ANNUAL' ? 'bg-[#248277] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C7F36B] text-[#111827] font-black">2 Months Free</span>
              </button>
            </div>
          </div>
        </div>

        {/* Promo Code Input */}
        <div className="p-4 rounded-xl bg-[#0f1214] border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-300 shrink-0">
            <Tag size={14} className="text-[#45bfae]" />
            <span>Promotional Code:</span>
          </div>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code (optional)"
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#45bfae]"
          />
          <button
            type="button"
            disabled={isCheckingPromo || !promoCode.trim()}
            onClick={handleValidatePromo}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-white disabled:opacity-50"
          >
            {isCheckingPromo ? 'Checking...' : 'Apply Code'}
          </button>
          {promoStatus && (
            <span className={`text-xs font-semibold ${promoStatus.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
              {promoStatus.valid ? `Code applied: ${promoStatus.discountType === 'PERCENTAGE' ? `${promoStatus.discountValue}% off` : formatMoneyDisplay(promoStatus.discountAmount, selectedCurrency) + ' off'}` : promoStatus.reason}
            </span>
          )}
        </div>

        {/* 4 Subscription Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => {
            const rp =
              plan.regionalPrices?.find((r: any) => r.marketRegion === selectedRegion) ||
              plan.regionalPrices?.find((r: any) => r.currency === selectedCurrency) ||
              plan.regionalPrices?.[0];

            const displayAmount = rp
              ? billingInterval === 'ANNUAL'
                ? rp.annualPrice
                : rp.monthlyPrice
              : 0;
            const monthlyEquivalent = rp ? Math.round(rp.annualPrice / 12) : 0;
            const isCurrent = activePlanCode === plan.code;

            return (
              <div
                key={plan.code}
                className={`p-5 rounded-2xl flex flex-col justify-between border relative transition-all ${
                  plan.isRecommended
                    ? 'bg-[#121c1a] border-[#248277] shadow-xl'
                    : isCurrent
                    ? 'bg-[#0f1615] border-[#45bfae]/50'
                    : 'bg-[#0f1214] border-white/5'
                }`}
              >
                {plan.isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C7F36B] text-[#111827] text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                    Recommended Plan
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-lg text-white">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#248277]/30 text-[#45bfae] font-bold">CURRENT</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{plan.tagline}</p>

                  {plan.isCustomQuote ? (
                    <div className="py-2">
                      <span className="text-2xl font-extrabold text-white">Custom Quote</span>
                      <span className="text-[11px] text-gray-400 block mt-1">Configurable by Superadmin</span>
                    </div>
                  ) : (
                    <div className="py-2">
                      <span className="text-3xl font-extrabold text-white font-mono">
                        {formatMoneyDisplay(displayAmount, rp?.currency || selectedCurrency)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {billingInterval === 'ANNUAL' ? ' / year' : ' / month'}
                      </span>
                      {billingInterval === 'ANNUAL' && rp && (
                        <div className="text-[11px] text-[#45bfae] mt-1 font-semibold">
                          ~{formatMoneyDisplay(monthlyEquivalent, rp.currency)}/mo · {rp.annualSavingsLabel}
                        </div>
                      )}
                    </div>
                  )}

                  <ul className="space-y-2 text-xs text-gray-300">
                    {(plan.featuresList || []).map((feat: string) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check size={14} className="text-[#45bfae] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-5 border-t border-white/5">
                  {plan.isCustomQuote ? (
                    <a
                      href="mailto:sales@closecrafthq.com?subject=Enterprise%20Quotation%20Request"
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white text-center block"
                    >
                      Talk to Sales
                    </a>
                  ) : isOwnerOrAdmin ? (
                    <button
                      type="button"
                      disabled={isLoadingCheckout}
                      onClick={() =>
                        startBachsCheckout(
                          {
                            planCode: plan.code,
                            billingInterval,
                            marketRegion: selectedRegion,
                            currency: rp?.currency || selectedCurrency,
                            promoCode: promoStatus?.valid ? promoStatus.code : undefined,
                          },
                          plan.code
                        )
                      }
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        plan.isRecommended
                          ? 'bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827]'
                          : 'bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214]'
                      }`}
                    >
                      {isLoadingCheckout && checkoutTarget === plan.code
                        ? 'Opening Bachs.io...'
                        : isCurrent
                        ? `Renew ${plan.name}`
                        : `Choose ${plan.name}`}
                    </button>
                  ) : (
                    <p className="text-[11px] text-gray-500 text-center italic">Admin required for checkout</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prepaid Usage Credits (Explicit Opt-In Consent Required) */}
      <div className="p-6 rounded-2xl bg-[#0f1214] border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-base text-white">Optional Prepaid Usage Add-On Packs</h3>
            <p className="text-xs text-gray-400">
              We never charge automatic overage fees. Purchase prepaid capacity packs only if and when needed.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-200 bg-black/40 px-3 py-2 rounded-xl border border-white/10 cursor-pointer">
            <input
              type="checkbox"
              checked={creditConsent}
              onChange={(e) => setCreditConsent(e.target.checked)}
              className="accent-[#45bfae]"
            />
            <span>I consent to this one-time prepaid add-on purchase</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {creditPacks.map((pack) => {
            const price = selectedCurrency === 'USD' ? pack.priceUsd : pack.priceNgn;
            const curr = selectedCurrency === 'USD' ? 'USD' : 'NGN';
            return (
              <div key={pack.id} className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white">{pack.name}</h4>
                  <p className="text-lg font-extrabold text-[#45bfae] font-mono mt-1">
                    {formatMoneyDisplay(price, curr)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!isOwnerOrAdmin || !creditConsent || isLoadingCheckout}
                  onClick={() =>
                    startBachsCheckout(
                      { creditPackId: pack.id, currency: curr, consentConfirmed: creditConsent },
                      pack.id
                    )
                  }
                  className="w-full py-2 rounded-lg bg-white/10 hover:bg-[#45bfae] hover:text-[#0f1214] disabled:opacity-40 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Purchase Pack
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices & Receipts Table */}
      <div className="p-6 rounded-2xl bg-[#0f1214] border border-white/5 shadow-xl space-y-4">
        <h3 className="font-serif font-bold text-base text-white">Billing History, Invoices &amp; Receipts</h3>

        {invoices.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No invoices issued yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 text-gray-400">
                <tr>
                  <th className="py-2.5 pr-4 font-medium">Invoice / Receipt #</th>
                  <th className="py-2.5 pr-4 font-medium">Type</th>
                  <th className="py-2.5 pr-4 font-medium">Amount</th>
                  <th className="py-2.5 pr-4 font-medium">Status</th>
                  <th className="py-2.5 pr-4 font-medium">Date</th>
                  <th className="py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {invoices.map((inv) => {
                  const isPaid = ['CONFIRMED', 'FUNDS_AVAILABLE', 'PAID'].includes(inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 pr-4 font-mono font-medium text-white">
                        <div>{inv.invoiceNumber}</div>
                        {inv.receiptNumber && <div className="text-[10px] text-emerald-400">{inv.receiptNumber}</div>}
                      </td>
                      <td className="py-3 pr-4">{inv.type.replace(/_/g, ' ')}</td>
                      <td className="py-3 pr-4 font-mono font-bold text-white">
                        {formatMoneyDisplay(inv.amount, inv.currency)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isPaid
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-500 font-mono">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {['ISSUED', 'APPROVED'].includes(inv.status) && isOwnerOrAdmin && (
                          <button
                            type="button"
                            onClick={() => startBachsCheckout({ invoiceId: inv.id }, `inv_${inv.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-[#248277] text-white hover:bg-[#2e9c8f] font-bold text-xs"
                          >
                            Pay Now
                          </button>
                        )}
                        <a
                          href={`/api/billing/invoices/${inv.id}/document?format=html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#45bfae] font-bold text-xs inline-flex items-center gap-1"
                        >
                          <Download size={12} />
                          <span>{isPaid ? 'Receipt' : 'Invoice'}</span>
                        </a>
                        {isPaid && (
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(inv)}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 font-bold text-xs inline-flex items-center gap-1"
                          >
                            <FileText size={12} />
                            <span>View</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subscription Lifecycle Events Audit Trail */}
      {events && events.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#0f1214] border border-white/5 space-y-3">
          <h3 className="font-serif font-bold text-base text-white">Subscription Audit Timeline</h3>
          <div className="space-y-2 text-xs">
            {events.map((ev: any) => (
              <div key={ev.id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-[#45bfae]">{ev.eventType}</span>
                  {ev.fromStatus && ev.toStatus && (
                    <span className="text-gray-400 ml-2">({ev.fromStatus} &rarr; {ev.toStatus})</span>
                  )}
                  {ev.reason && <p className="text-gray-400 mt-0.5">{ev.reason}</p>}
                </div>
                <span className="text-[11px] font-mono text-gray-500">{new Date(ev.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f1214] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="font-serif font-bold text-white text-base">Official CloseCraft HQ Receipt</h3>
                <span className="text-[10px] text-gray-400 font-mono">
                  {selectedReceipt.receiptNumber || selectedReceipt.invoiceNumber}
                </span>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0d12] border border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Issuer:</span><strong className="text-white">CloseCraft HQ (Zeerocodes Automation Ltd)</strong></div>
              <div className="flex justify-between"><span className="text-gray-400">Gateway:</span><strong className="text-white">Bachs.io Hosted Checkout</strong></div>
              <div className="flex justify-between"><span className="text-gray-400">Invoice:</span><span className="font-mono text-white">{selectedReceipt.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Paid Date:</span><span className="font-mono text-white">{new Date(selectedReceipt.paidAt || selectedReceipt.createdAt).toLocaleString()}</span></div>
              <div className="flex justify-between pt-2 border-t border-white/5">
                <span className="font-bold text-white">Total Settled:</span>
                <span className="font-mono font-black text-emerald-400 text-base">
                  {formatMoneyDisplay(selectedReceipt.amount, selectedReceipt.currency)}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <a
                href={`/api/billing/invoices/${selectedReceipt.id}/document?format=html`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Download HTML Receipt</span>
              </a>
              <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-white/5 text-white text-xs font-bold inline-flex items-center gap-1.5">
                <Printer size={14} />
                <span>Print</span>
              </button>
              <button onClick={() => setSelectedReceipt(null)} className="px-4 py-2 rounded-xl bg-[#45bfae] text-[#0f1214] text-xs font-bold">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
