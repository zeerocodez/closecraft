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

  const handleRenewSubscription = async () => {
    setIsLoadingCheckout(true);
    try {
      const res = await createBachsCheckoutAction({
        type: 'SOFTWARE_SUBSCRIPTION',
        amount: subscription.pricePerMonth,
        currency: subscription.currency,
        successUrl: window.location.origin + '/billing?status=success',
        cancelUrl: window.location.origin + '/billing?status=cancelled',
      });

      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        alert('Checkout URL not returned');
      }
    } catch (err: any) {
      alert(err.message || 'Renewal checkout failed');
      setIsLoadingCheckout(false);
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
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-on-surface">Billing & Access</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage your workspace subscription, pilot invoices, and Bachs payment receipts.
          </p>
        </div>
        <div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Subscription Card */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Workspace Plan</span>
            <h2 className="font-heading text-xl font-bold text-on-surface mt-1">Closecraft Workspace</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Includes enquiry capture, Today command center, next actions, and up to 5 internal team members.
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              * Approved external sales professionals on active pilot engagements do not consume internal seats.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl font-bold text-on-surface">
              {subscription.currency} {subscription.pricePerMonth.toLocaleString()}
            </span>
            <span className="text-xs text-on-surface-variant block">/ month ({subscription.billingMode === 'MANUAL_MONTHLY' ? 'Monthly, renew manually' : 'Recurring'})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-outline-variant/20 text-xs">
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
              <p className="text-[11px] text-emerald-400">Early renewal extends this date</p>
            )}
          </div>

          <div>
            <span className="text-on-surface-variant">Payment Method:</span>
            <p className="font-semibold text-on-surface mt-0.5">Bachs Hosted Checkout</p>
            <p className="text-[11px] text-on-surface-variant">NGN Bank Transfer, Card, MoMo</p>
          </div>
        </div>

        {subscription.status !== 'PILOT_INCLUDED' && isOwnerOrAdmin && (
          <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-on-surface-variant">
              {subscription.status === 'TRIALING'
                ? `You are on day ${14 - subscription.trialDaysLeft} of your 14-day no-card trial. Renew anytime to lock in active access.`
                : 'Renewing adds 1 calendar month to your paid-through date.'}
            </p>

            <button
              onClick={handleRenewSubscription}
              disabled={isLoadingCheckout}
              className="px-5 py-2.5 rounded-xl font-medium text-sm bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-all shadow-sm active:scale-95"
            >
              {isLoadingCheckout ? 'Redirecting to Bachs...' : `Renew for 1 Month (${subscription.currency} ${subscription.pricePerMonth.toLocaleString()})`}
            </button>
          </div>
        )}
      </div>

      {/* Managed Pilot Notice */}
      {subscription.status === 'PILOT_INCLUDED' && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-3">
          <Icon name="CheckCircle2" size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-emerald-300">Software Access Included with Pilot</strong>
            <p className="mt-0.5">
              Your 30-day Follow-up Pilot includes full workspace access without duplicate standalone software charges. When the pilot concludes, you can transition smoothly to standard monthly workspace renewal.
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
