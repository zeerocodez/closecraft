import { inngest } from './client';
import { db } from '@/lib/db';
import {
  dispatchSequenceMessage,
  verifyPreSendConditions,
  calculateTargetSendDate,
  SEQUENCE_ID,
  DEFAULT_TIMEZONE,
} from '@/lib/marketing/welcomeSequence';

/**
 * Inngest Automation Function: Closecraft Welcome Sequence V1
 *
 * Sequence Timing:
 * - Day 0: Shared Welcome (Immediate)
 * - Day 2 at 10:00 AM (Subscriber timezone, fallback Africa/Lagos)
 * - Day 4 at 10:00 AM
 * - Day 7 at 10:00 AM
 * - Day 10 at 10:00 AM
 *
 * Pre-send checks verified before every step:
 * - Active subscription
 * - Not suppressed (unsubscribe, bounce, complaint)
 * - Not paused for active service enquiry
 * - Not converted (DSS enrolment or software activation)
 * - No conflicting broadcast campaign today
 */
export const closecraftWelcomeSequence = inngest.createFunction(
  {
    id: 'closecraft-welcome-sequence-v1',
    name: 'Closecraft Welcome Sequence V1',
    triggers: [{ event: 'marketing/welcome_sequence.start' }],
    cancelOn: [
      {
        event: 'marketing/subscriber.suppressed',
        match: 'data.subscriberId',
      },
      {
        event: 'marketing/conversion.recorded',
        match: 'data.subscriberId',
      },
    ],
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { subscriberId } = event.data;

    // Step 1: Send Shared Welcome Immediately
    const step1Result = await step.run('dispatch-step-1-welcome', async () => {
      return await dispatchSequenceMessage({ subscriberId, stepNumber: 1 });
    });

    // Fetch subscriber to inspect track and timezone
    const subscriber = await step.run('get-subscriber-status', async () => {
      return await db.marketingSubscriber.findUnique({
        where: { id: subscriberId },
        select: {
          id: true,
          status: true,
          activeTrack: true,
          timezone: true,
          confirmedAt: true,
          createdAt: true,
        },
      });
    });

    if (!subscriber || subscriber.status !== 'ACTIVE' || subscriber.activeTrack === 'NONE') {
      return {
        completed: true,
        stoppedAt: 'STEP_1',
        reason: 'Subscriber track is UNSPECIFIED or inactive. Remaining steps paused until track preference is chosen.',
        step1Result,
      };
    }

    const baseDate = subscriber.confirmedAt || subscriber.createdAt;
    const timezone = subscriber.timezone || DEFAULT_TIMEZONE;

    // Step 2: Day 2 at 10:00 AM
    const day2Date = calculateTargetSendDate(2, baseDate, timezone);
    await step.sleepUntil('sleep-until-day-2', day2Date);

    const step2Result = await step.run('dispatch-step-2', async () => {
      return await dispatchSequenceMessage({ subscriberId, stepNumber: 2 });
    });
    if (step2Result?.skipped) return { completed: true, step2Result };

    // Step 3: Day 4 at 10:00 AM
    const day4Date = calculateTargetSendDate(4, baseDate, timezone);
    await step.sleepUntil('sleep-until-day-4', day4Date);

    const step3Result = await step.run('dispatch-step-3', async () => {
      return await dispatchSequenceMessage({ subscriberId, stepNumber: 3 });
    });
    if (step3Result?.skipped) return { completed: true, step3Result };

    // Step 4: Day 7 at 10:00 AM
    const day7Date = calculateTargetSendDate(7, baseDate, timezone);
    await step.sleepUntil('sleep-until-day-7', day7Date);

    const step4Result = await step.run('dispatch-step-4', async () => {
      return await dispatchSequenceMessage({ subscriberId, stepNumber: 4 });
    });
    if (step4Result?.skipped) return { completed: true, step4Result };

    // Step 5: Day 10 at 10:00 AM
    const day10Date = calculateTargetSendDate(10, baseDate, timezone);
    await step.sleepUntil('sleep-until-day-10', day10Date);

    const step5Result = await step.run('dispatch-step-5', async () => {
      return await dispatchSequenceMessage({ subscriberId, stepNumber: 5 });
    });

    return {
      completed: true,
      sequenceId: SEQUENCE_ID,
      activeTrack: subscriber.activeTrack,
      step1Result,
      step2Result,
      step3Result,
      step4Result,
      step5Result,
    };
  }
);

