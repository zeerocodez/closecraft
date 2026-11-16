'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, Clock, ArrowRight, FileText, CreditCard } from 'lucide-react';

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

  const invoiceIdParam = searchParams?.get('invoice_id');
  const checkoutIdParam = searchParams?.get('checkout_id');

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
    <div className="min-h-[70vh] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg p-8 rounded-3xl bg-[#0f1214] border border-white/5 shadow-2xl space-y-6 text-center">
        {/* State 1: Confirmed / Paid */}
        {invoiceStatus?.isPaid ? (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Payment Confirmed
              </span>
              <h1 className="font-serif text-2xl font-bold text-white">
                Workspace Entitlement Activated
              </h1>
              <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                Official Bachs webhook confirmation received. Your workspace subscription has been updated.
              </p>
            </div>

            {/* Paid-through date highlight */}
            <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-2 text-left text-xs">
              <div className="flex justify-between items-center text-gray-400">
                <span>Invoice:</span>
                <span className="font-mono font-bold text-white">{invoiceStatus.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Amount Settled:</span>
                <span className="font-mono font-bold text-white">
                  {invoiceStatus.currency} {invoiceStatus.amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-400 pt-2 border-t border-white/5">
                <span className="font-semibold text-[#45bfae]">Paid Through Date:</span>
                <span className="font-bold text-emerald-400 text-sm font-mono">
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
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] transition-all text-center shadow-lg"
              >
                Go to Sales Command Centre
              </Link>
              <Link
                href="/billing"
                className="py-3 px-4 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-center"
              >
                View Invoices
              </Link>
            </div>
          </div>
        ) : error ? (
          /* State 2: Error */
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/40">
              <AlertTriangle size={36} />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-xl font-bold text-white">Payment Verification Notice</h1>
              <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">{error}</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/billing"
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] transition-all text-center shadow-lg"
              >
                Return to Billing
              </Link>
            </div>
          </div>
        ) : (
          /* State 3: Pending verification */
          <div className="space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-[#248277]/20 border-t-[#45bfae] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[#45bfae]">
                <Clock size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Pending Server Confirmation
              </span>
              <h1 className="font-serif text-xl font-bold text-white">
                Verifying Payment with Bachs
              </h1>
              <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                We are waiting for the authoritative payment webhook from Bachs.io. This typically completes within a few moments.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0a0d12] border border-white/5 text-xs text-gray-400 text-left space-y-1">
              <div className="flex justify-between">
                <span>Checking status:</span>
                <span className="font-mono text-white">Attempt {pollCount} / 40</span>
              </div>
              <p className="text-[11px] text-gray-500 pt-2 border-t border-white/5">
                * Note: If you close this tab, your payment will still be fulfilled automatically as soon as the Bachs webhook settles with Closecraft.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/billing"
                className="text-xs font-medium text-gray-400 hover:text-white underline"
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
