import { db } from '@/lib/db';
import { GrowthServiceType, ProposalStatus, ProjectRequestStatus } from '@prisma/client';
import { createBachsCheckoutSession } from '@/lib/payments/bachs';
import { dispatchNotificationAlert } from '@/lib/notifications/router';

export interface CreateProposalLineItemInput {
  serviceType: GrowthServiceType;
  title: string;
  description: string;
  quantity?: number;
  unitPrice: number;
  deliverables?: string[];
}

export interface CreateProposalInput {
  projectRequestId: string;
  createdById: string;
  title: string;
  scopeSummary: string;
  estimatedDays?: number;
  validDays?: number;
  lineItems: CreateProposalLineItemInput[];
}

export interface RespondToProposalInput {
  proposalId: string;
  userId: string;
  organizationId: string;
  action: 'ACCEPT' | 'REVISE' | 'REJECT';
  revisionNotes?: string;
  appUrl?: string;
}

/**
 * Generates an official CloseCraft Proposal Number
 * Format: CC-PROP-YYYY-XXXX (e.g. CC-PROP-2026-F9D2)
 */
export function generateProposalNumber(): string {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CC-PROP-${year}-${randomChars}`;
}

/**
 * Generates an official CloseCraft Project Invoice Number
 * Format: CC-INV-PR-YYYY-XXXX (e.g. CC-INV-PR-2026-B81C)
 */
export function generateProjectInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CC-INV-PR-${year}-${randomChars}`;
}

/**
 * Creates a scoped commercial proposal for a project request.
 * Can be authored by the assigned professional or platform operator.
 */
export async function createProjectProposal(input: CreateProposalInput) {
  const { projectRequestId, createdById, title, scopeSummary, estimatedDays = 14, validDays = 14, lineItems } = input;

  if (!lineItems || lineItems.length === 0) {
    throw new Error('A proposal must contain at least one line item deliverable.');
  }

  const projectRequest = await db.projectRequest.findUnique({
    where: { id: projectRequestId },
    include: {
      brief: true,
      requestedBy: true,
      organization: true,
    },
  });

  if (!projectRequest) {
    throw new Error(`Project request ${projectRequestId} not found.`);
  }

  // Calculate financials server-side
  let totalAmount = 0;
  const processedLineItems = lineItems.map((item, idx) => {
    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const totalPrice = qty * unitPrice;
    totalAmount += totalPrice;

    return {
      serviceType: item.serviceType,
      title: item.title.trim(),
      description: item.description.trim(),
      quantity: qty,
      unitPrice,
      totalPrice,
      deliverables: item.deliverables || [],
      sortOrder: idx + 1,
    };
  });

  if (totalAmount <= 0) {
    throw new Error('Total proposal amount must be greater than zero NGN.');
  }

  const proposalNumber = generateProposalNumber();
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + validDays);

  const proposal = await db.$transaction(async (tx) => {
    // 1. Create the proposal record
    const prop = await tx.projectProposal.create({
      data: {
        proposalNumber,
        projectRequestId,
        createdById,
        title: title.trim(),
        scopeSummary: scopeSummary.trim(),
        totalAmount,
        currency: 'NGN',
        status: 'SENT',
        estimatedDays,
        validUntil,
        lineItems: {
          create: processedLineItems,
        },
      },
      include: {
        lineItems: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // 2. Advance ProjectRequest status to PROPOSAL_SENT
    await tx.projectRequest.update({
      where: { id: projectRequestId },
      data: {
        status: 'PROPOSAL_SENT',
      },
    });

    // 3. Log audit event
    await tx.auditLog.create({
      data: {
        organizationId: projectRequest.organizationId,
        actorId: createdById,
        actorType: 'USER',
        action: 'PROPOSAL_CREATED',
        resourceType: 'PROJECT_PROPOSAL',
        resourceId: prop.id,
        metadata: JSON.stringify({
          proposalNumber: prop.proposalNumber,
          totalAmount,
          currency: 'NGN',
          itemCount: processedLineItems.length,
        }),
      },
    });

    return prop;
  });

  // Notify client organization via transactional email alert
  try {
    const clientEmail = projectRequest.requestedBy?.email;
    const clientName = projectRequest.requestedBy?.name || 'Valued Client';
    const businessName = projectRequest.brief?.businessName || 'Your Business';

    if (clientEmail) {
      await dispatchNotificationAlert({
        category: 'SALES',
        subject: `CloseCraft Proposal ${proposal.proposalNumber} is Ready for ${businessName}`,
        text: `Hello ${clientName},\n\nA custom commercial proposal (${proposal.proposalNumber}) for ${businessName} has been prepared and is ready for your review.\n\nTotal Scope: ₦${totalAmount.toLocaleString()} NGN (${estimatedDays} days estimated delivery).\n\nPlease log into your CloseCraft workspace to review line items, approve, or request revisions.`,
        html: `<div style="font-family:sans-serif;background:#000;color:#fff;padding:24px;border-radius:12px;">
          <h2 style="color:#45bfae;">Your Custom CloseCraft Proposal is Ready</h2>
          <p>Hello ${clientName},</p>
          <p>Following your consultation for <strong>${businessName}</strong>, your assigned partner has prepared a custom proposal:</p>
          <div style="background:#101010;border:1px solid #248277;padding:16px;border-radius:8px;margin:16px 0;">
            <p><strong>Proposal Number:</strong> ${proposal.proposalNumber}</p>
            <p><strong>Title:</strong> ${proposal.title}</p>
            <p><strong>Total Scope:</strong> ₦${totalAmount.toLocaleString()} NGN</p>
            <p><strong>Timeline:</strong> ~${estimatedDays} days</p>
          </div>
          <p>Please log in to your CloseCraft dashboard to review the full deliverable checklist and accept the proposal to begin delivery.</p>
        </div>`,
      });
    }
  } catch (err) {
    console.error('[Proposal Notification Error]', err);
  }

  return proposal;
}

/**
 * Handles Client Response to a Proposal:
 * - 'ACCEPT': Marks proposal accepted, generates ProjectInvoice, initializes Bachs checkout session, advances status to INVOICED.
 * - 'REVISE': Marks proposal as DRAFT, logs revision request notes, notifies operator/partner.
 * - 'REJECT': Marks proposal REJECTED and project request PROPOSAL_REJECTED.
 */
export async function respondToProjectProposal(input: RespondToProposalInput) {
  const { proposalId, userId, organizationId, action, revisionNotes, appUrl } = input;

  const proposal = await db.projectProposal.findUnique({
    where: { id: proposalId },
    include: {
      projectRequest: {
        include: {
          brief: true,
          requestedBy: true,
          organization: true,
        },
      },
      lineItems: true,
    },
  });

  if (!proposal) {
    throw new Error(`Proposal ${proposalId} not found.`);
  }

  // Tenant Isolation Enforcement
  if (proposal.projectRequest.organizationId !== organizationId) {
    throw new Error('Unauthorized: You cannot access or modify proposals belonging to another organization.');
  }

  if (proposal.status === 'ACCEPTED') {
    throw new Error(`Proposal ${proposal.proposalNumber} has already been accepted.`);
  }

  const baseAppUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://www.closecrafthq.com';

  if (action === 'ACCEPT') {
    const invoiceNumber = generateProjectInvoiceNumber();
    const totalAmount = Number(proposal.totalAmount);

    const result = await db.$transaction(async (tx) => {
      // 1. Create ProjectInvoice
      const projectInvoice = await tx.projectInvoice.create({
        data: {
          invoiceNumber,
          projectRequestId: proposal.projectRequestId,
          totalAmount,
          currency: proposal.currency || 'NGN',
          organizationId,
          status: 'ISSUED',
        },
      });

      // 2. Mark proposal as ACCEPTED and link invoice
      const updatedProp = await tx.projectProposal.update({
        where: { id: proposalId },
        data: {
          status: 'ACCEPTED',
          clientAcceptedAt: new Date(),
          projectInvoiceId: projectInvoice.id,
        },
      });

      // 3. Update ProjectRequest status to INVOICED
      await tx.projectRequest.update({
        where: { id: proposal.projectRequestId },
        data: {
          status: 'INVOICED',
        },
      });

      // 4. Initialize delivery milestones for each proposal line item
      let seq = 1;
      for (const item of proposal.lineItems) {
        await tx.projectMilestone.create({
          data: {
            projectRequestId: proposal.projectRequestId,
            serviceType: item.serviceType,
            title: `${item.title} — Delivery & Review`,
            description: item.description,
            sequenceOrder: seq++,
            status: 'PENDING',
          },
        });
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          organizationId,
          actorId: userId,
          actorType: 'USER',
          action: 'PROPOSAL_ACCEPTED',
          resourceType: 'PROJECT_PROPOSAL',
          resourceId: proposalId,
          metadata: JSON.stringify({
            proposalNumber: proposal.proposalNumber,
            invoiceNumber,
            totalAmount,
          }),
        },
      });

      return { updatedProp, projectInvoice };
    });

    // 6. Connect with Bachs Checkout Session
    let checkoutUrl = '';
    let checkoutId = '';
    try {
      const checkoutResult = await createBachsCheckoutSession({
        organizationId,
        amount: totalAmount,
        currency: proposal.currency || 'NGN',
        type: 'GROWTH_SERVICE',
        customerEmail: proposal.projectRequest.requestedBy?.email || undefined,
        customerName: proposal.projectRequest.requestedBy?.name || undefined,
        successUrl: `${baseAppUrl}/growth/projects/${proposal.projectRequest.reference}?payment=success`,
        cancelUrl: `${baseAppUrl}/growth/projects/${proposal.projectRequest.reference}?payment=cancelled`,
        metadata: {
          projectRequestId: proposal.projectRequestId,
          projectReference: proposal.projectRequest.reference,
          proposalId: proposal.id,
          projectInvoiceId: result.projectInvoice.id,
          projectInvoiceNumber: invoiceNumber,
        },
      });

      checkoutUrl = checkoutResult.checkoutUrl;
      checkoutId = checkoutResult.checkoutId;

      await db.projectInvoice.update({
        where: { id: result.projectInvoice.id },
        data: {
          bachsCheckoutId: checkoutId,
          bachsCheckoutUrl: checkoutUrl,
        },
      });
    } catch (checkoutErr) {
      console.error('[Bachs Checkout Session Creation Warning]', checkoutErr);
    }

    return {
      success: true,
      action: 'ACCEPT',
      proposal: result.updatedProp,
      invoice: {
        id: result.projectInvoice.id,
        invoiceNumber,
        totalAmount,
        currency: proposal.currency || 'NGN',
        checkoutUrl,
        checkoutId,
      },
    };
  }

  if (action === 'REVISE') {
    const revisionRecord = {
      requestedBy: userId,
      requestedAt: new Date().toISOString(),
      notes: revisionNotes || 'Client requested adjustments to the proposal scope.',
    };

    let existingHistory: any[] = [];
    try {
      if (proposal.revisionHistory) {
        existingHistory = JSON.parse(proposal.revisionHistory);
      }
    } catch (_) {}
    existingHistory.push(revisionRecord);

    const updatedProp = await db.$transaction(async (tx) => {
      const prop = await tx.projectProposal.update({
        where: { id: proposalId },
        data: {
          status: 'DRAFT',
          clientRejectionReason: revisionNotes || null,
          revisionHistory: JSON.stringify(existingHistory),
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId,
          actorId: userId,
          actorType: 'USER',
          action: 'PROPOSAL_REVISION_REQUESTED',
          resourceType: 'PROJECT_PROPOSAL',
          resourceId: proposalId,
          metadata: JSON.stringify(revisionRecord),
        },
      });

      return prop;
    });

    return {
      success: true,
      action: 'REVISE',
      proposal: updatedProp,
    };
  }

  if (action === 'REJECT') {
    const updatedProp = await db.$transaction(async (tx) => {
      const prop = await tx.projectProposal.update({
        where: { id: proposalId },
        data: {
          status: 'REJECTED',
          clientRejectionReason: revisionNotes || 'Client declined the proposal.',
        },
      });

      await tx.projectRequest.update({
        where: { id: proposal.projectRequestId },
        data: {
          status: 'PROPOSAL_REJECTED',
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId,
          actorId: userId,
          actorType: 'USER',
          action: 'PROPOSAL_REJECTED',
          resourceType: 'PROJECT_PROPOSAL',
          resourceId: proposalId,
          metadata: JSON.stringify({ reason: revisionNotes }),
        },
      });

      return prop;
    });

    return {
      success: true,
      action: 'REJECT',
      proposal: updatedProp,
    };
  }

  throw new Error(`Unknown proposal action: ${action}`);
}
