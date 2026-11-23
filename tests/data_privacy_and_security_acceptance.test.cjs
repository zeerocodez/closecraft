const test = require('node:test');
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

test('Phase 5: Multi-Tenant Data Isolation & Privacy Rights Acceptance', async (t) => {
  let orgA;
  let orgB;
  let userA;
  let userB;
  let leadA;
  let commitmentA;

  await t.test('1. Setup Two Isolated Workspaces', async () => {
    orgA = await prisma.organization.create({
      data: {
        name: 'Alpha Bank Advisory',
        slug: `alpha-${Date.now()}`,
        status: 'APPROVED',
        plan: 'GROWTH'
      }
    });

    orgB = await prisma.organization.create({
      data: {
        name: 'Beta Motors Limited',
        slug: `beta-${Date.now()}`,
        status: 'APPROVED',
        plan: 'GROWTH'
      }
    });

    userA = await prisma.user.create({
      data: {
        email: `usera-${Date.now()}@alphabank.demo`,
        name: 'Alpha Representative',
        role: 'USER'
      }
    });

    userB = await prisma.user.create({
      data: {
        email: `userb-${Date.now()}@betamotors.demo`,
        name: 'Beta Sales Closer',
        role: 'USER'
      }
    });

    leadA = await prisma.lead.create({
      data: {
        organizationId: orgA.id,
        name: 'Confidential Client A',
        email: `clienta-${Date.now()}@secretcorp.demo`,
        phone: '+2348039991111',
        message: 'Strictly confidential acquisition enquiry.'
      }
    });

    commitmentA = await prisma.customerCommitment.create({
      data: {
        organizationId: orgA.id,
        leadId: leadA.id,
        title: 'Confidential Mergers & Acquisitions Audit Report',
        description: 'Prepare acquisition pricing proposal.',
        dueDate: new Date(Date.now() + 86400000),
        status: 'PENDING'
      }
    });

    assert.ok(orgA.id && orgB.id, 'Workspaces created');
  });

  await t.test('2. Strict Multi-Tenant Isolation: Cross-Tenant Queries Must Return Null', async () => {
    // Attempt to access Org A's commitment using Org B's identifier
    const crossTenantCommitment = await prisma.customerCommitment.findFirst({
      where: {
        id: commitmentA.id,
        organizationId: orgB.id // Tenant B's boundary
      }
    });
    assert.equal(crossTenantCommitment, null, 'Tenant B cannot read Tenant A commitment');

    // Attempt to access Org A's lead using Org B's identifier
    const crossTenantLead = await prisma.lead.findFirst({
      where: {
        id: leadA.id,
        organizationId: orgB.id
      }
    });
    assert.equal(crossTenantLead, null, 'Tenant B cannot read Tenant A lead record');
  });

  await t.test('3. Data Portability & Rights: Export Leads for Tenant A', async () => {
    const exportedLeads = await prisma.lead.findMany({
      where: { organizationId: orgA.id },
      include: { commitments: true }
    });

    assert.equal(exportedLeads.length, 1, 'Only Tenant A records returned in export');
    assert.equal(exportedLeads[0].name, 'Confidential Client A');
    assert.equal(exportedLeads[0].commitments.length, 1);
  });

  await t.test('4. Right-to-be-Forgotten: Erasure & Audit Trail', async () => {
    // Erase lead A in compliance with NDPA / GDPR
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          organizationId: orgA.id,
          actorId: userA.id,
          actorType: 'USER',
          action: 'DATA_SUBJECT_ERASURE_REQUEST',
          resourceType: 'Lead',
          resourceId: leadA.id,
          reason: 'NDPA Article 24 right-to-be-forgotten executed'
        }
      });

      await tx.lead.delete({
        where: { id: leadA.id }
      });
    });

    const deletedCheck = await prisma.lead.findUnique({
      where: { id: leadA.id }
    });
    assert.equal(deletedCheck, null, 'Personal data erased completely');

    // Verify auditable tombstone exists
    const auditRecord = await prisma.auditLog.findFirst({
      where: {
        organizationId: orgA.id,
        action: 'DATA_SUBJECT_ERASURE_REQUEST',
        resourceId: leadA.id
      }
    });
    assert.ok(auditRecord, 'Auditable compliance record preserved');
  });

  await t.test('5. Clean Teardown', async () => {
    await prisma.organization.deleteMany({
      where: { id: { in: [orgA.id, orgB.id] } }
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userA.id, userB.id] } }
    });
  });
});
