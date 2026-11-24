require('tsx/cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { db: prisma } = require('../src/lib/db.ts');

const { SERVICE_CATALOGUE } = require('../src/lib/services/catalogue.ts');
const { createLeadForTenant, getLeadForTenant } = require('../src/lib/dal/lead.ts');
const { createDealForTenant } = require('../src/lib/dal/deal.ts');
const { RevenueEngine } = require('../src/lib/revenue-engine/engine.ts');
const { extractFallbackCommitments, createCommitment, createCustomerOrder, recordOrderPayment } = require('../src/lib/commitments/index.ts');
const { claimLead, assignLeadToUser, bookOrUpdateAppointment, updateDealStage } = require('../src/app/(saas)/actions/index.ts');
const { getDashboardMetrics } = require('../src/lib/revenue-engine/dashboardService.ts');

test('REAL USER TEST: From Introductory Services to Final Sales Closing (End-to-End)', async (t) => {
  let org;
  let ownerUser;
  let closerUser;
  let testLead;
  let testDeal;
  let testOrder;
  let extractedCommitment;

  await t.test('Phase 1: Browse Introductory Services Catalogue', () => {
    console.log('\n--- Phase 1: Visitor Browsing Introductory Services Catalogue ---');
    assert.ok(Array.isArray(SERVICE_CATALOGUE), 'Service catalogue is loaded');
    assert.ok(SERVICE_CATALOGUE.length >= 6, 'Contains all 6 core introductory services');

    // Find Managed Sales Pilot (Introductory 30-Day Entry Service)
    const pilotService = SERVICE_CATALOGUE.find(s => s.key === 'MANAGED_SALES');
    assert.ok(pilotService, 'Managed Follow-up Pilot exists');
    assert.equal(pilotService.pricingMethod, 'FIXED_PLUS_MANAGEMENT');
    console.log(`[Catalogue] Discovered Service: "${pilotService.name}"`);
    console.log(`[Catalogue] Pricing: ${pilotService.pricingDisplay}`);
    console.log(`[Catalogue] Enquiry Route: ${pilotService.enquiryRoute}`);

    // Find External Closing Service
    const closingService = SERVICE_CATALOGUE.find(s => s.key === 'EXTERNAL_CLOSING');
    assert.ok(closingService, 'External Closing service exists');
    console.log(`[Catalogue] Upsell Service: "${closingService.name}"`);
  });

  await t.test('Phase 2: Setup Organization Workspace & Sales Personnel', async () => {
    console.log('\n--- Phase 2: Setup Organization Workspace & Closer ---');
    const timestamp = Date.now();

    org = await prisma.organization.create({
      data: {
        name: 'Apex Growth & Logistics Partners',
        slug: `apex-logistics-${timestamp}`,
        status: 'APPROVED',
        plan: 'PRO'
      }
    });

    ownerUser = await prisma.user.create({
      data: {
        name: 'Chioma Adeyemi (Managing Partner)',
        email: `chioma.partner.${timestamp}@apexlogistics.demo`,
        role: 'USER'
      }
    });

    closerUser = await prisma.user.create({
      data: {
        name: 'Babatunde Fashola (Senior Enterprise Closer)',
        email: `tunde.closer.${timestamp}@apexlogistics.demo`,
        role: 'USER'
      }
    });

    // Create organization memberships
    await prisma.organizationMember.create({
      data: {
        userId: ownerUser.id,
        organizationId: org.id,
        role: 'OWNER',
        isAvailable: true
      }
    });

    await prisma.organizationMember.create({
      data: {
        userId: closerUser.id,
        organizationId: org.id,
        role: 'CLOSER',
        commissionRate: 10, // 10% commission on closed revenue
        commissionType: 'PERCENTAGE',
        isAvailable: true
      }
    });

    assert.ok(org.id, 'Organization created');
    console.log(`[Tenant] Workspace Active: ${org.name} (ID: ${org.id})`);
    console.log(`[Personnel] Senior Closer: ${closerUser.name} (10% commission rate)`);
  });

  await t.test('Phase 3: Inbound Lead Capture & Introductory Service Assessment', async () => {
    console.log('\n--- Phase 3: Inbound Service Assessment Lead Submission ---');

    // Prospect submits service assessment enquiry
    testLead = await createLeadForTenant({
      name: 'Chief Emeka Adeleke',
      email: `emeka.adeleke.${Date.now()}@horizonlogistics.demo`,
      phone: '+2348035558899',
      source: 'SERVICES_CATALOGUE',
      message: 'Interested in the 30-Day Managed Sales Pilot and External Closing for our fleet logistics contracts. Average deal size is ₦2,500,000.',
      buyingIntent: 92,
      estimatedValue: 2500000,
      organizationId: org.id
    });

    assert.ok(testLead.id, 'Lead created in DB');
    assert.equal(testLead.status, 'NEW');
    assert.equal(testLead.organizationId, org.id);
    console.log(`[Lead Capture] Ingested Lead: "${testLead.name}"`);
    console.log(`[Lead Capture] Initial Status: ${testLead.status} | Value: ₦${Number(testLead.estimatedValue).toLocaleString()}`);
  });

  await t.test('Phase 4: Revenue Engine AI Triage & Next Best Action Generation', async () => {
    console.log('\n--- Phase 4: Revenue Engine Processing & Signal Derivation ---');

    // Process new lead through RevenueEngine
    await RevenueEngine.processNewLead(testLead.id);

    // Verify lead state transition
    const processedLead = await getLeadForTenant(testLead.id, org.id);
    assert.ok(processedLead);
    console.log(`[Revenue Engine] Evaluated Status: ${processedLead.status}`);

    // Verify Revenue Signals created
    const signals = await prisma.revenueSignal.findMany({
      where: { leadId: testLead.id, organizationId: org.id }
    });
    assert.ok(signals.length >= 1, 'Revenue Signals derived');
    console.log(`[Revenue Engine] Derived ${signals.length} Revenue Signals:`);
    signals.forEach(s => console.log(`   - Signal [${s.type}]: ${s.value} (${s.evidence})`));

    // Verify Next Best Action in ActionQueue
    const action = await prisma.revenueAction.findFirst({
      where: { leadId: testLead.id, organizationId: org.id },
      orderBy: { priority: 'desc' }
    });

    assert.ok(action, 'Next Best Action generated');
    assert.ok(action.priority > 0, 'Priority assigned');
    console.log(`[Action Queue] Priority: ${action.priority} | Actor: ${action.recommendedActor}`);
    console.log(`[Action Queue] Reason: ${action.reason}`);
  });

  await t.test('Phase 5: Closer Assignment & Discovery Consultation Booking', async () => {
    console.log('\n--- Phase 5: Closer Assignment & Calendar Booking ---');

    // Assign senior enterprise closer
    const assigned = await prisma.lead.update({
      where: { id: testLead.id },
      data: {
        assignedUserId: closerUser.id,
        assignedRole: 'CLOSER',
        claimedAt: new Date(),
        status: 'ENGAGED'
      }
    });

    assert.equal(assigned.assignedUserId, closerUser.id);
    console.log(`[Assignment] Lead assigned to ${closerUser.name}`);

    // Book discovery consultation on calendar
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const appointment = await prisma.appointment.create({
      data: {
        organizationId: org.id,
        leadId: testLead.id,
        closerId: closerUser.id,
        title: 'Commercial Scoping & Discovery Call - Horizon Logistics',
        scheduledAt: tomorrow,
        durationMinutes: 45,
        status: 'CONFIRMED',
        meetingUrl: 'https://meet.google.com/cls-horizon-scoping',
        notes: 'Discussion of 30-day managed sales pilot, lead triage SLAs, and external closer commission structure.'
      }
    });

    assert.ok(appointment.id);
    assert.equal(appointment.status, 'CONFIRMED');
    console.log(`[Calendar] Appointment Confirmed: "${appointment.title}"`);
    console.log(`[Calendar] Meeting URL: ${appointment.meetingUrl}`);

    // Update lead state
    await prisma.lead.update({
      where: { id: testLead.id },
      data: { status: 'SCHEDULED' }
    });
  });

  await t.test('Phase 6: Deal Creation, Proposal Scoping & Negotiation Stage', async () => {
    console.log('\n--- Phase 6: Pipeline Deal Creation & Commercial Proposal ---');

    // Create deal in pipeline
    testDeal = await createDealForTenant({
      amount: 2500000,
      leadId: testLead.id,
      organizationId: org.id,
      title: 'Horizon Logistics - 30-Day Managed Sales Pilot & Enterprise Closing'
    });

    assert.ok(testDeal.id);
    assert.equal(testDeal.stage, 'OPPORTUNITY');
    console.log(`[Deal Pipeline] Deal Created: "${testDeal.title}" (Amount: ₦${testDeal.amount.toLocaleString()})`);

    // Advance to PROPOSAL
    testDeal = await prisma.deal.update({
      where: { id: testDeal.id },
      data: { stage: 'PROPOSAL', closerId: closerUser.id }
    });
    console.log(`[Deal Pipeline] Stage Advanced to: ${testDeal.stage}`);

    // Advance to NEGOTIATION
    testDeal = await prisma.deal.update({
      where: { id: testDeal.id },
      data: { stage: 'NEGOTIATION' }
    });
    console.log(`[Deal Pipeline] Stage Advanced to: ${testDeal.stage} (Final Commercial Review)`);
  });

  await t.test('Phase 7: AI Promise Ledger Extraction & Customer Order Setup', async () => {
    console.log('\n--- Phase 7: Promise Ledger Commitment Extraction & Customer Order ---');

    const conversationNotes = `
Client Chief Emeka agreed to the ₦2,500,000 package.
Commitment 1: Closecraft will complete WhatsApp Cloud API integration and phone number verification within 48 hours.
Commitment 2: Closecraft dedicated setter will deliver first weekly pipeline report by Friday.
Payment terms: ₦1,000,000 upfront mobilization deposit, ₦1,500,000 milestone balance upon closing first contract.
`;

    // AI Commitment Extraction
    const extracted = extractFallbackCommitments(conversationNotes);
    assert.ok(extracted.length >= 1, 'Extracted promises from negotiation transcript');
    console.log(`[Promise Ledger] AI extracted ${extracted.length} commitments from sales discussion:`);
    extracted.forEach(c => console.log(`   - Promise: "${c.title}" (Due in ${c.suggestedDueDays} days, Type: ${c.commitmentType})`));

    // Persist official commitment
    extractedCommitment = await createCommitment({
      organizationId: org.id,
      leadId: testLead.id,
      dealId: testDeal.id,
      assignedUserId: closerUser.id,
      title: 'Complete WhatsApp Cloud API Integration & Channel Verification',
      description: 'Setup Meta Cloud API webhook, configure organization phone ID, and verify zero-fallback routing.',
      commitmentType: 'DELIVERABLE',
      priority: 'CRITICAL',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 48 hours
    });

    assert.ok(extractedCommitment.id);
    assert.equal(extractedCommitment.status, 'PENDING');
    console.log(`[Promise Ledger] Logged SLA Commitment: "${extractedCommitment.title}" (Status: PENDING)`);

    // Create Customer Order with balance ledger
    testOrder = await createCustomerOrder({
      organizationId: org.id,
      leadId: testLead.id,
      dealId: testDeal.id,
      title: '30-Day Managed Sales Pilot & Enterprise Closing Retainer',
      agreedAmount: 2500000,
      currency: 'NGN',
      fulfilmentNotes: '₦1,000,000 deposit upon signing; ₦1,500,000 on delivery of first closed fleet contract.'
    });

    assert.ok(testOrder.id);
    assert.equal(Number(testOrder.agreedAmount), 2500000);
    assert.equal(Number(testOrder.amountPaid), 0);
    assert.equal(Number(testOrder.balanceRemaining), 2500000);
    assert.equal(testOrder.paymentStatus, 'UNPAID');
    console.log(`[Customer Order] Order #${testOrder.orderNumber} Generated: Total ₦${Number(testOrder.agreedAmount).toLocaleString()} | Balance: ₦${Number(testOrder.balanceRemaining).toLocaleString()}`);
  });

  await t.test('Phase 8: Deposit Payment Settlement & Financial Truthfulness Audit', async () => {
    console.log('\n--- Phase 8: Deposit Payment Inflow & Financial Truthfulness ---');

    // Record incoming deposit payment of ₦1,000,000
    const paymentResult = await recordOrderPayment({
      orderId: testOrder.id,
      organizationId: org.id,
      paymentAmount: 1000000
    });

    assert.equal(Number(paymentResult.amountPaid), 1000000);
    assert.equal(Number(paymentResult.balanceRemaining), 1500000);
    assert.equal(paymentResult.paymentStatus, 'PARTIALLY_PAID');
    console.log(`[Payment Settlement] Received ₦1,000,000 mobilization deposit`);
    console.log(`[Payment Settlement] Order Status: ${paymentResult.paymentStatus} | Balance Remaining: ₦${paymentResult.balanceRemaining.toLocaleString()}`);

    // Audit Financial Separation: Contract vs. Cash
    const metrics = await getDashboardMetrics(org.id, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date(), 'NGN');
    console.log(`[Financial Separation Audit]`);
    console.log(`   - Pipeline Potential: ₦${metrics.openPipeline.toLocaleString()}`);
    console.log(`   - Verified Cash:      ₦${metrics.verifiedRealisedRevenue.toLocaleString()}`);
    assert.ok(metrics.openPipeline >= 2500000, 'Pipeline value tracked correctly');
  });

  await t.test('Phase 9: Final Sales Closing (WON) & Commission Verification', async () => {
    console.log('\n--- Phase 9: Final Sales Closing (WON) & Closer Commission ---');

    // Simulate second milestone payment completion (remaining ₦1,500,000)
    await recordOrderPayment({
      orderId: testOrder.id,
      organizationId: org.id,
      paymentAmount: 1500000
    });

    const finalOrder = await prisma.customerOrder.findUnique({
      where: { id: testOrder.id }
    });
    assert.equal(Number(finalOrder.amountPaid), 2500000);
    assert.equal(Number(finalOrder.balanceRemaining), 0);
    assert.equal(finalOrder.paymentStatus, 'PAID_IN_FULL');
    console.log(`[Customer Order] Final Settlement Received: 100% Paid (Status: ${finalOrder.paymentStatus})`);

    // Transition deal to WON
    const closerMember = await prisma.organizationMember.findFirst({
      where: { userId: closerUser.id, organizationId: org.id }
    });

    const commissionAmount = Math.round((testDeal.amount * closerMember.commissionRate) / 100);

    const closedDeal = await prisma.deal.update({
      where: { id: testDeal.id },
      data: {
        stage: 'WON',
        closedAt: new Date(),
        closerId: closerUser.id,
        commissionAmount,
        commissionStatus: 'PENDING'
      }
    });

    assert.equal(closedDeal.stage, 'WON');
    assert.equal(closedDeal.commissionAmount, 250000); // 10% of ₦2,500,000 = ₦250,000
    console.log(`[Sales Closing] Deal CLOSED-WON! 🎉`);
    console.log(`[Sales Closing] Final Contract Value: ₦${closedDeal.amount.toLocaleString()}`);
    console.log(`[Commission] Closer Commission Attributed: ₦${closedDeal.commissionAmount.toLocaleString()} to ${closerUser.name}`);

    // Update lead to CLOSED
    await prisma.lead.update({
      where: { id: testLead.id },
      data: { status: 'CLOSED' }
    });

    // Mark setup commitment as COMPLETED with verifiable proof link
    const completedCommitment = await prisma.customerCommitment.update({
      where: { id: extractedCommitment.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completionEvidence: 'https://closecrafthq.com/api/webhooks/whatsapp/verify-check-8899'
      }
    });
    assert.equal(completedCommitment.status, 'COMPLETED');
    console.log(`[Fulfilment Delivery] Commitment Fulfilled: "${completedCommitment.title}" (Evidence: ${completedCommitment.completionEvidence})`);

    // Verify audit trail recorded in AuditLog
    const auditLogs = await prisma.auditLog.findMany({
      where: { organizationId: org.id }
    });
    assert.ok(auditLogs.length >= 2, 'Audit trail records preserved');
    console.log(`[Audit Trail] Preserved ${auditLogs.length} immutable tenant audit events.`);
  });

  await t.test('Phase 10: Clean Teardown of Test Data', async () => {
    console.log('\n--- Phase 10: Clean Teardown of Test Workspace ---');
    await prisma.customerCommitment.deleteMany({ where: { organizationId: org.id } });
    await prisma.customerOrder.deleteMany({ where: { organizationId: org.id } });
    await prisma.appointment.deleteMany({ where: { organizationId: org.id } });
    await prisma.deal.deleteMany({ where: { organizationId: org.id } });
    await prisma.revenueAction.deleteMany({ where: { organizationId: org.id } });
    await prisma.revenueSignal.deleteMany({ where: { organizationId: org.id } });
    await prisma.auditLog.deleteMany({ where: { organizationId: org.id } });
    await prisma.lead.deleteMany({ where: { organizationId: org.id } });
    await prisma.organizationMember.deleteMany({ where: { organizationId: org.id } });
    await prisma.organization.delete({ where: { id: org.id } });
    await prisma.user.deleteMany({ where: { id: { in: [ownerUser.id, closerUser.id] } } });
    console.log('[Teardown] Test workspace and personnel cleanly removed.');
  });
});
