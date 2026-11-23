require('tsx/cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const importService = require('../src/lib/recovery/importService.ts');
const intelligenceService = require('../src/lib/recovery/intelligenceService.ts');
const segmentationService = require('../src/lib/recovery/segmentationService.ts');
const campaignService = require('../src/lib/recovery/campaignService.ts');

test('Phase 3: AI Revenue Recovery Hub & Reactivation Acceptance', async (t) => {
  let testOrg;
  let testUser;

  await t.test('1. Setup Test Organization and Import Services', async () => {
    testOrg = await prisma.organization.create({
      data: {
        name: 'Acme Recovery Enterprise',
        slug: `acme-recov-${Date.now()}`,
        status: 'APPROVED',
        plan: 'GROWTH'
      }
    });

    testUser = await prisma.user.create({
      data: {
        email: `ops.lead-${Date.now()}@acmerecovery.demo`,
        name: 'Tola Adeleke',
        role: 'USER'
      }
    });

    assert.ok(testOrg.id, 'Test organization created');
    assert.ok(importService.normalizePhoneNumber, 'importService loaded');
  });

  await t.test('2. Phone Normalization & WhatsApp Chat Export Parsing', () => {
    // Nigerian local 11-digit
    assert.equal(importService.normalizePhoneNumber('08032194481'), '+2348032194481');
    assert.equal(importService.normalizePhoneNumber('0812 455 9902'), '+2348124559902');
    // US & UK international formats
    assert.equal(importService.normalizePhoneNumber('+1 (212) 555-1234'), '+12125551234');
    assert.equal(importService.normalizePhoneNumber('+44 7911 123456'), '+447911123456');

    // WhatsApp chat parsing
    const chatSnippet = `
[12/04/2025, 09:15] +234 803 219 4481: Hello, we discussed the consulting proposal last month.
[12/04/2025, 09:16] Representative: Hi Chief! Yes, did you review the scope document?
[12/04/2025, 09:20] +234 803 219 4481: Yes, our board wants a 10% discount on the onboarding fee.
`;
    const parsedChat = importService.parseWhatsAppChatExport(chatSnippet);
    assert.ok(parsedChat.phone.includes('2348032194481'), 'Extracted and normalized phone');
    assert.ok(parsedChat.messageHistory.includes('discount'), 'Extracted message history');
  });

  await t.test('3. Bulk Lead Ingestion, Deduplication & AI Intelligence', async () => {
    const rawBatch = [
      {
        name: 'Chief Obinna Kalu',
        email: 'obinna.kalu@kalulogistics.demo',
        phone: '0803 111 2233',
        company: 'Kalu Logistics',
        message: 'Interested in fleet tracking ERP. Stalled due to budget constraints.',
        buyingIntent: 85,
        productInterest: 'Fleet Tracking ERP'
      },
      {
        name: 'Chief Obinna Kalu (Duplicate)',
        email: 'obinna.kalu@kalulogistics.demo', // Duplicate email
        phone: '0803 111 2233',
        company: 'Kalu Logistics'
      },
      {
        name: 'Halima Sadiq',
        email: 'halima@saharamedia.demo',
        phone: '0814 555 7788',
        company: 'Sahara Media',
        message: 'Proposal was sent in Q1 but stalled during contract signing.',
        buyingIntent: 78,
        productInterest: 'Social Lead Ingestion'
      }
    ];

    const importResult = await importService.executeLeadRecoveryImport({
      organizationId: testOrg.id,
      userId: testUser.id,
      fileName: 'historical_q1_leads.csv',
      format: 'CSV',
      leads: rawBatch
    });

    assert.equal(importResult.totalRows, 3, 'Total rows tracked');
    assert.equal(importResult.importedCount, 2, '2 unique leads imported');
    assert.equal(importResult.duplicateCount, 1, '1 duplicate detected and prevented');

    // Verify batch record in DB
    const batchRecord = await prisma.leadImportBatch.findUnique({
      where: { id: importResult.batchId }
    });
    assert.equal(batchRecord.status, 'COMPLETED');
    assert.equal(batchRecord.importedCount, 2);

    // Verify Intelligence record created for imported lead
    const lead = await prisma.lead.findFirst({
      where: { organizationId: testOrg.id, email: 'obinna.kalu@kalulogistics.demo' },
      include: { intelligence: true }
    });

    assert.ok(lead, 'Lead inserted');
    assert.ok(lead.intelligence, 'AI LeadIntelligence generated');
    assert.ok(lead.intelligence.productInterest, 'Product interest recorded');
  });

  await t.test('4. Intelligent Segmentation Summaries', async () => {
    const segments = await segmentationService.getOrganizationSegmentSummaries(testOrg.id);
    assert.ok(Array.isArray(segments), 'Returns array of segment summaries');
    assert.equal(segments.length, 6, 'Contains 6 standard segments');

    const totalLeads = segments.reduce((sum, s) => sum + s.leadCount, 0);
    assert.ok(totalLeads >= 2, 'Categorized ingested leads into segments');
  });

  await t.test('5. Reactivation Campaign Builder & Safe Dispatch', async () => {
    const campaign = await campaignService.createReactivationCampaign({
      organizationId: testOrg.id,
      userId: testUser.id,
      name: 'Q4 Budget Follow-up Wave',
      targetSegment: 'ALL',
      channel: 'WHATSAPP',
      tone: 'VALUE_OFFER'
    });

    assert.ok(campaign.campaignId, 'Campaign created');
    assert.equal(campaign.status, 'DRAFT');

    // Dispatch campaign (should run in safe Pilot Dry-run mode)
    const dispatchResult = await campaignService.dispatchReactivationCampaign(
      campaign.campaignId,
      testOrg.id,
      testUser.id
    );

    assert.equal(dispatchResult.success, true);
    assert.ok(dispatchResult.dispatchedCount >= 1, 'Messages dispatched');
    assert.equal(dispatchResult.pilotMode, true, 'Pilot Dry-Run guard verified');

    // Verify message record in DB has DRY_RUN_LOGGED status
    const messageRecord = await prisma.reactivationMessage.findFirst({
      where: { campaignId: campaign.campaignId }
    });
    assert.ok(messageRecord);
    assert.equal(messageRecord.status, 'DRY_RUN_LOGGED');
  });

  await t.test('6. Inbound Recovery Response Handling & Marketing Opt-Out', async () => {
    const lead = await prisma.lead.findFirst({
      where: { organizationId: testOrg.id, email: 'halima@saharamedia.demo' }
    });

    // Case A: Positive Response -> Spawns Next Best Action
    const positiveResponse = await campaignService.processInboundRecoveryResponse({
      organizationId: testOrg.id,
      leadId: lead.id,
      messageText: "Yes, we are still interested! Please send over your updated pricing."
    });

    assert.equal(positiveResponse.outcome, 'WANTS_PRICING');
    assert.equal(positiveResponse.actionScheduled, true);

    const action = await prisma.revenueAction.findFirst({
      where: { leadId: lead.id, organizationId: testOrg.id },
      orderBy: { createdAt: 'desc' }
    });
    assert.ok(action, 'High-priority RevenueAction spawned for closer');
    assert.equal(action.priority, 95);

    // Case B: Opt-out Response -> Suppressed immediately
    const optOutResponse = await campaignService.processInboundRecoveryResponse({
      organizationId: testOrg.id,
      leadId: lead.id,
      messageText: "STOP"
    });

    assert.equal(optOutResponse.outcome, 'OPTED_OUT');

    const updatedLead = await prisma.lead.findUnique({
      where: { id: lead.id },
      select: { optedOutOfMarketing: true, optedOutAt: true }
    });
    assert.equal(updatedLead.optedOutOfMarketing, true, 'Marketing suppression enforced');
    assert.ok(updatedLead.optedOutAt, 'Opt-out timestamp recorded');
  });

  await t.test('7. Teardown Test Data', async () => {
    await prisma.organization.delete({
      where: { id: testOrg.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
  });
});
