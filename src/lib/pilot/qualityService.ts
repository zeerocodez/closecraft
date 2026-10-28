import { db } from '@/lib/db';
import { assertWorkspacePermission } from '@/lib/permissions/matrix';

/**
 * QUALITY MANAGEMENT & CONTINUITY SERVICE
 * Reusable call-review scorecards assessing judgment, boundary adherence,
 * and record quality rather than raw close rate alone.
 * Supports operational issues, blocker escalation, and controlled professional replacement.
 */

export async function submitCallQualityReview(reviewerUserId: string, params: {
  organizationId: string;
  engagementId: string;
  professionalId: string;
  leadId?: string;
  judgmentScore: number;
  boundaryAdherenceScore: number;
  recordCompletenessScore: number;
  coachingNotes: string;
  customerSentiment?: 'POSITIVE' | 'NEUTRAL' | 'CRITICAL';
}) {
  await assertWorkspacePermission(params.organizationId, reviewerUserId, 'engagements:review');

  if (params.judgmentScore < 1 || params.judgmentScore > 10) throw new Error('Judgment score must be between 1 and 10');
  if (params.boundaryAdherenceScore < 1 || params.boundaryAdherenceScore > 10) throw new Error('Boundary adherence score must be between 1 and 10');
  if (params.recordCompletenessScore < 1 || params.recordCompletenessScore > 10) throw new Error('Record completeness score must be between 1 and 10');
  if (!params.coachingNotes || params.coachingNotes.trim().length < 5) throw new Error('Detailed coaching notes are required.');

  const review = await db.callQualityReview.create({
    data: {
      organizationId: params.organizationId,
      engagementId: params.engagementId,
      professionalId: params.professionalId,
      reviewerUserId,
      leadId: params.leadId || null,
      judgmentScore: params.judgmentScore,
      boundaryAdherenceScore: params.boundaryAdherenceScore,
      recordCompletenessScore: params.recordCompletenessScore,
      coachingNotes: params.coachingNotes.trim(),
      customerSentiment: params.customerSentiment || 'NEUTRAL',
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorId: reviewerUserId,
      actorType: 'USER',
      action: 'QUALITY_REVIEW_SUBMITTED',
      resourceType: 'CALL_QUALITY_REVIEW',
      resourceId: review.id,
      metadata: JSON.stringify({
        professionalId: params.professionalId,
        judgmentScore: params.judgmentScore,
        boundaryAdherenceScore: params.boundaryAdherenceScore,
      })
    }
  });

  return review;
}

export async function reportOperationalIssue(userId: string, params: {
  organizationId: string;
  engagementId: string;
  title: string;
  category: 'MISSING_CLIENT_INPUT' | 'UNCLEAR_EXPECTATIONS' | 'PROFESSIONAL_CONDUCT' | 'DATA_QUALITY' | 'OTHER';
  description: string;
  reportedByRole: 'CLIENT' | 'PROFESSIONAL' | 'OPERATOR';
}) {
  const issue = await db.operationalIssue.create({
    data: {
      organizationId: params.organizationId,
      engagementId: params.engagementId,
      title: params.title.trim(),
      category: params.category,
      description: params.description.trim(),
      reportedByUserId: userId,
      reportedByRole: params.reportedByRole,
      status: 'OPEN',
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorId: userId,
      actorType: 'USER',
      action: 'OPERATIONAL_ISSUE_REPORTED',
      resourceType: 'OPERATIONAL_ISSUE',
      resourceId: issue.id,
      metadata: JSON.stringify({ title: issue.title, category: issue.category }),
    }
  });

  return issue;
}

export async function resolveOperationalIssue(userId: string, params: {
  issueId: string;
  resolutionNotes: string;
}) {
  const issue = await db.operationalIssue.findUnique({
    where: { id: params.issueId }
  });
  if (!issue) throw new Error('Issue not found');

  await assertWorkspacePermission(issue.organizationId, userId, 'engagements:review');

  const updated = await db.operationalIssue.update({
    where: { id: params.issueId },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolutionNotes: params.resolutionNotes.trim(),
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: issue.organizationId,
      actorId: userId,
      actorType: 'USER',
      action: 'OPERATIONAL_ISSUE_RESOLVED',
      resourceType: 'OPERATIONAL_ISSUE',
      resourceId: issue.id,
      reason: params.resolutionNotes,
    }
  });

  return updated;
}

/**
 * Controlled Professional Replacement Workflow
 * Revokes outgoing professional's access and reassigns opportunities to incoming professional or temporary owner.
 */
export async function replaceEngagementProfessional(operatorUserId: string, params: {
  engagementId: string;
  newProfessionalId: string;
  reason: string;
}) {
  const engagement = await db.pilotEngagement.findUnique({
    where: { id: params.engagementId },
    include: { professional: true }
  });
  if (!engagement) throw new Error('Engagement not found');

  const oldProfessional = engagement.professional;
  const newProfessional = await db.professionalProfile.findUnique({
    where: { id: params.newProfessionalId }
  });
  if (!newProfessional) throw new Error('Replacement candidate not found');

  await db.$transaction(async (tx) => {
    // 1. Revoke old professional's workspace membership if exists
    if (oldProfessional?.userId) {
      await tx.organizationMember.deleteMany({
        where: {
          organizationId: engagement.organizationId,
          userId: oldProfessional.userId,
          role: 'EXTERNAL_PROFESSIONAL'
        }
      });
    }

    // 2. Enroll new professional as EXTERNAL_PROFESSIONAL
    if (newProfessional.userId) {
      await tx.organizationMember.upsert({
        where: {
          userId_organizationId: {
            userId: newProfessional.userId,
            organizationId: engagement.organizationId
          }
        },
        update: { role: 'EXTERNAL_PROFESSIONAL' },
        create: {
          userId: newProfessional.userId,
          organizationId: engagement.organizationId,
          role: 'EXTERNAL_PROFESSIONAL'
        }
      });
    }

    // 3. Reassign active pilot leads to new professional
    await tx.lead.updateMany({
      where: {
        pilotEngagementId: engagement.id,
        ...(oldProfessional?.userId ? { assignedUserId: oldProfessional.userId } : {})
      },
      data: {
        assignedUserId: newProfessional.userId || null
      }
    });

    // 4. Update engagement with new professional
    await tx.pilotEngagement.update({
      where: { id: engagement.id },
      data: {
        professionalId: newProfessional.id,
      }
    });

    // 5. Create handover continuity audit
    await tx.pilotHandover.create({
      data: {
        engagementId: engagement.id,
        type: 'MID_PILOT_CONTINUITY',
        unassignedWorkSummary: `Professional replaced by operator: ${params.reason}`,
        temporaryOwnerUserId: newProfessional.userId || null,
        professionalAccessRevoked: true,
        professionalAccessRevokedAt: new Date(),
      }
    });

    // 6. Audit log
    await tx.auditLog.create({
      data: {
        organizationId: engagement.organizationId,
        actorId: operatorUserId,
        actorType: 'USER',
        actorRole: 'OPERATOR',
        action: 'PROFESSIONAL_REPLACED',
        resourceType: 'PILOT_ENGAGEMENT',
        resourceId: engagement.id,
        reason: params.reason,
        metadata: JSON.stringify({
          previousProfessionalId: oldProfessional?.id,
          newProfessionalId: newProfessional.id,
        })
      }
    });
  });

  return { success: true, newProfessionalId: newProfessional.id };
}
