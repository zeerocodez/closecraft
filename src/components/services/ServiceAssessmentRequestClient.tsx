'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { SERVICE_CATALOGUE, CatalogueServiceItem } from '@/lib/services/catalogue';
import { calculateCommercialSuitability } from '@/lib/pilot/pilotService';
import { submitSalesSupportRequest } from '@/app/(saas)/actions';

export default function ServiceAssessmentRequestClient({
  organizationName,
  userEmail,
}: {
  organizationName: string;
  userEmail: string;
}) {
  const [selectedServiceKey, setSelectedServiceKey] = useState<string>('MANAGED_SALES');
  
  // Section 7 Form State
  const [offerSummary, setOfferSummary] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [leadSources, setLeadSources] = useState('Inbound WhatsApp, Website forms, Referrals');
  const [enquiriesMonthly, setEnquiriesMonthly] = useState('40');
  const [qualifiedConversationsMonthly, setQualifiedConversationsMonthly] = useState('15');
  const [openOpportunities, setOpenOpportunities] = useState('8');
  const [dealValue, setDealValue] = useState('200000');
  const [grossMarginPct, setGrossMarginPct] = useState('60');
  const [currentFollowUp, setCurrentFollowUp] = useState('Ad-hoc manual follow-up when time permits');
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([
    'RESPONDING_ENQUIRIES',
    'FOLLOW_UP_STALLED',
    'APPOINTMENT_SETTING'
  ]);
  const [workingHours, setWorkingHours] = useState('9am - 5pm WAT, Monday - Friday');
  const [deliveryConstraints, setDeliveryConstraints] = useState('');
  const [decisionMaker, setDecisionMaker] = useState(userEmail);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeService = SERVICE_CATALOGUE.find(s => s.key === selectedServiceKey) || SERVICE_CATALOGUE[2];

  // Dynamic suitability computation
  const suitability = calculateCommercialSuitability({
    approxMonthlyEnquiries: parseInt(enquiriesMonthly, 10) || 0,
    approxMonthlyQualifiedConversations: parseInt(qualifiedConversationsMonthly, 10) || 0,
    approxOpenOpportunities: parseInt(openOpportunities, 10) || 0,
    typicalDealValue: parseFloat(dealValue) || 150000,
    grossProfitMarginPercent: parseFloat(grossMarginPct) || 50,
    serviceType: selectedServiceKey === 'EXTERNAL_CLOSING' ? 'SALES_CLOSING' : 'FULL_MANAGED_PILOT',
    proposedTotalCost: 150000,
  });

  const toggleNeed = (need: string) => {
    setSelectedNeeds(prev =>
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerSummary.trim()) {
      setErrorMessage('Please describe what your business sells and typical deliverables.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const volumeDescription = `${enquiriesMonthly} monthly enquiries, ${qualifiedConversationsMonthly} qualified conversations, ${openOpportunities} open opportunities`;
      const combinedNotes = JSON.stringify({
        selectedServiceKey,
        targetCustomer,
        leadSources,
        currentFollowUp,
        grossMarginPct,
        suitabilityRecommendedScope: suitability.recommendedServiceScope,
        deliveryConstraints,
      });

      await submitSalesSupportRequest({
        helpNeeded: selectedNeeds,
        offerSummary: offerSummary.trim(),
        recentEnquiryVolume: volumeDescription,
        targetAudience: targetCustomer.trim(),
        typicalDealValue: `₦${Number(dealValue).toLocaleString()}`,
        workingHoursRequired: workingHours.trim(),
        languageRequirements: 'English',
        currentDifficulties: currentFollowUp.trim(),
        authorizedDecisionMaker: decisionMaker.trim(),
        additionalNotes: combinedNotes,
      });

      setSubmittedSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-surface-container-low border border-outline-variant/40 rounded-2xl space-y-6 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
          <Icon name="CheckCircle2" size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-heading text-on-surface">Service Assessment Received</h2>
          <p className="text-sm text-on-surface-variant max-w-lg mx-auto">
            Your commercial assessment for <strong className="text-on-surface">{organizationName}</strong> has been stored and routed to Closecraft platform operations.
          </p>
        </div>

        <div className="p-4 bg-surface-container border border-outline-variant/30 rounded-xl text-left max-w-xl mx-auto space-y-2 text-xs">
          <div className="font-semibold text-on-surface flex items-center justify-between">
            <span>Assessment Summary</span>
            <span className="text-primary font-mono">{activeService.name}</span>
          </div>
          <div className="text-on-surface-variant">
            • Volume baseline: {enquiriesMonthly} raw enquiries, {qualifiedConversationsMonthly} qualified conversations/mo<br />
            • Screening recommendation: <span className="font-semibold text-on-surface">{suitability.recommendedServiceScope.replace(/_/g, ' ')}</span><br />
            • Commercial status: {suitability.screeningRationale}
          </div>
          <p className="text-[11px] text-amber-500/90 pt-1">
            Note: A submitted assessment does not start a paid engagement, allocate a professional, or create a charge. A formal scoped proposal will be prepared for authorized review.
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-2">
          <Link
            href="/sales-support"
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-fixed font-medium text-sm hover:opacity-90 transition-opacity"
          >
            View Engagements Dashboard
          </Link>
          <button
            onClick={() => setSubmittedSuccess(false)}
            className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface text-sm hover:bg-surface-container-high transition-colors"
          >
            Submit Another Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-outline-variant/30 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
            Sales Services
          </span>
          <span className="text-xs text-on-surface-variant">Workspace: {organizationName}</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-on-surface mt-2">
          Service Assessment & Scoping Journey
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Evaluate commercial suitability for sales execution, team training, or dedicated appointment setters and closers.
        </p>
      </div>

      {/* Service Selection Tabs */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          1. Select Desired Service Offer
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SERVICE_CATALOGUE.map((service) => {
            const isSelected = selectedServiceKey === service.key;
            return (
              <button
                key={service.key}
                type="button"
                onClick={() => setSelectedServiceKey(service.key)}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-outline-variant/40 hover:border-outline-variant bg-surface-container-lowest'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-semibold text-sm text-on-surface">{service.name}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    service.availability === 'AVAILABLE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {service.availability === 'AVAILABLE' ? 'Available' : 'Assessment Required'}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">
                  {service.description}
                </p>
                <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant font-mono">{service.pricingMethod.replace(/_/g, ' ')}</span>
                  <span className="text-primary font-medium">{service.currency}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Commercial Boundary Callout */}
      <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
          <Icon name="Info" size={16} className="text-primary" />
          <span>Metric Definitions & Commercial Screening Guidelines</span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          <strong>Raw Enquiry:</strong> Any incoming phone, email, or chat interaction before qualification.<br />
          <strong>Qualified Conversation:</strong> A prospect who meets your ICP, has budget/need, and engaged in discovery.<br />
          <strong>Internal Guideline:</strong> Dedicated closing support requires around <strong>20+ qualified conversations per month</strong>. Workspaces with lower volumes are routed to appointment setting or bounded part-time follow-up support to prevent unviable commitments.
        </p>
      </div>

      {/* Main Assessment Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-surface-container-lowest border border-outline-variant/40 p-6 rounded-2xl">
        <div className="text-sm font-bold text-on-surface border-b border-outline-variant/30 pb-2">
          2. Business Diagnostics & Commercial Context
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center gap-2">
            <Icon name="AlertCircle" size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-on-surface">
              What does your business sell and what are your deliverables? *
            </label>
            <textarea
              required
              rows={3}
              value={offerSummary}
              onChange={(e) => setOfferSummary(e.target.value)}
              placeholder="e.g. Enterprise B2B SaaS for logistics, average contract value $10k/yr, deliver onboarding in 2 weeks..."
              className="w-full text-xs p-3 rounded-lg bg-surface border border-outline-variant text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">Target Customer Profile (ICP)</label>
            <input
              type="text"
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              placeholder="e.g. Mid-sized distribution companies in West Africa"
              className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">Current Inbound Lead Sources</label>
            <input
              type="text"
              value={leadSources}
              onChange={(e) => setLeadSources(e.target.value)}
              placeholder="e.g. Meta Ads, Google search, WhatsApp direct, Referrals"
              className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Approximate Monthly Raw Enquiries (Phone, WhatsApp, Web)
            </label>
            <input
              type="number"
              min="0"
              value={enquiriesMonthly}
              onChange={(e) => setEnquiriesMonthly(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Approximate Monthly Qualified Conversations
            </label>
            <input
              type="number"
              min="0"
              value={qualifiedConversationsMonthly}
              onChange={(e) => setQualifiedConversationsMonthly(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">Currently Open Opportunities in Pipeline</label>
            <input
              type="number"
              min="0"
              value={openOpportunities}
              onChange={(e) => setOpenOpportunities(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">Typical Deal Value (NGN)</label>
            <input
              type="number"
              min="0"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">Estimated Gross Margin %</label>
            <input
              type="number"
              min="1"
              max="100"
              value={grossMarginPct}
              onChange={(e) => setGrossMarginPct(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">Current Follow-up Arrangement</label>
            <input
              type="text"
              value={currentFollowUp}
              onChange={(e) => setCurrentFollowUp(e.target.value)}
              placeholder="e.g. Founder handles follow-up when not in meetings"
              className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Support Needed Checkboxes */}
        <div className="space-y-2 pt-2 border-t border-outline-variant/30">
          <label className="text-xs font-semibold text-on-surface">Required Execution Scope (Select all that apply)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { id: 'RESPONDING_ENQUIRIES', label: 'Inbound enquiry response within 1 hour SLA' },
              { id: 'FOLLOW_UP_STALLED', label: 'Multi-touch follow-up on stalled deals' },
              { id: 'APPOINTMENT_SETTING', label: 'Calendar qualification and discovery setting' },
              { id: 'SALES_CLOSING', label: 'Live sales closing calls and negotiation' },
              { id: 'TEAM_TRAINING', label: 'Cohort training for internal sales team members' },
            ].map(item => (
              <label
                key={item.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-outline-variant/30 cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedNeeds.includes(item.id)}
                  onChange={() => toggleNeed(item.id)}
                  className="rounded text-primary focus:ring-0"
                />
                <span className="text-on-surface">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Working Hours & Decision Maker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-outline-variant/30">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">Desired Working Hours & Time Zone</label>
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">Authorized Commercial Decision-Maker</label>
            <input
              type="text"
              value={decisionMaker}
              onChange={(e) => setDecisionMaker(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Real-time Commercial Suitability Review */}
        <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-on-surface">
            <span>Automated Suitability Review</span>
            <span className="text-primary font-mono">{suitability.recommendedServiceScope.replace(/_/g, ' ')}</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            {suitability.screeningRationale}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono border-t border-outline-variant/20">
            <div>
              <span className="text-on-surface-variant block">Enquiries/Mo</span>
              <span className="font-semibold text-on-surface">{enquiriesMonthly}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block">Qualified Convs</span>
              <span className={`font-semibold ${suitability.qualifiedConversationsGuidelineMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                {qualifiedConversationsMonthly} {suitability.qualifiedConversationsGuidelineMet ? '(Meets 20/mo)' : '(<20/mo guideline)'}
              </span>
            </div>
            <div>
              <span className="text-on-surface-variant block">Projected Margin</span>
              <span className="font-semibold text-on-surface">₦{suitability.projectedGrossProfit.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block">Net Attributable</span>
              <span className={`font-semibold ${suitability.isCommerciallyPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
                ₦{suitability.netAttributableReturn.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-on-surface-variant">
            Submitting records this assessment. No automatic checkout or obligation is created.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary text-primary-fixed font-medium text-xs hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin" />
                <span>Submitting Assessment...</span>
              </>
            ) : (
              <span>Submit Service Assessment &rarr;</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
