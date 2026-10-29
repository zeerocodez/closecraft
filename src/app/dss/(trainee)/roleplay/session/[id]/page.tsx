import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getPracticeAttemptReview, startPracticeSession } from '@/app/(saas)/practice-actions';
import SessionClient from '@/app/(saas)/practice/session/[id]/SessionClient';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export const metadata = {
  title: 'Interactive Practice Session | Digital Sales School',
  description: 'AI-powered realistic buyer simulation drill.',
};

export default async function DSSPracticeSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    scenarioId?: string;
    parentAttemptId?: string;
    changedCondition?: string;
    assignmentId?: string;
    lessonId?: string;
    moduleId?: string;
    returnUrl?: string;
  }>;
}) {
  const { id } = await params;
  const sParams = await searchParams;

  const returnUrl = sParams?.returnUrl || (sParams?.moduleId && sParams?.lessonId 
    ? `/dss/module/${sParams.moduleId}?lesson=${sParams.lessonId}` 
    : '/dss/roleplay');

  // Intercept 'new' or 'start' to create a new practice session and redirect
  if (id === 'new' || id === 'start') {
    let newSessionId: string | null = null;
    let startError: any = null;

    if (sParams?.scenarioId) {
      try {
        const result = await startPracticeSession({
          scenarioId: sParams.scenarioId,
          parentAttemptId: sParams.parentAttemptId,
          changedCondition: sParams.changedCondition,
          assignmentId: sParams.assignmentId || sParams.lessonId,
        });
        newSessionId = result.sessionId;
      } catch (err: any) {
        startError = err;
      }
    }

    if (newSessionId) {
      const qs = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '';
      redirect(`/dss/roleplay/session/${newSessionId}${qs}`);
    }

    if (startError) {
      console.error('[DSSPracticeSessionPage] Error starting session:', startError);
      if (startError.message?.includes('Unauthorized')) {
        redirect(`/login?callbackUrl=${encodeURIComponent(`/dss/roleplay/session/new?scenarioId=${sParams?.scenarioId || ''}`)}`);
      }
    }

    redirect('/dss/roleplay');
  }

  let attemptData;
  try {
    attemptData = await getPracticeAttemptReview(id);
  } catch (err) {
    notFound();
  }

  // If already completed and evaluated, forward to review
  if (attemptData.session.status === 'COMPLETED' && attemptData.latestEvaluation) {
    const qs = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '';
    redirect(`/dss/roleplay/review/${id}${qs}`);
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      {/* Simulation Engine Watermark */}
      <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#45bfae] animate-pulse"></span>
          <span className="text-[#45bfae] font-semibold">DSS Live Roleplay Simulator</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <Logo variant="icon" size="xs" />
          <span>Powered by <strong>Closecraft Enablement Engine</strong></span>
        </div>
      </div>

      <SessionClient 
        initialData={attemptData} 
        variant="dss" 
        returnUrl={returnUrl} 
      />
    </div>
  );
}
