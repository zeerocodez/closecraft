import { redirect } from 'next/navigation';
import { startPracticeSession } from '@/app/(saas)/practice-actions';

export default async function NewDSSPracticeSessionPage({
  searchParams,
}: {
  searchParams: Promise<{
    scenarioId?: string;
    parentAttemptId?: string;
    changedCondition?: string;
    assignmentId?: string;
    lessonId?: string;
    moduleId?: string;
    returnUrl?: string;
  }>;
}) {
  const params = await searchParams;
  if (!params?.scenarioId) {
    redirect('/dss/roleplay');
  }

  const returnUrl = params.returnUrl || (params.moduleId && params.lessonId 
    ? `/dss/module/${params.moduleId}?lesson=${params.lessonId}` 
    : '/dss/roleplay');

  let sessionId: string | null = null;
  let authError = false;

  try {
    const result = await startPracticeSession({
      scenarioId: params.scenarioId,
      parentAttemptId: params.parentAttemptId,
      changedCondition: params.changedCondition,
      assignmentId: params.assignmentId || params.lessonId,
    });
    sessionId = result.sessionId;
  } catch (err: any) {
    console.error('[NewDSSPracticeSessionPage] Error starting session:', err);
    if (err.message?.includes('Unauthorized') || err.message?.includes('sign in')) {
      authError = true;
    }
  }

  if (sessionId) {
    const qs = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '';
    redirect(`/dss/roleplay/session/${sessionId}${qs}`);
  }

  if (authError) {
    const callback = encodeURIComponent(`/dss/roleplay/session/new?scenarioId=${params.scenarioId}`);
    redirect(`/login?callbackUrl=${callback}`);
  }

  redirect('/dss/roleplay');
}
