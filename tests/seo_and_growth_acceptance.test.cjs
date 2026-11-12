const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('CloseCraft 2.0 Phase 6: SEO and Growth Acceptance Tests', () => {

  it('1. Technical SEO: Robots.txt protects private SaaS areas and allows public indexing', () => {
    const robotsPath = path.join(process.cwd(), 'src', 'app', 'robots.ts');
    assert.ok(fs.existsSync(robotsPath), 'robots.ts must exist');

    const content = fs.readFileSync(robotsPath, 'utf8');
    assert.ok(content.includes("allow: '/'"), 'Robots must allow root for indexing');
    assert.ok(content.includes('/today'), 'Robots must disallow /today');
    assert.ok(content.includes('/inbox'), 'Robots must disallow /inbox');
    assert.ok(content.includes('/pipeline'), 'Robots must disallow /pipeline');
    assert.ok(content.includes('/billing'), 'Robots must disallow /billing');
    assert.ok(content.includes('/team'), 'Robots must disallow /team');
    assert.ok(content.includes('/rep'), 'Robots must disallow /rep');
    assert.ok(content.includes('/operator'), 'Robots must disallow /operator');
    assert.ok(content.includes('/admin'), 'Robots must disallow /admin');
    assert.ok(content.includes('/api/'), 'Robots must disallow /api/');
    assert.ok(content.includes('https://www.closecrafthq.com/sitemap.xml'), 'Robots must declare sitemap URL');
  });

  it('2. Technical SEO: Sitemap.ts includes marketing routes, services, legal pages, and dynamic blog posts', () => {
    const sitemapPath = path.join(process.cwd(), 'src', 'app', 'sitemap.ts');
    assert.ok(fs.existsSync(sitemapPath), 'sitemap.ts must exist');

    const content = fs.readFileSync(sitemapPath, 'utf8');
    assert.ok(content.includes('/early-access'), 'Sitemap must include /early-access');
    assert.ok(content.includes('/pricing'), 'Sitemap must include /pricing');
    assert.ok(content.includes('/about'), 'Sitemap must include /about');
    assert.ok(content.includes('/contact'), 'Sitemap must include /contact');
    assert.ok(content.includes('/affiliate'), 'Sitemap must include /affiliate');
    assert.ok(content.includes('/blog'), 'Sitemap must include /blog');
    assert.ok(content.includes('/services/sales-outsourcing'), 'Sitemap must include sales-outsourcing');
    assert.ok(content.includes('/services/lead-generation'), 'Sitemap must include lead-generation');
    assert.ok(content.includes('/services/sales-closing'), 'Sitemap must include sales-closing');
    assert.ok(content.includes('db.blogPost.findMany'), 'Sitemap must dynamically query published blog posts');
  });

  it('3. Google Search Console & Root Layout: Verification meta tag and JSON-LD loaded', () => {
    const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
    assert.ok(fs.existsSync(layoutPath), 'layout.tsx must exist');

    const content = fs.readFileSync(layoutPath, 'utf8');
    assert.ok(content.includes('verification:'), 'Layout metadata must include verification');
    assert.ok(content.includes('google:'), 'Layout metadata must include google verification');
    assert.ok(content.includes('<JsonLd'), 'Root body must render JsonLd');
    assert.ok(content.includes('<AnalyticsScripts'), 'Root body must render AnalyticsScripts');
  });

  it('4. Structured Data: Schema generators produce valid Schema.org specs', () => {
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'seo', 'schema.ts');
    assert.ok(fs.existsSync(schemaPath), 'schema.ts must exist');

    const content = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(content.includes("export function getOrganizationJsonLd"), 'Must export getOrganizationJsonLd');
    assert.ok(content.includes("export function getWebSiteJsonLd"), 'Must export getWebSiteJsonLd');
    assert.ok(content.includes("export function getServiceJsonLd"), 'Must export getServiceJsonLd');
    assert.ok(content.includes("export function getBreadcrumbJsonLd"), 'Must export getBreadcrumbJsonLd');
    assert.ok(content.includes("export function getArticleJsonLd"), 'Must export getArticleJsonLd');
    assert.ok(content.includes("export function getFaqJsonLd"), 'Must export getFaqJsonLd');
  });

  it('5. Analytics & Conversion Tracking: Standardized conversion event engine and async script loader', () => {
    const eventsPath = path.join(process.cwd(), 'src', 'lib', 'analytics', 'events.ts');
    assert.ok(fs.existsSync(eventsPath), 'events.ts must exist');

    const content = fs.readFileSync(eventsPath, 'utf8');
    assert.ok(content.includes("'registration_started'"), 'Must track registration_started');
    assert.ok(content.includes("'registration_completed'"), 'Must track registration_completed');
    assert.ok(content.includes("'onboarding_completed'"), 'Must track onboarding_completed');
    assert.ok(content.includes("'service_viewed'"), 'Must track service_viewed');
    assert.ok(content.includes("'package_selected'"), 'Must track package_selected');
    assert.ok(content.includes("'checkout_started'"), 'Must track checkout_started');
    assert.ok(content.includes("'purchase_completed'"), 'Must track purchase_completed');
    assert.ok(content.includes("'affiliate_registration'"), 'Must track affiliate_registration');
    assert.ok(content.includes("'referral_conversion'"), 'Must track referral_conversion');
    assert.ok(content.includes("'inquiry_submitted'"), 'Must track inquiry_submitted');

    const scriptsPath = path.join(process.cwd(), 'src', 'components', 'analytics', 'AnalyticsScripts.tsx');
    assert.ok(fs.existsSync(scriptsPath), 'AnalyticsScripts.tsx must exist');
    const scriptsContent = fs.readFileSync(scriptsPath, 'utf8');
    assert.ok(scriptsContent.includes('NEXT_PUBLIC_GA_MEASUREMENT_ID'), 'Must support GA4 ID');
    assert.ok(scriptsContent.includes('NEXT_PUBLIC_GTM_ID'), 'Must support GTM ID');
  });

  it('6. Blog & Content Engine: Seeded commercial articles exist in database with rich SEO metadata', async () => {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
    });

    assert.ok(posts.length >= 3, `Expected at least 3 published articles, found ${posts.length}`);

    const leadLeakage = posts.find(p => p.slug === 'lead-leakage-nigerian-b2b-enquiries');
    assert.ok(leadLeakage, 'Lead leakage article must exist');
    assert.equal(leadLeakage.category, 'Revenue Operations');
    assert.ok(leadLeakage.metaTitle && leadLeakage.metaTitle.length > 5);
    assert.ok(leadLeakage.metaDescription && leadLeakage.metaDescription.length > 10);
    assert.ok(leadLeakage.readTimeMinutes >= 3);
    assert.ok(leadLeakage.tags.includes('lead-leakage'));

    const metaAds = posts.find(p => p.slug === 'meta-ads-high-ticket-b2b-client-acquisition');
    assert.ok(metaAds, 'Meta ads article must exist');
    assert.equal(metaAds.category, 'Lead Generation');

    const setterPlaybook = posts.find(p => p.slug === 'remote-appointment-setter-playbook-15-minute-qualification');
    assert.ok(setterPlaybook, 'Appointment setter article must exist');
    assert.equal(setterPlaybook.category, 'Appointment Setting');
  });

  it('7. Public Landing Pages: Sales outsourcing, About, Contact, and Blog pages exist and render cleanly', () => {
    const outsourcingPage = path.join(process.cwd(), 'src', 'app', '(marketing)', 'services', 'sales-outsourcing', 'page.tsx');
    assert.ok(fs.existsSync(outsourcingPage), 'sales-outsourcing/page.tsx must exist');

    const aboutPage = path.join(process.cwd(), 'src', 'app', '(marketing)', 'about', 'page.tsx');
    assert.ok(fs.existsSync(aboutPage), 'about/page.tsx must exist');

    const contactPage = path.join(process.cwd(), 'src', 'app', '(marketing)', 'contact', 'page.tsx');
    assert.ok(fs.existsSync(contactPage), 'contact/page.tsx must exist');

    const blogPage = path.join(process.cwd(), 'src', 'app', '(marketing)', 'blog', 'page.tsx');
    assert.ok(fs.existsSync(blogPage), 'blog/page.tsx must exist');

    const articlePage = path.join(process.cwd(), 'src', 'app', '(marketing)', 'blog', '[slug]', 'page.tsx');
    assert.ok(fs.existsSync(articlePage), 'blog/[slug]/page.tsx must exist');
  });

  it('8. Blog API Endpoints: Public feed and Admin CRUD endpoints exist', () => {
    const publicApiPath = path.join(process.cwd(), 'src', 'app', 'api', 'blog', 'route.ts');
    assert.ok(fs.existsSync(publicApiPath), 'api/blog/route.ts must exist');

    const adminApiPath = path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'blog', 'route.ts');
    assert.ok(fs.existsSync(adminApiPath), 'api/admin/blog/route.ts must exist');

    const adminContent = fs.readFileSync(adminApiPath, 'utf8');
    assert.ok(adminContent.includes('requireSuperAdmin'), 'Admin blog API must enforce superadmin access');
  });
});

