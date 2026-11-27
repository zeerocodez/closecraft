// Inbox WhatsApp dispatch: replies typed in the Unified Inbox must go out
// through the real Cloud API engine (tenant credentials, 24h window,
// opt-out, live-dispatch gate) instead of only being logged, and the old
// wa.me shortcut must not impersonate API dispatch.
const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

describe('Inbox WhatsApp reply dispatch', () => {
  it('messages route dispatches WhatsApp replies through the real engine', () => {
    const src = read('src/app/api/messages/route.ts');
    assert.ok(src.includes("import { sendWhatsAppMessage } from '@/lib/whatsapp'"));
    assert.ok(src.includes('await sendWhatsAppMessage({'));
    assert.ok(src.includes("senderType: 'HUMAN'"), 'human replies must be attributed to the human, not the AI');
  });

  it('the old mock send block is gone', () => {
    const src = read('src/app/api/messages/route.ts');
    assert.ok(!src.includes('[WhatsApp API Mock]'), 'mock log line must not survive');
    assert.ok(!src.includes('In production:'), 'commented-out production fetch must not survive');
  });

  it('dispatch is scoped to human replies on WhatsApp conversations with a phone', () => {
    const src = read('src/app/api/messages/route.ts');
    assert.ok(src.includes("conversation.channel === 'WHATSAPP' && safeSenderType === 'HUMAN' && conversation.lead.phone"));
  });

  it('tenant isolation is still verified before dispatch', () => {
    const src = read('src/app/api/messages/route.ts');
    assert.ok(src.includes('conversation.organizationId !== session.organizationId'));
  });

  it('route returns the truthful dispatch outcome to the client', () => {
    const src = read('src/app/api/messages/route.ts');
    assert.ok(src.includes('deliveryStatus: dispatch.deliveryStatus'));
    assert.ok(src.includes('dryRun: Boolean(dispatch.dryRun)'));
  });

  it('a dispatch blocked before persistence still leaves an auditable failed row', () => {
    const src = read('src/app/api/messages/route.ts');
    assert.ok(src.includes('WhatsApp dispatch was blocked before sending.'));
    assert.ok(src.includes("status: 'FAILED'"));
  });

  it('dispatch engine attributes messages to the caller, defaulting to AI', () => {
    const src = read('src/lib/whatsapp.ts');
    assert.ok(src.includes("senderType?: 'AI' | 'HUMAN'"));
    assert.ok(src.includes("senderType = 'AI'"));
    assert.ok(!src.includes("senderType: 'AI',"), 'no persistence site may hardcode the AI sender anymore');
  });

  it('inbox no longer labels the wa.me shortcut as API dispatch', () => {
    const src = read('src/app/(saas)/inbox/InboxClient.tsx');
    assert.ok(!src.includes('Dispatch via WhatsApp'));
    assert.ok(src.includes('Open in WhatsApp'));
  });

  it('inbox send toast reports the real outcome instead of always claiming dispatch', () => {
    const src = read('src/app/(saas)/inbox/InboxClient.tsx');
    assert.ok(!src.includes("showToast('Message logged and dispatched')"));
    assert.ok(src.includes("showToast('Message sent via WhatsApp')"));
    assert.ok(src.includes('message logged only, not sent'));
  });
});
