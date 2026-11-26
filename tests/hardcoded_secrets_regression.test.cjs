// Regression tests for the Phase 1 security fixes (Nov 2026).
// These read the real source files — they fail if a hardcoded secret,
// password bypass, or known default credential is reintroduced.
const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const BANNED = [
  'closecraft_super_secret_revenue_os_key_2026_production_vault_99',
  'closecraft_default_meta_vault_secret_2026',
  'closecraft_meta_webhook_verify_token_2026',
];

describe('Phase 1: no hardcoded secret fallbacks', () => {
  for (const rel of [
    'src/lib/auth.ts',
    'src/lib/integrations/meta/crypto.ts',
    'src/lib/integrations/meta/client.ts',
    'src/app/api/webhooks/facebook/route.ts',
    'src/app/api/integrations/meta/auth/route.ts',
    'src/app/api/integrations/meta/callback/route.ts',
    'src/app/(saas)/settings/MetaAdsConfigCard.tsx',
  ]) {
    it(`${rel} contains no known public fallback secret`, () => {
      const src = read(rel);
      for (const banned of BANNED) assert.ok(!src.includes(banned), `${rel} still contains ${banned}`);
    });
  }

  it('auth verifies passwords only via bcrypt (no demo bypass)', () => {
    const src = read('src/lib/auth.ts');
    assert.ok(!src.includes("credentials.password === 'password'"), 'demo password bypass still present');
    assert.ok(!src.includes("credentials.password === 'demo'"), 'demo password bypass still present');
    assert.ok(!src.includes('DemoAccess2026'), 'hardcoded demo password still in auth');
    assert.ok(src.includes('bcrypt.compare'), 'bcrypt verification missing');
  });

  it('root create_admin.js with hardcoded password123 is gone', () => {
    assert.ok(!fs.existsSync(path.join(root, 'create_admin.js')), 'create_admin.js still at repo root');
    const secure = read('scripts/create_admin.js');
    assert.ok(secure.includes('process.env.ADMIN_PASSWORD'), 'secure admin script must read env');
  });

  it('prisma seed has no hardcoded password123', () => {
    assert.ok(!read('prisma/seed.ts').includes("'password123'"), 'seed still hardcodes password123');
  });

  it('local dev database is not tracked', () => {
    assert.ok(!fs.existsSync(path.join(root, 'prisma/dev.db')), 'prisma/dev.db still present');
  });
});
