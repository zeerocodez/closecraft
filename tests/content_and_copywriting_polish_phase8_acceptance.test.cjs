const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('CloseCraft HQ Phase 8: Content, Copywriting Polish & Editorial Consistency Acceptance Tests', async (t) => {
  const landingWrapperPath = path.join(__dirname, '../src/app/(marketing)/LandingClientWrapper.tsx');
  const howItWorksPath = path.join(__dirname, '../src/components/landing/HowItWorksProcess.tsx');
  const revenueLeakPath = path.join(__dirname, '../src/components/landing/RevenueLeakSection.tsx');
  const productsPath = path.join(__dirname, '../src/components/landing/ProductsShowcaseSection.tsx');
  const whoWeHelpPath = path.join(__dirname, '../src/components/landing/WhoWeHelpSection.tsx');
  const whyCloseCraftPath = path.join(__dirname, '../src/components/landing/WhyCloseCraftSection.tsx');
  const proofTrustPath = path.join(__dirname, '../src/components/landing/ProofAndTrustSection.tsx');
  const servicesDirectoryPath = path.join(__dirname, '../src/components/growth/ServicesDirectoryClient.tsx');
  const serviceDetailPath = path.join(__dirname, '../src/components/growth/GrowthServiceDetailClient.tsx');
  const platformPagePath = path.join(__dirname, '../src/app/(marketing)/platform/page.tsx');
  const revenueEnginePagePath = path.join(__dirname, '../src/app/(marketing)/revenue-engine/page.tsx');

  const landingContent = fs.readFileSync(landingWrapperPath, 'utf8');
  const howItWorksContent = fs.readFileSync(howItWorksPath, 'utf8');
  const revenueLeakContent = fs.readFileSync(revenueLeakPath, 'utf8');
  const productsContent = fs.readFileSync(productsPath, 'utf8');
  const whoWeHelpContent = fs.readFileSync(whoWeHelpPath, 'utf8');
  const whyCloseCraftContent = fs.readFileSync(whyCloseCraftPath, 'utf8');
  const proofTrustContent = fs.readFileSync(proofTrustPath, 'utf8');
  const servicesDirContent = fs.readFileSync(servicesDirectoryPath, 'utf8');
  const serviceDetailContent = fs.readFileSync(serviceDetailPath, 'utf8');
  const platformContent = fs.readFileSync(platformPagePath, 'utf8');
  const revEngineContent = fs.readFileSync(revenueEnginePagePath, 'utf8');

  await t.test('1. Core Strategic Positioning & Brand Promise', () => {
    assert.ok(landingContent.includes('Stop Losing Revenue to Unfollowed Leads.'));
    assert.ok(landingContent.includes('Every enquiry deserves a follow-up. Every opportunity deserves a clear next step.'));
    assert.ok(landingContent.includes('You spend money getting potential customers interested in your business. But when enquiries go unanswered and follow-ups are forgotten, those opportunities can turn into lost sales.'));
    assert.ok(landingContent.includes('CloseCraft helps you capture enquiries, respond faster, follow up consistently and convert more prospects into paying customers.'));
  });

  await t.test('2. Four Connected Stages (Attract -> Capture -> Follow Up -> Build Capability)', () => {
    assert.ok(howItWorksContent.includes('From the First Enquiry to the Final Sale.'));
    assert.ok(howItWorksContent.includes('01. ATTRACT'));
    assert.ok(howItWorksContent.includes('02. CAPTURE &amp; RESPOND') || howItWorksContent.includes('02. CAPTURE & RESPOND'));
    assert.ok(howItWorksContent.includes('03. FOLLOW UP &amp; CONVERT') || howItWorksContent.includes('03. FOLLOW UP & CONVERT'));
    assert.ok(howItWorksContent.includes('04. BUILD SALES CAPABILITY'));
  });

  await t.test('3. Exact CTA Standards Across Surfaces', () => {
    // Primary Homepage CTA
    assert.ok(landingContent.includes("LET'S FIX YOUR FOLLOW-UP"));
    assert.ok(landingContent.includes('SEE HOW IT WORKS'));

    // Professional Growth Services must strictly use GET STARTED
    assert.ok(servicesDirContent.includes('GET STARTED'));
    assert.ok(!servicesDirContent.includes('Book a Free Discovery Call'));
    assert.ok(serviceDetailContent.includes('GET STARTED'));
    assert.ok(!serviceDetailContent.includes('Book a Free Discovery Call'));
  });

  await t.test('4. Scenario Labelling & Anti-Fabrication Safeguards', () => {
    assert.ok(
      revenueLeakContent.includes('Hypothetical illustrative model. Not a guarantee of volume or individual results.') ||
      revenueLeakContent.includes('Illustrative campaign scenario') ||
      revenueLeakContent.includes('ILLUSTRATIVE CAMPAIGN SCENARIO')
    );
    assert.ok(revenueLeakContent.includes('Every missed follow-up is a potential missed sale.'));
  });

  await t.test('5. Operational Products & Solution Messaging', () => {
    assert.ok(productsContent.includes('One Connected System to Help You Stop Losing Leads.'));
    assert.ok(productsContent.includes('The Right Tools for Every Stage of Your Sales Process.'));
    assert.ok(productsContent.includes('CloseCraft'));
    assert.ok(productsContent.includes('Revenue Engine'));
    assert.ok(productsContent.includes('The Digital Sales School'));
  });

  await t.test('6. Who We Help & Why CloseCraft Comparison Structure', () => {
    assert.ok(whoWeHelpContent.includes('Built for Businesses That Cannot Afford to Keep Losing Opportunities.'));
    assert.ok(whyCloseCraftContent.includes('Stop Depending on Memory. Build a Process That Follows Through.'));
    assert.ok(whyCloseCraftContent.includes('Without a Reliable System'));
    assert.ok(whyCloseCraftContent.includes('With CloseCraft System'));
  });

  await t.test('7. Proof, Trust & Final Conversion Action', () => {
    assert.ok(proofTrustContent.includes('Better Follow-Up Starts With Better Visibility.'));
    assert.ok(landingContent.includes('How Many Interested Customers Are You Losing Because Nobody Followed Up?'));
    assert.ok(landingContent.includes('Zeerocodes Automation Limited. RC 8421094.'));
    assert.ok(landingContent.includes('+234 902 636 5853'));
  });

  await t.test('8. Core Explanatory Questions Answered on Dedicated Subpages', () => {
    // Platform page
    assert.ok(platformContent.includes('What problem does CloseCraft solve?'));
    assert.ok(platformContent.includes('Who is CloseCraft built for?'));
    assert.ok(platformContent.includes('How does CloseCraft operate?'));
    assert.ok(platformContent.includes('What does the customer receive?'));
    assert.ok(platformContent.includes('Ready to centralise your customer conversations?'));

    // Revenue Engine page
    assert.ok(revEngineContent.includes('What problem does Revenue Engine solve?'));
    assert.ok(revEngineContent.includes('Who is Revenue Engine built for?'));
    assert.ok(revEngineContent.includes('How does the engine operate?'));
    assert.ok(revEngineContent.includes('What does the customer receive?'));
    assert.ok(revEngineContent.includes('Ready to give every lead a clear next action?'));
  });
});
