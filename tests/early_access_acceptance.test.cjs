const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('CloseCraft 2.0 Early Access Acceptance Tests', () => {
  let createdRequestId = null;
  const testEmail = `early-access-test-${Date.now()}@example.com`;

  it('1. Successfully registers an Early Access intake request', async () => {
    // Direct database simulation of service request intake
    const req = await prisma.serviceRequest.create({
      data: {
        reference: `REQ-EA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        serviceType: 'EARLY_ACCESS',
        stage: 'NEW',
        contactName: 'Adeola Johnson',
        contactEmail: testEmail,
        contactPhone: '+2348012345678',
        companyName: 'Lagos Enterprise Group',
        answers: JSON.stringify({
          industry: 'Technology & SaaS',
          currentLeads: '50-200 leads/mo',
          primaryBottleneck: 'Slow follow-up & qualification',
          targetService: 'FULL_GROWTH_SYSTEM',
          recommendedPackage: 'remote-appointment-setting'
        }),
        sourceAttribution: 'Early Access Landing Funnel',
      }
    });

    assert.ok(req.id, 'Request ID should be generated');
    assert.match(req.reference, /^REQ-EA-[A-Z0-9]+$/, 'Reference should have REQ-EA prefix');
    assert.equal(req.serviceType, 'EARLY_ACCESS');
    assert.equal(req.stage, 'NEW');
    assert.equal(req.contactEmail, testEmail);

    createdRequestId = req.id;
  });

  it('2. Retrieves diagnostic answers correctly formatted as JSON', async () => {
    const fetched = await prisma.serviceRequest.findUnique({
      where: { id: createdRequestId }
    });

    assert.ok(fetched);
    const answers = JSON.parse(fetched.answers);
    assert.equal(answers.industry, 'Technology & SaaS');
    assert.equal(answers.recommendedPackage, 'remote-appointment-setting');
  });

  it('3. Advances stage through the administrative approval pipeline', async () => {
    const updated = await prisma.serviceRequest.update({
      where: { id: createdRequestId },
      data: {
        stage: 'DISCOVERY_SCHEDULED',
        internalNotes: 'Initial discovery call booked for Thursday 2pm WAT',
      }
    });

    assert.equal(updated.stage, 'DISCOVERY_SCHEDULED');
    assert.ok(updated.internalNotes.includes('Thursday 2pm'));
  });

  it('4. Filters Early Access requests cleanly in the admin queue', async () => {
    const eaRequests = await prisma.serviceRequest.findMany({
      where: { serviceType: 'EARLY_ACCESS' },
      orderBy: { createdAt: 'desc' }
    });

    assert.ok(eaRequests.length >= 1);
    const found = eaRequests.find(r => r.id === createdRequestId);
    assert.ok(found);
  });

  it('5. Clean up test record', async () => {
    if (createdRequestId) {
      await prisma.serviceRequest.delete({
        where: { id: createdRequestId }
      });
    }
  });
});
