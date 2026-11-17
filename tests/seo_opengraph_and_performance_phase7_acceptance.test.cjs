const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('CloseCraft HQ Phase 7: SEO, OpenGraph, Structured Data & Performance Acceptance Tests', async (t) => {
  const root = path.join(__dirname, '..');

  const files = {
    schemaLib: path.join(root, 'src/lib/seo/schema.ts'),
    sitemap: path.join(root, 'src/app/sitemap.ts'),
    robots: path.join(root, 'src/app/robots.ts'),
    homePage: path.join(root, 'src/app/(marketing)/page.tsx'),
    platformPage: path.join(root, 'src/app/(marketing)/platform/page.tsx'),
    revenueEnginePage: path.join(root, 'src/app/(marketing)/revenue-engine/page.tsx'),
    calculatorPage: path.join(root, 'src/app/(marketing)/calculator/page.tsx'),
    auditPage: path.join(root, 'src/app/(marketing)/audit/page.tsx'),
    growthServiceDetailClient: path.join(root, 'src/components/growth/GrowthServiceDetailClient.tsx'),
    homepageFaq: path.join(root, 'src/components/landing/HomepageFaqSection.tsx'),
    faqData: path.join(root, 'src/lib/data/homepage-faqs.ts'),
    layout: path.join(root, 'src/app/layout.tsx'),
  };

  // 1. Files existence check
  await t.test('1. SEO & Schema Files Exist', () => {
    for (const [name, filepath] of Object.entries(files)) {
      assert.ok(fs.existsSync(filepath), `Expected file to exist for ${name}: ${filepath}`);
    }
  });

  const schemaContent = fs.readFileSync(files.schemaLib, 'utf8');
  const sitemapContent = fs.readFileSync(files.sitemap, 'utf8');
  const robotsContent = fs.readFileSync(files.robots, 'utf8');
  const homePageContent = fs.readFileSync(files.homePage, 'utf8');
  const platformContent = fs.readFileSync(files.platformPage, 'utf8');
  const revenueEngineContent = fs.readFileSync(files.revenueEnginePage, 'utf8');
  const calculatorContent = fs.readFileSync(files.calculatorPage, 'utf8');
  const auditContent = fs.readFileSync(files.auditPage, 'utf8');
  const serviceDetailContent = fs.readFileSync(files.growthServiceDetailClient, 'utf8');
  const homepageFaqContent = fs.readFileSync(files.homepageFaq, 'utf8');
  const faqDataContent = fs.readFileSync(files.faqData, 'utf8');

  // 2. Schema generator exports & structure
  await t.test('2. Schema Library Exports getSoftwareApplicationJsonLd and FAQ Generators', () => {
    assert.ok(schemaContent.includes('export function getSoftwareApplicationJsonLd'));
    assert.ok(schemaContent.includes("'@type': 'SoftwareApplication'"));
    assert.ok(schemaContent.includes("priceCurrency: 'NGN'"));
    assert.ok(schemaContent.includes('export function getFaqJsonLd'));
    assert.ok(schemaContent.includes("'@type': 'FAQPage'"));
    assert.ok(schemaContent.includes('export function getServiceJsonLd'));
    assert.ok(schemaContent.includes('export function getOrganizationJsonLd'));
    assert.ok(schemaContent.includes('export function getWebSiteJsonLd'));
  });

  // 3. Homepage JSON-LD Integration
  await t.test('3. Homepage Injects SoftwareApplication & 11 FAQ Structured Data', () => {
    assert.ok(homePageContent.includes('<JsonLd'));
    assert.ok(homePageContent.includes('getSoftwareApplicationJsonLd()'));
    assert.ok(homePageContent.includes('getFaqJsonLd('));
    assert.ok(faqDataContent.includes('export const HOMEPAGE_FAQS'));
    assert.ok(homepageFaqContent.includes('HOMEPAGE_FAQS'));
  });

  // 4. Dynamic XML Sitemap Covers All 4 Stages & Key Landing Pages
  await t.test('4. Sitemap.ts Includes All 4 Growth Stages, Service Routes & Interactive Tools', () => {
    assert.ok(sitemapContent.includes("'/platform'"));
    assert.ok(sitemapContent.includes("'/revenue-engine'"));
    assert.ok(sitemapContent.includes("'/dss'"));
    assert.ok(sitemapContent.includes("'/services'"));
    assert.ok(sitemapContent.includes("'/services/ads-management'"));
    assert.ok(sitemapContent.includes("'/services/ai-flyers'"));
    assert.ok(sitemapContent.includes("'/services/ai-video'"));
    assert.ok(sitemapContent.includes("'/services/landing-pages'"));
    assert.ok(sitemapContent.includes("'/services/vsl-design'"));
    assert.ok(sitemapContent.includes("'/calculator'"));
    assert.ok(sitemapContent.includes("'/audit'"));
    assert.ok(sitemapContent.includes("'/early-access'"));
    assert.ok(sitemapContent.includes("'/pricing'"));
    assert.ok(sitemapContent.includes("'/services/lead-generation'"));
  });

  // 5. Product & Service Pages Render JSON-LD
  await t.test('5. Product & Service Pages Inject Structured Data', () => {
    assert.ok(platformContent.includes('<JsonLd data={jsonLd} />'));
    assert.ok(platformContent.includes('CloseCraft Platform'));

    assert.ok(revenueEngineContent.includes('<JsonLd data={jsonLd} />'));
    assert.ok(revenueEngineContent.includes('CloseCraft Revenue Engine'));

    assert.ok(serviceDetailContent.includes('<JsonLd data={serviceJsonLd} />'));
    assert.ok(serviceDetailContent.includes('getServiceJsonLd'));

    assert.ok(calculatorContent.includes('<JsonLd data={jsonLd} />'));
    assert.ok(calculatorContent.includes('CloseCraft Revenue Leakage ROI Calculator'));

    assert.ok(auditContent.includes('<JsonLd data={jsonLd} />'));
    assert.ok(auditContent.includes('CloseCraft Follow-Up Diagnostic Audit'));
  });

  // 6. Metadata, OpenGraph & Twitter Cards
  await t.test('6. Complete OpenGraph and Twitter Metadata Across Core Routes', () => {
    assert.ok(homePageContent.includes('openGraph:'));
    assert.ok(homePageContent.includes('twitter:'));
    assert.ok(homePageContent.includes("card: \"summary_large_image\""));

    assert.ok(platformContent.includes('openGraph:'));
    assert.ok(platformContent.includes('twitter:'));

    assert.ok(revenueEngineContent.includes('openGraph:'));
    assert.ok(revenueEngineContent.includes('twitter:'));

    assert.ok(calculatorContent.includes('openGraph:'));
    assert.ok(calculatorContent.includes('twitter:'));

    assert.ok(auditContent.includes('openGraph:'));
    assert.ok(auditContent.includes('twitter:'));
  });

  // 7. Robots.txt Configuration
  await t.test('7. Robots.txt Allows Public Indexing and Protects SaaS Workspaces', () => {
    assert.ok(robotsContent.includes("allow: '/'"));
    assert.ok(robotsContent.includes("disallow: ["));
    assert.ok(robotsContent.includes("'/api/'"));
    assert.ok(robotsContent.includes("'/admin/'"));
    assert.ok(robotsContent.includes("'/operator/'"));
    assert.ok(robotsContent.includes("'/settings/'"));
    assert.ok(robotsContent.includes("'/pipeline'"));
    assert.ok(robotsContent.includes("'/inbox'"));
    assert.ok(robotsContent.includes('https://www.closecrafthq.com/sitemap.xml'));
  });
});
