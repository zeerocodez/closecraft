import prisma from '@/lib/prisma';
import crypto from 'crypto';

export interface IssueCredentialInput {
  userId: string;
  organizationId?: string | null;
  capstoneEvaluationId: string;
  reviewerUserId: string;
  trackTitle: string;
}

export async function issueVerifiableCredential(input: IssueCredentialInput) {
  const { userId, organizationId, capstoneEvaluationId, reviewerUserId, trackTitle } = input;

  // Verify the capstone evaluation
  const evaluation = await prisma.practiceEvaluation.findUnique({
    where: { id: capstoneEvaluationId },
    include: {
      session: {
        include: { scenario: true },
      },
    },
  });

  if (!evaluation) {
    throw new Error('Capstone evaluation record not found.');
  }

  if (evaluation.session.userId !== userId) {
    throw new Error('Evaluation does not belong to the target user.');
  }

  if (evaluation.hasUnresolvedCriticalFlag) {
    throw new Error('Cannot issue credential with unresolved critical safety flags.');
  }

  if (evaluation.totalScore < 12) {
    throw new Error(`Capstone evaluation score (${evaluation.totalScore}/16) does not meet the minimum readiness threshold of 12/16.`);
  }

  // Check if credential already issued for this evaluation (prevent duplicate credential issuance)
  const existing = await prisma.verifiableCredential.findFirst({
    where: { capstoneEvaluationId },
  });

  if (existing) {
    return existing;
  }

  // Generate unique code: DSS-2026-XXXX
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  const uniqueCode = `DSS-2026-${randomHex}`;

  const credential = await prisma.verifiableCredential.create({
    data: {
      uniqueCode,
      userId,
      organizationId: organizationId || null,
      trackTitle,
      capstoneEvaluationId,
      reviewerUserId,
      criterionVersion: evaluation.rubricVersion || 'DSS-8CRIT-V1',
      verifiedScore: evaluation.totalScore,
      status: 'ACTIVE',
      isPublicOptIn: true,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      reviewer: { select: { id: true, name: true, email: true } },
    },
  });

  return credential;
}

export async function getVerifiableCredentialByCode(uniqueCode: string) {
  const credential = await prisma.verifiableCredential.findUnique({
    where: { uniqueCode },
    include: {
      user: { select: { id: true, name: true, email: true } },
      reviewer: { select: { id: true, name: true, email: true } },
      capstoneEvaluation: {
        include: {
          criterionScores: true,
          session: {
            include: { scenario: true },
          },
        },
      },
    },
  });

  if (!credential) {
    return null;
  }

  // If public opt-in is disabled, only return if owner
  return credential;
}
