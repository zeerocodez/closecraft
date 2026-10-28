'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { 
  PrimaryHelpNeed, 
  EnquiryRange, 
  NumberInputType, 
  WhoFollowsUp, 
  FollowUpTrackingMethod, 
  ForgottenEnquiryOption, 
  DifficultyOption, 
  DifficultyFrequency,
  ManagedServiceNeed,
  SoftwareAnswers,
  ManagedServiceAnswers,
  EconomicsAnswers
} from '@/lib/qualification/types';
import { 
  saveQualificationProgressAction, 
  completeQualificationAction, 
  skipQualificationAction 
} from '@/app/(saas)/qualification-actions';
import EconomicsWorksheet from '@/components/qualification/EconomicsWorksheet';
import BoundedPilotCard from '@/components/qualification/BoundedPilotCard';
import PracticalActivationCard from '@/components/qualification/PracticalActivationCard';

interface OnboardingWizardClientProps {
  initialQualification?: any;
  organizationName: string;
}

export default function OnboardingWizardClient({
  initialQualification,
  organizationName,
}: OnboardingWizardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Wizard Navigation
  const [step, setStep] = useState<number>(initialQualification?.currentStep || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [completedResult, setCompletedResult] = useState<any>(
    initialQualification?.status === 'COMPLETED' ? initialQualification : null
  );

  // Step 1: Help Chooser
  const [primaryNeed, setPrimaryNeed] = useState<PrimaryHelpNeed>(
    initialQualification?.primaryNeed || 'SOFTWARE_ORGANIZING'
  );

  // Step 2: Software Qualification
  const [enquiryMode, setEnquiryMode] = useState<'EXACT' | 'RANGE'>('RANGE');
  const [newEnquiriesExact, setNewEnquiriesExact] = useState<number | string>(
    initialQualification?.newEnquiries30dExact ?? ''
  );
  const [newEnquiriesRange, setNewEnquiriesRange] = useState<EnquiryRange>(
    initialQualification?.newEnquiries30dRange || '20-49'
  );

  const [olderMode, setOlderMode] = useState<'EXACT' | 'RANGE'>('RANGE');
  const [olderExact, setOlderExact] = useState<number | string>(
    initialQualification?.olderOpportunitiesCount ?? ''
  );
  const [olderRange, setOlderRange] = useState<EnquiryRange>(
    initialQualification?.olderOpportunitiesRange || '10-19'
  );

  const [whoFollowsUp, setWhoFollowsUp] = useState<WhoFollowsUp>(
    initialQualification?.whoFollowsUp || 'MAINLY_ME'
  );
  const [howFollowUpChecked, setHowFollowUpChecked] = useState<FollowUpTrackingMethod[]>(
    initialQualification?.howFollowUpChecked ? JSON.parse(initialQualification.howFollowUpChecked) : ['NOTEBOOK_SPREADSHEET']
  );

  const [forgottenOption, setForgottenOption] = useState<ForgottenEnquiryOption>(
    initialQualification?.forgottenEnquiryOption || 'DELAYS_NO_SPECIFIC'
  );
  const [forgottenNarrative, setForgottenNarrative] = useState(
    initialQualification?.forgottenEnquiryNarrative || ''
  );
  const [forgottenAftermath, setForgottenAftermath] = useState(
    initialQualification?.forgottenEnquiryAftermath || ''
  );

  const [difficulties, setDifficulties] = useState<DifficultyOption[]>(
    initialQualification?.difficulties ? JSON.parse(initialQualification.difficulties) : ['REMEMBERING_WHEN']
  );
  const [difficultyFrequency, setDifficultyFrequency] = useState<DifficultyFrequency>(
    initialQualification?.difficultyFrequency || 'RECURRING'
  );

  // Step 3: Managed Service Screening
  const [managedNeed, setManagedNeed] = useState<ManagedServiceNeed>(
    initialQualification?.managedServiceNeed || 'CONDUCTING_CONVERSATIONS'
  );
  const [qualifiedConversationsRange, setQualifiedConversationsRange] = useState<'0-9' | '10-19' | '20-39' | '40+' | 'NOT_SURE'>(
    initialQualification?.qualifiedConversations30dRange || '20-39'
  );
  const [bookedConversationsRange, setBookedConversationsRange] = useState<'0-9' | '10-19' | '20-39' | '40+' | 'NOT_SURE'>(
    initialQualification?.bookedConversationsNext30dRange || '10-19'
  );
  const [suitablePipelineCount, setSuitablePipelineCount] = useState<number | string>(
    initialQualification?.pipelineSuitableCount ?? 5
  );

  // Step 4: Economics Assessment
  const [economicsAnswers, setEconomicsAnswers] = useState<EconomicsAnswers>({
    currency: initialQualification?.currency || 'NGN',
    assessmentPeriod: '30_DAYS',
    expectedAttributableSales: initialQualification?.expectedAttributableSales ?? 4,
    typicalSaleValue: initialQualification?.grossProfitPerSale ? initialQualification.grossProfitPerSale + 25000 : 100000,
    directDeliveryCost: 25000,
    grossProfitPerSale: initialQualification?.grossProfitPerSale ?? 75000,
    fixedEngagementCost: initialQualification?.fixedEngagementCost ?? 150000,
    variableFeePerSale: initialQualification?.variableFeePerSale ?? 0,
    historicalConversations: initialQualification?.historicalConversations ?? 20,
    historicalSales: initialQualification?.historicalSales ?? 4,
    sameCohort: initialQualification?.sameCohort ?? true,
    economicsEvidenceSource: initialQualification?.economicsEvidenceSource ?? 'Historical CRM data',
  });

  const wantsManaged = primaryNeed === 'MANAGED_SALES_PRO' || primaryNeed === 'BOTH';

  // Toggle Tracking Checkbox
  const toggleTracking = (method: FollowUpTrackingMethod) => {
    setHowFollowUpChecked((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  // Toggle Difficulty Checkbox
  const toggleDifficulty = (diff: DifficultyOption) => {
    if (diff === 'NONE') {
      setDifficulties(['NONE']);
      return;
    }
    setDifficulties((prev) => {
      const clean = prev.filter((d) => d !== 'NONE');
      return clean.includes(diff) ? clean.filter((d) => d !== diff) : [...clean, diff];
    });
  };

  // Build current software answers payload
  const buildSoftwareAnswers = (): SoftwareAnswers => {
    const isExactEnquiry = enquiryMode === 'EXACT' && newEnquiriesExact !== '';
    const isExactOlder = olderMode === 'EXACT' && olderExact !== '';

    return {
      newEnquiries30dExact: isExactEnquiry ? Number(newEnquiriesExact) : null,
      newEnquiries30dRange: !isExactEnquiry ? newEnquiriesRange : null,
      newEnquiries30dType: isExactEnquiry ? 'EXACT' : newEnquiriesRange === 'NOT_SURE' ? 'UNKNOWN' : 'ESTIMATED',
      olderOpportunitiesCount: isExactOlder ? Number(olderExact) : null,
      olderOpportunitiesRange: !isExactOlder ? olderRange : null,
      olderOpportunitiesType: isExactOlder ? 'EXACT' : olderRange === 'NOT_SURE' ? 'UNKNOWN' : 'ESTIMATED',
      whoFollowsUp,
      howFollowUpChecked,
      forgottenEnquiryOption: forgottenOption,
      forgottenEnquiryNarrative: forgottenOption === 'DESCRIBE_EXAMPLE' ? forgottenNarrative : null,
      forgottenEnquiryAftermath: forgottenOption === 'DESCRIBE_EXAMPLE' ? forgottenAftermath : null,
      difficulties,
      difficultyFrequency: difficulties.includes('NONE') ? null : difficultyFrequency,
    };
  };

  // Build current managed answers payload
  const buildManagedAnswers = (): ManagedServiceAnswers => {
    return {
      managedServiceNeed: managedNeed,
      qualifiedConversations30dRange: qualifiedConversationsRange,
      bookedConversationsNext30dRange: bookedConversationsRange,
      pipelineSuitableCount: suitablePipelineCount !== '' ? Number(suitablePipelineCount) : null,
      workloadTasksPerOpportunity: 3,
      workloadChannels: ['WhatsApp', 'Email'],
      workloadAvgTaskDurationMinutes: 15,
      workloadCoverageHours: '9am - 5pm WAT',
      workloadLanguages: ['English'],
    };
  };

  // Save Progress Asynchronously
  const saveProgress = async (nextStep: number) => {
    try {
      await saveQualificationProgressAction({
        step: nextStep,
        primaryNeed,
        softwareAnswers: buildSoftwareAnswers(),
        managedAnswers: wantsManaged ? buildManagedAnswers() : undefined,
        economicsAnswers: wantsManaged ? economicsAnswers : undefined,
      });
    } catch (err) {
      console.warn('Progress autosave failed (non-blocking):', err);
    }
  };

  // Navigation Handlers
  const handleNext = async () => {
    let nextStep = step + 1;
    if (step === 2 && !wantsManaged) {
      // Software-only users skip managed screening steps directly to final evaluation
      await handleSubmit();
      return;
    }
    if (step === 4) {
      await handleSubmit();
      return;
    }
    setStep(nextStep);
    saveProgress(nextStep);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    startTransition(async () => {
      try {
        await skipQualificationAction();
        router.push('/today');
      } catch (err: any) {
        setFeedback(err.message || 'Failed to skip qualification.');
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const result = await completeQualificationAction({
        primaryNeed,
        softwareAnswers: buildSoftwareAnswers(),
        managedAnswers: wantsManaged ? buildManagedAnswers() : null,
        economicsAnswers: wantsManaged ? economicsAnswers : null,
      });
      setCompletedResult(result);
      setStep(5);
    } catch (err: any) {
      setFeedback(err.message || 'Submission failed. Your active responses were preserved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header & Progressive Progress Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/20 text-primary uppercase">
              {organizationName}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">Onboarding & Qualification</span>
          </div>
          <h2 className="font-heading font-semibold text-2xl text-on-surface mt-1">
            {step === 5 ? 'Qualification Assessment Results' : 'Personalise Your Workspace'}
          </h2>
        </div>

        {step < 5 && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSkip}
              disabled={isPending}
              className="text-xs text-on-surface-variant hover:text-on-surface underline py-1 px-2"
              title="Skip qualification questions and begin using Closecraft directly"
            >
              Skip assessment & begin using software
            </button>
            <div className="flex items-center gap-1 font-mono text-xs text-primary font-bold">
              <span>Step {step}</span>
              <span className="text-on-surface-variant font-normal">/ {wantsManaged ? '4' : '2'}</span>
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* STEP 1: HELP CHOOSER */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="font-heading font-semibold text-xl text-on-surface">
              What would you like help with?
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Select your primary focus so we can personalise your initial setup and guide you to the most useful starting point.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                id: 'SOFTWARE_ORGANIZING',
                title: 'Organising enquiries and follow-ups',
                desc: 'Use software to keep team ownership visible, stop forgetting follow-ups, and track response SLAs.',
                icon: 'Laptop',
                tag: 'Software Focus',
              },
              {
                id: 'MANAGED_SALES_PRO',
                title: 'Getting a sales professional to help',
                desc: 'Engage vetted remote sales professionals (closers, appointment setters) to handle customer conversations.',
                icon: 'Briefcase',
                tag: 'Managed Service Focus',
              },
              {
                id: 'BOTH',
                title: 'Both software and sales professionals',
                desc: 'Organise your internal enquiry pipeline and bring in vetted remote closers during busy periods.',
                icon: 'Combine',
                tag: 'Unified Revenue Operating System',
              },
              {
                id: 'NOT_SURE_YET',
                title: 'I’m not sure yet',
                desc: 'Explore the workspace first with a real enquiry and decide on service support later.',
                icon: 'HelpCircle',
                tag: 'Exploratory',
              },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => setPrimaryNeed(opt.id as PrimaryHelpNeed)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  primaryNeed === opt.id
                    ? 'bg-surface-container-high border-primary shadow-lg shadow-primary/10'
                    : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded-full bg-surface-container-lowest">
                      {opt.tag}
                    </span>
                    <Icon name={opt.icon} size={20} className={primaryNeed === opt.id ? 'text-primary' : 'text-on-surface-variant'} />
                  </div>
                  <h4 className="font-bold text-sm text-on-surface mb-1.5">{opt.title}</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{opt.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                  <span className="text-[11px] text-on-surface-variant">Click to select</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    primaryNeed === opt.id ? 'border-primary bg-primary' : 'border-outline-variant'
                  }`}>
                    {primaryNeed === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-on-primary" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end pt-4">
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:opacity-90 shadow-sm"
            >
              <span>Continue</span>
              <Icon name="ArrowRight" size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SOFTWARE QUALIFICATION */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="font-heading font-semibold text-xl text-on-surface">
              Enquiry Handling & Workflow Context
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Help us understand your current enquiry volume and where follow-up friction occurs.
            </p>
          </div>

          {/* Question 1: 30d New Enquiries */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-medium text-sm text-on-surface">
                1. Approximately how many new enquiries did you receive in the last 30 days? *
              </label>
              <div className="flex items-center gap-1 text-[11px] bg-surface-container-high p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setEnquiryMode('RANGE')}
                  className={`px-2 py-0.5 rounded ${enquiryMode === 'RANGE' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant'}`}
                >
                  Range
                </button>
                <button
                  type="button"
                  onClick={() => setEnquiryMode('EXACT')}
                  className={`px-2 py-0.5 rounded ${enquiryMode === 'EXACT' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant'}`}
                >
                  Exact Count
                </button>
              </div>
            </div>

            <p className="text-xs text-primary/90 font-medium">
              ℹ️ Count potential buyers, not individual messages. Exclude spam and unrelated requests.
            </p>

            {enquiryMode === 'RANGE' ? (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                {(['0-9', '10-19', '20-49', '50-99', '100+', 'NOT_SURE'] as EnquiryRange[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNewEnquiriesRange(r)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      newEnquiriesRange === r
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container border-outline-variant/30 text-on-surface hover:border-outline-variant/60'
                    }`}
                  >
                    {r === 'NOT_SURE' ? 'Not sure' : r}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="number"
                min={0}
                value={newEnquiriesExact}
                onChange={(e) => setNewEnquiriesExact(e.target.value)}
                placeholder="Enter exact non-negative count (e.g. 24)"
                className="w-full bg-surface-container-high px-3.5 py-2 rounded-xl border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
              />
            )}
          </div>

          {/* Question 2: Older Opportunities */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-medium text-sm text-on-surface">
                2. How many older opportunities are still waiting for a decision?
              </label>
              <div className="flex items-center gap-1 text-[11px] bg-surface-container-high p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setOlderMode('RANGE')}
                  className={`px-2 py-0.5 rounded ${olderMode === 'RANGE' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant'}`}
                >
                  Range
                </button>
                <button
                  type="button"
                  onClick={() => setOlderMode('EXACT')}
                  className={`px-2 py-0.5 rounded ${olderMode === 'EXACT' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant'}`}
                >
                  Exact Count
                </button>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant">
              These are enquiries received before the last 30 days that are still active. (This count is kept separate and not relabelled as new volume).
            </p>

            {olderMode === 'RANGE' ? (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                {(['0-9', '10-19', '20-49', '50-99', '100+', 'NOT_SURE'] as EnquiryRange[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setOlderRange(r)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      olderRange === r
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container border-outline-variant/30 text-on-surface hover:border-outline-variant/60'
                    }`}
                  >
                    {r === 'NOT_SURE' ? 'Not sure' : r}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="number"
                min={0}
                value={olderExact}
                onChange={(e) => setOlderExact(e.target.value)}
                placeholder="Enter exact count of active backlog deals"
                className="w-full bg-surface-container-high px-3.5 py-2 rounded-xl border border-outline-variant/40 text-on-surface text-sm"
              />
            )}
          </div>

          {/* Question 3: Who follows up & How checked */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
            <div>
              <label className="font-medium text-sm text-on-surface block mb-1">
                3. Who follows up, and how do you check that it happened? *
              </label>
              <span className="text-xs text-on-surface-variant">Select who handles communication and how accountability is tracked.</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-on-surface block">Who mainly handles follow-up:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'MAINLY_ME', label: 'Mainly me (Owner)' },
                  { id: 'ONE_MEMBER', label: 'One team member' },
                  { id: 'SEVERAL_PEOPLE', label: 'Several people' },
                  { id: 'EXTERNAL_AGENCY', label: 'External person or agency' },
                  { id: 'NOT_CLEARLY_ASSIGNED', label: 'Responsibility is not clearly assigned' },
                  { id: 'OTHER', label: 'Other arrangement' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setWhoFollowsUp(item.id as WhoFollowsUp)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                      whoFollowsUp === item.id
                        ? 'bg-primary text-on-primary border-primary font-bold'
                        : 'bg-surface-container border-outline-variant/30 text-on-surface'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-outline-variant/20">
              <span className="text-xs font-semibold text-on-surface block">How follow-up is checked (select all that apply):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'ASK_PERSON', label: 'I ask the person responsible directly' },
                  { id: 'MESSAGE_HISTORY', label: 'We check WhatsApp/email message history' },
                  { id: 'NOTEBOOK_SPREADSHEET', label: 'We use a notebook or spreadsheet' },
                  { id: 'REMINDERS_TASK_TOOL', label: 'We use reminders or task tools' },
                  { id: 'CRM', label: 'We use a CRM' },
                  { id: 'NO_CONSISTENT_WAY', label: 'We do not have a consistent way to check' },
                ].map((method) => {
                  const isChecked = howFollowUpChecked.includes(method.id as FollowUpTrackingMethod);
                  return (
                    <div
                      key={method.id}
                      onClick={() => toggleTracking(method.id as FollowUpTrackingMethod)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isChecked ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-surface-container border-outline-variant/30 text-on-surface'
                      }`}
                    >
                      <span>{method.label}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant'}`}>
                        {isChecked && <Icon name="Check" size={12} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Question 4: Follow-up difficulty confirmation */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
            <div>
              <label className="font-medium text-sm text-on-surface block mb-1">
                4. Which of these causes difficulty today?
              </label>
              <span className="text-xs text-on-surface-variant">
                Select any areas creating friction. We do not infer confirmed problems from keyword matching.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'REMEMBERING_WHEN', label: 'Remembering when to follow up' },
                { id: 'KNOWING_WHO', label: 'Knowing who is responsible' },
                { id: 'FINDING_UPDATE', label: 'Finding the latest conversation update' },
                { id: 'COORDINATING_PEOPLE', label: 'Coordinating between several reps' },
                { id: 'MANAGING_OLDER_OPPORTUNITIES', label: 'Managing older opportunities waiting for decision' },
                { id: 'NONE', label: 'None of these (Handling is smooth)' },
              ].map((diff) => {
                const isChecked = difficulties.includes(diff.id as DifficultyOption);
                return (
                  <div
                    key={diff.id}
                    onClick={() => toggleDifficulty(diff.id as DifficultyOption)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      isChecked ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-surface-container border-outline-variant/30 text-on-surface'
                    }`}
                  >
                    <span>{diff.label}</span>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant'}`}>
                      {isChecked && <Icon name="Check" size={12} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {!difficulties.includes('NONE') && difficulties.length > 0 && (
              <div className="pt-2 flex items-center gap-4 text-xs">
                <span className="font-semibold text-on-surface">Frequency of difficulty:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="freq"
                    checked={difficultyFrequency === 'OCCASIONAL'}
                    onChange={() => setDifficultyFrequency('OCCASIONAL')}
                    className="text-primary"
                  />
                  <span>Occasional</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="freq"
                    checked={difficultyFrequency === 'RECURRING'}
                    onChange={() => setDifficultyFrequency('RECURRING')}
                    className="text-primary"
                  />
                  <span>Recurring</span>
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-xl text-xs text-on-surface-variant hover:text-on-surface"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:opacity-90 shadow-sm"
            >
              <span>{wantsManaged ? 'Continue to Service Assessment' : 'Complete & View Evaluation'}</span>
              <Icon name="ArrowRight" size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MANAGED SERVICE SCREENING (If requested) */}
      {step === 3 && wantsManaged && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="font-heading font-semibold text-xl text-on-surface">
              Sales Professional Screening & Workload Scope
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Closecraft assesses conversation volume and workload to match the right remote sales support model.
            </p>
          </div>

          {/* Support Type Selector */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <label className="font-medium text-sm text-on-surface block">
              What kind of sales support do you need? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'CONDUCTING_CONVERSATIONS', label: 'Conducting qualified sales conversations (Dedicated Closer)', tag: 'Closer Focus' },
                { id: 'QUALIFYING_APPOINTMENTS', label: 'Qualifying prospects and booking appointments (Setter)', tag: 'Setter Focus' },
                { id: 'FOLLOWING_UP_EXISTING', label: 'Following up on existing backlog opportunities', tag: 'Follow-up Focus' },
                { id: 'RESPONDING_NEW', label: 'Fast first response to new inbound enquiries', tag: 'Response Focus' },
                { id: 'HELP_DECIDING', label: 'Help deciding what support is suitable', tag: 'Advisory' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setManagedNeed(item.id as ManagedServiceNeed)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                    managedNeed === item.id ? 'bg-primary/10 border-primary font-semibold text-on-surface' : 'bg-surface-container border-outline-variant/30 text-on-surface'
                  }`}
                >
                  <span className="text-[10px] font-mono text-primary uppercase">{item.tag}</span>
                  <span className="mt-1">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Closer Questions (Screening Target ~20) */}
          {managedNeed === 'CONDUCTING_CONVERSATIONS' && (
            <div className="p-5 rounded-2xl bg-surface-container-low border border-primary/30 space-y-4">
              <div className="flex items-center gap-2">
                <Icon name="Target" size={18} className="text-primary" />
                <h4 className="font-heading font-semibold text-sm text-on-surface">Dedicated Closer Screening (~20 target)</h4>
              </div>
              <p className="text-xs text-on-surface-variant">
                Dedicated closers require sufficient qualified conversation velocity. (A qualified conversation is with a prospect who agreed to discuss a relevant need).
              </p>

              <div className="space-y-2">
                <label className="text-xs font-medium text-on-surface block">
                  How many qualified sales conversations did your business hold in the last 30 days?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['0-9', '10-19', '20-39', '40+', 'NOT_SURE'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setQualifiedConversationsRange(r)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                        qualifiedConversationsRange === r ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container border-outline-variant/30 text-on-surface'
                      }`}
                    >
                      {r === 'NOT_SURE' ? 'Not sure' : r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                <label className="text-xs font-medium text-on-surface block">
                  How many qualified conversations are already booked for the next 30 days?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['0-9', '10-19', '20-39', '40+', 'NOT_SURE'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setBookedConversationsRange(r)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                        bookedConversationsRange === r ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container border-outline-variant/30 text-on-surface'
                      }`}
                    >
                      {r === 'NOT_SURE' ? 'Not sure' : r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-outline-variant/20">
                <label className="text-xs font-medium text-on-surface block">
                  How many existing opportunities currently appear suitable for closing?
                </label>
                <input
                  type="number"
                  min={0}
                  value={suitablePipelineCount}
                  onChange={(e) => setSuitablePipelineCount(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full sm:w-48 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs text-on-surface"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-xl text-xs text-on-surface-variant hover:text-on-surface"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:opacity-90 shadow-sm"
            >
              <span>Continue to Economics</span>
              <Icon name="ArrowRight" size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ECONOMICS ASSESSMENT (If requested) */}
      {step === 4 && wantsManaged && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="font-heading font-semibold text-xl text-on-surface">
              Economics Assessment Worksheet
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Verify expected contribution before creating a managed-service proposal. Distinguishes gross profit from revenue.
            </p>
          </div>

          <EconomicsWorksheet
            initialValues={economicsAnswers}
            onChange={(updated) => setEconomicsAnswers(updated)}
          />

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-xl text-xs text-on-surface-variant hover:text-on-surface"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:opacity-90 shadow-sm"
            >
              <span>{isSubmitting ? 'Evaluating...' : 'Complete & Generate Recommendation'}</span>
              <Icon name="CheckCircle" size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: EXPLAINABLE RESULTS & PRACTICAL ACTIVATION */}
      {step === 5 && completedResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Result Banner */}
          <div className="p-6 rounded-2xl bg-surface-container-high border border-outline-variant/40 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                  Evaluation Classification • Rules v{completedResult.rulesVersion || '2026.1'}
                </span>
                <h3 className="font-heading font-bold text-xl text-on-surface mt-0.5">
                  {completedResult.softwareFit === 'PRIORITY_SOFTWARE_FIT' && 'Priority Software Fit'}
                  {completedResult.softwareFit === 'POTENTIAL_SOFTWARE_FIT' && 'Potential Software Fit'}
                  {completedResult.softwareFit === 'EXPLORE_SOFTWARE_FIT' && 'Explore Software Fit'}
                  {completedResult.softwareFit === 'NEEDS_MORE_CONTEXT' && 'Context Needed'}
                </h3>
              </div>

              {completedResult.serviceRecommendation && completedResult.serviceRecommendation !== 'NOT_REQUESTED' && (
                <span className="text-xs px-3 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-primary font-mono font-semibold self-start sm:self-auto">
                  Service: {completedResult.serviceRecommendation.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <strong className="text-on-surface block mb-0.5">Transparent Rationale:</strong>
                <p className="text-on-surface-variant leading-relaxed">
                  {completedResult.softwareFitReason}
                </p>
              </div>

              {completedResult.serviceRecommendationReason && (
                <div className="pt-2 border-t border-outline-variant/20">
                  <strong className="text-on-surface block mb-0.5">Managed Service Scoping:</strong>
                  <p className="text-on-surface-variant leading-relaxed">
                    {completedResult.serviceRecommendationReason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bounded Pilot Card (if generated) */}
          {completedResult.boundedPilot && (
            <BoundedPilotCard
              pilot={completedResult.boundedPilot}
              onRequestProposal={() => router.push('/sales-support')}
            />
          )}

          {/* Practical Activation Steps */}
          <PracticalActivationCard
            softwareFit={completedResult.softwareFit}
            recommendedAction={completedResult.softwareFitAction || 'Start by adding your current enquiries and assigning the next follow-up.'}
            hasOlderPipeline={olderExact !== '' && Number(olderExact) > 0}
          />
        </div>
      )}
    </div>
  );
}
