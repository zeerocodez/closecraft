import { inngest } from './client';
import { db } from '@/lib/db';
import { createLeadForTenant } from '@/lib/dal/lead';
import { RevenueEngine } from '@/lib/revenue-engine/engine';

// Background Job: Process inbound leads idempotently and trigger Revenue Engine qualification
export const processNewLead = inngest.createFunction(
  { id: 'process-new-lead', triggers: [{ event: 'revenue/lead.created' }] },
  async ({ event, step }: { event: any, step: any }) => {
    const data = event.data;

    // Step 1: Idempotently fetch existing lead by leadId if provided, or create if new
    const lead = await step.run('resolve-lead', async () => {
      if (data.leadId) {
        const existing = await db.lead.findUnique({ where: { id: data.leadId } });
        if (existing) return existing;
      }
      return await createLeadForTenant({
        name: data.name,
        email: data.email || '',
        phone: data.phone || undefined,
        message: data.message || undefined,
        source: data.source || 'Inbound Event',
        organizationId: data.organizationId
      });
    });

    // Step 2: Run Revenue Engine qualification & signals on the lead
    const result = await step.run('run-revenue-engine', async () => {
      await RevenueEngine.processNewLead(lead.id);
      return { leadId: lead.id, processed: true };
    });

    return { success: true, leadId: lead.id, result };
  }
);
