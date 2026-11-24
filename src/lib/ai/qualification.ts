/**
 * Canonical AI Lead Qualification Service
 * 
 * Provides an authoritative entry point for qualifying leads within the Revenue Engine.
 * Enforces Zod structured output, tenant qualification policies, explainability,
 * and actor assignment without inventing prospect data.
 */

import { db } from "@/lib/db";
import { RevenueEngine } from "@/lib/revenue-engine/engine";
import { extractLeadQualificationData, LeadQualificationResult } from "./extractor";

export async function qualifyLead(leadId: string): Promise<LeadQualificationResult> {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: {
      conversations: {
        include: { messages: true },
      },
      organization: true,
      qualificationData: true,
    },
  });

  if (!lead) {
    throw new Error(`Lead ${leadId} not found`);
  }

  const organizationId = lead.organizationId;
  if (!organizationId) {
    throw new Error(`Lead ${leadId} does not belong to an organization`);
  }

  // Aggregate conversation context
  const messageHistory = lead.conversations
    .flatMap((c) => c.messages)
    .map((m) => `${m.senderType}: ${m.content}`)
    .join('\n');

  const combinedContext = [lead.message, messageHistory].filter(Boolean).join('\n\n');

  // Run canonical structured AI qualification
  const aiResult = await extractLeadQualificationData(
    combinedContext || 'General commercial inquiry',
    lead.qualificationData?.customData,
    lead.buyingIntent ?? undefined,
    lead.organization?.qualificationPolicy
  );

  // Process via Revenue Engine for standardized signals and Next Best Action
  await RevenueEngine.processNewLead(leadId);

  return aiResult;
}
