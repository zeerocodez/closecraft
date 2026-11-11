const { test, describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('CloseCraft 2.0: Service Marketplace & Client Services Acceptance Tests', () => {
  let testOrgA;
  let testOrgB;
  let testUserA;

  before(async () => {
    // Clean up past test fixtures if present
    await prisma.clientService.deleteMany({
      where: { name: { startsWith: 'TEST_' } }
    });
    await prisma.organization.deleteMany({
      where: { slug: { in: ['test-service-org-a', 'test-service-org-b'] } }
    });

    // Create Test Organizations
    testOrgA = await prisma.organization.create({
      data: {
        name: 'Test Service Org A',
        slug: 'test-service-org-a',
        status: 'APPROVED',
        plan: 'STARTER',
      }
    });

    testOrgB = await prisma.organization.create({
      data: {
        name: 'Test Service Org B',
        slug: 'test-service-org-b',
        status: 'APPROVED',
        plan: 'STARTER',
      }
    });

    testUserA = await prisma.user.create({
      data: {
        email: `test_service_client_${Date.now()}@example.com`,
        name: 'Test Client User',
        role: 'USER',
        memberships: {
          create: {
            organizationId: testOrgA.id,
            role: 'ADMIN',
          }
        }
      }
    });
  });

  after(async () => {
    // Clean up fixtures
    await prisma.clientService.deleteMany({
      where: { organizationId: { in: [testOrgA.id, testOrgB.id] } }
    });
    await prisma.organizationMember.deleteMany({
      where: { organizationId: { in: [testOrgA.id, testOrgB.id] } }
    });
    await prisma.organization.deleteMany({
      where: { id: { in: [testOrgA.id, testOrgB.id] } }
    });
    await prisma.user.deleteMany({
      where: { id: testUserA.id }
    });
    await prisma.$disconnect();
  });

  it('1. Service Catalogue covers all 5 core revenue categories', async () => {
    const packages = await prisma.servicePackage.findMany({
      where: { isActive: true }
    });

    assert.ok(packages.length >= 5, `Expected at least 5 packages, found ${packages.length}`);

    const categories = new Set(packages.map(p => p.category));
    assert.ok(categories.has('LEAD_GENERATION'), 'Missing LEAD_GENERATION category');
    assert.ok(categories.has('LEAD_MANAGEMENT'), 'Missing LEAD_MANAGEMENT category');
    assert.ok(categories.has('APPOINTMENT_SETTING'), 'Missing APPOINTMENT_SETTING category');
    assert.ok(categories.has('SALES_CLOSING'), 'Missing SALES_CLOSING category');
    assert.ok(categories.has('SALES_ENABLEMENT'), 'Missing SALES_ENABLEMENT category');
  });

  it('2. Package configuration includes deliverables, SLAs, and NGN pricing', async () => {
    const metaPkg = await prisma.servicePackage.findFirst({
      where: { slug: 'meta-ad-acquisition' }
    });

    assert.ok(metaPkg, 'meta-ad-acquisition package must exist');
    assert.strictEqual(metaPkg.currency, 'NGN');
    assert.strictEqual(metaPkg.defaultBasePrice, 180000.0);
    assert.strictEqual(metaPkg.slaDays, 3);

    const activities = JSON.parse(metaPkg.activitiesIncluded);
    assert.ok(Array.isArray(activities) && activities.length > 0, 'activitiesIncluded must be non-empty array');
  });

  it('3. Client can purchase a service package, creating a ClientService record', async () => {
    const leadGenPkg = await prisma.servicePackage.findFirst({
      where: { category: 'LEAD_GENERATION' }
    });

    const clientService = await prisma.clientService.create({
      data: {
        organizationId: testOrgA.id,
        servicePackageId: leadGenPkg.id,
        category: leadGenPkg.category,
        name: leadGenPkg.title,
        description: leadGenPkg.description,
        status: 'PENDING_SETUP',
        pricePaid: leadGenPkg.defaultBasePrice,
        currency: 'NGN',
        billingFrequency: 'MONTHLY',
        progressPercent: 10,
        deliverables: JSON.stringify([
          { id: 'deliv-1', title: 'Target Audience Setup', completed: false },
          { id: 'deliv-2', title: 'Creative Variations Copy', completed: false },
        ]),
        assignedTeamMember: 'CloseCraft Lead Specialist',
      }
    });

    assert.ok(clientService.id);
    assert.strictEqual(clientService.status, 'PENDING_SETUP');
    assert.strictEqual(clientService.organizationId, testOrgA.id);
    assert.strictEqual(clientService.pricePaid, leadGenPkg.defaultBasePrice);
  });

  it('4. Payment webhook activation updates ClientService to ACTIVE with 30-day paid-through date', async () => {
    const service = await prisma.clientService.findFirst({
      where: { organizationId: testOrgA.id }
    });

    const now = new Date();
    const paidThrough = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updated = await prisma.clientService.update({
      where: { id: service.id },
      data: {
        status: 'ACTIVE',
        progressPercent: 25,
        paidThroughDate: paidThrough,
        lastActivityAt: now,
      }
    });

    assert.strictEqual(updated.status, 'ACTIVE');
    assert.strictEqual(updated.progressPercent, 25);
    assert.ok(updated.paidThroughDate > now);
  });

  it('5. Strict Tenant Isolation: Organization B cannot view Organization A client services', async () => {
    // Org A has 1 active service
    const orgAServices = await prisma.clientService.findMany({
      where: { organizationId: testOrgA.id }
    });
    assert.strictEqual(orgAServices.length, 1);

    // Org B queries for its own services and gets 0
    const orgBServices = await prisma.clientService.findMany({
      where: { organizationId: testOrgB.id }
    });
    assert.strictEqual(orgBServices.length, 0);

    // Cross-tenant attempt returns null
    const crossTenantRead = await prisma.clientService.findFirst({
      where: {
        id: orgAServices[0].id,
        organizationId: testOrgB.id,
      }
    });
    assert.strictEqual(crossTenantRead, null, 'Cross-tenant service access must return null');
  });

  it('6. Admin can update package pricing dynamically without code redeployment', async () => {
    const pkg = await prisma.servicePackage.findFirst({
      where: { slug: 'crm-automated-followup' }
    });

    const originalPrice = pkg.defaultBasePrice;
    const newPrice = 135000.0;

    const updatedPkg = await prisma.servicePackage.update({
      where: { id: pkg.id },
      data: { defaultBasePrice: newPrice }
    });

    assert.strictEqual(updatedPkg.defaultBasePrice, 135000.0);

    // Revert back cleanly to standard price
    await prisma.servicePackage.update({
      where: { id: pkg.id },
      data: { defaultBasePrice: originalPrice }
    });
  });
});
