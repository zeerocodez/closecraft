/* eslint-disable @typescript-eslint/no-require-imports -- VM harness for server modules. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const test = require('node:test');
const crypto = require('node:crypto');
function load(file, mocks = {}, env = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(source, { exports, require: name => name in mocks ? mocks[name] : require(name), process: { env }, console, Buffer, URL, Date, Map }, { filename: file });
  return exports;
}
const security = load('src/lib/security.ts');
const response = { NextResponse: class extends Response { static json(body, init) { return Response.json(body, init); } } };
function route(file, db, env = {}, extra = {}) {
  return load('src/app/api/' + file + '/route.ts', { 'next/server': response, '@/lib/db': { db }, '@/lib/security': security, ...extra }, env);
}
const signed = (body, header, algorithm, secret) => new Request('https://example.com', { method: 'POST', body, headers: { [header]: (header.includes('hub') ? 'sha256=' : '') + crypto.createHmac(algorithm, secret).update(body).digest('hex') } });
const navigation = { redirect: () => { throw Error('login'); }, notFound: () => { throw Error('denied'); } };
test('signature checks fail closed and escape all HTML metacharacters', () => {
  assert.equal(security.secretMatches('Bearer undefined', undefined), false);
  assert.equal(security.validSignature('{}', 'bad', 'secret', 'sha512'), false);
  assert.equal(security.escapeHtml(`<a href="x">&'</a>`), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
});
test('admin denies tenant admins and revoked platform administrators', async () => {
  for (const platformRole of ['USER', 'ADMIN', null]) {
    let calls = 0;
    const access = load('src/lib/access.ts', { '@/lib/auth': { auth: async () => ({ user: { id: 'u', platformRole: 'SUPER_ADMIN' } }) }, '@/lib/db': { db: { user: { findUnique: async () => { calls++; return { platformRole }; } } } }, 'next/navigation': navigation });
    await assert.rejects(access.requirePlatformAdmin(), /denied/);
    assert.equal(calls, 1);
  }
});
test('enrollment is scoped to membership and same-tenant active cohort', async () => {
  let where;
  const access = load('src/lib/access.ts', { '@/lib/auth': { auth: async () => ({ user: { id: 'u' }, organizationId: 'a' }) }, '@/lib/db': { db: { studentProfile: { findFirst: async args => { where = args.where; return null; } } } }, 'next/navigation': navigation });
  await assert.rejects(access.requireStudent(), /denied/);
  assert.equal(where.organizationId, 'a');
  assert.equal(where.organization.members.some.userId, 'u');
  assert.equal(where.enrollments.some.status, 'ACTIVE');
  assert.equal(where.enrollments.some.cohort.organizationId, 'a');
});
test('curriculum prerequisites use persisted completion and do not fetch lesson content', async () => {
  const modules = [1, 2, 3].map(orderIndex => ({ id: String(orderIndex), orderIndex, progress: orderIndex === 1 ? [{ completedAt: new Date() }] : [], _count: { lessons: 1 } }));
  const access = load('src/lib/access.ts', { '@/lib/auth': {}, '@/lib/db': { db: { module: { findMany: async args => { assert.equal(args.where.organizationId, 'a'); assert.equal(args.select.lessons, undefined); assert.equal(args.select.progress.where.studentId, 's'); return modules; } } } }, 'next/navigation': navigation });
  assert.deepEqual(Array.from(await access.curriculumAccess({ id: 's', organizationId: 'a' }), m => m.status), ['COMPLETED', 'ACTIVE', 'LOCKED']);
});
test('module direct navigation denies locked and other-tenant modules before lesson query', async () => {
  for (const modules of [[], [{ id: 'm', status: 'LOCKED' }]]) {
    const page = load('src/app/(lms)/dss/curriculum/[moduleId]/page.tsx', { '@/lib/access': { requireStudent: async () => ({ organizationId: 'a' }), curriculumAccess: async () => modules }, '@/lib/db': { db: { module: { findFirst: () => { throw Error('unexpected query'); } } } }, 'next/navigation': navigation });
    await assert.rejects(page.default({ params: Promise.resolve({ moduleId: 'm' }) }), /denied/);
  }
});
test('cron rejects missing secrets and test-mode bypass', async () => {
  for (const env of [{}, { CRON_SECRET: 'real', NODE_ENV: 'development' }]) {
    const res = await route('cron/follow-ups', {}, env).GET(new Request('https://example.com?test=true', { headers: { Authorization: 'Bearer undefined' } }));
    assert.ok([401, 503].includes(res.status));
  }
});
test('Paystack rejects missing secrets and invalid signatures before DB access', async () => {
  for (const env of [{}, { PAYSTACK_SECRET_KEY: 'real' }]) {
    const res = await route('webhooks/paystack', {}, env).POST(signed('{}', 'x-paystack-signature', 'sha512', 'sk_test_mock'));
    assert.ok([401, 503].includes(res.status));
  }
});
test('Paystack binds amount, currency, reference and tenant, and processes retries once', async () => {
  let processed = false, upgrades = 0, audits = 0;
  const tx = { paymentTransaction: { findUnique: async ({ where }) => where.reference === 'stored' ? { reference: 'stored', amount: 10000, currency: 'NGN', organizationId: 'a', plan: 'PRO' } : null, updateMany: async () => { if (processed) return { count: 0 }; processed = true; return { count: 1 }; } }, organization: { update: async args => { assert.equal(args.where.id, 'a'); upgrades++; } }, auditLog: { create: async () => { audits++; } } };
  const handler = route('webhooks/paystack', { $transaction: fn => fn(tx) }, { PAYSTACK_SECRET_KEY: 'secret' });
  for (const data of [{ reference: 'missing', amount: 10000, currency: 'NGN' }, { reference: 'stored', amount: 1, currency: 'NGN' }, { reference: 'stored', amount: 10000, currency: 'USD' }]) {
    assert.equal((await handler.POST(signed(JSON.stringify({ event: 'charge.success', data: { ...data, status: 'success' } }), 'x-paystack-signature', 'sha512', 'secret'))).status, 400);
  }
  for (let i = 0; i < 2; i++) assert.equal((await handler.POST(signed(JSON.stringify({ event: 'charge.success', data: { reference: 'stored', amount: 10000, currency: 'NGN', status: 'success', customer: { email: 'attacker@example.com' } } }), 'x-paystack-signature', 'sha512', 'secret'))).status, 200);
  assert.equal(upgrades, 1); assert.equal(audits, 1);
});
test('WhatsApp rejects forged events and unknown numbers', async () => {
  const extra = { '@/lib/ai/qualificationEngine': {} };
  assert.equal((await route('webhooks/whatsapp', {}, { WHATSAPP_APP_SECRET: 'secret' }, extra).POST(new Request('https://example.com', { method: 'POST', body: '{}' }))).status, 401);
  const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [{ changes: [{ value: { metadata: { phone_number_id: 'unknown' }, messages: [{ from: '12345678', text: { body: 'injected' } }] } }] }] });
  const db = { organization: { findUnique: async args => { assert.equal(args.where.whatsappPhoneNumberId, 'unknown'); return null; } } };
  assert.equal((await route('webhooks/whatsapp', db, { WHATSAPP_APP_SECRET: 'secret' }, extra).POST(signed(body, 'x-hub-signature-256', 'sha256', 'secret'))).status, 403);
});
test('marketing leads are platform-owned, escaped, bounded and return minimal success', async () => {
  let stored, email;
  const db = { publicFormRateLimit: { upsert: async () => ({ count: 1 }) }, lead: { create: async args => { stored = args.data; return { id: 'private' }; } } };
  const handler = route('leads', db, {}, { '@/lib/email': { sendTransactionalEmail: async args => { email = args; } } });
  const input = { name: '<img>', business: '<a>business</a>', email: 'test@example.com', monthlyLeadVolume: '<b>10</b>', biggestSalesBottleneck: '<script>x</script>' };
  const res = await handler.POST(new Request('https://example.com', { method: 'POST', body: JSON.stringify(input) }));
  assert.equal(res.status, 201); assert.deepEqual(await res.json(), { success: true });
  assert.equal(stored.organizationId, null); assert.equal(stored.type, 'MARKETING_LEAD');
  assert.ok(email.html.includes('&lt;script&gt;')); assert.ok(!email.html.includes('<img>'));
  assert.equal((await handler.POST(new Request('https://example.com', { method: 'POST', body: JSON.stringify({ ...input, business: 'x'.repeat(201) }) }))).status, 400);
  db.publicFormRateLimit.upsert = async () => ({ count: 21 });
  assert.equal((await handler.POST(new Request('https://example.com', { method: 'POST', body: '{}' }))).status, 429);
});
test('demo seed refuses production, remote and non-demo databases', () => {
  for (const env of [{ NODE_ENV: 'production' }, { NODE_ENV: 'development', ALLOW_DEMO_SEED: 'true', DATABASE_URL: 'postgresql://localhost/customer' }, { NODE_ENV: 'development', ALLOW_DEMO_SEED: 'true', DATABASE_URL: 'postgresql://remote/customer_demo' }]) {
    assert.throws(() => load('src/lib/demoSeed.ts', {}, env).requireDemoDatabase());
  }
  load('src/lib/demoSeed.ts', {}, { NODE_ENV: 'development', ALLOW_DEMO_SEED: 'true', DATABASE_URL: 'postgresql://localhost/closecraft_demo' }).requireDemoDatabase();
  assert.ok(!fs.readFileSync('prisma/seed.ts', 'utf8').includes('deleteMany'));
  assert.ok(!fs.existsSync('prisma/dev.db'));
});
