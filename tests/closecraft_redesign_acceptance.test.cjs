const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('CloseCraft HQ Phase 4: Customer Experience & Growth Services Overhaul', () => {
  const dashboardPath = path.join(__dirname, '../src/app/(saas)/dashboard/page.tsx');
  const servicesPagePath = path.join(__dirname, '../src/app/(saas)/services/page.tsx');
  const servicesClientPath = path.join(__dirname, '../src/app/(saas)/services/ServicesClient.tsx');
  const briefModalPath = path.join(__dirname, '../src/components/growth/ProjectBriefModal.tsx');
  const projectDetailPath = path.join(__dirname, '../src/app/(saas)/growth/projects/[reference]/page.tsx');
  const projectDetailClientPath = path.join(__dirname, '../src/components/growth/GrowthProjectDetailClient.tsx');

  it('1. CloseCraft Customer Dashboard answers the 3 core user intent questions', () => {
    assert.strictEqual(fs.existsSync(dashboardPath), true, 'dashboard/page.tsx must exist');
    const content = fs.readFileSync(dashboardPath, 'utf8');

    // 1. What requires attention right now?
    assert.match(content, /Needs Your Attention/, 'Must have immediate attention section');
    assert.match(content, /pendingProposals/, 'Must query pending proposals awaiting review');
    assert.match(content, /pendingInvoices/, 'Must query pending invoices awaiting payment');
    assert.match(content, /pendingMilestones/, 'Must query deliverable milestones awaiting review');

    // 2. What is happening?
    assert.match(content, /Active Growth Projects/, 'Must have active growth projects section');
    assert.match(content, /Milestone Completion/, 'Must display milestone progress tracking');
    assert.match(content, /assignedPartner/, 'Must display assigned vetted specialist details');

    // 3. What is my next action?
    assert.match(content, /\/services/, 'Must provide direct CTA to select growth services');
    assert.match(content, /https:\/\/wa\.me\/2349026365853/, 'Must provide WhatsApp concierge quick trigger');
    assert.match(content, /\/growth\/projects/, 'Must provide quick access to all projects');

    // Sales snapshot connecting to Revenue Command Centre
    assert.match(content, /REVENUE ENGINE SNAPSHOT/, 'Must include Revenue Engine snapshot');
    assert.match(content, /\/dashboard\/revenue-engine/, 'Must provide 1-click link to Revenue Command Centre');
  });

  it('2. CloseCraft Dashboard strictly enforces dual-tier RBAC and tenant isolation', () => {
    const content = fs.readFileSync(dashboardPath, 'utf8');

    // Verifies role-based redirections
    assert.match(content, /redirect\('\/rep'\)/, 'Closers/Setters/External Pros redirected to rep view');
    assert.match(content, /redirect\('\/team'\)/, 'Managers redirected to team view');
    assert.match(content, /redirect\('\/onboarding'\)/, 'Uncompleted owner onboarding redirected');

    // Verifies strict tenant isolation
    assert.match(content, /where:\s*{\s*organizationId\s*}/, 'Queries must enforce organizationId filter');
  });

  it('3. Services Page & Catalogue showcases all 5 Introductory Growth Services', () => {
    assert.strictEqual(fs.existsSync(servicesPagePath), true, 'services/page.tsx must exist');
    assert.strictEqual(fs.existsSync(servicesClientPath), true, 'ServicesClient.tsx must exist');

    const clientContent = fs.readFileSync(servicesClientPath, 'utf8');

    // 5 Introductory Growth Services
    assert.match(clientContent, /ADS_MANAGEMENT/, 'Must include Facebook & Instagram Ads Management');
    assert.match(clientContent, /AI_FLYER_DESIGN/, 'Must include AI Image & Flyer Creation');
    assert.match(clientContent, /AI_VIDEO_CREATION/, 'Must include AI Video Creation');
    assert.match(clientContent, /LANDING_PAGE_DESIGN/, 'Must include Landing Page Design');
    assert.match(clientContent, /VSL_DESIGN/, 'Must include VSL Design');

    // Primary CTA is strictly GET STARTED
    assert.match(clientContent, /GET STARTED/, 'Primary CTA must be GET STARTED');
    assert.doesNotMatch(clientContent, /Book a Free Discovery Call/, 'Must NEVER use Book a Free Discovery Call');
  });

  it('4. Services Catalogue supports multi-service selection basket and consolidation', () => {
    const clientContent = fs.readFileSync(servicesClientPath, 'utf8');

    // Multi-service basket state and selection
    assert.match(clientContent, /selectedBasket/, 'Must manage multi-service basket state');
    assert.match(clientContent, /toggleBasketService/, 'Must support toggling services in basket');
    assert.match(clientContent, /ShoppingCart/, 'Must render basket indicator');
    assert.match(clientContent, /Proceed to Brief/, 'Must allow proceeding with basket of services');

    // Integrated ProjectBriefModal
    assert.match(clientContent, /ProjectBriefModal/, 'Must integrate ProjectBriefModal in SaaS');
  });

  it('5. Services Page lists active growth projects with milestone tracking and WhatsApp links', () => {
    const clientContent = fs.readFileSync(servicesClientPath, 'utf8');

    // Active projects tab
    assert.match(clientContent, /My Active Projects & Services/, 'Must provide dedicated tab for active work');
    assert.match(clientContent, /projectRequests/, 'Must render customer project requests');
    assert.match(clientContent, /Milestone Progress/, 'Must display delivery progression bar');
    assert.match(clientContent, /Open Project Workspace/, 'Must link directly to project workspace');
  });

  it('6. Growth Project Detail workspace provides end-to-end delivery tracking and Bachs payments', () => {
    assert.strictEqual(fs.existsSync(projectDetailPath), true, 'projects/[reference]/page.tsx must exist');
    assert.strictEqual(fs.existsSync(projectDetailClientPath), true, 'GrowthProjectDetailClient.tsx must exist');

    const detailContent = fs.readFileSync(projectDetailPath, 'utf8');
    const clientContent = fs.readFileSync(projectDetailClientPath, 'utf8');

    // Tenant protection
    assert.match(detailContent, /isOwnerOrg/, 'Must enforce organization boundary on project detail');

    // Concierge pipeline stages
    assert.match(clientContent, /Brief Submitted/, 'Pipeline stage 1');
    assert.match(clientContent, /Partner Assigned/, 'Pipeline stage 2');
    assert.match(clientContent, /WhatsApp Consultation/, 'Pipeline stage 3');
    assert.match(clientContent, /Proposal Issued/, 'Pipeline stage 4');
    assert.match(clientContent, /Invoiced/, 'Pipeline stage 5');
    assert.match(clientContent, /Paid/, 'Pipeline stage 6');
    assert.match(clientContent, /In Delivery/, 'Pipeline stage 7');
    assert.match(clientContent, /Completed/, 'Pipeline stage 8');

    // WhatsApp Concierge and Bachs integration
    assert.match(clientContent, /CONTINUE ON WHATSAPP/, 'WhatsApp consultation button');
    assert.match(clientContent, /GrowthProposalCard/, 'Commercial proposal review');
    assert.match(clientContent, /GrowthMilestonesTracker/, 'Milestone sign-off tracker');
    assert.match(clientContent, /GrowthReceiptModal/, 'Official verified receipts');
  });
});
