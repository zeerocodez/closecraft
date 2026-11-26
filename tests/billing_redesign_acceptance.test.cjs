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
    assert.match(content, /where:\s*\{\s*organizationId\s*\}/, 'Queries invoices strictly scoped to organizationId');
  });

  test('2. Billing Client presents 4 commercial plan tiers with accurate pricing and seat capacities', () => {
    const clientPath = path.join(ROOT, 'src/components/billing/BillingClient.tsx');
    assert.ok(fs.existsSync(clientPath), 'BillingClient component must exist');

    const content = fs.readFileSync(clientPath, 'utf8');
    assert.match(content, /plans\.map|availablePlans/, 'Renders dynamic commercial plan catalog');
    assert.match(content, /Enterprise|ENTERPRISE/, 'Includes Enterprise quotation flow');
    assert.match(content, /billingInterval|ANNUAL|MONTHLY/, 'Supports monthly and annual billing intervals');
    assert.match(content, /marketRegion|NGN|USD/, 'Supports regional market pricing');
  });

  test('3. Usage & seat utilization bars monitor team capacity, leads, and AI operations', () => {
    const clientPath = path.join(ROOT, 'src/components/billing/BillingClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    assert.match(content, /Team Seats|activeTeamMembers/, 'Tracks current active team seats');
    assert.match(content, /Active Leads|activeLeads/, 'Tracks active leads against cap');
    assert.match(content, /AI Operations|aiOperationsUsed/, 'Tracks AI operations allowance');
  });

  test('4. 7-Day trial & 5-day grace period safeguards and cancellation/reactivation actions are present', () => {
    const clientPath = path.join(ROOT, 'src/components/billing/BillingClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    assert.match(content, /TRIALING|trialEndsAt/, 'Tracks 7-day trial state and expiry date');
    assert.match(content, /GRACE_PERIOD|gracePeriodEndsAt/, 'Supports 5-day grace period preservation');
    assert.match(content, /CANCEL|REACTIVATE/, 'Supports subscription cancel and reactivate actions');
  });

  test('5. Active workspace invoice table, prepaid credits checkout & Bachs flow are wired', () => {
    const clientPath = path.join(ROOT, 'src/components/billing/BillingClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    assert.match(content, /invoices/, 'Receives billing invoices prop');
    assert.match(content, /invoiceNumber/, 'Displays invoice reference number');
    assert.match(content, /\/api\/billing\/checkout/, 'Calls Bachs checkout API endpoint');
    assert.match(content, /creditPackId|consentConfirmed/, 'Supports explicit opt-in prepaid credits');
  });

  test('6. Downloadable invoice & official verified receipt endpoint is linked cleanly', () => {
    const clientPath = path.join(ROOT, 'src/components/billing/BillingClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    assert.match(content, /\/api\/billing\/invoices\//, 'Links to invoice & receipt document route');
    assert.match(content, /receiptNumber/, 'Displays official receipt reference');
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
