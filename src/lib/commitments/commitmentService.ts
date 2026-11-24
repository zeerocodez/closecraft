import { db } from '../db';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const SuggestedCommitmentSchema = z.object({
  title: z.string().describe("Clear, action-oriented title of what was promised to the customer."),
  description: z.string().describe("Specific details of the commitment, deliverables, or terms."),
  commitmentType: z.enum([
    'DELIVERABLE',
    'PROPOSAL',
    'DISCOUNT_AGREEMENT',
    'CALLBACK',
    'DELIVERY_DATE',
    'SERVICE_ONBOARDING',
    'RESOLUTION'
  ]).describe("Type of commitment."),
  suggestedDueDays: z.number().min(1).max(90).describe("Days from now when this promise is due."),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string()
});

export const ExtractedCommitmentsListSchema = z.object({
  commitments: z.array(SuggestedCommitmentSchema)
});

/**
 * Deterministic fallback extractor for extracting commitments from text
 */
export function extractFallbackCommitments(text: string): Array<z.infer<typeof SuggestedCommitmentSchema>> {
  const lower = text.toLowerCase();
  const commitments: Array<z.infer<typeof SuggestedCommitmentSchema>> = [];

  if (lower.includes('proposal') || lower.includes('quote') || lower.includes('send you')) {
    commitments.push({
      title: 'Deliver Commercial Proposal & Scope Document',
      description: 'Prepare and send full pricing and scope breakdown as agreed in conversation.',
      commitmentType: 'PROPOSAL',
      suggestedDueDays: 2,
      priority: 'HIGH',
      confidence: 0.85,
      reasoning: 'Customer conversation mentions delivering pricing proposal.'
    });
  }

  if (lower.includes('call') || lower.includes('speak') || lower.includes('tomorrow') || lower.includes('friday')) {
    commitments.push({
      title: 'Conduct Scheduled Follow-up Call / Briefing',
      description: 'Direct phone or WhatsApp briefing with decision maker.',
      commitmentType: 'CALLBACK',
      suggestedDueDays: 3,
      priority: 'MEDIUM',
      confidence: 0.8,
      reasoning: 'Reference to scheduling call or meeting.'
    });
  }

  if (lower.includes('discount') || lower.includes('%') || lower.includes('concession')) {
    commitments.push({
      title: 'Apply Agreed Pricing Concession / Discount',
      description: 'Ensure agreed discount is reflected on final pro-forma invoice.',
      commitmentType: 'DISCOUNT_AGREEMENT',
      suggestedDueDays: 1,
      priority: 'HIGH',
      confidence: 0.9,
      reasoning: 'Discount discussion detected in customer communication.'
    });
  }

  if (lower.includes('deploy') || lower.includes('setup') || lower.includes('deliver') || lower.includes('launch')) {
    commitments.push({
      title: 'Complete Onboarding & System Setup',
      description: 'Deliver core setup and verify access credentials with client team.',
      commitmentType: 'SERVICE_ONBOARDING',
      suggestedDueDays: 7,
      priority: 'CRITICAL',
      confidence: 0.88,
      reasoning: 'Setup or onboarding deliverable promised.'
    });
  }

  if (commitments.length === 0) {
    commitments.push({
      title: 'Customer Status & Deliverables Check-in',
      description: 'Review prospect requirements and confirm next operational milestone.',
      commitmentType: 'DELIVERABLE',
      suggestedDueDays: 5,
      priority: 'MEDIUM',
      confidence: 0.7,
      reasoning: 'General customer commitment derived from interaction.'
    });
  }

  return commitments;
}

/**
 * AI-assisted commitment extraction from customer conversations, WhatsApp messages, or sales notes
 */
export async function extractCommitmentsFromText(text: string): Promise<Array<z.infer<typeof SuggestedCommitmentSchema>>> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey !== 'mock_key_for_build' && !apiKey.startsWith('sk-test') && text.length > 15) {
    try {
      const prompt = `
You are a senior SaaS Revenue Operations Fulfilment Auditor.
Analyze the following sales conversation or customer notes for CloseCraft:

"${text}"

Identify every concrete commercial commitment, promise, deliverable, or agreed timeline made to the customer.
Do NOT invent binding obligations from ambiguous statements.
Extract specific promises: delivery deadlines, proposal submissions, discounts agreed, installation dates, or promised callbacks.
`;

      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: ExtractedCommitmentsListSchema,
        prompt,
      });

      return result.object.commitments;
    } catch (err) {
      console.warn('[CommitmentService] AI extraction failed, using fallback:', err);
      return extractFallbackCommitments(text);
    }
  }

  return extractFallbackCommitments(text);
}

/**
 * Creates a confirmed commitment record in the Promise Ledger
 */
export async function createCommitment(params: {
  organizationId: string;
  title: string;
  description: string;
  commitmentType?: string;
  dueDate: Date;
  priority?: string;
  leadId?: string | null;
  dealId?: string | null;
  assignedUserId?: string | null;
  orderId?: string | null;
  userId?: string | null;
}) {
  const {
    organizationId,
    title,
    description,
    commitmentType = 'DELIVERABLE',
    dueDate,
    priority = 'MEDIUM',
    leadId,
    dealId,
    assignedUserId,
    orderId,
    userId
  } = params;

  const commitment = await db.customerCommitment.create({
    data: {
      organizationId,
      title,
      description,
      commitmentType,
      dueDate,
      priority,
      leadId: leadId || null,
      dealId: dealId || null,
      assignedUserId: assignedUserId || null,
      orderId: orderId || null,
      status: 'PENDING'
    }
  });

  // Create Audit Log
  await db.auditLog.create({
    data: {
      organizationId,
      actorId: userId || null,
      actorType: 'USER',
      action: 'CUSTOMER_COMMITMENT_RECORDED',
      resourceType: 'CustomerCommitment',
      resourceId: commitment.id,
      reason: `Recorded commitment: "${title}" due on ${dueDate.toISOString().split('T')[0]}`
    }
  });

  return commitment;
}

/**
 * Marks a commitment as completed with verifiable evidence
 */
export async function completeCommitment(params: {
  commitmentId: string;
  organizationId: string;
  completionEvidence: string;
  userId?: string | null;
}) {
  const { commitmentId, organizationId, completionEvidence, userId } = params;

  const existing = await db.customerCommitment.findFirst({
    where: { id: commitmentId, organizationId }
  });

  if (!existing) {
    throw new Error('Commitment not found in this organization');
  }

  const updated = await db.customerCommitment.update({
    where: { id: commitmentId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      completionEvidence,
      isOverdue: false
    }
  });

  await db.auditLog.create({
    data: {
      organizationId,
      actorId: userId || null,
      actorType: 'USER',
      action: 'CUSTOMER_COMMITMENT_COMPLETED',
      resourceType: 'CustomerCommitment',
      resourceId: commitmentId,
      reason: `Marked completed with evidence: ${completionEvidence}`
    }
  });

  return updated;
}

/**
 * Scans for overdue commitments and creates Revenue Leaks for SLA protection
 */
export async function scanAndEscalateOverdueCommitments(organizationId?: string) {
  const now = new Date();
  const whereClause: any = {
    status: { in: ['PENDING', 'IN_PROGRESS'] },
    dueDate: { lt: now }
  };
  if (organizationId) {
    whereClause.organizationId = organizationId;
  }

  const overdueList = await db.customerCommitment.findMany({
    where: whereClause,
    include: { lead: true, assignedUser: true }
  });

  let escalatedCount = 0;

  for (const item of overdueList) {
    if (!item.isOverdue) {
      await db.customerCommitment.update({
        where: { id: item.id },
        data: { isOverdue: true, status: 'OVERDUE' }
      });

      // Check if a RevenueLeak already exists for this commitment
      const existingLeak = await db.revenueLeak.findFirst({
        where: {
          organizationId: item.organizationId,
          description: { contains: item.title },
          status: 'OPEN'
        }
      });

      if (!existingLeak) {
        await db.revenueLeak.create({
          data: {
            organizationId: item.organizationId,
            leadId: item.leadId,
            type: 'SLA_BREACHED',
            severity: item.priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
            status: 'OPEN',
            description: `Overdue customer commitment: "${item.title}" was due on ${item.dueDate.toLocaleDateString()}. Customer fulfilment at risk.`
          }
        });
        escalatedCount++;
      }
    }
  }

  return { totalOverdue: overdueList.length, newLeaksCreated: escalatedCount };
}
