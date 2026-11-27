const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeDatabaseUrl } = require('../src/lib/db.ts');

test('rewrites Supabase session-mode pooler (:5432) to transaction mode (:6543) with pgbouncer=true', () => {
  const input = 'postgresql://postgres.proj:secret@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
  const result = normalizeDatabaseUrl(input, { isVercel: true, isProduction: true });
  const parsed = new URL(result);

  assert.equal(parsed.port, '6543');
  assert.equal(parsed.searchParams.get('pgbouncer'), 'true');
  assert.equal(parsed.searchParams.get('connection_limit'), '1');
  assert.equal(parsed.searchParams.get('pool_timeout'), '20');
  assert.equal(parsed.username, 'postgres.proj');
  assert.equal(parsed.password, 'secret');
});

test('uses connection_limit=3 in non-production local environments unless explicitly provided', () => {
  const input = 'postgresql://postgres.proj:secret@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
  const result = normalizeDatabaseUrl(input, { isVercel: false, isProduction: false });
  const parsed = new URL(result);

  assert.equal(parsed.port, '6543');
  assert.equal(parsed.searchParams.get('pgbouncer'), 'true');
  assert.equal(parsed.searchParams.get('connection_limit'), '3');
});

test('preserves explicit connection_limit and non-5432 ports on Supabase pooler', () => {
  const input = 'postgresql://user:pass@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=2&sslmode=require';
  const result = normalizeDatabaseUrl(input, { isVercel: true, isProduction: true });
  const parsed = new URL(result);

  assert.equal(parsed.port, '6543');
  assert.equal(parsed.searchParams.get('pgbouncer'), 'true');
  assert.equal(parsed.searchParams.get('connection_limit'), '2');
  assert.equal(parsed.searchParams.get('sslmode'), 'require');
});

test('leaves non-Supabase database URLs untouched unless pgbouncer=true without limit in production', () => {
  const localPg = 'postgresql://postgres:postgres@localhost:5432/closecraft';
  assert.equal(normalizeDatabaseUrl(localPg, { isVercel: true, isProduction: true }), localPg);
  assert.equal(normalizeDatabaseUrl(undefined), undefined);
  assert.equal(normalizeDatabaseUrl('   '), undefined);
});
