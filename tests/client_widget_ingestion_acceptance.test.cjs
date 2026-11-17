require('tsx/cjs');
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

test('CloseCraft HQ Phase 15: Embeddable Website Lead Capture Widget & Public Ingestion API Acceptance Tests', async (t) => {
  const widgetScriptPath = path.join(__dirname, '../public/closecraft.js');
  const routePath = path.join(__dirname, '../src/app/api/leads/embed/route.ts');
  const settingsPagePath = path.join(__dirname, '../src/app/(saas)/settings/page.tsx');

  const widgetScriptContent = fs.readFileSync(widgetScriptPath, 'utf8');
  const routeContent = fs.readFileSync(routePath, 'utf8');
  const settingsPageContent = fs.readFileSync(settingsPagePath, 'utf8');

  await t.test('1. Client Widget Script Architecture & Resilience', () => {
    assert.ok(widgetScriptContent.includes('__closecraft_widget_loaded'), 'Must prevent multiple script loads');
    assert.ok(widgetScriptContent.includes('data-workspace'), 'Must resolve data-workspace attribute');
    assert.ok(widgetScriptContent.includes('cc-widget-btn'), 'Must define floating widget button');
    assert.ok(widgetScriptContent.includes('/api/leads/embed'), 'Must target public ingestion endpoint');
    assert.ok(widgetScriptContent.includes('cc-modal-backdrop'), 'Must include modal dialog structure');
  });

  await t.test('2. Public Ingestion Route CORS & Payload Security', () => {
    assert.ok(routeContent.includes('export async function OPTIONS'), 'Must handle CORS preflight requests');
    assert.ok(routeContent.includes('export async function POST'), 'Must handle lead POST submissions');
    assert.ok(routeContent.includes('Access-Control-Allow-Origin'), 'Must return CORS headers for cross-origin forms');
    assert.ok(routeContent.includes('WEBSITE_WIDGET'), 'Must tag source as WEBSITE_WIDGET');
    assert.ok(routeContent.includes('Triage Inbound Website Lead'), 'Must assign deterministic Next Best Action');
  });

  await t.test('3. Settings Page Embed Generator UI', () => {
    assert.ok(settingsPageContent.includes('Website Lead Capture Widget'), 'Must display widget section title');
    assert.ok(settingsPageContent.includes('closecraft.js'), 'Must provide script embed code');
    assert.ok(settingsPageContent.includes('POST /api/leads/embed'), 'Must explain headless API endpoint');
    assert.ok(settingsPageContent.includes('Inbound Capture'), 'Must render badge');
  });

  let testOrg;
  let testOrgB;
  const timestamp = Date.now();

  await t.test('4. Setup test organizations in database', async () => {
    testOrg = await db.organization.create({
      data: {
        name: `Widget Client Workspace ${timestamp}`,
        slug: `widget-client-${timestamp}`,
      }
    });

    testOrgB = await db.organization.create({
      data: {
        name: `Unrelated Workspace ${timestamp}`,
        slug: `unrelated-${timestamp}`,
      }
    });

    assert.ok(testOrg.id);
    assert.ok(testOrgB.id);
  });

  await t.test('5. Ingestion API Endpoint Validation & Error Handling', async () => {
    const { POST, OPTIONS } = require('../src/app/api/leads/embed/route');

    // 1. Preflight
    const optRes = await OPTIONS();
    assert.equal(optRes.status, 200);
    assert.equal(optRes.headers.get('Access-Control-Allow-Origin'), '*');

    // 2. Missing workspaceSlug
    const reqNoSlug = new Request('http://local.test/api/leads/embed', { method: 'POST', body: JSON.stringify({ name: 'Test Contact', email: 'test@example.com' }) });
    const resNoSlug = await POST(reqNoSlug);
    assert.equal(resNoSlug.status, 400);

    // 3. Unknown workspaceSlug
    const reqBadSlug = new Request('http://local.test/api/leads/embed', { method: 'POST', body: JSON.stringify({ workspaceSlug: 'non-existent-slug-xyz', name: 'Test Contact', email: 'test@example.com' }) });
    const resBadSlug = await POST(reqBadSlug);
    assert.equal(resBadSlug.status, 404);

    // 4. Missing name
    const reqNoName = new Request('http://local.test/api/leads/embed', { method: 'POST', body: JSON.stringify({ workspaceSlug: testOrg.slug, email: 'test@example.com' }) });
    const resNoName = await POST(reqNoName);
    assert.equal(resNoName.status, 400);

    // 5. Missing both email and phone
    const reqNoContact = new Request('http://local.test/api/leads/embed', { method: 'POST', body: JSON.stringify({ workspaceSlug: testOrg.slug, name: 'Contact Without Email Or Phone' }) });
    const resNoContact = await POST(reqNoContact);
    assert.equal(resNoContact.status, 400);
  });

  await t.test('6. Ingests valid lead, attaches to correct organization, and derives Next Best Action', async () => {
    const { POST } = require('../src/app/api/leads/embed/route');

    const validPayload = {
      workspaceSlug: testOrg.slug,
      name: 'Emeka Okafor',
      email: `emeka.${timestamp}@transnigeria.ng`,
      phone: '+2348099887766',
      message: 'Looking to deploy 5 appointment setters for our logistics service in Abuja.',
      estimatedValue: 750000,
    };

    const reqValid = new Request('http://local.test/api/leads/embed', {
      method: 'POST', body: JSON.stringify(validPayload),
      headers: { 'x-forwarded-for': '197.210.64.1' },
    });

    const res = await POST(reqValid);
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.leadId);

    // Verify row in database
    const savedLead = await db.lead.findUnique({
      where: { id: body.leadId }
    });

    assert.ok(savedLead);
    assert.equal(savedLead.organizationId, testOrg.id, 'Must be scoped strictly to testOrg');
    assert.equal(savedLead.name, 'Emeka Okafor');
    assert.equal(savedLead.email, `emeka.${timestamp}@transnigeria.ng`);
    assert.equal(savedLead.phone, '+2348099887766');
    assert.equal(savedLead.source, 'WEBSITE_WIDGET');
    assert.equal(savedLead.status, 'NEW');
    assert.equal(savedLead.estimatedValue, 750000);
    assert.equal(savedLead.nextAction, 'Triage Inbound Website Lead');
    assert.ok(savedLead.nextActionDueAt);

    // Multi-tenant check: testOrgB must have 0 leads
    const leadsInB = await db.lead.count({ where: { organizationId: testOrgB.id } });
    assert.equal(leadsInB, 0, 'Unrelated organization must not receive or see lead');
  });

  await t.test('7. Cleanup test records', async () => {
    await db.lead.deleteMany({
      where: { organizationId: { in: [testOrg.id, testOrgB.id] } }
    });
    await db.organization.deleteMany({
      where: { id: { in: [testOrg.id, testOrgB.id] } }
    });
    await db.$disconnect();
  });
});
