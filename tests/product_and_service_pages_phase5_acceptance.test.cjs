const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('CloseCraft HQ Phase 5: Product & Service Page Redesign Acceptance Tests', async (t) => {
  const root = path.join(__dirname, '..');

  const files = {
    platform: path.join(root, 'src/app/(marketing)/platform/page.tsx'),
    revenueEngine: path.join(root, 'src/app/(marketing)/revenue-engine/page.tsx'),
    servicesDirectory: path.join(root, 'src/components/growth/ServicesDirectoryClient.tsx'),
    servicesPage: path.join(root, 'src/app/(saas)/services/page.tsx'),
    adsManagement: path.join(root, 'src/app/(marketing)/services/ads-management/page.tsx'),
    aiFlyers: path.join(root, 'src/app/(marketing)/services/ai-flyers/page.tsx'),
    aiVideo: path.join(root, 'src/app/(marketing)/services/ai-video/page.tsx'),
    landingPages: path.join(root, 'src/app/(marketing)/services/landing-pages/page.tsx'),
    vslDesign: path.join(root, 'src/app/(marketing)/services/vsl-design/page.tsx'),
    serviceDetailClient: path.join(root, 'src/components/growth/GrowthServiceDetailClient.tsx'),
    dssLanding: path.join(root, 'src/app/dss/DSSLandingClient.tsx'),
    growthServicesDef: path.join(root, 'src/lib/growth/services.ts'),
  };

  // 1. Verify existence of all product and service pages
  await t.test('1. All 8 Dedicated Product & Service Pages Exist', () => {
    for (const [name, filepath] of Object.entries(files)) {
      assert.ok(fs.existsSync(filepath), `Expected file to exist for ${name}: ${filepath}`);
    }
  });

  const platformContent = fs.readFileSync(files.platform, 'utf8');
  const revenueEngineContent = fs.readFileSync(files.revenueEngine, 'utf8');
  const servicesDirectoryContent = fs.readFileSync(files.servicesDirectory, 'utf8');
  const servicesPageContent = fs.readFileSync(files.servicesPage, 'utf8');
  const serviceDetailClientContent = fs.readFileSync(files.serviceDetailClient, 'utf8');
  const adsManagementContent = fs.readFileSync(files.adsManagement, 'utf8');
  const aiFlyersContent = fs.readFileSync(files.aiFlyers, 'utf8');
  const aiVideoContent = fs.readFileSync(files.aiVideo, 'utf8');
  const landingPagesContent = fs.readFileSync(files.landingPages, 'utf8');
  const vslDesignContent = fs.readFileSync(files.vslDesign, 'utf8');
  const growthServicesContent = fs.readFileSync(files.growthServicesDef, 'utf8');

  // 2. CloseCraft Platform Page answers all 5 Core Questions
  await t.test('2. CloseCraft Platform Page Answers 5 Core Questions', () => {
    assert.ok(platformContent.includes('What problem does CloseCraft solve?'));
    assert.ok(platformContent.includes('Who is CloseCraft built for?'));
    assert.ok(platformContent.includes('How does CloseCraft operate?'));
    assert.ok(platformContent.includes('What does the customer receive?'));
    assert.ok(platformContent.includes('Ready to centralise your customer conversations?'));
    assert.ok(platformContent.includes('Unified Multichannel Lead Inbox'));
    assert.ok(platformContent.includes('Create My Trial Workspace'));
  });

  // 3. Revenue Engine Page answers all 5 Core Questions
  await t.test('3. Revenue Engine Page Answers 5 Core Questions', () => {
    assert.ok(revenueEngineContent.includes('What problem does Revenue Engine solve?'));
    assert.ok(revenueEngineContent.includes('Who is Revenue Engine built for?'));
    assert.ok(revenueEngineContent.includes('How does the engine operate?'));
    assert.ok(revenueEngineContent.includes('What does the customer receive?'));
    assert.ok(revenueEngineContent.includes('Ready to give every lead a clear next action?'));
    assert.ok(revenueEngineContent.includes('Explainable Next Best Action Queue'));
    assert.ok(revenueEngineContent.includes('Create My Trial Workspace'));
  });

  // 4. Growth Services Directory Page answers all 5 Core Questions
  await t.test('4. Services Directory Page Answers 5 Core Questions & Features Brief Modal', () => {
    assert.ok(servicesDirectoryContent.includes('What problem do these services solve?'));
    assert.ok(servicesDirectoryContent.includes('Who are these services for?'));
    assert.match(servicesDirectoryContent, /What is the consultation (&|&amp;) delivery workflow\?/);
    assert.ok(servicesDirectoryContent.includes('What does the customer receive?'));
    assert.ok(servicesDirectoryContent.includes('Ready to launch your growth project?'));
    assert.ok(servicesDirectoryContent.includes('ProjectBriefModal'));
    assert.ok(servicesDirectoryContent.includes('GET STARTED'));
    assert.ok(servicesPageContent.includes('<ServicesDirectoryClient'));
  });

  // 5. Growth Service Detail Client answers all 5 Core Questions & Enforces GET STARTED
  await t.test('5. Growth Service Detail Client Answers 5 Core Questions & Uses Strict GET STARTED CTA', () => {
    assert.ok(serviceDetailClientContent.includes('What problem does this solve?'));
    assert.ok(serviceDetailClientContent.includes('Who is this service for?'));
    assert.ok(serviceDetailClientContent.includes('How does execution work?'));
    assert.ok(serviceDetailClientContent.includes('What does the customer receive?'));
    assert.ok(serviceDetailClientContent.includes('Ready to begin?'));
    assert.ok(serviceDetailClientContent.includes('GET STARTED'));
    assert.ok(!serviceDetailClientContent.includes('Book a Free Discovery Call'));
  });

  // 6. Connected Growth System Visual Journey present on all Service Pages
  await t.test('6. Connected Revenue Loop (Attract -> Capture -> Follow Up -> Capability) is Present', () => {
    assert.ok(serviceDetailClientContent.includes('Part of One Connected Growth System'));
    assert.ok(serviceDetailClientContent.includes('01. ATTRACT (THIS SERVICE)'));
    assert.match(serviceDetailClientContent, /02\. CAPTURE (&|&amp;) RESPOND/);
    assert.match(serviceDetailClientContent, /03\. FOLLOW UP (&|&amp;) CONVERT/);
    assert.ok(serviceDetailClientContent.includes('04. BUILD SALES CAPABILITY'));
  });

  // 7. Individual Service Page Configuration & Keys
  await t.test('7. Dedicated Service Pages Configure Correct Keys & Copy', () => {
    assert.ok(adsManagementContent.includes('serviceKey="ADS_MANAGEMENT"'));
    assert.ok(adsManagementContent.includes('PAID ACQUISITION'));
    assert.ok(adsManagementContent.includes('Facebook & Instagram Ads Management'));

    assert.ok(aiFlyersContent.includes('serviceKey="AI_FLYER_DESIGN"'));
    assert.ok(aiFlyersContent.includes('CREATIVE & VISUALS'));
    assert.ok(aiFlyersContent.includes('AI Image & Flyer Creation'));

    assert.ok(aiVideoContent.includes('serviceKey="AI_VIDEO_CREATION"'));
    assert.ok(aiVideoContent.includes('VIDEO MARKETING'));
    assert.ok(aiVideoContent.includes('AI Video Creation'));

    assert.ok(landingPagesContent.includes('serviceKey="LANDING_PAGE_DESIGN"'));
    assert.ok(landingPagesContent.includes('CONVERSION RATE'));
    assert.ok(landingPagesContent.includes('Landing Page Design'));

    assert.ok(vslDesignContent.includes('serviceKey="VSL_DESIGN"'));
    assert.ok(vslDesignContent.includes('CLOSING ENGINE'));
    assert.ok(vslDesignContent.includes('Video Sales Letter (VSL) Design'));
  });
});
