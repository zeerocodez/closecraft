import { db } from "@/lib/db";
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function qualifyLead(leadId: string) {
  // 1. Fetch the lead and any context (e.g. recent messages)
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: {
      conversations: {
        include: { messages: true }
      },
      organization: true
    }
  });

  if (!lead) {
    throw new Error('Lead not found');
  }

  const organizationId = lead.organizationId;
  if (!organizationId) {
    throw new Error('Lead does not belong to an organization');
  }

  // Combine context for the AI
  const messageHistory = lead.conversations.flatMap(c => c.messages).map(m => `${m.senderType}: ${m.content}`).join('\n');
  const leadContext = `
    Name: ${lead.name}
    Email: ${lead.email}
    Source: ${lead.source || 'Unknown'}
    Status: ${lead.status}
    Notes/Message: ${lead.message || 'None'}
    
    Recent Interactions:
    ${messageHistory || 'No interactions yet.'}
  `;

  // Organization-specific policy
  const orgPolicy = lead.organization?.qualificationPolicy 
    ? `\n\nTENANT QUALIFICATION POLICY (FOLLOW THIS STRICTLY):\n${lead.organization.qualificationPolicy}`
    : `\n\nDEFAULT QUALIFICATION POLICY:\nScore based on urgency, budget markers, decision-making authority, and fit.`;

  // 2. Run structured AI qualification
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    system: `
      You are the core intelligence of the Revenue Engine. 
      Your job is to analyze incoming B2B leads and determine two things:
      1. Their Buying Intent Score (0-100). 
      2. The Next Best Action (e.g., ASSIGN_HUMAN for high-value complex deals, AUTOMATION for standard nurture, AI for immediate basic response).
      Be ruthless and objective. Do not inflate scores for bad leads.
      ${orgPolicy}
    `,
    prompt: `Analyze the following lead:\n${leadContext}`,
    schema: z.object({
      buyingIntent: z.number().min(0).max(100).describe('0-100 score of how likely they are to buy soon.'),
      intentEvidence: z.string().describe('Brief explanation of why you gave this score.'),
      nextActionType: z.enum(['RESPOND', 'ASSIGN_HUMAN', 'WAIT', 'DISQUALIFY', 'SEND_BOOKING_LINK']).describe('The exact next step in the pipeline.'),
      recommendedActor: z.enum(['AI', 'AUTOMATION', 'HUMAN', 'SYSTEM']).describe('Who or what should execute this action.'),
      actionReason: z.string().describe('Why this action and actor were chosen.'),
      actionPriority: z.number().min(1).max(100).describe('1-100 priority of executing this action.'),
    }),
  });

  // 3. Update the database within a transaction
  await db.$transaction(async (tx) => {
    // Update Lead intent
    await tx.lead.update({
      where: { id: leadId },
      data: {
        buyingIntent: object.buyingIntent,
        // If it's a very hot lead and currently 'NEW', we might upgrade it to 'QUALIFIED'
        status: (object.buyingIntent >= 80 && lead.status === 'NEW') ? 'QUALIFIED' : lead.status
      }
    });

    // Create Revenue Signal
    await tx.revenueSignal.create({
      data: {
        type: 'INTENT',
        value: object.buyingIntent,
        evidence: object.intentEvidence,
        source: 'AI',
        organizationId,
        leadId,
      }
    });

    // Optional: Cancel any existing pending actions for this lead so we don't have conflicting NBA
    await tx.revenueAction.updateMany({
      where: { leadId, status: 'PENDING' },
      data: { status: 'CANCELLED', cancellationReason: 'Superseded by new AI qualification' }
    });

    // Create the Next Best Action
    await tx.revenueAction.create({
      data: {
        type: object.nextActionType,
        reason: object.actionReason,
        priority: object.actionPriority,
        recommendedActor: object.recommendedActor,
        status: 'PENDING',
        source: 'AI',
        organizationId,
        leadId,
      }
    });
    
    // Log the event
    await tx.auditLog.create({
      data: {
        actorType: 'AI',
        action: 'QUALIFIED_LEAD',
        resourceType: 'LEAD',
        resourceId: leadId,
        newState: JSON.stringify(object),
        organizationId,
        leadId
      }
    });
  });

  return object;
}
