import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function extractLeadQualificationData(message: string, customData?: string | null) {
  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      intentScore: z.number().min(1).max(100).describe('Estimated buying intent from 1 to 100 based on the message urgency and specifics.'),
      budget: z.string().optional().describe('Extracted budget if mentioned.'),
      authority: z.string().optional().describe('Extracted authority/role if mentioned.'),
      need: z.string().optional().describe('The core problem or need the lead is trying to solve.'),
      timeline: z.string().optional().describe('When they need the solution by.'),
      priority: z.number().min(1).max(100).describe('Priority score for sales team follow up (1-100).'),
      nextActionType: z.enum(['RESPOND', 'SEND_NURTURE_SEQUENCE', 'ASSIGN_HUMAN']).describe('The recommended next best action type.'),
      recommendedActor: z.enum(['HUMAN', 'AUTOMATION']).describe('Who should take the next action.'),
      actionReason: z.string().describe('Reason for the recommended next action.')
    }),
    prompt: `Analyze the following lead information and extract qualification data, intent score, and recommend a next action.

Lead Message:
${message}

Additional Data:
${customData || 'None'}
`
  });

  return result.object;
}
