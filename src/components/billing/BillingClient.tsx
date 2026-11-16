'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  ArrowRight, 
  Download, 
  ExternalLink, 
  X, 
  Printer,
  Calendar,
  DollarSign
} from 'lucide-react';

interface SubscriptionData {
  status: 'TRIALING' | 'ACTIVE' | 'GRACE' | 'EXPIRED' | 'PILOT_INCLUDED';
  isOperational: boolean;
  plan: string;
  pricePerMonth: number;
  currency: string;
  billingMode: string;
  trialStartedAt?: Date | string | null;
  trialEndsAt?: Date | string | null;
  trialDaysLeft: number;
  trialHoursLeft?: number;
  paidThroughDate: Date | string | null;
  gracePeriodEndsAt: Date | string | null;
  activePilotEngagementId: string | null;
  maxInternalSeats: number;
  internalSeatsUsed: number;
  maxActiveLeads?: number;
  activeLeadsCount?: number;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: Date | string | null;
  bachsCheckoutUrl?: string | null;
  createdAt: Date | string;
  customerName?: string | null;
  customerEmail?: string | null;
}

interface BillingClientProps {
  subscription: SubscriptionData;
  invoices: InvoiceItem[];
  activeInvoice?: InvoiceItem | null;
  isOwnerOrAdmin: boolean;
}

export default function BillingClient({
  subscription,
  invoices,
  activeInvoice,
  isOwnerOrAdmin,
}: BillingClientProps) {
  const searchParams = useSearchParams();
  const paymentQuery = searchParams?.get('payment') || searchParams?.get('status');

  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<InvoiceItem | null>(null);

  const currentPlanId = subscription.plan?.toUpperCase() === 'PRO' ? 'PRO' : 'STARTER';
  const seatsUsed = subscription.internalSeatsUsed ?? 1;
  const maxSeats = subscription.maxInternalSeats ?? 3;
  const seatPercentage = Math.min(100, Math.round((seatsUsed / maxSeats) * 100));

  const formatTrialEnd = (dateVal?: Date | string | null) => {
    if (!dateVal) return 'in 7 days';
    try {
      const d = new Date(dateVal);
      return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return String(dateVal);
    }
  };

  const scrollToPlans = () => {
    const el = document.getElementById('available-plans');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCheckout = async (invoiceId?: string, targetLabel?: string) => {
    setIsLoadingCheckout(true);
    setCheckoutTarget(targetLabel || 'default');
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize Bachs checkout session');
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('Checkout URL not returned by server');
        setIsLoadingCheckout(false);
        setCheckoutTarget(null);
      }
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
      setIsLoadingCheckout(false);
      setCheckoutTarget(null);
    }
  };

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'PILOT_INCLUDED':
        return (
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Included with Managed Pilot
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Active Subscription
          </span>
        );
      case 'TRIALING':
        return (
          <span className="text-xs px-3 py-1 rounded-full bg-[#248277]/20 text-[#45bfae] font-semibold border border-[#248277]/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#45bfae] animate-pulse"></span>
            7-Day Free Trial ({subscription.trialDaysLeft} days left)
          </span>
        );
      case 'GRACE':
        return (
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Grace Period
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Trial Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-2.5 py-1 rounded-full border border-[#248277]/20 mb-2">
            <CreditCard size={13} />
            <span>Commercial Operations</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
            Billing & Subscriptions
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Manage your workspace subscription, 7-day Starter trial, and official Bachs.io payments.
          </p>
        </div>
        <div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Payment Pending Banner */}
      {paymentQuery === 'pending' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <Clock size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h3 className="font-semibold text-amber-300 text-sm">Payment Verification in Progress</h3>
            <p className="text-gray-300">
              We are confirming your payment. Your paid access will update after verification.
            </p>
          </div>
        </div>
      )}

      {/* Payment Failed Banner */}
      {paymentQuery === 'failed' && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h3 className="font-semibold text-rose-300 text-sm">Payment Unconfirmed</h3>
            <p className="text-gray-300">
              Your payment has not been confirmed. Check its status before trying again.
            </p>
          </div>
        </div>
      )}

      {/* Active Trial Notice Banner (Section 4.D approved copy) */}
      {subscription.status === 'TRIALING' && (
        <div className="p-5 rounded-2xl bg-[#121c1a] border border-[#248277]/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={22} className="text-[#45bfae] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h3 className="font-serif font-bold text-white text-sm">7-Day Free Trial Active</h3>
              <p className="text-gray-300">
                Your free trial ends on <strong className="text-white font-semibold">{formatTrialEnd(subscription.trialEndsAt)}</strong>. Choose a plan to keep your follow-up running.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={scrollToPlans}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] shrink-0 shadow-lg shadow-[#248277]/20 transition-all"
          >
            Choose a Plan
          </button>
        </div>
      )}

      {/* Expired Trial Notice Banner (Section 4.D approved copy) */}
      {subscription.status === 'EXPIRED' && (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h2 className="font-serif font-bold text-rose-300 text-base">Your free trial has ended.</h2>
              <p className="text-gray-300">
                Choose a plan to continue using paid features. You can still access your account and billing options.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={scrollToPlans}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] shrink-0 shadow-lg"
          >
            Choose a Plan
          </button>
        </div>
      )}

      {/* Featured Approved Invoice (One-Time NGN 20,000 Workspace Invoice) */}
      {activeInvoice && !['PAID', 'CONFIRMED', 'FUNDS_AVAILABLE'].includes(activeInvoice.status) && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121c1a] to-[#0f1214] border border-[#248277]/50 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">Approved Workspace Invoice</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  {activeInvoice.status}
                </span>
              </div>
              <h2 className="font-serif text-lg font-bold text-white">
                One-Time Workspace Access (30 Calendar Days)
              </h2>
              <p className="text-xs text-gray-400">
                Invoice <span className="font-mono text-white font-semibold">{activeInvoice.invoiceNumber}</span> · Single one-off settlement via Bachs Sandbox (Bank Transfer, Card, MoMo).
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-2xl font-black text-white font-mono">
                {activeInvoice.currency} {activeInvoice.amount.toLocaleString()}
              </span>
              <span className="text-[11px] text-gray-500 block">No recurring card auto-debit</span>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span>Includes 3 internal team seats, lead routing, and follow-up leakage alerts.</span>
            </p>

            {isOwnerOrAdmin ? (
              <button
                type="button"
                onClick={() => handleCheckout(activeInvoice.id, 'active_invoice')}
                disabled={isLoadingCheckout}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] disabled:opacity-50 transition-all shadow-lg shadow-[#248277]/20 flex items-center justify-center gap-2"
              >
                {isLoadingCheckout && checkoutTarget === 'active_invoice' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0f1214] border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Bachs...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={15} />
                    <span>Pay with Bachs (₦{activeInvoice.amount.toLocaleString()})</span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-xs text-gray-500 italic">Only organization admins can initiate payment</span>
            )}
          </div>
        </div>
      )}

      {/* Current Subscription Status & Seat Usage */}
      <div className="p-6 rounded-2xl bg-[#0f1214] border border-white/5 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#45bfae]">Current Workspace Tier</span>
              <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                currentPlanId === 'PRO' ? 'bg-[#248277] text-white' : 'bg-white/10 text-white'
              }`}>
                {currentPlanId === 'PRO' ? 'PRO PLAN' : 'STARTER PLAN'}
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-white mt-1">
              Closecraft {currentPlanId === 'PRO' ? 'Pro Workspace (10 Seats)' : 'Starter Workspace (3 Seats)'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {currentPlanId === 'PRO'
                ? 'High-velocity sales workflow with 10 internal team seats, round-robin auto-routing, and call review queues.'
                : 'Core sales operations with 3 internal team seats, lead management, and follow-up leakage alerts.'}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-2xl font-bold text-white font-mono">
              {subscription.currency} {subscription.pricePerMonth?.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 block">/ month (Manual calendar-month renewal)</span>
          </div>
        </div>

        {/* Seat Usage Progress Bar */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-white flex items-center gap-1.5">
              <Users size={14} className="text-[#45bfae]" />
              Internal Team Seats Utilization
            </span>
            <span className="font-bold text-white font-mono">
              {seatsUsed} of {maxSeats} seats assigned ({maxSeats - seatsUsed} available)
            </span>
          </div>
          <div className="w-full bg-[#161a1d] rounded-full h-2 overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                seatsUsed >= maxSeats ? 'bg-amber-400' : 'bg-gradient-to-r from-[#248277] to-[#45bfae]'
              }`}
              style={{ width: `${Math.max(5, seatPercentage)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>
              * External remote sales professionals on managed pilots <strong className="text-white font-semibold">never</strong> count against your seat limit.
            </span>
            {seatsUsed >= maxSeats && (
              <span className="text-amber-400 font-semibold">Seat limit reached. Upgrade to Pro for 10 seats.</span>
            )}
          </div>
        </div>

        {/* Billing Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/5 text-xs">
          <div>
            <span className="text-gray-500">Billing Mode:</span>
            <p className="font-semibold text-white mt-0.5">Monthly, renew manually</p>
            <p className="text-[11px] text-gray-500">One-time payment per calendar month</p>
          </div>

          <div>
            <span className="text-gray-500">Paid Through Date:</span>
            <p className="font-semibold text-white mt-0.5 font-mono">
              {subscription.paidThroughDate ? new Date(subscription.paidThroughDate).toLocaleDateString() : 'Active under Trial'}
            </p>
            {subscription.status === 'ACTIVE' && (
              <p className="text-[11px] text-emerald-400">Early renewal extends this date by 30 days</p>
            )}
          </div>

          <div>
            <span className="text-gray-500">Payment Provider:</span>
            <p className="font-semibold text-white mt-0.5">Bachs Hosted Checkout (Sandbox)</p>
            <p className="text-[11px] text-gray-500">NGN Bank Transfer, Debit Card, MoMo</p>
          </div>
        </div>
      </div>

      {/* Available Plans Selection */}
      <div className="space-y-4" id="available-plans">
        <div>
          <h2 className="font-serif text-lg font-bold text-white">Available Workspace Plans</h2>
          <p className="text-xs text-gray-400">
            Select your monthly capacity. Renewal is manual via Bachs.io without hidden subscription locks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* STARTER PLAN */}
          <div className={`p-6 rounded-2xl flex flex-col justify-between border transition-all ${
            currentPlanId === 'STARTER'
              ? 'bg-[#121c1a] border-[#248277]/60 shadow-xl'
              : 'bg-[#0f1214] border-white/5 hover:border-white/10'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Starter Plan</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Lean teams, 3 internal seats & up to 1,000 active leads/month</p>
                </div>
                {currentPlanId === 'STARTER' && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-bold border border-[#248277]/30">
                    CURRENT PLAN
                  </span>
                )}
              </div>

              <div className="py-2">
                <span className="text-3xl font-extrabold text-white font-mono">₦20,000</span>
                <span className="text-xs text-gray-400"> / month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-start gap-2 text-white">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span><strong>3 Internal Team Seats</strong> included</span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span><strong>Up to 1,000 active leads/month</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>7-day free trial (no card required)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>Lead management inbox & manual assignments</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>SLA follow-up tracking & revenue leakage radar</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>Instant Bachs.io NGN checkout (bank transfer, cards)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>Attach remote sales pilots anytime without extra software fees</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-white/5">
              {isOwnerOrAdmin ? (
                <button
                  type="button"
                  onClick={() => handleCheckout(undefined, 'STARTER')}
                  disabled={isLoadingCheckout}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                    currentPlanId === 'STARTER'
                      ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                      : 'bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3]'
                  }`}
                >
                  {isLoadingCheckout && checkoutTarget === 'STARTER'
                    ? 'Connecting to Bachs...'
                    : currentPlanId === 'STARTER'
                    ? 'Renew Starter (₦20,000 / month)'
                    : 'Switch to Starter (₦20,000 / month)'}
                </button>
              ) : (
                <p className="text-[11px] text-gray-500 italic text-center">Only organization admins can renew</p>
              )}
            </div>
          </div>

          {/* PRO PLAN */}
          <div className={`p-6 rounded-2xl flex flex-col justify-between border relative transition-all ${
            currentPlanId === 'PRO'
              ? 'bg-[#121c1a] border-[#248277]/60 shadow-xl'
              : 'bg-[#121c1a] border-[#248277]/40 hover:border-[#45bfae]/60 shadow-lg'
          }`}>
            <div className="absolute -top-3 right-6 bg-[#248277] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
              Recommended for Teams
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Pro Plan</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Expanded capacity for active sales operations</p>
                </div>
                {currentPlanId === 'PRO' && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-bold border border-[#248277]/30">
                    CURRENT PLAN
                  </span>
                )}
              </div>

              <div className="py-2">
                <span className="text-3xl font-extrabold text-white font-mono">₦45,000</span>
                <span className="text-xs text-gray-400"> / month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-start gap-2 text-white">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span><strong className="text-[#45bfae]">10 Internal Team Seats</strong> included (7 extra seats)</span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span><strong>Round-Robin Automated Lead Distribution</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>Manager call coaching & QA review queues</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>Priority WhatsApp & email notification dispatch</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>Executive revenue health & pipeline leakage dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>Priority pilot matching with top remote sales professionals</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-white/5">
              {isOwnerOrAdmin ? (
                <button
                  type="button"
                  onClick={() => handleCheckout(undefined, 'PRO')}
                  disabled={isLoadingCheckout}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] disabled:opacity-50 transition-all shadow-md active:scale-95"
                >
                  {isLoadingCheckout && checkoutTarget === 'PRO'
                    ? 'Connecting to Bachs...'
                    : currentPlanId === 'PRO'
                    ? 'Renew Pro (₦45,000 / month)'
                    : 'Upgrade to Pro (₦45,000 / month)'}
                </button>
              ) : (
                <p className="text-[11px] text-gray-500 italic text-center">Only organization admins can upgrade</p>
              )}
            </div>
          </div>

          {/* ENTERPRISE & MANAGED SALES TIERS */}
          <div className="p-6 rounded-2xl flex flex-col justify-between border bg-[#0f1214] border-white/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Enterprise</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Larger teams needing custom integrations & expanded capacity</p>
                </div>
              </div>

              <div className="py-2">
                <span className="text-3xl font-extrabold text-white font-mono">₦75,000</span>
                <span className="text-xs text-gray-400"> / month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>Custom team seat allocations & enterprise RLS</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>Custom CRM & ERP integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>Dedicated account manager & SLA guarantee</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-white/5">
              <a
                href="mailto:sales@closecrafthq.com?subject=Enterprise%20Inquiry"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-center block"
              >
                Discuss Enterprise
              </a>
            </div>
          </div>

          <div className="p-6 rounded-2xl flex flex-col justify-between border bg-[#0f1214] border-white/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Managed Sales Engagement</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Remote sales support around an approved offer</p>
                </div>
              </div>

              <div className="py-2">
                <span className="text-3xl font-extrabold text-white font-mono">From ₦150,000</span>
                <span className="text-xs text-gray-400"> for 30 days</span>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>Workspace access included in agreed scope</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>Remote sales professionals handling closing conversations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <span>Lead flow and offer economics review</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-white/5">
              <a
                href="mailto:sales@closecrafthq.com?subject=Managed%20Sales%20Proposal"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-center block"
              >
                Request a Managed Sales Proposal
              </a>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-500 text-center pt-2">
          The software trial includes Starter features. Managed sales support and DSS training are separate paid offers. No automatic charge at trial expiry.
        </p>
      </div>

      {/* Managed Pilot Notice */}
      {subscription.status === 'PILOT_INCLUDED' && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-emerald-300">Software Access Included with Pilot</strong>
            <p className="mt-0.5 text-gray-300">
              Your 30-day Follow-up Pilot includes full workspace access without standalone software charges. When the pilot concludes, you can transition smoothly to monthly renewal under either Starter (₦20,000) or Pro (₦45,000).
            </p>
          </div>
        </div>
      )}

      {/* Invoices History Table */}
      <div className="p-6 rounded-2xl bg-[#0f1214] border border-white/5 shadow-xl space-y-4">
        <h3 className="font-serif font-bold text-base text-white">Invoice & Transaction History</h3>

        {invoices.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No invoices issued yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 text-gray-400">
                <tr>
                  <th className="py-2.5 pr-4 font-medium">Invoice #</th>
                  <th className="py-2.5 pr-4 font-medium">Type</th>
                  <th className="py-2.5 pr-4 font-medium">Amount</th>
                  <th className="py-2.5 pr-4 font-medium">Status</th>
                  <th className="py-2.5 pr-4 font-medium">Date</th>
                  <th className="py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4 font-mono font-medium text-white">{inv.invoiceNumber}</td>
                    <td className="py-3 pr-4">{inv.type.replace(/_/g, ' ')}</td>
                    <td className="py-3 pr-4 font-mono font-bold text-white">{inv.currency} {inv.amount.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        ['CONFIRMED', 'FUNDS_AVAILABLE', 'PAID'].includes(inv.status)
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 font-mono">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      {['ISSUED', 'APPROVED'].includes(inv.status) && (
                        <button
                          type="button"
                          onClick={() => handleCheckout(inv.id, `inv_${inv.id}`)}
                          disabled={isLoadingCheckout}
                          className="px-3 py-1.5 rounded-lg bg-[#248277] text-white hover:bg-[#2e9c8f] font-bold text-xs disabled:opacity-50 transition-colors"
                        >
                          {isLoadingCheckout && checkoutTarget === `inv_${inv.id}` ? 'Connecting...' : 'Pay with Bachs'}
                        </button>
                      )}
                      {['CONFIRMED', 'FUNDS_AVAILABLE', 'PAID'].includes(inv.status) && (
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(inv)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 font-bold text-xs border border-white/5 transition-colors inline-flex items-center gap-1.5"
                        >
                          <FileText size={13} />
                          <span>View Receipt</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Verified Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f1214] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-base">Official Payment Receipt</h3>
                  <span className="text-[10px] text-gray-400 font-mono">{selectedReceipt.invoiceNumber}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Details Box */}
            <div className="p-4 rounded-xl bg-[#0a0d12] border border-white/5 space-y-3 text-xs">
              <div className="flex justify-between items-center text-gray-400">
                <span>Issuer:</span>
                <strong className="text-white">Closecraft HQ / Zeerocodes Automation Ltd</strong>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Payment Provider:</span>
                <strong className="text-white">Bachs.io Hosted Checkout</strong>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Invoice Type:</span>
                <span className="text-gray-200">{selectedReceipt.type.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Date Settled:</span>
                <span className="font-mono text-gray-200">{new Date(selectedReceipt.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400 pt-2 border-t border-white/5">
                <span className="font-bold text-white text-sm">Total Paid:</span>
                <span className="font-mono font-black text-emerald-400 text-lg">
                  {selectedReceipt.currency} {selectedReceipt.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 transition-colors"
              >
                <Printer size={14} />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 rounded-xl bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold text-xs shadow-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
