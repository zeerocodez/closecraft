import { db } from '@/lib/db';
import { MilestoneStatus, GrowthServiceType } from '@prisma/client';

export interface SubmitDeliverableInput {
  milestoneId: string;
  partnerUserId: string;
  proofUrl: string;
  submissionNotes?: string;
}

export interface ReviewMilestoneInput {
  milestoneId: string;
  reviewerUserId: string;
  organizationId: string;
  action: 'APPROVE' | 'REQUEST_REVISION';
  feedback?: string;
}

/**
 * Submits a deliverable for client review by the assigned partner.
 */
export async function submitMilestoneDeliverable(input: SubmitDeliverableInput) {
  const { milestoneId, partnerUserId, proofUrl, submissionNotes } = input;

  if (!proofUrl || !proofUrl.trim()) {
    throw new Error('Deliverable proof URL is required (e.g. Figma link, Loom review, asset folder).');
  }

  const milestone = await db.projectMilestone.findUnique({
    where: { id: milestoneId },
    include: {
      projectRequest: {
        include: {
          assignedPartner: true,
        },
      },
    },
  });

  if (!milestone) {
    throw new Error(`Milestone ${milestoneId} not found.`);
  }

  // Authorization: must be the assigned partner or operator/admin
  const isAssignedPartner = milestone.projectRequest.assignedPartner?.userId === partnerUserId;
  const user = await db.user.findUnique({ where: { id: partnerUserId }, select: { role: true } });
  const isOperator = user && ['OPERATOR', 'SUPER_ADMIN', 'ADMIN'].includes(user.role);

  if (!isAssignedPartner && !isOperator) {
    throw new Error('Unauthorized: Only the assigned partner or operator can submit milestone deliverables.');
  }

  const updated = await db.$transaction(async (tx) => {
    const ms = await tx.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        status: 'SUBMITTED',
        proofUrl: proofUrl.trim(),
        reviewNotes: submissionNotes?.trim() || null,
        submittedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: milestone.projectRequest.organizationId,
        actorId: partnerUserId,
        actorType: 'USER',
        action: 'MILESTONE_DELIVERABLE_SUBMITTED',
        resourceType: 'PROJECT_MILESTONE',
        resourceId: milestoneId,
        metadata: JSON.stringify({
          title: ms.title,
          proofUrl: ms.proofUrl,
          sequenceOrder: ms.sequenceOrder,
        }),
      },
    });

    return ms;
  });

  return updated;
}

/**
 * Reviews a submitted milestone deliverable:
 * - 'APPROVE': Sets status to APPROVED and completedAt. If all milestones are approved, advances ProjectRequest to COMPLETED.
 * - 'REQUEST_REVISION': Sets status to REVISION and stores clientFeedback.
 */
export async function reviewMilestoneDeliverable(input: ReviewMilestoneInput) {
  const { milestoneId, reviewerUserId, organizationId, action, feedback } = input;

  const milestone = await db.projectMilestone.findUnique({
    where: { id: milestoneId },
    include: {
      projectRequest: {
        include: {
          milestones: true,
        },
      },
    },
  });

  if (!milestone) {
    throw new Error(`Milestone ${milestoneId} not found.`);
  }

  // Tenant Isolation: Reviewer must belong to the project request's organization
  if (milestone.projectRequest.organizationId !== organizationId) {
    throw new Error('Unauthorized: You cannot review deliverables belonging to another organization.');
  }

  if (action === 'APPROVE') {
    const updated = await db.$transaction(async (tx) => {
      const ms = await tx.projectMilestone.update({
        where: { id: milestoneId },
        data: {
          status: 'APPROVED',
          clientApproved: true,
          reviewedByUserId: reviewerUserId,
          completedAt: new Date(),
          clientFeedback: feedback?.trim() || null,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId,
          actorId: reviewerUserId,
          actorType: 'USER',
          action: 'MILESTONE_APPROVED',
          resourceType: 'PROJECT_MILESTONE',
          resourceId: milestoneId,
          metadata: JSON.stringify({ title: ms.title, sequenceOrder: ms.sequenceOrder }),
        },
      });

      // Check if all milestones are now approved
      const allMilestones = await tx.projectMilestone.findMany({
        where: { projectRequestId: milestone.projectRequestId },
      });

      const allApproved = allMilestones.every((m) => m.id === milestoneId || m.status === 'APPROVED');

      if (allApproved && allMilestones.length > 0) {
        await tx.projectRequest.update({
          where: { id: milestone.projectRequestId },
          data: { status: 'COMPLETED' },
        });

        await tx.auditLog.create({
          data: {
            organizationId,
            actorId: reviewerUserId,
            actorType: 'USER',
            action: 'PROJECT_REQUEST_COMPLETED',
            resourceType: 'PROJECT_REQUEST',
            resourceId: milestone.projectRequestId,
            metadata: JSON.stringify({ completedAt: new Date(), milestoneCount: allMilestones.length }),
          },
        });
      }

      return ms;
    });

    return {
      success: true,
      action: 'APPROVE',
      milestone: updated,
    };
  }

  if (action === 'REQUEST_REVISION') {
    const updated = await db.$transaction(async (tx) => {
      const ms = await tx.projectMilestone.update({
        where: { id: milestoneId },
        data: {
          status: 'REVISION',
          clientApproved: false,
          clientFeedback: feedback?.trim() || 'Client requested revisions.',
          reviewedByUserId: reviewerUserId,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId,
          actorId: reviewerUserId,
          actorType: 'USER',
          action: 'MILESTONE_REVISION_REQUESTED',
          resourceType: 'PROJECT_MILESTONE',
          resourceId: milestoneId,
          metadata: JSON.stringify({ title: ms.title, feedback }),
        },
      });

      return ms;
    });

    return {
      success: true,
      action: 'REQUEST_REVISION',
      milestone: updated,
    };
  }

  throw new Error(`Invalid milestone review action: ${action}`);
}
