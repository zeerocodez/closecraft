const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('CloseCraft HQ Phase 12: Back-Office & Operator Operations Acceptance Tests', async (t) => {
  const operatorPagePath = path.join(__dirname, '../src/app/(saas)/operator/page.tsx');
  const operatorDashboardPath = path.join(__dirname, '../src/components/operator/OperatorDashboardClient.tsx');
  const professionalHubPath = path.join(__dirname, '../src/components/pilot/ExternalProfessionalHub.tsx');
  const salesSupportProsPath = path.join(__dirname, '../src/app/(saas)/sales-support/professionals/page.tsx');
  const mockCheckoutPath = path.join(__dirname, '../src/app/billing/checkout/mock/page.tsx');
  const repPagePath = path.join(__dirname, '../src/app/(saas)/rep/page.tsx');

  const operatorPageContent = fs.readFileSync(operatorPagePath, 'utf8');
  const operatorDashboardContent = fs.readFileSync(operatorDashboardPath, 'utf8');
  const professionalHubContent = fs.readFileSync(professionalHubPath, 'utf8');
  const salesSupportProsContent = fs.readFileSync(salesSupportProsPath, 'utf8');
  const mockCheckoutContent = fs.readFileSync(mockCheckoutPath, 'utf8');
  const repPageContent = fs.readFileSync(repPagePath, 'utf8');

  await t.test('1. Operator Page enforces strict operator authentication and role protection', () => {
    assert.ok(operatorPageContent.includes('auth()'), 'Must verify user session');
    assert.ok(operatorPageContent.includes('redirect(\'/login\')'), 'Unauthenticated users must be redirected to login');
    assert.ok(operatorPageContent.includes('OPERATOR') && operatorPageContent.includes('SUPER_ADMIN'), 'Must verify operator or super-admin role');
    assert.ok(operatorPageContent.includes('redirect(\'/today\')'), 'Unauthorized non-operators must be redirected to /today');
  });

  await t.test('2. Operator Dashboard Client adopts Phase 2 Dark Ink system and native Lucide icons', () => {
    assert.ok(operatorDashboardContent.includes('from \'lucide-react\''), 'Must import icons directly from lucide-react');
    assert.ok(operatorDashboardContent.includes('#0f1214'), 'Must utilize Phase 2 container token #0f1214');
    assert.ok(operatorDashboardContent.includes('#248277'), 'Must utilize brand accent #248277');
    assert.ok(operatorDashboardContent.includes('#45bfae'), 'Must utilize brand accent #45bfae');

    // Confirm no legacy M3 tokens remain
    assert.ok(!operatorDashboardContent.includes('bg-surface-container'), 'Must not contain M3 surface-container');
    assert.ok(!operatorDashboardContent.includes('text-on-surface'), 'Must not contain M3 text-on-surface');
    assert.ok(!operatorDashboardContent.includes('border-outline-variant'), 'Must not contain M3 border-outline-variant');
  });

  await t.test('3. External Professional Hub enforces restricted pilot boundaries and Phase 2 design system', () => {
    assert.ok(professionalHubContent.includes('Restricted Access: No Active Pilot Engagement'), 'Must block unassigned or inactive professionals');
    assert.ok(professionalHubContent.includes('Tenant data isolation enforced server-side.'), 'Must display tenant isolation verification badge');
    assert.ok(professionalHubContent.includes('Assigned Opportunities'), 'Must include assigned opportunities tab');
    assert.ok(professionalHubContent.includes('Approved Sales Brief & Boundaries'), 'Must include approved sales brief tab');
    assert.ok(professionalHubContent.includes('Effort Log'), 'Must include effort log tab');
    assert.ok(professionalHubContent.includes('Open Blockers'), 'Must include client blockers tab');
    assert.ok(professionalHubContent.includes('formatWhatsAppUrl'), 'Must support one-click WhatsApp outreach');
    assert.ok(professionalHubContent.includes('from \'lucide-react\''), 'Must use native Lucide icons');
    assert.ok(professionalHubContent.includes('#0f1214'), 'Must use Phase 2 card background token #0f1214');
    assert.ok(professionalHubContent.includes('#248277'), 'Must use Phase 2 primary button token #248277');
  });

  await t.test('4. Rep Page dynamically mounts ExternalProfessionalHub for external professionals', () => {
    assert.ok(repPageContent.includes('EXTERNAL_PROFESSIONAL'), 'Must check for EXTERNAL_PROFESSIONAL role');
    assert.ok(repPageContent.includes('ExternalProfessionalHub'), 'Must dynamically import ExternalProfessionalHub');
    assert.ok(repPageContent.includes('assignedLeads'), 'Must pass assigned leads scoped to professional');
    assert.ok(repPageContent.includes('engagement'), 'Must pass active pilot engagement');
  });

  await t.test('5. Sales Support Professionals Directory provides Phase 2 Dark Ink interface', () => {
    assert.ok(salesSupportProsContent.includes('Dedicated Sales Talent'), 'Must feature dedicated talent badge');
    assert.ok(salesSupportProsContent.includes('Assigned Sales Professionals'), 'Must feature page title');
    assert.ok(salesSupportProsContent.includes('Tenant Boundary & Permission Policy'), 'Must enforce tenant boundary notice');
    assert.ok(salesSupportProsContent.includes('Request Additional Talent'), 'Must include action to request talent');
    assert.ok(salesSupportProsContent.includes('from \'lucide-react\''), 'Must use native Lucide icons');
    assert.ok(salesSupportProsContent.includes('#0f1214'), 'Must use Phase 2 token #0f1214');
    assert.ok(salesSupportProsContent.includes('#248277'), 'Must use Phase 2 accent #248277');
  });

  await t.test('6. Mock Checkout Simulator enforces sandbox guards and Phase 2 styling', () => {
    assert.ok(mockCheckoutContent.includes('ALLOW_PAYMENT_SIMULATOR'), 'Must guard simulation with environment variable');
    assert.ok(mockCheckoutContent.includes('processBachsWebhookEvent'), 'Must invoke idempotent Bachs webhook settlement');
    assert.ok(mockCheckoutContent.includes('Server-enforced settlement & webhook idempotency verified.'), 'Must show settlement security guarantee');
    assert.ok(mockCheckoutContent.includes('from \'lucide-react\''), 'Must use native Lucide icons');
    assert.ok(mockCheckoutContent.includes('#0f1214'), 'Must use Phase 2 background token #0f1214');
  });
});
