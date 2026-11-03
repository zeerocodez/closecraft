const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Closecraft & DSS Newsletter Embed Acceptance Tests', async (t) => {
  const landingWrapperPath = path.join(__dirname, '../src/app/(marketing)/LandingClientWrapper.tsx');
  const dssLandingPath = path.join(__dirname, '../src/app/dss/DSSLandingClient.tsx');
  const newsletterComponentPath = path.join(__dirname, '../src/components/marketing/BrevoNewsletterSection.tsx');
  const emailLibPath = path.join(__dirname, '../src/lib/email.ts');
  const emailServicePath = path.join(__dirname, '../src/lib/email/service.ts');

  const landingContent = fs.readFileSync(landingWrapperPath, 'utf8');
  const dssContent = fs.readFileSync(dssLandingPath, 'utf8');
  const newsletterComponentContent = fs.readFileSync(newsletterComponentPath, 'utf8');
  const emailLibContent = fs.readFileSync(emailLibPath, 'utf8');
  const emailServiceContent = fs.readFileSync(emailServicePath, 'utf8');

  const BREVO_IFRAME_SRC =
    'https://1988fd78.sibforms.com/v2/serve/MUIFAI_ABof2Df7O-t7_mG1N5xyAlcAiXZARwZ4S-gMtij-Xa04HTYZFqioHWPTsyDlsC_-BUl3qu1hrUZNUiTfNxRe-mVVWXte4qBvWslHArw-uEnlkgPwtGBo-f4VJuK3ntWjnnFCrKvjgqSM-PAXKS_y0JuLRD_yRK9BJleTZ-QRiQuAwL-87k--WZCcdSVe0m6SOTsDV6iI4Cg==';

  await t.test('1. Closecraft Main Marketing Landing Page Integration', () => {
    // Exact headline
    assert.ok(
      landingContent.includes('Make your next sales conversation count.'),
      'Main landing page must include exact headline: "Make your next sales conversation count."'
    );

    // Exact description
    assert.ok(
      landingContent.includes(
        'Get a practical sales lesson each week, with follow-up examples you can use in your business.'
      ),
      'Main landing page must include exact description'
    );

    // Preserved hero and core product messaging
    assert.ok(landingContent.includes('Stop losing sales to forgotten follow-up.'));
    assert.ok(landingContent.includes('Start My 7-Day Free Trial'));
    assert.ok(landingContent.includes('Request a Revenue Audit'));

    // Placement: Below final CTA, before footer
    const finalCtaIndex = landingContent.indexOf('Give your next opportunity a clear next step.');
    const newsletterIndex = landingContent.indexOf('Make your next sales conversation count.');
    const footerIndex = landingContent.indexOf('<footer');

    assert.ok(finalCtaIndex !== -1, 'Final CTA must exist');
    assert.ok(newsletterIndex !== -1, 'Newsletter must exist');
    assert.ok(footerIndex !== -1, 'Footer must exist');
    assert.ok(
      newsletterIndex > finalCtaIndex,
      'Newsletter must be placed below product and services sections'
    );
    assert.ok(newsletterIndex < footerIndex, 'Newsletter must be placed before footer');

    // Avoid duplicate forms on the same page
    const occurrences = (landingContent.match(/Make your next sales conversation count\./g) || []).length;
    assert.strictEqual(occurrences, 1, 'Main page must contain exactly one newsletter section');
  });

  await t.test('2. Digital Sales School (DSS) Landing Page Integration', () => {
    // Exact headline
    assert.ok(
      dssContent.includes('Start building your remote sales skills.'),
      'DSS landing page must include exact headline: "Start building your remote sales skills."'
    );

    // Exact description
    assert.ok(
      dssContent.includes(
        'Get practical appointment-setting lessons and updates about upcoming DSS training.'
      ),
      'DSS landing page must include exact description'
    );

    // Placement: Before DSS footer
    const dssCtaIndex = dssContent.indexOf('Give yourself practical work to show.');
    const dssNewsletterIndex = dssContent.indexOf('Start building your remote sales skills.');
    const dssFooterIndex = dssContent.indexOf('<footer');

    assert.ok(dssCtaIndex !== -1, 'DSS CTA must exist');
    assert.ok(dssNewsletterIndex !== -1, 'DSS Newsletter must exist');
    assert.ok(dssFooterIndex !== -1, 'DSS Footer must exist');
    assert.ok(dssNewsletterIndex > dssCtaIndex, 'DSS Newsletter must be placed below course sections');
    assert.ok(dssNewsletterIndex < dssFooterIndex, 'DSS Newsletter must be placed before DSS footer');

    // Avoid duplicate forms on the same page
    const occurrences = (dssContent.match(/Start building your remote sales skills\./g) || []).length;
    assert.strictEqual(occurrences, 1, 'DSS page must contain exactly one newsletter section');
  });

  await t.test('3. Brevo Embed Code & Responsive Iframe Standards', () => {
    // Check component contains exact iframe URL
    assert.ok(
      newsletterComponentContent.includes(BREVO_IFRAME_SRC),
      'Brevo iframe source must match exact provider embed code'
    );

    // Check accessible title
    assert.ok(
      newsletterComponentContent.includes('title={accessibleTitle}'),
      'Accessible iframe title must be configured'
    );

    // Check mobile responsive styling
    assert.ok(
      newsletterComponentContent.includes('maxWidth: \'100%\''),
      'Iframe must have maxWidth 100% for mobile viewports'
    );
    assert.ok(
      newsletterComponentContent.includes('max-w-[540px]'),
      'Container must constrain width to provider 540px standard'
    );

    // Preserves provider double-opt-in behaviour and does not claim "subscribed" prematurely
    assert.ok(
      newsletterComponentContent.includes('double opt-in confirmation email'),
      'Must explain provider double opt-in confirmation'
    );
    assert.ok(
      newsletterComponentContent.includes('independently from software account creation'),
      'Must state independence from software accounts'
    );

    // Does not expose API secrets
    assert.ok(!newsletterComponentContent.includes('apiKey'), 'Must not require or expose any client API key');
    assert.ok(!newsletterComponentContent.includes('secret'), 'Must not require or expose any secret');
  });

  await t.test('4. Gmail OTP & SMTP Sender Alignment', () => {
    // Ensures Gmail SMTP sets authenticated Gmail sender and reply-to
    assert.ok(emailLibContent.includes('smtpConfig?.isGmail && smtpConfig.fromEmail'));
    assert.ok(emailLibContent.includes('replyTo'));
    assert.ok(emailServiceContent.includes('replyTo'));
  });
});

