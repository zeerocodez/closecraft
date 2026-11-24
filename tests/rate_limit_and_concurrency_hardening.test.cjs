const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Security Hardening: RateLimit table is defined in Prisma schema', (t) => {
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  assert.match(schemaContent, /model\s+RateLimit\s+\{/, 'RateLimit model must be defined in schema.prisma');
  assert.match(schemaContent, /key\s+String\s+@id/, 'RateLimit must have key as primary key');
  assert.match(schemaContent, /resetAt\s+DateTime/, 'RateLimit must have resetAt timestamp');
});

test('Security Hardening: Migration exists for RateLimit table', (t) => {
  const migrationSqlPath = path.join(__dirname, '..', 'prisma', 'migrations', '20261117_create_rate_limit_table', 'migration.sql');
  assert.ok(fs.existsSync(migrationSqlPath), 'Migration file must exist');
  const sql = fs.readFileSync(migrationSqlPath, 'utf8');
  assert.match(sql, /CREATE TABLE "RateLimit"/, 'Migration must create RateLimit table');
});

test('Security Hardening: rateLimit library integrates DB-backed persistence and memory fallback', (t) => {
  const rateLimitPath = path.join(__dirname, '..', 'src', 'lib', 'rateLimit.ts');
  const content = fs.readFileSync(rateLimitPath, 'utf8');

  assert.match(content, /db\.rateLimit/, 'rateLimit must attempt persistent db.rateLimit lookup');
  assert.match(content, /upsert/, 'rateLimit must upsert on key reset or init');
  assert.match(content, /memoryStore/, 'rateLimit must retain resilient fallback store');
});

test('Security Hardening: Affiliate payout route has atomic FOR UPDATE transaction lock', (t) => {
  const payoutRoutePath = path.join(__dirname, '..', 'src', 'app', 'api', 'affiliate', 'payout', 'route.ts');
  const content = fs.readFileSync(payoutRoutePath, 'utf8');

  assert.match(content, /\$transaction/, 'payout route must use db.$transaction');
  assert.match(content, /FOR UPDATE/, 'payout route must execute SELECT ... FOR UPDATE to eliminate concurrency double-withdrawals');
  assert.match(content, /totalPaidOrRequested/, 'payout route must verify available balance under transaction lock');
});

test('Security Hardening: Public widget lead ingestion enforces IP and Org rate limiting and string bounds', (t) => {
  const embedRoutePath = path.join(__dirname, '..', 'src', 'app', 'api', 'leads', 'embed', 'route.ts');
  const content = fs.readFileSync(embedRoutePath, 'utf8');

  assert.match(content, /rateLimit\(`embed-leads-ip:/, 'embed route must enforce IP rate limiting');
  assert.match(content, /rateLimit\(`embed-leads-org:/, 'embed route must enforce workspace rate limiting');
  assert.match(content, /status:\s*429/, 'embed route must return 429 when rate limited');
  assert.match(content, /workspaceSlug\.length > 100/, 'workspaceSlug length must be bounded');
  assert.match(content, /150/, 'name length must be bounded');
  assert.match(content, /255/, 'email length must be bounded');
  assert.match(content, /3000/, 'message length must be bounded');
});

test('Security Hardening: Auth credentials callback enforces account and IP brute-force protection', (t) => {
  const authPath = path.join(__dirname, '..', 'src', 'lib', 'auth.ts');
  const content = fs.readFileSync(authPath, 'utf8');

  assert.match(content, /rateLimit\(`auth-login-account:/, 'auth callback must rate limit by account');
  assert.match(content, /rateLimit\(`auth-login-ip:/, 'auth callback must rate limit by client IP');
});

