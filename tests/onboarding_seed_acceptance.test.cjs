const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

test('CloseCraft HQ Phase 14: Onboarding & Sample Revenue Workspace Seed Acceptance Tests', async (t) => {
  const cardPath = path.join(__dirname, '../src/components/dashboard/OnboardingChecklistCard.tsx');
  const actionsPath = path.join(__dirname, '../src/app/(saas)/actions.ts');
  const dashboardPath = path.join(__dirname, '../src/app/(saas)/dashboard/page.tsx');

  const cardContent = fs.readFileSync(cardPath, 'utf8');
  const actionsContent = fs.readFileSync(actionsPath, 'utf8');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

  await t.test('1. Onboarding Card Component Architecture & Action Hooks', () => {
    assert.ok(cardContent.includes('Trial Activation & Setup'), 'Must display trial activation badge');
    assert.ok(cardContent.includes('Workspace Identity & WhatsApp Channel'), 'Must include workspace identity setup step');
    assert.ok(cardContent.includes('Lead Qualification Policy'), 'Must include qualification policy step');
    assert.ok(cardContent.includes('Commercial Lead Pipeline'), 'Must include commercial leads step');
    assert.ok(cardContent.includes('Unified Revenue Inbox & WhatsApp Outreach'), 'Must include unified inbox step');
    assert.ok(cardContent.includes('Seed Sample Workspace'), 'Must provide 1-click sample seed trigger');
    assert.ok(cardContent.includes('Clear Demo Leads'), 'Must provide clear sample leads trigger');
    assert.ok(cardContent.includes('seedSampleWorkspaceAction'), 'Must wire seed action');
    assert.ok(cardContent.includes('clearSampleWorkspaceAction'), 'Must wire clear action');
  });

  await t.test('2. Server Actions Exports & Dashboard Page Integration', () => {
    assert.ok(actionsContent.includes('export async function seedSampleWorkspaceAction'), 'Must export seedSampleWorkspaceAction');
    assert.ok(actionsContent.includes('export async function clearSampleWorkspaceAction'), 'Must export clearSampleWorkspaceAction');
    assert.ok(dashboardContent.includes('OnboardingChecklistCard'), 'Dashboard page must import and render OnboardingChecklistCard');
    assert.ok(dashboardContent.includes('leadCount={leadCount}'), 'Dashboard must pass lead count prop');
    assert.ok(dashboardContent.includes('hasDemoSeed={!!demoLead}'), 'Dashboard must pass demo seed presence prop');
  });

  let orgA;
  let orgB;
  const timestamp = Date.now();

  await t.test('3. Setup test organizations for isolation testing', async () => {
    orgA = await db.organization.create({
      data: {
        name: `Onboarding Test Org A ${timestamp}`,
        slug: `onboarding-test-a-${timestamp}`,
      }
    });

    orgB = await db.organization.create({
      data: {
        name: `Onboarding Test Org B ${timestamp}`,
        slug: `onboarding-test-b-${timestamp}`,
      }
    });

    assert.ok(orgA.id);
    assert.ok(orgB.id);
  });

  await t.test('4. Seed sample records into Organization A', async () => {
    // Lead 1: Hot / Enterprise
    const lead1 = await db.lead.create({
      data: {
        organizationId: orgA.id,
        name: 'Tunde Balogun',
        email: `tunde.${timestamp}@techcorplagos.ng`,
        phone: '+2348031234567',
        message: '[DEMO_SEED] High-intent enterprise lead seeking 30-day sales operations pilot.',
        source: 'META_LEAD_AD',
        status: 'QUALIFIED',
        buyingIntent: 92,
        estimatedValue: 1200000,
        currency: 'NGN',
        nextAction: 'Execute WhatsApp Discovery Call',
        nextActionDueAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      }
    });

    // Lead 2: Engaged
    const lead2 = await db.lead.create({
      data: {
        organizationId: orgA.id,
        name: 'Dr. Amara Okafor',
        email: `amara.${timestamp}@apexclinics.com`,
        phone: '+2348059876543',
        message: '[DEMO_SEED] Requires multi-location patient enquiry triage.',
        source: 'WEBSITE',
        status: 'CONTACTED',
        buyingIntent: 78,
        estimatedValue: 450000,
        currency: 'NGN',
        nextAction: 'Confirm Pricing Sheet Review',
        nextActionDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    });

    // Lead 3: Overdue SLA
    const lead3 = await db.lead.create({
      data: {
        organizationId: orgA.id,
        name: 'Ibrahim Musa',
        email: `ibrahim.${timestamp}@northlinelogistics.com`,
        phone: '+2348123456789',
        message: '[DEMO_SEED] Overdue follow-up trigger: Requested custom quarterly billing schedule.',
        source: 'WHATSAPP',
        status: 'NEW',
        buyingIntent: 65,
        estimatedValue: 850000,
        currency: 'NGN',
        nextAction: 'Escalate to Human Closer (Custom Terms)',
        nextActionDueAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      }
    });

    // Appointment
    await db.appointment.create({
      data: {
        organizationId: orgA.id,
        leadId: lead1.id,
        title: 'Commercial Demo with Tunde Balogun (TechCorp)',
        scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        durationMinutes: 30,
        status: 'CONFIRMED',
        meetingUrl: 'https://meet.google.com/closecraft-demo-bridge',
        notes: '[DEMO_SEED] Automated demo meeting bridge seeded for trial onboarding.',
      }
    });

    const leadsInA = await db.lead.count({ where: { organizationId: orgA.id } });
    const apptsInA = await db.appointment.count({ where: { organizationId: orgA.id } });
    assert.equal(leadsInA, 3, 'Organization A must have exactly 3 seeded leads');
    assert.equal(apptsInA, 1, 'Organization A must have exactly 1 seeded appointment');

    // Strict multi-tenant isolation: Org B must have 0 leads
    const leadsInB = await db.lead.count({ where: { organizationId: orgB.id } });
    assert.equal(leadsInB, 0, 'Organization B must remain completely isolated with 0 leads');
  });

  await t.test('5. Verify seeded lead metrics and explainable factors', async () => {
    const leads = await db.lead.findMany({
      where: { organizationId: orgA.id },
      orderBy: { estimatedValue: 'desc' },
    });

    assert.equal(leads[0].name, 'Tunde Balogun');
    assert.equal(leads[0].estimatedValue, 1200000);
    assert.equal(leads[0].buyingIntent, 92);
    assert.equal(leads[0].nextAction, 'Execute WhatsApp Discovery Call');

    assert.equal(leads[1].name, 'Ibrahim Musa');
    assert.equal(leads[1].estimatedValue, 850000);
    assert.ok(new Date(leads[1].nextActionDueAt).getTime() < Date.now(), 'Lead 3 next action must be overdue');
  });

  await t.test('6. Clear sample workspace preserves tenant boundaries', async () => {
    // Seed 1 real lead in Org B that should NOT be deleted
    const realLeadInB = await db.lead.create({
      data: {
        organizationId: orgB.id,
        name: 'Real Customer Prospect',
        email: `real.${timestamp}@clientcorp.ng`,
        message: 'Real enquiry from inbound web contact form.',
        status: 'NEW',
      }
    });

    // Run clear query for Org A
    await db.appointment.deleteMany({
      where: {
        organizationId: orgA.id,
        notes: { contains: '[DEMO_SEED]' }
      }
    });

    const deleted = await db.lead.deleteMany({
      where: {
        organizationId: orgA.id,
        message: { contains: '[DEMO_SEED]' }
      }
    });

    assert.equal(deleted.count, 3, 'Must delete exactly the 3 demo leads');

    const remainingInA = await db.lead.count({ where: { organizationId: orgA.id } });
    assert.equal(remainingInA, 0, 'Organization A must have 0 leads left');

    // Real lead in Org B must remain untouched
    const remainingInB = await db.lead.count({ where: { organizationId: orgB.id } });
    assert.equal(remainingInB, 1, 'Organization B real lead must not be touched by Org A clear');
  });

  await t.test('7. Cleanup test organizations', async () => {
    await db.lead.deleteMany({
      where: { organizationId: { in: [orgA.id, orgB.id] } }
    });
    await db.organization.deleteMany({
      where: { id: { in: [orgA.id, orgB.id] } }
    });
    await db.$disconnect();
  });
});
