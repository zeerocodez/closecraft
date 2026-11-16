'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock, ExternalLink, AlertCircle, RefreshCw, MessageSquare, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface MilestoneItem {
  id: string;
  serviceType: string;
  title: string;
  description?: string | null;
  sequenceOrder: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVISION' | 'APPROVED';
  proofUrl?: string | null;
  reviewNotes?: string | null;
  clientApproved: boolean;
  clientFeedback?: string | null;
  completedAt?: string | Date | null;
}

interface GrowthMilestonesTrackerProps {
  milestones: MilestoneItem[];
  isClientView?: boolean;
  onRefresh?: () => void;
}

export default function GrowthMilestonesTracker({
  milestones,
  isClientView = true,
  onRefresh,
}: GrowthMilestonesTrackerProps) {
  const router = useRouter();
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReview = async (milestoneId: string, action: 'APPROVE' | 'REQUEST_REVISION') => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/growth/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          feedback: action === 'REQUEST_REVISION' ? feedbackNotes : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to review milestone deliverable.');
      }

      setActiveMilestoneId(null);
      setFeedbackNotes('');
      if (onRefresh) onRefresh();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating milestone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!milestones || milestones.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-[#101010] border border-[#1f1f1f] text-center space-y-2">
        <Clock size={28} className="mx-auto text-[#71717a]" />
        <h4 className="text-sm font-bold text-white">No Delivery Milestones Scheduled Yet</h4>
        <p className="text-xs text-[#a1a1aa] max-w-sm mx-auto">
          Milestones will be initialized automatically upon proposal approval and initial payment verification.
        </p>
      </div>
    );
  }

  const approvedCount = milestones.filter((m) => m.status === 'APPROVED').length;
  const progressPercent = Math.round((approvedCount / milestones.length) * 100);

  return (
    <div className="rounded-3xl bg-[#101010] border border-[#1f1f1f] p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Header & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f1f1f]">
        <div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#248277]/20 text-[#45bfae] font-bold border border-[#248277]/40 uppercase tracking-wider">
            DELIVERY PIPELINE
          </span>
          <h3 className="text-xl font-extrabold text-white tracking-tight mt-1">
            Project Milestones &amp; Sign-Off
          </h3>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Review partner deliverables, inspect creative assets, and sign off on each milestone.
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-xs font-mono text-[#71717a]">COMPLETED</span>
          <p className="text-lg font-black font-mono text-white">
            {approvedCount} / {milestones.length} <span className="text-xs font-normal text-[#45bfae]">({progressPercent}%)</span>
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#248277] to-[#45bfae] transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Ordered Milestones List */}
      <div className="space-y-4">
        {milestones.map((ms, idx) => {
          const isApproved = ms.status === 'APPROVED';
          const isSubmitted = ms.status === 'SUBMITTED';
          const isRevision = ms.status === 'REVISION';
          const isInProgress = ms.status === 'IN_PROGRESS';

          return (
            <div
              key={ms.id || idx}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                isApproved
                  ? 'bg-[#080808] border-emerald-500/30'
                  : isSubmitted
                  ? 'bg-[#0d1614] border-[#248277]/50 shadow-lg shadow-[#248277]/5'
                  : 'bg-[#080808] border-[#1f1f1f]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#71717a]">
                      Step {ms.sequenceOrder}
                    </span>
                    <span className="text-sm font-bold text-white">{ms.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1a1a1a] text-[#a1a1aa]">
                      {ms.serviceType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {ms.description && (
                    <p className="text-xs text-[#a1a1aa] leading-relaxed">{ms.description}</p>
                  )}
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {isApproved ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/30 inline-flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      Approved
                    </span>
                  ) : isSubmitted ? (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30 inline-flex items-center gap-1.5">
                      <Clock size={13} />
                      Awaiting Your Review
                    </span>
                  ) : isRevision ? (
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[11px] border border-rose-500/30 inline-flex items-center gap-1.5">
                      <AlertCircle size={13} />
                      Revision In Progress
                    </span>
                  ) : isInProgress ? (
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[11px] border border-blue-500/30 inline-flex items-center gap-1.5">
                      <Clock size={13} />
                      In Progress
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-[#1a1a1a] text-[#71717a] font-bold text-[11px] border border-[#262626]">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Deliverable Proof Link & Notes */}
              {ms.proofUrl && (
                <div className="p-3 rounded-xl bg-[#141414] border border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[#71717a] block text-[11px]">DELIVERABLE PROOF</span>
                    <a
                      href={ms.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#45bfae] hover:underline font-semibold flex items-center gap-1 mt-0.5"
                    >
                      <span>Open Asset Link</span>
                      <ExternalLink size={12} />
                    </a>
                    {ms.reviewNotes && (
                      <p className="text-[#a1a1aa] mt-1 text-[11px]">
                        <span className="text-[#71717a]">Partner Note:</span> {ms.reviewNotes}
                      </p>
                    )}
                  </div>

                  {/* Client Review Actions */}
                  {isClientView && isSubmitted && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setActiveMilestoneId(ms.id)}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 rounded-xl bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#a1a1aa] hover:text-white font-medium text-xs transition-colors cursor-pointer"
                      >
                        Request Changes
                      </button>

                      <button
                        onClick={() => handleReview(ms.id, 'APPROVE')}
                        disabled={isSubmitting}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 size={13} />
                        <span>Sign Off &amp; Approve</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Revision feedback note display if in revision */}
              {ms.clientFeedback && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                  <MessageSquare size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Client Revision Feedback:</span> {ms.clientFeedback}
                  </div>
                </div>
              )}

              {/* Revision Feedback Modal Inline */}
              {activeMilestoneId === ms.id && (
                <div className="p-4 rounded-xl bg-[#141414] border border-[#2a2a2a] space-y-3 animate-in fade-in duration-150">
                  <label className="text-xs font-semibold text-white block">
                    Describe needed changes for "{ms.title}"
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="e.g. Please increase the headline contrast and adjust the CTA button color to match our brand teal."
                    className="w-full p-2.5 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a] text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#45bfae]"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setActiveMilestoneId(null)}
                      className="px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReview(ms.id, 'REQUEST_REVISION')}
                      disabled={isSubmitting || !feedbackNotes.trim()}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Send Revision Request'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

