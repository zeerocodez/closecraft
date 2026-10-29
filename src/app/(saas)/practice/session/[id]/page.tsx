import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getPracticeAttemptReview, startPracticeSession } from '@/app/(saas)/practice-actions';
import SessionClient from './SessionClient';

export const metadata = {
  title: 'Interactive Practice Session | Closecraft',
  description: 'Multi-turn sales practice drill with realistic buyer simulation.',
};

export default async function PracticeSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    scenarioId?: string;
    parentAttemptId?: string;
    changedCondition?: string;
    assignmentId?: string;
  }>;
}) {
  const { id } = await params;

  // Intercept 'new' or 'start' to create a new practice session and redirect
  if (id === 'new' || id === 'start') {
    const sParams = await searchParams;
    let newSessionId: string | null = null;
    let startError: any = null;

    if (sParams?.scenarioId) {
      try {
        const result = await startPracticeSession({
          scenarioId: sParams.scenarioId,
          parentAttemptId: sParams.parentAttemptId,
          changedCondition: sParams.changedCondition,
          assignmentId: sParams.assignmentId,
        });
        newSessionId = result.sessionId;
      } catch (err: any) {
        startError = err;
      }
    }

    if (newSessionId) {
      redirect(`/practice/session/${newSessionId}`);
    }

    if (startError) {
      console.error('Session start error:', startError);
      if (startError.message?.includes('Unauthorized')) {
        redirect(`/login?callbackUrl=${encodeURIComponent(`/practice/session/new?scenarioId=${sParams?.scenarioId || ''}`)}`);
      }
    }

    redirect('/practice/scenarios');
  }

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
