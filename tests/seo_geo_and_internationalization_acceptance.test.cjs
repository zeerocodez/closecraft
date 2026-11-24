const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Phase 6: Technical SEO, GEO & Internationalization Acceptance', async (t) => {
  let formatters;

  await t.test('1. Load Internationalization Formatters', async () => {
    formatters = await import('../src/lib/i18n/formatters.js').catch(async () => {
      return await import('../src/lib/i18n/formatters.ts');
    });
    assert.ok(formatters.formatCurrency);
    assert.ok(formatters.formatDisplayPhone);
  });

  await t.test('2. Multi-Currency Formatting: NGN, USD, GBP, EUR', () => {
    assert.equal(formatters.formatCurrency(500000, 'NGN'), '₦500,000');
    assert.equal(formatters.formatCurrency(2500, 'USD'), '$2,500');
    assert.equal(formatters.formatCurrency(1800, 'GBP'), '£1,800');
    assert.equal(formatters.formatCurrency(3200, 'EUR'), '€3,200');
    assert.equal(formatters.formatCurrency(null), 'Not yet established');
  });

  await t.test('3. Phone Formatting: Nigerian, US, and UK', () => {
    assert.equal(formatters.formatDisplayPhone('+2348031234567'), '+234 803 123 4567');
    assert.equal(formatters.formatDisplayPhone('+12125551234'), '+1 (212) 555-1234');
    assert.equal(formatters.formatDisplayPhone('+447911123456'), '+44 7911 123456');
  });

  await t.test('4. Robots.txt Disallow Rules for Private SaaS Workspaces', () => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    assert.ok(fs.existsSync(robotsPath), 'public/robots.txt must exist');

    const content = fs.readFileSync(robotsPath, 'utf8');
    assert.ok(content.includes('Disallow: /api/'));
    assert.ok(content.includes('Disallow: /dashboard/'));
    assert.ok(content.includes('Disallow: /recovery/'));
    assert.ok(content.includes('Disallow: /commitments/'));
    assert.ok(content.includes('Disallow: /inbox'));
    assert.ok(content.includes('Disallow: /pipeline'));
    assert.ok(content.includes('Sitemap: https://www.closecrafthq.com/sitemap.xml'));
  });

  await t.test('5. Generative Engine Optimisation (GEO): llms.txt & llms-full.txt', () => {
    const llmsPath = path.join(process.cwd(), 'public', 'llms.txt');
    const llmsFullPath = path.join(process.cwd(), 'public', 'llms-full.txt');

    assert.ok(fs.existsSync(llmsPath), 'public/llms.txt exists');
    assert.ok(fs.existsSync(llmsFullPath), 'public/llms-full.txt exists');

    const llmsText = fs.readFileSync(llmsPath, 'utf8');
    assert.ok(llmsText.includes('CloseCraft'));
    assert.ok(llmsText.includes('AI Revenue Recovery Hub'));
    assert.ok(llmsText.includes('Promise Ledger'));
    assert.ok(llmsText.includes('https://closecrafthq.com'));

    const fullText = fs.readFileSync(llmsFullPath, 'utf8');
    assert.ok(fullText.includes('Entity Knowledge Graph'));
    assert.ok(fullText.includes('WhatsApp Cloud API'));
    assert.ok(fullText.includes('NDPA'));
  });
});
