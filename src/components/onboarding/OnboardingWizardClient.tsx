'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { 
  PrimaryHelpNeed, 
  EnquiryRange, 
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
  skipQualificationAction,
  updateWorkspaceSetupAction,
} from '@/app/(saas)/qualification-actions';
import { recordFastEnquiry } from '@/app/(saas)/actions';
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

  // Wizard Navigation (1: Workspace Setup, 2: Intended Use, 3: Short Qualification, 4: Managed Assessment, 5: Results & Activation)
  const [step, setStep] = useState<number>(initialQualification?.currentStep || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [completedResult, setCompletedResult] = useState<any>(
    initialQualification?.status === 'COMPLETED' ? initialQualification : null
  );

  // Step 1: Essential Workspace Setup
  const [wsName, setWsName] = useState(organizationName || 'My Workspace');
  const [wsCurrency, setWsCurrency] = useState(initialQualification?.currency || 'NGN');
  const [teamSize, setTeamSize] = useState<'SOLO' | 'SMALL_TEAM' | 'GROWING'>('SOLO');
  const [channels, setChannels] = useState<string[]>(['WhatsApp', 'Website forms']);

  // Step 2: Intended Use (Help Chooser)
  const [primaryNeed, setPrimaryNeed] = useState<PrimaryHelpNeed>(
    initialQualification?.primaryNeed || 'SOFTWARE_ORGANIZING'
  );

  // Step 3: Software Qualification
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

  // Step 4: Managed Service Screening (if requested)
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

  // Step 4 Economics Assessment
  const [economicsAnswers, setEconomicsAnswers] = useState<EconomicsAnswers>({
    currency: initialQualification?.currency || wsCurrency || 'NGN',
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

  // Step 5: Activation Task State (Add First Enquiry)
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadValue, setLeadValue] = useState('50000');
  const [leadNextAction, setLeadNextAction] = useState('Send WhatsApp introduction & schedule discovery call');
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [leadSuccessMsg, setLeadSuccessMsg] = useState<string | null>(null);
  const [leadErrorMsg, setLeadErrorMsg] = useState<string | null>(null);

  const wantsManaged = primaryNeed === 'MANAGED_SALES_PRO' || primaryNeed === 'BOTH';

  // Toggle Tracking Checkbox
  const toggleTracking = (method: FollowUpTrackingMethod) => {
    setHowFollowUpChecked((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  // Toggle Channel Checkbox
  const toggleChannel = (ch: string) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
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

  // Build software answers
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

  // Build managed answers
  const buildManagedAnswers = (): ManagedServiceAnswers => {
    return {
      managedServiceNeed: managedNeed,
      qualifiedConversations30dRange: qualifiedConversationsRange,
      bookedConversationsNext30dRange: bookedConversationsRange,
      pipelineSuitableCount: suitablePipelineCount !== '' ? Number(suitablePipelineCount) : null,
      workloadTasksPerOpportunity: 3,
      workloadChannels: channels,
      workloadAvgTaskDurationMinutes: 15,
      workloadCoverageHours: '9am - 5pm WAT',
      workloadLanguages: ['English'],
    };
  };

  // Save Progress Asynchronously server-side
  const saveProgress = async (nextStep: number) => {
    try {
      if (nextStep === 2) {
        await updateWorkspaceSetupAction({ name: wsName, currency: wsCurrency });
      }
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
    setFeedback(null);
    let nextStep = step + 1;

    // From Step 1 (Workspace Setup) -> Step 2 (Intended Use)
    if (step === 1) {
      setStep(2);
      saveProgress(2);
      return;
    }

    // From Step 2 (Intended Use) -> Step 3 (Short Qualification)
    if (step === 2) {
      setStep(3);
      saveProgress(3);
      return;
    }

    // From Step 3 (Short Qualification):
    // If Software-only, skip financial screening and submit evaluation directly to Step 5!
    if (step === 3 && !wantsManaged) {
      await handleSubmit();
      return;
    }

    // If requesting managed service, proceed to Step 4 (Service Assessment & Economics)
    if (step === 3 && wantsManaged) {
      setStep(4);
      saveProgress(4);
      return;
    }

    // From Step 4 (Managed Service Assessment) -> Final Submit & Step 5
    if (step === 4) {
      await handleSubmit();
      return;
    }
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

  const handleSaveDraftAndExit = () => {
    startTransition(async () => {
      try {
        await saveProgress(step);
        router.push('/today');
      } catch (err: any) {
        setFeedback(err.message || 'Failed to save draft.');
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
      setFeedback(err.message || 'Submission failed. Your responses were preserved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFirstEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLead(true);
    setLeadSuccessMsg(null);
    setLeadErrorMsg(null);

    try {
      const dueTomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await recordFastEnquiry({
        name: leadName.trim(),
        phone: leadPhone.trim() || undefined,
        email: leadEmail.trim() || undefined,
        estimatedValue: Number(leadValue) || 0,
        currency: wsCurrency,
        nextAction: leadNextAction.trim(),
        nextActionDueAt: dueTomorrow,
        source: 'ONBOARDING_ACTIVATION',
      });

      setLeadSuccessMsg(`Enquiry "${leadName}" added! First follow-up scheduled with active SLA timer.`);
      setLeadName('');
      setLeadPhone('');
      setLeadEmail('');
    } catch (err: any) {
      setLeadErrorMsg(err.message || 'Failed to add enquiry.');
    } finally {
      setIsSavingLead(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header & Progressive Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/20 text-primary uppercase">
              {wsName || organizationName}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">Business Owner Onboarding</span>
          </div>
          <h2 className="font-heading font-semibold text-2xl text-on-surface mt-1">
            {step === 1 && '1. Essential Workspace Setup'}
            {step === 2 && '2. Intended Use'}
            {step === 3 && '3. Short Business Qualification'}
            {step === 4 && '4. Managed Sales Service Screening'}
            {step === 5 && '5. Qualification Recommendation & First Task'}
          </h2>
        </div>

        {step < 5 && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSkip}
              disabled={isPending}
              className="text-xs text-on-surface-variant hover:text-on-surface underline py-1 px-2"
              title="Skip qualification questions and begin using Closecraft software directly"
            >
              Skip for now
            </button>
            <div className="flex items-center gap-1 font-mono text-xs text-primary font-bold">
              <span>Step {step}</span>
              <span className="text-on-surface-variant font-normal">/ {wantsManaged ? '4' : '3'}</span>
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

      {/* STEP 1: ESSENTIAL WORKSPACE SETUP */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="font-heading font-semibold text-lg text-on-surface">
              Configure your core sales workspace
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Verify your company details and primary currency so all deals, enquiries, and follow-ups align with your actual workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Workspace Name</label>
              <input
                type="text"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                placeholder="e.g. Sterling Properties"
                className="w-full py-2.5 px-3 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Operating Currency</label>
              <select
                value={wsCurrency}
                onChange={(e) => {
                  setWsCurrency(e.target.value);
                  setEconomicsAnswers((prev) => ({ ...prev, currency: e.target.value }));
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="NGN">NGN (Nigerian Naira - ₦)</option>
                <option value="USD">USD (US Dollar - $)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface">Current Sales Team Structure</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'SOLO', title: 'Solo Founder / Operator', desc: 'I personally handle calls and enquiries' },
                { id: 'SMALL_TEAM', title: 'Small Team (2–5 members)', desc: 'Founder plus 1–4 sales representatives' },
                { id: 'GROWING', title: 'Scaling Team (6+ members)', desc: 'Dedicated closers, setters & managers' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setTeamSize(opt.id as any)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    teamSize === opt.id
                      ? 'bg-surface-container-high border-primary shadow-sm'
                      : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60'
                  }`}
                >
                  <strong className="block text-xs text-on-surface mb-0.5">{opt.title}</strong>
                  <span className="text-[11px] text-on-surface-variant leading-snug">{opt.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface">Primary Inbound Channels</label>
            <div className="flex flex-wrap gap-2">
              {['WhatsApp', 'Website forms', 'Instagram/Facebook Ads', 'Phone calls', 'Referrals/Direct'].map((ch) => (
                <button
                  type="button"
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    channels.includes(ch)
                      ? 'bg-primary/20 text-primary border-primary/40'
                      : 'bg-surface-container text-on-surface-variant border-outline-variant/30'
                  }`}
                >
                  {channels.includes(ch) ? '✓ ' : '+ '}
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
            <button
              onClick={handleSkip}
              className="text-xs text-on-surface-variant hover:text-on-surface"
            >
              Skip setup for now
            </button>
            <button
              onClick={handleNext}
              className="py-2.5 px-5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Next: Intended Use</span>
              <Icon name="ArrowRight" size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: INTENDED USE (HELP CHOOSER) */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="font-heading font-semibold text-lg text-on-surface">
              How do you plan to use Closecraft?
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Select your primary goal so we can personalise your guidance and skip irrelevant sections.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                id: 'SOFTWARE_ORGANIZING',
                title: 'Organise enquiries & follow-ups (Software Only)',
                desc: 'Use software to keep team ownership visible, stop forgetting leads, and enforce follow-up SLAs.',
                icon: 'Laptop',
                tag: 'Software Only',
              },
              {
                id: 'MANAGED_SALES_PRO',
                title: 'Get a dedicated sales closer to help',
                desc: 'Connect with certified remote sales professionals from Digital Sales School to run discovery & close deals.',
                icon: 'Briefcase',
                tag: 'Dedicated Sales Support',
              },
              {
                id: 'BOTH',
                title: 'Both software and dedicated closers',
                desc: 'Organise your internal enquiry pipeline and bring in vetted remote closers for high-value leads.',
                icon: 'Combine',
                tag: 'Unified Revenue System',
              },
              {
                id: 'NOT_SURE_YET',
                title: 'I’m not sure yet (Explore first)',
                desc: 'Start with the software to track a real enquiry and decide on sales support later.',
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
                <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center gap-1.5 text-xs text-primary font-medium">
                  <span>{primaryNeed === opt.id ? 'Selected' : 'Select'}</span>
                  {primaryNeed === opt.id && <Icon name="Check" size={14} />}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
            <button onClick={handleBack} className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1">
              <Icon name="ArrowLeft" size={14} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <button onClick={handleSkip} className="text-xs text-on-surface-variant hover:text-on-surface">
                Skip for now
              </button>
              <button
                onClick={handleNext}
                className="py-2.5 px-5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Next: Short Qualification</span>
                <Icon name="ArrowRight" size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SHORT QUALIFICATION */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="font-heading font-semibold text-lg text-on-surface">
              Short Business & Follow-up Qualification
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Answer 4 brief questions to personalize your setup. Low enquiry volume never blocks software access.
            </p>
          </div>

          {/* Question 1: New Enquiries 30d */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface">
                1. How many new enquiries have you received in the last 30 days?
              </label>
              <button
                type="button"
                onClick={() => setEnquiryMode(enquiryMode === 'RANGE' ? 'EXACT' : 'RANGE')}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                {enquiryMode === 'RANGE' ? 'Enter exact number instead' : 'Select a range instead'}
              </button>
            </div>

            {enquiryMode === 'RANGE' ? (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {[
                  { range: '0-9', label: '0–9 (Low)' },
                  { range: '10-19', label: '10–19' },
                  { range: '20-49', label: '20–49' },
                  { range: '50-99', label: '50–99' },
                  { range: '100+', label: '100+' },
                  { range: 'NOT_SURE', label: 'Not sure' },
                ].map((item) => (
                  <button
                    key={item.range}
                    type="button"
                    onClick={() => setNewEnquiriesRange(item.range as EnquiryRange)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                      newEnquiriesRange === item.range
                        ? 'bg-primary text-on-primary border-primary font-bold shadow-sm'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="number"
                min="0"
                value={newEnquiriesExact}
                onChange={(e) => setNewEnquiriesExact(e.target.value)}
                placeholder="e.g. 25"
                className="w-full max-w-xs py-2 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>

          {/* Question 2: Older Opportunities */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface">
                2. Approximately how many older opportunities are awaiting a decision?
              </label>
              <button
                type="button"
                onClick={() => setOlderMode(olderMode === 'RANGE' ? 'EXACT' : 'RANGE')}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                {olderMode === 'RANGE' ? 'Enter exact number' : 'Select a range'}
              </button>
            </div>

            {olderMode === 'RANGE' ? (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {[
                  { range: '0-9', label: '0–9' },
                  { range: '10-19', label: '10–19' },
                  { range: '20-49', label: '20–49' },
                  { range: '50-99', label: '50–99' },
                  { range: '100+', label: '100+' },
                  { range: 'NOT_SURE', label: 'Not sure' },
                ].map((item) => (
                  <button
                    key={item.range}
                    type="button"
                    onClick={() => setOlderRange(item.range as EnquiryRange)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                      olderRange === item.range
                        ? 'bg-primary text-on-primary border-primary font-bold shadow-sm'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="number"
                min="0"
                value={olderExact}
                onChange={(e) => setOlderExact(e.target.value)}
                placeholder="e.g. 12"
                className="w-full max-w-xs py-2 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>

          {/* Question 3: Who follows up & tracking methods */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-4">
            <div>
              <label className="text-xs font-semibold text-on-surface block mb-2">
                3A. Who usually follows up with these enquiries?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'MAINLY_ME', label: 'Mainly me / Founder' },
                  { id: 'ONE_MEMBER', label: 'One dedicated team member' },
                  { id: 'SEVERAL_PEOPLE', label: 'Several team members' },
                  { id: 'NOT_CLEARLY_ASSIGNED', label: 'Not clearly assigned' },
                  { id: 'EXTERNAL_AGENCY', label: 'External agency' },
                  { id: 'OTHER', label: 'Other arrangement' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setWhoFollowsUp(item.id as WhoFollowsUp)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-all ${
                      whoFollowsUp === item.id
                        ? 'bg-primary text-on-primary border-primary font-bold shadow-sm'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface block mb-2">
                3B. How is follow-up progress currently checked? (Select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'NOTEBOOK_SPREADSHEET', label: 'Notebooks / Google Sheets' },
                  { id: 'MEMORY_MESSAGES', label: 'Memory & WhatsApp chat history' },
                  { id: 'EXISTING_CRM', label: 'Another CRM system' },
                  { id: 'TEAM_MEETINGS', label: 'Weekly team review meetings' },
                  { id: 'NOT_SYSTEMATICALLY', label: 'Not tracked systematically' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleTracking(item.id as FollowUpTrackingMethod)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-left flex items-center justify-between ${
                      howFollowUpChecked.includes(item.id as FollowUpTrackingMethod)
                        ? 'bg-primary/20 text-primary border-primary/40 font-semibold'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {howFollowUpChecked.includes(item.id as FollowUpTrackingMethod) && (
                      <Icon name="Check" size={14} className="text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question 4: Optional Example of Forgotten Enquiry */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <label className="text-xs font-semibold text-on-surface block">
              4. Have any enquiries been forgotten or delayed recently? (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'DELAYS_NO_SPECIFIC', label: 'We experience delays, but no specific example' },
                { id: 'DESCRIBE_EXAMPLE', label: 'Yes, describe a recent example' },
                { id: 'NOT_A_PROBLEM', label: 'No, enquiries rarely fall through the cracks' },
                { id: 'NOT_SURE', label: 'Not sure' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setForgottenOption(opt.id as ForgottenEnquiryOption)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-all ${
                    forgottenOption === opt.id
                      ? 'bg-primary text-on-primary border-primary font-bold shadow-sm'
                      : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {forgottenOption === 'DESCRIBE_EXAMPLE' && (
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  value={forgottenNarrative}
                  onChange={(e) => setForgottenNarrative(e.target.value)}
                  placeholder="What was the enquiry about? (e.g. Inbound enquiry for enterprise software package)"
                  className="w-full py-2 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={forgottenAftermath}
                  onChange={(e) => setForgottenAftermath(e.target.value)}
                  placeholder="What happened? (e.g. Nobody called back for 4 days and prospect bought elsewhere)"
                  className="w-full py-2 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>

          {/* Follow-up Difficulties */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <label className="text-xs font-semibold text-on-surface block">
              Where does follow-up friction occur most frequently?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'REMEMBERING_WHEN', label: 'Remembering who to call and when' },
                { id: 'KNOWING_WHO', label: 'Knowing which team member owns the next action' },
                { id: 'FINDING_UPDATE', label: 'Finding past context or chat history' },
                { id: 'COORDINATING_PEOPLE', label: 'Handoff between setters and closers' },
                { id: 'NONE', label: 'None of these / No current friction' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleDifficulty(item.id as DifficultyOption)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-left flex items-center justify-between ${
                    difficulties.includes(item.id as DifficultyOption)
                      ? 'bg-primary/20 text-primary border-primary/40 font-semibold'
                      : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {difficulties.includes(item.id as DifficultyOption) && (
                    <Icon name="Check" size={14} className="text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
            <button onClick={handleBack} className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1">
              <Icon name="ArrowLeft" size={14} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <button onClick={handleSkip} className="text-xs text-on-surface-variant hover:text-on-surface">
                Skip for now
              </button>
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="py-2.5 px-5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{wantsManaged ? 'Next: Sales Support Screening' : 'Complete & View Results'}</span>
                    <Icon name="ArrowRight" size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: MANAGED SERVICE SCREENING (CONDITIONAL) */}
      {step === 4 && wantsManaged && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="font-heading font-semibold text-lg text-on-surface">
              Dedicated Sales Support Service Screening
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Screen your deal economics and conversation volume to ensure dedicated sales assistance generates positive contribution.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <label className="text-xs font-semibold text-on-surface block">
              How many qualified conversations did your team conduct in the last 30 days?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { range: '0-9', label: '0–9' },
                { range: '10-19', label: '10–19' },
                { range: '20-39', label: '20–39 (Recommended)' },
                { range: '40+', label: '40+' },
                { range: 'NOT_SURE', label: 'Not sure' },
              ].map((item) => (
                <button
                  key={item.range}
                  type="button"
                  onClick={() => setQualifiedConversationsRange(item.range as any)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    qualifiedConversationsRange === item.range
                      ? 'bg-primary text-on-primary border-primary font-bold shadow-sm'
                      : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <EconomicsWorksheet
            initialValues={economicsAnswers}
            onChange={(ans) => setEconomicsAnswers(ans)}
          />

          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
            <button onClick={handleBack} className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1">
              <Icon name="ArrowLeft" size={14} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraftAndExit}
                className="text-xs text-on-surface-variant hover:text-on-surface"
              >
                Save draft & finish later
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="py-2.5 px-5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Qualification</span>
                    <Icon name="ArrowRight" size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: RECOMMENDATION & RELEVANT ACTIVATION TASK */}
      {step === 5 && completedResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-surface-container-low border border-primary/30 shadow-md space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  Evaluation Complete
                </span>
                <h3 className="font-heading font-bold text-xl text-on-surface mt-1.5">
                  Recommended Fit: {completedResult.softwareFit ? completedResult.softwareFit.replace(/_/g, ' ') : 'ASSESSED'}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Icon name="Sparkles" size={24} />
              </div>
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
                  <strong className="text-on-surface block mb-0.5">Sales Support Service Scoping:</strong>
                  <p className="text-on-surface-variant leading-relaxed">
                    {completedResult.serviceRecommendationReason}
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                    ✓ Recommendation saved without creating a paid engagement or triggering billing.
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

          {/* RELEVANT ACTIVATION TASK: ADD FIRST LIVE ENQUIRY */}
          <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant/40 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                <Icon name="UserPlus" size={20} />
              </div>
              <div>
                <h4 className="font-heading font-bold text-base text-on-surface">
                  Relevant Activation Task: Add Your First Live Enquiry
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Start experiencing the revenue engine right now. Add a prospect and assign clear responsibility with an automated SLA follow-up timer.
                </p>
              </div>
            </div>

            {leadSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Icon name="CheckCircle" size={16} />
                <span>{leadSuccessMsg}</span>
              </div>
            )}

            {leadErrorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <Icon name="AlertCircle" size={16} />
                <span>{leadErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddFirstEnquiry} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">Prospect Name / Business</label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="e.g. Babatunde Ogunlesi"
                    className="w-full py-2 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">WhatsApp / Phone Number</label>
                  <input
                    type="text"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="e.g. +2348012345678"
                    className="w-full py-2 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="e.g. tunde@enterprise.ng"
                    className="w-full py-2 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">Estimated Deal Value ({wsCurrency})</label>
                  <input
                    type="number"
                    min="0"
                    value={leadValue}
                    onChange={(e) => setLeadValue(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Next Action to Take</label>
                <input
                  type="text"
                  required
                  value={leadNextAction}
                  onChange={(e) => setLeadNextAction(e.target.value)}
                  placeholder="e.g. Send WhatsApp introduction & pricing brief"
                  className="w-full py-2 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingLead || !leadName || !leadPhone}
                className="py-2.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isSavingLead ? (
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Icon name="Plus" size={14} />
                    <span>Save First Enquiry & Start Follow-up Timer</span>
                  </>
                )}
              </button>
            </form>
          </div>

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
