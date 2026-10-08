// @ts-nocheck
import { inngest } from './client';
import { qualifyLead } from '@/lib/ai/qualification';

import { createLeadForTenant } from '@/lib/dal/lead';

// Background Job: Process inbound leads from webhooks, create them, and trigger AI Qualification
// @ts-ignore
export const processNewLead = inngest.createFunction(
  { id: 'process-new-lead' },
  { event: 'revenue/lead.created' },
  async ({ event, step }: { event: any, step: any }) => {
    
    // Step 1: Create the lead in the database using the Data Access Layer
    const lead = await step.run('create-lead', async () => {
      const data = event.data;
      return await createLeadForTenant({
        name: data.name,
        email: data.email,
        source: data.source,
        organizationId: data.organizationId
      });
    });

    // Step 2: Add a tiny delay to ensure replication (if any) is complete
    await step.sleep('wait-for-db', '1s');

    // Step 3: Qualify the lead using the AI core
    const qualificationResult = await step.run('run-ai-qualification', async () => {
      return await qualifyLead(lead.id);
    });

    // Step 4: Depending on the qualification, we could trigger secondary workflows here
    // e.g. if qualificationResult.recommendedActor === 'HUMAN' -> send slack notification

    return { success: true, leadId: lead.id, result: qualificationResult };
  }
);
