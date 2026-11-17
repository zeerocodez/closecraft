const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('CloseCraft Growth Enhancements Phase 2 & 3: Day-0 Activation & Channel Health Monitor', async (t) => {
  const leadsClientPath = path.join(__dirname, '../src/app/(saas)/leads/LeadsTableClient.tsx');
  const pipelineClientPath = path.join(__dirname, '../src/app/(saas)/pipeline/PipelineClient.tsx');
  const settingsPagePath = path.join(__dirname, '../src/app/(saas)/settings/page.tsx');
  const actionsPath = path.join(__dirname, '../src/app/(saas)/actions.ts');

  assert.ok(fs.existsSync(leadsClientPath), 'LeadsTableClient.tsx must exist');
  assert.ok(fs.existsSync(pipelineClientPath), 'PipelineClient.tsx must exist');
  assert.ok(fs.existsSync(settingsPagePath), 'settings/page.tsx must exist');
  assert.ok(fs.existsSync(actionsPath), 'actions.ts must exist');

  const leadsContent = fs.readFileSync(leadsClientPath, 'utf8');
  const pipelineContent = fs.readFileSync(pipelineClientPath, 'utf8');
  const settingsContent = fs.readFileSync(settingsPagePath, 'utf8');
  const actionsContent = fs.readFileSync(actionsPath, 'utf8');

  await t.test('1. Server Actions Seed & Clear Operations', () => {
    assert.ok(actionsContent.includes('seedSampleWorkspaceAction'));
    assert.ok(actionsContent.includes('clearSampleWorkspaceAction'));
    assert.ok(actionsContent.includes('[DEMO_SEED]'));
    assert.ok(actionsContent.includes('db.deal.create'));
    assert.ok(actionsContent.includes('db.revenueSignal.createMany'));
    assert.ok(actionsContent.includes('db.revenueAction.create'));
  });

  await t.test('2. Leads Table Day-0 Activation & Demo Toggle', () => {
    assert.ok(leadsContent.includes('Your Lead Pipeline is Ready for Activation'));
    assert.ok(leadsContent.includes('Seed 3 Realistic Demo Leads'));
    assert.ok(leadsContent.includes('Demo Workspace Active:'));
    assert.ok(leadsContent.includes('Clear Demo Leads'));
    assert.ok(leadsContent.includes('seedSampleWorkspaceAction'));
    assert.ok(leadsContent.includes('clearSampleWorkspaceAction'));
  });

  await t.test('3. Pipeline Kanban Day-0 Activation & Demo Toggle', () => {
    assert.ok(pipelineContent.includes('Your Sales Pipeline is Ready'));
    assert.ok(pipelineContent.includes('Seed 3 Realistic Demo Deals'));
    assert.ok(pipelineContent.includes('Demo Pipeline Active:'));
    assert.ok(pipelineContent.includes('Clear Demo Deals'));
    assert.ok(pipelineContent.includes('seedSampleWorkspaceAction'));
    assert.ok(pipelineContent.includes('clearSampleWorkspaceAction'));
  });

  await t.test('4. WhatsApp Direct Quick Action in Leads', () => {
    assert.ok(leadsContent.includes('formatWhatsAppUrl'));
    assert.ok(leadsContent.includes('1-Click WhatsApp Follow-up'));
    assert.ok(leadsContent.includes('chat'));
  });

  await t.test('5. Ingestion Channel Health Monitor in Settings', () => {
    assert.ok(settingsContent.includes('Ingestion Channel Health Monitor'));
    assert.ok(settingsContent.includes('ALL SYSTEMS OPERATIONAL'));
    assert.ok(settingsContent.includes('Website Widget'));
    assert.ok(settingsContent.includes('Meta Lead Ads'));
    assert.ok(settingsContent.includes('WhatsApp Outreach'));
    assert.ok(settingsContent.includes('/api/webhooks/facebook'));
  });
});

