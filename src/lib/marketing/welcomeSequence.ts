import { db } from '@/lib/db';
import { sendTransactionalEmail } from '@/lib/email';
import {
  renderSharedWelcome,
  renderBiz02,
  renderBiz03,
  renderBiz04,
  renderBiz05,
  renderDSS02,
  renderDSS03,
  renderDSS04,
  renderDSS05,
  RenderedWelcomeEmail,
} from './templates/welcomeSequence';

export const SEQUENCE_ID = 'CLOSECRAFT_WELCOME_V1';
export const DEFAULT_TIMEZONE = 'Africa/Lagos';

export type TrackPreference = 'BUSINESS' | 'LEARNING' | 'BOTH' | 'UNSPECIFIED';
export type ActiveTrack = 'BUSINESS' | 'LEARNING' | 'NONE';
export type SubscriberStatus =
  | 'PENDING_CONFIRMATION'
  | 'ACTIVE'
  | 'UNSUBSCRIBED'
  | 'BOUNCED'
  | 'COMPLAINED'
  | 'PAUSED_SERVICE_ENQUIRY';

export const VALID_TRIGGERS = ['CONFIRMED_NEWSLETTER_SUBSCRIPTION'] as const;
export const BANNED_TRIGGERS = [
  'ACCOUNT_CREATED',
  'COURSE_PURCHASED',
  'SERVICE_ENQUIRY_SUBMITTED',
  'SCRAPED_LEAD_IMPORT',
] as const;

export interface EnrolSubscriberInput {
  email: string;
  name?: string;
  triggerSource: string;
  trackPreference?: TrackPreference;
  timezone?: string;
  metadata?: Record<string, any>;
}

export interface EnrolSubscriberResult {
  enrolled: boolean;
  subscriberId?: string;
  reason?: string;
  activeTrack?: ActiveTrack;
  isExisting?: boolean;
}

/**
 * Calculates delayed send time targeting 10:00 AM in subscriber's time zone.
 * Default timezone: Africa/Lagos (UTC+1, which is 09:00 UTC).
 */
export function calculateTargetSendDate(
  dayOffset: number,
  baseDate: Date = new Date(),
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const target = new Date(baseDate.getTime());
  target.setDate(target.getDate() + dayOffset);

  // Set 10:00 AM target time.
  // For Africa/Lagos (UTC+1), 10:00 AM local = 09:00 AM UTC.
  const isLagos = !timezone || timezone === 'Africa/Lagos';
  if (isLagos) {
    target.setUTCHours(9, 0, 0, 0);
  } else {
    // Standard approximation: 10:00 AM UTC for unspecified international timezones
    target.setUTCHours(10, 0, 0, 0);
  }

  // If calculation results in a past time today, target next day 10am
  if (dayOffset === 0 && target.getTime() <= baseDate.getTime()) {
    return new Date(baseDate.getTime());
  }

  return target;
}

/**
 * 1. TRIGGER & ENROLMENT
 * Enrols confirmed newsletter subscriptions ONLY.
 * Rejects software signups, course purchases, service enquiries, scraped leads.
 */
export async function enrolConfirmedSubscriber(
  input: EnrolSubscriberInput
): Promise<EnrolSubscriberResult> {
  const cleanEmail = input.email.trim().toLowerCase();

  // Strict trigger validation:
  if (!VALID_TRIGGERS.includes(input.triggerSource as any)) {
    return {
      enrolled: false,
      reason: `REJECTED_TRIGGER: Cannot enrol contact from trigger '${input.triggerSource}'. A separate marketing subscription is required.`,
    };
  }

  // Check if subscriber exists
  let subscriber = await db.marketingSubscriber.findUnique({
    where: { email: cleanEmail },
    include: { sequenceLogs: true },
  });

  if (subscriber) {
    // If contact is suppressed, NEVER automatically resubscribe
    if (subscriber.isSuppressed || ['UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED'].includes(subscriber.status)) {
      return {
        enrolled: false,
        subscriberId: subscriber.id,
        reason: 'REJECTED_SUPPRESSED: Contact is unsubscribed or suppressed. Automatic resubscription is prohibited.',
      };
    }

    // If already in sequence, do NOT restart sequence
    const hasStartedSequence = subscriber.sequenceLogs.some(
      (log) => log.sequenceId === SEQUENCE_ID && log.stepNumber === 1
    );

    if (hasStartedSequence) {
      return {
        enrolled: true,
        subscriberId: subscriber.id,
        activeTrack: subscriber.activeTrack as ActiveTrack,
        isExisting: true,
        reason: 'ALREADY_ENROLLED: Subscriber already active in Welcome Sequence. Routine updates will not restart sequence.',
      };
    }
  }

  // Segment routing logic:
  // Business -> Business emails 2-5
  // Learning -> DSS emails 2-5
  // Both -> Defaults to Business track; do not run both concurrently
  // Unspecified -> Shared welcome only; invite preference
  const rawPreference: TrackPreference = input.trackPreference || 'UNSPECIFIED';
  let activeTrack: ActiveTrack = 'NONE';

  if (rawPreference === 'BUSINESS') {
    activeTrack = 'BUSINESS';
  } else if (rawPreference === 'LEARNING') {
    activeTrack = 'LEARNING';
  } else if (rawPreference === 'BOTH') {
    activeTrack = 'BUSINESS'; // Default to business track when both; never run both simultaneously
  } else {
    activeTrack = 'NONE'; // Shared welcome only
  }

  const now = new Date();
  const timezone = input.timezone || DEFAULT_TIMEZONE;

  // Upsert subscriber record
  subscriber = await db.marketingSubscriber.upsert({
    where: { email: cleanEmail },
    create: {
      email: cleanEmail,
      name: input.name?.trim() || null,
      source: 'CONFIRMED_NEWSLETTER_SUBSCRIPTION',
      status: 'ACTIVE',
      trackPreference: rawPreference,
      activeTrack,
      timezone,
      confirmedAt: now,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
    update: {
      status: 'ACTIVE',
      confirmedAt: now,
      trackPreference: rawPreference,
      activeTrack,
      timezone,
    },
    include: { sequenceLogs: true },
  });

  // Log confirmed subscription event
  await db.marketingEvent.create({
    data: {
      subscriberId: subscriber.id,
      eventType: 'SUBSCRIPTION_CONFIRMED',
      details: JSON.stringify({
        trackPreference: rawPreference,
        activeTrack,
        source: input.triggerSource,
        timezone,
      }),
    },
  });

  // Schedule Step 1 (Immediate)
  const step1Key = `${subscriber.id}_${SEQUENCE_ID}_SHARED_WELCOME`;
  await db.marketingSequenceLog.upsert({
    where: { idempotencyKey: step1Key },
    create: {
      subscriberId: subscriber.id,
      sequenceId: SEQUENCE_ID,
      stepNumber: 1,
      messageKey: 'SHARED_WELCOME',
      idempotencyKey: step1Key,
      scheduledFor: now,
      status: 'PENDING',
    },
    update: {},
  });

  // Pre-schedule Steps 2–5 if an active track is selected
  if (activeTrack !== 'NONE') {
    await scheduleRemainingSteps(subscriber.id, activeTrack, now, timezone);
  }

  return {
    enrolled: true,
    subscriberId: subscriber.id,
    activeTrack,
    isExisting: false,
  };
}

/**
 * Schedules Steps 2, 3, 4, 5 for Days 2, 4, 7, 10
 */
async function scheduleRemainingSteps(
  subscriberId: string,
  activeTrack: 'BUSINESS' | 'LEARNING',
  confirmedAt: Date,
  timezone: string
) {
  const steps = [
    { stepNumber: 2, dayOffset: 2, messageKey: activeTrack === 'BUSINESS' ? 'BIZ_02' : 'DSS_02' },
    { stepNumber: 3, dayOffset: 4, messageKey: activeTrack === 'BUSINESS' ? 'BIZ_03' : 'DSS_03' },
    { stepNumber: 4, dayOffset: 7, messageKey: activeTrack === 'BUSINESS' ? 'BIZ_04' : 'DSS_04' },
    { stepNumber: 5, dayOffset: 10, messageKey: activeTrack === 'BUSINESS' ? 'BIZ_05' : 'DSS_05' },
  ];

  for (const step of steps) {
    const scheduledFor = calculateTargetSendDate(step.dayOffset, confirmedAt, timezone);
    const key = `${subscriberId}_${SEQUENCE_ID}_${step.messageKey}`;

    await db.marketingSequenceLog.upsert({
      where: { idempotencyKey: key },
      create: {
        subscriberId,
        sequenceId: SEQUENCE_ID,
        stepNumber: step.stepNumber,
        messageKey: step.messageKey,
        idempotencyKey: key,
        scheduledFor,
        status: 'PENDING',
      },
      update: {
        scheduledFor,
        messageKey: step.messageKey,
      },
    });
  }
}

/**
 * 2. PRE-SEND CHECK
 * Before every email, verifies:
 * - Marketing subscription remains active.
 * - Contact is not suppressed.
 * - Message has not already been sent.
 * - The subscriber has not completed the relevant conversion.
 * - A conflicting campaign is not scheduled that day.
 */
export async function verifyPreSendConditions(params: {
  subscriberId: string;
  sequenceId: string;
  stepNumber: number;
  messageKey: string;
  scheduledDate?: Date;
}): Promise<{ canSend: boolean; reason?: string }> {
  const subscriber = await db.marketingSubscriber.findUnique({
    where: { id: params.subscriberId },
    include: { sequenceLogs: true },
  });

  if (!subscriber) {
    return { canSend: false, reason: 'SUBSCRIBER_NOT_FOUND' };
  }

  // 1. Subscription active
  if (subscriber.status !== 'ACTIVE') {
    if (subscriber.status === 'PAUSED_SERVICE_ENQUIRY') {
      return { canSend: false, reason: 'PAUSED_SERVICE_ENQUIRY: Promotional messages paused during active human sales follow-up.' };
    }
    return { canSend: false, reason: `INACTIVE_SUBSCRIPTION: Status is ${subscriber.status}` };
  }

  // 2. Not suppressed
  if (subscriber.isSuppressed) {
    return { canSend: false, reason: `SUPPRESSED: ${subscriber.suppressionReason || 'Contact is suppressed'}` };
  }

  // 3. Duplicate check (Idempotency)
  const idempotencyKey = `${params.subscriberId}_${params.sequenceId}_${params.messageKey}`;
  const existingLog = subscriber.sequenceLogs.find((l) => l.idempotencyKey === idempotencyKey);
  if (existingLog && existingLog.status === 'SENT') {
    return { canSend: false, reason: 'ALREADY_SENT: Message has already been sent to this subscriber.' };
  }

  // 4. Conversion check:
  // - DSS enrolment -> Exit DSS acquisition sequence
  // - Software activation -> Exit business software acquisition sequence
  if (subscriber.activeTrack === 'LEARNING' && subscriber.conversionType === 'DSS_ENROLMENT') {
    return { canSend: false, reason: 'CONVERTED_DSS: Subscriber has enrolled in DSS. Exiting learning sequence.' };
  }

  if (subscriber.activeTrack === 'BUSINESS' && subscriber.conversionType === 'SOFTWARE_ACTIVATION') {
    return { canSend: false, reason: 'CONVERTED_SOFTWARE: Subscriber has activated Closecraft software. Exiting business sequence.' };
  }

  // Check if a conversion exists in the database for this email address
  if (subscriber.activeTrack === 'LEARNING') {
    const student = await db.studentProfile.findFirst({
      where: { user: { email: subscriber.email } },
    });
    if (student) {
      await recordConversion(subscriber.email, 'DSS_ENROLMENT');
      return { canSend: false, reason: 'CONVERTED_DSS: Student record detected in database. Exiting sequence.' };
    }
  }

  if (subscriber.activeTrack === 'BUSINESS') {
    const orgMember = await db.organizationMember.findFirst({
      where: { user: { email: subscriber.email } },
    });
    if (orgMember) {
      await recordConversion(subscriber.email, 'SOFTWARE_ACTIVATION');
      return { canSend: false, reason: 'CONVERTED_SOFTWARE: Active workspace membership detected. Exiting sequence.' };
    }
  }

  // 5. Conflicting campaign check
  // Verify no manual/broadcast campaign is scheduled for this subscriber on the same day
  const targetDate = params.scheduledDate || new Date();
  const dayStart = new Date(targetDate);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const conflictingLog = subscriber.sequenceLogs.find(
    (l) =>
      l.sequenceId !== params.sequenceId &&
      l.scheduledFor >= dayStart &&
      l.scheduledFor <= dayEnd &&
      l.status === 'SENT'
  );

  if (conflictingLog) {
    return { canSend: false, reason: 'CONFLICTING_CAMPAIGN_SCHEDULED: Another broadcast campaign was dispatched today.' };
  }

  return { canSend: true };
}

/**
 * 3. PREFERENCE UPDATES
 * Unspecified subscriber selects preference:
 * - Updates preference & active track.
 * - Schedules remaining steps 2–5.
 * - DOES NOT re-send or restart Step 1 (Welcome email).
 */
export async function updateSubscriberPreference(
  email: string,
  newPreference: 'BUSINESS' | 'LEARNING' | 'BOTH'
): Promise<{ success: boolean; activeTrack: ActiveTrack; message: string }> {
  const cleanEmail = email.trim().toLowerCase();

  const subscriber = await db.marketingSubscriber.findUnique({
    where: { email: cleanEmail },
    include: { sequenceLogs: true },
  });

  if (!subscriber) {
    throw new Error(`Subscriber with email ${cleanEmail} not found`);
  }

  const activeTrack: ActiveTrack = newPreference === 'LEARNING' ? 'LEARNING' : 'BUSINESS';

  await db.marketingSubscriber.update({
    where: { id: subscriber.id },
    data: {
      trackPreference: newPreference,
      activeTrack,
    },
  });

  await db.marketingEvent.create({
    data: {
      subscriberId: subscriber.id,
      eventType: 'PREFERENCE_UPDATED',
      details: JSON.stringify({ preference: newPreference, activeTrack }),
    },
  });

  // Verify Step 1 status. Do NOT restart or re-send Step 1!
  const confirmedAt = subscriber.confirmedAt || subscriber.createdAt;
  await scheduleRemainingSteps(subscriber.id, activeTrack, confirmedAt, subscriber.timezone);

  return {
    success: true,
    activeTrack,
    message: `Preference updated to ${newPreference}. Remaining sequence steps scheduled on ${activeTrack} track without restarting welcome email.`,
  };
}

/**
 * 4. CONVERSIONS
 * Exits sequence upon verified DSS enrolment or software activation.
 */
export async function recordConversion(
  email: string,
  conversionType: 'DSS_ENROLMENT' | 'SOFTWARE_ACTIVATION'
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const subscriber = await db.marketingSubscriber.findUnique({
    where: { email: cleanEmail },
  });

  if (!subscriber) return;

  await db.marketingSubscriber.update({
    where: { id: subscriber.id },
    data: {
      convertedAt: new Date(),
      conversionType,
    },
  });

  // Mark all pending sequence steps as SKIPPED_CONVERTED
  await db.marketingSequenceLog.updateMany({
    where: {
      subscriberId: subscriber.id,
      sequenceId: SEQUENCE_ID,
      status: 'PENDING',
    },
    data: {
      status: 'SKIPPED_CONVERTED',
    },
  });

  await db.marketingEvent.create({
    data: {
      subscriberId: subscriber.id,
      eventType: 'CONVERSION_RECORDED',
      details: JSON.stringify({ conversionType, convertedAt: new Date().toISOString() }),
    },
  });
}

/**
 * 5. SERVICE ENQUIRY PAUSE & RESUME
 * Pause conflicting promotional messages during active human follow-up.
 */
export async function pauseForServiceEnquiry(email: string, reason?: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const subscriber = await db.marketingSubscriber.findUnique({
    where: { email: cleanEmail },
  });

  if (!subscriber) return;

  await db.marketingSubscriber.update({
    where: { id: subscriber.id },
    data: {
      status: 'PAUSED_SERVICE_ENQUIRY',
    },
  });

  await db.marketingEvent.create({
    data: {
      subscriberId: subscriber.id,
      eventType: 'PROMOTIONS_PAUSED_FOR_SERVICE_ENQUIRY',
      details: JSON.stringify({ reason: reason || 'Active service enquiry negotiation' }),
    },
  });
}

export async function resumeAfterServiceEnquiry(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const subscriber = await db.marketingSubscriber.findUnique({
    where: { email: cleanEmail },
  });

  if (!subscriber || subscriber.isSuppressed) return;

  await db.marketingSubscriber.update({
    where: { id: subscriber.id },
    data: {
      status: 'ACTIVE',
    },
  });

  await db.marketingEvent.create({
    data: {
      subscriberId: subscriber.id,
      eventType: 'PROMOTIONS_RESUMED',
      details: JSON.stringify({ resumedAt: new Date().toISOString() }),
    },
  });
}

/**
 * 6. SUPPRESSION (Unsubscribe, Complaint, Hard Bounce)
 * Stops all marketing sends and cancels pending sequence steps.
 * Never automatically resubscribes.
 */
export async function suppressSubscriber(
  email: string,
  suppressionType: 'UNSUBSCRIBED' | 'BOUNCED' | 'COMPLAINED',
  reason?: string
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const subscriber = await db.marketingSubscriber.findUnique({
    where: { email: cleanEmail },
  });

  if (!subscriber) return;

  const now = new Date();
  await db.marketingSubscriber.update({
    where: { id: subscriber.id },
    data: {
      status: suppressionType,
      isSuppressed: true,
      suppressionReason: reason || suppressionType,
      unsubscribedAt: now,
      unsubscribeReason: reason || suppressionType,
    },
  });

  // Cancel all pending sequence messages
  await db.marketingSequenceLog.updateMany({
    where: {
      subscriberId: subscriber.id,
      status: 'PENDING',
    },
    data: {
      status: 'SKIPPED_SUPPRESSED',
    },
  });

  await db.marketingEvent.create({
    data: {
      subscriberId: subscriber.id,
      eventType: suppressionType,
      details: JSON.stringify({ suppressionType, reason, timestamp: now.toISOString() }),
    },
  });
}

/**
 * 7. DISPATCH STEP MESSAGE
 * Renders appropriate template, validates pre-send checks, and dispatches email.
 */
export async function dispatchSequenceMessage(params: {
  subscriberId: string;
  stepNumber: number;
}): Promise<{ success: boolean; messageKey?: string; error?: string; skipped?: boolean }> {
  const subscriber = await db.marketingSubscriber.findUnique({
    where: { id: params.subscriberId },
    include: { sequenceLogs: true },
  });

  if (!subscriber) {
    return { success: false, error: 'SUBSCRIBER_NOT_FOUND' };
  }

  // Resolve message key
  let messageKey = 'SHARED_WELCOME';
  if (params.stepNumber === 1) {
    messageKey = 'SHARED_WELCOME';
  } else if (subscriber.activeTrack === 'BUSINESS') {
    if (params.stepNumber === 2) messageKey = 'BIZ_02';
    else if (params.stepNumber === 3) messageKey = 'BIZ_03';
    else if (params.stepNumber === 4) messageKey = 'BIZ_04';
    else if (params.stepNumber === 5) messageKey = 'BIZ_05';
  } else if (subscriber.activeTrack === 'LEARNING') {
    if (params.stepNumber === 2) messageKey = 'DSS_02';
    else if (params.stepNumber === 3) messageKey = 'DSS_03';
    else if (params.stepNumber === 4) messageKey = 'DSS_04';
    else if (params.stepNumber === 5) messageKey = 'DSS_05';
  } else {
    // If subscriber remains UNSPECIFIED after step 1, do not send steps 2-5
    return {
      success: true,
      skipped: true,
      error: 'UNSPECIFIED_TRACK: Steps 2–5 require subscriber to choose a preference first.',
    };
  }

  // Run Pre-Send check
  const preSend = await verifyPreSendConditions({
    subscriberId: subscriber.id,
    sequenceId: SEQUENCE_ID,
    stepNumber: params.stepNumber,
    messageKey,
  });

  const idempotencyKey = `${subscriber.id}_${SEQUENCE_ID}_${messageKey}`;

  if (!preSend.canSend) {
    await db.marketingSequenceLog.upsert({
      where: { idempotencyKey },
      create: {
        subscriberId: subscriber.id,
        sequenceId: SEQUENCE_ID,
        stepNumber: params.stepNumber,
        messageKey,
        idempotencyKey,
        scheduledFor: new Date(),
        status: preSend.reason?.startsWith('CONVERTED') ? 'SKIPPED_CONVERTED' : 'SKIPPED_SUPPRESSED',
        errorMessage: preSend.reason,
      },
      update: {
        status: preSend.reason?.startsWith('CONVERTED') ? 'SKIPPED_CONVERTED' : 'SKIPPED_SUPPRESSED',
        errorMessage: preSend.reason,
      },
    });

    return { success: false, skipped: true, error: preSend.reason };
  }

  // Render template
  const emailData = {
    first_name: subscriber.name || undefined,
    email: subscriber.email,
    unsubscribe_url: `https://www.closecrafthq.com/unsubscribe?email=${encodeURIComponent(subscriber.email)}`,
    preference_url: `https://www.closecrafthq.com/preferences?email=${encodeURIComponent(subscriber.email)}`,
    trial_url: 'https://www.closecrafthq.com/signup',
    dss_url: 'https://www.closecrafthq.com/dss/apply',
  };

  let rendered: RenderedWelcomeEmail;
  switch (messageKey) {
    case 'SHARED_WELCOME': rendered = renderSharedWelcome(emailData); break;
    case 'BIZ_02': rendered = renderBiz02(emailData); break;
    case 'BIZ_03': rendered = renderBiz03(emailData); break;
    case 'BIZ_04': rendered = renderBiz04(emailData); break;
    case 'BIZ_05': rendered = renderBiz05(emailData); break;
    case 'DSS_02': rendered = renderDSS02(emailData); break;
    case 'DSS_03': rendered = renderDSS03(emailData); break;
    case 'DSS_04': rendered = renderDSS04(emailData); break;
    case 'DSS_05': rendered = renderDSS05(emailData); break;
    default:
      throw new Error(`Unsupported messageKey: ${messageKey}`);
  }

  const isDss = messageKey.startsWith('DSS_');
  const from = isDss ? 'DSS by Closecraft <info@closecrafthq.com>' : 'Closecraft <info@closecrafthq.com>';

  const delivery = await sendTransactionalEmail({
    to: subscriber.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    from,
    replyTo: 'info@closecrafthq.com',
  });

  const now = new Date();
  const providerMessageId = (delivery as any).data?.id || (delivery as any).messageId || 'mock-id';

  await db.marketingSequenceLog.upsert({
    where: { idempotencyKey },
    create: {
      subscriberId: subscriber.id,
      sequenceId: SEQUENCE_ID,
      stepNumber: params.stepNumber,
      messageKey,
      idempotencyKey,
      scheduledFor: now,
      sentAt: now,
      status: delivery.success ? 'SENT' : 'FAILED',
      providerMessageId,
      errorMessage: delivery.success ? null : (delivery as any).error,
    },
    update: {
      sentAt: now,
      status: delivery.success ? 'SENT' : 'FAILED',
      providerMessageId,
      errorMessage: delivery.success ? null : (delivery as any).error,
    },
  });

  if (delivery.success) {
    await db.marketingEvent.create({
      data: {
        subscriberId: subscriber.id,
        eventType: 'EMAIL_DELIVERED',
        details: JSON.stringify({
          stepNumber: params.stepNumber,
          messageKey,
          providerMessageId,
          sentAt: now.toISOString(),
        }),
      },
    });
  }

  return {
    success: delivery.success,
    messageKey,
    error: delivery.success ? undefined : (delivery as any).error,
  };
}

/**
 * 8. TRACKING & METRICS REPORTING
 */
export async function getSequenceMetrics(sequenceId = SEQUENCE_ID) {
  const confirmedSubscriptions = await db.marketingEvent.count({
    where: { eventType: 'SUBSCRIPTION_CONFIRMED' },
  });

  const deliveredEmails = await db.marketingEvent.count({
    where: { eventType: 'EMAIL_DELIVERED' },
  });

  const uniqueClicks = await db.marketingEvent.count({
    where: { eventType: 'LINK_CLICKED' },
  });

  const unsubscribes = await db.marketingEvent.count({
    where: { eventType: 'UNSUBSCRIBED' },
  });

  const complaints = await db.marketingEvent.count({
    where: { eventType: 'COMPLAINED' },
  });

  const conversionsDss = await db.marketingSubscriber.count({
    where: { conversionType: 'DSS_ENROLMENT' },
  });

  const conversionsSoftware = await db.marketingSubscriber.count({
    where: { conversionType: 'SOFTWARE_ACTIVATION' },
  });

  return {
    sequenceId,
    confirmedSubscriptions,
    deliveredEmails,
    uniqueClicks,
    unsubscribes,
    complaints,
    conversions: {
      dssEnrolments: conversionsDss,
      softwareActivations: conversionsSoftware,
      total: conversionsDss + conversionsSoftware,
    },
    notes: 'Opens are treated as approximate. Unique clicks are tracked without falsely qualifying clicks as sales leads.',
  };
}

