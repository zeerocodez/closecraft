'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import {
  submitSalesSupportRequest,
  acceptPilotTermsAction,
  createBachsCheckoutAction,
  logPilotEffort,
  resolveBlockerAction,
} from '@/app/(saas)/actions';

interface SupportRequestData {
  id: string;
  status: string;
  helpNeeded: string;
  offerSummary: string;
  recentEnquiryVolume: string;
  targetAudience?: string | null;
  typicalDealValue?: string | null;
  workingHoursRequired?: string | null;
  languageRequirements?: string | null;
  currentDifficulties?: string | null;
  authorizedDecisionMaker?: string | null;
  createdAt: Date | string;
  assessment?: {
    id: string;
    outcome: string;
    factualNotes?: string | null;
    checklist?: Array<{
      id: string;
      title: string;
      owner: string;
      isCompleted: boolean;
    }>;
  } | null;
}

interface EngagementData {
  id: string;
  title: string;
  status: string;
  offerRepresented: string;
  activitiesIncluded: string;
  activitiesExcluded: string;
  capacityUnit: string;
  agreedCapacity: number;
  usedCapacity: number;
  isOverCapacity: boolean;
  workingDays: string;
  responseWindows: string;
  communicationChannels: string;
  reviewSchedule: string;
  requiredClientInputs: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  clientServicePrice: number;
  currency: string;
  termsVersion: number;
  termsAcceptedAt?: Date | string | null;
  isTermsAccepted: boolean;
  isPaymentVerified: boolean;
  isMaterialsProvided: boolean;
  isProfessionalApproved: boolean;
  isClientReadinessApproved: boolean;
  professional?: {
    id: string;
    fullName: string;
    experienceSummary?: string | null;
    languages: string[];
  } | null;
  workLogs: Array<{
    id: string;
    date: Date | string;
    hoursSpent: number;
    activityDescription: string;
    leadsWorkedCount: number;
    actorRole: string;
  }>;
  blockers: Array<{
    id: string;
    whatIsNeeded: string;
    whoMustRespond: string;
    requiredResponseDate: Date | string;
    status: string;
  }>;
  handovers: Array<{
    id: string;
    type: string;
    agreedScope?: string | null;
    openTasksSummary?: string | null;
    clientAcknowledged: boolean;
    clientAcknowledgedAt?: Date | string | null;
  }>;
}

export default function SalesSupportClient({
  request,
  engagement,
  isOwnerOrAdmin,
}: {
  request: SupportRequestData | null;
  engagement: EngagementData | null;
  isOwnerOrAdmin: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'request' | 'proposal' | 'worklogs' | 'blockers' | 'handover'>(
    engagement ? 'overview' : 'request'
  );

  // Request form state
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(['RESPONDING_ENQUIRIES', 'FOLLOW_UP']);
  const [offerSummary, setOfferSummary] = useState('');
  const [volume, setVolume] = useState('10 - 25 enquiries per week');
  const [targetAudience, setTargetAudience] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [hours, setHours] = useState('9am - 5pm WAT, Mon - Fri');
  const [languages, setLanguages] = useState('English');
  const [difficulties, setDifficulties] = useState('');
  const [approver, setApprover] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Proposal acceptance state
  const [isAcceptingTerms, setIsAcceptingTerms] = useState(false);
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);

  // Work log state
  const [logHours, setLogHours] = useState('2.0');
  const [logActivity, setLogActivity] = useState('');
  const [logLeads, setLogLeads] = useState('5');
  const [isLoggingEffort, setIsLoggingEffort] = useState(false);

  const toggleNeed = (need: string) => {
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerSummary.trim()) {
      alert('Please describe your offer and typical deliverables.');
      return;
    }

    setIsSubmittingRequest(true);
    try {
      await submitSalesSupportRequest({
        helpNeeded: selectedNeeds,
        offerSummary,
        recentEnquiryVolume: volume,
        targetAudience,
        typicalDealValue: dealValue,
        workingHoursRequired: hours,
        languageRequirements: languages,
        currentDifficulties: difficulties,
        authorizedDecisionMaker: approver,
      });

      alert('Your request for sales support has been submitted. Closecraft operators will review your readiness and prepare a tailored proposal.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleAcceptTerms = async () => {
    if (!engagement) return;
    if (!confirm('Accept this 30-day scoped pilot proposal and commercial terms? This creates an immutable acceptance record.')) return;

    setIsAcceptingTerms(true);
    try {
      const termsSnapshot = `Proposal: ${engagement.title}\nOffer: ${engagement.offerRepresented}\nCapacity: ${engagement.agreedCapacity} ${engagement.capacityUnit}\nPrice: ${engagement.currency} ${engagement.clientServicePrice.toLocaleString()}\nTerms Version: ${engagement.termsVersion}`;
      await acceptPilotTermsAction(engagement.id, termsSnapshot);
      alert('Commercial terms accepted.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to accept terms');
    } finally {
      setIsAcceptingTerms(false);
    }
  };

  const handlePayPilotInvoice = async () => {
    if (!engagement) return;
    setIsRedirectingToCheckout(true);

    try {
      const res = await createBachsCheckoutAction({
        type: 'PILOT_ENGAGEMENT',
        amount: engagement.clientServicePrice,
        currency: engagement.currency,
        engagementId: engagement.id,
        successUrl: window.location.origin + '/sales-support?payment=success',
        cancelUrl: window.location.origin + '/sales-support?payment=cancelled',
      });

      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        alert('Checkout URL not returned.');
      }
    } catch (err: any) {
      alert(err.message || 'Checkout creation failed');
      setIsRedirectingToCheckout(false);
    }
  };

  const handleLogEffortSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!engagement) return;
    setIsLoggingEffort(true);

    try {
      await logPilotEffort({
        engagementId: engagement.id,
        hoursSpent: parseFloat(logHours),
        activityDescription: logActivity,
        leadsWorkedCount: parseInt(logLeads, 10) || 0,
      });

      setLogActivity('');
      alert('Work effort logged successfully.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to log effort');
    } finally {
      setIsLoggingEffort(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-on-surface">Sales Support</h1>
            <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-medium">
              Closecraft Follow-up Pilot
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Keep customer enquiries organised and get professional help working your sales opportunities.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/20 pb-2">
        {engagement && (
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary-container text-primary-fixed'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Icon name="Activity" size={16} />
            <span>Pilot Overview</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('request')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'request'
              ? 'bg-primary-container text-primary-fixed'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <Icon name="HeartHandshake" size={16} />
          <span>Support Request</span>
          {request && (
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-surface-container-highest">
              {request.status}
            </span>
          )}
        </button>

        {engagement && (
          <>
            <button
              onClick={() => setActiveTab('proposal')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'proposal'
                  ? 'bg-primary-container text-primary-fixed'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Icon name="FileText" size={16} />
              <span>Scope & Terms</span>
              {!engagement.isTermsAccepted && (
                <span className="text-xs px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200">
                  Pending Acceptance
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('worklogs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'worklogs'
                  ? 'bg-primary-container text-primary-fixed'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Icon name="Clock" size={16} />
              <span>Work Logs & Capacity</span>
              {engagement.isOverCapacity && (
                <span className="text-xs px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-200">
                  Allowance Reached
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('blockers')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'blockers'
                  ? 'bg-primary-container text-primary-fixed'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Icon name="AlertCircle" size={16} />
              <span>Client Blockers</span>
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-surface-container-highest">
                {engagement.blockers.filter((b) => b.status === 'OPEN').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('handover')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'handover'
                  ? 'bg-primary-container text-primary-fixed'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Icon name="ArrowRightLeft" size={16} />
              <span>Continuity & Handover</span>
            </button>
          </>
        )}
      </div>

      {/* Tab 1: Pilot Overview */}
      {activeTab === 'overview' && engagement && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/20 text-primary uppercase tracking-wider">
                  Engagement Status: {engagement.status}
                </span>
                <h2 className="font-heading text-xl font-bold text-on-surface mt-2">{engagement.title}</h2>
                <p className="text-sm text-on-surface-variant">Representing: {engagement.offerRepresented}</p>
              </div>

              <div className="flex items-center gap-3">
                {!engagement.isPaymentVerified && engagement.isTermsAccepted && (
                  <button
                    onClick={handlePayPilotInvoice}
                    disabled={isRedirectingToCheckout}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-sm"
                  >
                    <Icon name="CreditCard" size={16} />
                    <span>{isRedirectingToCheckout ? 'Loading Bachs...' : `Pay Invoice (${engagement.currency} ${engagement.clientServicePrice.toLocaleString()})`}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="pt-4 border-t border-outline-variant/20 space-y-2">
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span>
                  Agreed Working Capacity ({engagement.capacityUnit}):{' '}
                  <strong className="text-on-surface">{engagement.usedCapacity.toFixed(1)} / {engagement.agreedCapacity.toFixed(1)} {engagement.capacityUnit}</strong>
                </span>
                <span>
                  {Math.round((engagement.usedCapacity / engagement.agreedCapacity) * 100)}% used
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    engagement.isOverCapacity ? 'bg-rose-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((engagement.usedCapacity / engagement.agreedCapacity) * 100))}%` }}
                />
              </div>
              {engagement.isOverCapacity && (
                <p className="text-xs text-rose-300 font-medium mt-1">
                  Agreed working-hour allowance reached. Reprioritisation or revised scope can be agreed with your operator without surprise overage charges.
                </p>
              )}
            </div>

            {/* Key Service Boundaries */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-outline-variant/20 text-xs">
              <div>
                <span className="text-on-surface-variant">Coverage Days:</span>
                <p className="font-medium text-on-surface mt-0.5">{engagement.workingDays}</p>
              </div>
              <div>
                <span className="text-on-surface-variant">Response Windows:</span>
                <p className="font-medium text-on-surface mt-0.5">{engagement.responseWindows}</p>
              </div>
              <div>
                <span className="text-on-surface-variant">Review Schedule:</span>
                <p className="font-medium text-on-surface mt-0.5">{engagement.reviewSchedule}</p>
              </div>
            </div>
          </div>

          {/* Assigned Professional Card */}
          {engagement.professional && (
            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Icon name="UserCheck" size={24} className="text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-semibold text-base text-on-surface">{engagement.professional.fullName}</h3>
                  <span className="text-[11px] px-2 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-medium">
                    Offer-Ready & Vetted
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">{engagement.professional.experienceSummary}</p>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant pt-1">
                  <span>Languages: <strong className="text-on-surface">{engagement.professional.languages.join(', ')}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Support Request Form */}
      {activeTab === 'request' && (
        <div className="space-y-6">
          {request && (
            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/20 text-primary">
                    REQUEST SUBMITTED
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {request.assessment && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                    Readiness: {request.assessment.outcome}
                  </span>
                )}
              </div>

              <p className="text-sm font-medium text-on-surface">Offer: {request.offerSummary}</p>

              {request.assessment?.factualNotes && (
                <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs text-on-surface space-y-1">
                  <span className="font-semibold text-primary">Operator Assessment Summary:</span>
                  <p>{request.assessment.factualNotes}</p>
                </div>
              )}

              {request.assessment?.checklist && request.assessment.checklist.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                  <span className="text-xs font-semibold text-on-surface">Preparation Checklist:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {request.assessment.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-high">
                        <Icon
                          name={item.isCompleted ? 'CheckCircle2' : 'Circle'}
                          size={14}
                          className={item.isCompleted ? 'text-emerald-400' : 'text-on-surface-variant'}
                        />
                        <span className={item.isCompleted ? 'line-through text-on-surface-variant' : 'text-on-surface'}>
                          {item.title} ({item.owner})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-5">
            <div>
              <h2 className="font-heading text-lg font-bold text-on-surface">Request Sales Support</h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Tell us about your offer and current sales bottleneck. Submitting a request does not commit you to payment; an operator will review your readiness and provide an agreed proposal.
              </p>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-2">Where do you need professional help? *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'RESPONDING_ENQUIRIES', label: 'Responding promptly to new enquiries' },
                    { id: 'QUALIFICATION_APPOINTMENTS', label: 'Qualification & booking meetings' },
                    { id: 'SALES_CONVERSATIONS', label: 'Holding discovery and sales calls' },
                    { id: 'FOLLOW_UP', label: 'Consistent follow-up on stalled deals' },
                    { id: 'PROBLEM_ASSESSMENT', label: 'Assessing why enquiries are not closing' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      onClick={() => toggleNeed(opt.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                        selectedNeeds.includes(opt.id)
                          ? 'border-primary bg-primary/10 text-on-surface'
                          : 'border-outline-variant/40 hover:bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedNeeds.includes(opt.id)}
                        onChange={() => {}}
                        className="rounded border-outline-variant text-primary"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Describe the offer being represented *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Bespoke Shopify development & growth retainer for DTC brands, priced from ₦750,000..."
                  value={offerSummary}
                  onChange={(e) => setOfferSummary(e.target.value)}
                  className="w-full bg-surface-container-high px-3.5 py-2.5 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Recent Enquiry Volume</label>
                  <input
                    type="text"
                    placeholder="e.g. 5-15 enquiries/week"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Typical Deal Value</label>
                  <input
                    type="text"
                    placeholder="e.g. ₦500,000 - ₦2,000,000"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Coverage Hours Required</label>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Language Requirements</label>
                  <input
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Current Difficulties (Why are enquiries slipping?)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Founders are busy delivering client projects so follow-ups take 3+ days..."
                  value={difficulties}
                  onChange={(e) => setDifficulties(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Authorized Decision-Maker for Approvals</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe (Founder / Managing Director)"
                  value={approver}
                  onChange={(e) => setApprover(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="px-5 py-2.5 rounded-xl font-medium text-sm bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                >
                  {isSubmittingRequest ? 'Submitting...' : 'Submit Support Request for Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Proposal, Scope & Terms */}
      {activeTab === 'proposal' && engagement && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/20 text-primary">
                  TERMS VERSION {engagement.termsVersion}
                </span>
                <h2 className="font-heading text-xl font-bold text-on-surface mt-2">{engagement.title}</h2>
                <p className="text-xs text-on-surface-variant">Term: 30 days managed engagement (distinct from software billing).</p>
              </div>

              <div>
                {engagement.isTermsAccepted ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                    <Icon name="CheckCircle2" size={14} />
                    <span>Accepted on {new Date(engagement.termsAcceptedAt!).toLocaleDateString()}</span>
                  </div>
                ) : (
                  isOwnerOrAdmin && (
                    <button
                      onClick={handleAcceptTerms}
                      disabled={isAcceptingTerms}
                      className="px-4 py-2 bg-primary text-on-primary font-medium text-sm rounded-xl hover:opacity-90 shadow-sm"
                    >
                      {isAcceptingTerms ? 'Recording...' : 'Accept Proposal & Terms'}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Scope Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20">
              <div className="p-4 rounded-xl bg-surface-container-high space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="Check" size={14} />
                  <span>Activities Included</span>
                </h4>
                <ul className="text-xs text-on-surface space-y-1 list-disc list-inside">
                  {JSON.parse(engagement.activitiesIncluded || '[]').map((act: string, idx: number) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-high space-y-2">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="X" size={14} />
                  <span>Activities Excluded</span>
                </h4>
                <ul className="text-xs text-on-surface space-y-1 list-disc list-inside">
                  {JSON.parse(engagement.activitiesExcluded || '[]').map((act: string, idx: number) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Service Specifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-outline-variant/20">
              <div>
                <span className="text-on-surface-variant">Working-Hour Capacity:</span>
                <p className="font-semibold text-on-surface mt-0.5">{engagement.agreedCapacity} {engagement.capacityUnit} over 30 days</p>
              </div>
              <div>
                <span className="text-on-surface-variant">Commercial Price:</span>
                <p className="font-semibold text-emerald-400 mt-0.5">{engagement.currency} {engagement.clientServicePrice.toLocaleString()} (All-inclusive fixed quote)</p>
              </div>
              <div>
                <span className="text-on-surface-variant">Communication Channels:</span>
                <p className="font-semibold text-on-surface mt-0.5">{engagement.communicationChannels}</p>
              </div>
              <div>
                <span className="text-on-surface-variant">Required Client Inputs:</span>
                <p className="font-semibold text-on-surface mt-0.5">{engagement.requiredClientInputs || 'Approved price list, objection guide, team point of contact'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Work Effort Logs */}
      {activeTab === 'worklogs' && engagement && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
            <h3 className="font-heading font-semibold text-base text-on-surface">Log Pilot Effort</h3>
            <p className="text-xs text-on-surface-variant">
              Effort logs are used for capacity planning and cost review—not continuous screen surveillance.
            </p>

            <form onSubmit={handleLogEffortSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Hours Spent</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={logHours}
                    onChange={(e) => setLogHours(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-1.5 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Opportunities Worked</label>
                  <input
                    type="number"
                    value={logLeads}
                    onChange={(e) => setLogLeads(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-1.5 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Activity Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Followed up 5 stalled WhatsApp leads"
                    value={logActivity}
                    onChange={(e) => setLogActivity(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-1.5 rounded-xl text-sm border border-outline-variant/40 text-on-surface"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoggingEffort}
                className="px-4 py-2 bg-primary text-on-primary font-medium text-xs rounded-xl hover:opacity-90"
              >
                {isLoggingEffort ? 'Saving...' : 'Record Log'}
              </button>
            </form>
          </div>

          {/* Past logs */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Activity History</h4>
            {engagement.workLogs.length === 0 ? (
              <p className="text-xs text-on-surface-variant">No work effort logged yet.</p>
            ) : (
              engagement.workLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-on-surface">{log.activityDescription}</span>
                    <span className="text-on-surface-variant ml-2">({log.leadsWorkedCount} leads worked)</span>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{new Date(log.date).toLocaleDateString()} • {log.actorRole}</p>
                  </div>
                  <span className="font-bold text-primary">{log.hoursSpent} hrs</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Client Blockers */}
      {activeTab === 'blockers' && engagement && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-base text-on-surface">Client Blockers</h3>
            <span className="text-xs text-on-surface-variant">Tracks dependencies without pausing whole engagement</span>
          </div>

          {engagement.blockers.length === 0 ? (
            <p className="text-xs text-on-surface-variant">No client blockers reported.</p>
          ) : (
            engagement.blockers.map((b) => (
              <div key={b.id} className="p-4 rounded-xl bg-surface-container-low border border-amber-500/30 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-on-surface">{b.whatIsNeeded}</span>
                  <p className="text-on-surface-variant">Must respond: <strong className="text-on-surface">{b.whoMustRespond}</strong> • Deadline: {new Date(b.requiredResponseDate).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${b.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {b.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 6: Continuity & Handover */}
      {activeTab === 'handover' && engagement && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <h3 className="font-heading font-semibold text-base text-on-surface">Continuity and Handover Workflow</h3>
            <p className="text-xs text-on-surface-variant">
              When an engagement concludes, open tasks and buyer commitments are compiled, temporary responsibility is assigned, and external professional access is safely revoked while preserving history.
            </p>

            {engagement.handovers.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic">No handover initiated yet.</p>
            ) : (
              engagement.handovers.map((h) => (
                <div key={h.id} className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-on-surface">{h.type}</span>
                    <span className={`px-2 py-0.5 rounded-md font-medium ${h.clientAcknowledged ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {h.clientAcknowledged ? 'Client Acknowledged' : 'Pending Acknowledgement'}
                    </span>
                  </div>
                  {h.agreedScope && <p className="text-on-surface">Scope: {h.agreedScope}</p>}
                  {h.openTasksSummary && <p className="text-on-surface-variant">Open Tasks: {h.openTasksSummary}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
