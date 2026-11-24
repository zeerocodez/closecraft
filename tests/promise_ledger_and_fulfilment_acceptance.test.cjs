require('tsx/cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const commitmentService = require('../src/lib/commitments/commitmentService.ts');
const orderService = require('../src/lib/commitments/orderService.ts');

test('Phase 4: Promise Ledger & Customer Fulfilment Tracking Acceptance', async (t) => {
  let testOrg;
  let testUser;
  let testLead;

  await t.test('1. Setup Workspace & Test Personnel', async () => {
    testOrg = await prisma.organization.create({
      data: {
        name: 'Prime Fulfilment Workspace',
        slug: `prime-fulfil-${Date.now()}`,
        status: 'APPROVED',
        plan: 'GROWTH'
      }
    });

    testUser = await prisma.user.create({
      data: {
        email: `rep-${Date.now()}@primefulfil.demo`,
        name: 'Emeka Closer',
        role: 'USER'
      }
    });

    testLead = await prisma.lead.create({
      data: {
        organizationId: testOrg.id,
        name: 'Barrister Nnamdi Kanu',
        email: `nnamdi-${Date.now()}@apexlaw.demo`,
        phone: '+2348035559988',
        status: 'OPPORTUNITY'
      }
    });

    assert.ok(testOrg.id);
    assert.ok(commitmentService.createCommitment);
    assert.ok(orderService.createCustomerOrder);
  });

  await t.test('2. AI Commitment Extraction from Sales Conversation', async () => {
    const transcript = `
Customer: "I want to deploy CloseCraft for my 5 sales agents. But I need the custom proposal sent by tomorrow, and you must apply the agreed 15% discount we talked about."
Sales Rep: "Understood Barrister! We will also have your technical onboarding call completed by next Tuesday."
`;

    const extracted = await commitmentService.extractCommitmentsFromText(transcript);
    assert.ok(Array.isArray(extracted), 'Extracted promises returned as array');
    assert.ok(extracted.length >= 2, 'Identified at least 2 distinct promises');

    const types = extracted.map(e => e.commitmentType);
    assert.ok(types.includes('PROPOSAL') || types.includes('DISCOUNT_AGREEMENT') || types.includes('SERVICE_ONBOARDING'), 'Extracted valid commitment types');
  });

  await t.test('3. Commitment Creation & Completion with Evidence', async () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);

    const commitment = await commitmentService.createCommitment({
      organizationId: testOrg.id,
      title: 'Deliver Custom Corporate Retainer Proposal',
      description: 'Send pro-forma scope and SLA contract for 5 seats.',
      commitmentType: 'PROPOSAL',
      dueDate,
      priority: 'HIGH',
      leadId: testLead.id,
      assignedUserId: testUser.id,
      userId: testUser.id
    });

    assert.ok(commitment.id, 'Commitment created');
    assert.equal(commitment.status, 'PENDING');
    assert.equal(commitment.isOverdue, false);

    // Complete commitment with verifiable evidence
    const completed = await commitmentService.completeCommitment({
      commitmentId: commitment.id,
      organizationId: testOrg.id,
      completionEvidence: 'Sent proposal PDF via email ref #DOC-8891 and confirmed receipt on WhatsApp.',
      userId: testUser.id
    });

    assert.equal(completed.status, 'COMPLETED');
    assert.ok(completed.completedAt, 'Completed timestamp set');
    assert.ok(completed.completionEvidence.includes('DOC-8891'), 'Evidence persisted');
  });

  await t.test('4. Overdue Commitment Scanner & Revenue Leak Escalation', async () => {
    // Create an overdue commitment (due yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const overdueCommitment = await commitmentService.createCommitment({
      organizationId: testOrg.id,
      title: 'Deliver Technical Webhook Integration',
      description: 'Setup WhatsApp Cloud API endpoints for Barrister Nnamdi.',
      commitmentType: 'DELIVERABLE',
      dueDate: yesterday,
      priority: 'CRITICAL',
      leadId: testLead.id,
      assignedUserId: testUser.id,
      userId: testUser.id
    });

    // Run scanner
    const scanResult = await commitmentService.scanAndEscalateOverdueCommitments(testOrg.id);
    assert.ok(scanResult.totalOverdue >= 1, 'Overdue commitment detected');

    // Verify RevenueLeak was spawned
    const leak = await prisma.revenueLeak.findFirst({
      where: {
        organizationId: testOrg.id,
        leadId: testLead.id,
        status: 'OPEN'
      }
    });

    assert.ok(leak, 'RevenueLeak spawned for overdue customer commitment');
    assert.equal(leak.type, 'SLA_BREACHED');
  });

  await t.test('5. Customer Order Creation & Incremental Payment Reconciliation', async () => {
    const order = await orderService.createCustomerOrder({
      organizationId: testOrg.id,
      title: 'Annual Enterprise Revenue Operations Retainer',
      agreedAmount: 1200000,
      amountPaid: 400000, // Initial 33% deposit
      currency: 'NGN',
      leadId: testLead.id,
      assignedUserId: testUser.id,
      userId: testUser.id
    });

    assert.ok(order.orderNumber.startsWith('ORD-'), 'Order number generated');
    assert.equal(Number(order.agreedAmount), 1200000);
    assert.equal(Number(order.amountPaid), 400000);
    assert.equal(Number(order.balanceRemaining), 800000);
    assert.equal(order.paymentStatus, 'PARTIALLY_PAID');

    // Verify automatically spawned onboarding commitment
    const attachedCommitment = await prisma.customerCommitment.findFirst({
      where: { orderId: order.id }
    });
    assert.ok(attachedCommitment, 'Fulfilment commitment automatically attached to order');

    // Record remaining balance payment
    const reconciledOrder = await orderService.recordOrderPayment({
      orderId: order.id,
      organizationId: testOrg.id,
      paymentAmount: 800000,
      userId: testUser.id
    });

    assert.equal(Number(reconciledOrder.amountPaid), 1200000);
    assert.equal(Number(reconciledOrder.balanceRemaining), 0);
    assert.equal(reconciledOrder.paymentStatus, 'PAID_IN_FULL');
  });

  await t.test('6. Clean Teardown', async () => {
    await prisma.organization.delete({
      where: { id: testOrg.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
  });
});
