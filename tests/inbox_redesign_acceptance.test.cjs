const { describe, it: test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

describe('CloseCraft HQ Phase 7: Unified Revenue Inbox & Multichannel Communication Acceptance Tests', () => {

  test('1. Inbox Page strictly enforces session authentication and tenant isolation', () => {
    const pagePath = path.join(ROOT, 'src/app/(saas)/inbox/page.tsx');
    assert.ok(fs.existsSync(pagePath), 'Inbox page file must exist');

    const content = fs.readFileSync(pagePath, 'utf8');
    assert.match(content, /await auth\(\)/, 'Requires authenticated session');
    assert.match(content, /redirect\(['"]\/login['"]\)/, 'Redirects unauthenticated visitors');
    assert.match(content, /where:\s*\{\s*organizationId\s*\}/, 'Enforces strict tenant isolation on lead query');
    assert.match(content, /Omnichannel Communications Hub/, 'Rendered header badge');
  });

  test('2. Triage Stream provides channel filtering and real-time prospect search', () => {
    const clientPath = path.join(ROOT, 'src/app/(saas)/inbox/InboxClient.tsx');
    assert.ok(fs.existsSync(clientPath), 'InboxClient component must exist');

    const content = fs.readFileSync(clientPath, 'utf8');

    // Filter modes
    assert.match(content, /activeChannelFilter === 'ALL'/, 'Supports All queue filter');
    assert.match(content, /activeChannelFilter === 'HANDOFF'/, 'Supports Human Handoff filter');
    assert.match(content, /activeChannelFilter === 'HOT'/, 'Supports Hot Leads filter');
    assert.match(content, /activeChannelFilter === 'WHATSAPP'/, 'Supports WhatsApp channel filter');

    // Search query
    assert.match(content, /searchQuery/, 'Maintains state for real-time contact search');
    assert.match(content, /placeholder="Search conversations\.\.\."/, 'Search input rendered');
  });

  test('3. Conversation Stage features AI auto-pilot handoff toggle and quick response templates', () => {
    const clientPath = path.join(ROOT, 'src/app/(saas)/inbox/InboxClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    // AI Handoff Toggle
    assert.match(content, /toggleAiHandoff/, 'Deterministic toggle for pausing/resuming AI auto-pilot');
    assert.match(content, /AI auto-responder paused/, 'Visual warning banner when human takes over');

    // Quick Templates
    assert.match(content, /quickTemplates/, 'Provides quick response template presets');
    assert.match(content, /Book Demo 📅/, 'Preset template for demo booking');
    assert.match(content, /Send Scoped Quote 📄/, 'Preset template for proposal sharing');
    assert.match(content, /Diagnose Objection 🎯/, 'Preset template for objection discovery');
  });

  test('4. Composer supports direct WhatsApp web launch and internal message logging', () => {
    const clientPath = path.join(ROOT, 'src/app/(saas)/inbox/InboxClient.tsx');
    const apiPath = path.join(ROOT, 'src/app/api/messages/route.ts');
    assert.ok(fs.existsSync(apiPath), 'Messages API route must exist');

    const clientContent = fs.readFileSync(clientPath, 'utf8');
    const apiContent = fs.readFileSync(apiPath, 'utf8');

    // WhatsApp Dispatch
    assert.match(clientContent, /formatWhatsAppUrl/, 'Uses official WhatsApp URL formatter');
    assert.match(clientContent, /Open in WhatsApp/, 'Action button to launch WhatsApp web');

    // In-app Logging & Rate Limiting
    assert.match(clientContent, /\/api\/messages/, 'Posts message payload to API endpoint');
    assert.match(apiContent, /rateLimit/, 'Messages API enforces rate limiting');
    assert.match(apiContent, /conversation\.organizationId !== session\.organizationId/, 'API endpoint verifies tenant ownership');
  });

  test('5. Lead Context Inspector displays commercial deal snapshot and Next Best Action', () => {
    const clientPath = path.join(ROOT, 'src/app/(saas)/inbox/InboxClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    // Commercial Snapshot
    assert.match(content, /Opportunity Snapshot/, 'Displays commercial opportunity card');
    assert.match(content, /Est\. Deal Value/, 'Shows estimated deal amount in NGN');
    assert.match(content, /Propensity/, 'Shows AI buying propensity score');
    assert.match(content, /Pipeline Stage:/, 'Shows deal pipeline stage');

    // Next Best Action
    assert.match(content, /Next Best Action/, 'Presents Revenue Engine recommended next best action');
    assert.match(content, /activeNextAction\.recommendedActor/, 'Displays recommended actor model (AI, AUTOMATION, HUMAN, SYSTEM)');
    assert.match(content, /Priority Score:/, 'Shows explainable priority score');
  });

  test('6. Mobile Responsiveness uses 3-tab segmented navigation to prevent column squishing', () => {
    const clientPath = path.join(ROOT, 'src/app/(saas)/inbox/InboxClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    assert.match(content, /mobileTab/, 'Maintains state for mobile segment switching');
    assert.match(content, /Conversations/, 'Mobile tab for triage list');
    assert.match(content, /Active Thread/, 'Mobile tab for conversation messages');
    assert.match(content, /Lead Intel/, 'Mobile tab for context inspector');
  });
});

