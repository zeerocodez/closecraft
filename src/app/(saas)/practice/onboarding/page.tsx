import React from 'react';
import { getLearnerProfile } from '@/app/(saas)/practice-actions';
import OnboardingClient from './OnboardingClient';

export const metadata = {
  title: 'Sales Enablement Onboarding | Closecraft',
  description: 'Select your purpose: develop sales skills or improve a business sales process.',
};

export default async function PracticeOnboardingPage() {
  const profile = await getLearnerProfile().catch(() => null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <OnboardingClient initialProfile={profile} />
    </div>
  );
}
