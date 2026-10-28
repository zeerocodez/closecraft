'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { overrideQualificationAction } from '@/app/(saas)/qualification-actions';

interface QualificationReviewQueueProps {
  qualifications: any[];
}

export default function QualificationReviewQueue({
  qualifications,
}: QualificationReviewQueueProps) {
  const [filter, setFilter] = useState<'ALL' | 'PRIORITY' | 'POTENTIAL' | 'REVIEW_NEEDED' | 'CONTEXT_NEEDED' | 'MANAGED'>('ALL');
  const [selectedQual, setSelectedQual] = useState<any | null>(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [targetQualForOverride, setTargetQualForOverride] = useState<any | null>(null);

  // Override Form State
  const [overrideSoftwareFit, setOverrideSoftwareFit] = useState<string>('PRIORITY_SOFTWARE_FIT');
  const [overrideServiceRec, setOverrideServiceRec] = useState<string>('READY_FOR_SERVICE_REVIEW');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideEvidence, setOverrideEvidence] = useState<string>('');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = qualifications.filter((q) => {
    if (filter === 'PRIORITY') return q.softwareFit === 'PRIORITY_SOFTWARE_FIT';
    if (filter === 'POTENTIAL') return q.softwareFit === 'POTENTIAL_SOFTWARE_FIT';
    if (filter === 'CONTEXT_NEEDED') return q.softwareFit === 'NEEDS_MORE_CONTEXT';
    if (filter === 'REVIEW_NEEDED') {
      return (
        q.serviceRecommendation === 'WORKLOAD_OR_ECONOMICS_NEED_REVIEW' ||
        q.serviceRecommendation === 'BOUNDED_PILOT_RECOMMENDED'
      );
    }
    if (filter === 'MANAGED') {
      return q.primaryNeed === 'MANAGED_SALES_PRO' || q.primaryNeed === 'BOTH';
    }
    return true;
  });

  const handleOpenOverride = (q: any) => {
    setTargetQualForOverride(q);
    setOverrideSoftwareFit(q.softwareFit || 'PRIORITY_SOFTWARE_FIT');
    setOverrideServiceRec(q.serviceRecommendation || 'READY_FOR_SERVICE_REVIEW');
    setOverrideReason('');
    setOverrideEvidence('');
    setReviewerNotes(q.reviewerPrivateNotes || '');
    setActionError(null);
    setIsOverrideModalOpen(true);
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetQualForOverride) return;
    setIsSubmittingOverride(true);
    setActionError(null);

    try {
      await overrideQualificationAction({
        qualificationId: targetQualForOverride.id,
        newSoftwareFit: overrideSoftwareFit,
        newServiceRecommendation: overrideServiceRec,
        overrideReason,
        overrideEvidence,
        reviewerPrivateNotes: reviewerNotes,
      });

      setIsOverrideModalOpen(false);
      setTargetQualForOverride(null);
      window.location.reload();
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit override.');
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
        <div>
          <h3 className="font-heading font-semibold text-lg text-on-surface flex items-center gap-2">
            <Icon name="Compass" size={18} className="text-primary" />
            <span>Workspace Qualification Review Queue</span>
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Transparent explainable classifications. Review reported workload and document human overrides.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL', label: `All (${qualifications.length})` },
            { id: 'PRIORITY', label: 'Priority Software Fit' },
            { id: 'POTENTIAL', label: 'Potential Fit' },
            { id: 'REVIEW_NEEDED', label: 'Service Review Needed' },
            { id: 'CONTEXT_NEEDED', label: 'Context Needed' },
            { id: 'MANAGED', label: 'Managed Pro Requests' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 gap-3.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30 text-on-surface-variant text-xs">
            No qualification records matching your current filter.
          </div>
        ) : (
          filtered.map((q) => {
            const isPriority = q.softwareFit === 'PRIORITY_SOFTWARE_FIT';
            const isContextNeeded = q.softwareFit === 'NEEDS_MORE_CONTEXT';
            const isOverridden = !!q.overriddenAt;
            const difficulties: string[] = q.difficulties ? JSON.parse(q.difficulties) : [];

            return (
              <div
                key={q.id}
                className={`p-4 rounded-2xl bg-surface-container-low border transition-all space-y-3.5 ${
                  isPriority
                    ? 'border-primary/40 bg-primary/[0.02]'
                    : isContextNeeded
                      ? 'border-amber-500/30'
                      : 'border-outline-variant/30'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading font-bold text-base text-on-surface">
                      {q.organization?.name || 'Workspace'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-secondary border border-outline-variant/30">
                      Rules v{q.rulesVersion || '2026.1'}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                    {isOverridden && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Human Overridden
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedQual(q)}
                      className="px-3 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-highest"
                    >
                      Inspect Answers
                    </button>
                    <button
                      onClick={() => handleOpenOverride(q)}
                      className="px-3 py-1.5 rounded-xl bg-primary/20 text-primary border border-primary/30 text-xs font-bold hover:bg-primary hover:text-on-primary transition-all"
                    >
                      Override
                    </button>
                  </div>
                </div>

                {/* Classification Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant block uppercase font-mono">Software Fit</span>
                    <strong className="text-on-surface text-xs mt-0.5 block">
                      {q.softwareFit?.replace(/_/g, ' ') || 'UNASSESSED'}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant block uppercase font-mono">Service Recommendation</span>
                    <strong className="text-primary text-xs mt-0.5 block">
                      {q.serviceRecommendation?.replace(/_/g, ' ') || 'NONE'}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant block uppercase font-mono">Reported Workload</span>
                    <span className="text-xs text-on-surface font-medium mt-0.5 block">
                      {q.newEnquiries30dExact !== null ? `${q.newEnquiries30dExact} exact` : q.newEnquiries30dRange || 'Not sure'} enquiries / mo
                    </span>
                  </div>
                </div>

                {/* Rationale Snippet */}
                <div className="text-xs space-y-1">
                  <p className="text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">Classification Rationale: </strong>
                    {q.softwareFitReason}
                  </p>
                  {q.serviceRecommendationReason && (
                    <p className="text-on-surface-variant leading-relaxed">
                      <strong className="text-on-surface">Service Scoping: </strong>
                      {q.serviceRecommendationReason}
                    </p>
                  )}
                  {isOverridden && (
                    <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-200 text-[11px] mt-2">
                      <strong>Operator Override: </strong> {q.overrideReason} (Evidence: {q.overrideEvidence})
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inspect Answers Drawer / Modal */}
      {selectedQual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div>
                <h3 className="font-heading font-semibold text-lg text-on-surface">
                  Qualification Submission: {selectedQual.organization?.name}
                </h3>
                <span className="text-xs text-on-surface-variant font-mono">
                  Submitted {new Date(selectedQual.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedQual(null)}
                className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 space-y-1">
                <span className="font-bold text-on-surface">Primary Help Need:</span>
                <p className="text-on-surface-variant">{selectedQual.primaryNeed}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 space-y-1">
                  <span className="font-bold text-on-surface">30d New Enquiries:</span>
                  <p className="text-on-surface-variant font-mono">
                    {selectedQual.newEnquiries30dExact !== null ? `${selectedQual.newEnquiries30dExact} (Exact)` : `${selectedQual.newEnquiries30dRange} (Range)`}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 space-y-1">
                  <span className="font-bold text-on-surface">Older Pipeline:</span>
                  <p className="text-on-surface-variant font-mono">
                    {selectedQual.olderOpportunitiesCount !== null ? `${selectedQual.olderOpportunitiesCount} (Exact)` : `${selectedQual.olderOpportunitiesRange || '0'} (Range)`}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 space-y-1">
                <span className="font-bold text-on-surface">Who Follows Up & How Checked:</span>
                <p className="text-on-surface-variant">Owner: {selectedQual.whoFollowsUp || 'Unspecified'}</p>
                <p className="text-on-surface-variant">Tracking: {selectedQual.howFollowUpChecked}</p>
              </div>

              {selectedQual.forgottenEnquiryNarrative && (
                <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 space-y-1">
                  <span className="font-bold text-on-surface">Forgotten Enquiry Narrative:</span>
                  <p className="text-on-surface-variant italic">"{selectedQual.forgottenEnquiryNarrative}"</p>
                  {selectedQual.forgottenEnquiryAftermath && (
                    <p className="text-on-surface-variant"><strong>Aftermath:</strong> {selectedQual.forgottenEnquiryAftermath}</p>
                  )}
                </div>
              )}

              {selectedQual.estimatedContribution !== null && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <span className="font-bold text-emerald-400">Screened Economics:</span>
                  <p className="text-on-surface-variant">
                    Estimated Contribution: <strong>₦{selectedQual.estimatedContribution?.toLocaleString()}</strong> ({selectedQual.currency})
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    Total Cost: ₦{selectedQual.totalEngagementCost?.toLocaleString()} • Attributable Sales: {selectedQual.expectedAttributableSales}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-outline-variant/20">
              <button
                onClick={() => setSelectedQual(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-xs text-on-surface font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operator Override Modal */}
      {isOverrideModalOpen && targetQualForOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div>
                <h3 className="font-heading font-semibold text-lg text-on-surface">Record Human Override</h3>
                <p className="text-xs text-on-surface-variant">
                  Workspace: {targetQualForOverride.organization?.name} • Rules v{targetQualForOverride.rulesVersion}
                </p>
              </div>
              <button onClick={() => setIsOverrideModalOpen(false)} className="p-1.5 text-on-surface-variant hover:text-on-surface">
                <Icon name="X" size={18} />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs border border-rose-500/30">
                {actionError}
              </div>
            )}

            <form onSubmit={handleOverrideSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-on-surface block mb-1">Adjusted Software Fit</label>
                <select
                  value={overrideSoftwareFit}
                  onChange={(e) => setOverrideSoftwareFit(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/40 text-on-surface"
                >
                  <option value="PRIORITY_SOFTWARE_FIT">Priority Software Fit</option>
                  <option value="POTENTIAL_SOFTWARE_FIT">Potential Software Fit</option>
                  <option value="EXPLORE_SOFTWARE_FIT">Explore Software Fit</option>
                  <option value="NEEDS_MORE_CONTEXT">Needs More Context</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-on-surface block mb-1">Adjusted Service Recommendation</label>
                <select
                  value={overrideServiceRec}
                  onChange={(e) => setOverrideServiceRec(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/40 text-on-surface"
                >
                  <option value="READY_FOR_SERVICE_REVIEW">Ready for Service Review</option>
                  <option value="WORKLOAD_OR_ECONOMICS_NEED_REVIEW">Workload or Economics Need Review</option>
                  <option value="BOUNDED_PILOT_RECOMMENDED">Bounded Pilot Recommended</option>
                  <option value="ALTERNATIVE_SUPPORT_MAY_FIT">Alternative Support May Fit</option>
                  <option value="PREPARATION_REQUIRED">Preparation Required</option>
                  <option value="NOT_REQUESTED">Not Requested</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-on-surface block mb-1">Override Reason (Auditable justification) *</label>
                <textarea
                  rows={2}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why the automated classification is being adjusted..."
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/40 text-on-surface"
                />
              </div>

              <div>
                <label className="font-medium text-on-surface block mb-1">Supporting Evidence *</label>
                <input
                  type="text"
                  required
                  value={overrideEvidence}
                  onChange={(e) => setOverrideEvidence(e.target.value)}
                  placeholder="e.g. Discovery call confirmed active CRM backlog of 40 opportunities"
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/40 text-on-surface"
                />
              </div>

              <div>
                <label className="font-medium text-on-surface block mb-1">Private Operator Notes (Strictly internal)</label>
                <textarea
                  rows={2}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Internal notes visible only to authorised Closecraft operators..."
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/40 text-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-4 py-2 text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOverride}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmittingOverride ? 'Saving...' : 'Confirm Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
