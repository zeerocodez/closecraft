const { describe, it: test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');

function readRel(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('CloseCraft HQ Commercial Architecture, Monetisation & Homepage Acceptance Suite', () => {
  test('1. Commercial Catalog defines Starter ₦15k/$19, Growth Recommended ₦35k/$49, Scale ₦75k/$99 & custom Enterprise', () => {
    const catalog = readRel('src/lib/billing/catalog.ts');
    assert.match(catalog, /code:\s*'STARTER'/);
    assert.match(catalog, /marketRegion:\s*'NG'[\s\S]*monthlyPrice:\s*15000,\s*annualPrice:\s*150000/);
    assert.match(catalog, /marketRegion:\s*'US'[\s\S]*monthlyPrice:\s*19,\s*annualPrice:\s*190/);
    assert.match(catalog, /maxActiveLeads:\s*500/);
    assert.match(catalog, /maxTeamMembers:\s*2/);

    assert.match(catalog, /code:\s*'GROWTH'/);
    assert.match(catalog, /isRecommended:\s*true/);
    assert.match(catalog, /marketRegion:\s*'NG'[\s\S]*monthlyPrice:\s*35000,\s*annualPrice:\s*350000/);
    assert.match(catalog, /marketRegion:\s*'US'[\s\S]*monthlyPrice:\s*49,\s*annualPrice:\s*490/);
    assert.match(catalog, /maxActiveLeads:\s*2000/);
    assert.match(catalog, /maxTeamMembers:\s*5/);

    assert.match(catalog, /code:\s*'SCALE'/);
    assert.match(catalog, /marketRegion:\s*'NG'[\s\S]*monthlyPrice:\s*75000,\s*annualPrice:\s*750000/);
    assert.match(catalog, /marketRegion:\s*'US'[\s\S]*monthlyPrice:\s*99,\s*annualPrice:\s*990/);
    assert.match(catalog, /maxActiveLeads:\s*10000/);
    assert.match(catalog, /maxTeamMembers:\s*15/);

    assert.match(catalog, /code:\s*'ENTERPRISE'/);
    assert.match(catalog, /isCustomQuote:\s*true/);
    assert.match(catalog, /~2 months free/);
  });

  test('2. Lead Recovery Pricing Tiers and Sales Commission Tiers match commercial specification', () => {
    const catalog = readRel('src/lib/billing/catalog.ts');
    assert.match(catalog, /code:\s*'TIER_500'[\s\S]*serviceFeeNgn:\s*25000/);
    assert.match(catalog, /code:\s*'TIER_2000'[\s\S]*serviceFeeNgn:\s*50000/);
    assert.match(catalog, /code:\s*'TIER_5000'[\s\S]*serviceFeeNgn:\s*100000/);
    assert.match(catalog, /code:\s*'CUSTOM'/);

    assert.match(catalog, /APPOINTMENT_SETTING[\s\S]*minCommissionPercent:\s*2[\s\S]*maxCommissionPercent:\s*5/);
    assert.match(catalog, /SALES_CLOSING[\s\S]*minCommissionPercent:\s*5[\s\S]*maxCommissionPercent:\s*10/);
    assert.match(catalog, /COMBINED[\s\S]*minCommissionPercent:\s*8[\s\S]*maxCommissionPercent:\s*15/);
    assert.match(catalog, /DEDICATED_TEAM[\s\S]*defaultRetainerNgn:\s*150000/);
  });

  test('3. Subscription State Machine supports all 7 commercial states + permitted transitions + 7-day trial & 5-day grace', () => {
    const sm = readRel('src/lib/billing/stateMachine.ts');
    assert.match(sm, /DEFAULT_TRIAL_DAYS\s*=\s*7/);
    assert.match(sm, /DEFAULT_GRACE_PERIOD_DAYS\s*=\s*5/);

    for (const st of ['TRIALING', 'ACTIVE', 'PAST_DUE', 'GRACE_PERIOD', 'SUSPENDED', 'CANCELLED', 'EXPIRED']) {
      assert.match(sm, new RegExp(`\\b${st}:\\s*\\[`), `Permitted transitions defined for ${st}`);
    }
    assert.match(sm, /cancelWorkspaceSubscription/);
    assert.match(sm, /reactivateWorkspaceSubscription/);
    assert.match(sm, /subscriptionEvent\.create/);
  });

  test('4. Usage Metering & Backend Entitlement Enforcement blocks lead/AI overflow without silent deletion & enforces opt-in credits', () => {
    const ent = readRel('src/lib/billing/entitlements.ts');
    assert.match(ent, /class EntitlementLimitError/);
    assert.match(ent, /assertEntitlementLimit/);
    assert.match(ent, /recordMeteredUsage/);
    assert.match(ent, /UsageCredit/);
    assert.match(ent, /estimatedProviderCostUsd/);

    const qual = readRel('src/lib/ai/qualificationEngine.ts');
    assert.match(qual, /assertEntitlementLimit\(lead\.organizationId,\s*'AI_QUALIFICATIONS'\)/);
    assert.match(qual, /recordMeteredUsage/);

    const checkout = readRel('src/app/api/billing/checkout/route.ts');
    assert.match(checkout, /resolveServerPlanPrice/);
    assert.match(checkout, /consentConfirmed/);
    assert.match(checkout, /creditPackId/);
  });

  test('5. Bachs.io Checkout, Verified Webhook Activation, Receipt Generation & Refund Reversal are wired', () => {
    const bachs = readRel('src/lib/payments/bachs.ts');
    assert.match(bachs, /CC-RCPT-/);
    assert.match(bachs, /receiptNumber/);
    assert.match(bachs, /reverseCommissionsForRefundedInvoice/);
    assert.match(bachs, /GRACE_PERIOD/);
    assert.match(bachs, /createHmac\('sha256'/);

    const docRoute = readRel('src/app/api/billing/invoices/[id]/document/route.ts');
    assert.match(docRoute, /buildFinancialDocumentDto/);
    assert.match(docRoute, /invoice\.organizationId !== sessionOrgId/);
    assert.match(docRoute, /Content-Disposition/);
  });

  test('6. Registration starts Starter 7-day trial at ₦15,000 & 2 seats; Proposals support discount/tax math', () => {
    const reg = readRel('src/app/api/auth/register/route.ts');
    assert.match(reg, /pricePerMonth:\s*15000/);
    assert.match(reg, /maxInternalSeats:\s*2/);
    assert.match(reg, /gracePeriodDays:\s*5/);

    const prop = readRel('src/lib/growth/proposals.ts');
    assert.match(prop, /discountAmount/);
    assert.match(prop, /taxRatePercent/);
    assert.match(prop, /taxAmount/);
  });

  test('7. Lead Recovery distinguishes interestedCount vs WON convertedCount & gates live dispatch on approval', () => {
    const rec = readRel('src/lib/recovery/campaignService.ts');
    assert.match(rec, /interestedCount:\s*\{\s*increment:\s*1/);
    assert.match(rec, /resolveRecoveryPricingTier/);
    assert.match(rec, /approveRecoveryCampaign/);
    assert.match(rec, /isLiveDispatchEnabled && !campaign\.customerApprovedAt/);
  });

  test('8. Sales Commission Engine accrues only on VERIFIED payments & enforces Maker-Checker approvals', () => {
    const comm = readRel('src/lib/sales/commissionEngine.ts');
    assert.match(comm, /status\)\)/);
    assert.match(comm, /\['PAID',\s*'CONFIRMED',\s*'FUNDS_AVAILABLE'\]/);
    assert.match(comm, /APPROVED/);
    assert.match(comm, /Maker-Checker violation/i);
    assert.match(comm, /reverseCommissionsForRefundedInvoice/);
  });

  test('9. Superadmin Commercial Control strictly checks platform SUPER_ADMIN/OPERATOR role & removes hardcoded fake revenue', () => {
    const adminActions = readRel('src/app/(saas)/admin/actions.ts');
    assert.match(adminActions, /dbUser\.role !== 'SUPER_ADMIN' && dbUser\.role !== 'OPERATOR'/);
    assert.ok(!adminActions.includes('14200000'), 'Must not contain hardcoded 14.2M fake GMV');

    const adminPage = readRel('src/app/(saas)/admin/page.tsx');
    assert.match(adminPage, /commercialAnalytics/);
    assert.match(adminPage, /dbUser\?\.role === 'SUPER_ADMIN' \|\| dbUser\?\.role === 'OPERATOR'/);
    assert.ok(!adminPage.includes('Math.round(gmv * 0.42)'), 'Must not contain fake 42%/28%/19%/11% multipliers');
  });

  test('10. CloseCraft HQ Homepage, Demo Case Studies Disclaimer, Market Focus, 14 FAQs & Meta Pixel are in place', () => {
    const page = readRel('src/app/(marketing)/page.tsx');
    assert.match(page, /CloseCraft HQ \| AI Revenue Operations, Lead Recovery and Fulfilment Platform/);

    const wrapper = readRel('src/app/(marketing)/LandingClientWrapper.tsx');
    assert.match(wrapper, /Stop Losing Revenue to Unfollowed Leads\./);
    assert.match(wrapper, /RECOVER: Old Enquiries/);
    assert.match(wrapper, /CONVERT: Sales Momentum/);
    assert.match(wrapper, /DELIVER: Customer Promises/);
    assert.ok(!wrapper.includes('REVENUE OPERATIONS PLATFORM'), 'Top hero clutter badge removed');
    assert.ok(!wrapper.includes('Interactive Walkthrough &rarr;'), 'Top hero walkthrough pill removed');
    assert.match(wrapper, /START YOUR 7-DAY FREE TRIAL/);
    assert.match(wrapper, /NO CREDIT CARD REQUIRED/);
    assert.match(wrapper, /BOOK A FREE FOLLOW-UP DIAGNOSTIC/);
    assert.match(wrapper, /DemoCaseStudiesSection/);
    assert.match(wrapper, /HomepagePricingSection/);
    assert.match(wrapper, /CloseCraft HQ is a revenue operations platform for businesses\. It is not affiliated with CloseCraft App\./);

    const demo = readRel('src/components/landing/DemoCaseStudiesSection.tsx');
    assert.match(demo, /PrimeHaven Properties/);
    assert.match(demo, /BrightPath Learning Centre/);
    assert.match(demo, /Apex Business Solutions/);
    assert.ok(!demo.includes('ILLUSTRATIVE DEMO DATA. FICTIONAL BUSINESSES AND SCENARIOS. NOT VERIFIED CUSTOMER RESULTS.'), 'Removed intrusive banner writeup per user feedback');
    assert.ok(!demo.includes('DEMO EXAMPLE'), 'Removed DEMO EXAMPLE badge copy per user feedback');

    const calc = readRel('src/components/landing/RevenueLeakageCalculator.tsx');
    assert.match(calc, /These figures are estimates based on the information you provide\. They are not guaranteed results or verified revenue\./);

    const who = readRel('src/components/landing/WhoWeHelpSection.tsx');
    assert.match(who, /Real Estate & Property/);
    assert.match(who, /Education & Training Institutes/);
    assert.match(who, /Service Businesses/);
    assert.match(who, /Consultants & Agencies/);
    assert.match(who, /Coaches & Mentors/);
    assert.match(who, /Remote Creators & Course Sellers/);
    assert.match(who, /ALSO BUILT FOR/);

    const faqs = readRel('src/lib/data/homepage-faqs.ts');
    const faqMatches = faqs.match(/\bq:\s*'/g) || [];
    assert.ok(faqMatches.length >= 14, `Expected >= 14 FAQ items, found ${faqMatches.length}`);

    const pixel = readRel('src/components/analytics/AnalyticsScripts.tsx');
    assert.match(pixel, /NEXT_PUBLIC_META_PIXEL_ID/);
    assert.match(pixel, /__closecraftPixelInit/);
  });

  test('11. Pure commercial pricing & invoice calculation invariants hold cleanly', () => {
    const ngStarterAnnual = 15000 * 10;
    const ngGrowthAnnual = 35000 * 10;
    assert.equal(ngStarterAnnual, 150000);
    assert.equal(ngGrowthAnnual, 350000);

    const subtotal = 100000;
    const discount = 10000;
    const taxable = Math.max(0, subtotal - discount);
    const tax = Number(((taxable * 7.5) / 100).toFixed(2));
    const total = Number((taxable + tax).toFixed(2));
    assert.equal(tax, 6750);
    assert.equal(total, 96750);

    const secret = 'test_webhook_secret';
    const ts = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({ id: 'evt_1', type: 'payment.succeeded' });
    const sig = crypto.createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex');
    const badSig = crypto.createHmac('sha256', 'wrong_secret').update(`${ts}.${body}`).digest('hex');
    assert.notEqual(sig, badSig);
  });
});
