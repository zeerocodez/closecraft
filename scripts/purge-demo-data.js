/**
 * Production Database Purge Script
 * Removes all demo, test, and placeholder data from the database.
 * Preserves all real organizations, real users, and production configurations.
 */

const path = require('path');
const { PrismaClient } = require(path.join(process.cwd(), 'node_modules/@prisma/client'));
const prisma = new PrismaClient();

async function purgeDemoData() {
  console.log('🚀 Starting CloseCraft Production Database Purge...\n');

  // 1. Identify Demo & Test Leads
  const demoLeads = await prisma.lead.findMany({
    where: {
      OR: [
        { message: { contains: '[DEMO_SEED]' } },
        { message: { contains: '[Demo' } },
        { message: { contains: 'Manual lead entry' } },
        { message: { contains: 'Revenue Audit Request from zeerocodes' } },
        { email: { endsWith: '@example.com' } },
        { email: { contains: 'testcompany.com' } },
      ]
    },
    select: { id: true, name: true, email: true, organizationId: true }
  });

  console.log(`Found ${demoLeads.length} demo/test leads to purge:`);
  demoLeads.forEach(l => console.log(`  - [Lead] ${l.name} (${l.email}) in Org ${l.organizationId}`));

  const demoLeadIds = demoLeads.map(l => l.id);

  if (demoLeadIds.length > 0) {
    // Delete cascading child records explicitly if needed
    const deletedSignals = await prisma.revenueSignal.deleteMany({
      where: { leadId: { in: demoLeadIds } }
    });
    console.log(`✓ Deleted ${deletedSignals.count} associated revenue signals.`);

    const deletedActions = await prisma.revenueAction.deleteMany({
      where: { leadId: { in: demoLeadIds } }
    });
    console.log(`✓ Deleted ${deletedActions.count} associated revenue actions.`);

    const deletedLeaks = await prisma.revenueLeak.deleteMany({
      where: { leadId: { in: demoLeadIds } }
    });
    console.log(`✓ Deleted ${deletedLeaks.count} associated revenue leaks.`);

    const deletedDeals = await prisma.deal.deleteMany({
      where: { leadId: { in: demoLeadIds } }
    });
    console.log(`✓ Deleted ${deletedDeals.count} associated deals.`);

    const deletedAppts = await prisma.appointment.deleteMany({
      where: { leadId: { in: demoLeadIds } }
    });
    console.log(`✓ Deleted ${deletedAppts.count} associated appointments.`);

    const deletedMessages = await prisma.message.deleteMany({
      where: { conversation: { leadId: { in: demoLeadIds } } }
    });
    console.log(`✓ Deleted ${deletedMessages.count} associated conversation messages.`);

    const deletedConversations = await prisma.conversation.deleteMany({
      where: { leadId: { in: demoLeadIds } }
    });
    console.log(`✓ Deleted ${deletedConversations.count} associated conversations.`);

    const deletedAuditLogs = await prisma.auditLog.deleteMany({
      where: { resourceId: { in: demoLeadIds } }
    });
    console.log(`✓ Deleted ${deletedAuditLogs.count} associated audit logs.`);

    // Delete the leads themselves
    const deletedLeads = await prisma.lead.deleteMany({
      where: { id: { in: demoLeadIds } }
    });
    console.log(`✓ Purged ${deletedLeads.count} demo leads successfully.\n`);
  }

  // 2. Identify Test Organizations
  const testOrgs = await prisma.organization.findMany({
    where: {
      OR: [
        { id: { startsWith: 'test_' } },
        { slug: { startsWith: 'test_' } },
        { slug: { startsWith: 'onboarding-test-' } },
        { name: { contains: 'Alpha Agency' } },
        { name: { contains: 'Beta Consulting' } }
      ]
    },
    select: { id: true, name: true, slug: true }
  });

  console.log(`Found ${testOrgs.length} test organizations to purge:`);
  testOrgs.forEach(o => console.log(`  - [Org] ${o.name} (${o.slug}) ID: ${o.id}`));

  const testOrgIds = testOrgs.map(o => o.id);
  if (testOrgIds.length > 0) {
    // Delete test org child records
    await prisma.organizationMember.deleteMany({ where: { organizationId: { in: testOrgIds } } });
    await prisma.auditLog.deleteMany({ where: { organizationId: { in: testOrgIds } } });
    await prisma.workspaceSubscription.deleteMany({ where: { organizationId: { in: testOrgIds } } });
    await prisma.workspaceQualification.deleteMany({ where: { organizationId: { in: testOrgIds } } });
    const deletedOrgs = await prisma.organization.deleteMany({ where: { id: { in: testOrgIds } } });
    console.log(`✓ Purged ${deletedOrgs.count} test organizations successfully.\n`);
  }

  // 3. Identify Test Users (orphaned or test accounts)
  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'testcompany.com' } },
        { email: { contains: '@example.com' } },
        { email: { startsWith: 'usr_a_' } },
        { email: { startsWith: 'usr_b_' } },
      ]
    },
    select: { id: true, email: true, name: true }
  });

  console.log(`Found ${testUsers.length} test users to purge:`);
  testUsers.forEach(u => console.log(`  - [User] ${u.name || 'Unnamed'} (${u.email})`));

  const testUserIds = testUsers.map(u => u.id);
  if (testUserIds.length > 0) {
    await prisma.organizationMember.deleteMany({ where: { userId: { in: testUserIds } } });
    await prisma.auditLog.deleteMany({ where: { actorId: { in: testUserIds } } });
    const deletedUsers = await prisma.user.deleteMany({ where: { id: { in: testUserIds } } });
    console.log(`✓ Purged ${deletedUsers.count} test users successfully.\n`);
  }

  // 4. Identify Test Service Requests
  const testServiceRequests = await prisma.serviceRequest.findMany({
    where: {
      OR: [
        { contactEmail: { contains: 'example.com' } },
        { contactEmail: { contains: 'test' } }
      ]
    },
    select: { id: true, reference: true, contactEmail: true }
  });

  console.log(`Found ${testServiceRequests.length} test service requests to purge:`);
  testServiceRequests.forEach(r => console.log(`  - [ServiceRequest] ${r.reference} (${r.contactEmail})`));

  const testServiceRequestIds = testServiceRequests.map(r => r.id);
  if (testServiceRequestIds.length > 0) {
    const deletedSR = await prisma.serviceRequest.deleteMany({ where: { id: { in: testServiceRequestIds } } });
    console.log(`✓ Purged ${deletedSR.count} test service requests successfully.\n`);
  }

  // 5. Identify Test Webhook Events
  const testWebhookEvents = await prisma.webhookEvent.findMany({
    where: {
      OR: [
        { eventId: { startsWith: 'evt_sim_' } },
        { eventId: { startsWith: 'evt_test_' } }
      ]
    },
    select: { id: true, eventId: true }
  });

  console.log(`Found ${testWebhookEvents.length} test webhook events to purge:`);
  testWebhookEvents.forEach(w => console.log(`  - [WebhookEvent] ${w.eventId}`));

  const testWebhookEventIds = testWebhookEvents.map(w => w.id);
  if (testWebhookEventIds.length > 0) {
    const deletedWH = await prisma.webhookEvent.deleteMany({ where: { id: { in: testWebhookEventIds } } });
    console.log(`✓ Purged ${deletedWH.count} test webhook events successfully.\n`);
  }

  // 6. Verification of Clean Production State
  console.log('=== FINAL PRODUCTION DATABASE AUDIT ===');
  const remainingOrgs = await prisma.organization.findMany({
    select: { id: true, name: true, slug: true, status: true }
  });
  console.log(`Remaining Organizations (${remainingOrgs.length}):`);
  remainingOrgs.forEach(o => console.log(`  • ${o.name} (slug: ${o.slug}, status: ${o.status})`));

  const remainingUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  console.log(`\nRemaining Users (${remainingUsers.length}):`);
  remainingUsers.forEach(u => console.log(`  • ${u.name} (${u.email}, role: ${u.role})`));

  const remainingLeads = await prisma.lead.count();
  const remainingDeals = await prisma.deal.count();
  const remainingAppts = await prisma.appointment.count();
  const remainingActions = await prisma.revenueAction.count();
  const remainingLeaks = await prisma.revenueLeak.count();

  console.log(`\nRemaining CRM Counts:`);
  console.log(`  • Leads: ${remainingLeads}`);
  console.log(`  • Deals: ${remainingDeals}`);
  console.log(`  • Appointments: ${remainingAppts}`);
  console.log(`  • Revenue Actions: ${remainingActions}`);
  console.log(`  • Revenue Leaks: ${remainingLeaks}`);

  console.log('\n✅ Database is now 100% clean and ready for production!');
}

purgeDemoData()
  .catch((err) => {
    console.error('Purge error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

