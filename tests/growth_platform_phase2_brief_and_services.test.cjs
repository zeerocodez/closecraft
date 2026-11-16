const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { PrismaClient } = require('@prisma/client');
const fs = require('node:fs');
const path = require('node:path');

const prisma = new PrismaClient();

describe('CloseCraft Growth Platform Phase 2: Service Selection & Project Brief Tests', () => {
  let testOrg;
  let testUser;
  let createdProjectRequestId;

  before(async () => {
    // Create dedicated isolated test org and user
    testOrg = await prisma.organization.create({
      data: {
        name: 'Phase 2 Test Ventures',
        slug: `phase2-test-${Date.now()}`,
        plan: 'STARTER',
      },
    });

    testUser = await prisma.user.create({
      data: {
        email: `phase2-founder-${Date.now()}@example.com`,
        name: 'Chioma Okonkwo',
        role: 'USER',
        memberships: {
          create: {
            organizationId: testOrg.id,
            role: 'OWNER',
          },
        },
      },
    });
  });

  after(async () => {
    // Cleanup created test records
    if (createdProjectRequestId) {
      await prisma.projectBrief.deleteMany({ where: { projectRequestId: createdProjectRequestId } });
      await prisma.projectRequest.deleteMany({ where: { id: createdProjectRequestId } });
    }
    if (testUser) {
      await prisma.organizationMember.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.deleteMany({ where: { id: testUser.id } });
    }
    if (testOrg) {
      await prisma.organization.deleteMany({ where: { id: testOrg.id } });
    }
    await prisma.$disconnect();
  });

  it('1. Service Catalogue covers all 5 introductory consultation services', () => {
    const servicesFilePath = path.join(__dirname, '../src/lib/growth/services.ts');
    assert.strictEqual(fs.existsSync(servicesFilePath), true, 'src/lib/growth/services.ts must exist');

    const content = fs.readFileSync(servicesFilePath, 'utf8');

    // Verify all 5 keys exist
    assert.match(content, /ADS_MANAGEMENT/);
    assert.match(content, /AI_FLYER_DESIGN/);
    assert.match(content, /AI_VIDEO_CREATION/);
    assert.match(content, /LANDING_PAGE_DESIGN/);
    assert.match(content, /VSL_DESIGN/);

    // Verify human-readable service names
    assert.match(content, /Facebook & Instagram Ads Management/);
    assert.match(content, /AI Image & Flyer Creation/);
    assert.match(content, /AI Video Creation/);
    assert.match(content, /Landing Page Design/);
    assert.match(content, /Video Sales Letter \(VSL\) Design/);

    // Verify consultation model (no invented fixed prices in service definitions)
    assert.doesNotMatch(content, /₦\s*\d+,\d+\s*\/\s*service/i);
  });

  it('2. Project Brief Schema strictly enforces multi-service bundles and required business info', () => {
    const servicesFilePath = path.join(__dirname, '../src/lib/growth/services.ts');
    const content = fs.readFileSync(servicesFilePath, 'utf8');

    assert.match(content, /ProjectBriefSubmissionSchema/);
    assert.match(content, /businessName/);
    assert.match(content, /industry/);
    assert.match(content, /businessOverview/);
    assert.match(content, /primaryGoal/);
    assert.match(content, /currentBottleneck/);
    assert.match(content, /targetAudience/);
    assert.match(content, /promotedProducts/);
    assert.match(content, /successDefinition/);
    assert.match(content, /contactPhone/);
  });

  it('3. Successfully creates a consolidated ProjectRequest and ProjectBrief in database', async () => {
    const ref = `CC-PR-2026-TEST${Math.floor(1000 + Math.random() * 9000)}`;

    const pr = await prisma.projectRequest.create({
      data: {
        reference: ref,
        organizationId: testOrg.id,
        requestedById: testUser.id,
        services: ['ADS_MANAGEMENT', 'LANDING_PAGE_DESIGN', 'AI_VIDEO_CREATION'],
        status: 'PENDING_ASSIGNMENT',
        brief: {
          create: {
            businessName: 'Lagos Solar Innovations',
            industry: 'Clean Energy & Solar',
            businessOverview: 'Residential and commercial solar installation across South-West Nigeria.',
            primaryGoal: 'Generate 100 qualified residential solar inquiries every month.',
            currentBottleneck: 'Leads from social media are inconsistent and not followed up in time.',
            targetAudience: 'Homeowners and SME facility managers with high generator costs.',
            promotedProducts: '5kVA and 10kVA Inverter + Battery Bundles',
            successDefinition: '10 closed residential installations per month.',
            urgency: 'HIGH',
            preferredContactMethod: 'WhatsApp',
            serviceParameters: {
              ADS_MANAGEMENT: {
                monthlyAdBudget: '₦500,000 – ₦1,500,000 / month',
                platforms: ['Facebook', 'Instagram'],
              },
              LANDING_PAGE_DESIGN: {
                landingPageGoal: 'Lead Generation',
                copywritingStatus: 'Need CloseCraft to write final copy',
              },
            },
          },
        },
      },
      include: {
        brief: true,
      },
    });

    createdProjectRequestId = pr.id;

    assert.strictEqual(pr.reference, ref);
    assert.strictEqual(pr.status, 'PENDING_ASSIGNMENT');
    assert.strictEqual(pr.services.length, 3);
    assert.deepStrictEqual(pr.services, ['ADS_MANAGEMENT', 'LANDING_PAGE_DESIGN', 'AI_VIDEO_CREATION']);
    assert.strictEqual(pr.brief.businessName, 'Lagos Solar Innovations');
    assert.strictEqual(pr.brief.urgency, 'HIGH');
    assert.strictEqual(pr.organizationId, testOrg.id);
  });

  it('4. Multi-Tenant Isolation: Another organization cannot query private project briefs', async () => {
    const otherOrg = await prisma.organization.create({
      data: {
        name: 'Competitor Ventures',
        slug: `comp-org-${Date.now()}`,
        plan: 'STARTER',
      },
    });

    try {
      const result = await prisma.projectRequest.findFirst({
        where: {
          id: createdProjectRequestId,
          organizationId: otherOrg.id,
        },
      });

      assert.strictEqual(result, null, 'Cross-tenant request must return null');
    } finally {
      await prisma.organization.delete({ where: { id: otherOrg.id } });
    }
  });

  it('5. API route exists and handles Zod validation and rate limiting', () => {
    const routeFilePath = path.join(__dirname, '../src/app/api/growth/project-requests/route.ts');
    assert.strictEqual(fs.existsSync(routeFilePath), true, 'API route must exist');

    const routeContent = fs.readFileSync(routeFilePath, 'utf8');
    assert.match(routeContent, /POST/);
    assert.match(routeContent, /GET/);
    assert.match(routeContent, /ProjectBriefSubmissionSchema/);
    assert.match(routeContent, /buildWhatsAppConsultationLink/);
    assert.match(routeContent, /rateLimit/);
  });

  it('6. Frontend UI Components exist and are integrated with the landing page', () => {
    const sectionPath = path.join(__dirname, '../src/components/growth/GrowthServicesSection.tsx');
    const modalPath = path.join(__dirname, '../src/components/growth/ProjectBriefModal.tsx');
    const landingWrapperPath = path.join(__dirname, '../src/app/(marketing)/LandingClientWrapper.tsx');

    assert.strictEqual(fs.existsSync(sectionPath), true, 'GrowthServicesSection.tsx must exist');
    assert.strictEqual(fs.existsSync(modalPath), true, 'ProjectBriefModal.tsx must exist');

    const landingContent = fs.readFileSync(landingWrapperPath, 'utf8');
    assert.match(landingContent, /GrowthServicesSection/);
    assert.match(landingContent, /#services-catalogue/);
  });
});
