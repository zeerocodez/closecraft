// Phase 1 navigation & naming: the sidebar is organised around the daily
// job of a business that runs ads (enquiries in → follow up → close), uses
// plain customer language instead of internal product names, keeps every
// href unchanged, and carries live counts for waiting work.
const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

describe('Sidebar plain-language navigation', () => {
  it('uses plain labels for the core loop and the rest of the app', () => {
    const src = read('src/components/layout/Sidebar.tsx');
    for (const label of [
      "label: 'Overview'",
      "label: 'Inbox'",
      "label: 'Enquiries'",
      "label: 'Follow-ups'",
      "label: 'Sales Pipeline'",
      "label: 'Customer Promises'",
      "label: 'Team'",
      "label: 'Settings'",
      "label: 'Billing'",
      "label: 'Back to CloseCraft'",
    ]) {
      assert.ok(src.includes(label), `sidebar is missing ${label}`);
    }
    assert.ok(src.includes("title: 'ENQUIRIES'"), 'the daily loop gets its own ENQUIRIES section');
    assert.ok(src.includes("title: 'INSIGHTS'"), 'INTELLIGENCE is renamed to INSIGHTS');
  });

  it('drops the internal jargon labels and marketing badges', () => {
    const src = read('src/components/layout/Sidebar.tsx');
    for (const jargon of [
      'Command Centre',
      'Promise Ledger',
      'Unified Inbox',
      'Enquiries & Leads',
      'Deal Pipeline',
      'Team Roster',
      'Billing & Invoices',
      'Back to Revenue OS',
      "label: 'Workspace'",
      "badge: 'RECOVER'",
      "badge: 'DELIVER'",
    ]) {
      assert.ok(!src.includes(jargon), `sidebar still contains ${jargon}`);
    }
  });

  it('keeps every destination href unchanged so no link breaks', () => {
    const src = read('src/components/layout/Sidebar.tsx');
    for (const href of [
      '/dashboard',
      '/inbox',
      '/leads',
      '/today',
      '/pipeline',
      '/recovery',
      '/dashboard/analytics',
      '/rep',
      '/practice',
      '/commitments',
      '/services',
      '/team',
      '/dss/dashboard',
      '/settings',
      '/settings#meta-ads',
      '/billing',
    ]) {
      assert.ok(src.includes(`href: '${href}'`), `sidebar lost the ${href} destination`);
    }
  });

  it('orders the daily loop first: Inbox, Enquiries, Follow-ups, Sales Pipeline', () => {
    const src = read('src/components/layout/Sidebar.tsx');
    const inbox = src.indexOf("label: 'Inbox'");
    const enquiries = src.indexOf("label: 'Enquiries'");
    const followUps = src.indexOf("label: 'Follow-ups'");
    const pipeline = src.indexOf("label: 'Sales Pipeline'");
    assert.ok(inbox !== -1 && inbox < enquiries && enquiries < followUps && followUps < pipeline);
  });
});

describe('Sidebar live counts', () => {
  it('sidebar fetches counts and binds them to Inbox and Follow-ups', () => {
    const src = read('src/components/layout/Sidebar.tsx');
    assert.ok(src.includes("fetch('/api/nav-counts')"), 'sidebar polls the nav-counts route');
    // Phase 3: the Inbox badge counts unread messages now that read-state
    // exists (Phase 1 badged new enquiries because it did not).
    assert.ok(src.includes("countKey: 'unreadMessages'"), 'Inbox carries the unread-messages count');
    assert.ok(src.includes("countKey: 'followUpsDue'"), 'Follow-ups carries the due count');
  });

  it('nav-counts route is session-scoped and mirrors the Today page definitions', () => {
    const src = read('src/app/api/nav-counts/route.ts');
    assert.ok(src.includes('export async function GET()'), 'route takes no request input');
    assert.ok(src.includes('await auth()'), 'route requires a session');
    assert.ok(src.includes('(session as any).organizationId'), 'organisation comes from the session, never the request');
    assert.ok(src.includes("status: 'NEW'"), 'new enquiries = unresponded leads, as on the Today page');
    assert.ok(src.includes('nextActionDueAt'), 'follow-ups due counts leads by nextActionDueAt');
    assert.ok(src.includes("notIn: ['WON', 'LOST']"), 'closed leads are excluded from the due count');
    assert.ok(src.includes('NextResponse.json({ newEnquiries, followUpsDue, unreadMessages })'), 'route returns all three counts');
  });
});

describe('Rename consistency across the SaaS', () => {
  it('dashboard and commitments pages use the new names', () => {
    const dash = read('src/app/(saas)/dashboard/page.tsx');
    assert.ok(dash.includes("title: 'Overview | CloseCraft HQ'"));
    assert.ok(!dash.includes('Promise Ledger'), 'dashboard no longer says Promise Ledger');
    assert.ok(dash.includes('Customer Promises'));
    const commitments = read('src/app/(saas)/commitments/page.tsx');
    assert.ok(commitments.includes("title: 'Customer Promises | CloseCraft HQ'"));
  });
});
