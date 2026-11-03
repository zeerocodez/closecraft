const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Operator Command Centre, Facebook Webhook & Email Verification Fallback Tests', async (t) => {
  const operatorDashboardPath = path.join(__dirname, '../src/components/operator/OperatorDashboardClient.tsx');
  const operatorActionsPath = path.join(__dirname, '../src/app/(saas)/operator/actions.ts');
  const operatorPagePath = path.join(__dirname, '../src/app/(saas)/operator/page.tsx');
  const verifyEmailPagePath = path.join(__dirname, '../src/app/(auth)/verify-email/page.tsx');
  const facebookWebhookPath = path.join(__dirname, '../src/app/api/webhooks/facebook/route.ts');
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

  const operatorDashboardContent = fs.readFileSync(operatorDashboardPath, 'utf8');
  const operatorActionsContent = fs.readFileSync(operatorActionsPath, 'utf8');
  const operatorPageContent = fs.readFileSync(operatorPagePath, 'utf8');
  const verifyEmailContent = fs.readFileSync(verifyEmailPagePath, 'utf8');
  const facebookWebhookContent = fs.readFileSync(facebookWebhookPath, 'utf8');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  await t.test('1. Prisma Schema Multi-Tenant Meta Fields', () => {
    assert.ok(schemaContent.includes('facebookPageId'));
    assert.ok(schemaContent.includes('metaAccessToken'));
    assert.ok(schemaContent.includes('campaignMetrics'));
    assert.ok(schemaContent.includes('model ServiceRequest'));
  });

  await t.test('2. Operator Page Fetches Service Requests', () => {
    assert.ok(operatorPageContent.includes('db.serviceRequest.findMany'));
    assert.ok(operatorPageContent.includes('serviceRequests'));
  });

  await t.test('3. Operator Dashboard Client Supports Service Requests Queue', () => {
    assert.ok(operatorDashboardContent.includes('serviceRequests = []'));
    assert.ok(operatorDashboardContent.includes('Service Requests Queue'));
    assert.ok(operatorDashboardContent.includes('srFilterType'));
    assert.ok(operatorDashboardContent.includes('srFilterStage'));
    assert.ok(operatorDashboardContent.includes('Inspect Brief'));
    assert.ok(operatorDashboardContent.includes('Update Stage'));
    assert.ok(operatorDashboardContent.includes('Convert to Pilot'));
  });

  await t.test('4. Operator Dashboard Client Supports Ad Campaign Metrics Management', () => {
    assert.ok(operatorDashboardContent.includes('Edit Ad Metrics'));
    assert.ok(operatorDashboardContent.includes('updateCampaignMetricsAction'));
    assert.ok(operatorDashboardContent.includes('Advertising Performance'));
    assert.ok(operatorDashboardContent.includes('Total Ad Spend'));
    assert.ok(operatorDashboardContent.includes('Raw Enquiries Generated'));
    assert.ok(operatorDashboardContent.includes('Qualified Enquiries'));
    assert.ok(operatorDashboardContent.includes('Estimated Cost / Enquiry'));
  });

  await t.test('5. Operator Server Actions Integrity', () => {
    assert.ok(operatorActionsContent.includes('export async function updateServiceRequestStageAction'));
    assert.ok(operatorActionsContent.includes('export async function updateCampaignMetricsAction'));
    assert.ok(operatorActionsContent.includes('export async function convertServiceRequestToPilotAction'));
    assert.ok(operatorActionsContent.includes('assertOperator'));
    assert.ok(operatorActionsContent.includes('revalidatePath(\'/operator\')'));
  });

  await t.test('6. Email Verification UX Fallback', () => {
    assert.ok(verifyEmailContent.includes('emailInput'));
    assert.ok(verifyEmailContent.includes('isChangingEmail'));
    assert.ok(verifyEmailContent.includes('Registered Work Email'));
    assert.ok(verifyEmailContent.includes('Change'));
    assert.ok(verifyEmailContent.includes('handleVerify'));
    assert.ok(verifyEmailContent.includes('handleResend'));
  });

  await t.test('7. Meta Lead Ads Webhook Multi-Tenant Resolution & DB Ingestion', () => {
    assert.ok(facebookWebhookContent.includes('fetchMetaLeadDetails'));
    assert.ok(facebookWebhookContent.includes('facebookPageId'));
    assert.ok(facebookWebhookContent.includes('db.organization.findFirst'));
    assert.ok(facebookWebhookContent.includes('db.lead.upsert'));
    assert.ok(facebookWebhookContent.includes('FACEBOOK_LEAD_AD'));
    assert.ok(facebookWebhookContent.includes('nextActionDueAt'));
    assert.ok(facebookWebhookContent.includes('revenue/lead.created'));
  });
});
