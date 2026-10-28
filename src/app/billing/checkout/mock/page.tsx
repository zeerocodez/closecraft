import React from 'react';
import { db } from '@/lib/db';
import { processBachsWebhookEvent } from '@/lib/payments/bachs';
import { redirect } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';

export const metadata = {
  title: 'Bachs Sandbox Checkout Simulator | Closecraft',
  description: 'Simulated hosted checkout session for testing payment flows in development and sandbox environments.',
};

async function simulatePaymentAction(formData: FormData) {
  'use server';

  const invoiceId = formData.get('invoiceId') as string;
  if (!invoiceId) throw new Error('Invoice ID required');

  const invoice = await db.bachsInvoice.findUnique({
    where: { id: invoiceId },
    include: { organization: true }
  });

  if (!invoice) throw new Error('Invoice not found');

  const metadata = invoice.metadata ? JSON.parse(invoice.metadata) : {};

  // Construct mock Bachs collection.succeeded webhook payload
  const mockWebhookEvent = {
    id: `evt_sim_${Date.now()}`,
    type: 'collection.succeeded',
    event: 'collection.succeeded',
    data: {
      id: invoice.bachsCheckoutId || `chk_${invoice.id}`,
      checkout_id: invoice.bachsCheckoutId || `chk_${invoice.id}`,
      payment_id: `chg_sim_${Date.now()}`,
      reference: invoice.invoiceNumber,
      amount: invoice.amount.toFixed(2),
      currency: invoice.currency,
      metadata: {
        organizationId: invoice.organizationId,
        invoiceId: invoice.id,
        engagementId: invoice.engagementId,
        type: invoice.type,
        ...metadata,
      }
    }
  };

  // Process event idempotently through official payment processor
  await processBachsWebhookEvent(mockWebhookEvent);

  if (invoice.type === 'MANAGED_PILOT' && invoice.engagementId) {
    redirect(`/sales-support?payment=success&invoice=${invoice.invoiceNumber}`);
  } else {
    redirect(`/billing?payment=success&invoice=${invoice.invoiceNumber}`);
  }
}

export default async function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const invoiceId = typeof params.invoice_id === 'string' ? params.invoice_id : '';
  const checkoutId = typeof params.checkout_id === 'string' ? params.checkout_id : '';

  let invoice = null;
  if (invoiceId) {
    invoice = await db.bachsInvoice.findUnique({
      where: { id: invoiceId },
      include: { organization: true, engagement: true }
    });
  }

  if (!invoice && checkoutId) {
    invoice = await db.bachsInvoice.findFirst({
      where: { bachsCheckoutId: checkoutId },
      include: { organization: true, engagement: true }
    });
  }

  const amount = invoice ? invoice.amount : parseFloat((params.amount as string) || '15000');
  const currency = invoice ? invoice.currency : ((params.currency as string) || 'NGN');
  const invoiceNumber = invoice?.invoiceNumber || `INV-${Date.now()}`;
  const orgName = invoice?.organization?.name || 'Your Workspace';
  const typeLabel = invoice?.type === 'MANAGED_PILOT' 
    ? 'Closecraft Follow-up Pilot (30 Days)' 
    : 'Closecraft Workspace Access (1 Calendar Month)';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
              B
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bachs Hosted Checkout</div>
              <div className="text-xs text-indigo-400 font-medium">Sandbox Mode (Dev Simulation)</div>
            </div>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
            Test Environment
          </span>
        </div>

        {/* Invoice Summary */}
        <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 space-y-3">
          <div className="text-xs text-slate-400 font-medium">{orgName}</div>
          <div className="text-base font-bold text-white">{typeLabel}</div>
          
          <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Total Due</span>
            <div className="text-2xl font-black text-white">
              {currency} {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="text-xs text-slate-500 flex justify-between">
            <span>Invoice Reference:</span>
            <span className="font-mono text-slate-300">{invoiceNumber}</span>
          </div>
        </div>

        {/* Payment Simulation Form */}
        <div className="space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            In live production, customer is redirected to Bachs hosted card/account payment page. In this sandbox simulation, clicking below verifies settlement via server-side webhook processing.
          </p>

          <form action={simulatePaymentAction}>
            <input type="hidden" name="invoiceId" value={invoice?.id || invoiceId} />
            
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Icon name="check-circle" size={18} />
              Simulate Successful Settlement
            </button>
          </form>

          <div className="text-center">
            <a
              href="/billing"
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              Cancel and return to workspace
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Icon name="shield" size={14} className="text-emerald-400" />
          Server-enforced settlement & webhook idempotency verified.
        </div>
      </div>
    </div>
  );
}
