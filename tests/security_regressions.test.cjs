require('tsx/cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { db } = require('../src/lib/db.ts');
const { requireSuperAdmin } = require('../src/lib/apiSecurity.ts');
const { POST } = require('../src/app/api/webhooks/bachs/route.ts');

test('administration requires an explicit stored platform role', async () => {
  const original = db.user.findUnique;
  try {
    for (const email of ['attacker@closecrafthq.com', 'attacker@closecraft.com']) {
      db.user.findUnique = async () => ({ id: 'test', role: 'USER', email });
      assert.equal((await requireSuperAdmin({ user: { id: 'test' } })).authorized, false);
    }
    for (const role of ['SUPER_ADMIN', 'OPERATOR']) {
      db.user.findUnique = async () => ({ id: 'test', role, email: 'admin@example.test' });
      assert.equal((await requireSuperAdmin({ user: { id: 'test' } })).authorized, true);
    }
    assert.equal((await requireSuperAdmin(null)).authorized, false);
  } finally { db.user.findUnique = original; }
});

test('all Bachs events require verification before accessing the database', async () => {
  const env = { ...process.env };
  const original = db.webhookEvent.findUnique;
  let reads = 0;
  db.webhookEvent.findUnique = async () => { reads++; return { eventId: 'synthetic' }; };
  const send = (type, signature) => {
    const body = JSON.stringify({ id: 'synthetic', type });
    return POST(new Request('http://local/api/webhooks/bachs', {
      method: 'POST', body, headers: signature ? { 'x-bachs-signature': signature(body) } : {},
    }));
  };
  try {
    delete process.env.BACHS_WEBHOOK_SECRET;
    delete process.env.BILLING_WEBHOOK_SECRET;
    assert.equal((await send('collection.succeeded')).status, 503);
    process.env.BACHS_WEBHOOK_SECRET = 'synthetic-secret';
    for (const type of ['collection.succeeded', 'refund.succeeded', 'charge.refunded', 'unknown']) {
      assert.equal((await send(type)).status, 401);
      assert.equal((await send(type, () => 'invalid')).status, 401);
    }
    assert.equal(reads, 0);
    assert.equal((await send('refund.succeeded', body => crypto.createHmac('sha256', 'synthetic-secret').update(body).digest('hex'))).status, 200);
    assert.equal(reads, 1);
  } finally {
    db.webhookEvent.findUnique = original;
    for (const key of ['BACHS_WEBHOOK_SECRET', 'BILLING_WEBHOOK_SECRET']) {
      if (env[key] === undefined) delete process.env[key]; else process.env[key] = env[key];
    }
  }
});

test('production cannot render the payment simulator even when opted in', async () => {
  const page = require('../src/app/billing/checkout/mock/page.tsx').default;
  const env = { ...process.env };
  try {
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_PAYMENT_SIMULATOR = 'true';
    await assert.rejects(page({ searchParams: Promise.resolve({ invoice_id: 'test' }) }), /NEXT_HTTP_ERROR_FALLBACK;404/);
  } finally {
    for (const key of ['NODE_ENV', 'ALLOW_PAYMENT_SIMULATOR']) {
      if (env[key] === undefined) delete process.env[key]; else process.env[key] = env[key];
    }
  }
});

test('staff permissions cannot be obtained by email address alone', async () => {
  const { assertStaffPermission } = require('../src/lib/permissions/matrix.ts');
  const original = db.user.findUnique;
  try {
    for (const email of ['attacker@closecraft.com', 'attacker@closecrafthq.com', 'zeerocodes@gmail.com']) {
      db.user.findUnique = async () => ({ id: 'test', role: 'USER', email, staffProfile: null });
      await assert.rejects(assertStaffPermission('test', 'workforce:manage_staff'), /Access Denied/);
    }
  } finally { db.user.findUnique = original; }
});
