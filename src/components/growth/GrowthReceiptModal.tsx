'use client';

import React from 'react';
import { CheckCircle2, Download, Printer, X, ShieldCheck } from 'lucide-react';

interface ReceiptData {
  receiptNumber: string;
  relatedInvoiceNumber: string;
  customerName: string;
  customerEmail?: string | null;
  businessName: string;
  projectReference: string;
  amountReceived: number | string;
  currency: string;
  paymentDate: string | Date;
  paymentMethod: string;
  transactionReference?: string | null;
  paymentStatus: string;
  itemisedDeliverables?: Array<{
    serviceType: string;
    title: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface GrowthReceiptModalProps {
  receipt: ReceiptData;
  isOpen: boolean;
  onClose: () => void;
}

export default function GrowthReceiptModal({ receipt, isOpen, onClose }: GrowthReceiptModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(receipt.paymentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const amountNum = Number(receipt.amountReceived);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0d0d0d] border border-[#248277]/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
        {/* Top Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              OFFICIAL PAYMENT RECEIPT
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] text-[#a1a1aa] hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer"
              title="Print Receipt"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] text-[#a1a1aa] hover:text-white transition-all cursor-pointer"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#45bfae]">CLOSECRAFT</span>
              <span className="text-xs font-normal text-[#71717a]">GROWTH PLATFORM</span>
            </h2>
            <p className="text-xs text-[#a1a1aa] mt-0.5">Zeerocodes Automation Limited</p>
            <p className="text-[11px] text-[#71717a]">www.closecrafthq.com</p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-mono text-[#71717a]">RECEIPT NUMBER</p>
            <p className="text-sm font-mono font-bold text-white">{receipt.receiptNumber}</p>
            <p className="text-[11px] font-mono text-[#71717a] mt-1">Invoice: {receipt.relatedInvoiceNumber}</p>
          </div>
        </div>

        {/* Verification Banner */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Payment Confirmed &amp; Verified</p>
              <p className="text-[11px] text-emerald-300">Bachs Cryptographic Settlement</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/40">
              PAID IN FULL
            </span>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs p-4 rounded-2xl bg-[#080808] border border-[#1f1f1f]">
          <div>
            <p className="text-[#71717a]">ISSUED TO</p>
            <p className="text-white font-semibold mt-0.5">{receipt.customerName}</p>
            <p className="text-[#a1a1aa]">{receipt.businessName}</p>
            {receipt.customerEmail && <p className="text-[#71717a]">{receipt.customerEmail}</p>}
          </div>

          <div>
            <p className="text-[#71717a]">PAYMENT DETAILS</p>
            <p className="text-white mt-0.5"><span className="text-[#71717a]">Date:</span> {formattedDate}</p>
            <p className="text-white"><span className="text-[#71717a]">Method:</span> {receipt.paymentMethod}</p>
            {receipt.transactionReference && (
              <p className="text-[11px] font-mono text-[#a1a1aa] truncate">
                <span className="text-[#71717a]">Txn Ref:</span> {receipt.transactionReference}
              </p>
            )}
            <p className="text-white"><span className="text-[#71717a]">Project Ref:</span> {receipt.projectReference}</p>
          </div>
        </div>

        {/* Line Items Breakdown */}
        {receipt.itemisedDeliverables && receipt.itemisedDeliverables.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">Itemised Scope of Work</p>
            <div className="border border-[#1f1f1f] rounded-2xl overflow-hidden divide-y divide-[#1f1f1f]">
              {receipt.itemisedDeliverables.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#080808] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-[11px] text-[#71717a]">Service: {item.serviceType}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-white">
                      ₦{Number(item.totalPrice).toLocaleString()} {receipt.currency}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-[10px] text-[#71717a]">Qty: {item.quantity}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Amount Summary */}
        <div className="pt-2 border-t border-[#1f1f1f] flex items-center justify-between">
          <div>
            <p className="text-xs text-[#71717a]">TOTAL PAID</p>
            <p className="text-2xl font-black font-mono text-[#45bfae]">
              ₦{amountNum.toLocaleString()} <span className="text-sm font-normal text-white">{receipt.currency}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#71717a]">
            <ShieldCheck size={16} className="text-[#45bfae]" />
            <span>Guaranteed Service Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}

