require('tsx/cjs');
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

test('Phase 7: Meta Lead Ads Ingestion, Multi-Tenant Resolution & AI Qualification Acceptance Tests', async (t) => {
  const routePath = path.join(__dirname, '../src/app/api/webhooks/facebook/route.ts');
  const routeContent = fs.readFileSync(routePath, 'utf8');

  await t.test('1. Static Code Analysis: Tenant Resolution, Verification & Quarantine', () => {
    assert.strictEqual(
      routeContent.includes("orderBy: { createdAt: 'asc' }"),
      false,
      'Must NOT fall back to arbitrary first created organization'
    );
    assert.ok(
      routeContent.includes('facebookPageId: pageId'),
      'Must resolve tenant organization strictly by facebookPageId'
    );
    assert.ok(
      routeContent.includes('leadgen.quarantined'),
      'Must quarantine unmapped Facebook page leads to WebhookEvent'
    );
    assert.ok(
      routeContent.includes('x-hub-signature-256'),
      'Must verify Meta webhook cryptographic HMAC signatures'
    );
    assert.ok(
      routeContent.includes('RevenueEngine.processNewLead'),
      'Must trigger canonical Revenue Engine qualification'
    );
  });

  const timestamp = Date.now();
  let testOrgA;
  let testOrgB;
  const pageIdA = `page_meta_${timestamp}_a`;
  const pageIdB = `page_meta_${timestamp}_b`;
  const testSecret = 'meta_test_secret_abc123';
  const verifyToken = 'meta_verify_token_xyz789';

  process.env.FACEBOOK_APP_SECRET = testSecret;
  process.env.FACEBOOK_VERIFY_TOKEN = verifyToken;

  const { GET, POST } = require('../src/app/api/webhooks/facebook/route.ts');

  await t.test('2. Setup Test Organizations with Scoped Meta Page IDs', async () => {
    testOrgA = await db.organization.create({
      data: {
        name: `Meta Tenant Alpha ${timestamp}`,
        slug: `meta-tenant-alpha-${timestamp}`,
        facebookPageId: pageIdA,
        status: 'APPROVED',
        qualificationPolicy: 'B2B Professional Services firms needing revenue recovery. Minimum deal size 500,000 NGN.',
      },
    });

    testOrgB = await db.organization.create({
      data: {
        name: `Meta Tenant Beta ${timestamp}`,
        slug: `meta-tenant-beta-${timestamp}`,
        facebookPageId: pageIdB,
        status: 'APPROVED',
      },
    });

    assert.ok(testOrgA.id);
    assert.ok(testOrgB.id);
  });

  await t.test('3. Verification Challenge Handling (GET)', async () => {
    const validUrl = `https://closecraft.test/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=META_CHALLENGE_OK_777`;
    const res = await GET(new Request(validUrl, { method: 'GET' }));
    assert.strictEqual(res.status, 200);
    const body = await res.text();
    assert.strictEqual(body, 'META_CHALLENGE_OK_777');

    const invalidUrl = `https://closecraft.test/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=BAD_TOKEN&hub.challenge=FAIL`;
    const invalidRes = await GET(new Request(invalidUrl, { method: 'GET' }));
    assert.strictEqual(invalidRes.status, 403);
  });

  function makeSignedMetaRequest(payloadObj) {
    const rawBody = JSON.stringify(payloadObj);
    const signature = 'sha256=' + crypto.createHmac('sha256', testSecret).update(rawBody).digest('hex');
    return new Request('https://closecraft.test/api/webhooks/facebook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': signature,
      },
      body: rawBody,
    });
  }

  await t.test('4. HMAC Signature Enforcement (POST)', async () => {
    const rawPayload = JSON.stringify({ object: 'page', entry: [] });

    // Missing signature
    const missingReq = new Request('https://closecraft.test/api/webhooks/facebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rawPayload,
    });
    const missingRes = await POST(missingReq);
    assert.strictEqual(missingRes.status, 401);

    // Invalid signature
    const invalidReq = new Request('https://closecraft.test/api/webhooks/facebook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': 'sha256=wrongsignature000000000000000000000000000000000000000000000000',
      },
      body: rawPayload,
    });
    const invalidRes = await POST(invalidReq);
    assert.strictEqual(invalidRes.status, 401);
  });

  const leadgenId1 = `meta_lead_${timestamp}_1`;

  await t.test('5. Valid Meta Lead Submission: Scoped to Org A, isolated from Org B', async () => {
    const metaPayload = {
      object: 'page',
      entry: [
        {
          id: pageIdA, // Targeted to Org A
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: 'leadgen',
              value: {
                ad_id: 'ad_nigeria_growth_campaign_01',
                form_id: 'form_high_ticket_audit_2026',
                leadgen_id: leadgenId1,
                created_time: Math.floor(Date.now() / 1000),
                page_id: pageIdA,
                adgroup_id: 'adset_lagos_executives',
              },
            },
          ],
        },
      ],
    };

    const res = await POST(makeSignedMetaRequest(metaPayload));
    assert.strictEqual(res.status, 200);

    // Verify lead record created in Org A
    const leadInA = await db.lead.findUnique({
      where: { id: `fb_${leadgenId1}` },
      include: { deals: true, revenueSignals: true },
    });
    assert.ok(leadInA, 'Lead must be created with ID fb_${leadgenId}');
    assert.strictEqual(leadInA.organizationId, testOrgA.id, 'Must be scoped strictly to testOrgA');
    assert.strictEqual(leadInA.source, 'FACEBOOK_LEAD_AD');
    assert.ok(leadInA.message.includes('form_high_ticket_audit_2026'));

    // Verify tenant isolation: testOrgB has ZERO leads
    const leadsInB = await db.lead.count({ where: { organizationId: testOrgB.id } });
    assert.strictEqual(leadsInB, 0, 'Tenant isolation violation: Org B must have 0 leads');
  });

  await t.test('6. Duplicate Submission Protection: Idempotent upsert', async () => {
    const duplicatePayload = {
      object: 'page',
      entry: [
        {
          id: pageIdA,
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: 'leadgen',
              value: {
                ad_id: 'ad_nigeria_growth_campaign_01',
                form_id: 'form_high_ticket_audit_2026',
                leadgen_id: leadgenId1, // Duplicate ID
                created_time: Math.floor(Date.now() / 1000),
                page_id: pageIdA,
                adgroup_id: 'adset_lagos_executives',
              },
            },
          ],
        },
      ],
    };

    const res = await POST(makeSignedMetaRequest(duplicatePayload));
    assert.strictEqual(res.status, 200);

    const count = await db.lead.count({ where: { id: `fb_${leadgenId1}` } });
    assert.strictEqual(count, 1, 'Duplicate submission must not duplicate lead record');
  });

  await t.test('7. Quarantine Unmapped Meta Page Identifier', async () => {
    const unmappedPageId = `unmapped_meta_page_${timestamp}`;
    const unmappedLeadgenId = `meta_unmapped_${timestamp}`;

    const unmappedPayload = {
      object: 'page',
      entry: [
        {
          id: unmappedPageId,
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: 'leadgen',
              value: {
                ad_id: 'ad_random_unknown',
                form_id: 'form_unknown',
                leadgen_id: unmappedLeadgenId,
                created_time: Math.floor(Date.now() / 1000),
                page_id: unmappedPageId,
                adgroup_id: 'adset_unknown',
              },
            },
          ],
        },
      ],
    };

    const res = await POST(makeSignedMetaRequest(unmappedPayload));
    assert.strictEqual(res.status, 200); // 200 acknowledged to Meta

    // Verify unmapped event quarantined in WebhookEvent
    const quarantinedEvents = await db.webhookEvent.findMany({
      where: {
        provider: 'FACEBOOK',
        eventType: 'leadgen.quarantined',
        payload: { contains: unmappedPageId },
      },
    });
    assert.ok(quarantinedEvents.length > 0, 'Unmapped leadgen event must be quarantined');
    assert.strictEqual(quarantinedEvents[0].status, 'IGNORED');

    // Confirm no lead was created for unmapped page
    const unmappedLead = await db.lead.findUnique({
      where: { id: `fb_${unmappedLeadgenId}` },
    });
    assert.strictEqual(unmappedLead, null, 'Unmapped lead must not be persisted into CRM');
  });

  await t.test('8. Teardown Test Records', async () => {
    await db.revenueSignal.deleteMany({
      where: { leadId: `fb_${leadgenId1}` },
    });
    await db.revenueAction.deleteMany({
      where: { organizationId: { in: [testOrgA.id, testOrgB.id] } },
    });
    await db.deal.deleteMany({
      where: { organizationId: { in: [testOrgA.id, testOrgB.id] } },
    });
    await db.lead.deleteMany({
      where: { id: `fb_${leadgenId1}` },
    });
    await db.webhookEvent.deleteMany({
      where: {
        provider: 'FACEBOOK',
        payload: { contains: `page_meta_${timestamp}` },
      },
    });
    await db.organization.deleteMany({
      where: { id: { in: [testOrgA.id, testOrgB.id] } },
    });
    await db.$disconnect();
  });
});
