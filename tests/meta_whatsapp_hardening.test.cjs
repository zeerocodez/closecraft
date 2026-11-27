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

describe('Settings health monitor honesty', () => {
  it('derives channel health from real connection state', () => {
    const src = read('src/app/(saas)/settings/page.tsx');
    assert.ok(src.includes('whatsappConnected'));
    assert.ok(src.includes('metaConnected'));
    assert.ok(src.includes('SETUP INCOMPLETE'));
    assert.ok(src.includes('WhatsAppConfigCard'));
  });
});

describe('Webhook self-tests & expiry UI banners', () => {
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
});
