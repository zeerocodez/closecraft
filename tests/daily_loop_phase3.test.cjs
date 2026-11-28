/**
 * Daily loop (Phase 3) — source assertions.
 *
 * Pins:
 *  - true read-state: opening a conversation marks its inbound (PROSPECT)
 *    messages read via a tenant-checked endpoint; the inbox list shows
 *    unread pills; the sidebar Inbox badge counts unread messages;
 *  - one-tap WhatsApp follow-up on the Follow-ups worklist: an in-app send
 *    through the existing /api/messages dispatch with the same truthful
 *    outcome wording as the Inbox composer, sharing one draft builder with
 *    the WhatsApp hand-off, and never auto-completing the follow-up.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

const READ_ROUTE = read('src/app/api/messages/read/route.ts');
const NAV_COUNTS = read('src/app/api/nav-counts/route.ts');
const SIDEBAR = read('src/components/layout/Sidebar.tsx');
const INBOX = read('src/app/(saas)/inbox/InboxClient.tsx');
const TODAY = read('src/components/today/TodayViewClient.tsx');

test('mark-read endpoint is tenant-checked and only touches inbound unread messages', () => {
  assert.ok(READ_ROUTE.includes('await auth()'), 'endpoint requires a session');
  assert.ok(
    READ_ROUTE.includes('conversation.organizationId !== session.organizationId'),
    'conversation must belong to the session organisation',
  );
  assert.ok(READ_ROUTE.includes('db.message.updateMany'), 'endpoint bulk-marks messages');
  assert.ok(READ_ROUTE.includes("senderType: 'PROSPECT'"), 'only inbound messages are marked');
  assert.ok(READ_ROUTE.includes('readAt: null'), 'only unread messages are marked');
  assert.ok(READ_ROUTE.includes('data: { readAt: new Date() }'), 'marking sets readAt');
});

test('nav-counts returns a true unread count, scoped to the session organisation', () => {
  assert.ok(NAV_COUNTS.includes('unreadMessages'), 'route computes unreadMessages');
  assert.ok(NAV_COUNTS.includes("senderType: 'PROSPECT'"), 'unread = inbound messages');
  assert.ok(NAV_COUNTS.includes('readAt: null'), 'unread = not yet opened');
  assert.ok(NAV_COUNTS.includes('conversation: { organizationId }'), 'unread count is org-scoped');
  assert.ok(SIDEBAR.includes("countKey: 'unreadMessages'"), 'Inbox badge uses the unread count');
});

test('inbox counts unread per lead, shows a pill, and marks read on open', () => {
  assert.ok(INBOX.includes('function countUnreadMessages'), 'inbox has an unread counter');
  assert.ok(
    INBOX.includes("msg.senderType === 'PROSPECT' && !msg.readAt"),
    'unread = PROSPECT messages without readAt',
  );
  assert.ok(INBOX.includes('unreadCount > 0'), 'list rows render an unread pill when unread exist');
  assert.ok(INBOX.includes("fetch('/api/messages/read'"), 'opening a conversation persists read-state');
  assert.ok(
    INBOX.includes('body: JSON.stringify({ conversationId: activeConversationId })'),
    'mark-read targets the opened conversation',
  );
});

test('today worklist rows offer an in-app WhatsApp follow-up send', () => {
  assert.ok(TODAY.includes('onQuickSend'), 'lead sections accept a quick-send handler');
  assert.ok(TODAY.includes('Send follow-up'), 'rows render the quick-send button');
  assert.ok(TODAY.includes('onQuickSend={openQuickSend}'), 'all sections wire the handler');
  assert.ok(TODAY.includes('const handleQuickSend'), 'quick-send handler exists');
  assert.ok(TODAY.includes("fetch('/api/messages'"), 'quick-send uses the real dispatch route');
  assert.ok(TODAY.includes('leadId: quickSendLead.id'), 'quick-send addresses the lead, not a typed number');
  assert.ok(TODAY.includes("senderType: 'HUMAN'"), 'quick-send is a human message');
});

test('quick-send shares one draft with the WhatsApp hand-off and reports outcomes truthfully', () => {
  assert.ok(TODAY.includes('const buildFollowUpDraft'), 'a shared draft builder exists');
  assert.ok(TODAY.includes('const opener = buildFollowUpDraft(contactName);'), 'the hand-off uses the shared draft');
  assert.ok(TODAY.includes('setQuickSendText(buildFollowUpDraft(lead.name))'), 'quick-send pre-fills the shared draft');
  // Same truthful outcome wording as the Inbox composer.
  assert.ok(TODAY.includes('Live WhatsApp dispatch is off — message logged only, not sent'), 'dry-run is reported honestly');
  assert.ok(TODAY.includes("data.dispatch?.deliveryStatus === 'SENT'"), 'sent is only claimed on SENT');
  // Sending must not silently complete the scheduled follow-up.
  assert.ok(
    TODAY.includes('Sending a message does not complete the scheduled follow-up'),
    'the UI states that sending does not complete the follow-up',
  );
});
