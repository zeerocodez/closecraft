const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Closecraft Email Notification Routing System Acceptance Tests', async (t) => {
  const routerPath = path.join(__dirname, '../src/lib/notifications/router.ts');
  const serviceRequestsApiPath = path.join(__dirname, '../src/app/api/services/requests/route.ts');
  const leadsApiPath = path.join(__dirname, '../src/app/api/leads/route.ts');
  const dssApplyApiPath = path.join(__dirname, '../src/app/api/dss/apply/route.ts');
  const dssEnquiryApiPath = path.join(__dirname, '../src/app/api/dss/enquiry/route.ts');
  const facebookWebhookPath = path.join(__dirname, '../src/app/api/webhooks/facebook/route.ts');

  const routerContent = fs.readFileSync(routerPath, 'utf8');
  const serviceRequestsApiContent = fs.readFileSync(serviceRequestsApiPath, 'utf8');
  const leadsApiContent = fs.readFileSync(leadsApiPath, 'utf8');
  const dssApplyApiContent = fs.readFileSync(dssApplyApiPath, 'utf8');
  const dssEnquiryApiContent = fs.readFileSync(dssEnquiryApiPath, 'utf8');
  const facebookWebhookContent = fs.readFileSync(facebookWebhookPath, 'utf8');

  await t.test('1. Router defines sales, dss, and info destination inboxes', () => {
    assert.ok(routerContent.includes('sales@closecrafthq.com'));
    assert.ok(routerContent.includes('info@closecrafthq.com'));
    assert.ok(routerContent.includes('dss@closecrafthq.com'));
  });

  await t.test('2. Sales routing maps Lead Gen, Managed Sales & Software', () => {
    assert.ok(routerContent.includes('case \'SALES\':'));
    assert.ok(routerContent.includes('primary: salesEmail'));
    assert.ok(routerContent.includes('infoEmail'));
  });

  await t.test('3. DSS routing maps Team Training & Admissions', () => {
    assert.ok(routerContent.includes('case \'DSS\':'));
    assert.ok(routerContent.includes('primary: dssEmail'));
    assert.ok(routerContent.includes('infoEmail'));
  });

  await t.test('4. Service Requests API integrates notification router', () => {
    assert.ok(serviceRequestsApiContent.includes('dispatchNotificationAlert'));
    assert.ok(serviceRequestsApiContent.includes('getCategoryForServiceType'));
  });

  await t.test('5. Leads API routes audit and demo leads to sales team', () => {
    assert.ok(leadsApiContent.includes('dispatchNotificationAlert'));
    assert.ok(leadsApiContent.includes("category: 'SALES'"));
  });

  await t.test('6. DSS Apply & Enquiry APIs route to dss@closecrafthq.com', () => {
    assert.ok(dssApplyApiContent.includes("category: 'DSS'"));
    assert.ok(dssEnquiryApiContent.includes("category: 'DSS'"));
  });

  await t.test('7. Meta Lead Ads Webhook routes to sales@closecrafthq.com', () => {
    assert.ok(facebookWebhookContent.includes("category: 'SALES'"));
  });
});
