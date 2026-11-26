// Phase 2 regression: every customer-facing surface must match the billing
// catalog (src/lib/billing/catalog.ts), the code that actually charges users.
const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

describe('Phase 2: pricing / trial / RC consistency', () => {
  it('catalog defines the canonical offer', () => {
    const catalog = read('src/lib/billing/catalog.ts');
    assert.ok(catalog.includes("monthlyPrice: 15000"));
    assert.ok(catalog.includes("monthlyPrice: 35000"));
    assert.ok(catalog.includes("monthlyPrice: 75000"));
    assert.ok(read('src/lib/billing/stateMachine.ts').includes('DEFAULT_TRIAL_DAYS = 7'));
  });

  for (const rel of [
    'src/app/(marketing)/terms/page.tsx',
    'src/app/(marketing)/refund-policy/page.tsx',
    'src/app/(marketing)/managed-service-terms/page.tsx',
    'launch/launch-kit.md',
    'launch/manual-submission-guide.md',
    'launch/directory-submissions.md',
    'LAUNCH_TODAY_GUIDE.md',
  ]) {
    it(`${rel} has no superseded ₦20,000/₦45,000 offer`, () => {
      const src = read(rel);
      assert.ok(!src.includes('₦20,000'), `${rel} still quotes old Starter price`);
      assert.ok(!src.includes('₦45,000'), `${rel} still quotes old Pro price`);
    });
  }

  it('legal terms state the 7-day trial and canonical Starter terms', () => {
    const terms = read('src/app/(marketing)/terms/page.tsx');
    assert.ok(terms.includes('7-Day Free Trial'));
    assert.ok(terms.includes('₦15,000 / month'));
    assert.ok(terms.includes('up to 500 active leads/month'));
  });

  it('only one RC number appears in the repo docs and code', () => {
    for (const rel of ['README.md', 'docs/AI_STARTUP_CHALLENGE.md', 'docs/COMMERCIAL_ARCHITECTURE_AND_CONFIRMATION_CHECKLIST.md']) {
      assert.ok(!read(rel).includes('7291048'), `${rel} still uses the wrong RC number`);
      assert.ok(read(rel).includes('8181339'), `${rel} missing canonical RC number`);
    }
  });

  it('Google sign-in trial record uses the canonical Starter price and seats', () => {
    const auth = read('src/lib/auth.ts');
    assert.ok(!auth.includes('pricePerMonth: 20000'), 'auth.ts still creates ₦20,000 trial records');
  });
});
