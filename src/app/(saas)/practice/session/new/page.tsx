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
  }>;
}) {
  const params = await searchParams;
  if (!params.scenarioId) {
    redirect('/practice/scenarios');
  }

  const result = await startPracticeSession({
    scenarioId: params.scenarioId,
    parentAttemptId: params.parentAttemptId,
    changedCondition: params.changedCondition,
    assignmentId: params.assignmentId,
  });

  redirect(`/practice/session/${result.sessionId}`);
}
