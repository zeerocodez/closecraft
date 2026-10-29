import { redirect } from 'next/navigation';
import { startPracticeSession } from '@/app/(saas)/practice-actions';

export default async function NewPracticeSessionPage({
  searchParams,
}: {
  searchParams: Promise<{
    scenarioId?: string;
    parentAttemptId?: string;
    changedCondition?: string;
    assignmentId?: string;
    lessonId?: string;
    moduleId?: string;
    mode?: 'PRACTICE' | 'DRILL' | 'ASSIGNMENT' | 'CAPSTONE';
  }>;
}) {
  const params = await searchParams;
  if (!params?.scenarioId) {
    redirect('/practice/scenarios');
  }

  let sessionId: string | null = null;
  let authError = false;

  try {
    const result = await startPracticeSession({
      scenarioId: params.scenarioId,
      parentAttemptId: params.parentAttemptId,
      changedCondition: params.changedCondition,
      assignmentId: params.assignmentId,
      mode: params.mode,
    });
    sessionId = result.sessionId;
  } catch (err: any) {
    console.error('[NewPracticeSessionPage] Error starting session:', err);
    if (err.message?.includes('Unauthorized') || err.message?.includes('sign in')) {
      authError = true;
    }
  }

  if (sessionId) {
    redirect(`/practice/session/${sessionId}`);
  }

  if (authError) {
    const callback = encodeURIComponent(`/practice/session/new?scenarioId=${params.scenarioId}`);
    redirect(`/login?callbackUrl=${callback}`);
  }

  redirect('/practice/scenarios');
}
