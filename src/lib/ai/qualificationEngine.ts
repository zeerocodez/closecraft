/**
 * Canonical AI Lead Qualification Engine Adapter
 * 
 * Routes legacy qualification calls into the unified, structured AI extractor
 * and Revenue Engine. Completely replaces deprecated mock/keyword rules.
 */

import { db } from "@/lib/db";
import { extractLeadQualificationData, LeadQualificationResult } from "./extractor";

export type QualificationResult = {
  shouldReply: boolean;
  draftReply: string | null;
  updatedIntentScore: number;
  extractedData: {
    budget?: string;
    authority?: string;
    need?: string;
    timeline?: string;
  };
  handoffReason?: string;
  leadQualificationResult?: LeadQualificationResult;
};

/**
 * Authoritative lead qualification processor.
 * Evaluates prospect messages using the canonical AI Extractor and enforces tenant qualification policies.
 */
export async function processLeadWithAI(leadId: string, newMessageContent: string): Promise<QualificationResult> {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: {
      organization: true,
      qualificationData: true,
    },
  });

  if (!lead) {
    throw new Error(`Lead ${leadId} not found`);
  }

  // Run canonical structured AI qualification
  const aiResult = await extractLeadQualificationData(
    newMessageContent,
    lead.qualificationData?.customData,
    lead.buyingIntent ?? undefined,
    lead.organization?.qualificationPolicy
  );

  const shouldReply = aiResult.nextActionType === 'RESPOND' || aiResult.nextActionType === 'SEND_BOOKING_LINK';
  const handoffReason = aiResult.nextActionType === 'ASSIGN_HUMAN' 
    ? 'High-intent opportunity requiring senior sales executive negotiation' 
    : undefined;

  // Update lead and qualification data with verified, non-fabricated fields
  await db.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: leadId },
      data: {
        buyingIntent: aiResult.intentScore,
        status: aiResult.intentScore >= 80 ? 'OPPORTUNITY' : (aiResult.intentScore >= 50 ? 'QUALIFYING' : 'NEW'),
        aiAssessment: aiResult.aiAssessment,
        nextStepsRecommendation: aiResult.nextStepsRecommendation,
        assignedRole: aiResult.targetRole,
      },
    });

    if (lead.qualificationData) {
      await tx.qualificationData.update({
        where: { id: lead.qualificationData.id },
        data: {
          budget: aiResult.budget || lead.qualificationData.budget,
          authority: aiResult.authority || lead.qualificationData.authority,
          need: aiResult.need || lead.qualificationData.need,
          timeline: aiResult.timeline || lead.qualificationData.timeline,
        },
      });
    } else {
      await tx.qualificationData.create({
        data: {
          leadId,
          budget: aiResult.budget,
          authority: aiResult.authority,
          need: aiResult.need,
          timeline: aiResult.timeline,
        },
      });
    }

    // Persist Intent Signal
    if (lead.organizationId) {
      await tx.revenueSignal.create({
        data: {
          organizationId: lead.organizationId,
          leadId,
          type: 'INTENT',
          value: aiResult.intentScore,
          source: 'AI',
          evidence: aiResult.intentEvidence,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          organizationId: lead.organizationId,
          leadId,
          actorType: 'AI',
          action: 'LEAD_QUALIFIED_CANONICAL',
          resourceType: 'LEAD',
          resourceId: leadId,
          newState: JSON.stringify({
            intentScore: aiResult.intentScore,
            fitScore: aiResult.fitScore,
            nextActionType: aiResult.nextActionType,
            recommendedActor: aiResult.recommendedActor,
          }),
        },
      });
    }
  });

  return {
    shouldReply,
    draftReply: shouldReply ? `Thank you for sharing your requirements. We're reviewing your request and will follow up with tailored solution options.` : null,
    updatedIntentScore: aiResult.intentScore,
    extractedData: {
      budget: aiResult.budget,
      authority: aiResult.authority,
      need: aiResult.need,
      timeline: aiResult.timeline,
    },
    handoffReason,
    leadQualificationResult: aiResult,
  };
}
