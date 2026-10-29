'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { projectStudentScenario, listAuthorisedScenarios, seedScenariosIfEmpty } from '@/lib/practice/scenarios';
import { generateBuyerResponse } from '@/lib/practice/simulation';
import { evaluatePracticeSession } from '@/lib/practice/evaluation';
import { calculateComparableTrend, computeCoachRecommendation } from '@/lib/practice/analytics';
import { issueVerifiableCredential } from '@/lib/practice/credentials';
import { ApprovedOfferFacts, ServerBuyerFacts, BuyerPersona, RubricCriterionKey } from '@/lib/practice/types';

/**
 * Ensures user is authenticated and returns user details.
 */
async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized: please sign in to access practical training.');
  }
  return {
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
    organizationId: (session as any)?.organizationId as string | undefined,
    userRole: (session as any)?.role || 'USER',
  };
}

/**
 * Saves or updates onboarding purpose and learner profile.
 */
export async function saveLearnerOnboardingPurpose(data: {
  onboardingPurpose: 'SKILLS_DEVELOPMENT' | 'BUSINESS_PROCESS';
  targetRole?: string;
  currentExperience?: string;
  preferredChannel?: string;
  mainSkillGoal?: string;
  availablePracticeMinutes?: number;
  timeZone?: string;
  currency?: string;
}) {
  const { userId } = await requireAuth();

  const profile = await prisma.learnerProfile.upsert({
    where: { userId },
    create: {
      userId,
      onboardingPurpose: data.onboardingPurpose,
      targetRole: data.targetRole || 'Appointment Setter',
      currentExperience: data.currentExperience || 'BEGINNER',
      preferredChannel: data.preferredChannel || 'WHATSAPP',
      mainSkillGoal: data.mainSkillGoal || 'Discovery & Diagnosis',
      availablePracticeMinutes: data.availablePracticeMinutes || 15,
      timeZone: data.timeZone || 'Africa/Lagos',
      currency: data.currency || 'NGN',
    },
    update: {
      onboardingPurpose: data.onboardingPurpose,
      targetRole: data.targetRole,
      currentExperience: data.currentExperience,
      preferredChannel: data.preferredChannel,
      mainSkillGoal: data.mainSkillGoal,
      availablePracticeMinutes: data.availablePracticeMinutes,
      timeZone: data.timeZone,
      currency: data.currency,
    },
  });

  revalidatePath('/practice');
  return { success: true, profile };
}

/**
 * Retrieves the current learner profile.
 */
export async function getLearnerProfile() {
  const { userId } = await requireAuth();
  return prisma.learnerProfile.findUnique({
    where: { userId },
  });
}

/**
 * Lists authorised scenarios for the active user (sanitized projections).
 */
export async function getAuthorisedScenarios(filters?: {
  difficulty?: string;
  workshopNumber?: number;
  scenarioFamily?: string;
  targetRole?: string;
  channel?: string;
  searchQuery?: string;
  isCapstone?: boolean;
}) {
  const { organizationId } = await requireAuth();
  return listAuthorisedScenarios({
    ...filters,
    organizationId,
  });
}

/**
 * Starts or resumes a practice session.
 */
export async function startPracticeSession(data: {
  scenarioId: string;
  parentAttemptId?: string;
  changedCondition?: string;
  mode?: 'PRACTICE' | 'DRILL' | 'ASSIGNMENT' | 'CAPSTONE';
  assignmentId?: string;
}) {
  const { userId, organizationId } = await requireAuth();
  await seedScenariosIfEmpty();

  const scenario = await prisma.practiceScenario.findUnique({
    where: { id: data.scenarioId },
  });

  if (!scenario) {
    throw new Error('Scenario not found.');
  }

  // Tenant access check: if scenario belongs to an organization, user must belong to it
  if (scenario.organizationId && scenario.organizationId !== organizationId) {
    throw new Error('Forbidden: you do not have access to this organization scenario.');
  }

  // If retrying, check parent attempt
  let parentAttempt = null;
  if (data.parentAttemptId) {
    parentAttempt = await prisma.practiceSession.findUnique({
      where: { id: data.parentAttemptId },
    });
    if (parentAttempt && parentAttempt.userId !== userId) {
      throw new Error('Forbidden: cannot retry an attempt that does not belong to you.');
    }
  }

  // Create session
  const session = await prisma.practiceSession.create({
    data: {
      userId,
      scenarioId: data.scenarioId,
      organizationId: scenario.organizationId || organizationId || null,
      scenarioVersion: scenario.version,
      rubricVersion: scenario.rubricVersion,
      status: 'IN_PROGRESS',
      mode: data.mode || (scenario.isCapstone ? 'CAPSTONE' : 'PRACTICE'),
      parentAttemptId: data.parentAttemptId || null,
      changedCondition: data.changedCondition || null,
      assignmentId: data.assignmentId || null,
      currentTurnCount: 1,
    },
  });

  // Seed the initial turn from the buyer
  await prisma.practiceTurn.create({
    data: {
      sessionId: session.id,
      turnNumber: 1,
      senderType: 'BUYER',
      content: scenario.initialMessage,
    },
  });

  revalidatePath('/practice');
  return {
    sessionId: session.id,
    scenario: projectStudentScenario(scenario),
    initialTurn: {
      turnNumber: 1,
      senderType: 'BUYER',
      content: scenario.initialMessage,
    },
  };
}

/**
 * Submits a student turn and retrieves the buyer's response.
 * Idempotent with clientRequestId to prevent duplicate turn submissions.
 */
export async function submitPracticeTurn(data: {
  sessionId: string;
  clientRequestId: string;
  content: string;
}) {
  const { userId } = await requireAuth();

  const session = await prisma.practiceSession.findUnique({
    where: { id: data.sessionId },
    include: {
      scenario: true,
      turns: { orderBy: { turnNumber: 'asc' } },
    },
  });

  if (!session) {
    throw new Error('Practice session not found.');
  }

  if (session.userId !== userId) {
    throw new Error('Forbidden: this practice session belongs to another user.');
  }

  if (session.status === 'COMPLETED') {
    throw new Error('This practice session has already been completed.');
  }

  // Idempotency check: if clientRequestId already processed, return existing turns
  const existingTurn = session.turns.find((t) => t.clientRequestId === data.clientRequestId);
  if (existingTurn) {
    const nextBuyerTurn = session.turns.find(
      (t) => t.turnNumber === existingTurn.turnNumber + 1 && t.senderType === 'BUYER'
    );
    return {
      success: true,
      studentTurn: existingTurn,
      buyerTurn: nextBuyerTurn || null,
      turnCount: session.turns.length,
      maxTurns: session.scenario.maxTurns,
    };
  }

  const nextTurnNumber = session.turns.length + 1;

  // 1. Persist the student turn first
  const studentTurn = await prisma.practiceTurn.create({
    data: {
      sessionId: session.id,
      turnNumber: nextTurnNumber,
      senderType: 'STUDENT',
      content: data.content.trim(),
      clientRequestId: data.clientRequestId,
    },
  });

  // 2. Generate the buyer response
  const history = [
    ...session.turns.map((t) => ({
      senderType: t.senderType as 'STUDENT' | 'BUYER',
      content: t.content,
    })),
    { senderType: 'STUDENT' as const, content: data.content.trim() },
  ];

  const approvedOffer = session.scenario.approvedOfferFacts as unknown as ApprovedOfferFacts;
  const serverBuyerFacts = session.scenario.serverBuyerFacts as unknown as ServerBuyerFacts;
  const buyerPersona = session.scenario.buyerPersona as unknown as BuyerPersona;

  const buyerResponse = await generateBuyerResponse({
    scenarioTitle: session.scenario.title,
    scenarioDifficulty: session.scenario.difficulty,
    studentBrief: session.scenario.studentBrief,
    approvedOfferFacts: approvedOffer,
    serverBuyerFacts: serverBuyerFacts,
    buyerPersona: buyerPersona,
    history,
    studentMessage: data.content.trim(),
    turnNumber: nextTurnNumber,
    maxTurns: session.scenario.maxTurns,
  });

  // 3. Persist buyer turn
  const buyerTurnNumber = nextTurnNumber + 1;
  const buyerTurn = await prisma.practiceTurn.create({
    data: {
      sessionId: session.id,
      turnNumber: buyerTurnNumber,
      senderType: 'BUYER',
      content: buyerResponse.buyerReply,
      revealedFacts: buyerResponse.revealedFacts,
    },
  });

  await prisma.practiceSession.update({
    where: { id: session.id },
    data: {
      currentTurnCount: buyerTurnNumber,
    },
  });

  return {
    success: true,
    studentTurn,
    buyerTurn,
    isEndingTurn: buyerResponse.isEndingTurn || buyerTurnNumber >= session.scenario.maxTurns,
    turnCount: buyerTurnNumber,
    maxTurns: session.scenario.maxTurns,
  };
}

/**
 * Finishes the session, persists the transcript, and evaluates against the 8-criterion rubric.
 */
export async function finishAndEvaluateSession(sessionId: string) {
  const { userId } = await requireAuth();

  const session = await prisma.practiceSession.findUnique({
    where: { id: sessionId },
    include: {
      scenario: true,
      turns: { orderBy: { turnNumber: 'asc' } },
    },
  });

  if (!session) {
    throw new Error('Session not found.');
  }

  if (session.userId !== userId) {
    throw new Error('Forbidden: this session belongs to another user.');
  }

  // Mark session as completed
  await prisma.practiceSession.update({
    where: { id: sessionId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  const approvedOffer = session.scenario.approvedOfferFacts as unknown as ApprovedOfferFacts;
  const serverBuyerFacts = session.scenario.serverBuyerFacts as unknown as ServerBuyerFacts;
  const applicableKeys = session.scenario.applicableRubricKeys as RubricCriterionKey[];

  const transcript = session.turns.map((t) => ({
    id: t.id,
    turnNumber: t.turnNumber,
    senderType: t.senderType as 'STUDENT' | 'BUYER' | 'SYSTEM',
    content: t.content,
    createdAt: t.createdAt,
    clientRequestId: t.clientRequestId,
  }));

  try {
    const evalResult = await evaluatePracticeSession({
      scenarioTitle: session.scenario.title,
      learningObjective: session.scenario.learningObjective,
      applicableCriteria: applicableKeys,
      approvedOfferFacts: approvedOffer,
      serverBuyerFacts: serverBuyerFacts,
      transcript,
      isCapstone: session.scenario.isCapstone,
    });

    // Save evaluation record and criterion scores
    const savedEvaluation = await prisma.practiceEvaluation.create({
      data: {
        sessionId: session.id,
        evaluationVersion: 1,
        state: 'COMPLETED',
        promptVersion: 'EVAL-2026.1',
        scenarioVersion: session.scenarioVersion,
        rubricVersion: session.rubricVersion,
        totalScore: evalResult.totalScore,
        maxPossibleScore: evalResult.maxPossibleScore,
        percentage: evalResult.percentage,
        passedThreshold: evalResult.passedThreshold,
        objectiveOutcome: evalResult.objectiveOutcome,
        strongestBehaviour: evalResult.strongestBehaviour,
        prioritisedCorrection: evalResult.prioritisedCorrection,
        evidenceForCorrection: evalResult.evidenceForCorrection,
        improvedResponseExample: evalResult.improvedResponseExample,
        followUpExerciseSuggestion: evalResult.followUpExerciseSuggestion,
        criticalFlags: evalResult.criticalFlags as any,
        hasUnresolvedCriticalFlag: evalResult.hasUnresolvedCriticalFlag,
        evaluatorRole: 'AI',
        criterionScores: {
          create: evalResult.criterionScores.map((c) => ({
            criterionKey: c.criterionKey,
            criterionLabel: c.criterionLabel,
            score: c.score,
            isApplicable: c.isApplicable,
            observedEvidence: c.observedEvidence,
            quotedTurnIds: c.quotedTurnIds,
            reasoning: c.reasoning,
            evidenceSufficiency: c.evidenceSufficiency,
          })),
        },
      },
      include: {
        criterionScores: true,
      },
    });

    // Check if this was an assignment and update assignment status
    if (session.assignmentId) {
      await prisma.practiceAssignment.update({
        where: { id: session.assignmentId },
        data: { status: 'SUBMITTED' },
      });
    }

    // Update coach recommendation asynchronously
    const recommendation = await computeCoachRecommendation(userId);
    if (recommendation.suggestedScenarioId) {
      await prisma.coachRecommendation.create({
        data: {
          userId,
          targetSkill: recommendation.targetSkill,
          plainReason: recommendation.plainReason,
          triggeringEvidence: recommendation.triggeringEvidence as any,
          suggestedScenarioId: recommendation.suggestedScenarioId,
          status: 'ACTIVE',
        },
      });
    }

    revalidatePath('/practice');
    revalidatePath('/practice/intelligence');
    revalidatePath('/practice/coach');

    return {
      success: true,
      evaluation: savedEvaluation,
    };
  } catch (err: any) {
    console.error('[finishAndEvaluateSession] Evaluation error:', err);
    // Honest failure state: record failed evaluation, do not convert to 0 score!
    const failedEval = await prisma.practiceEvaluation.create({
      data: {
        sessionId: session.id,
        state: 'FAILED',
        errorMessage: err.message || 'Evaluation service temporarily unavailable.',
        objectiveOutcome: 'Evaluation unavailable',
        strongestBehaviour: 'Transcript recorded successfully.',
        prioritisedCorrection: 'Awaiting retry or manual trainer review.',
        evidenceForCorrection: 'Evaluation service timed out.',
        improvedResponseExample: 'Example unavailable during evaluation service disruption.',
        totalScore: 0,
        maxPossibleScore: session.scenario.applicableRubricKeys.length * 2,
        percentage: 0,
      },
    });

    return {
      success: false,
      evaluation: failedEval,
      error: 'Evaluation service temporarily unavailable. Your transcript is saved.',
    };
  }
}

/**
 * Retrieves the full review data for a practice session attempt.
 */
export async function getPracticeAttemptReview(sessionId: string) {
  const { userId, userRole, organizationId } = await requireAuth();

  const session = await prisma.practiceSession.findUnique({
    where: { id: sessionId },
    include: {
      scenario: true,
      turns: { orderBy: { turnNumber: 'asc' } },
      evaluations: {
        orderBy: { evaluationVersion: 'desc' },
        include: {
          criterionScores: true,
          reviewer: { select: { id: true, name: true, role: true } },
        },
      },
      parentAttempt: {
        include: {
          scenario: true,
          evaluations: { take: 1, orderBy: { evaluationVersion: 'desc' } },
        },
      },
      retries: {
        include: {
          evaluations: { take: 1, orderBy: { evaluationVersion: 'desc' } },
        },
      },
    },
  });

  if (!session) {
    throw new Error('Attempt not found.');
  }

  // Personal privacy check: personal practice is private unless submitted as an assignment
  const isOwner = session.userId === userId;
  const isTrainerOrManager =
    ['ADMIN', 'SUPER_ADMIN', 'OPERATOR', 'MANAGER'].includes(userRole) &&
    session.organizationId === organizationId;

  if (!isOwner && !isTrainerOrManager && !session.assignmentId) {
    throw new Error('Forbidden: you do not have permission to inspect this attempt.');
  }

  return {
    session: {
      id: session.id,
      scenarioId: session.scenarioId,
      scenarioTitle: session.scenario.title,
      scenarioSlug: session.scenario.slug,
      difficulty: session.scenario.difficulty,
      rubricVersion: session.rubricVersion,
      status: session.status,
      mode: session.mode,
      changedCondition: session.changedCondition,
      parentAttemptId: session.parentAttemptId,
      createdAt: session.createdAt,
      completedAt: session.completedAt,
    },
    scenario: projectStudentScenario(session.scenario),
    turns: session.turns,
    latestEvaluation: session.evaluations[0] || null,
    evaluationHistory: session.evaluations,
    parentAttempt: session.parentAttempt,
    retries: session.retries,
  };
}

/**
 * Fetches Performance Intelligence data (like-with-like comparable trend + evidence history).
 */
export async function getPerformanceIntelligenceData(options?: {
  scenarioFamily?: string;
  rubricVersion?: string;
  difficulty?: string;
}) {
  const { userId } = await requireAuth();

  const trend = await calculateComparableTrend(userId, options);

  const completedSessions = await prisma.practiceSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
    include: {
      scenario: {
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          scenarioFamily: true,
          workshopNumber: true,
        },
      },
      evaluations: {
        where: { state: 'COMPLETED' },
        orderBy: { evaluationVersion: 'desc' },
        take: 1,
        include: {
          criterionScores: true,
          reviewer: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  return {
    trend,
    attempts: completedSessions.map((s) => ({
      sessionId: s.id,
      scenarioTitle: s.scenario.title,
      scenarioSlug: s.scenario.slug,
      difficulty: s.scenario.difficulty,
      scenarioFamily: s.scenario.scenarioFamily,
      workshopNumber: s.scenario.workshopNumber,
      completedAt: s.completedAt,
      evaluation: s.evaluations[0] || null,
    })),
  };
}

/**
 * Fetches the active Coach Plan for the user.
 */
export async function getCoachPlanData() {
  const { userId } = await requireAuth();

  // Active recommendation
  let activeRec = await prisma.coachRecommendation.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { suggestedScenario: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!activeRec) {
    const computed = await computeCoachRecommendation(userId);
    if (computed.suggestedScenarioId) {
      activeRec = await prisma.coachRecommendation.create({
        data: {
          userId,
          targetSkill: computed.targetSkill,
          plainReason: computed.plainReason,
          triggeringEvidence: computed.triggeringEvidence as any,
          suggestedScenarioId: computed.suggestedScenarioId,
          status: 'ACTIVE',
        },
        include: { suggestedScenario: true },
      });
    }
  }

  // Pending assignments
  const dueAssignments = await prisma.practiceAssignment.findMany({
    where: {
      assignedToUserId: userId,
      status: 'PENDING',
    },
    include: { scenario: true, assignedByUser: { select: { name: true } } },
    orderBy: { dueDate: 'asc' },
  });

  // Recent unfinished session to resume
  const unfinishedSession = await prisma.practiceSession.findFirst({
    where: { userId, status: 'IN_PROGRESS' },
    include: { scenario: true },
    orderBy: { updatedAt: 'desc' },
  });

  return {
    recommendation: activeRec
      ? {
          id: activeRec.id,
          targetSkill: activeRec.targetSkill,
          plainReason: activeRec.plainReason,
          triggeringEvidence: activeRec.triggeringEvidence,
          suggestedScenario: activeRec.suggestedScenario
            ? projectStudentScenario(activeRec.suggestedScenario)
            : null,
          createdAt: activeRec.createdAt,
        }
      : null,
    dueAssignments: dueAssignments.map((a) => ({
      id: a.id,
      title: a.title,
      dueDate: a.dueDate,
      scenario: projectStudentScenario(a.scenario),
      assignedBy: a.assignedByUser.name || 'Trainer',
    })),
    unfinishedSession: unfinishedSession
      ? {
          id: unfinishedSession.id,
          scenarioTitle: unfinishedSession.scenario.title,
          currentTurnCount: unfinishedSession.currentTurnCount,
          maxTurns: unfinishedSession.scenario.maxTurns,
          updatedAt: unfinishedSession.updatedAt,
        }
      : null,
  };
}

/**
 * Submits a human trainer review or correction on an assessed session.
 */
export async function submitTrainerReview(data: {
  evaluationId: string;
  reviewerDecision: 'APPROVED' | 'CORRECTION_REQUESTED' | 'REASSESSMENT_REQUIRED';
  reviewerNotes: string;
  amendedScores?: Array<{ criterionKey: string; score: 0 | 1 | 2; reasoning?: string }>;
}) {
  const { userId, userRole } = await requireAuth();

  const isTrainer = ['ADMIN', 'SUPER_ADMIN', 'OPERATOR', 'MANAGER'].includes(userRole);
  if (!isTrainer) {
    throw new Error('Forbidden: only authorised trainers and operators can submit official reviews.');
  }

  const evaluation = await prisma.practiceEvaluation.findUnique({
    where: { id: data.evaluationId },
    include: { criterionScores: true },
  });

  if (!evaluation) {
    throw new Error('Evaluation record not found.');
  }

  // Update criterion scores if amended
  if (data.amendedScores && data.amendedScores.length > 0) {
    for (const amended of data.amendedScores) {
      await prisma.practiceCriterionScore.updateMany({
        where: {
          evaluationId: evaluation.id,
          criterionKey: amended.criterionKey,
        },
        data: {
          score: amended.score,
          ...(amended.reasoning ? { reasoning: amended.reasoning } : {}),
        },
      });
    }
  }

  // Recalculate totals
  const updatedScores = await prisma.practiceCriterionScore.findMany({
    where: { evaluationId: evaluation.id },
  });

  const totalScore = updatedScores.reduce((sum, c) => sum + c.score, 0);
  const percentage = Math.round((totalScore / evaluation.maxPossibleScore) * 100);

  const updatedEval = await prisma.practiceEvaluation.update({
    where: { id: evaluation.id },
    data: {
      reviewerId: userId,
      reviewerDecision: data.reviewerDecision,
      reviewerNotes: data.reviewerNotes,
      reviewedAt: new Date(),
      totalScore,
      percentage,
      passedThreshold: totalScore >= 12 && !evaluation.hasUnresolvedCriticalFlag,
    },
  });

  revalidatePath('/practice/readiness');
  return { success: true, evaluation: updatedEval };
}

/**
 * Issues a verifiable credential following an approved capstone review.
 */
export async function issueCredentialAction(data: {
  userId: string;
  capstoneEvaluationId: string;
  trackTitle: string;
}) {
  const { userId: reviewerUserId, userRole, organizationId } = await requireAuth();

  const isAuthorisedReviewer = ['ADMIN', 'SUPER_ADMIN', 'OPERATOR', 'MANAGER'].includes(userRole);
  if (!isAuthorisedReviewer) {
    throw new Error('Forbidden: client browsers cannot issue authoritative credentials.');
  }

  const credential = await issueVerifiableCredential({
    userId: data.userId,
    organizationId,
    capstoneEvaluationId: data.capstoneEvaluationId,
    reviewerUserId,
    trackTitle: data.trackTitle,
  });

  revalidatePath('/practice/readiness');
  return { success: true, credential };
}

/**
 * Creates an organization-scoped Sales Playbook.
 */
export async function createSalesPlaybookAction(data: {
  title: string;
  offerBrief: string;
  targetIcp?: string;
  pricingTerms?: any;
  commonObjections?: any;
  sourceDocumentName?: string;
}) {
  const { userId, organizationId, userRole } = await requireAuth();
  if (!organizationId) {
    throw new Error('An active organization context is required to create sales playbooks.');
  }

  const isManager = ['OWNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(userRole);
  if (!isManager) {
    throw new Error('Forbidden: only managers can create organization sales playbooks.');
  }

  const playbook = await prisma.salesPlaybook.create({
    data: {
      organizationId,
      createdById: userId,
      title: data.title.trim(),
      offerBrief: data.offerBrief.trim(),
      targetIcp: data.targetIcp?.trim() || null,
      pricingTerms: data.pricingTerms || null,
      commonObjections: data.commonObjections || null,
      sourceDocumentName: data.sourceDocumentName || null,
      status: 'ACTIVE',
    },
  });

  revalidatePath('/practice/playbooks');
  return { success: true, playbook };
}

/**
 * CRM Integration: "Prepare for conversation" tool.
 * Reads a lead (verifying tenant ownership) and creates a private rehearsal session.
 */
export async function prepareForCrmOpportunity(leadId: string) {
  const { userId, organizationId } = await requireAuth();
  if (!organizationId) {
    throw new Error('Organization context required.');
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead || lead.organizationId !== organizationId) {
    throw new Error('Lead not found or access denied.');
  }

  // Create or retrieve a customized rehearsal scenario based on the lead
  const slug = `rehearsal-lead-${lead.id.substring(0, 8)}`;
  let scenario = await prisma.practiceScenario.findUnique({
    where: { slug },
  });

  if (!scenario) {
    scenario = await prisma.practiceScenario.create({
      data: {
        slug,
        title: `Rehearsal: ${lead.name} (${lead.source || 'Inbound'})`,
        difficulty: 'INTERMEDIATE',
        scenarioFamily: 'CRM_OPPORTUNITY_PREP',
        targetRole: 'CLOSER',
        channel: 'WHATSAPP',
        estimatedMinutes: 8,
        maxTurns: 5,
        studentBrief: `You have an active selling conversation coming up with ${lead.name}. Stated inquiry: "${lead.message || 'Expressed interest in sales support.'}". Prepare by qualifying their timeline, diagnosing bottlenecks, and booking a clear next milestone.`,
        learningObjective: 'Diagnose specific operational fit, handle pricing questions, and establish mutual decision criteria.',
        initialMessage: `Hi, I was looking at your solution after our inquiry about "${lead.message?.substring(0, 40) || 'pricing'}". We are comparing two providers. What specifically makes you different?`,
        approvedOfferFacts: {
          name: 'Closecraft Inbound Acceleration',
          price: lead.estimatedValue ? `₦${lead.estimatedValue.toLocaleString()}` : '₦250,000 / mo',
          currency: lead.currency || 'NGN',
          scope: ['Direct WhatsApp integration', 'Lead qualification routing', 'Closer appointment booking'],
          exclusions: ['No generic guarantees without lead volume'],
          deliveryPrerequisites: ['Verified business WhatsApp number'],
          explicitlyUnknownTerms: ['Competitor feature roadmaps'],
        },
        serverBuyerFacts: {
          realPain: 'Losing high intent leads due to slow response times.',
          actualBudget: 'Approved commercial budget.',
          decisionProcess: 'Needs operational confirmation before signing.',
          hiddenBlockers: ['Skeptical of prolonged setup disruption.'],
        },
        buyerPersona: {
          name: lead.name,
          title: 'Prospective Client',
          company: 'Prospective Business',
          temperament: 'ANALYTICAL',
          communicationStyle: 'Direct, busy, values clarity.',
          boundaryConditions: ['Wants specific answers, not generic pitch slides.'],
        },
        applicableRubricKeys: ['buyer_fit_qualification', 'discovery', 'decision_commercial'],
        rubricVersion: 'DSS-8CRIT-V1',
        isCapstone: false,
        organizationId,
      },
    });
  }

  return startPracticeSession({
    scenarioId: scenario.id,
    mode: 'PRACTICE',
  });
}
