import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { processNewLead } from '@/lib/inngest/functions';
import { detectRevenueLeaks } from '@/lib/inngest/cron';
import { gradeSubmission } from '@/lib/inngest/dss';
import { processBillingEvent } from '@/lib/inngest/billing';
import { executeAutomations } from '@/lib/automations/engine';

export const { GET, POST, PUT } = serve({
 client: inngest,
 functions: [
 processNewLead,
 detectRevenueLeaks,
 gradeSubmission,
 processBillingEvent,
 executeAutomations
 ],
});
