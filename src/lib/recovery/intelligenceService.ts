import { db } from '../db';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const LeadIntelligenceSchema = z.object({
  productInterest: z.string().describe("Main product, service, or offering the prospect inquired about or is interested in."),
  pastObjections: z.string().describe("Key objections raised: Price, Timing, Authority, Competitor, FeatureGap, or None."),
  pastQuestions: z.string().describe("Specific questions asked by the customer regarding deliverables, delivery, or terms."),
  suggestedSegment: z.enum([
    'PREVIOUSLY_INTERESTED',
    'PRICE_SENSITIVE',
    'ABANDONED',
    'REPEAT_BUYER',
    'COLD_STALLED',
    'UNQUALIFIED'
  ]).describe("Best matching recovery segment."),
  inferredIntentLevel: z.number().min(0).max(100).describe("Estimated buying intent score 0-100."),
  confidence: z.number().min(0).max(1).describe("Model confidence score 0.0 to 1.0."),
  reasoning: z.string().describe("Explainable reason for this classification."),
});

export type ExtractedLeadIntelligence = z.infer<typeof LeadIntelligenceSchema>;

/**
 * Deterministic fallback extractor for offline or missing OpenAI credentials
 */
export function extractFallbackIntelligence(text: string, productInterestHint?: string): ExtractedLeadIntelligence {
  const lower = text.toLowerCase();
  
  let segment: ExtractedLeadIntelligence['suggestedSegment'] = 'PREVIOUSLY_INTERESTED';
  let objections = 'None explicit';
  let intent = 65;

  if (lower.includes('budget') || lower.includes('too expensive') || lower.includes('discount') || lower.includes('cheaper') || lower.includes('cost')) {
    segment = 'PRICE_SENSITIVE';
    objections = 'Price / Budget sensitivity';
    intent = 55;
  } else if (lower.includes('proposal') || lower.includes('quote') || lower.includes('invoice') || lower.includes('negotiat')) {
    segment = 'ABANDONED';
    objections = 'Stalled proposal / decision pending';
    intent = 80;
  } else if (lower.includes('previous') || lower.includes('repeat') || lower.includes('existing client') || lower.includes('renew')) {
    segment = 'REPEAT_BUYER';
    objections = 'None / Repeat opportunity';
    intent = 88;
  } else if (lower.includes('not interested') || lower.includes('cancel') || lower.includes('stop') || lower.includes('unsubscribe')) {
    segment = 'UNQUALIFIED';
    objections = 'Unqualified / Opt-out requested';
    intent = 10;
  } else if (lower.includes('stalled') || lower.includes('old') || lower.includes('months ago')) {
    segment = 'COLD_STALLED';
    objections = 'Inactivity / Lapsed timeline';
    intent = 45;
  }

  return {
    productInterest: productInterestHint || (lower.includes('consult') ? 'Consulting Services' : lower.includes('software') ? 'Software License' : 'Core Business Offering'),
    pastObjections: objections,
    pastQuestions: text.length > 10 ? text.slice(0, 160) : 'General enquiry details',
    suggestedSegment: segment,
    inferredIntentLevel: intent,
    confidence: 0.72,
    reasoning: 'Deterministic pattern extraction from customer enquiry text and historical notes.'
  };
}

/**
 * AI Lead Intelligence Extractor using OpenAI / AI SDK with deterministic fallback
 */
export async function extractLeadIntelligence(params: {
  leadId: string;
  organizationId: string;
  leadName: string;
  leadMessage?: string | null;
  source?: string | null;
  productInterest?: string | null;
}): Promise<ExtractedLeadIntelligence> {
  const { leadId, organizationId, leadName, leadMessage, source, productInterest } = params;
  const content = leadMessage || `Prospect ${leadName} from source ${source || 'direct'}`;

  let intelligence: ExtractedLeadIntelligence;
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey !== 'mock_key_for_build' && !apiKey.startsWith('sk-test')) {
    try {
      const prompt = `
You are an expert SaaS Revenue Operations and Lead Recovery Specialist.
Analyze this historical prospect enquiry and customer notes for CloseCraft:

PROSPECT: ${leadName}
SOURCE: ${source || 'Direct Lead'}
CONTEXT & NOTES:
"${content}"
${productInterest ? `PRODUCT HINT: ${productInterest}` : ''}

Extract key intelligence:
1. Product interest
2. Past objections raised (Price, Timing, Authority, Competitor, FeatureGap, or None)
3. Specific questions previously asked
4. Best recovery segment (PREVIOUSLY_INTERESTED, PRICE_SENSITIVE, ABANDONED, REPEAT_BUYER, COLD_STALLED, UNQUALIFIED)
5. Inferred intent level (0-100)
6. Confidence (0.0 to 1.0)
7. Concise explainable reasoning
`;

      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: LeadIntelligenceSchema,
        prompt,
      });

      intelligence = result.object;
    } catch (err) {
      console.warn('[IntelligenceService] OpenAI extraction failed, using deterministic fallback:', err);
      intelligence = extractFallbackIntelligence(content, productInterest || undefined);
    }
  } else {
    intelligence = extractFallbackIntelligence(content, productInterest || undefined);
  }

  // Upsert LeadIntelligence record in DB
  await db.leadIntelligence.upsert({
    where: { leadId },
    update: {
      productInterest: intelligence.productInterest,
      pastObjections: intelligence.pastObjections,
      pastQuestions: intelligence.pastQuestions,
      suggestedSegment: intelligence.suggestedSegment,
      inferredIntentLevel: intelligence.inferredIntentLevel,
      confidence: intelligence.confidence,
      isAiInferred: true,
      originalSource: source || 'DIRECT_LEAD',
    },
    create: {
      leadId,
      organizationId,
      productInterest: intelligence.productInterest,
      pastObjections: intelligence.pastObjections,
      pastQuestions: intelligence.pastQuestions,
      suggestedSegment: intelligence.suggestedSegment,
      inferredIntentLevel: intelligence.inferredIntentLevel,
      confidence: intelligence.confidence,
      isAiInferred: true,
      originalSource: source || 'DIRECT_LEAD',
    }
  });

  return intelligence;
}
