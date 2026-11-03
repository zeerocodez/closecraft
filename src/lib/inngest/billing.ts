// @ts-nocheck
import { inngest } from './client';
import { db } from '@/lib/db';

export const processBillingEvent = inngest.createFunction(
  { id: 'process-billing-event', triggers: [{ event: 'billing/payment.success' }] },
  async ({ event, step }) => {
    const { organizationId, amount, plan, type, courseId, studentId } = event.data;

    await step.run('apply-entitlement', async () => {
      if (type === 'SAAS_SUBSCRIPTION') {
        // Upgrade SaaS Plan
        await db.organization.update({
          where: { id: organizationId },
          data: { plan: plan }
        });
      } else if (type === 'DSS_COURSE' && courseId && studentId) {
        // Grant LMS Access
        await db.enrollment.create({
          data: {
            courseId,
            studentId,
            status: 'ACTIVE'
          }
        });
        
        // Automatically unlock Module 1
        const firstModule = await db.module.findFirst({
          where: { courseId },
          orderBy: { orderIndex: 'asc' }
        });
        
        if (firstModule) {
          await db.moduleProgress.create({
            data: {
              studentId,
              moduleId: firstModule.id,
              isUnlocked: true
            }
          });
        }

        // Record DSS conversion to exit marketing acquisition sequence
        try {
          const student = await db.studentProfile.findUnique({
            where: { id: studentId },
            include: { user: true },
          });
          if (student?.user?.email) {
            const { recordConversion } = await import('@/lib/marketing/welcomeSequence');
            await recordConversion(student.user.email, 'DSS_ENROLMENT');
          }
        } catch {
          // Non-blocking
        }
      }
    });

    return { success: true };
  }
);
