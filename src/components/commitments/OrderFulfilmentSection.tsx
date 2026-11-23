'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  X,
  CreditCard
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  title: string;
  agreedAmount: number | string;
  amountPaid: number | string;
  balanceRemaining: number | string;
  currency: string;
  paymentStatus: string;
  fulfilmentStatus: string;
  deadline?: string | Date | null;
  lead?: { id: string; name: string } | null;
  commitments?: Array<{ id: string; title: string; status: string }>;
}

interface OrderFulfilmentSectionProps {
  orders: Order[];
  leads?: Array<{ id: string; name: string }>;
}

export function OrderFulfilmentSection({ orders, leads = [] }: OrderFulfilmentSectionProps) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // New Order Form state
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPaid, setNewPaid] = useState('');
  const [newCurrency, setNewCurrency] = useState('NGN');
  const [newLeadId, setNewLeadId] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;

    setIsCreatingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          agreedAmount: Number(newAmount),
          amountPaid: Number(newPaid || 0),
          currency: newCurrency,
          leadId: newLeadId || undefined
        })
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewTitle('');
        setNewAmount('');
        setNewPaid('');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleRecordPayment = async (orderId: string) => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return;

    setIsSubmittingPayment(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentAmount: Number(paymentAmount)
        })
      });

      if (res.ok) {
        setPayingOrderId(null);
        setPaymentAmount('');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
        <div>
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary" />
            <span>Orders &amp; Fulfilment Commitments</span>
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Confirmed sales agreements, paid balances, and post-sale delivery milestones.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>New Customer Order</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="py-6 text-center text-on-surface-variant text-xs space-y-1">
          <p className="font-semibold text-on-surface">No active orders recorded yet</p>
          <p className="text-[11px]">Convert a won deal or click "New Customer Order" to track agreed deliverables and payments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {orders.map((o) => {
            const sym = o.currency === 'USD' ? '$' : o.currency === 'GBP' ? '£' : '₦';
            const agreed = Number(o.agreedAmount);
            const paid = Number(o.amountPaid);
            const balance = Number(o.balanceRemaining);

            return (
              <div
                key={o.id}
                className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3 flex flex-col justify-between text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-primary">{o.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      o.paymentStatus === 'PAID_IN_FULL'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {o.paymentStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-on-surface leading-tight">{o.title}</h4>
                  {o.lead && (
                    <p className="text-[11px] text-on-surface-variant">Customer: <span className="font-semibold text-on-surface">{o.lead.name}</span></p>
                  )}

                  {/* Financial Breakdown */}
                  <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 font-mono text-[11px] space-y-1">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Agreed Total:</span>
                      <span className="font-bold text-on-surface">{sym}{agreed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Amount Paid:</span>
                      <span>{sym}{paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-amber-300 font-bold pt-1 border-t border-outline-variant/20">
                      <span>Balance Due:</span>
                      <span>{sym}{balance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Action */}
                <div className="pt-2 border-t border-outline-variant/20">
                  {payingOrderId === o.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Amount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-24 p-1 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs font-mono text-on-surface"
                      />
                      <button
                        type="button"
                        onClick={() => handleRecordPayment(o.id)}
                        disabled={isSubmittingPayment}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                      >
                        {isSubmittingPayment ? '...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayingOrderId(null)}
                        className="p-1 text-on-surface-variant"
                      >
                        ✕
                      </button>
                    </div>
                  ) : balance > 0 ? (
                    <button
                      type="button"
                      onClick={() => { setPayingOrderId(o.id); setPaymentAmount(String(balance)); }}
                      className="w-full py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CreditCard size={12} className="text-primary" />
                      <span>Record Payment</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
                      <CheckCircle2 size={12} />
                      <span>Order Paid in Full</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <h3 className="font-bold text-sm text-on-surface">Record Customer Order</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Order / Package Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ERP Retainer, 3-Month Sales Consulting"
                  className="w-full p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-on-surface">Agreed Amount *</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="500000"
                    className="w-full p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Currency</label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface">Initial Deposit Paid</label>
                <input
                  type="number"
                  value={newPaid}
                  onChange={(e) => setNewPaid(e.target.value)}
                  placeholder="0"
                  className="w-full p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface">Link to Customer</label>
                <select
                  value={newLeadId}
                  onChange={(e) => setNewLeadId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                >
                  <option value="">General Order</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:text-on-surface font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingOrder}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5"
                >
                  {isCreatingOrder ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  <span>Create Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
