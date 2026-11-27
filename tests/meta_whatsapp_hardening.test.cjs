// Meta/WhatsApp hardening phase: tenant-owned WhatsApp connection, honest
// webhook failure reporting, and Meta token lifecycle coverage.
const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

describe('WhatsApp webhook verification resilience', () => {
  it('falls back to the shared Meta app verify token', () => {
    const src = read('src/app/api/webhooks/whatsapp/route.ts');
    assert.ok(src.includes('WHATSAPP_VERIFY_TOKEN || process.env.FACEBOOK_VERIFY_TOKEN'));
  });
});

describe('Tenant WhatsApp connection (own number)', () => {
  it('connect route validates with Meta and stores the token encrypted', () => {
    const src = read('src/app/api/integrations/whatsapp/connect/route.ts');
    assert.ok(src.includes('fetchWhatsAppPhoneNumberInfo'), 'must live-validate credentials before storing');
    assert.ok(src.includes('whatsappAccessToken: encryptToken(accessToken)'), 'token must be stored encrypted');
    assert.ok(!src.includes('whatsappAccessToken: accessToken'), 'token must never be stored plaintext');
  });

  it('connect route refuses a phone number already bound to another workspace', () => {
    const src = read('src/app/api/integrations/whatsapp/connect/route.ts');
    assert.ok(src.includes('already connected to another workspace'));
    assert.ok(src.includes('409'));
  });

  it('integration management is role-gated server-side', () => {
    const src = read('src/lib/integrations/whatsapp/config.ts');
    assert.ok(src.includes("['OWNER', 'ADMIN', 'MANAGER']"));
    assert.ok(src.includes('SUPER_ADMIN'));
  });

  it('status route never returns the stored token', () => {
    const src = read('src/app/api/integrations/whatsapp/status/route.ts');
    assert.ok(!src.includes('accessToken: org.whatsappAccessToken'));
    assert.ok(src.includes('summarizeWhatsAppConnection'));
  });

  it('disconnect wipes the stored credentials', () => {
    const src = read('src/app/api/integrations/whatsapp/disconnect/route.ts');
    assert.ok(src.includes('whatsappAccessToken: null'));
    assert.ok(src.includes('whatsappPhoneNumberId: null'));
  });

  it('outbound dispatch decrypts organization tokens before use', () => {
    const src = read('src/lib/whatsapp.ts');
    assert.ok(src.includes('decryptCredential'));
    assert.ok(src.includes('resolveOrgToken(org?.whatsappAccessToken)'));
  });
});

describe('Facebook webhook honesty', () => {
  it('decrypts the legacy organization token fallback', () => {
    const src = read('src/app/api/webhooks/facebook/route.ts');
    assert.ok(src.includes('decryptCredential((org as any).metaAccessToken)'));
  });

  it('logs FAILED (not SUCCESS) when lead details cannot be fetched', () => {
    const src = read('src/app/api/webhooks/facebook/route.ts');
    assert.ok(src.includes("status: graphDetails ? 'SUCCESS' : 'FAILED'"));
    assert.ok(src.includes('placeholder contact data'), 'failure must be visible to the tenant');
  });
});

describe('Meta token lifecycle', () => {
  it('client can re-exchange a long-lived token', () => {
    const src = read('src/lib/integrations/meta/client.ts');
    assert.ok(src.includes('export async function refreshLongLivedUserToken'));
    assert.ok(src.includes("grant_type: 'fb_exchange_token'"));
  });

  it('lifecycle runner refreshes inside a window and marks failures ERROR', () => {
    const src = read('src/lib/integrations/meta/tokenLifecycle.ts');
    assert.ok(src.includes('REFRESH_WINDOW_DAYS = 14'));
    assert.ok(src.includes("status: 'ERROR'"));
    assert.ok(src.includes('encryptToken(refreshed.accessToken)'));
  });

  it('daily cron is registered with Inngest', () => {
    const cron = read('src/lib/inngest/cron.ts');
    assert.ok(cron.includes('metaTokenLifecycle'));
    assert.ok(cron.includes("cron: '30 2 * * *'"));
    const route = read('src/app/api/inngest/route.ts');
    assert.ok(route.includes('metaTokenLifecycle'));
  });
});

describe('WABA auto-subscription on connect (subscribed_apps)', () => {
  it('subscription helpers use the subscribed_apps edge with a bearer token and verify via the app listing', () => {
    const src = read('src/lib/integrations/whatsapp/config.ts');
    assert.ok(src.includes('export async function subscribeWabaToApp'), 'connect flow needs a subscribe helper');
    assert.ok(src.includes('/subscribed_apps'), 'must hit the subscribed_apps edge');
    assert.ok(src.includes('Authorization: `Bearer ${accessToken}`'), 'must authenticate with the tenant token');
    assert.ok(src.includes("data?.success !== true"), 'only a success:true reply counts as subscribed');
    assert.ok(src.includes('whatsapp_business_management'), 'error must name the permission the token needs');
    assert.ok(src.includes('export async function isWabaSubscribedToApp'), 'connect flow needs a verify helper');
    assert.ok(src.includes('whatsapp_business_api_data'), 'GET listing nests the app under whatsapp_business_api_data');
    assert.ok(src.includes("if (!configuredAppId) return null"), 'an unverifiable listing is null, never a false negative');
  });

  it('connect route subscribes the WABA when a Business Account ID is given and blocks on a definitive refusal', () => {
    const src = read('src/app/api/integrations/whatsapp/connect/route.ts');
    assert.ok(src.includes('subscribeWabaToApp(businessAccountId, accessToken)'), 'must subscribe during connect');
    assert.ok(src.includes('isWabaSubscribedToApp(businessAccountId, accessToken)'), 'must verify the app is listed');
    assert.ok(src.includes('could not subscribe your WhatsApp Business Account'), 'a Meta refusal must block with a plain error');
    assert.ok(src.includes('subscription'), 'the response must report the subscription outcome');
  });

  it('connect route warns instead of failing when no Business Account ID is supplied', () => {
    const src = read('src/app/api/integrations/whatsapp/connect/route.ts');
    assert.ok(src.includes('Connected without a WhatsApp Business Account ID'), 'the no-WABA path must warn in plain language');
    assert.ok(src.includes('attempted: false'), 'the response must say no subscription was attempted');
  });

  it('status route reports the live subscription state and the card shows it', () => {
    const status = read('src/app/api/integrations/whatsapp/status/route.ts');
    assert.ok(status.includes('isWabaSubscribedToApp'), 'live status must check the subscription');
    assert.ok(status.includes('live.subscribed'), 'live payload must carry the subscription state');
    const card = read('src/app/(saas)/settings/WhatsAppConfigCard.tsx');
    assert.ok(card.includes('WABA subscribed to receive inbound messages'), 'a subscribed account must be confirmed in the UI');
    assert.ok(card.includes('is not subscribed to CloseCraft'), 'an unsubscribed account must be flagged in the UI');
    assert.ok(card.includes('needed for inbound'), 'the WABA field must say why it matters');
  });
});

describe('Settings health monitor honesty', () => {
  it('derives channel health from real connection state', () => {
    const src = read('src/app/(saas)/settings/page.tsx');
    assert.ok(src.includes('whatsappConnected'));
    assert.ok(src.includes('metaConnected'));
    assert.ok(src.includes('SETUP INCOMPLETE'));
    assert.ok(src.includes('WhatsAppConfigCard'));
  });
});

describe('Webhook self-tests, expiry UI & expanded Inbox', () => {
  it('exposes Meta and WhatsApp self-test endpoints guarded by requireIntegrationManager', () => {
    const metaTest = read('src/app/api/integrations/meta/test/route.ts');
    const waTest = read('src/app/api/integrations/whatsapp/test/route.ts');
    assert.ok(metaTest.includes('requireIntegrationManager'));
    assert.ok(metaTest.includes('checkPageLeadgenSubscription'));
    assert.ok(waTest.includes('requireIntegrationManager'));
    assert.ok(waTest.includes('hello_world'));
  });

  it('surfaces token expiry and webhook self-test controls in Settings UI', () => {
    const statusRoute = read('src/app/api/integrations/meta/status/route.ts');
    const metaDash = read('src/components/integrations/MetaLeadAdsDashboard.tsx');
    const waCard = read('src/app/(saas)/settings/WhatsAppConfigCard.tsx');
    assert.ok(statusRoute.includes('isExpired'));
    assert.ok(statusRoute.includes('tokenDaysRemaining'));
    assert.ok(metaDash.includes('Verify Webhook'));
    assert.ok(metaDash.includes('Reconnect Meta'));
    assert.ok(waCard.includes('/api/integrations/whatsapp/test'));
    assert.ok(waCard.includes('Verify Webhook'));
  });

  it('WhatsApp webhook supports interactive/media payloads, phone normalization & Inbox auto-refreshes cleanly', () => {
    const waWebhook = read('src/app/api/webhooks/whatsapp/route.ts');
    const inboxPage = read('src/app/(saas)/inbox/page.tsx');
    const inboxClient = read('src/app/(saas)/inbox/InboxClient.tsx');
    assert.ok(waWebhook.includes('extractInboundWhatsAppContent'));
    assert.ok(waWebhook.includes('normalizeWhatsAppNumber'));
    assert.ok(waWebhook.includes('updatedAt: new Date()'));
    assert.ok(!inboxPage.includes('max-h-[calc(100dvh-5rem)]'));
    assert.ok(inboxClient.includes('setLeads(initialLeads)'));
    assert.ok(inboxClient.includes('showInspector'));
  });
});
