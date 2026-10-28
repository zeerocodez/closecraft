'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

interface InvoiceStatus {
  id: string;
  invoiceNumber: string;
  status: string;
  isPaid: boolean;
  amount: number;
  currency: string;
  paidAt?: string | null;
  paidThroughDate?: string | null;
  subscriptionStatus?: string | null;
  checkoutId?: string | null;
}

export default function BillingReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const invoiceIdParam = searchParams.get('invoice_id');
  const checkoutIdParam = searchParams.get('checkout_id');

  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function checkStatus() {
      try {
        if (!invoiceIdParam && !checkoutIdParam) {
          setError('Missing invoice or checkout identifier in return URL');
          setIsPolling(false);
          return;
        }

        const idToQuery = invoiceIdParam || checkoutIdParam;
        let res = await fetch(`/api/billing/invoices/${idToQuery}/status`);
        if (!res.ok) {
          res = await fetch(`/api/billing/invoices/status?id=${idToQuery}&invoice_id=${invoiceIdParam || ''}&checkout_id=${checkoutIdParam || ''}`);
        }

        if (!res.ok) {
          if (res.status === 404) {
            setError('Invoice could not be located. If your account was debited, your workspace will activate automatically via Bachs webhook.');
          } else {
            setError(`Status query error (${res.status})`);
          }
          setIsPolling(false);
          return;
        }

        const data: InvoiceStatus = await res.json();
        setInvoiceStatus(data);

        if (data.isPaid) {
          setIsPolling(false);
        } else {
          setPollCount((prev) => {
            const next = prev + 1;
            // Stop polling after 40 attempts (~80 seconds)
            if (next >= 40) {
              setIsPolling(false);
            }
            return next;
          });
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        setError('Network error checking payment status');
        setIsPolling(false);
      }
    }

    checkStatus();

    if (isPolling && !invoiceStatus?.isPaid) {
      timer = setInterval(checkStatus, 2500);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [invoiceIdParam, checkoutIdParam, isPolling, invoiceStatus?.isPaid]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 shadow-xl space-y-6 text-center">
        {/* State 1: Confirmed / Paid */}
        {invoiceStatus?.isPaid ? (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
              <Icon name="CheckCircle2" size={36} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Payment Confirmed
              </span>
              <h1 className="font-heading text-2xl font-extrabold text-on-surface">
                Workspace Entitlement Activated
              </h1>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                Official Bachs webhook confirmation received. Your workspace subscription has been updated.
              </p>
            </div>

            {/* Paid-through date highlight */}
            <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/20 space-y-2 text-left">
              <div className="flex justify-between items-center text-xs text-on-surface-variant">
                <span>Invoice:</span>
                <span className="font-mono font-bold text-on-surface">{invoiceStatus.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-on-surface-variant">
                <span>Amount:</span>
                <span className="font-bold text-on-surface">
                  {invoiceStatus.currency} {invoiceStatus.amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">
                <span className="font-semibold text-primary">Paid Through Date:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {invoiceStatus.paidThroughDate
                    ? new Date(invoiceStatus.paidThroughDate).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Active Access Granted'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/inbox"
                className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:opacity-90 transition-all text-center"
              >
                Go to Sales Command Centre
              </Link>
              <Link
                href="/billing"
                className="py-3 px-4 rounded-xl text-xs font-semibold bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/40 transition-all text-center"
              >
                View Invoices
              </Link>
            </div>
          </div>
        ) : error ? (
          /* State 2: Error */
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/40">
              <Icon name="AlertTriangle" size={36} />
            </div>

            <div className="space-y-2">
              <h1 className="font-heading text-xl font-bold text-on-surface">Payment Verification Notice</h1>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto">{error}</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/billing"
                className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:opacity-90 transition-all text-center"
              >
                Return to Billing
              </Link>
            </div>
          </div>
        ) : (
          /* State 3: Pending verification */
          <div className="space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon name="Clock" size={20} className="text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Pending Server Confirmation
              </span>
              <h1 className="font-heading text-xl font-bold text-on-surface">
                Verifying Payment with Bachs
              </h1>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                We are waiting for the authoritative payment webhook from Bachs.io. This typically completes within a few moments.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 text-xs text-on-surface-variant text-left space-y-1">
              <div className="flex justify-between">
                <span>Checking status:</span>
                <span className="font-mono text-on-surface">Attempt {pollCount} / 40</span>
              </div>
              <p className="text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/10">
                * Note: If you close this tab, your payment will still be fulfilled automatically as soon as the Bachs webhook settles with Closecraft.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/billing"
                className="text-xs font-medium text-on-surface-variant hover:text-on-surface underline"
              >
                Return to Billing Overview
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
