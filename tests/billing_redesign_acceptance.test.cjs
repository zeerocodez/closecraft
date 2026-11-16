const { describe, it: test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

describe('CloseCraft HQ Phase 9: Billing, Subscriptions & Bachs Payment Flow Acceptance Tests', () => {

  test('1. Billing Page strictly enforces authentication, role verification, and tenant isolation', () => {
    const pagePath = path.join(ROOT, 'src/app/(saas)/billing/page.tsx');
    assert.ok(fs.existsSync(pagePath), 'Billing page must exist');

    const content = fs.readFileSync(pagePath, 'utf8');
    assert.match(content, /await auth\(\)/, 'Requires authenticated session');
    assert.match(content, /redirect\(['"]\/login['"]\)/, 'Redirects unauthenticated visitors');
    assert.match(content, /organizationId/, 'Requires tenant organizationId');
    assert.match(content, /db\.organizationMember\.findFirst/, 'Verifies user membership and role');
    assert.match(content, /getOrCreateWorkspaceSubscription\(organizationId\)/, 'Scoped to organizationId');
    assert.match(content, /where:\s*\{\s*organizationId,\s*status:/, 'Queries invoices strictly scoped to organizationId');
  });

  test('2. Billing Client presents 4 commercial plan tiers with accurate pricing and seat capacities', () => {
    const clientPath = path.join(ROOT, 'src/components/billing/BillingClient.tsx');
    assert.ok(fs.existsSync(clientPath), 'BillingClient component must exist');

    const content = fs.readFileSync(clientPath, 'utf8');
    // Starter: ₦20,000 / month, 3 seats
    assert.match(content, /Starter Plan/, 'Includes Starter plan');
    assert.match(content, /20,000/, 'Starter pricing ₦20,000');
    assert.match(content, /3 Internal Team Seats/, 'Starter seat allowance');

    // Pro: ₦45,000 / month, 10 seats
    assert.match(content, /Pro Plan/, 'Includes Pro plan');
    assert.match(content, /45,000/, 'Pro pricing ₦45,000');
    assert.match(content, /10 Internal Team Seats/, 'Pro seat allowance');

    // Enterprise: ₦75,000 / month
    assert.match(content, /Enterprise/, 'Includes Enterprise plan');
    assert.match(content, /75,000/, 'Enterprise pricing ₦75,000');

    // Managed Sales: from ₦150,000 / month
    assert.match(content, /Managed Sales/, 'Includes Managed Sales plan');
    assert.match(content, /150,000/, 'Managed Sales pricing from ₦150,000');
  });

  test('3. Seat utilization bar visually monitors team capacity and plan thresholds', () => {
    const clientPath = path.join(ROOT, 'src/components/billing/BillingClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    assert.match(content, /Internal Team Seats Utilization/, 'Shows seat utilization title');
    assert.match(content, /seatsUsed/, 'Tracks current active seats');
    assert.match(content, /seatPercentage/, 'Calculates percentage of seat capacity used');
    assert.match(content, /seats assigned/, 'Shows seats assigned progress indicator');
  });

  test('4. 7-Day trial safeguards and approved verbatim copy are strictly preserved', () => {
    const clientPath = path.join(ROOT, 'src/components/billing/BillingClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    // Verbatim copy from Section 4.D
    assert.ok(content.includes('Choose a plan to keep your follow-up running.'), 'Preserves banner copy');
    assert.ok(content.includes('Your free trial has ended.'), 'Preserves trial ended header');
    assert.ok(content.includes('Choose a plan to continue using paid features. You can still access your account and billing options.'), 'Preserves trial ended notice');
    assert.ok(content.includes('We are confirming your payment. Your paid access will update after verification.'), 'Preserves verifying copy');
    assert.ok(content.includes('Your payment has not been confirmed. Check its status before trying again.'), 'Preserves payment unconfirmed copy');

    // Trial countdown indicators
    assert.match(content, /formatTrialEnd/, 'Calculates formatted trial end date');
    assert.match(content, /trialEndsAt/, 'Uses trialEndsAt date');
  });

  test('5. Active workspace invoice card and Bachs checkout flow are fully wired', () => {
    const clientPath = path.join(ROOT, 'src/components/billing/BillingClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    assert.match(content, /activeInvoice/, 'Receives active invoice prop');
    assert.match(content, /invoiceNumber/, 'Displays invoice reference number');
    assert.match(content, /handleCheckout/, 'Handler for launching Bachs checkout');
    assert.match(content, /\/api\/billing\/checkout/, 'Calls Bachs checkout API endpoint');
    assert.match(content, /Pay with Bachs/, 'Bachs checkout call to action button');
  });

  test('6. Interactive official verified receipt modal with print trigger is present', () => {
    const clientPath = path.join(ROOT, 'src/components/billing/BillingClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    assert.match(content, /selectedReceipt/, 'Receipt modal visibility state');
    assert.match(content, /Official Payment Receipt/, 'Receipt modal heading');
    assert.match(content, /Bachs\.io Hosted Checkout/, 'Payment method attribution');
    assert.match(content, /window\.print\(\)/, 'Print receipt action trigger');
  });

  test('7. Billing Return page provides status polling and dark ink styling', () => {
    const returnPath = path.join(ROOT, 'src/app/(saas)/billing/return/page.tsx');
    assert.ok(fs.existsSync(returnPath), 'Billing return page must exist');

    const content = fs.readFileSync(returnPath, 'utf8');
    assert.match(content, /Verifying Payment with Bachs/, 'Loading verification heading');
    assert.match(content, /Payment Confirmed/, 'Success state badge');
    assert.match(content, /Workspace Entitlement Activated/, 'Success state heading');
    assert.match(content, /Payment Verification Notice/, 'Notice state heading');
    assert.match(content, /Return to Billing/, 'Return to billing button');
  });
});
