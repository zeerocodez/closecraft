require('tsx/cjs');
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

test('CloseCraft HQ Phase 16: Production Background Cron Automation & Webhook Resilience Acceptance Tests', async (t) => {
  const vercelJsonPath = path.join(__dirname, '../vercel.json');
  const cronFollowUpsPath = path.join(__dirname, '../src/app/api/cron/follow-ups/route.ts');
  const cronRevenueLeakPath = path.join(__dirname, '../src/app/api/cron/revenue-leak/route.ts');
  const cronEnginePath = path.join(__dirname, '../src/app/api/cron/engine/route.ts');
  const webhookRoutePath = path.join(__dirname, '../src/app/api/webhooks/bachs/route.ts');

  await t.test('1. Vercel Crons Configuration Schema & Paths', () => {
    assert.ok(fs.existsSync(vercelJsonPath), 'vercel.json must exist in repository root');
    const config = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    assert.ok(Array.isArray(config.crons), 'vercel.json must define crons array');

    const paths = config.crons.map((c) => c.path);
    assert.ok(paths.includes('/api/cron/follow-ups'), 'Must schedule /api/cron/follow-ups');
    assert.ok(paths.includes('/api/cron/revenue-leak'), 'Must schedule /api/cron/revenue-leak');
    assert.ok(paths.includes('/api/cron/engine'), 'Must schedule /api/cron/engine');

    for (const cron of config.crons) {
      // Hobby rejects schedules that run more often than daily.
      const fields = cron.schedule.trim().split(/\s+/);
      assert.equal(fields.length, 5, 'Must use a five-field cron expression');
      assert.match(fields[0], /^(?:[0-9]|[1-5][0-9])$/, 'One minute per day');
      assert.match(fields[1], /^(?:[0-9]|1[0-9]|2[0-3])$/, 'One hour per day');
      assert.deepEqual(fields.slice(2), ['*', '*', '*'], 'Jobs must run daily');
    }
  });

  await t.test('2. CRON_SECRET Authorization Security Check', async () => {
    const { verifyCronAuth } = require('../src/lib/apiSecurity');
    const originalSecret = process.env.CRON_SECRET;
    process.env.CRON_SECRET = 'test_cron_secret_closecraft_2026';

    try {
      // 1. Missing header
      const reqNoAuth = new Request('http://localhost:3000/api/cron/revenue-leak');
      const resNoAuth = verifyCronAuth(reqNoAuth);
      assert.equal(resNoAuth.authorized, false, 'Must reject missing authorization');
      assert.equal(resNoAuth.response.status, 401);

      // 2. Tampered / wrong header
      const reqBadAuth = new Request('http://localhost:3000/api/cron/revenue-leak', {
        headers: { Authorization: 'Bearer wrong_token' },
      });
      const resBadAuth = verifyCronAuth(reqBadAuth);
      assert.equal(resBadAuth.authorized, false, 'Must reject wrong token');
      assert.equal(resBadAuth.response.status, 401);

      // 3. Valid authorization
      const reqGoodAuth = new Request('http://localhost:3000/api/cron/revenue-leak', {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      });
      const resGoodAuth = verifyCronAuth(reqGoodAuth);
      assert.equal(resGoodAuth.authorized, true, 'Must authorize valid CRON_SECRET token');
    } finally {
      process.env.CRON_SECRET = originalSecret;
    }
  });

  await t.test('3. Revenue Leak Cron Execution when Authorized', async () => {
    const { GET } = require('../src/app/api/cron/revenue-leak/route');
    const originalSecret = process.env.CRON_SECRET;
    process.env.CRON_SECRET = 'test_cron_secret_closecraft_2026';

    try {
      const req = new Request('http://localhost:3000/api/cron/revenue-leak', {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      });

      const res = await GET(req);
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
    } finally {
      process.env.CRON_SECRET = originalSecret;
    }
  });

  let testOrg;
  let testInvoice;
  const timestamp = Date.now();

  await t.test('4. Setup test organization & Bachs invoice for webhook idempotency testing', async () => {
    testOrg = await db.organization.create({
      data: {
        name: `Webhook Idempotency Test Org ${timestamp}`,
        slug: `webhook-idempotency-${timestamp}`,
      }
    });

    testInvoice = await db.bachsInvoice.create({
      data: {
        organizationId: testOrg.id,
        invoiceNumber: `INV-IDEM-${timestamp}`,
        bachsCheckoutId: `chk_idem_${timestamp}`,
        amount: 20000.0,
        currency: 'NGN',
        status: 'ISSUED',
        type: 'STARTER_TIER',
      }
    });

    assert.ok(testInvoice.id);
    assert.equal(testInvoice.status, 'ISSUED');
  });

  await t.test('5. First Webhook Delivery: Fulfills invoice & creates WebhookEvent audit record', async () => {
    const { processBachsWebhookEvent } = require('../src/lib/payments/bachs');
    const eventId = `evt_test_idem_${timestamp}`;

    const eventPayload = {
      id: eventId,
      type: 'collection.succeeded',
      event: 'collection.succeeded',
      data: {
        id: testInvoice.bachsCheckoutId,
        checkout_id: testInvoice.bachsCheckoutId,
        payment_id: `pay_idem_${timestamp}`,
        amount: '20000.00',
        currency: 'NGN',
        metadata: {
          invoiceId: testInvoice.id,
          organizationId: testOrg.id,
          type: 'STARTER_TIER',
        }
      }
    };

    const result = await processBachsWebhookEvent(eventPayload);
    assert.equal(result.handled, true);
    assert.equal(result.duplicate, undefined);

    // Verify invoice status updated to PAID
    const updatedInvoice = await db.bachsInvoice.findUnique({
      where: { id: testInvoice.id }
    });
    assert.equal(updatedInvoice.status, 'PAID');
    assert.ok(updatedInvoice.paidAt);

    // Verify WebhookEvent ledger recorded
    const eventRecord = await db.webhookEvent.findUnique({
      where: { eventId }
    });
    assert.ok(eventRecord, 'WebhookEvent must be recorded for idempotency');
    assert.equal(eventRecord.provider, 'BACHS');
    assert.equal(eventRecord.status, 'PROCESSED');
  });

  await t.test('6. Duplicate Webhook Delivery: Idempotently skipped without double-processing', async () => {
    const { processBachsWebhookEvent } = require('../src/lib/payments/bachs');
    const eventId = `evt_test_idem_${timestamp}`;

    const duplicatePayload = {
      id: eventId,
      type: 'collection.succeeded',
      event: 'collection.succeeded',
      data: {
        id: testInvoice.bachsCheckoutId,
        checkout_id: testInvoice.bachsCheckoutId,
        payment_id: `pay_idem_${timestamp}`,
        amount: '20000.00',
        currency: 'NGN',
        metadata: {
          invoiceId: testInvoice.id,
          organizationId: testOrg.id,
          type: 'STARTER_TIER',
        }
      }
    };

    // Replay identical event
    const replayResult = await processBachsWebhookEvent(duplicatePayload);
    assert.equal(replayResult.handled, true);
    assert.equal(replayResult.duplicate, true, 'Replayed event must be flagged as duplicate');

    // Confirm invoice remained in PAID state without re-triggering actions
    const checkInvoice = await db.bachsInvoice.findUnique({
      where: { id: testInvoice.id }
    });
    assert.equal(checkInvoice.status, 'PAID');
  });

  await t.test('7. Cleanup test records', async () => {
    const eventId = `evt_test_idem_${timestamp}`;
    await db.webhookEvent.deleteMany({
      where: { eventId }
    });
    await db.bachsInvoice.deleteMany({
      where: { id: testInvoice.id }
    });
    await db.organization.delete({
      where: { id: testOrg.id }
    });
    await db.$disconnect();
  });
});
