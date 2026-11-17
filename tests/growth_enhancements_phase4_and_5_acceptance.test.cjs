const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('CloseCraft Growth Enhancements Phase 4 & 5: Human Override, DSS Workforce Bridge & Trial Warnings Acceptance Tests', async (t) => {
  const actionsPath = path.join(__dirname, '../src/app/(saas)/actions.ts');
  const modalPath = path.join(__dirname, '../src/components/revenue-engine/LeadAiAssessmentModal.tsx');
  const leadsPath = path.join(__dirname, '../src/app/(saas)/leads/LeadsTableClient.tsx');
  const layoutPath = path.join(__dirname, '../src/app/(saas)/layout.tsx');
  const cronPath = path.join(__dirname, '../src/app/api/cron/revenue-leak/route.ts');

  assert.ok(fs.existsSync(actionsPath), 'actions.ts must exist');
  assert.ok(fs.existsSync(modalPath), 'LeadAiAssessmentModal.tsx must exist');
  assert.ok(fs.existsSync(leadsPath), 'LeadsTableClient.tsx must exist');
  assert.ok(fs.existsSync(layoutPath), 'layout.tsx must exist');
  assert.ok(fs.existsSync(cronPath), 'revenue-leak/route.ts must exist');

  const actionsContent = fs.readFileSync(actionsPath, 'utf8');
  const modalContent = fs.readFileSync(modalPath, 'utf8');
  const leadsContent = fs.readFileSync(leadsPath, 'utf8');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const cronContent = fs.readFileSync(cronPath, 'utf8');

  await t.test('1. Human Override Server Action & Audit Trail', () => {
    assert.ok(actionsContent.includes('export async function overrideNextBestAction'));
    assert.ok(actionsContent.includes('revenue_action.override'));
    assert.ok(actionsContent.includes('db.auditLog.create'));
    assert.ok(actionsContent.includes('Human Override (Replaced'));
    assert.ok(actionsContent.includes('cancellationReason'));
    assert.ok(actionsContent.includes('recommendedActor: \'HUMAN\''));
  });

  await t.test('2. Human Authority Protocol Override UI in AI Modal', () => {
    assert.ok(modalContent.includes('Human Authority'));
    assert.ok(modalContent.includes('overrideNextBestAction'));
    assert.ok(modalContent.includes('Override AI Action'));
    assert.ok(modalContent.includes('SCHEDULE_DEMO'));
    assert.ok(modalContent.includes('Override Justification (Auditable)'));
  });

  await t.test('3. DSS Workforce Bridge Alert for Overdue Leads', () => {
    assert.ok(leadsContent.includes('overdueCount'));
    assert.ok(leadsContent.includes('Request DSS Appointment Setter'));
    assert.ok(leadsContent.includes('href="/operator"'));
    assert.ok(leadsContent.includes('Stalled follow-ups lose over 70% conversion velocity'));
  });

  await t.test('4. Morning Revenue-at-Risk Cron Route', () => {
    assert.ok(cronContent.includes('verifyCronAuth'));
    assert.ok(cronContent.includes('db.revenueAction.findMany'));
    assert.ok(cronContent.includes('db.revenueLeak.create'));
    assert.ok(cronContent.includes('SLA_BREACHED'));
  });

  await t.test('5. Trial Expiry In-App Warning Banners in SaaS Layout', () => {
    assert.ok(layoutContent.includes('getOrCreateWorkspaceSubscription'));
    assert.ok(layoutContent.includes('Starter Trial Ending Soon:'));
    assert.ok(layoutContent.includes('Your 7-Day Free Trial Has Ended'));
    assert.ok(layoutContent.includes('href="/billing"'));
  });
});
