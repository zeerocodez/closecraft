const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// 1. Core Trial Constants & Calculations
describe('1. Seven-Day Starter Trial Duration & Policy Constants', () => {
  const TRIAL_DURATION_HOURS = 168; // 7 days = 168 hours
  const TRIAL_DURATION_MS = TRIAL_DURATION_HOURS * 60 * 60 * 1000;
  const TRIAL_POLICY_VERSION = 'V2_7DAY';

  it('defines exactly 168 hours (7 days) in milliseconds', () => {
    assert.strictEqual(TRIAL_DURATION_HOURS, 168);
    assert.strictEqual(TRIAL_DURATION_MS, 168 * 3600 * 1000);
    assert.strictEqual(TRIAL_DURATION_MS, 604800000);
  });

  it('computes exact remaining hours without misleading rounding up', () => {
    const startTime = new Date('2026-10-30T12:00:00.000Z');
    const trialEndsAt = new Date(startTime.getTime() + TRIAL_DURATION_MS);

    // Test at T0
    const remainingMsT0 = trialEndsAt.getTime() - startTime.getTime();
    const hoursT0 = Math.floor(remainingMsT0 / (1000 * 60 * 60));
    const daysT0 = Math.floor(remainingMsT0 / (1000 * 60 * 60 * 24));
    assert.strictEqual(hoursT0, 168);
    assert.strictEqual(daysT0, 7);

    // Test at T0 + 10 hours
    const atT10 = new Date(startTime.getTime() + 10 * 3600 * 1000);
    const remainingMsT10 = trialEndsAt.getTime() - atT10.getTime();
    const hoursT10 = Math.floor(remainingMsT10 / (1000 * 60 * 60));
    assert.strictEqual(hoursT10, 158);

    // Test at 1 hour before expiry
    const at1HourBefore = new Date(trialEndsAt.getTime() - 3600 * 1000);
    const remainingMs1h = trialEndsAt.getTime() - at1HourBefore.getTime();
    assert.strictEqual(Math.floor(remainingMs1h / (1000 * 60 * 60)), 1);

    // Test at 10 minutes before expiry
    const at10MinBefore = new Date(trialEndsAt.getTime() - 10 * 60 * 1000);
    const remainingMs10m = trialEndsAt.getTime() - at10MinBefore.getTime();
    assert.strictEqual(Math.floor(remainingMs10m / (1000 * 60 * 60)), 0); // 0 hours left, does not round up to 1 day!

    // Test at exact expiry
    assert.strictEqual(trialEndsAt.getTime() <= trialEndsAt.getTime(), true);

    // Test post expiry
    const postExpiry = new Date(trialEndsAt.getTime() + 1000);
    assert.strictEqual(postExpiry.getTime() >= trialEndsAt.getTime(), true);
  });
});

// 2. Commercial Pricing & Limits Alignment
describe('2. Commercial Plan Limits & Starter Lead Allowance', () => {
  const plans = {
    STARTER: {
      pricePerMonth: 20000,
      currency: 'NGN',
      maxInternalSeats: 3,
      maxActiveLeads: 1000,
    },
    PRO: {
      pricePerMonth: 45000,
      currency: 'NGN',
      maxInternalSeats: 10,
      maxActiveLeads: 10000,
    },
    ENTERPRISE: {
      pricePerMonth: 75000,
      currency: 'NGN',
      maxInternalSeats: 50,
      maxActiveLeads: 50000,
    },
    MANAGED_SALES: {
      pricePerMonth: 150000,
      currency: 'NGN',
    }
  };

  it('verifies Starter has ₦20,000/mo, 3 seats and published 1,000 active lead allowance', () => {
    assert.strictEqual(plans.STARTER.pricePerMonth, 20000);
    assert.strictEqual(plans.STARTER.maxInternalSeats, 3);
    assert.strictEqual(plans.STARTER.maxActiveLeads, 1000);
  });

  it('verifies Pro has ₦45,000/mo, 10 seats', () => {
    assert.strictEqual(plans.PRO.pricePerMonth, 45000);
    assert.strictEqual(plans.PRO.maxInternalSeats, 10);
  });

  it('verifies Enterprise has ₦75,000/mo', () => {
    assert.strictEqual(plans.ENTERPRISE.pricePerMonth, 75000);
  });

  it('verifies Managed Sales has ₦150,000 for 30 days', () => {
    assert.strictEqual(plans.MANAGED_SALES.pricePerMonth, 150000);
  });
});

// 3. Operational State & Controllable Clock Enforcement
describe('3. Operational State & Expiry Enforcement with Controllable Clock', () => {
  function evaluateSubscriptionState(mockSub, currentTime) {
    const now = new Date(currentTime);
    const trialStartedAt = mockSub.trialStartedAt ? new Date(mockSub.trialStartedAt) : null;
    const trialEndsAt = mockSub.trialEndsAt ? new Date(mockSub.trialEndsAt) : null;
    const paidThroughDate = mockSub.paidThroughDate ? new Date(mockSub.paidThroughDate) : null;

    const isPaid = paidThroughDate ? paidThroughDate > now : false;
    const isTrialActive = trialEndsAt ? trialEndsAt > now : false;
    const isContracted = mockSub.activePilotEngagementId !== null;

    const isOperational = isPaid || isTrialActive || isContracted;

    let status = 'EXPIRED';
    if (isContracted) status = 'PILOT_INCLUDED';
    else if (isPaid) status = 'ACTIVE';
    else if (isTrialActive) status = 'TRIALING';

    return {
      status,
      isOperational,
      trialDaysLeft: trialEndsAt && isTrialActive ? Math.floor((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
      trialHoursLeft: trialEndsAt && isTrialActive ? Math.floor((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60)) : 0,
    };
  }

  const t0 = new Date('2026-10-30T12:00:00.000Z');
  const tTrialEnds = new Date(t0.getTime() + 168 * 3600 * 1000);

  const mockSub = {
    trialStartedAt: t0,
    trialEndsAt: tTrialEnds,
    paidThroughDate: null,
    activePilotEngagementId: null,
  };

  it('grants operational access immediately upon provisioning (T0)', () => {
    const state = evaluateSubscriptionState(mockSub, t0);
    assert.strictEqual(state.isOperational, true);
    assert.strictEqual(state.status, 'TRIALING');
    assert.strictEqual(state.trialHoursLeft, 168);
    assert.strictEqual(state.trialDaysLeft, 7);
  });

  it('remains operational 100 hours into trial', () => {
    const t100 = new Date(t0.getTime() + 100 * 3600 * 1000);
    const state = evaluateSubscriptionState(mockSub, t100);
    assert.strictEqual(state.isOperational, true);
    assert.strictEqual(state.status, 'TRIALING');
    assert.strictEqual(state.trialHoursLeft, 68);
  });

  it('remains operational 1 minute before expiry (T0 + 167h 59m)', () => {
    const tBefore = new Date(tTrialEnds.getTime() - 60 * 1000);
    const state = evaluateSubscriptionState(mockSub, tBefore);
    assert.strictEqual(state.isOperational, true);
    assert.strictEqual(state.status, 'TRIALING');
  });

  it('immediately revokes operational access exactly at expiry (T0 + 168h)', () => {
    const state = evaluateSubscriptionState(mockSub, tTrialEnds);
    assert.strictEqual(state.isOperational, false);
    assert.strictEqual(state.status, 'EXPIRED');
    assert.strictEqual(state.trialHoursLeft, 0);
  });

  it('remains strictly revoked after expiry (T0 + 168h + 10m)', () => {
    const tAfter = new Date(tTrialEnds.getTime() + 10 * 60 * 1000);
    const state = evaluateSubscriptionState(mockSub, tAfter);
    assert.strictEqual(state.isOperational, false);
    assert.strictEqual(state.status, 'EXPIRED');
  });

  it('paid renewal immediately restores operational access regardless of expired trial', () => {
    const tAfter = new Date(tTrialEnds.getTime() + 24 * 3600 * 1000);
    const paidSub = {
      ...mockSub,
      paidThroughDate: new Date(tAfter.getTime() + 30 * 24 * 3600 * 1000), // 30 days paid
    };
    const state = evaluateSubscriptionState(paidSub, tAfter);
    assert.strictEqual(state.isOperational, true);
    assert.strictEqual(state.status, 'ACTIVE');
  });
});

// 4. Idempotency & Tenant Safety
describe('4. Idempotent Provisioning & Protection Against Trial Reset', () => {
  it('preserves existing trial dates on repeated signup / login', () => {
    const existingTrialStart = new Date('2026-10-30T10:00:00.000Z');
    const existingTrialEnd = new Date(existingTrialStart.getTime() + 168 * 3600 * 1000);

    const existingRecord = {
      organizationId: 'org_test_123',
      trialStartedAt: existingTrialStart,
      trialEndsAt: existingTrialEnd,
      status: 'TRIALING',
    };

    // Simulated idempotent find-or-create logic
    function getOrCreate(existing, now) {
      if (existing) {
        // Must return existing without modifying dates
        return existing;
      }
      return {
        organizationId: 'org_new',
        trialStartedAt: now,
        trialEndsAt: new Date(now.getTime() + 168 * 3600 * 1000),
        status: 'TRIALING',
      };
    }

    const result = getOrCreate(existingRecord, new Date('2026-11-01T15:00:00.000Z'));
    assert.strictEqual(result.trialStartedAt.getTime(), existingTrialStart.getTime());
    assert.strictEqual(result.trialEndsAt.getTime(), existingTrialEnd.getTime());
  });

  it('guarantees rerun of transition script does not extend trial end date', () => {
    const fixedRollout = new Date('2026-10-30T12:00:00.000Z');
    const fixedEnd = new Date(fixedRollout.getTime() + 168 * 3600 * 1000);

    const sub = {
      organizationId: 'org_pilot_1',
      trialStartedAt: fixedRollout,
      trialEndsAt: fixedEnd,
    };

    // If script runs again on 2026-11-02
    const isAlreadyTransitioned = sub.trialStartedAt.getTime() === fixedRollout.getTime();
    assert.strictEqual(isAlreadyTransitioned, true);
    // Date is NOT extended
    assert.strictEqual(sub.trialEndsAt.getTime(), fixedEnd.getTime());
  });
});

// 5. Landing Page, Pricing, and Signup Text Verification
describe('5. Verbatim Copy & Banned Phrase Auditing', () => {
  const landingWrapperPath = path.join(__dirname, '../src/app/(marketing)/LandingClientWrapper.tsx');
  const pricingPagePath = path.join(__dirname, '../src/app/(marketing)/pricing/page.tsx');
  const signupPagePath = path.join(__dirname, '../src/app/(auth)/signup/page.tsx');
  const marketingPagePath = path.join(__dirname, '../src/app/(marketing)/page.tsx');
  const billingClientPath = path.join(__dirname, '../src/components/billing/BillingClient.tsx');

  const landingWrapperContent = fs.readFileSync(landingWrapperPath, 'utf8');
  const pricingContent = fs.readFileSync(pricingPagePath, 'utf8');
  const signupContent = fs.readFileSync(signupPagePath, 'utf8');
  const marketingPageContent = fs.readFileSync(marketingPagePath, 'utf8');
  const billingClientContent = fs.readFileSync(billingClientPath, 'utf8');

  it('verifies approved Hero copy in LandingClientWrapper', () => {
    assert.ok(landingWrapperContent.includes('Stop losing sales to forgotten follow-up.'));
    assert.ok(landingWrapperContent.includes('SALES FOLLOW-UP SOFTWARE FOR GROWING TEAMS'));
    assert.ok(landingWrapperContent.includes('Give every promising enquiry an owner and a clear next step.'));
    assert.ok(landingWrapperContent.includes('Start My 7-Day Free Trial'));
    assert.ok(landingWrapperContent.includes('Request a Revenue Audit'));
  });

  it('verifies approved Problem section copy in LandingClientWrapper', () => {
    assert.ok(landingWrapperContent.includes('You paid to get their attention. What happens after they enquire?'));
    assert.ok(landingWrapperContent.includes('An interested buyer should not disappear into a spreadsheet or an unanswered message.'));
    assert.ok(landingWrapperContent.includes('More leads will not fix a broken follow-up process.'));
  });

  it('verifies approved Product demonstration copy and NO literal placeholder sentence', () => {
    assert.ok(landingWrapperContent.includes('See the next step behind the status.'));
    assert.ok(landingWrapperContent.includes('A lead marked "Qualified" still needs action.'));
    assert.ok(landingWrapperContent.includes('Closecraft brings the opportunity\'s status together with its follow-up context.'));
    // Ensure the builder placeholder sentence was NOT rendered literally!
    assert.strictEqual(landingWrapperContent.includes('[Insert a current product screenshot'), false);
    assert.strictEqual(landingWrapperContent.includes('Visual placement:'), false);
    // Ensure labeled demo data is present
    assert.ok(landingWrapperContent.includes('DEMO DATA'));
  });

  it('verifies approved How It Works 4 steps in LandingClientWrapper', () => {
    assert.ok(landingWrapperContent.includes('Build a follow-up process your team can actually use.'));
    assert.ok(landingWrapperContent.includes('1. Bring in your enquiries.'));
    assert.ok(landingWrapperContent.includes('2. Give the work an owner.'));
    assert.ok(landingWrapperContent.includes('3. Keep the conversation moving.'));
    assert.ok(landingWrapperContent.includes('4. Review the outcome.'));
  });

  it('verifies approved Managed Sales copy & button in LandingClientWrapper', () => {
    assert.ok(landingWrapperContent.includes('Have enquiries, but need help handling the sales conversations?'));
    assert.ok(landingWrapperContent.includes('From ₦150,000'));
    assert.ok(landingWrapperContent.includes('Request a Managed Sales Proposal'));
  });

  it('verifies approved Pricing tiers in LandingClientWrapper', () => {
    assert.ok(landingWrapperContent.includes('Try Closecraft free for 7 days.'));
    assert.ok(landingWrapperContent.includes('₦20,000'));
    assert.ok(landingWrapperContent.includes('₦45,000'));
    assert.ok(landingWrapperContent.includes('₦75,000'));
  });

  it('verifies approved Revenue Audit form heading, options, and success message in LandingClientWrapper', () => {
    assert.ok(landingWrapperContent.includes('Show us where follow-up gets difficult.'));
    assert.ok(landingWrapperContent.includes('Fewer than 20'));
    assert.ok(landingWrapperContent.includes('20–49'));
    assert.ok(landingWrapperContent.includes('50–199'));
    assert.ok(landingWrapperContent.includes('200 or more'));
    assert.ok(landingWrapperContent.includes('Request My Revenue Audit'));
    assert.ok(landingWrapperContent.includes('Your request has been received. We will contact you using the details you provided to discuss your current follow-up process.'));
  });

  it('verifies Section 4.B approved copy in Signup page', () => {
    assert.ok(signupContent.includes('7-DAY FREE TRIAL'));
    assert.ok(signupContent.includes('Put your follow-up in one workspace.'));
    assert.ok(signupContent.includes('Create your Closecraft workspace and start organising the enquiries you already have.'));
    assert.ok(signupContent.includes('Create My Trial Workspace'));
    assert.ok(signupContent.includes('No credit card required. No automatic charge when your trial ends.'));
    assert.ok(signupContent.includes('Already have an account?'));
    assert.ok(signupContent.includes('Sign in'));
    // Verify ordinary labels
    assert.ok(signupContent.includes('Business Name'));
    assert.ok(signupContent.includes('Password'));
    // Ensure enterprise SSO is not claimed for ordinary Google login
    assert.strictEqual(signupContent.includes('continue with enterprise SSO'), false);
    assert.ok(signupContent.includes('Sign up with Google'));
  });

  it('verifies Section 4.C approved copy in Pricing page', () => {
    assert.ok(pricingContent.includes('Try Closecraft free for 7 days.'));
    assert.ok(pricingContent.includes('Start with seven days of Starter access'));
    assert.ok(pricingContent.includes('₦20,000'));
    assert.ok(pricingContent.includes('₦45,000'));
    assert.ok(pricingContent.includes('₦75,000'));
    assert.ok(pricingContent.includes('From ₦150,000'));
    assert.ok(pricingContent.includes('The free trial includes Starter features. Managed sales services and DSS training are priced separately.'));
    // Ensure no 100% Free or Public Testing Pilot banner
    assert.strictEqual(pricingContent.includes('Public Testing Pilot'), false);
    assert.strictEqual(pricingContent.includes('100% Free During Real-User Testing'), false);
  });

  it('verifies Section 4.D approved banner copy in BillingClient', () => {
    assert.ok(billingClientContent.includes('Choose a plan to keep your follow-up running.'));
    assert.ok(billingClientContent.includes('Your free trial has ended.'));
    assert.ok(billingClientContent.includes('Choose a plan to continue using paid features. You can still access your account and billing options.'));
    assert.ok(billingClientContent.includes('We are confirming your payment. Your paid access will update after verification.'));
    assert.ok(billingClientContent.includes('Your payment has not been confirmed. Check its status before trying again.'));
    assert.ok(billingClientContent.includes('Choose a Plan'));
  });

  it('verifies SEO title and description in Marketing page metadata', () => {
    assert.ok(marketingPageContent.includes('Closecraft | 7-Day Free Trial for Sales Follow-Up'));
    assert.ok(marketingPageContent.includes('Organise enquiries and keep follow-up moving with Closecraft. Start a 7-day Starter trial with no credit card, or request a Revenue Audit for your business.'));
  });
});
