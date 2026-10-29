import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getPracticeAttemptReview } from '@/app/(saas)/practice-actions';
import SessionClient from './SessionClient';

export const metadata = {
  title: 'Interactive Practice Session | Closecraft',
  description: 'Multi-turn sales practice drill with realistic buyer simulation.',
};

export default async function PracticeSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let attemptData;
  try {
    attemptData = await getPracticeAttemptReview(id);
  } catch (err) {
    notFound();
  }

  // If already completed and evaluated, forward to review
  if (attemptData.session.status === 'COMPLETED' && attemptData.latestEvaluation) {
    redirect(`/practice/review/${id}`);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <SessionClient initialData={attemptData} />
    </div>
  );
}
