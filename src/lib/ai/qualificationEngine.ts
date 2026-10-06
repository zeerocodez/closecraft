import { db } from "@/lib/db";

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
}

export async function processLeadWithAI(leadId: string, newMessageContent: string): Promise<QualificationResult> {
  console.log(`[AI Engine] Analyzing message for lead ${leadId}: "${newMessageContent}"`);
  
  // In production, this would call an LLM (e.g. OpenAI GPT-4o) with the conversation history.
  // We mock a basic heuristic rule-engine here for the local execution.
  
  const content = newMessageContent.toLowerCase();
  const result: QualificationResult = {
    shouldReply: true,
    draftReply: null,
    updatedIntentScore: 50,
    extractedData: {}
  };

  if (content.includes("price") || content.includes("cost") || content.includes("how much")) {
    result.draftReply = "Our pricing starts at $99/month for the basic package. Do you have a specific budget allocated for this project?";
    result.updatedIntentScore = 65;
    result.extractedData.need = "Pricing info requested";
  } else if (content.includes("human") || content.includes("agent") || content.includes("talk to someone")) {
    result.shouldReply = false;
    result.handoffReason = "Requested human assistance";
    result.updatedIntentScore = 80;
  } else if (content.includes("buy") || content.includes("sign up") || content.includes("ready")) {
    result.shouldReply = true;
    result.draftReply = "That's great! I'll have one of our closing specialists reach out to you immediately to get you onboarded.";
    result.updatedIntentScore = 95;
    result.extractedData.timeline = "Immediate";
  } else {
    result.draftReply = "Thanks for reaching out! Could you tell me a bit more about what you're looking to achieve with CloseCraft so I can route you properly?";
    result.updatedIntentScore = 55;
  }

  // Update QualificationData in DB
  if (Object.keys(result.extractedData).length > 0) {
    await db.qualificationData.upsert({
      where: { leadId },
      create: {
        leadId,
        ...result.extractedData
      },
      update: {
        ...result.extractedData
      }
    });
  }

  // Update lead intent
  await db.lead.update({
    where: { id: leadId },
    data: { 
      buyingIntent: result.updatedIntentScore,
      status: result.shouldReply ? 'QUALIFYING' : 'ENGAGED'
    }
  });

  // If a handoff is triggered, log an audit action
  if (result.handoffReason) {
    const lead = await db.lead.findUnique({ where: { id: leadId }});
    if (lead?.organizationId) {
      await db.auditLog.create({
        data: {
          organizationId: lead.organizationId,
          leadId,
          actorType: 'AI',
          action: 'HUMAN_HANDOFF_TRIGGERED',
          resourceType: 'LEAD',
          resourceId: leadId,
          newState: result.handoffReason
        }
      });
    }
  }

  return result;
}
