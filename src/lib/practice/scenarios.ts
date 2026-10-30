import prisma from '@/lib/prisma';
import { DSS_SPRINT_SCENARIOS } from './seed-data';
import { StudentScenarioProjection, RubricCriterionKey, ApprovedOfferFacts } from './types';

/**
 * Projects a raw database scenario into a student-safe projection,
 * ensuring private buyer facts, hidden blockers, and assessment keys NEVER reach the client.
 */
export function projectStudentScenario(rawScenario: any): StudentScenarioProjection {
  const approvedOffer = (typeof rawScenario.approvedOfferFacts === 'string'
    ? JSON.parse(rawScenario.approvedOfferFacts)
    : rawScenario.approvedOfferFacts) as ApprovedOfferFacts;

  const buyerPersona = (typeof rawScenario.buyerPersona === 'string'
    ? JSON.parse(rawScenario.buyerPersona)
    : rawScenario.buyerPersona) || {};

  return {
    id: rawScenario.id,
    slug: rawScenario.slug,
    title: rawScenario.title,
    version: rawScenario.version,
    difficulty: rawScenario.difficulty,
    scenarioFamily: rawScenario.scenarioFamily,
    targetRole: rawScenario.targetRole,
    channel: rawScenario.channel,
    estimatedMinutes: rawScenario.estimatedMinutes,
    maxTurns: rawScenario.maxTurns,
    workshopNumber: rawScenario.workshopNumber,
    workshopTitle: rawScenario.workshopTitle,
    suggestedTrainer: rawScenario.suggestedTrainer,
    studentBrief: rawScenario.studentBrief,
    learningObjective: rawScenario.learningObjective,
    initialMessage: rawScenario.initialMessage,
    approvedOfferFacts: approvedOffer,
    buyerPersona: {
      name: buyerPersona.name || 'Prospect',
      title: buyerPersona.title || 'Decision Maker',
      company: buyerPersona.company || 'Prospective Client',
      temperament: buyerPersona.temperament || 'SKEPTICAL',
    },
    applicableRubricKeys: (rawScenario.applicableRubricKeys || []) as RubricCriterionKey[],
    rubricVersion: rawScenario.rubricVersion || 'DSS-8CRIT-V1',
    isCapstone: Boolean(rawScenario.isCapstone),
    requiredSubmissions: rawScenario.requiredSubmissions || [],
    sourceLessonId: rawScenario.sourceLessonId || null,
    sourceModuleId: rawScenario.sourceModuleId || null,
  };
}

/**
 * Automatically seeds all DSS sprint and draft scenarios if they don't exist yet.
 */
export async function seedScenariosIfEmpty() {
  for (const item of DSS_SPRINT_SCENARIOS) {
    const existing = await prisma.practiceScenario.findUnique({
      where: { slug: item.slug },
    });

    if (!existing) {
      await prisma.practiceScenario.create({
        data: {
          slug: item.slug,
          title: item.title,
          difficulty: item.difficulty,
          scenarioFamily: item.scenarioFamily,
          targetRole: item.targetRole,
          channel: item.channel,
          estimatedMinutes: item.estimatedMinutes,
          maxTurns: item.maxTurns,
          workshopNumber: item.workshopNumber,
          workshopTitle: item.workshopTitle,
          suggestedTrainer: item.suggestedTrainer,
          studentBrief: item.studentBrief,
          learningObjective: item.learningObjective,
          initialMessage: item.initialMessage,
          approvedOfferFacts: item.approvedOfferFacts as any,
          serverBuyerFacts: item.serverBuyerFacts as any,
          buyerPersona: item.buyerPersona as any,
          applicableRubricKeys: item.applicableRubricKeys,
          requiredSubmissions: item.requiredSubmissions || [],
          rubricVersion: 'DSS-8CRIT-V1',
          isCapstone: Boolean(item.isCapstone),
          organizationId: null, // Global DSS curriculum
        },
      });
    }
  }
}

/**
 * Lists scenarios accessible to a user, with optional filters.
 * Returns strictly sanitized student projections.
 */
export async function listAuthorisedScenarios(options?: {
  organizationId?: string | null;
  difficulty?: string;
  workshopNumber?: number;
  scenarioFamily?: string;
  targetRole?: string;
  channel?: string;
  searchQuery?: string;
  isCapstone?: boolean;
}): Promise<StudentScenarioProjection[]> {
  await seedScenariosIfEmpty();

  const whereClause: any = {
    isPublished: true,
    OR: [
      { organizationId: null }, // Global curriculum
    ],
  };

  if (options?.organizationId) {
    whereClause.OR.push({ organizationId: options.organizationId });
  }

  if (options?.difficulty) {
    whereClause.difficulty = options.difficulty;
  }

  if (options?.workshopNumber) {
    whereClause.workshopNumber = options.workshopNumber;
  }

  if (options?.scenarioFamily) {
    whereClause.scenarioFamily = options.scenarioFamily;
  }

  if (options?.targetRole) {
    whereClause.targetRole = options.targetRole;
  }

  if (options?.channel) {
    whereClause.channel = options.channel;
  }

  if (options?.isCapstone !== undefined) {
    whereClause.isCapstone = options.isCapstone;
  }

  if (options?.searchQuery) {
    whereClause.AND = [
      {
        OR: [
          { title: { contains: options.searchQuery, mode: 'insensitive' } },
          { studentBrief: { contains: options.searchQuery, mode: 'insensitive' } },
          { learningObjective: { contains: options.searchQuery, mode: 'insensitive' } },
        ],
      },
    ];
  }

  const scenarios = await prisma.practiceScenario.findMany({
    where: whereClause,
    orderBy: [
      { workshopNumber: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  return scenarios.map(projectStudentScenario);
}
