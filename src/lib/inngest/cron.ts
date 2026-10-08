// @ts-nocheck
import { inngest } from './client';
import { db } from '@/lib/db';

// Cron Job: Detect Revenue Leaks (e.g. deals stuck in PROPOSAL for > 7 days)
export const detectRevenueLeaks = inngest.createFunction(
  { id: 'detect-revenue-leaks' },
  { cron: '0 0 * * *' }, // Runs every day at midnight
  async ({ step }) => {
    
    // Find all Deals in PROPOSAL stage that haven't been updated in 7 days
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 7);

    const stalledDeals = await step.run('fetch-stalled-deals', async () => {
      return await db.deal.findMany({
        where: {
          stage: 'PROPOSAL',
          updatedAt: { lte: staleDate },
        },
        include: { lead: true }
      });
    });

    // Create a RevenueLeak for each stalled deal
    for (const deal of stalledDeals) {
      await step.run(`process-leak-${deal.id}`, async () => {
        // Check if we already logged a leak for this deal recently
        const existingLeak = await db.revenueLeak.findFirst({
          where: { leadId: deal.leadId, status: 'OPEN', type: 'STALLED_OPPORTUNITY' }
        });

        if (!existingLeak) {
          // Log the leak
          await db.revenueLeak.create({
            data: {
              type: 'STALLED_OPPORTUNITY',
              description: 'Deal stuck in PROPOSAL for over 7 days.',
              severity: 'HIGH',
              status: 'OPEN',
              organizationId: deal.organizationId,
              leadId: deal.leadId,
            }
          });

          // Create a high-priority action for the rep to follow up
          await db.revenueAction.create({
            data: {
              type: 'FOLLOW_UP',
              reason: 'Revenue Leak Detected: Deal is stalled.',
              priority: 95,
              recommendedActor: 'HUMAN',
              status: 'PENDING',
              source: 'SYSTEM',
              organizationId: deal.organizationId,
              leadId: deal.leadId,
            }
          });
        }
      });
    }

    return { success: true, processed: stalledDeals.length };
  }
);
