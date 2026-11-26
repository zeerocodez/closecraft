'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';

interface Props {
  campaignId: string;
  campaignName: string;
  isApproved: boolean;
  paymentStatus: string;
  setupFeeAmount: number;
  currency: string;
}

export function RecoveryCampaignActions({
  campaignId,
  campaignName,
  isApproved,
  paymentStatus,
  setupFeeAmount,
  currency,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<'APPROVE' | 'PAY' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setBusy('APPROVE');
    setError(null);
    try {
      const res = await fetch('/api/recovery/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, action: 'APPROVE' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Approval failed');
    } finally {
      setBusy(null);
    }
  };

  const handlePayViaBachs = async () => {
    setBusy('PAY');
    setError(null);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recoveryCampaignId: campaignId,
          description: `Lead Recovery Campaign: ${campaignName}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate Bachs checkout');
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        {!isApproved && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={handleApprove}
            className="px-2.5 py-1 rounded-lg bg-primary/15 border border-primary/30 text-primary text-[10px] font-bold hover:bg-primary/25 transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {busy === 'APPROVE' ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
            <span>Approve Campaign</span>
          </button>
        )}

        {paymentStatus !== 'PAID' && paymentStatus !== 'WAIVED_PILOT' && setupFeeAmount > 0 && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={handlePayViaBachs}
            className="px-2.5 py-1 rounded-lg bg-[#C7F36B] text-[#111827] text-[10px] font-extrabold hover:bg-[#d9f99d] transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {busy === 'PAY' ? <Loader2 size={11} className="animate-spin" /> : <CreditCard size={11} />}
            <span>Pay {currency === 'USD' ? '$' : '₦'}{setupFeeAmount.toLocaleString()}</span>
          </button>
        )}

        {isApproved && (paymentStatus === 'PAID' || paymentStatus === 'WAIVED_PILOT' || setupFeeAmount <= 0) && (
          <span className="text-[10px] font-mono text-emerald-400 font-bold">Ready</span>
        )}
      </div>
      {error && <span className="text-[10px] text-rose-400">{error}</span>}
    </div>
  );
}
