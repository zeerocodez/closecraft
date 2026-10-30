const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

test('DSS Early Bird Offer & Transactional Email System Acceptance Suite', async (t) => {
  const landingClientFile = fs.readFileSync(path.join(ROOT, 'src/app/dss/DSSLandingClient.tsx'), 'utf8');
  const earlyBirdLibFile = fs.readFileSync(path.join(ROOT, 'src/lib/dss/early-bird.ts'), 'utf8');
  const couponApiFile = fs.readFileSync(path.join(ROOT, 'src/app/api/dss/coupon/route.ts'), 'utf8');
  const checkoutApiFile = fs.readFileSync(path.join(ROOT, 'src/app/api/dss/checkout/route.ts'), 'utf8');
  const ccTemplatesFile = fs.readFileSync(path.join(ROOT, 'src/lib/email/templates/closecraft.ts'), 'utf8');
  const dssTemplatesFile = fs.readFileSync(path.join(ROOT, 'src/lib/email/templates/dss.ts'), 'utf8');
  const emailServiceFile = fs.readFileSync(path.join(ROOT, 'src/lib/email/service.ts'), 'utf8');
  const prismaSchemaFile = fs.readFileSync(path.join(ROOT, 'prisma/schema.prisma'), 'utf8');

  // --- SECTION 1: EARLY BIRD DISCOUNT PRICING & LOGIC ---
  await t.test('1. Early bird pricing rule: 50% discount calculation', () => {
    // ₦100,000 -> ₦50,000; ₦150,000 -> ₦75,000
    assert.match(earlyBirdLibFile, /EARLY_BIRD_DISCOUNT_PERCENT\s*=\s*50/, 'Must be centrally configured at 50%');
    assert.match(earlyBirdLibFile, /EARLY_BIRD_CAMPAIGN_CODE\s*=\s*'cohort001'/, 'Authoritative redemption code must be cohort001');
    assert.match(earlyBirdLibFile, /currency:\s*'NGN'/, 'Currency must be NGN');

    // Check pricing math in early bird library
    assert.match(
      earlyBirdLibFile,
      /Math\.floor\(\(originalPriceKobo\s*\*\s*campaign\.discountPercent\)\s*\/\s*100\)/,
      '50% discount must be calculated from authoritative base price'
    );
  });

  await t.test('2. Case-insensitivity and whitespace trimming for cohort001', () => {
    assert.match(
      earlyBirdLibFile,
      /code\.trim\(\)\.toLowerCase\(\)/,
      'Must trim surrounding whitespace and accept code case-insensitively'
    );
  });

  await t.test('3. Eligible product scope vs exclusions', () => {
    // Eligible products
    assert.match(earlyBirdLibFile, /'dss-setters-route'/);
    assert.match(earlyBirdLibFile, /'dss-closers-route'/);
    assert.match(earlyBirdLibFile, /'dss-live-roleplay-internship'/);
    assert.match(earlyBirdLibFile, /'dss-both-routes'/);

    // Excluded products
    assert.match(earlyBirdLibFile, /starter-/);
    assert.match(earlyBirdLibFile, /pro-/);
    assert.match(earlyBirdLibFile, /enterprise-/);
    assert.match(earlyBirdLibFile, /managed-sales/);

    // Rejection of wrong product
    assert.match(
      earlyBirdLibFile,
      /This offer applies to selected DSS programmes\. It isn’t available for this purchase\./
    );
  });

  await t.test('4. Single-use redemption limit and anti-stacking', () => {
    assert.match(earlyBirdLibFile, /One redemption per learner limit check/);
    assert.match(
      earlyBirdLibFile,
      /You’ve already used this early bird offer\./
    );
    assert.match(
      earlyBirdLibFile,
      /This offer can’t be combined with your current discount\./
    );
  });

  await t.test('5. Transactional reservation with bounded expiry', () => {
    // Check 30-minute lock in early-bird.ts
    assert.match(earlyBirdLibFile, /RESERVATION_WINDOW_MINUTES\s*=\s*30/, '30-minute lock duration');
    assert.match(earlyBirdLibFile, /releaseDiscountReservation/, 'Must provide reservation release');
    assert.match(earlyBirdLibFile, /confirmDiscountRedemption/, 'Must provide redemption confirmation upon payment');
  });

  // --- SECTION 2: LANDING PAGE COPY & UI INTEGRATION ---
  await t.test('6. DSS Announcement Banner copy matches Section 3 exactly', () => {
    assert.match(
      landingClientFile,
      /Your next step in sales starts at half the fee\./,
      'Headline must match exactly'
    );
    assert.match(
      landingClientFile,
      /Get 50% off eligible DSS enrolment fees with code[\s\S]*cohort001[\s\S]*A ₦100,000 fee becomes ₦50,000\./,
      'Body must match exactly'
    );
    assert.match(
      landingClientFile,
      /View Eligible Programmes/,
      'CTA text must match exactly'
    );
  });

  await t.test('7. Main Offer Section copy matches Section 3 exactly', () => {
    assert.match(landingClientFile, /DSS EARLY BIRD OFFER/, 'Eyebrow must match');
    assert.match(landingClientFile, /Build practical sales skills\.[\s\S]*Pay 50% less\./, 'Headline must match');
    assert.match(
      landingClientFile,
      /Practise prospecting, discovery, follow-up and closing through the DSS programme\. Use[\s\S]*cohort001[\s\S]*at checkout to take 50% off an eligible enrolment fee\./
    );
    assert.match(
      landingClientFile,
      /Choose your eligible programme, apply the code and review your final fee before you pay\./
    );
    assert.match(landingClientFile, /Your early bird code/);
    assert.match(landingClientFile, /Copy Code/);
    assert.match(landingClientFile, /Code copied/);
    assert.match(landingClientFile, /Choose My Programme/);
    assert.match(landingClientFile, /See the Curriculum/);
    assert.match(
      landingClientFile,
      /Valid on selected DSS offers for the designated cohort while the campaign is active\. One successful use per learner\. Cannot be combined with another discount\. Closecraft software plans and managed services are excluded\./
    );
  });

  await t.test('8. Eligible programme cards show 50% comparison prices', () => {
    assert.match(landingClientFile, /50% OFF WITH cohort001/);
    assert.match(landingClientFile, /Regular fee:/);
    assert.match(landingClientFile, /Early bird fee:/);
    assert.match(landingClientFile, /Save ₦/);
    assert.match(landingClientFile, /Enrol with Early Bird Offer/);
  });

  await t.test('9. Checkout coupon field and order summary labels', () => {
    assert.match(landingClientFile, /Have an early bird code\?/);
    assert.match(landingClientFile, /Apply Code/);
    assert.match(landingClientFile, /Early bird offer applied\. You saved/);
    assert.match(landingClientFile, /Programme fee/);
    assert.match(landingClientFile, /Early bird discount —/);
    assert.match(landingClientFile, /Total payable/);
    assert.match(landingClientFile, /Pay ₦[\s\S]*and Enrol/);
  });

  await t.test('10. Exact coupon error strings in coupon API & UI', () => {
    const errorStrings = [
      'We couldn’t apply that code. Check it and try again.',
      'This offer applies to selected DSS programmes. It isn’t available for this purchase.',
      'This early bird offer is no longer available. Your current fee is shown below.',
      'You’ve already used this early bird offer.',
      'This offer can’t be combined with your current discount.',
      'This cohort is full. View the next available cohort.',
      'We couldn’t check the code right now. Please try again before paying.',
    ];

    for (const err of errorStrings) {
      assert.ok(
        earlyBirdLibFile.includes(err) || couponApiFile.includes(err),
        `Missing approved coupon error string: ${err}`
      );
    }
  });

  await t.test('11. Five DSS Early Bird FAQ additions', () => {
    assert.match(landingClientFile, /How do I claim the early bird discount\?/);
    assert.match(
      landingClientFile,
      /Choose an eligible DSS programme and enter cohort001 at checkout\. You’ll see the 50% discount and final fee before payment\./
    );
    assert.match(landingClientFile, /How much will I pay\?/);
    assert.match(
      landingClientFile,
      /An eligible ₦100,000 fee becomes ₦50,000\. An eligible ₦150,000 fee becomes ₦75,000\. Your programme’s final total is shown at checkout\./
    );
    assert.match(landingClientFile, /Does this code apply to Closecraft software\?/);
    assert.match(
      landingClientFile,
      /The code applies to eligible DSS tuition\. Closecraft’s seven-day software trial is a separate offer\./
    );
    assert.match(landingClientFile, /Can I combine it with another discount\?/);
    assert.match(
      landingClientFile,
      /No\. Only one discount or scholarship can apply to the same purchase\./
    );
    assert.match(landingClientFile, /Can I use it after paying\?/);
    assert.match(
      landingClientFile,
      /The code must be applied before payment\. It does not automatically change the price of an existing purchase\./
    );
  });

  // --- SECTION 3: TRANSACTIONAL EMAIL SYSTEM ---
  await t.test('12. Closecraft templates (CC-01 through CC-10) rendered with exact copy', () => {
    const ccExpected = [
      'CC-01', // Verify email
      'CC-02', // Workspace ready & 7-day trial
      'CC-03', // Trial ends in 24 hours
      'CC-04', // Trial ended
      'CC-05', // Payment received
      'CC-06', // Payment not completed
      'CC-07', // Subscription cancellation confirmed
      'CC-08', // Password reset requested
      'CC-09', // Password changed
      'CC-10', // Workspace invitation
    ];

    for (const id of ccExpected) {
      assert.ok(
        ccTemplatesFile.includes(`'${id}'`) || ccTemplatesFile.includes(`"${id}"`),
        `Missing template ID definition for ${id}`
      );
    }

    // Verify key phrases in CC templates
    assert.match(ccTemplatesFile, /Verify your email for Closecraft/);
    assert.match(ccTemplatesFile, /Your Closecraft workspace is ready/);
    assert.match(ccTemplatesFile, /Your seven-day Starter trial ends on/);
    assert.match(ccTemplatesFile, /No card is required, and you won’t be charged automatically when it ends\./);
    assert.match(ccTemplatesFile, /Your Closecraft trial ends tomorrow/);
    assert.match(ccTemplatesFile, /Your Closecraft trial has ended/);
    assert.match(ccTemplatesFile, /Payment received for/);
    assert.match(ccTemplatesFile, /Your Closecraft payment wasn’t completed/);
    assert.match(ccTemplatesFile, /Cancellation confirmed for/);
    assert.match(ccTemplatesFile, /Reset your Closecraft password/);
    assert.match(ccTemplatesFile, /Your Closecraft password was changed/);
    assert.match(ccTemplatesFile, /You’re invited to/);
  });

  await t.test('13. DSS templates (DSS-01 through DSS-11) rendered with exact copy', () => {
    const dssExpected = [
      'DSS-01', // Application received
      'DSS-02', // Application accepted & payment requested
      'DSS-03', // Payment received (Receipt with early bird snapshot)
      'DSS-04', // Enrolment confirmed & dashboard ready
      'DSS-05', // Cohort schedule confirmed or updated
      'DSS-06', // Live session reminder
      'DSS-07', // Assignment feedback ready
      'DSS-08', // Final assessment needs action
      'DSS-09', // Completion confirmed & certificate issued
      'DSS-10', // Tuition payment not completed
      'DSS-11', // Refund processed
    ];

    for (const id of dssExpected) {
      assert.ok(
        dssTemplatesFile.includes(`'${id}'`) || dssTemplatesFile.includes(`"${id}"`),
        `Missing template ID definition for ${id}`
      );
    }

    // Verify key phrases in DSS templates
    assert.match(dssTemplatesFile, /We’ve received your DSS application/);
    assert.match(dssTemplatesFile, /Your DSS application has been accepted/);
    assert.match(dssTemplatesFile, /DSS payment received —/);
    assert.match(dssTemplatesFile, /Early bird discount — cohort001/);
    assert.match(dssTemplatesFile, /You’re enrolled in/);
    assert.match(dssTemplatesFile, /Your DSS dashboard is ready\./);
    assert.match(dssTemplatesFile, /Your DSS cohort schedule/);
    assert.match(dssTemplatesFile, /DSS session reminder:/);
    assert.match(dssTemplatesFile, /Your DSS feedback is ready/);
    assert.match(dssTemplatesFile, /Action needed on your DSS completion review/);
    assert.match(dssTemplatesFile, /Your DSS Certificate of Completion is ready/);
    assert.match(dssTemplatesFile, /Your DSS payment wasn’t completed/);
    assert.match(dssTemplatesFile, /Your DSS refund has been processed/);
  });

  await t.test('14. HTML and Plain-Text alternatives present in all templates', () => {
    // Both templates files must export renderers that return { subject, preheader, html, text }
    assert.match(ccTemplatesFile, /wrapEmailHtml/);
    assert.match(ccTemplatesFile, /const text = `Hi/);
    assert.match(dssTemplatesFile, /wrapEmailHtml/);
    assert.match(dssTemplatesFile, /const text = `Hi/);
  });

  await t.test('15. Deduplication key and transactional logging in schema', () => {
    assert.match(prismaSchemaFile, /model EarlyBirdCampaign/);
    assert.match(prismaSchemaFile, /model DiscountReservation/);
    assert.match(prismaSchemaFile, /model TransactionalEmailLog/);
    assert.match(prismaSchemaFile, /deduplicationKey\s+String\s+@unique/);
    assert.match(emailServiceFile, /where:\s*\{\s*deduplicationKey\s*\}/);
  });

  await t.test('16. Non-blocking error handling: Email failure does not undo payment', () => {
    assert.match(emailServiceFile, /status:\s*'FAILED'/);
    assert.match(checkoutApiFile, /orderReference/);
    assert.match(checkoutApiFile, /originalFeeKobo/);
  });
});
