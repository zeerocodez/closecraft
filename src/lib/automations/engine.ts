// @ts-nocheck
import { inngest } from './client';
import { db } from '@/lib/db';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const executeAutomations = inngest.createFunction(
  { id: 'execute-automations-engine' },
  { event: 'revenue/signal.evaluated' },
  async ({ event, step }) => {
    const { leadId, organizationId, buyingIntent } = event.data;
    
    // In a real app, you would fetch `WorkflowRule` models belonging to this organization.
    // For this implementation, we evaluate the conditions strictly natively.
    await step.run('evaluate-rules', async () => {
      if (buyingIntent >= 80) {
        // High Intent: Create an internal deal automatically
        const existingDeal = await db.deal.findFirst({
          where: { leadId, stage: 'OPPORTUNITY' }
        });

        if (!existingDeal) {
          await db.deal.create({
            data: {
              organizationId,
              leadId,
              stage: 'OPPORTUNITY',
              amount: 5000000 // Default estimated ACV
            }
          });
        }
      }

      if (buyingIntent < 30) {
        // Low Intent: Mark lead as NURTURE
        await db.lead.update({
          where: { id: leadId },
          data: { status: 'NURTURE' }
        });
      }
    });

    return { success: true };
  }
);
