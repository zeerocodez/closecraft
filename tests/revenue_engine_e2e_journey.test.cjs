require('tsx/cjs');
const test = require('node:test');
const assert = require('node:assert');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const { RevenueEngine } = require('../src/lib/revenue-engine/engine.ts');
const { getDashboardMetrics } = require('../src/lib/revenue-engine/dashboardService.ts');
const { sendWhatsAppMessage } = require('../src/lib/whatsapp.ts');

test('Phase 8: Complete End-to-End Revenue Engine Lifecycle Acceptance Test', async (t) => {
  const timestamp = Date.now();
  let org;
  let orgB;
  let closerUser;
  let testLead;
  let testDeal;
  let testAppointment;
  let testLeak;
  let testOpportunity;

  await t.test('1. Setup Multi-Tenant Workspaces and Sales Personnel', async () => {
    // 1. Primary Organization
    org = await db.organization.create({
      data: {
        name: `Apex Enterprise Solutions ${timestamp}`,
        slug: `apex-enterprise-${timestamp}`,
        status: 'APPROVED',
        leadRoutingMode: 'ROUND_ROBIN',
        qualificationPolicy: 'B2B Professional Services firms needing revenue recovery. Minimum retainer 1,500,000 NGN.',
        whatsappPhoneNumberId: `apex_wa_${timestamp}`,
        whatsappNumber: `+234810000${timestamp.toString().slice(-4)}`,
      },
    });

    // 2. Isolated Secondary Organization (to verify strict tenant isolation)
    orgB = await db.organization.create({
      data: {
        name: `Isolated Competitor Workspace ${timestamp}`,
        slug: `isolated-comp-${timestamp}`,
        status: 'APPROVED',
      },
    });

    // 3. Certified Closer Sales Rep
    closerUser = await db.user.create({
      data: {
        name: 'Olumide Fashola',
        email: `olumide.${timestamp}@apexenterprise.ng`,
        role: 'USER',
      },
    });

    await db.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: closerUser.id,
        role: 'CLOSER',
        isAvailable: true,
      },
    });

    assert.ok(org.id);
    assert.ok(orgB.id);
    assert.ok(closerUser.id);
  });

  const prospectPhone = `+234803333${timestamp.toString().slice(-4)}`;
  const prospectMessage =
    'We are an enterprise consulting practice losing high-value inbound enquiries. We need your revenue recovery system deployed immediately across our team within 14 days. Please schedule a demo. Stated budget is 3,500,000 NGN.';

  await t.test('2. Inbound Lead Capture & Tenant Isolation', async () => {
    testLead = await db.lead.create({
      data: {
        organizationId: org.id,
        type: 'SALES_LEAD',
        name: 'Engr. Babatunde Balogun',
        email: `babatunde.${timestamp}@balogunconsulting.ng`,
        phone: prospectPhone,
        message: prospectMessage,
        source: 'WHATSAPP',
        status: 'NEW',
        currency: 'NGN',
        estimatedValue: 3500000,
        nextAction: 'Inbound evaluation required',
      },
    });

    assert.ok(testLead.id);
    assert.strictEqual(testLead.organizationId, org.id);

    // Multi-tenant isolation verification: Org B has zero leads
    const leadsInB = await db.lead.count({ where: { organizationId: orgB.id } });
    assert.strictEqual(leadsInB, 0, 'Tenant isolation violation: Org B must not see lead');
  });

  await t.test('3. Structured AI Qualification & Revenue Signal Generation', async () => {
    // Process lead through canonical Revenue Engine
    await RevenueEngine.processNewLead(testLead.id);

    // Fetch refreshed lead with signals and relations
    const qualifiedLead = await db.lead.findUnique({
      where: { id: testLead.id },
      include: {
        revenueSignals: true,
        qualificationData: true,
        deals: true,
        conversations: { include: { messages: true } },
      },
    });

    assert.ok(qualifiedLead);

    // Assert standardized signals created
    const signals = qualifiedLead.revenueSignals;
    assert.ok(signals.length >= 3, `Expected at least 3 revenue signals, found ${signals.length}`);

    const intentSignal = signals.find((s) => s.type === 'INTENT');
    const fitSignal = signals.find((s) => s.type === 'FIT');
    const urgencySignal = signals.find((s) => s.type === 'URGENCY');

    assert.ok(intentSignal, 'Must generate INTENT signal');
    assert.ok(intentSignal.value >= 70, 'High-intent enquiry must have intentScore >= 70');
    assert.ok(intentSignal.evidence, 'Intent signal must include verifiable evidence');

    assert.ok(fitSignal, 'Must generate FIT signal');
    assert.ok(urgencySignal, 'Must generate URGENCY signal');

    // Assert BANT qualification data persisted
    assert.ok(qualifiedLead.qualificationData, 'Qualification data must be stored');
    assert.ok(
      qualifiedLead.qualificationData.budget && qualifiedLead.qualificationData.budget.includes('3,500,000'),
      'Budget must capture prospect stated 3,500,000'
    );

    // Retrieve and assert Pipeline Opportunity Deal created automatically
    testDeal = await db.deal.findFirst({
      where: { leadId: testLead.id },
    });
    assert.ok(testDeal, 'Pipeline deal must be automatically initialized');
    assert.strictEqual(testDeal.stage, 'OPPORTUNITY');
    assert.strictEqual(testDeal.organizationId, org.id);
    assert.strictEqual(testDeal.amount, 3500000);

    // Assert Triage Conversation created for Inbox
    const conv = await db.conversation.findFirst({
      where: { leadId: testLead.id },
      include: { messages: true },
    });
    assert.ok(conv, 'Inbox conversation must exist');
    assert.strictEqual(conv.organizationId, org.id);
  });

  await t.test('4. Next Best Action & Fair Sales Rep Assignment', async () => {
    // Check Next Best Action in RevenueAction table
    const pendingActions = await db.revenueAction.findMany({
      where: { leadId: testLead.id, status: 'PENDING' },
    });
    assert.ok(pendingActions.length > 0, 'Must have active Next Best Action');

    const primaryAction = pendingActions[0];
    assert.ok(
      ['SCHEDULE_DISCOVERY', 'CALL_URGENT', 'RESPOND', 'SEND_BOOKING_LINK', 'ASSIGN_HUMAN'].includes(
        primaryAction.type
      ),
      `Unexpected action type: ${primaryAction.type}`
    );
    assert.ok(primaryAction.reason, 'Action must be explainable with clear reason');
    assert.ok(primaryAction.priority >= 50, 'Action priority must be >= 50');

    // Check sales rep assignment
    const assignedLead = await db.lead.findUnique({
      where: { id: testLead.id },
    });
    assert.strictEqual(assignedLead.assignedUserId, closerUser.id, 'Must assign lead to Closer');
    assert.strictEqual(assignedLead.assignedRole, 'CLOSER');
    assert.ok(assignedLead.claimedAt, 'Claimed timestamp must be recorded');

    // Verify audit log entry
    const auditLogs = await db.auditLog.findMany({
      where: { leadId: testLead.id, action: 'REVENUE_ENGINE_PROCESSED_LEAD' },
    });
    assert.ok(auditLogs.length > 0, 'Revenue Engine evaluation must be recorded in AuditLog');
  });

  await t.test('5. Appointment Creation & Action State Transition', async () => {
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

    testAppointment = await db.appointment.create({
      data: {
        organizationId: org.id,
        leadId: testLead.id,
        closerId: closerUser.id,
        scheduledAt: scheduledTime,
        status: 'SCHEDULED',
        meetingUrl: 'https://meet.google.com/closecraft-apex-demo',
        notes: 'Executive Discovery Call on Revenue Recovery implementation',
      },
    });

    // Notify Revenue Engine of scheduled appointment
    await RevenueEngine.processAppointmentScheduled(testAppointment.id);

    // Assert lead status progressed to SCHEDULED
    const updatedLead = await db.lead.findUnique({ where: { id: testLead.id } });
    assert.strictEqual(updatedLead.status, 'SCHEDULED');

    // Assert post-meeting action queued for human closer
    const postMeetingAction = await db.revenueAction.findFirst({
      where: { leadId: testLead.id, type: 'SEND_PROPOSAL', status: 'PENDING' },
    });
    assert.ok(postMeetingAction, 'Must queue post-meeting proposal action');
    assert.strictEqual(postMeetingAction.recommendedActor, 'HUMAN');
  });

  await t.test('6. Follow-up Message Dispatch with Pilot Mode Protection', async () => {
    // Dispatch outbound confirmation WhatsApp message in pilot mode
    const dispatchResult = await sendWhatsAppMessage({
      recipientPhone: prospectPhone,
      text: 'Good day Engr. Balogun, your executive discovery session with Olumide is confirmed for tomorrow.',
      organizationId: org.id,
      leadId: testLead.id,
      allowOutsideServiceWindow: true,
    });

    assert.strictEqual(dispatchResult.success, true);
    assert.strictEqual(dispatchResult.deliveryStatus, 'DRY_RUN_LOGGED', 'Pilot mode must record DRY_RUN_LOGGED');
    assert.ok(dispatchResult.messageId);

    // Confirm message stored in conversation
    const savedMsg = await db.message.findFirst({
      where: { providerMessageId: dispatchResult.messageId },
    });
    assert.ok(savedMsg, 'Message record must exist');
    assert.strictEqual(savedMsg.status, 'DRY_RUN_LOGGED');
  });

  await t.test('7. Revenue Leakage Detection & Stalled Deal Alert', async () => {
    // Simulate a stalled deal or SLA breach by creating an open RevenueLeak
    testLeak = await db.revenueLeak.create({
      data: {
        organizationId: org.id,
        leadId: testLead.id,
        type: 'STALLED_OPPORTUNITY',
        severity: 'HIGH',
        status: 'OPEN',
        description: 'Proposal sent 14 days ago with zero sales follow-up activity.',
      },
    });

    // Verify leakage detection via getDashboardMetrics
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const metricsWithLeak = await getDashboardMetrics(org.id, startDate, endDate, 'NGN');
    assert.strictEqual(metricsWithLeak.openLeaks, 1, 'Must report 1 open leak');
    assert.strictEqual(
      metricsWithLeak.revenueAtRisk,
      3500000,
      'Revenue at risk must accurately reflect stalled deal value'
    );
  });

  await t.test('8. Closed-Won Settlement & Financial Separation of Contract vs Verified Cash', async () => {
    // 1. Mark deal WON (Contract Value)
    await db.deal.update({
      where: { id: testDeal.id },
      data: {
        stage: 'WON',
        amount: 3500000,
        closedAt: new Date(),
      },
    });

    // 2. Resolve the revenue leak
    await db.revenueLeak.update({
      where: { id: testLeak.id },
      data: {
        status: 'RESOLVED',
      },
    });

    // 3. Record Verified Collections on Opportunity
    testOpportunity = await db.opportunity.create({
      data: {
        organizationId: org.id,
        leadId: testLead.id,
        title: 'Apex Revenue Recovery Engagement',
        stage: 'WON',
        systemCategory: 'WON',
        bookedAmount: 3500000,
        verifiedCollections: 3500000,
        currency: 'NGN',
      },
    });

    // 4. Query Dashboard Metrics and Verify Categories
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const finalMetrics = await getDashboardMetrics(org.id, startDate, endDate, 'NGN');

    // Assert strictly categorized financial values
    assert.strictEqual(
      finalMetrics.closedWonContractValue,
      3500000,
      'Contract value must record signed 3,500,000 NGN deal'
    );
    assert.strictEqual(
      finalMetrics.verifiedRealisedRevenue,
      3500000,
      'Verified realised revenue must equal verified paid invoice of 3,500,000 NGN'
    );
    assert.strictEqual(
      finalMetrics.revenueRecovered,
      3500000,
      'Revenue recovered must reflect deal won from previously leaked opportunity'
    );
    assert.strictEqual(
      finalMetrics.revenueAtRisk,
      0,
      'Revenue at risk must return to 0 once leak is resolved and deal is won'
    );
  });

  await t.test('9. Clean Teardown of Test Records', async () => {
    if (testOpportunity) {
      await db.opportunity.delete({ where: { id: testOpportunity.id } }).catch(() => null);
    }
    if (testLeak) {
      await db.revenueLeak.delete({ where: { id: testLeak.id } }).catch(() => null);
    }
    if (testAppointment) {
      await db.appointment.delete({ where: { id: testAppointment.id } }).catch(() => null);
    }
    if (testDeal) {
      await db.deal.delete({ where: { id: testDeal.id } }).catch(() => null);
    }
    if (testLead) {
      await db.message.deleteMany({
        where: { conversation: { leadId: testLead.id } },
      }).catch(() => null);
      await db.conversation.deleteMany({
        where: { leadId: testLead.id },
      }).catch(() => null);
      await db.revenueAction.deleteMany({
        where: { leadId: testLead.id },
      }).catch(() => null);
      await db.revenueSignal.deleteMany({
        where: { leadId: testLead.id },
      }).catch(() => null);
      await db.qualificationData.deleteMany({
        where: { leadId: testLead.id },
      }).catch(() => null);
      await db.auditLog.deleteMany({
        where: { leadId: testLead.id },
      }).catch(() => null);
      await db.lead.delete({ where: { id: testLead.id } }).catch(() => null);
    }
    await db.organizationMember.deleteMany({
      where: { organizationId: { in: [org.id, orgB.id] } },
    }).catch(() => null);
    if (closerUser) {
      await db.user.delete({ where: { id: closerUser.id } }).catch(() => null);
    }
    await db.organization.deleteMany({
      where: { id: { in: [org.id, orgB.id] } },
    }).catch(() => null);

    await db.$disconnect();
  });
});
