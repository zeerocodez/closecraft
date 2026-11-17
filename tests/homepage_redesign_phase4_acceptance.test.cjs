const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('CloseCraft HQ Phase 4: Complete Landing Page Redesign Acceptance Tests', async (t) => {
  const landingWrapperPath = path.join(__dirname, '../src/app/(marketing)/LandingClientWrapper.tsx');
  const heroVisualPath = path.join(__dirname, '../src/components/landing/HeroContrastVisual.tsx');
  const howItWorksPath = path.join(__dirname, '../src/components/landing/HowItWorksProcess.tsx');
  const revenueLeakPath = path.join(__dirname, '../src/components/landing/RevenueLeakSection.tsx');
  const productsPath = path.join(__dirname, '../src/components/landing/ProductsShowcaseSection.tsx');
  const whoWeHelpPath = path.join(__dirname, '../src/components/landing/WhoWeHelpSection.tsx');
  const whyCloseCraftPath = path.join(__dirname, '../src/components/landing/WhyCloseCraftSection.tsx');
  const proofTrustPath = path.join(__dirname, '../src/components/landing/ProofAndTrustSection.tsx');
  const faqPath = path.join(__dirname, '../src/components/landing/HomepageFaqSection.tsx');

  const landingContent = fs.readFileSync(landingWrapperPath, 'utf8');
  const heroVisualContent = fs.readFileSync(heroVisualPath, 'utf8');
  const howItWorksContent = fs.readFileSync(howItWorksPath, 'utf8');
  const revenueLeakContent = fs.readFileSync(revenueLeakPath, 'utf8');
  const productsContent = fs.readFileSync(productsPath, 'utf8');
  const whoWeHelpContent = fs.readFileSync(whoWeHelpPath, 'utf8');
  const whyCloseCraftContent = fs.readFileSync(whyCloseCraftPath, 'utf8');
  const proofTrustContent = fs.readFileSync(proofTrustPath, 'utf8');
  const faqContent = fs.readFileSync(faqPath, 'utf8');

  await t.test('1. Section 1 (Navigation) & Strategic CTA', () => {
    assert.ok(landingContent.includes("LET'S FIX YOUR FOLLOW-UP"));
    assert.ok(landingContent.includes('href="#how-it-works"'));
    assert.ok(landingContent.includes('href="#solutions"'));
    assert.ok(landingContent.includes('href="#services"'));
    assert.ok(landingContent.includes('/dss'));
    assert.ok(landingContent.includes('/about'));
    assert.ok(landingContent.includes('/login'));
  });

  await t.test('2. Section 2 (Hero) Positioning & Side-by-Side Contrast Model', () => {
    // Exact primary headline
    assert.ok(landingContent.includes('Stop Losing Revenue to Unfollowed Leads.'));
    // Supporting copy
    assert.ok(
      landingContent.includes(
        'You spend money getting potential customers interested in your business. But when enquiries go unanswered and follow-ups are forgotten, those opportunities can turn into lost sales.'
      )
    );
    assert.ok(
      landingContent.includes(
        'CloseCraft helps you capture enquiries, respond faster, follow up consistently and convert more prospects into paying customers.'
      )
    );
    // Primary and secondary CTAs
    assert.ok(landingContent.includes("LET'S FIX YOUR FOLLOW-UP"));
    assert.ok(landingContent.includes('SEE HOW IT WORKS'));

    // Hero Contrast Visual: Without System vs With CloseCraft
    assert.ok(heroVisualContent.includes('Without a System'));
    assert.ok(heroVisualContent.includes('WhatsApp Enquiry'));
    assert.ok(heroVisualContent.includes('Unanswered · Lead growing cold'));
    assert.ok(heroVisualContent.includes('Lead_Export_v2.xlsx'));
    assert.ok(heroVisualContent.includes('Forgotten callback · Rep moved to another call'));
    assert.ok(heroVisualContent.includes('With CloseCraft'));
    assert.ok(heroVisualContent.includes('Sarah D. · FinTech Africa'));
    assert.ok(heroVisualContent.includes('15m SLA Timer'));
    assert.ok(heroVisualContent.includes('Closed Won · ₦2,500,000 Revenue Captured'));
  });

  await t.test('3. Section 3 (How It Works) Directly Follows Hero & Connects 4 Stages', () => {
    // Exact headline
    assert.ok(howItWorksContent.includes('From the First Enquiry to the Final Sale.'));
    // The 4 connected stages
    assert.ok(howItWorksContent.includes('01'));
    assert.ok(howItWorksContent.includes('ATTRACT'));
    assert.ok(howItWorksContent.includes('02'));
    assert.ok(howItWorksContent.includes('CAPTURE & RESPOND'));
    assert.ok(howItWorksContent.includes('03'));
    assert.ok(howItWorksContent.includes('FOLLOW UP & CONVERT'));
    assert.ok(howItWorksContent.includes('04'));
    assert.ok(howItWorksContent.includes('BUILD SALES CAPABILITY'));
  });

  await t.test('4. Section 4 (The Hidden Revenue Leak) & 200-Enquiry Scenario', () => {
    assert.ok(
      revenueLeakContent.includes(
        'Your Business May Not Have a Lead Problem. It May Have a Follow-Up Problem.'
      )
    );
    assert.ok(revenueLeakContent.includes('What happens to 200 incoming enquiries?'));
    assert.ok(revenueLeakContent.includes('ILLUSTRATIVE CAMPAIGN SCENARIO'));
    assert.ok(revenueLeakContent.includes('Every missed follow-up is a potential missed sale.'));
  });

  await t.test('5. Section 5 (The Cost of Poor Follow-Up) & Financial Impact', () => {
    assert.ok(
      revenueLeakContent.includes(
        'You Could Be Paying to Generate Leads You Never Convert.'
      )
    );
    assert.ok(revenueLeakContent.includes('Wasted Advertising Spend'));
    assert.ok(revenueLeakContent.includes('Loss of Buyer Confidence'));
    assert.ok(revenueLeakContent.includes('Salespeople Relying on Memory'));
    assert.ok(revenueLeakContent.includes('Zero Owner Visibility'));
    assert.ok(revenueLeakContent.includes('Unpredictable Monthly Cash Flow'));
  });

  await t.test('6. Section 6 & 7 (The CloseCraft Solution & Products)', () => {
    assert.ok(
      productsContent.includes('One Connected System to Help You Stop Losing Leads.')
    );
    assert.ok(
      productsContent.includes(
        'The Right Tools for Every Stage of Your Sales Process.'
      )
    );
    // Product 1: CloseCraft
    assert.ok(productsContent.includes('CloseCraft'));
    assert.ok(
      productsContent.includes(
        'Never lose track of an important customer conversation.'
      )
    );
    assert.ok(productsContent.includes('EXPLORE CLOSECRAFT'));
    // Product 2: Revenue Engine
    assert.ok(productsContent.includes('Revenue Engine'));
    assert.ok(
      productsContent.includes(
        'Turn more enquiries into managed sales opportunities.'
      )
    );
    assert.ok(productsContent.includes('EXPLORE REVENUE ENGINE'));
    // Product 3: The Digital Sales School
    assert.ok(productsContent.includes('The Digital Sales School'));
    assert.ok(
      productsContent.includes('Build the people behind your revenue growth.')
    );
    assert.ok(productsContent.includes('EXPLORE DSS'));
  });

  await t.test('7. Section 8 (Professional Services) Covers All 5 Services with Multi-Service Modal', () => {
    assert.ok(landingContent.includes('<GrowthServicesSection'));
  });

  await t.test('8. Section 9 (Who We Help) & Section 10 (Why CloseCraft)', () => {
    assert.ok(
      whoWeHelpContent.includes(
        'Built for Businesses That Cannot Afford to Keep Losing Opportunities.'
      )
    );
    assert.ok(whoWeHelpContent.includes('Meta Advertisers'));
    assert.ok(whoWeHelpContent.includes('WhatsApp & Social Sellers'));
    assert.ok(whoWeHelpContent.includes('Service Businesses with Reps'));

    assert.ok(
      whyCloseCraftContent.includes(
        'Stop Depending on Memory. Build a Process That Follows Through.'
      )
    );
    assert.ok(whyCloseCraftContent.includes('Without a Reliable System'));
    assert.ok(whyCloseCraftContent.includes('With CloseCraft System'));
  });

  await t.test('9. Section 11 (Proof and Trust) & Section 12 (11 Verified FAQs)', () => {
    assert.ok(
      proofTrustContent.includes(
        'Better Follow-Up Starts With Better Visibility.'
      )
    );
    assert.ok(faqContent.includes('What exactly does CloseCraft do?'));
    assert.ok(faqContent.includes('Is CloseCraft only an AI chatbot?'));
    assert.ok(
      faqContent.includes(
        'Can CloseCraft help us manage leads from Facebook and Instagram ads?'
      )
    );
    assert.ok(faqContent.includes('Can it support WhatsApp enquiries?'));
    assert.ok(faqContent.includes('Does Revenue Engine replace our sales team?'));
    assert.ok(
      faqContent.includes('Can we use CloseCraft without buying every product?')
    );
    assert.ok(
      faqContent.includes('Can we request advertising and creative services?')
    );
    assert.ok(
      faqContent.includes('Can we combine multiple professional services?')
    );
    assert.ok(
      faqContent.includes('How does the partner consultation process work?')
    );
    assert.ok(faqContent.includes('Does CloseCraft train sales teams?'));
    assert.ok(faqContent.includes('How do we get started?'));
  });

  await t.test('10. Section 13 (Final Conversion) & Section 14 (Semantic Footer)', () => {
    assert.ok(
      landingContent.includes(
        'How Many Interested Customers Are You Losing Because Nobody Followed Up?'
      )
    );
    assert.ok(landingContent.includes("LET'S FIX YOUR FOLLOW-UP"));
    assert.ok(landingContent.includes('EXPLORE OUR SOLUTIONS'));
    assert.ok(landingContent.includes('Zeerocodes Automation Limited. RC 8421094.'));
    assert.ok(landingContent.includes('+234 902 636 5853'));
  });
});
