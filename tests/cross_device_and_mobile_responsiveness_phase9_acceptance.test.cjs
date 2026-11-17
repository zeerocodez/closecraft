const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('CloseCraft HQ Phase 9: Cross-Device & Mobile Responsiveness Acceptance Tests', async (t) => {
  const landingWrapperPath = path.join(__dirname, '../src/app/(marketing)/LandingClientWrapper.tsx');
  const howItWorksPath = path.join(__dirname, '../src/components/landing/HowItWorksProcess.tsx');
  const heroVisualPath = path.join(__dirname, '../src/components/landing/HeroContrastVisual.tsx');
  const revenueLeakPath = path.join(__dirname, '../src/components/landing/RevenueLeakSection.tsx');
  const calculatorPath = path.join(__dirname, '../src/components/landing/RevenueLeakageCalculator.tsx');
  const productsPath = path.join(__dirname, '../src/components/landing/ProductsShowcaseSection.tsx');
  const whoWeHelpPath = path.join(__dirname, '../src/components/landing/WhoWeHelpSection.tsx');
  const whyCloseCraftPath = path.join(__dirname, '../src/components/landing/WhyCloseCraftSection.tsx');
  const briefModalPath = path.join(__dirname, '../src/components/growth/ProjectBriefModal.tsx');
  const rootLayoutPath = path.join(__dirname, '../src/app/layout.tsx');

  const landingContent = fs.readFileSync(landingWrapperPath, 'utf8');
  const howItWorksContent = fs.readFileSync(howItWorksPath, 'utf8');
  const heroVisualContent = fs.readFileSync(heroVisualPath, 'utf8');
  const revenueLeakContent = fs.readFileSync(revenueLeakPath, 'utf8');
  const calculatorContent = fs.readFileSync(calculatorPath, 'utf8');
  const productsContent = fs.readFileSync(productsPath, 'utf8');
  const whoWeHelpContent = fs.readFileSync(whoWeHelpPath, 'utf8');
  const whyCloseCraftContent = fs.readFileSync(whyCloseCraftPath, 'utf8');
  const briefModalContent = fs.readFileSync(briefModalPath, 'utf8');
  const rootLayoutContent = fs.readFileSync(rootLayoutPath, 'utf8');

  await t.test('1. Mobile Navigation Drawer & Touch Menu Accessibility', () => {
    // Menu toggle button attributes
    assert.ok(landingContent.includes('aria-expanded={mobileMenuOpen}'));
    assert.ok(landingContent.includes('aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}'));
    assert.ok(landingContent.includes('lg:hidden'));

    // Mobile drawer menu items
    assert.ok(landingContent.includes('href="#how-it-works"'));
    assert.ok(landingContent.includes('href="#solutions"'));
    assert.ok(landingContent.includes('href="#services-catalogue"'));
    assert.ok(landingContent.includes('href="/dss"'));
    assert.ok(landingContent.includes('href="/about"'));
    assert.ok(landingContent.includes('href="/login"'));
  });

  await t.test('2. Hero Visual Contrast Responsive Stacking', () => {
    // Grid adapts from 1 column on mobile to 2 columns on md/lg screens
    assert.ok(heroVisualContent.includes('grid-cols-1 md:grid-cols-2'));
    assert.ok(heroVisualContent.includes('Without a System'));
    assert.ok(heroVisualContent.includes('With CloseCraft'));
  });

  await t.test('3. How It Works 4-Stage Horizontal/Vertical Responsive Flow', () => {
    // Stacks 1 column on mobile, 2 on tablet, 4 on desktop
    assert.ok(howItWorksContent.includes('grid-cols-1 md:grid-cols-2 lg:grid-cols-4'));
    // Connector arrows hidden on mobile, visible on desktop
    assert.ok(howItWorksContent.includes('hidden lg:block absolute'));
  });

  await t.test('4. Revenue Leak & Scenario Responsive Breakdown', () => {
    // 200-Enquiry matrix: 1 column on mobile, 4 columns on md+
    assert.ok(revenueLeakContent.includes('grid-cols-1 md:grid-cols-4'));
    // Cost of poor follow-up cards: 1 col on mobile, 2 on md, 3 on lg
    assert.ok(revenueLeakContent.includes('grid-cols-1 md:grid-cols-2 lg:grid-cols-3'));
  });

  await t.test('5. Touch Target & Slider Controls in Revenue Leakage Calculator', () => {
    // Sliders are full width with standard accent color
    assert.ok(calculatorContent.includes('w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#248277]'));
    // Response options adapt 1 col mobile, 2 col sm
    assert.ok(calculatorContent.includes('grid-cols-1 sm:grid-cols-2'));
    // Outer layout adapts 1 col mobile to 12 cols lg
    assert.ok(calculatorContent.includes('grid-cols-1 lg:grid-cols-12'));
  });

  await t.test('6. Products & Who We Help Responsive Grids', () => {
    // 3 dedicated products
    assert.ok(productsContent.includes('grid-cols-1 lg:grid-cols-3'));
    // 8 categories in Who We Help
    assert.ok(whoWeHelpContent.includes('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'));
    // Side-by-side comparison in Why CloseCraft
    assert.ok(whyCloseCraftContent.includes('grid-cols-1 md:grid-cols-12'));
  });

  await t.test('7. Modal Viewport Resilience & Scroll Containment', () => {
    // Audit Modal in LandingClientWrapper
    assert.ok(landingContent.includes('max-h-[90vh] overflow-y-auto'));
    assert.ok(landingContent.includes('fixed inset-0 z-50'));

    // Project Brief Modal
    assert.ok(briefModalContent.includes('fixed inset-0 z-50 flex items-center justify-center'));
    assert.ok(briefModalContent.includes('overflow-y-auto'));
    assert.ok(briefModalContent.includes('max-h-[75vh] overflow-y-auto'));
  });

  await t.test('8. Viewport & Semantic Document Setup', () => {
    // Root layout includes html with lang, meta tags, antialiased styling
    assert.ok(rootLayoutContent.includes('lang="en"'));
    assert.ok(rootLayoutContent.includes('metadata'));
  });
});
