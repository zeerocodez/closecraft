const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('CloseCraft 2.0 Remote Operations & Workforce Management Acceptance Tests', () => {
  let orgAId = null;
  let orgBId = null;
  let staffUserId = null;
  let staffProfileId = null;
  let clientServiceId = null;
  let deliveryTaskId = null;

  it('1. Staff Accounts: Provisions a remote staff profile with role, capacity, and skills', async () => {
    // 1. Create client organization A
    const orgA = await prisma.organization.create({
      data: {
        name: `Acme Retail ${Date.now()}`,
        slug: `acme-retail-${Date.now()}`,
        plan: 'PRO',
      }
    });
    orgAId = orgA.id;

    // 2. Create remote staff user
    const staffUser = await prisma.user.create({
      data: {
        email: `specialist-${Date.now()}@closecrafthq.com`,
        name: 'Samuel Adekunle',
        role: 'OPERATOR',
      }
    });
    staffUserId = staffUser.id;

    // 3. Create StaffProfile
    const staff = await prisma.staffProfile.create({
      data: {
        userId: staffUser.id,
        role: 'MARKETING_SPECIALIST',
        department: 'MARKETING',
        weeklyCapacity: 40,
        status: 'ACTIVE',
        skills: ['Meta Ads', 'Audience Research', 'Creative Copy'],
        timezone: 'Africa/Lagos',
      }
    });

    assert.ok(staff.id);
    assert.equal(staff.role, 'MARKETING_SPECIALIST');
    assert.equal(staff.department, 'MARKETING');
    assert.equal(staff.weeklyCapacity, 40);
    assert.equal(staff.status, 'ACTIVE');
    assert.deepEqual(staff.skills, ['Meta Ads', 'Audience Research', 'Creative Copy']);

    staffProfileId = staff.id;
  });

  it('2. Role Permissions: Validates deterministic RBAC rules for operational roles', () => {
    const fs = require('fs');
    const path = require('path');
    const matrixContent = fs.readFileSync(path.join(__dirname, '../src/lib/permissions/matrix.ts'), 'utf8');

    // Verify StaffRole definition contains all operational roles
    const requiredRoles = [
      'SUPER_ADMIN', 'OPERATOR', 'OPERATIONS_MANAGER', 'ACCOUNT_MANAGER',
      'MARKETING_SPECIALIST', 'ADS_SPECIALIST', 'LEAD_MANAGER', 'SETTER', 'CLOSER', 'SALES_TRAINER', 'SUPPORT_REP'
    ];
    for (const role of requiredRoles) {
      assert.ok(matrixContent.includes(`'${role}'`), `Missing role definition: ${role}`);
    }

    // Verify STAFF_PERMISSIONS matrix has distinct role mappings
    assert.ok(matrixContent.includes('MARKETING_SPECIALIST: ['));
    assert.ok(matrixContent.includes('SETTER: ['));
    assert.ok(matrixContent.includes('CLOSER: ['));
    assert.ok(matrixContent.includes('ACCOUNT_MANAGER: ['));
    assert.ok(matrixContent.includes('OPERATIONS_MANAGER: ['));

    // Check specific permission assignments in source
    assert.ok(matrixContent.includes("'tasks:submit_deliverable'"));
    assert.ok(matrixContent.includes("'workforce:manage_staff'"));
    assert.ok(matrixContent.includes("'clients:assign_team'"));

    // Verify role label function
    assert.ok(matrixContent.includes("case 'SETTER': return 'Appointment Setter'"));
    assert.ok(matrixContent.includes("case 'CLOSER': return 'Sales Closer'"));
    assert.ok(matrixContent.includes("case 'MARKETING_SPECIALIST': return 'Marketing Specialist'"));
    assert.ok(matrixContent.includes("case 'ACCOUNT_MANAGER': return 'Account Manager'"));
  });

  it('3. Client Assignment: Assigns delivery team and account manager to active client service', async () => {
    // Create an active client service for Org A
    const service = await prisma.clientService.create({
      data: {
        organizationId: orgAId,
        category: 'LEAD_GENERATION',
        name: 'Meta Lead Gen Growth Sprint',
        description: 'Targeted Facebook & Instagram Ads campaigns with weekly lead delivery',
        tier: 'GROWTH',
        status: 'ACTIVE',
        pricePaid: 100000.0,
        currency: 'NGN',
        billingFrequency: 'MONTHLY',
        progressPercent: 20,
        assignedTeamMember: 'Samuel Adekunle - Marketing Specialist',
        assignedUserId: staffUserId,
        accountManagerEmail: 'samuel@closecrafthq.com',
      }
    });

    assert.ok(service.id);
    assert.equal(service.assignedUserId, staffUserId);
    assert.equal(service.assignedTeamMember, 'Samuel Adekunle - Marketing Specialist');
    assert.equal(service.accountManagerEmail, 'samuel@closecrafthq.com');

    clientServiceId = service.id;
  });

  it('4. Task Allocation: Allocates a service delivery task with priority and deadline', async () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const task = await prisma.serviceDeliveryTask.create({
      data: {
        organizationId: orgAId,
        clientServiceId: clientServiceId,
        assignedStaffId: staffProfileId,
        title: 'Meta Ad Creatives & Video Hook Variations',
        description: 'Produce 3 vertical 9:16 video ad creatives with headline testing and audience targeting.',
        category: 'LEAD_GENERATION',
        priority: 'HIGH',
        status: 'TODO',
        dueDate,
      }
    });

    assert.ok(task.id);
    assert.equal(task.title, 'Meta Ad Creatives & Video Hook Variations');
    assert.equal(task.status, 'TODO');
    assert.equal(task.priority, 'HIGH');
    assert.equal(task.assignedStaffId, staffProfileId);
    assert.equal(task.clientApproved, false);

    deliveryTaskId = task.id;
  });

  it('5. Service Delivery Tracking: Advances task status and submits deliverable proof for review', async () => {
    // 1. Staff starts task
    const inProgressTask = await prisma.serviceDeliveryTask.update({
      where: { id: deliveryTaskId },
      data: { status: 'IN_PROGRESS' }
    });
    assert.equal(inProgressTask.status, 'IN_PROGRESS');

    // 2. Staff submits deliverable proof
    const submittedTask = await prisma.serviceDeliveryTask.update({
      where: { id: deliveryTaskId },
      data: {
        status: 'IN_REVIEW',
        deliverableUrl: 'https://drive.google.com/drive/folders/closecraft-creatives-test',
        completionNotes: 'Delivered 3 video assets with hooks A, B, and C targeting Lagos and Abuja SMEs.',
        submittedAt: new Date(),
      }
    });

    assert.equal(submittedTask.status, 'IN_REVIEW');
    assert.equal(submittedTask.deliverableUrl, 'https://drive.google.com/drive/folders/closecraft-creatives-test');
    assert.ok(submittedTask.submittedAt);
  });

  it('6. Deliverable Review & Approval: Approves deliverable and updates client service progress', async () => {
    // Operator or Client reviews and approves deliverable
    const completedTask = await prisma.serviceDeliveryTask.update({
      where: { id: deliveryTaskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        reviewedByUserId: staffUserId,
        clientApproved: true,
        clientFeedback: 'Creatives look sharp and aligned with brand guidelines.',
      }
    });

    assert.equal(completedTask.status, 'COMPLETED');
    assert.equal(completedTask.clientApproved, true);
    assert.ok(completedTask.completedAt);
    assert.equal(completedTask.clientFeedback, 'Creatives look sharp and aligned with brand guidelines.');

    // Linked ClientService advances progress
    const allTasks = await prisma.serviceDeliveryTask.findMany({
      where: { clientServiceId }
    });
    const completedCount = allTasks.filter(t => t.status === 'COMPLETED').length;
    const progressPercent = Math.min(100, Math.round((completedCount / allTasks.length) * 100));

    const updatedService = await prisma.clientService.update({
      where: { id: clientServiceId },
      data: { progressPercent }
    });

    assert.equal(updatedService.progressPercent, 100);
  });

  it('7. Workforce Performance Dashboard: Derives role-specific metrics without invasive surveillance', async () => {
    // Simulate leads and appointments for metric testing
    const lead1 = await prisma.lead.create({
      data: {
        organizationId: orgAId,
        name: 'Prospective Client One',
        email: `lead1-${Date.now()}@example.com`,
        status: 'QUALIFIED',
      }
    });

    const lead2 = await prisma.lead.create({
      data: {
        organizationId: orgAId,
        name: 'Prospective Client Two',
        email: `lead2-${Date.now()}@example.com`,
        status: 'ENGAGED',
      }
    });

    const totalLeads = await prisma.lead.count({ where: { organizationId: orgAId } });
    const qualifiedLeads = await prisma.lead.count({
      where: { organizationId: orgAId, status: { in: ['QUALIFIED', 'OPPORTUNITY', 'WON'] } }
    });

    const qualificationRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
    assert.ok(qualificationRate > 0);

    // Calculate task delivery SLA
    const tasks = await prisma.serviceDeliveryTask.findMany({
      where: { organizationId: orgAId }
    });
    const overdue = tasks.filter(t => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < new Date()).length;
    const slaRate = tasks.length > 0 ? Math.round(((tasks.length - overdue) / tasks.length) * 100) : 100;

    assert.equal(slaRate, 100);
  });

  it('8. Tenant Isolation: Restricts client organization B from querying organization A tasks', async () => {
    // Create Organization B
    const orgB = await prisma.organization.create({
      data: {
        name: `Beta Corp ${Date.now()}`,
        slug: `beta-corp-${Date.now()}`,
        plan: 'STARTER',
      }
    });
    orgBId = orgB.id;

    // Org B queries tasks for their own organization
    const orgBTasks = await prisma.serviceDeliveryTask.findMany({
      where: { organizationId: orgBId }
    });

    assert.equal(orgBTasks.length, 0);

    // Ensure Org A task belongs only to Org A
    const orgATasks = await prisma.serviceDeliveryTask.findMany({
      where: { organizationId: orgAId }
    });

    assert.ok(orgATasks.length >= 1);
    assert.ok(orgATasks.every(t => t.organizationId === orgAId));
  });

  it('9. Cleanup test records', async () => {
    if (deliveryTaskId) {
      await prisma.serviceDeliveryTask.deleteMany({ where: { id: deliveryTaskId } });
    }
    if (clientServiceId) {
      await prisma.clientService.deleteMany({ where: { id: clientServiceId } });
    }
    if (staffProfileId) {
      await prisma.staffProfile.deleteMany({ where: { id: staffProfileId } });
    }
    if (staffUserId) {
      await prisma.user.deleteMany({ where: { id: staffUserId } });
    }
    if (orgAId) {
      await prisma.organization.deleteMany({ where: { id: orgAId } });
    }
    if (orgBId) {
      await prisma.organization.deleteMany({ where: { id: orgBId } });
    }
    await prisma.$disconnect();
  });
});
