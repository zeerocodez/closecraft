const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('CloseCraft Growth Enhancements Phase 1: Diagnostic Scorecard & Multi-Currency Acceptance Tests', async (t) => {
  const scoringPath = path.join(__dirname, '../src/lib/tools/diagnostic-scoring.ts');
  const scorecardClientPath = path.join(__dirname, '../src/components/tools/DiagnosticScorecardClient.tsx');
  const resultsPagePath = path.join(__dirname, '../src/app/(marketing)/audit/results/page.tsx');
  const signupPagePath = path.join(__dirname, '../src/app/(auth)/signup/page.tsx');
  const calculatorPath = path.join(__dirname, '../src/components/landing/RevenueLeakageCalculator.tsx');
  const auditClientPath = path.join(__dirname, '../src/components/tools/FullDiagnosticAuditClient.tsx');
  const sitemapPath = path.join(__dirname, '../src/app/sitemap.ts');

  assert.ok(fs.existsSync(scoringPath), 'diagnostic-scoring.ts must exist');
  assert.ok(fs.existsSync(scorecardClientPath), 'DiagnosticScorecardClient.tsx must exist');
  assert.ok(fs.existsSync(resultsPagePath), 'audit/results/page.tsx must exist');

  const scoringContent = fs.readFileSync(scoringPath, 'utf8');
  const scorecardContent = fs.readFileSync(scorecardClientPath, 'utf8');
  const signupContent = fs.readFileSync(signupPagePath, 'utf8');
  const calculatorContent = fs.readFileSync(calculatorPath, 'utf8');
  const auditClientContent = fs.readFileSync(auditClientPath, 'utf8');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

  await t.test('1. Scoring Logic & Currency Math', () => {
    assert.ok(scoringContent.includes('export type CurrencyCode = \'NGN\' | \'USD\' | \'GBP\''));
    assert.ok(scoringContent.includes('formatCurrencyAmount'));
    assert.ok(scoringContent.includes('computeDiagnosticScorecard'));
    assert.ok(scoringContent.includes('CURRENCY_CONFIGS'));

    // Check exchange rates
    assert.ok(scoringContent.includes('rateToNGN: 1500'));
    assert.ok(scoringContent.includes('rateToNGN: 1900'));
  });

  await t.test('2. Diagnostic Scorecard Page Architecture', () => {
    assert.ok(scorecardContent.includes('Follow-Up Health Scorecard'));
    assert.ok(scorecardContent.includes('OVERALL FOLLOW-UP HEALTH'));
    assert.ok(scorecardContent.includes('ESTIMATED REVENUE LEAKAGE'));
    assert.ok(scorecardContent.includes('CLAIM 7-DAY WORKSPACE FOR THIS LEAK'));
    assert.ok(scorecardContent.includes('4-Stage Revenue Growth System Health'));
    assert.ok(scorecardContent.includes('3 Deterministic System Fixes to Stop This Leak'));
    assert.ok(scorecardContent.includes('Share Scorecard') || scorecardContent.includes('Shareable link'));
  });

  await t.test('3. Pre-Filled Signup Integration', () => {
    // Signup page reads query params
    assert.ok(signupContent.includes("searchParams.get('name')"));
    assert.ok(signupContent.includes("searchParams.get('companyName')") || signupContent.includes("searchParams.get('business')"));
    assert.ok(signupContent.includes("searchParams.get('email')"));
    assert.ok(signupContent.includes("searchParams.get('whatsappNumber')"));
    assert.ok(signupContent.includes("searchParams.get('score')"));

    // Pre-filled defaultValue attributes
    assert.ok(signupContent.includes('defaultValue={defaultName}'));
    assert.ok(signupContent.includes('defaultValue={defaultCompany}'));
    assert.ok(signupContent.includes('defaultValue={defaultEmail}'));
    assert.ok(signupContent.includes('defaultValue={defaultPhone}'));

    // Personalized Diagnostic Banner
    assert.ok(signupContent.includes('Pre-configured Setup:'));
  });

  await t.test('4. Full Diagnostic Audit Dispatches Instant Scorecard', () => {
    assert.ok(auditClientContent.includes('/audit/results'));
    assert.ok(auditClientContent.includes('View Instant Diagnostic Scorecard'));
  });

  await t.test('5. Multi-Currency Support in Revenue Leakage Calculator', () => {
    assert.ok(calculatorContent.includes('CurrencyCode'));
    assert.ok(calculatorContent.includes('CURRENCY_CONFIGS'));
    assert.ok(calculatorContent.includes('formatCurrencyAmount'));
    assert.ok(calculatorContent.includes("['NGN', 'USD', 'GBP']"));
  });

  await t.test('6. Sitemap Indexes Scorecard Results', () => {
    assert.ok(sitemapContent.includes('/audit/results'));
  });
});

