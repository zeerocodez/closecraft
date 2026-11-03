'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Sparkles, Target, Users, ShieldCheck, HelpCircle } from 'lucide-react';

export interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrack?: 'LEAD_GENERATION' | 'SOFTWARE_FOLLOWUP' | 'TEAM_TRAINING' | 'MANAGED_SALES';
}

type ServiceTrack = 'LEAD_GENERATION' | 'SOFTWARE_FOLLOWUP' | 'TEAM_TRAINING' | 'MANAGED_SALES';

export default function FindRightSupportModal({ isOpen, onClose, initialTrack }: DiagnosticModalProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedTrack, setSelectedTrack] = useState<ServiceTrack>(initialTrack || 'LEAD_GENERATION');
  
  // Track-specific questions
  const [leadGenAnswers, setLeadGenAnswers] = useState({
    offerValidation: 'Yes, we have paying customers',
    adBudget: '$300 – $1,000 (₦300k – ₦1.5m)',
    responseOwner: 'Internal team ready within 1 hour',
    grossProfitPerSale: '₦50,000 – ₦250,000 ($50 – $250)',
  });

  const [softwareAnswers, setSoftwareAnswers] = useState({
    monthlyVolume: '20 to 100 per month',
    stalledBacklog: 'Yes, dozens or hundreds of stalled leads',
    followupOwner: 'Dedicated sales rep',
    verificationMethod: 'Spreadsheets or manual notes',
  });

  const [trainingAnswers, setTrainingAnswers] = useState({
    teamSize: '1 to 3 representatives',
    struggleArea: 'Handling objections & resistance',
    salesType: 'Inbound enquiries',
  });

  const [managedAnswers, setManagedAnswers] = useState({
    workType: 'Appointment setting from incoming enquiries',
    monthlyVolume: '20 to 50 per month',
    pricingReadiness: 'Yes, clear commercial terms & active sponsor',
  });

  // Contact form
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    hpField: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    reference: string;
    serviceType: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo.name || !contactInfo.email) {
      setSubmissionError('Please provide your name and email address.');
      return;
    }

    setSubmitting(true);
    setSubmissionError(null);

    let answers: Record<string, any> = {};
    if (selectedTrack === 'LEAD_GENERATION') answers = leadGenAnswers;
    if (selectedTrack === 'SOFTWARE_FOLLOWUP') answers = softwareAnswers;
    if (selectedTrack === 'TEAM_TRAINING') answers = trainingAnswers;
    if (selectedTrack === 'MANAGED_SALES') answers = managedAnswers;

    try {
      const res = await fetch('/api/services/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: contactInfo.name,
          contactEmail: contactInfo.email,
          contactPhone: contactInfo.phone || null,
          companyName: contactInfo.company || null,
          serviceType: selectedTrack,
          answers,
          sourceAttribution: 'Interactive Assessment Modal',
          hpField: contactInfo.hpField || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit service request.');
      }

      setSubmissionResult({
        reference: data.reference,
        serviceType: selectedTrack,
      });
      setStep(4);
    } catch (err: any) {
      setSubmissionError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAssessment = () => {
    setStep(1);
    setSubmissionResult(null);
    setSubmissionError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-[#0B1117] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#8A9CAE] hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#248277]/20 border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} />
            <span>FIND THE RIGHT SUPPORT</span>
          </div>
          <h2 id="modal-title" className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            {step === 4 ? 'Your Tailored Recommendation' : 'Find the right sales support for your business'}
          </h2>
          <p className="text-xs sm:text-sm text-[#8A9CAE] mt-1">
            {step === 4
              ? 'Based on your operational readiness, here is your practical starting point.'
              : 'Answer a few quick questions to identify the best starting point for your sales goals.'}
          </p>
        </div>

        {/* Progress Bar (steps 1 - 3) */}
        {step < 4 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#8A9CAE]">
              <span>Step {step} of 3</span>
              <span>
                {step === 1 && 'Primary Goal'}
                {step === 2 && 'Operational Context'}
                {step === 3 && 'Contact Details'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#248277] transition-all duration-300 rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Choose Primary Goal */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-white">
              What do you want to improve first?
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTrack('LEAD_GENERATION')}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedTrack === 'LEAD_GENERATION'
                    ? 'bg-[#248277]/20 border-[#248277] ring-1 ring-[#248277]'
                    : 'bg-[#111C26] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="p-2 rounded-xl bg-[#248277]/20 text-[#45bfae] shrink-0 mt-0.5">
                  <Target size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">We need help generating leads</h4>
                  <p className="text-xs text-[#8A9CAE] mt-1 leading-relaxed">
                    Attract relevant customer enquiries through managed Facebook and Instagram advertising campaigns.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTrack('SOFTWARE_FOLLOWUP')}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedTrack === 'SOFTWARE_FOLLOWUP'
                    ? 'bg-[#248277]/20 border-[#248277] ring-1 ring-[#248277]'
                    : 'bg-[#111C26] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="p-2 rounded-xl bg-[#248277]/20 text-[#45bfae] shrink-0 mt-0.5">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">We already have leads, but lose them to slow follow-up</h4>
                  <p className="text-xs text-[#8A9CAE] mt-1 leading-relaxed">
                    Organise existing enquiries, assign clear follow-up owners, and track what happens with Closecraft software.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTrack('TEAM_TRAINING')}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedTrack === 'TEAM_TRAINING'
                    ? 'bg-[#248277]/20 border-[#248277] ring-1 ring-[#248277]'
                    : 'bg-[#111C26] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="p-2 rounded-xl bg-[#248277]/20 text-[#45bfae] shrink-0 mt-0.5">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Our team needs better sales and objection-handling skills</h4>
                  <p className="text-xs text-[#8A9CAE] mt-1 leading-relaxed">
                    Practical, cohort-based training for your sales reps through Digital Sales School curriculum and live drills.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTrack('MANAGED_SALES')}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedTrack === 'MANAGED_SALES'
                    ? 'bg-[#248277]/20 border-[#248277] ring-1 ring-[#248277]'
                    : 'bg-[#111C26] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="p-2 rounded-xl bg-[#248277]/20 text-[#45bfae] shrink-0 mt-0.5">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">We need external sales reps or appointment setters</h4>
                  <p className="text-xs text-[#8A9CAE] mt-1 leading-relaxed">
                    Scoped managed sales support or verified external SDRs/closers to work directly on your pipeline.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-sm inline-flex items-center gap-2 shadow-lg transition-all"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Branch Specific Questions */}
        {step === 2 && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Branch A: Lead Gen */}
            {selectedTrack === 'LEAD_GENERATION' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Have you verified this offer with paying customers before? *
                  </label>
                  <select
                    value={leadGenAnswers.offerValidation}
                    onChange={(e) => setLeadGenAnswers({ ...leadGenAnswers, offerValidation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="Yes, we have paying customers">Yes, we have paying customers</option>
                    <option value="In validation stage (some initial buyers)">In validation stage (some initial buyers)</option>
                    <option value="Brand new untested offer">Brand new untested offer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    What is your approximate monthly advertising budget? *
                  </label>
                  <p className="text-[11px] text-[#8A9CAE] mb-1">
                    Advertising budget is paid directly to Meta through your own ad account.
                  </p>
                  <select
                    value={leadGenAnswers.adBudget}
                    onChange={(e) => setLeadGenAnswers({ ...leadGenAnswers, adBudget: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="$300 – $1,000 (₦300k – ₦1.5m)">$300 – $1,000 (₦300k – ₦1.5m)</option>
                    <option value="Over $1,000 (₦1.5m+)">Over $1,000 (₦1.5m+)</option>
                    <option value="Under $300 (₦300k)">Under $300 (₦300k)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Who will respond to incoming enquiries? *
                  </label>
                  <select
                    value={leadGenAnswers.responseOwner}
                    onChange={(e) => setLeadGenAnswers({ ...leadGenAnswers, responseOwner: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="Internal team ready within 1 hour">Internal team ready within 1 hour</option>
                    <option value="We need Closecraft external sales support">We need Closecraft external sales support</option>
                    <option value="Unsure / looking for guidance">Unsure / looking for guidance</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-white">
                      What is your typical gross profit per sale? *
                    </label>
                  </div>
                  <p className="text-[11px] text-[#8A9CAE] mb-1.5 flex items-center gap-1">
                    <HelpCircle size={12} className="text-[#45bfae]" />
                    <span>What remains after the direct cost of delivering the sale, before advertising and overheads.</span>
                  </p>
                  <select
                    value={leadGenAnswers.grossProfitPerSale}
                    onChange={(e) => setLeadGenAnswers({ ...leadGenAnswers, grossProfitPerSale: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="₦50,000 – ₦250,000 ($50 – $250)">₦50,000 – ₦250,000 ($50 – $250)</option>
                    <option value="₦250,000 – ₦1,000,000+ ($250 – $1,000+)">₦250,000 – ₦1,000,000+ ($250 – $1,000+)</option>
                    <option value="Under ₦50,000 ($50)">Under ₦50,000 ($50)</option>
                    <option value="I don't know">I don't know</option>
                  </select>
                </div>
              </div>
            )}

            {/* Branch B: Software Follow-up */}
            {selectedTrack === 'SOFTWARE_FOLLOWUP' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Approximately how many enquiries does your business receive each month? *
                  </label>
                  <select
                    value={softwareAnswers.monthlyVolume}
                    onChange={(e) => setSoftwareAnswers({ ...softwareAnswers, monthlyVolume: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="20 to 100 per month">20 to 100 per month (Recommended)</option>
                    <option value="Over 100 per month">Over 100 per month</option>
                    <option value="Under 20 per month">Under 20 per month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Do you have older enquiries or stalled opportunities you need to recover? *
                  </label>
                  <select
                    value={softwareAnswers.stalledBacklog}
                    onChange={(e) => setSoftwareAnswers({ ...softwareAnswers, stalledBacklog: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="Yes, dozens or hundreds of stalled leads">Yes, dozens or hundreds of stalled leads</option>
                    <option value="A small backlog">A small backlog</option>
                    <option value="No, just incoming enquiries">No, just incoming enquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Who currently follows up on leads? *
                  </label>
                  <select
                    value={softwareAnswers.followupOwner}
                    onChange={(e) => setSoftwareAnswers({ ...softwareAnswers, followupOwner: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="Dedicated sales rep">Dedicated sales rep</option>
                    <option value="Founder or business owner">Founder or business owner</option>
                    <option value="Multiple distributed team members">Multiple distributed team members</option>
                    <option value="No dedicated owner">No dedicated owner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    How do you currently verify that follow-ups actually happened? *
                  </label>
                  <select
                    value={softwareAnswers.verificationMethod}
                    onChange={(e) => setSoftwareAnswers({ ...softwareAnswers, verificationMethod: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="Spreadsheets or manual notes">Spreadsheets or manual notes</option>
                    <option value="Personal memory">Personal memory</option>
                    <option value="Basic CRM without SLA tracking">Basic CRM without SLA tracking</option>
                    <option value="No consistent verification">No consistent verification</option>
                  </select>
                </div>
              </div>
            )}

            {/* Branch C: Team Training */}
            {selectedTrack === 'TEAM_TRAINING' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    How many sales team members need training? *
                  </label>
                  <select
                    value={trainingAnswers.teamSize}
                    onChange={(e) => setTrainingAnswers({ ...trainingAnswers, teamSize: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="1 to 3 representatives">1 to 3 representatives</option>
                    <option value="4 to 10 representatives">4 to 10 representatives</option>
                    <option value="More than 10 representatives">More than 10 representatives</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    What conversation area does the team struggle with most? *
                  </label>
                  <select
                    value={trainingAnswers.struggleArea}
                    onChange={(e) => setTrainingAnswers({ ...trainingAnswers, struggleArea: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="Handling objections & resistance">Handling objections & resistance</option>
                    <option value="Setting appointments from raw enquiries">Setting appointments from raw enquiries</option>
                    <option value="Discovery and presenting value">Discovery and presenting value</option>
                    <option value="Asking for the decision / closing">Asking for the decision / closing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Is your sales process primarily inbound or outbound? *
                  </label>
                  <select
                    value={trainingAnswers.salesType}
                    onChange={(e) => setTrainingAnswers({ ...trainingAnswers, salesType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="Inbound enquiries">Inbound enquiries</option>
                    <option value="Outbound prospecting">Outbound prospecting</option>
                    <option value="Mix of inbound and outbound">Mix of inbound and outbound</option>
                  </select>
                </div>
              </div>
            )}

            {/* Branch D: Managed Sales */}
            {selectedTrack === 'MANAGED_SALES' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    What type of hands-on sales work do you need? *
                  </label>
                  <select
                    value={managedAnswers.workType}
                    onChange={(e) => setManagedAnswers({ ...managedAnswers, workType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="Appointment setting from incoming enquiries">Appointment setting from incoming enquiries</option>
                    <option value="Sales closing on qualified calls">Sales closing on qualified calls</option>
                    <option value="Full follow-up coordination">Full follow-up coordination</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    How many qualified conversations or enquiries do you have each month? *
                  </label>
                  <select
                    value={managedAnswers.monthlyVolume}
                    onChange={(e) => setManagedAnswers({ ...managedAnswers, monthlyVolume: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="20 to 50 per month">20 to 50 per month (Recommended guideline)</option>
                    <option value="More than 50 per month">More than 50 per month</option>
                    <option value="Fewer than 20 per month">Fewer than 20 per month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Does your business have documented pricing and an authorized decision-maker? *
                  </label>
                  <select
                    value={managedAnswers.pricingReadiness}
                    onChange={(e) => setManagedAnswers({ ...managedAnswers, pricingReadiness: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                  >
                    <option value="Yes, clear commercial terms & active sponsor">Yes, clear commercial terms & active sponsor</option>
                    <option value="In progress">In progress</option>
                    <option value="No documented terms yet">No documented terms yet</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#A7B7C7] hover:text-white font-medium text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg transition-all"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Contact Details & Submit */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-[#A7B7C7]">
              Where should we send your full recommendation and follow-up details?
            </p>

            {/* Honeypot */}
            <input
              type="text"
              name="hpField"
              value={contactInfo.hpField}
              onChange={(e) => setContactInfo({ ...contactInfo, hpField: e.target.value })}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            <div>
              <label className="block text-xs font-semibold text-white mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={contactInfo.name}
                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                placeholder="e.g. David Adeleke"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1">
                Work Email Address *
              </label>
              <input
                type="email"
                required
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                placeholder="e.g. david@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  placeholder="+234..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={contactInfo.company}
                  onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })}
                  placeholder="e.g. Apex Logistics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C26] border border-white/15 text-white text-xs sm:text-sm focus:border-[#248277] focus:outline-none"
                />
              </div>
            </div>

            {submissionError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40">
                {submissionError}
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#A7B7C7] hover:text-white font-medium text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing answers...</span>
                  </>
                ) : (
                  <>
                    <span>See Recommendation</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Explainable Recommendation Screen */}
        {step === 4 && submissionResult && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-[#111C26] border border-[#248277]/40 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#248277]/20 border border-[#248277]/40 text-[#45bfae] text-[11px] font-bold uppercase tracking-wider">
                  RECOMMENDED STARTING POINT
                </span>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                  {submissionResult.reference}
                </span>
              </div>

              {selectedTrack === 'LEAD_GENERATION' && (
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Managed Facebook & Instagram Lead Generation
                  </h3>
                  <p className="text-xs text-[#A7B7C7] mt-1 leading-relaxed">
                    Targeted campaign management connected directly to your Closecraft follow-up workflow.
                  </p>
                </div>
              )}

              {selectedTrack === 'SOFTWARE_FOLLOWUP' && (
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Closecraft Follow-up Software (Starter Plan)
                  </h3>
                  <p className="text-xs text-[#A7B7C7] mt-1 leading-relaxed">
                    Organise incoming enquiries, assign clear responsibilities, and ensure no deal slips through forgotten follow-up.
                  </p>
                </div>
              )}

              {selectedTrack === 'TEAM_TRAINING' && (
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Sales Team Development (Digital Sales School)
                  </h3>
                  <p className="text-xs text-[#A7B7C7] mt-1 leading-relaxed">
                    Cohort-based drills focusing on objection handling, discovery calls, and appointment setting tailored to your offer.
                  </p>
                </div>
              )}

              {selectedTrack === 'MANAGED_SALES' && (
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Closecraft Managed Follow-up Pilot (30 Days)
                  </h3>
                  <p className="text-xs text-[#A7B7C7] mt-1 leading-relaxed">
                    Hands-on external appointment setters or sales closers working directly inside your workspace.
                  </p>
                </div>
              )}
            </div>

            {/* Explainable Rationale Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#090D12] border border-white/10 space-y-1">
                <p className="font-bold text-[#45bfae] flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>Why this fits your business</span>
                </p>
                <p className="text-[#8A9CAE] leading-relaxed">
                  {selectedTrack === 'LEAD_GENERATION' && 'You have an active offer and dedicated ad budget, but need a structured way to turn Meta attention into qualified conversations.'}
                  {selectedTrack === 'SOFTWARE_FOLLOWUP' && 'You already receive enquiries each month. Organising ownership and next steps will unlock immediate revenue before spending more on ads.'}
                  {selectedTrack === 'TEAM_TRAINING' && 'Your team is working active leads, but losing opportunities to common buyer objections or hesitation. Practical practice will improve conversion velocity.'}
                  {selectedTrack === 'MANAGED_SALES' && 'You have qualified enquiries waiting, but lack the dedicated sales capacity to follow up quickly and close consistently.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#090D12] border border-white/10 space-y-1">
                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>What you need to provide</span>
                </p>
                <p className="text-[#8A9CAE] leading-relaxed">
                  {selectedTrack === 'LEAD_GENERATION' && 'Access to your Facebook page & Meta ad account (ad spend is paid directly by you to Meta), plus an assigned person to respond.'}
                  {selectedTrack === 'SOFTWARE_FOLLOWUP' && 'Upload existing leads or connect your lead capture source. No credit card required for the 7-day trial.'}
                  {selectedTrack === 'TEAM_TRAINING' && 'Sample buyer objections, offer collateral, and a manager sponsor committed to weekly team progress.'}
                  {selectedTrack === 'MANAGED_SALES' && 'Documented pricing, target customer qualification criteria, and access to calendar or CRM workspace.'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090D12] border border-white/10 text-xs text-[#8A9CAE] space-y-1">
              <p className="font-bold text-white">What happens next?</p>
              <p>
                We have emailed a copy of your request to <strong className="text-white">{contactInfo.email}</strong>. Our team will review your operational details and follow up within 1 business day.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={resetAssessment}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#8A9CAE] hover:text-white transition-all text-center"
              >
                Start another assessment
              </button>

              <div className="flex items-center gap-2">
                {selectedTrack === 'SOFTWARE_FOLLOWUP' ? (
                  <Link
                    href="/signup"
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all text-center"
                  >
                    <span>Start My 7-Day Free Trial</span>
                    <ArrowRight size={16} />
                  </Link>
                ) : selectedTrack === 'LEAD_GENERATION' ? (
                  <Link
                    href="/services/lead-generation"
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all text-center"
                  >
                    <span>View Lead Gen Details</span>
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all text-center"
                  >
                    <span>Done</span>
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

