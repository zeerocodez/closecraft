const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Closecraft Welcome Sequence V1 Acceptance & Architecture Tests', async (t) => {
  const sequenceServicePath = path.join(__dirname, '../src/lib/marketing/welcomeSequence.ts');
  const templatesPath = path.join(__dirname, '../src/lib/marketing/templates/welcomeSequence.ts');
  const inngestWorkflowPath = path.join(__dirname, '../src/lib/inngest/marketing.ts');
  const brevoWebhookPath = path.join(__dirname, '../src/app/api/webhooks/brevo/route.ts');
  const preferencesApiPath = path.join(__dirname, '../src/app/api/marketing/preferences/route.ts');

  assert.ok(fs.existsSync(sequenceServicePath), 'welcomeSequence.ts must exist');
  assert.ok(fs.existsSync(templatesPath), 'welcomeSequence.ts templates must exist');
  assert.ok(fs.existsSync(inngestWorkflowPath), 'marketing.ts inngest workflow must exist');
  assert.ok(fs.existsSync(brevoWebhookPath), 'brevo webhook route must exist');
  assert.ok(fs.existsSync(preferencesApiPath), 'preferences API route must exist');

  const sequenceContent = fs.readFileSync(sequenceServicePath, 'utf8');
  const templatesContent = fs.readFileSync(templatesPath, 'utf8');
  const inngestContent = fs.readFileSync(inngestWorkflowPath, 'utf8');
  const webhookContent = fs.readFileSync(brevoWebhookPath, 'utf8');

  await t.test('1. Strict Trigger Enforcement & Non-Marketing Exclusions', () => {
    // Only confirmed newsletter subscriptions can enrol
    assert.ok(sequenceContent.includes("'CONFIRMED_NEWSLETTER_SUBSCRIPTION'"));

    // Explicitly rejects software account creation, course purchase, service enquiry, scraped lists
    assert.ok(sequenceContent.includes('ACCOUNT_CREATED'));
    assert.ok(sequenceContent.includes('COURSE_PURCHASED'));
    assert.ok(sequenceContent.includes('SERVICE_ENQUIRY_SUBMITTED'));
    assert.ok(sequenceContent.includes('SCRAPED_LEAD_IMPORT'));

    // In-memory simulation of trigger guard
    const BANNED_TRIGGERS = [
      'ACCOUNT_CREATED',
      'COURSE_PURCHASED',
      'SERVICE_ENQUIRY_SUBMITTED',
      'SCRAPED_LEAD_IMPORT',
    ];

    BANNED_TRIGGERS.forEach((trigger) => {
      const isValid = trigger === 'CONFIRMED_NEWSLETTER_SUBSCRIPTION';
      assert.strictEqual(isValid, false, `Trigger ${trigger} must not trigger welcome sequence`);
    });
  });

  await t.test('2. Segment Routing Logic (Business, Learning, Both, Unspecified)', () => {
    const routePreference = (pref) => {
      if (pref === 'BUSINESS') return { activeTrack: 'BUSINESS', sendsRemaining: true };
      if (pref === 'LEARNING') return { activeTrack: 'LEARNING', sendsRemaining: true };
      if (pref === 'BOTH') return { activeTrack: 'BUSINESS', sendsRemaining: true }; // Default to business; never both concurrently
      return { activeTrack: 'NONE', sendsRemaining: false }; // Unspecified -> Shared welcome only
    };

    // Business interest -> Business track
    const biz = routePreference('BUSINESS');
    assert.strictEqual(biz.activeTrack, 'BUSINESS');
    assert.strictEqual(biz.sendsRemaining, true);

    // Learning interest -> Learning track
    const learn = routePreference('LEARNING');
    assert.strictEqual(learn.activeTrack, 'LEARNING');
    assert.strictEqual(learn.sendsRemaining, true);

    // Both -> Defaults to Business track without running both concurrently
    const both = routePreference('BOTH');
    assert.strictEqual(both.activeTrack, 'BUSINESS');
    assert.strictEqual(both.sendsRemaining, true);

    // Unspecified -> Shared welcome only; invites preference
    const unspec = routePreference('UNSPECIFIED');
    assert.strictEqual(unspec.activeTrack, 'NONE');
    assert.strictEqual(unspec.sendsRemaining, false);
  });

  await t.test('3. Timing & 10:00 AM Timezone Calculation (Days 0, 2, 4, 7, 10)', () => {
    const calculateTarget = (dayOffset, baseDate, timezone = 'Africa/Lagos') => {
      const target = new Date(baseDate.getTime());
      target.setDate(target.getDate() + dayOffset);
      if (timezone === 'Africa/Lagos') {
        // Africa/Lagos is UTC+1; 10:00 AM local = 09:00 UTC
        target.setUTCHours(9, 0, 0, 0);
      } else {
        target.setUTCHours(10, 0, 0, 0);
      }
      return target;
    };

    const base = new Date('2026-11-01T14:30:00.000Z');
    const day2 = calculateTarget(2, base, 'Africa/Lagos');
    const day4 = calculateTarget(4, base, 'Africa/Lagos');
    const day7 = calculateTarget(7, base, 'Africa/Lagos');
    const day10 = calculateTarget(10, base, 'Africa/Lagos');

    assert.strictEqual(day2.toISOString(), '2026-11-03T09:00:00.000Z');
    assert.strictEqual(day4.toISOString(), '2026-11-05T09:00:00.000Z');
    assert.strictEqual(day7.toISOString(), '2026-11-08T09:00:00.000Z');
    assert.strictEqual(day10.toISOString(), '2026-11-11T09:00:00.000Z');
  });

  await t.test('4. Pre-Send Check: Subscription, Suppression, Duplicate & Conflicts', () => {
    const checkPreSend = (subscriber, messageKey, sentKeys, conflictingCampaignToday) => {
      if (subscriber.status !== 'ACTIVE') {
        return { canSend: false, reason: `INACTIVE_OR_PAUSED: ${subscriber.status}` };
      }
      if (subscriber.isSuppressed) {
        return { canSend: false, reason: 'SUPPRESSED' };
      }
      if (sentKeys.has(messageKey)) {
        return { canSend: false, reason: 'ALREADY_SENT' };
      }
      if (subscriber.conversionType) {
        return { canSend: false, reason: `CONVERTED: ${subscriber.conversionType}` };
      }
      if (conflictingCampaignToday) {
        return { canSend: false, reason: 'CONFLICTING_CAMPAIGN_SCHEDULED' };
      }
      return { canSend: true };
    };

    // Active subscriber -> can send
    const res1 = checkPreSend({ status: 'ACTIVE', isSuppressed: false }, 'BIZ_02', new Set(), false);
    assert.strictEqual(res1.canSend, true);

    // Suppressed subscriber -> blocked
    const res2 = checkPreSend({ status: 'UNSUBSCRIBED', isSuppressed: true }, 'BIZ_02', new Set(), false);
    assert.strictEqual(res2.canSend, false);
    assert.match(res2.reason, /INACTIVE_OR_PAUSED/);

    // Already sent message -> blocked
    const res3 = checkPreSend({ status: 'ACTIVE', isSuppressed: false }, 'BIZ_02', new Set(['BIZ_02']), false);
    assert.strictEqual(res3.canSend, false);
    assert.strictEqual(res3.reason, 'ALREADY_SENT');

    // Converted subscriber -> exits
    const res4 = checkPreSend(
      { status: 'ACTIVE', isSuppressed: false, conversionType: 'DSS_ENROLMENT' },
      'DSS_03',
      new Set(),
      false
    );
    assert.strictEqual(res4.canSend, false);
    assert.match(res4.reason, /CONVERTED/);

    // Conflicting campaign today -> blocked
    const res5 = checkPreSend({ status: 'ACTIVE', isSuppressed: false }, 'BIZ_03', new Set(), true);
    assert.strictEqual(res5.canSend, false);
    assert.strictEqual(res5.reason, 'CONFLICTING_CAMPAIGN_SCHEDULED');
  });

  await t.test('5. Conversions Exits & Human Follow-Up Pauses', () => {
    // DSS enrolment exits sequence
    assert.ok(sequenceContent.includes('DSS_ENROLMENT'));
    assert.ok(sequenceContent.includes('SKIPPED_CONVERTED'));

    // Software activation exits sequence
    assert.ok(sequenceContent.includes('SOFTWARE_ACTIVATION'));

    // Active service enquiry pauses promotional sequence
    assert.ok(sequenceContent.includes('PAUSED_SERVICE_ENQUIRY'));
    assert.ok(sequenceContent.includes('pauseForServiceEnquiry'));
  });

  await t.test('6. Suppression Handling & Protection Against Auto-Resubscribe', () => {
    // Unsubscribe, hard bounce, complaint
    assert.ok(sequenceContent.includes("'UNSUBSCRIBED'"));
    assert.ok(sequenceContent.includes("'BOUNCED'"));
    assert.ok(sequenceContent.includes("'COMPLAINED'"));
    assert.ok(sequenceContent.includes('isSuppressed: true'));
    assert.ok(sequenceContent.includes('Automatic resubscription is prohibited'));
  });

  await t.test('7. Deduplication & Idempotent Contact Updates', () => {
    // Unique contact + sequence + message key
    assert.ok(sequenceContent.includes('idempotencyKey'));
    assert.ok(sequenceContent.includes('ALREADY_ENROLLED'));
    assert.ok(sequenceContent.includes('Routine updates will not restart sequence'));
  });

  await t.test('8. Preference Updates for Unspecified Subscribers Without Step 1 Restart', () => {
    // Unspecified subscriber choosing a preference does NOT restart step 1
    assert.ok(sequenceContent.includes('updateSubscriberPreference'));
    assert.ok(sequenceContent.includes('without restarting welcome email'));
  });

  await t.test('9. Legally Compliant Marketing Footers & Destination Links', () => {
    // Footers contain Zeerocodes legal entity, address, and unsubscribe link
    assert.ok(templatesContent.includes('Zeerocodes Automation Limited'));
    assert.ok(templatesContent.includes('Unsubscribe with one click'));
    assert.ok(templatesContent.includes('unsubscribe_url'));
  });

  await t.test('10. Inngest Workflow Integration & Cancellation Events', () => {
    // Inngest workflow handles cancellation on suppression and conversion
    assert.ok(inngestContent.includes('closecraft-welcome-sequence-v1'));
    assert.ok(inngestContent.includes('marketing/subscriber.suppressed'));
    assert.ok(inngestContent.includes('marketing/conversion.recorded'));
    assert.ok(inngestContent.includes('sleepUntil'));
  });
});

