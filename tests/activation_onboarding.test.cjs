/**
 * Activation onboarding (Phase 2) — source assertions.
 *
 * Pins the activation-first setup experience:
 *  - the Overview checklist is the activation path (Connect WhatsApp →
 *    Connect Meta Lead Ads → first enquiry → reply), in customer language;
 *  - done-states come from the same connection definitions Settings uses;
 *  - the card is actually mounted on the dashboard (it was orphaned before),
 *    gated to owners/admins and hidden once activation is complete;
 *  - /onboarding puts channel connection before the qualification questions
 *    without removing the qualification wizard (the services funnel);
 *  - Settings exposes a #whatsapp anchor next to the existing #meta-ads one.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

const CARD = read('src/components/dashboard/OnboardingChecklistCard.tsx');
const PANEL = read('src/components/onboarding/ActivationFirstSteps.tsx');
const DASHBOARD = read('src/app/(saas)/dashboard/page.tsx');
const ONBOARDING = read('src/app/(saas)/onboarding/page.tsx');
const SETTINGS = read('src/app/(saas)/settings/page.tsx');

test('checklist steps are the activation path, in customer language', () => {
  for (const title of ['Connect WhatsApp', 'Connect Meta Lead Ads', 'See your first enquiry', 'Reply & follow up']) {
    assert.ok(CARD.includes(title), `missing step: ${title}`);
  }
  // The old product-jargon steps are gone.
  for (const jargon of [
    'Workspace Identity & WhatsApp Channel',
    'Lead Qualification Policy',
    'Commercial Lead Pipeline',
    'Unified Revenue Inbox & WhatsApp Outreach',
    'ICP fit thresholds',
  ]) {
    assert.ok(!CARD.includes(jargon), `jargon step still present: ${jargon}`);
  }
});

test('checklist steps deep-link to the real connection cards', () => {
  assert.ok(CARD.includes("href: '/settings#whatsapp'"), 'WhatsApp step must link to the WhatsApp settings card');
  assert.ok(CARD.includes("href: '/settings#meta-ads'"), 'Meta step must link to the Meta settings card');
  assert.ok(SETTINGS.includes('id="whatsapp"'), 'settings must expose the #whatsapp anchor');
  assert.ok(SETTINGS.includes('id="meta-ads"'), 'settings must keep the #meta-ads anchor');
});

test('checklist done-states are driven by real connection props', () => {
  assert.ok(CARD.includes('isDone: whatsappConnected'), 'WhatsApp step must use the connection prop');
  assert.ok(CARD.includes('isDone: metaConnected'), 'Meta step must use the connection prop');
  assert.ok(CARD.includes('isDone: leadCount > 0'), 'first-enquiry step must use the lead count');
  assert.ok(CARD.includes('isDone: hasReplied'), 'reply step must use the reply prop');
  // Channel status pills reflect the same props.
  assert.ok(CARD.includes("channelPill('WhatsApp', whatsappConnected)"));
  assert.ok(CARD.includes("channelPill('Meta Ads', metaConnected)"));
});

test('dashboard mounts the checklist with Settings-identical channel definitions', () => {
  assert.ok(DASHBOARD.includes("from '@/components/dashboard/OnboardingChecklistCard'"), 'dashboard must import the card');
  assert.ok(DASHBOARD.includes('<OnboardingChecklistCard'), 'dashboard must render the card');
  // Same definitions as src/app/(saas)/settings/page.tsx — never diverge.
  assert.ok(
    DASHBOARD.includes('Boolean(activationOrg?.whatsappPhoneNumberId && activationOrg?.whatsappAccessToken)'),
    'WhatsApp definition must mirror Settings',
  );
  assert.ok(DASHBOARD.includes("activationMeta?.status === 'CONNECTED'"), 'Meta definition must mirror Settings');
  // Reply state counts real human replies in this organisation only.
  assert.ok(DASHBOARD.includes("senderType: 'HUMAN'"), 'reply count must use HUMAN messages');
  assert.ok(DASHBOARD.includes('conversation: { organizationId }'), 'reply count must be org-scoped');
});

test('dashboard shows the card only to owners/admins and only until activation completes', () => {
  assert.ok(
    DASHBOARD.includes("activationMember?.role === 'OWNER' || activationMember?.role === 'ADMIN'"),
    'card must be gated to owners/admins',
  );
  assert.ok(
    DASHBOARD.includes('whatsappConnected && metaConnected && activationLeadCount > 0 && activationReplies > 0'),
    'completion must require both channels, a lead, and a reply',
  );
  assert.ok(DASHBOARD.includes('showActivationCard && ('), 'render must be conditional');
});

test('onboarding puts activation before the qualification wizard, which stays intact', () => {
  assert.ok(ONBOARDING.includes("from '@/components/onboarding/ActivationFirstSteps'"), 'page must import the panel');
  const panelAt = ONBOARDING.indexOf('<ActivationFirstSteps');
  const wizardAt = ONBOARDING.indexOf('<OnboardingWizardClient');
  assert.ok(panelAt > -1 && wizardAt > -1 && panelAt < wizardAt, 'panel must render above the wizard');
  assert.ok(ONBOARDING.includes('<OnboardingWizardClient'), 'qualification wizard must remain');
  // Panel states come from the same Settings-identical definitions.
  assert.ok(ONBOARDING.includes('Boolean(org.whatsappPhoneNumberId && org.whatsappAccessToken)'));
  assert.ok(ONBOARDING.includes("metaIntegration?.status === 'CONNECTED'"));
  // Plain-language page metadata.
  assert.ok(ONBOARDING.includes("title: 'Set Up Your Workspace | CloseCraft HQ'"));
  assert.ok(!ONBOARDING.includes('Workspace Onboarding & Qualification'), 'old jargon title must be gone');
});

test('activation panel links both channels and reports honest status', () => {
  assert.ok(PANEL.includes("href: '/settings#whatsapp'"));
  assert.ok(PANEL.includes("href: '/settings#meta-ads'"));
  assert.ok(PANEL.includes('whatsappConnected'), 'panel must render WhatsApp state from props');
  assert.ok(PANEL.includes('metaConnected'), 'panel must render Meta state from props');
  assert.ok(PANEL.includes('Not connected'), 'panel must be able to say a channel is not connected');
});
