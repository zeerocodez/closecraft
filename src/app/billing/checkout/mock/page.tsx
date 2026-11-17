import React from 'react';
import { db } from '@/lib/db';
import { processBachsWebhookEvent } from '@/lib/payments/bachs';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Lock } from 'lucide-react';

export const metadata = {
  title: 'Bachs Sandbox Checkout Simulator | Closecraft',
  description: 'Simulated hosted checkout session for testing payment flows in development and sandbox environments.',
};

async function requireSimulatorAccess(invoiceId?: string) {
  if (process.env.NODE_ENV === 'production' || process.env.ALLOW_PAYMENT_SIMULATOR !== 'true') notFound();
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (invoiceId) {
    const invoice = await db.bachsInvoice.findUnique({ where: { id: invoiceId } });
    const member = invoice && await db.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: invoice.organizationId },
    });
    if (!member) notFound();
  }
}

async function simulatePaymentAction(formData: FormData) {
  'use server';

  const invoiceId = formData.get('invoiceId') as string;
  if (!invoiceId) throw new Error('Invoice ID required');
  await requireSimulatorAccess(invoiceId);

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

  redirect(`/billing/return?invoice_id=${invoice.id}&checkout_id=${invoice.bachsCheckoutId || `chk_${invoice.id}`}`);
}

export default async function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireSimulatorAccess();
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

  if (invoice) await requireSimulatorAccess(invoice.id);

  const amount = invoice ? invoice.amount : parseFloat((params.amount as string) || '15000');
  const currency = invoice ? invoice.currency : ((params.currency as string) || 'NGN');
  const invoiceNumber = invoice?.invoiceNumber || `INV-${Date.now()}`;
  const orgName = invoice?.organization?.name || 'Your Workspace';
  const typeLabel = invoice?.type === 'MANAGED_PILOT' 
    ? 'Closecraft Follow-up Pilot (30 Days)' 
    : 'Closecraft Workspace Access (1 Calendar Month)';

  return (
    <div className="min-h-screen bg-[#0a0d12] text-white flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-[#0f1214] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#248277]/10 border border-[#248277]/20 flex items-center justify-center font-bold text-[#45bfae] text-sm">
              <CreditCard className="w-5 h-5 text-[#45bfae]" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bachs Hosted Checkout</div>
              <div className="text-xs text-[#45bfae] font-medium">Sandbox Mode (Dev Simulation)</div>
            </div>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Sandbox
          </span>
        </div>

        {/* Invoice Summary */}
        <div className="bg-[#13171a] rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="text-xs text-slate-400 font-medium">{orgName}</div>
          <div className="text-base font-bold text-white tracking-tight">{typeLabel}</div>
          
          <div className="pt-2 border-t border-white/5 flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Total Due</span>
            <div className="text-2xl font-black text-white">
              {currency} {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="text-xs text-slate-400 flex justify-between">
            <span>Invoice Reference:</span>
            <span className="font-mono text-[#45bfae]">{invoiceNumber}</span>
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
              className="w-full py-3.5 bg-[#248277] hover:bg-[#1f6f65] text-white font-bold rounded-xl shadow-lg shadow-[#248277]/20 transition flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
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
        <div className="pt-4 border-t border-white/5 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#45bfae]" />
          Server-enforced settlement & webhook idempotency verified.
        </div>
      </div>
    </div>
  );
}
