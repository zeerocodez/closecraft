import prisma from '@/lib/prisma';
import { ComparableTrendSummary, DSS_RUBRIC_CRITERIA } from './types';

/**
 * Calculates a deterministic like-with-like trend analysis for a user.
 * Groups by scenario family, rubric version, and difficulty band.
 * Requires at least 10 valid comparable attempts; otherwise returns BUILDING_BASELINE.
 */
export async function calculateComparableTrend(
  userId: string,
  options?: {
    scenarioFamily?: string;
    rubricVersion?: string;
    difficulty?: string;
  }
): Promise<ComparableTrendSummary> {
  const rubricVersion = options?.rubricVersion || 'DSS-8CRIT-V1';

  // Fetch completed sessions with evaluations
  const sessions = await prisma.practiceSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      rubricVersion,
      ...(options?.scenarioFamily ? { scenario: { scenarioFamily: options.scenarioFamily } } : {}),
      ...(options?.difficulty ? { scenario: { difficulty: options.difficulty } } : {}),
      evaluations: {
        some: {
          state: 'COMPLETED',
        },
      },
    },
    include: {
      scenario: true,
      evaluations: {
        where: { state: 'COMPLETED' },
        orderBy: { evaluationVersion: 'desc' },
        take: 1, // Count each attempt once (take latest evaluation revision)
        include: {
          criterionScores: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalEligibleAttempts = sessions.length;
  const REQUIRED_FOR_BASELINE = 10;

  if (totalEligibleAttempts < REQUIRED_FOR_BASELINE) {
    const oldestDate = sessions[sessions.length - 1]?.createdAt;
    const newestDate = sessions[0]?.createdAt;

    return {
      status: 'BUILDING_BASELINE',
      totalEligibleAttempts,
      requiredForBaseline: REQUIRED_FOR_BASELINE,
      dateRange: oldestDate && newestDate ? { start: oldestDate, end: newestDate } : undefined,
    };
  }

  // Split into latest 5 and preceding 5
  const latest5 = sessions.slice(0, 5);
  const preceding5 = sessions.slice(5, 10);

  const getSessionAvg = (list: typeof sessions) => {
    const sum = list.reduce((acc, s) => {
      const evalObj = s.evaluations[0];
      return acc + (evalObj ? evalObj.percentage : 0);
    }, 0);
    return Math.round(sum / list.length);
  };

  const latest5Average = getSessionAvg(latest5);
  const preceding5Average = getSessionAvg(preceding5);
  const delta = latest5Average - preceding5Average;
  const isImproving = delta >= 0;

  // Breakdown by criterion
  const byCriterion: ComparableTrendSummary['byCriterion'] = DSS_RUBRIC_CRITERIA.map((crit) => {
    const getCritAvg = (list: typeof sessions) => {
      let count = 0;
      let total = 0;
      for (const s of list) {
        const evalObj = s.evaluations[0];
        if (evalObj) {
          const scoreItem = evalObj.criterionScores.find((c) => c.criterionKey === crit.key);
          if (scoreItem && scoreItem.score !== null) {
            total += scoreItem.score;
            count++;
          }
        }
      }
      return count > 0 ? Number((total / count).toFixed(2)) : 0;
    };

    const latestAvg = getCritAvg(latest5);
    const precedingAvg = getCritAvg(preceding5);
    const critDelta = Number((latestAvg - precedingAvg).toFixed(2));

    return {
      criterionKey: crit.key,
      label: crit.label,
      latestAvg,
      precedingAvg,
      delta: critDelta,
    };
  });

  const startDate = preceding5[preceding5.length - 1]?.createdAt;
  const endDate = latest5[0]?.createdAt;

  return {
    status: 'COMPARABLE_TREND_AVAILABLE',
    totalEligibleAttempts,
    requiredForBaseline: REQUIRED_FOR_BASELINE,
    latest5Average,
    preceding5Average,
    delta,
    isImproving,
    dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined,
    byCriterion,
  };
}

/**
 * Computes the Next Best Coach Recommendation:
 * - Detects the same developmental gap observed in >= 3 of the latest 5 eligible attempts.
 * - If fewer comparable attempts exist, uses the learner's declared mainSkillGoal, baseline, or due assignment.
 * - Stores triggering evidence with real quotes and session IDs.
 */
export async function computeCoachRecommendation(userId: string) {
  // Check if learner profile exists
  const profile = await prisma.learnerProfile.findUnique({
    where: { userId },
  });

  // Check pending assignment first
  const pendingAssignment = await prisma.practiceAssignment.findFirst({
    where: {
      assignedToUserId: userId,
      status: 'PENDING',
    },
    include: { scenario: true },
    orderBy: { dueDate: 'asc' },
  });

  if (pendingAssignment) {
    return {
      targetSkill: 'Assigned Task',
      plainReason: `You have an assignment "${pendingAssignment.title}" due for review.`,
      triggeringEvidence: {
        source: 'ASSIGNMENT',
        assignmentId: pendingAssignment.id,
        scenarioSlug: pendingAssignment.scenario.slug,
      },
      suggestedScenarioId: pendingAssignment.scenarioId,
    };
  }

  // Get latest 5 completed attempts
  const recentSessions = await prisma.practiceSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      evaluations: { some: { state: 'COMPLETED' } },
    },
    include: {
      scenario: true,
      evaluations: {
        where: { state: 'COMPLETED' },
        orderBy: { evaluationVersion: 'desc' },
        take: 1,
        include: { criterionScores: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Count low-scoring criteria across the latest 5 attempts (score <= 1)
  const gapCounts: Record<string, { count: number; evidence: string[]; sessions: string[] }> = {};

  for (const s of recentSessions) {
    const evalObj = s.evaluations[0];
    if (evalObj) {
      for (const cs of evalObj.criterionScores) {
        if (cs.score !== null && cs.score <= 1) {
          if (!gapCounts[cs.criterionKey]) {
            gapCounts[cs.criterionKey] = { count: 0, evidence: [], sessions: [] };
          }
          gapCounts[cs.criterionKey].count++;
          gapCounts[cs.criterionKey].sessions.push(s.id);
          if (cs.observedEvidence) {
            gapCounts[cs.criterionKey].evidence.push(cs.observedEvidence);
          }
        }
      }
    }
  }

  // Find if any criterion failed in >= 3 of the last 5
  let persistentGapKey: string | null = null;
  let persistentGapData: { count: number; evidence: string[]; sessions: string[] } | null = null;

  for (const [key, data] of Object.entries(gapCounts)) {
    if (data.count >= 3) {
      persistentGapKey = key;
      persistentGapData = data;
      break;
    }
  }

  // If persistent gap found, find a matching scenario targeting this skill
  if (persistentGapKey && persistentGapData) {
    const meta = DSS_RUBRIC_CRITERIA.find((c) => c.key === persistentGapKey);
    const label = meta ? meta.label : persistentGapKey;

    const matchingScenario = await prisma.practiceScenario.findFirst({
      where: {
        applicableRubricKeys: { has: persistentGapKey },
        isPublished: true,
      },
      orderBy: { difficulty: 'asc' },
    });

    if (matchingScenario) {
      const sampleEvidence = persistentGapData.evidence[0] || 'Incomplete evidence demonstrated.';
      return {
        targetSkill: label,
        plainReason: `In ${persistentGapData.count} of your last 5 practice sessions, you experienced friction with ${label} (${sampleEvidence}). Practise this targeted drill to lock in the correction.`,
        triggeringEvidence: {
          gapKey: persistentGapKey,
          gapCount: persistentGapData.count,
          sessionIds: persistentGapData.sessions,
          sampleEvidence,
        },
        suggestedScenarioId: matchingScenario.id,
      };
    }
  }

  // Otherwise, default to user's main skill goal or first foundational scenario
  let defaultScenario = null;
  if (profile?.mainSkillGoal) {
    defaultScenario = await prisma.practiceScenario.findFirst({
      where: {
        isPublished: true,
        OR: [
          { scenarioFamily: { contains: profile.mainSkillGoal.substring(0, 5), mode: 'insensitive' } },
          { title: { contains: profile.mainSkillGoal.substring(0, 5), mode: 'insensitive' } },
        ],
      },
    });
  }

  if (!defaultScenario) {
    defaultScenario = await prisma.practiceScenario.findFirst({
      where: { isPublished: true, difficulty: 'FOUNDATIONAL' },
      orderBy: { workshopNumber: 'asc' },
    });
  }

  return {
    targetSkill: profile?.mainSkillGoal || 'Baseline Foundation',
    plainReason: recentSessions.length < 5
      ? `You are currently building your foundational practice baseline (${recentSessions.length}/5 target attempts completed). Start this scenario to establish your score baseline.`
      : `Continue reinforcing your core sales competencies with this recommended scenario.`,
    triggeringEvidence: {
      source: 'BASELINE_RECOMMENDATION',
      completedAttempts: recentSessions.length,
      userGoal: profile?.mainSkillGoal || 'Discovery & Diagnosis',
    },
    suggestedScenarioId: defaultScenario?.id || '',
  };
}
