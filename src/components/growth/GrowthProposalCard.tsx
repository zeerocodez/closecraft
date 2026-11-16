'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock, FileText, AlertCircle, ArrowRight, CornerDownRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LineItem {
  id: string;
  serviceType: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  deliverables: string[];
}

interface ProposalData {
  id: string;
  proposalNumber: string;
  title: string;
  scopeSummary: string;
  totalAmount: number | string;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  estimatedDays: number;
  validUntil: string | Date;
  lineItems: LineItem[];
  projectInvoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    bachsCheckoutUrl?: string | null;
  } | null;
}

interface GrowthProposalCardProps {
  proposal: ProposalData;
  onRefresh?: () => void;
}

export default function GrowthProposalCard({ proposal, onRefresh }: GrowthProposalCardProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  const isAccepted = proposal.status === 'ACCEPTED';
  const isRejected = proposal.status === 'REJECTED';
  const isPendingReview = proposal.status === 'SENT';

  const handleAction = async (action: 'ACCEPT' | 'REVISE' | 'REJECT') => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/growth/proposals/${proposal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          revisionNotes: action === 'REVISE' ? revisionNotes : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit proposal decision.');
      }

      if (action === 'ACCEPT' && data.invoice?.checkoutUrl) {
        // Redirect to Bachs checkout or reload
        window.location.href = data.invoice.checkoutUrl;
        return;
      }

      setShowRevisionModal(false);
      setRevisionNotes('');
      if (onRefresh) onRefresh();
      router.refresh();
    } catch (err: any) {
      setFeedback(err.message || 'Error processing response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmountNum = Number(proposal.totalAmount);
  const validUntilDate = new Date(proposal.validUntil).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="rounded-3xl bg-[#101010] border border-[#1f1f1f] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
      {/* Accent Background Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#248277]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f1f1f] relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#248277]/20 text-[#45bfae] font-bold border border-[#248277]/40 uppercase tracking-wider">
              {proposal.proposalNumber}
            </span>
            <span className="text-xs text-[#71717a]">
              Valid until {validUntilDate}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            {proposal.title}
          </h3>
          <p className="text-xs text-[#a1a1aa] mt-1 max-w-2xl leading-relaxed">
            {proposal.scopeSummary}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-[#71717a] block">ESTIMATED TOTAL</span>
          <span className="text-2xl font-black font-mono text-[#45bfae]">
            ₦{totalAmountNum.toLocaleString()} <span className="text-xs font-normal text-white">{proposal.currency}</span>
          </span>
          <span className="text-[11px] text-[#71717a] block mt-0.5">
            ~{proposal.estimatedDays} days delivery timeline
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle size={15} />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-xs underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Scope Line Items Table */}
      <div className="space-y-3 relative z-10">
        <h4 className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
          Included Service Deliverables ({proposal.lineItems.length})
        </h4>

        <div className="border border-[#1f1f1f] rounded-2xl divide-y divide-[#1f1f1f] overflow-hidden">
          {proposal.lineItems.map((item, idx) => (
            <div key={item.id || idx} className="p-4 bg-[#080808] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1a1a1a] text-[#a1a1aa]">
                      {item.serviceType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#a1a1aa] mt-1">{item.description}</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-sm font-mono font-bold text-white">
                    ₦{Number(item.totalPrice).toLocaleString()} {proposal.currency}
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-[10px] text-[#71717a] block">
                      ₦{Number(item.unitPrice).toLocaleString()} × {item.quantity}
                    </span>
                  )}
                </div>
              </div>

              {/* Deliverable Outputs Checklist */}
              {item.deliverables && item.deliverables.length > 0 && (
                <div className="pt-2 border-t border-[#1a1a1a] grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {item.deliverables.map((del, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-xs text-[#a1a1aa]">
                      <CheckCircle2 size={13} className="text-[#45bfae] shrink-0 mt-0.5" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Decision Actions Area */}
      <div className="pt-4 border-t border-[#1f1f1f] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-2 text-xs text-[#71717a]">
          <ShieldCheck size={16} className="text-[#45bfae]" />
          <span>No commitment until proposal approval &amp; invoice issuance</span>
        </div>

        {isAccepted ? (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/40 flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              Proposal Accepted
            </span>

            {proposal.projectInvoice?.bachsCheckoutUrl && proposal.projectInvoice.status !== 'PAID' && (
              <a
                href={proposal.projectInvoice.bachsCheckoutUrl}
                className="px-5 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Proceed to Payment</span>
                <ArrowRight size={14} />
              </a>
            )}
          </div>
        ) : isRejected ? (
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/40">
            Proposal Declined
          </span>
        ) : isPendingReview ? (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowRevisionModal(true)}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] text-[#a1a1aa] hover:text-white font-semibold text-xs border border-[#2a2a2a] transition-all cursor-pointer disabled:opacity-50"
            >
              Request Revision
            </button>

            <button
              onClick={() => handleAction('REJECT')}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-rose-500/10 text-rose-400 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              Decline
            </button>

            <button
              onClick={() => handleAction('ACCEPT')}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs shadow-lg shadow-[#248277]/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Accept Proposal</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        ) : (
          <span className="text-xs text-[#71717a]">Status: {proposal.status}</span>
        )}
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0d0d0d] border border-[#1f1f1f] rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <h4 className="font-extrabold text-base text-white">Request Proposal Revision</h4>
            <p className="text-xs text-[#a1a1aa]">
              Specify any deliverables, timelines, or scopes you would like adjusted. Your assigned partner will update the quotation accordingly.
            </p>

            <textarea
              rows={4}
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="e.g. Can we include 2 additional flyer variations and adjust the delivery deadline to next Friday?"
              className="w-full p-3 rounded-2xl bg-[#141414] border border-[#262626] text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#45bfae]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#a1a1aa] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAction('REVISE')}
                disabled={isSubmitting || !revisionNotes.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Revision Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

