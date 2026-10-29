'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { saveLearnerOnboardingPurpose } from '@/app/(saas)/practice-actions';

export default function OnboardingClient({ initialProfile }: { initialProfile: any }) {
  const router = useRouter();

  const [purpose, setPurpose] = useState<'SKILLS_DEVELOPMENT' | 'BUSINESS_PROCESS'>(
    initialProfile?.onboardingPurpose || 'SKILLS_DEVELOPMENT'
  );
  const [targetRole, setTargetRole] = useState(initialProfile?.targetRole || 'Appointment Setter');
  const [currentExperience, setCurrentExperience] = useState(initialProfile?.currentExperience || 'BEGINNER');
  const [preferredChannel, setPreferredChannel] = useState(initialProfile?.preferredChannel || 'WHATSAPP');
  const [mainSkillGoal, setMainSkillGoal] = useState(initialProfile?.mainSkillGoal || 'Discovery & Diagnosis');
  const [availablePracticeMinutes, setAvailablePracticeMinutes] = useState(initialProfile?.availablePracticeMinutes || 15);
  const [timeZone, setTimeZone] = useState(initialProfile?.timeZone || 'Africa/Lagos');
  const [currency, setCurrency] = useState(initialProfile?.currency || 'NGN');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await saveLearnerOnboardingPurpose({
        onboardingPurpose: purpose,
        targetRole,
        currentExperience,
        preferredChannel,
        mainSkillGoal,
        availablePracticeMinutes: Number(availablePracticeMinutes),
        timeZone,
        currency,
      });

      if (purpose === 'BUSINESS_PROCESS') {
        router.push('/onboarding');
      } else {
        router.push('/practice');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save preferences.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          Welcome to Closecraft
        </h1>
        <p className="text-sm text-on-surface-variant max-w-lg mx-auto">
          Choose your immediate purpose so we can tune the platform to your workflow.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Purpose Chooser */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setPurpose('SKILLS_DEVELOPMENT')}
          className={`p-6 rounded-2xl border text-left transition-all ${
            purpose === 'SKILLS_DEVELOPMENT'
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
              : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant/60'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <Icon name="Target" size={20} />
          </div>
          <h2 className="text-base font-bold text-on-surface">Develop Sales Skills</h2>
          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            I want to practise buyer conversations, master appointment setting or closing, and earn verified competence evidence.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setPurpose('BUSINESS_PROCESS')}
          className={`p-6 rounded-2xl border text-left transition-all ${
            purpose === 'BUSINESS_PROCESS'
              ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20'
              : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant/60'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <Icon name="Building2" size={20} />
          </div>
          <h2 className="text-base font-bold text-on-surface">Improve a Business Process</h2>
          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            I operate a business receiving enquiries and want to configure lead response, WhatsApp outreach, and team follow-up.
          </p>
        </button>
      </div>

      {/* Form Based on Selection */}
      {purpose === 'BUSINESS_PROCESS' ? (
        <div className="p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest space-y-4">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <Icon name="Compass" size={18} className="text-emerald-400" />
            Business Pipeline Qualification
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Closecraft prioritises software discovery for businesses with 20 or more monthly enquiries and an identifiable follow-up problem. Proceed to answer the 4 business qualification questions.
          </p>
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-xs transition-colors shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Proceed to Business Qualification →'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest space-y-5 text-xs">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <Icon name="UserCheck" size={18} className="text-primary" />
            Personal Development Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-on-surface mb-1">Target Sales Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Appointment Setter">Appointment Setter (Lead to Call)</option>
                <option value="Account Executive / Closer">Account Executive / Closer</option>
                <option value="Sales Development Rep">Sales Development Rep (Outbound)</option>
                <option value="Founder / Business Closer">Founder / Business Closer</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-on-surface mb-1">Current Sales Experience</label>
              <select
                value={currentExperience}
                onChange={(e) => setCurrentExperience(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="BEGINNER">Beginner (0 - 6 months)</option>
                <option value="1_TO_2_YEARS">1 to 2 Years</option>
                <option value="3_TO_5_YEARS">3 to 5 Years</option>
                <option value="5_PLUS_YEARS">5+ Years</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-on-surface mb-1">Primary Development Goal</label>
              <select
                value={mainSkillGoal}
                onChange={(e) => setMainSkillGoal(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Discovery & Diagnosis">Discovery & Diagnosis</option>
                <option value="Objection Diagnosis">Objection Diagnosis</option>
                <option value="Closing & Commercial Terms">Closing & Commercial Terms</option>
                <option value="Offer Accuracy & Boundaries">Offer Accuracy & Boundaries</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-on-surface mb-1">Preferred Channel</label>
              <select
                value={preferredChannel}
                onChange={(e) => setPreferredChannel(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="WHATSAPP">WhatsApp Business</option>
                <option value="PHONE_CALL">Phone Call</option>
                <option value="LINKEDIN_DM">LinkedIn DM</option>
                <option value="VIDEO_MEETING">Zoom / Google Meet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-on-surface mb-1">Daily Practice Time</label>
              <select
                value={availablePracticeMinutes}
                onChange={(e) => setAvailablePracticeMinutes(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={10}>10 Minutes / Day</option>
                <option value={15}>15 Minutes / Day</option>
                <option value={30}>30 Minutes / Day</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-on-surface mb-1">Time Zone</label>
              <input
                type="text"
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-medium text-on-surface mb-1">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <Link
              href="/practice"
              className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Skip for now
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-contrast hover:bg-primary-hover font-bold text-xs transition-colors shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Save & Open Practice Studio →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
