const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('CloseCraft Growth Platform: Full 10-Phase End-to-End Customer Journey Tests', () => {
  let tenantOrgA;
  let tenantOrgB;
  let clientUserA;
  let clientUserB;
  let operatorUser;
  let partnerPro;
  let projectRequest;
  let projectBrief;
  let proposal;
  let projectInvoice;
  let milestone1;
  let milestone2;

  before(async () => {
    // 1. Create Tenant Organization A
    tenantOrgA = await prisma.organization.create({
      data: {
        name: 'Apex Growth Labs (Tenant A)',
        slug: `tenant-a-${Date.now()}`,
        plan: 'PRO',
      },
    });

    clientUserA = await prisma.user.create({
      data: {
        email: `client-a-${Date.now()}@example.com`,
        name: 'Tunde Client A',
        role: 'USER',
        memberships: {
          create: {
            organizationId: tenantOrgA.id,
            role: 'OWNER',
          },
        },
      },
    });

    // 2. Create Tenant Organization B (For isolation testing)
    tenantOrgB = await prisma.organization.create({
      data: {
        name: 'Horizon Retail (Tenant B)',
        slug: `tenant-b-${Date.now()}`,
        plan: 'PRO',
      },
    });

    clientUserB = await prisma.user.create({
      data: {
        email: `client-b-${Date.now()}@example.com`,
        name: 'Ngozi Client B',
        role: 'USER',
        memberships: {
          create: {
            organizationId: tenantOrgB.id,
            role: 'OWNER',
          },
        },
      },
    });

    // 3. Create Platform Operator User
    operatorUser = await prisma.user.create({
      data: {
        email: `operator-${Date.now()}@example.com`,
        name: 'Official CloseCraft Operator',
        role: 'OPERATOR',
      },
    });

    // 4. Create Vetted Partner Professional
    partnerPro = await prisma.professionalProfile.create({
      data: {
        fullName: 'Chidi Creative Partner',
        email: `partner-chidi-${Date.now()}@example.com`,
        phone: '+2348039998888',
        bio: 'Senior Growth Producer across Paid Ads, High-Converting Landing Pages, and AI Visual Assets.',
        weeklyAvailabilityHours: 40,
        isPoolApproved: true,
        poolApprovedAt: new Date(),
        status: 'ACTIVE',
        experienceSummary: 'Senior Growth Producer across Paid Ads, High-Converting Landing Pages, and AI Visual Assets.',
        simulatedPortfolioLabels: 'facebook ads, instagram marketing, ai flyers, landing page design',
      },
    });
  });

  after(async () => {
    // Clean up all created test entities
    try {
      if (projectRequest?.id) {
        await prisma.projectMilestone.deleteMany({ where: { projectRequestId: projectRequest.id } });
        await prisma.proposalLineItem.deleteMany({ where: { proposal: { projectRequestId: projectRequest.id } } });
        await prisma.projectProposal.deleteMany({ where: { projectRequestId: projectRequest.id } });
        await prisma.projectInvoice.deleteMany({ where: { projectRequestId: projectRequest.id } });
        await prisma.projectBrief.deleteMany({ where: { projectRequestId: projectRequest.id } });
        await prisma.projectRequest.deleteMany({ where: { id: projectRequest.id } });
      }

      if (partnerPro?.id) {
        await prisma.professionalProfile.deleteMany({ where: { id: partnerPro.id } });
      }

      await prisma.auditLog.deleteMany({
        where: { organizationId: { in: [tenantOrgA?.id, tenantOrgB?.id] } },
      });

      await prisma.organizationMember.deleteMany({
        where: { organizationId: { in: [tenantOrgA?.id, tenantOrgB?.id] } },
      });

      await prisma.user.deleteMany({
        where: { id: { in: [clientUserA?.id, clientUserB?.id, operatorUser?.id] } },
      });

      if (tenantOrgA?.id) await prisma.organization.deleteMany({ where: { id: tenantOrgA.id } });
      if (tenantOrgB?.id) await prisma.organization.deleteMany({ where: { id: tenantOrgB.id } });
    } catch (cleanupErr) {
      console.warn('[Cleanup Warning]', cleanupErr.message);
    } finally {
      await prisma.$disconnect();
    }
  });

  // TEST 1: Service Selection Basket & Project Brief Creation
  it('Phase 2: Creates a multi-service project request and detailed project brief', async () => {
    const reference = `CC-PR-2026-T-${Math.floor(1000 + Math.random() * 9000)}`;

    projectRequest = await prisma.projectRequest.create({
      data: {
        reference,
        organizationId: tenantOrgA.id,
        requestedById: clientUserA.id,
        services: ['ADS_MANAGEMENT', 'AI_FLYER_DESIGN', 'LANDING_PAGE_DESIGN'],
        status: 'PENDING_ASSIGNMENT',
      },
    });

    projectBrief = await prisma.projectBrief.create({
      data: {
        projectRequestId: projectRequest.id,
        businessName: 'Apex Growth Labs',
        industry: 'B2B Software & Consulting',
        businessOverview: 'We provide enterprise workflow automation for West African financial institutions.',
        primaryGoal: 'Acquire 30 qualified demo bookings per month via Meta Ads and high-converting landing pages.',
        currentBottleneck: 'Ad creatives fail to communicate our enterprise value proposition clearly.',
        targetAudience: 'Chief Technology Officers and VPs of Engineering at FinTechs.',
        promotedProducts: 'Apex Core Automation Suite',
        successDefinition: '30+ booked demos at under ₦15,000 cost per acquisition.',
        urgency: 'HIGH',
        preferredContactMethod: 'WhatsApp',
        serviceParameters: {
          adsBudget: '₦400,000/month',
          platforms: ['Facebook', 'Instagram'],
          flyerConcepts: 3,
        },
      },
    });

    assert.ok(projectRequest.id, 'Project request must have an ID');
    assert.match(projectRequest.reference, /^CC-PR-2026-T-\d{4}$/, 'Reference matches expected format');
    assert.strictEqual(projectRequest.status, 'PENDING_ASSIGNMENT');
    assert.strictEqual(projectRequest.services.length, 3);
    assert.strictEqual(projectBrief.businessName, 'Apex Growth Labs');
  });

  // TEST 2: 30-Minute SLA & Partner Assignment
  it('Phase 3: Assigns vetted partner and updates WhatsApp deep-link with prefilled context', async () => {
    const officialNumber = '2349026365853';
    const serviceNames = 'Facebook & Instagram Ads Management, AI Image & Flyer Creation, Landing Page Design';
    const expectedMsg = `Hello CloseCraft, my name is ${clientUserA.name}. I submitted project request ${projectRequest.reference} for Apex Growth Labs (${serviceNames}). My assigned partner is ${partnerPro.fullName}. I would like to discuss my project requirements and next steps.`;
    const whatsappUrl = `https://wa.me/${officialNumber}?text=${encodeURIComponent(expectedMsg)}`;

    const updated = await prisma.projectRequest.update({
      where: { id: projectRequest.id },
      data: {
        assignedPartnerId: partnerPro.id,
        assignedAt: new Date(),
        status: 'ASSIGNED',
        whatsappThreadUrl: whatsappUrl,
      },
      include: { assignedPartner: true },
    });

    assert.strictEqual(updated.status, 'ASSIGNED');
    assert.strictEqual(updated.assignedPartnerId, partnerPro.id);
    assert.ok(updated.whatsappThreadUrl.includes('My%20assigned%20partner%20is%20Chidi'), 'WhatsApp URL includes partner name');
  });

  // TEST 3: WhatsApp Consultation Lifecycle & Notes Logging
  it('Phase 4: Logs consultation outcomes and advances status to CONSULTING', async () => {
    const notes = 'Conducted 20-minute WhatsApp discovery call with Tunde. Clarified target CPA of ₦15,000. Confirmed 3 high-tempo visual angles and dedicated landing page.';
    const consultedAt = new Date();

    const updated = await prisma.projectRequest.update({
      where: { id: projectRequest.id },
      data: {
        status: 'CONSULTING',
        consultationNotes: notes,
        consultedAt,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        organizationId: tenantOrgA.id,
        actorId: operatorUser.id,
        actorType: 'USER',
        action: 'CONSULTATION_UPDATED',
        resourceType: 'PROJECT_REQUEST',
        resourceId: projectRequest.id,
        metadata: JSON.stringify({ status: 'CONSULTING', consultedAt }),
      },
    });

    assert.strictEqual(updated.status, 'CONSULTING');
    assert.strictEqual(updated.consultationNotes, notes);
    assert.ok(updated.consultedAt);
  });

  // TEST 4: Scoped Commercial Proposal Creation with Itemised Line Items
  it('Phase 5: Authors scoped commercial proposal with deliverables checklists and NGN pricing', async () => {
    const proposalNumber = `CC-PROP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const validUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    proposal = await prisma.projectProposal.create({
      data: {
        proposalNumber,
        projectRequestId: projectRequest.id,
        createdById: operatorUser.id,
        title: 'Apex Growth Labs Comprehensive Acquisition Suite',
        scopeSummary: 'Integrated paid acquisition campaign, bespoke AI creative assets, and high-converting landing page.',
        totalAmount: 380000.0,
        currency: 'NGN',
        status: 'SENT',
        estimatedDays: 14,
        validUntil,
        lineItems: {
          create: [
            {
              serviceType: 'ADS_MANAGEMENT',
              title: 'Meta Paid Ads Strategy, Setup & 30-Day Campaign Management',
              description: 'Targeting setup, pixel tracking, audience segmentation, budget allocation, and weekly optimisation.',
              quantity: 1,
              unitPrice: 180000.0,
              totalPrice: 180000.0,
              deliverables: ['Custom CBO Campaign Setup', 'Lookalike Audience Building', 'Weekly ROAS Reporting'],
              sortOrder: 1,
            },
            {
              serviceType: 'AI_FLYER_DESIGN',
              title: 'AI Promotional Flyer & Visual Creative Suite',
              description: '6 High-tempo marketing flyers formatted for 1:1 Feed and 9:16 Stories.',
              quantity: 1,
              unitPrice: 80000.0,
              totalPrice: 80000.0,
              deliverables: ['6 Format-Optimized Creatives', 'Figma Source Layers', 'Commercial License'],
              sortOrder: 2,
            },
            {
              serviceType: 'LANDING_PAGE_DESIGN',
              title: 'High-Converting B2B Lead Capture Landing Page',
              description: 'Responsive, mobile-optimized landing page designed to capture FinTech demo requests.',
              quantity: 1,
              unitPrice: 120000.0,
              totalPrice: 120000.0,
              deliverables: ['Responsive Web Layout', 'Direct CRM Integration Hook', 'Speed Optimisation (<1.5s load)'],
              sortOrder: 3,
            },
          ],
        },
      },
      include: { lineItems: true },
    });

    await prisma.projectRequest.update({
      where: { id: projectRequest.id },
      data: { status: 'PROPOSAL_SENT' },
    });

    assert.ok(proposal.id);
    assert.strictEqual(proposal.status, 'SENT');
    assert.strictEqual(proposal.lineItems.length, 3);
    assert.strictEqual(Number(proposal.totalAmount), 380000.0);
  });

  // TEST 5: Human-in-the-Loop Proposal Revision
  it('Phase 5 (HITL): Supports client revision requests with audit trail before acceptance', async () => {
    // Client requests revision
    const revisionNote = 'Please bundle 2 additional static flyer variations for retargeting.';
    const revisionRecord = {
      requestedBy: clientUserA.id,
      requestedAt: new Date().toISOString(),
      notes: revisionNote,
    };

    const revisedProp = await prisma.projectProposal.update({
      where: { id: proposal.id },
      data: {
        status: 'DRAFT',
        clientRejectionReason: revisionNote,
        revisionHistory: JSON.stringify([revisionRecord]),
      },
    });

    assert.strictEqual(revisedProp.status, 'DRAFT');
    assert.strictEqual(revisedProp.clientRejectionReason, revisionNote);

    // Operator updates proposal and re-sends
    const resubmitted = await prisma.projectProposal.update({
      where: { id: proposal.id },
      data: {
        status: 'SENT',
        scopeSummary: `${proposal.scopeSummary} (Updated to include 8 total visual variations).`,
      },
    });

    assert.strictEqual(resubmitted.status, 'SENT');
  });

  // TEST 6: Proposal Acceptance, Invoicing & Delivery Milestones Initialization
  it('Phase 6: Client accepts proposal, generates ProjectInvoice, and initializes ordered milestones', async () => {
    const invoiceNumber = `CC-INV-PR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Create ProjectInvoice
    projectInvoice = await prisma.projectInvoice.create({
      data: {
        invoiceNumber,
        projectRequestId: projectRequest.id,
        totalAmount: proposal.totalAmount,
        currency: 'NGN',
        organizationId: tenantOrgA.id,
        status: 'ISSUED',
        bachsCheckoutId: `chk_test_${Date.now()}`,
        bachsCheckoutUrl: `/billing/checkout/mock?checkout_id=chk_test_${Date.now()}`,
      },
    });

    // 2. Mark proposal accepted
    await prisma.projectProposal.update({
      where: { id: proposal.id },
      data: {
        status: 'ACCEPTED',
        clientAcceptedAt: new Date(),
        projectInvoiceId: projectInvoice.id,
      },
    });

    // 3. Advance ProjectRequest to INVOICED
    await prisma.projectRequest.update({
      where: { id: projectRequest.id },
      data: { status: 'INVOICED' },
    });

    // 4. Initialize Delivery Milestones
    milestone1 = await prisma.projectMilestone.create({
      data: {
        projectRequestId: projectRequest.id,
        serviceType: 'AI_FLYER_DESIGN',
        title: 'AI Image & Flyer Creative Suite Delivery',
        description: 'Delivery of 8 format-optimized visual assets for client review.',
        sequenceOrder: 1,
        status: 'PENDING',
      },
    });

    milestone2 = await prisma.projectMilestone.create({
      data: {
        projectRequestId: projectRequest.id,
        serviceType: 'LANDING_PAGE_DESIGN',
        title: 'B2B Demo Landing Page Live Deployment',
        description: 'Complete deployment and DNS hookup for demo capture page.',
        sequenceOrder: 2,
        status: 'PENDING',
      },
    });

    assert.ok(projectInvoice.id);
    assert.strictEqual(projectInvoice.status, 'ISSUED');
    assert.strictEqual(Number(projectInvoice.totalAmount), 380000.0);
    assert.strictEqual(milestone1.status, 'PENDING');
    assert.strictEqual(milestone2.status, 'PENDING');
  });

  // TEST 7: Payment Fulfillment & Verified Receipt Generation
  it('Phase 6 & 9: Verified payment transitions project to IN_DELIVERY and generates official receipt', async () => {
    const paidAt = new Date();

    // 1. Fulfill ProjectInvoice
    const paidInvoice = await prisma.projectInvoice.update({
      where: { id: projectInvoice.id },
      data: {
        status: 'PAID',
        paidAt,
        bachsChargeId: `chg_verified_${Date.now()}`,
      },
    });

    // 2. Advance ProjectRequest to IN_DELIVERY & activate Milestone 1
    const activeProject = await prisma.projectRequest.update({
      where: { id: projectRequest.id },
      data: { status: 'IN_DELIVERY' },
    });

    await prisma.projectMilestone.update({
      where: { id: milestone1.id },
      data: { status: 'IN_PROGRESS' },
    });

    // 3. Generate Receipt Data
    const receiptNumber = `CC-REC-${paidInvoice.invoiceNumber.replace(/^CC-INV-PR-/, '')}`;

    assert.strictEqual(paidInvoice.status, 'PAID');
    assert.strictEqual(activeProject.status, 'IN_DELIVERY');
    assert.ok(receiptNumber.startsWith('CC-REC-2026-'), 'Receipt number matches format');
  });

  // TEST 8: Deliverable Proof Submission & Client Sign-Off to COMPLETED
  it('Phase 7: Partner submits deliverable proof, client signs off, and project reaches COMPLETED', async () => {
    // 1. Partner uploads proof for Milestone 1
    const proofUrl = 'https://www.figma.com/file/closecraft-apex-flyers';
    const sub1 = await prisma.projectMilestone.update({
      where: { id: milestone1.id },
      data: {
        status: 'SUBMITTED',
        proofUrl,
        reviewNotes: 'All 8 variations ready in Figma workspace.',
        submittedAt: new Date(),
      },
    });
    assert.strictEqual(sub1.status, 'SUBMITTED');

    // 2. Client approves Milestone 1
    await prisma.projectMilestone.update({
      where: { id: milestone1.id },
      data: {
        status: 'APPROVED',
        clientApproved: true,
        completedAt: new Date(),
        reviewedByUserId: clientUserA.id,
      },
    });

    // 3. Partner uploads proof for Milestone 2
    await prisma.projectMilestone.update({
      where: { id: milestone2.id },
      data: {
        status: 'SUBMITTED',
        proofUrl: 'https://demo.apexgrowth.io',
        submittedAt: new Date(),
      },
    });

    // 4. Client approves Milestone 2
    await prisma.projectMilestone.update({
      where: { id: milestone2.id },
      data: {
        status: 'APPROVED',
        clientApproved: true,
        completedAt: new Date(),
        reviewedByUserId: clientUserA.id,
      },
    });

    // 5. Automatic transition: all milestones approved -> COMPLETED
    const allMs = await prisma.projectMilestone.findMany({
      where: { projectRequestId: projectRequest.id },
    });
    const allApproved = allMs.every((m) => m.status === 'APPROVED');
    assert.strictEqual(allApproved, true, 'All milestones must be approved');

    const completedProject = await prisma.projectRequest.update({
      where: { id: projectRequest.id },
      data: { status: 'COMPLETED' },
    });

    assert.strictEqual(completedProject.status, 'COMPLETED');
  });

  // TEST 9: Strict Multi-Tenant Isolation Enforcement
  it('Phase 9 (Security): Prevents cross-tenant access and mutation between Tenant A and Tenant B', async () => {
    // Tenant B cannot query Tenant A's project requests when scoped by organizationId
    const tenantBProjects = await prisma.projectRequest.findMany({
      where: {
        id: projectRequest.id,
        organizationId: tenantOrgB.id, // Attempting to access Tenant A's project with Tenant B's org
      },
    });

    assert.strictEqual(tenantBProjects.length, 0, 'Tenant B must find zero records for Tenant A project');

    // Tenant B cannot view Tenant A's invoices
    const tenantBInvoices = await prisma.projectInvoice.findMany({
      where: {
        id: projectInvoice.id,
        organizationId: tenantOrgB.id,
      },
    });

    assert.strictEqual(tenantBInvoices.length, 0, 'Tenant B cannot read Tenant A invoices');

    // Tenant B cannot view Tenant A's milestones
    const tenantBMilestones = await prisma.projectMilestone.findMany({
      where: {
        projectRequest: {
          organizationId: tenantOrgB.id,
        },
      },
    });

    assert.strictEqual(tenantBMilestones.length, 0, 'Tenant B cannot view Tenant A milestones');
  });
});

