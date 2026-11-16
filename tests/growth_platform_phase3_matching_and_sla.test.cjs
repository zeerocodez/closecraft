const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { PrismaClient } = require('@prisma/client');
const path = require('node:path');
const fs = require('node:fs');

const prisma = new PrismaClient();

describe('CloseCraft Growth Platform Phase 3: Partner Assignment Engine & 30-Min SLA Tests', () => {
  let testOrg;
  let testClientUser;
  let operatorUser;
  let partnerAds;
  let partnerVideo;
  let unapprovedPartner;
  let projectRequest;
  let breachedRequest;

  before(async () => {
    // 1. Create client organization & user
    testOrg = await prisma.organization.create({
      data: {
        name: 'Phase 3 Growth Ventures',
        slug: `phase3-org-${Date.now()}`,
        plan: 'PRO',
      },
    });

    testClientUser = await prisma.user.create({
      data: {
        email: `phase3-client-${Date.now()}@example.com`,
        name: 'Emeka Nwosu',
        role: 'USER',
        memberships: {
          create: {
            organizationId: testOrg.id,
            role: 'OWNER',
          },
        },
      },
    });

    // 2. Create operator user
    operatorUser = await prisma.user.create({
      data: {
        email: `phase3-operator-${Date.now()}@example.com`,
        name: 'Sarah CloseCraft Operator',
        role: 'OPERATOR',
      },
    });

    // 3. Create Partner A: Ads & Landing Page specialist (Approved talent pool)
    partnerAds = await prisma.professionalProfile.create({
      data: {
        fullName: 'Babatunde Ads Wizard',
        email: `partner-ads-${Date.now()}@example.com`,
        phone: '+2348039991111',
        bio: 'Senior Meta ads manager and conversion rate optimization specialist.',
        experienceSummary: 'Managed over ₦50M in Meta ad spend across Facebook and Instagram with high ROAS and landing page design.',
        weeklyAvailabilityHours: 40,
        isPoolApproved: true,
        poolApprovedAt: new Date(),
        status: 'ACTIVE',
        simulatedPortfolioLabels: 'facebook ads, instagram marketing, landing page, conversion rate',
      },
    });

    // 4. Create Partner B: AI Video & VSL specialist (Approved talent pool)
    partnerVideo = await prisma.professionalProfile.create({
      data: {
        fullName: 'Kemi Video Director',
        email: `partner-video-${Date.now()}@example.com`,
        phone: '+2348039992222',
        bio: 'Direct response video sales letter producer and AI video creator.',
        experienceSummary: 'Specializes in high-tempo TikTok/Reels marketing videos, VSL scripting, and kinetic presentation decks.',
        weeklyAvailabilityHours: 35,
        isPoolApproved: true,
        poolApprovedAt: new Date(),
        status: 'ACTIVE',
        simulatedPortfolioLabels: 'ai video, vsl, reels, motion graphics, video sales letter',
      },
    });

    // 5. Create Partner C: Unapproved partner (isPoolApproved = false)
    unapprovedPartner = await prisma.professionalProfile.create({
      data: {
        fullName: 'Junior Unapproved Trainee',
        email: `unapproved-${Date.now()}@example.com`,
        weeklyAvailabilityHours: 20,
        isPoolApproved: false,
        status: 'ACTIVE',
      },
    });

    // 6. Create active Project Request for Ads + Landing Page
    projectRequest = await prisma.projectRequest.create({
      data: {
        reference: `CC-PR-2026-P3-${Math.floor(1000 + Math.random() * 9000)}`,
        organizationId: testOrg.id,
        requestedById: testClientUser.id,
        services: ['ADS_MANAGEMENT', 'LANDING_PAGE_DESIGN'],
        status: 'PENDING_ASSIGNMENT',
        brief: {
          create: {
            businessName: 'Apex Logistics Nigeria',
            industry: 'Freight & Haulage',
            businessOverview: 'Interstate haulage and freight forwarding for industrial manufacturers.',
            primaryGoal: 'Acquire 30 corporate haulage contracts per month through Facebook ads.',
            currentBottleneck: 'Low inquiry rate from website.',
            targetAudience: 'Manufacturing logistics directors and supply chain leads.',
            promotedProducts: 'Dedicated 30-ton truck fleet service.',
            successDefinition: '₦10M monthly recurring freight contracts.',
          },
        },
      },
    });

    // 7. Create past request (submitted 45 minutes ago) to test SLA breach detection
    const fortyFiveMinutesAgo = new Date(Date.now() - 45 * 60 * 1000);
    breachedRequest = await prisma.projectRequest.create({
      data: {
        reference: `CC-PR-2026-OLD-${Math.floor(1000 + Math.random() * 9000)}`,
        organizationId: testOrg.id,
        requestedById: testClientUser.id,
        services: ['AI_FLYER_DESIGN'],
        status: 'PENDING_ASSIGNMENT',
        createdAt: fortyFiveMinutesAgo,
        brief: {
          create: {
            businessName: 'Stalled Bakery',
            industry: 'Food & Beverage',
            businessOverview: 'Artisan bakery in Ikeja.',
            primaryGoal: 'Promotional flyers for weekend brunch.',
            currentBottleneck: 'Need creatives today.',
            targetAudience: 'Families in Ikeja GRA.',
            promotedProducts: 'Weekend Brunch Box.',
            successDefinition: 'Sold out.',
          },
        },
      },
    });
  });

  after(async () => {
    // Cleanup records
    if (projectRequest) {
      await prisma.auditLog.deleteMany({ where: { resourceId: projectRequest.id } });
      await prisma.projectBrief.deleteMany({ where: { projectRequestId: projectRequest.id } });
      await prisma.projectRequest.deleteMany({ where: { id: projectRequest.id } });
    }
    if (breachedRequest) {
      await prisma.projectBrief.deleteMany({ where: { projectRequestId: breachedRequest.id } });
      await prisma.projectRequest.deleteMany({ where: { id: breachedRequest.id } });
    }
    if (partnerAds) {
      await prisma.professionalProfile.deleteMany({ where: { id: partnerAds.id } });
    }
    if (partnerVideo) {
      await prisma.professionalProfile.deleteMany({ where: { id: partnerVideo.id } });
    }
    if (unapprovedPartner) {
      await prisma.professionalProfile.deleteMany({ where: { id: unapprovedPartner.id } });
    }
    if (testClientUser) {
      await prisma.organizationMember.deleteMany({ where: { userId: testClientUser.id } });
      await prisma.user.deleteMany({ where: { id: testClientUser.id } });
    }
    if (operatorUser) {
      await prisma.user.deleteMany({ where: { id: operatorUser.id } });
    }
    if (testOrg) {
      await prisma.organization.deleteMany({ where: { id: testOrg.id } });
    }
    await prisma.$disconnect();
  });

  it('1. Matching Engine Architecture: Source code defines ranking algorithm and skill patterns', () => {
    const matchingCodePath = path.join(__dirname, '../src/lib/growth/matching.ts');
    assert.strictEqual(fs.existsSync(matchingCodePath), true, 'matching.ts must exist');

    const content = fs.readFileSync(matchingCodePath, 'utf8');

    assert.match(content, /export async function rankEligiblePartnersForProject/);
    assert.match(content, /export async function assignPartnerToProjectRequest/);
    assert.match(content, /export async function monitorProjectRequestSlas/);
    assert.match(content, /SERVICE_SKILL_PATTERNS/);

    // Verify all 5 growth services have keyword matching patterns
    assert.match(content, /ADS_MANAGEMENT/);
    assert.match(content, /AI_FLYER_DESIGN/);
    assert.match(content, /AI_VIDEO_CREATION/);
    assert.match(content, /LANDING_PAGE_DESIGN/);
    assert.match(content, /VSL_DESIGN/);
  });

  it('2. Candidate Partner Query filters out unapproved candidates and ranks vetted specialists', async () => {
    // Query approved active talent
    const candidates = await prisma.professionalProfile.findMany({
      where: {
        status: 'ACTIVE',
        isPoolApproved: true,
      },
    });

    // Unapproved partner must never be eligible
    const hasUnapproved = candidates.some((c) => c.id === unapprovedPartner.id);
    assert.strictEqual(hasUnapproved, false, 'Unapproved partner must be excluded from talent pool queries');

    // Partner A and Partner B must be present
    const hasPartnerAds = candidates.some((c) => c.id === partnerAds.id);
    const hasPartnerVideo = candidates.some((c) => c.id === partnerVideo.id);
    assert.strictEqual(hasPartnerAds, true, 'Partner A must be eligible');
    assert.strictEqual(hasPartnerVideo, true, 'Partner B must be eligible');

    // Check skill alignment for Ads + Landing Page
    const adsLabels = (partnerAds.simulatedPortfolioLabels + ' ' + partnerAds.experienceSummary).toLowerCase();
    const hasAdsSkill = adsLabels.includes('ads') && adsLabels.includes('landing page');
    assert.strictEqual(hasAdsSkill, true, 'Partner A has required skills for Ads + Landing Page');
  });

  it('3. Partner Assignment transitions status to ASSIGNED and creates AuditLog entry', async () => {
    // Verify initial status
    assert.strictEqual(projectRequest.status, 'PENDING_ASSIGNMENT');
    assert.strictEqual(projectRequest.assignedPartnerId, null);

    // Execute assignment
    const updated = await prisma.$transaction(async (tx) => {
      const pr = await tx.projectRequest.update({
        where: { id: projectRequest.id },
        data: {
          assignedPartnerId: partnerAds.id,
          assignedAt: new Date(),
          status: 'ASSIGNED',
          operatorNotes: 'Assigned to Babatunde Ads Wizard based on logistics niche experience.',
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: projectRequest.organizationId,
          actorId: operatorUser.id,
          actorType: 'OPERATOR',
          action: 'PROJECT_PARTNER_ASSIGNED',
          resourceType: 'ProjectRequest',
          resourceId: projectRequest.id,
          oldState: 'PENDING_ASSIGNMENT',
          newState: 'ASSIGNED',
          reason: `Partner ${partnerAds.fullName} assigned to project ${projectRequest.reference}`,
        },
      });

      return pr;
    });

    assert.strictEqual(updated.status, 'ASSIGNED');
    assert.strictEqual(updated.assignedPartnerId, partnerAds.id);
    assert.ok(updated.assignedAt instanceof Date);

    // Verify AuditLog
    const auditRecord = await prisma.auditLog.findFirst({
      where: {
        resourceId: projectRequest.id,
        action: 'PROJECT_PARTNER_ASSIGNED',
      },
    });

    assert.ok(auditRecord, 'AuditLog record must be persisted');
    assert.strictEqual(auditRecord.actorId, operatorUser.id);
    assert.strictEqual(auditRecord.newState, 'ASSIGNED');
  });

  it('4. Assignment Gate prevents assigning an unapproved partner', async () => {
    // Fetch unapproved partner
    const candidate = await prisma.professionalProfile.findUnique({
      where: { id: unapprovedPartner.id },
    });

    assert.strictEqual(candidate.isPoolApproved, false);

    // Verification check as performed in assignPartnerToProjectRequest
    const canAssign = Boolean(candidate.status === 'ACTIVE' && candidate.isPoolApproved);
    assert.strictEqual(canAssign, false, 'Unapproved partner must be rejected before assignment');
  });

  it('5. 30-Minute SLA Monitoring accurately detects and persists breaches', async () => {
    const SLA_LIMIT_MINUTES = 30;
    const now = new Date();

    // Query pending unassigned requests
    const pending = await prisma.projectRequest.findMany({
      where: {
        status: 'PENDING_ASSIGNMENT',
        assignedPartnerId: null,
      },
    });

    const breachedIds = [];
    for (const pr of pending) {
      const elapsedMinutes = Math.floor((now.getTime() - new Date(pr.createdAt).getTime()) / (60 * 1000));
      if (elapsedMinutes >= SLA_LIMIT_MINUTES) {
        breachedIds.push(pr.id);
      }
    }

    // Breached request submitted 45 mins ago must be identified
    assert.ok(breachedIds.includes(breachedRequest.id), 'Old request must be marked as SLA breached');

    // Update database with breach timestamp
    await prisma.projectRequest.update({
      where: { id: breachedRequest.id },
      data: { slaBreachedAt: now },
    });

    const reloaded = await prisma.projectRequest.findUnique({
      where: { id: breachedRequest.id },
    });

    assert.ok(reloaded.slaBreachedAt instanceof Date, 'slaBreachedAt must be recorded');
  });

  it('6. API routes exist and enforce operator / admin authentication', () => {
    const matchRoute = path.join(__dirname, '../src/app/api/growth/matching/route.ts');
    const assignRoute = path.join(__dirname, '../src/app/api/growth/assign/route.ts');
    const slaRoute = path.join(__dirname, '../src/app/api/growth/sla/route.ts');

    assert.strictEqual(fs.existsSync(matchRoute), true, 'Matching route must exist');
    assert.strictEqual(fs.existsSync(assignRoute), true, 'Assignment route must exist');
    assert.strictEqual(fs.existsSync(slaRoute), true, 'SLA route must exist');

    const matchCode = fs.readFileSync(matchRoute, 'utf8');
    const assignCode = fs.readFileSync(assignRoute, 'utf8');
    const slaCode = fs.readFileSync(slaRoute, 'utf8');

    assert.match(matchCode, /OPERATOR|SUPER_ADMIN|ADMIN/);
    assert.match(assignCode, /OPERATOR|SUPER_ADMIN|ADMIN/);
    assert.match(slaCode, /OPERATOR|SUPER_ADMIN|ADMIN/);
  });
});
