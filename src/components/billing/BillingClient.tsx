'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { createBachsCheckoutAction } from '@/app/(saas)/actions';

interface SubscriptionData {
  status: 'TRIALING' | 'ACTIVE' | 'GRACE' | 'EXPIRED' | 'PILOT_INCLUDED';
  isOperational: boolean;
  plan: string;
  pricePerMonth: number;
  currency: string;
  billingMode: string;
  trialDaysLeft: number;
  paidThroughDate: Date | string | null;
  gracePeriodEndsAt: Date | string | null;
  activePilotEngagementId: string | null;
  maxInternalSeats: number;
  internalSeatsUsed: number;
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
}

export default function BillingClient({
  subscription,
  invoices,
  isOwnerOrAdmin,
}: {
  subscription: SubscriptionData;
  invoices: InvoiceItem[];
  isOwnerOrAdmin: boolean;
}) {
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [selectedPlanLoading, setSelectedPlanLoading] = useState<'STARTER' | 'PRO' | null>(null);

  const currentPlanId = subscription.plan.toUpperCase() === 'PRO' ? 'PRO' : 'STARTER';
  const seatsUsed = subscription.internalSeatsUsed ?? 1;
  const maxSeats = subscription.maxInternalSeats ?? 3;
  const seatPercentage = Math.min(100, Math.round((seatsUsed / maxSeats) * 100));

  const handleCheckoutPlan = async (targetPlan: 'STARTER' | 'PRO') => {
    setIsLoadingCheckout(true);
    setSelectedPlanLoading(targetPlan);
    try {
      const planAmount = targetPlan === 'PRO' ? 45000 : 20000;
      const res = await createBachsCheckoutAction({
        type: 'SOFTWARE_SUBSCRIPTION',
        plan: targetPlan,
        amount: planAmount,
        currency: subscription.currency,
        successUrl: window.location.origin + '/billing?status=success',
        cancelUrl: window.location.origin + '/billing?status=cancelled',
      });

      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        alert('Checkout URL not returned');
        setIsLoadingCheckout(false);
        setSelectedPlanLoading(null);
      }
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
      setIsLoadingCheckout(false);
      setSelectedPlanLoading(null);
    }
  };

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'PILOT_INCLUDED':
        return (
          <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
            Included with Managed Pilot
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
            Active Subscription
          </span>
        );
      case 'TRIALING':
        return (
          <span className="text-xs px-2.5 py-1 rounded-md bg-primary/20 text-primary font-semibold border border-primary/30">
            14-Day Free Trial ({subscription.trialDaysLeft} days left)
          </span>
        );
      case 'GRACE':
        return (
          <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
            7-Day Grace Period
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="text-xs px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
            Access Expired (Manual Renewal Required)
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-on-surface">Billing & Subscriptions</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage your workspace subscription tier, team seat limits, and official Bachs.io payments.
          </p>
        </div>
        <div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Current Subscription Status & Seat Usage */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Current Workspace Tier</span>
              <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                currentPlanId === 'PRO' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'
              }`}>
                {currentPlanId === 'PRO' ? 'PRO PLAN' : 'STARTER PLAN'}
              </span>
            </div>
            <h2 className="font-heading text-xl font-bold text-on-surface mt-1">
              Closecraft {currentPlanId === 'PRO' ? 'Pro Workspace (10 Seats)' : 'Starter Workspace (3 Seats)'}
            </h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {currentPlanId === 'PRO'
                ? 'High-velocity sales workflow with 10 internal team seats, round-robin auto-routing, and call review queues.'
                : 'Core sales operations with 3 internal team seats, lead management, and follow-up leakage alerts.'}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-2xl font-bold text-on-surface">
              {subscription.currency} {subscription.pricePerMonth.toLocaleString()}
            </span>
            <span className="text-xs text-on-surface-variant block">/ month (Manual calendar-month renewal)</span>
          </div>
        </div>

        {/* Seat Usage Progress Bar */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-on-surface flex items-center gap-1.5">
              <Icon name="Users" size={14} className="text-primary" />
              Internal Team Seats Utilization
            </span>
            <span className="font-bold text-on-surface">
              {seatsUsed} of {maxSeats} seats assigned ({maxSeats - seatsUsed} available)
            </span>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                seatsUsed >= maxSeats ? 'bg-amber-400' : 'bg-primary'
              }`}
              style={{ width: `${Math.max(5, seatPercentage)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>
              * External remote sales professionals on managed pilots <strong className="text-on-surface font-semibold">never</strong> count against your seat limit.
            </span>
            {seatsUsed >= maxSeats && (
              <span className="text-amber-400 font-semibold">Seat limit reached. Upgrade to Pro for 10 seats.</span>
            )}
          </div>
        </div>

        {/* Billing Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-outline-variant/20 text-xs">
          <div>
            <span className="text-on-surface-variant">Billing Mode:</span>
            <p className="font-semibold text-on-surface mt-0.5">Monthly, renew manually</p>
            <p className="text-[11px] text-on-surface-variant">One-time payment per calendar month</p>
          </div>

          <div>
            <span className="text-on-surface-variant">Paid Through Date:</span>
            <p className="font-semibold text-on-surface mt-0.5">
              {subscription.paidThroughDate ? new Date(subscription.paidThroughDate).toLocaleDateString() : 'Active under Trial'}
            </p>
            {subscription.status === 'ACTIVE' && (
              <p className="text-[11px] text-emerald-400">Early renewal extends this date by 1 calendar month</p>
            )}
          </div>

          <div>
            <span className="text-on-surface-variant">Payment Method:</span>
            <p className="font-semibold text-on-surface mt-0.5">Bachs Hosted Checkout</p>
            <p className="text-[11px] text-on-surface-variant">NGN Bank Transfer, Debit Card, MoMo</p>
          </div>
        </div>
      </div>

      {/* Plan Selection / Upgrade Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-on-surface">Available Workspace Plans</h2>
          <p className="text-xs text-on-surface-variant">
            Select the seat capacity that fits your sales team. You can upgrade anytime via Bachs.io.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* STARTER PLAN */}
          <div className={`p-6 rounded-2xl flex flex-col justify-between border transition-all ${
            currentPlanId === 'STARTER'
              ? 'bg-surface-container-low border-primary/50 shadow-md ring-1 ring-primary/30'
              : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-on-surface">Starter Plan</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Ideal for lean sales teams & startups</p>
                </div>
                {currentPlanId === 'STARTER' && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold border border-primary/30">
                    CURRENT PLAN
                  </span>
                )}
              </div>

              <div className="py-2">
                <span className="text-3xl font-extrabold text-on-surface">₦20,000</span>
                <span className="text-xs text-on-surface-variant"> / month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-on-surface-variant">
                <li className="flex items-start gap-2 text-on-surface">
                  <Icon name="Check" size={16} className="text-primary shrink-0 mt-0.5" />
                  <span><strong>3 Internal Team Seats</strong> included</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>14-day free trial (no card required)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>Lead management inbox & manual assignments</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>SLA follow-up tracking & revenue leakage radar</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>Instant Bachs.io NGN checkout (bank transfer, cards)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>Attach remote sales pilots anytime without extra software fees</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-outline-variant/20">
              {isOwnerOrAdmin ? (
                <button
                  onClick={() => handleCheckoutPlan('STARTER')}
                  disabled={isLoadingCheckout}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 ${
                    currentPlanId === 'STARTER'
                      ? 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/40'
                      : 'bg-primary text-on-primary hover:opacity-90'
                  }`}
                >
                  {selectedPlanLoading === 'STARTER'
                    ? 'Connecting to Bachs...'
                    : currentPlanId === 'STARTER'
                    ? 'Renew Starter (₦20,000 / month)'
                    : 'Switch to Starter (₦20,000 / month)'}
                </button>
              ) : (
                <p className="text-[11px] text-on-surface-variant italic text-center">Only organization admins can renew</p>
              )}
            </div>
          </div>

          {/* PRO PLAN */}
          <div className={`p-6 rounded-2xl flex flex-col justify-between border relative transition-all ${
            currentPlanId === 'PRO'
              ? 'bg-surface-container-low border-primary/50 shadow-md ring-1 ring-primary/30'
              : 'bg-surface-container-low border-primary/40 hover:border-primary shadow-lg'
          }`}>
            <div className="absolute -top-3 right-6 bg-primary text-on-primary text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
              Recommended for Teams
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-on-surface">Pro Plan</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Expanded capacity for active sales operations</p>
                </div>
                {currentPlanId === 'PRO' && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold border border-primary/30">
                    CURRENT PLAN
                  </span>
                )}
              </div>

              <div className="py-2">
                <span className="text-3xl font-extrabold text-on-surface">₦45,000</span>
                <span className="text-xs text-on-surface-variant"> / month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-on-surface-variant">
                <li className="flex items-start gap-2 text-on-surface">
                  <Icon name="Check" size={16} className="text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-primary">10 Internal Team Seats</strong> included (7 extra seats)</span>
                </li>
                <li className="flex items-start gap-2 text-on-surface">
                  <Icon name="Check" size={16} className="text-primary shrink-0 mt-0.5" />
                  <span><strong>Round-Robin Automated Lead Distribution</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>Manager call coaching & QA review queues</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>Priority WhatsApp & email notification dispatch</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>Executive revenue health & pipeline leakage dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>Priority pilot matching with top remote sales professionals</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-outline-variant/20">
              {isOwnerOrAdmin ? (
                <button
                  onClick={() => handleCheckoutPlan('PRO')}
                  disabled={isLoadingCheckout}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                >
                  {selectedPlanLoading === 'PRO'
                    ? 'Connecting to Bachs...'
                    : currentPlanId === 'PRO'
                    ? 'Renew Pro (₦45,000 / month)'
                    : 'Upgrade to Pro (₦45,000 / month)'}
                </button>
              ) : (
                <p className="text-[11px] text-on-surface-variant italic text-center">Only organization admins can upgrade</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Managed Pilot Notice */}
      {subscription.status === 'PILOT_INCLUDED' && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-3">
          <Icon name="CheckCircle2" size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-emerald-300">Software Access Included with Pilot</strong>
            <p className="mt-0.5">
              Your 30-day Follow-up Pilot includes full workspace access without standalone software charges. When the pilot concludes, you can transition smoothly to monthly renewal under either Starter (₦20,000) or Pro (₦45,000).
            </p>
          </div>
        </div>
      )}

      {/* Invoices History Table */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
        <h3 className="font-heading font-semibold text-base text-on-surface">Invoice & Transaction History</h3>

        {invoices.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic">No invoices issued yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-outline-variant/30 text-on-surface-variant">
                <tr>
                  <th className="py-2.5 pr-4 font-medium">Invoice #</th>
                  <th className="py-2.5 pr-4 font-medium">Type</th>
                  <th className="py-2.5 pr-4 font-medium">Amount</th>
                  <th className="py-2.5 pr-4 font-medium">Status</th>
                  <th className="py-2.5 pr-4 font-medium">Date</th>
                  <th className="py-2.5 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3 pr-4 font-mono font-medium">{inv.invoiceNumber}</td>
                    <td className="py-3 pr-4">{inv.type.replace(/_/g, ' ')}</td>
                    <td className="py-3 pr-4 font-semibold">{inv.currency} {inv.amount.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        inv.status === 'CONFIRMED' || inv.status === 'FUNDS_AVAILABLE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-on-surface-variant">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      {inv.status === 'ISSUED' && inv.bachsCheckoutUrl && (
                        <a
                          href={inv.bachsCheckoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          Complete Payment
                        </a>
                      )}
                      {(inv.status === 'CONFIRMED' || inv.status === 'FUNDS_AVAILABLE') && (
                        <span className="text-emerald-400 font-medium">Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
