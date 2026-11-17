const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('CloseCraft HQ Phase 6: Interactive Tools, Diagnostics & Modals Acceptance Tests', async (t) => {
  const root = path.join(__dirname, '..');

  const files = {
    calculatorComponent: path.join(root, 'src/components/landing/RevenueLeakageCalculator.tsx'),
    revenueLeakSection: path.join(root, 'src/components/landing/RevenueLeakSection.tsx'),
    landingWrapper: path.join(root, 'src/app/(marketing)/LandingClientWrapper.tsx'),
    auditPage: path.join(root, 'src/app/(marketing)/audit/page.tsx'),
    auditClient: path.join(root, 'src/components/tools/FullDiagnosticAuditClient.tsx'),
    calculatorPage: path.join(root, 'src/app/(marketing)/calculator/page.tsx'),
    calculatorClient: path.join(root, 'src/components/tools/FullCalculatorPageClient.tsx'),
    diagnosticModal: path.join(root, 'src/components/landing/DiagnosticAuditModal.tsx'),
    projectBriefModal: path.join(root, 'src/components/growth/ProjectBriefModal.tsx'),
  };

  // 1. Verify existence of all interactive tool components & pages
  await t.test('1. Interactive Tool Components & Dedicated Pages Exist', () => {
    for (const [name, filepath] of Object.entries(files)) {
      assert.ok(fs.existsSync(filepath), `Expected file to exist for ${name}: ${filepath}`);
    }
  });

  const calculatorContent = fs.readFileSync(files.calculatorComponent, 'utf8');
  const revenueLeakSectionContent = fs.readFileSync(files.revenueLeakSection, 'utf8');
  const landingWrapperContent = fs.readFileSync(files.landingWrapper, 'utf8');
  const auditClientContent = fs.readFileSync(files.auditClient, 'utf8');
  const calculatorClientContent = fs.readFileSync(files.calculatorClient, 'utf8');
  const projectBriefModalContent = fs.readFileSync(files.projectBriefModal, 'utf8');

  // 2. Interactive Revenue Leakage ROI Calculator
  await t.test('2. Revenue Leakage Calculator Implements Sliders, Response Tiers & Math Model', () => {
    assert.ok(calculatorContent.includes('INTERACTIVE ROI CALCULATOR'));
    assert.ok(calculatorContent.includes('Estimate How Much Revenue You Lose to Delayed Follow-Up'));
    assert.ok(calculatorContent.includes('Monthly Inbound Enquiries Received'));
    assert.ok(calculatorContent.includes('Average Revenue Per Closed Customer'));
    assert.ok(calculatorContent.includes('Your Typical First Response Time to Inbound Leads'));
    assert.ok(calculatorContent.includes('Within 15 minutes (Rapid SLA)'));
    assert.ok(calculatorContent.includes('1 to 4 hours (Delayed)'));
    assert.ok(calculatorContent.includes('24+ hours (Sluggish)'));
    assert.ok(calculatorContent.includes('Days later or forgotten (Severe)'));
    assert.ok(calculatorContent.includes('ESTIMATED REVENUE LEAK'));
    assert.ok(calculatorContent.includes('Annualized Revenue At Risk'));
    assert.ok(calculatorContent.includes('FIX YOUR FOLLOW-UP LEAKAGE'));
  });

  // 3. Revenue Leak Section Embeds Calculator & Preserves Exact Verbatim Content
  await t.test('3. Revenue Leak Section Embeds Calculator & Preserves Section 4 & 5 Copy', () => {
    assert.ok(revenueLeakSectionContent.includes('<RevenueLeakageCalculator'));
    assert.ok(revenueLeakSectionContent.includes('Your Business May Not Have a Lead Problem. It May Have a Follow-Up Problem.'));
    assert.ok(revenueLeakSectionContent.includes('ILLUSTRATIVE CAMPAIGN SCENARIO'));
    assert.ok(revenueLeakSectionContent.includes('What happens to 200 incoming enquiries?'));
    assert.ok(revenueLeakSectionContent.includes('Every missed follow-up is a potential missed sale.'));
    assert.ok(revenueLeakSectionContent.includes('You Could Be Paying to Generate Leads You Never Convert.'));
    assert.ok(revenueLeakSectionContent.includes('Wasted Advertising Spend'));
    assert.ok(revenueLeakSectionContent.includes('Loss of Buyer Confidence'));
    assert.ok(revenueLeakSectionContent.includes('Where are your leads sitting right now?'));
  });

  // 4. LandingClientWrapper Connects Calculator to Audit Modal with Leakage Preview
  await t.test('4. LandingClientWrapper Wires Calculator Data into Audit Modal', () => {
    assert.ok(landingWrapperContent.includes('calculatorData'));
    assert.ok(landingWrapperContent.includes('Calculated Leakage Estimate'));
    assert.ok(landingWrapperContent.includes('Based on your calculator inputs'));
    assert.ok(landingWrapperContent.includes('onOpenAuditModal={(calcData'));
    assert.ok(landingWrapperContent.includes('modalFormType === \'SERVICE_ENQUIRY\''));
    assert.ok(landingWrapperContent.includes('modalFormType === \'MANAGED_SALES\''));
  });

  // 5. Full Diagnostic Audit Client Maps Bottlenecks to 4 Connected Stages
  await t.test('5. Full Diagnostic Audit Maps Bottlenecks to Connected Growth Stages', () => {
    assert.ok(auditClientContent.includes('INTERACTIVE REVENUE DIAGNOSTIC'));
    assert.ok(auditClientContent.includes('Identify Where Your Business is Losing Sales to Forgotten Follow-Up.'));
    assert.ok(auditClientContent.includes('Where does your sales follow-up currently break down?'));
    assert.ok(auditClientContent.includes('Tell us about your commercial volume.'));
    assert.ok(auditClientContent.includes('Your Highest-Leverage Recovery Plan'));
    assert.ok(auditClientContent.includes('RECOMMENDED STAGE'));
    assert.ok(auditClientContent.includes('Estimated Monthly Loss'));
    assert.ok(auditClientContent.includes('Recommended 3-Step Action Plan'));
    assert.match(auditClientContent, /SAVE (&|&amp;) DISPATCH REPORT/);
    assert.ok(auditClientContent.includes('/api/leads'));
    assert.ok(auditClientContent.includes('Discuss Findings on WhatsApp'));
  });

  // 6. Dedicated Calculator Page Renders Empirical Table & Diagnostic Link
  await t.test('6. Dedicated Calculator Page Renders Research Benchmarks & Audit Callout', () => {
    assert.ok(calculatorClientContent.includes('COMMERCIAL IMPACT CALCULATOR'));
    assert.ok(calculatorClientContent.includes('How Much Is Lead Response Friction Costing Your Business?'));
    assert.ok(calculatorClientContent.includes('INDUSTRY RESEARCH BENCHMARKS'));
    assert.ok(calculatorClientContent.includes('Why Lead Response Speed Dictates Revenue Outcomes'));
    assert.ok(calculatorClientContent.includes('Harvard Business Review and Lead Response Management'));
    assert.ok(calculatorClientContent.includes('Take Full Diagnostic Audit'));
  });

  // 7. Project Brief Modal Supports Multi-Service Scoping & WhatsApp Routing
  await t.test('7. Project Brief Modal Supports Multi-Service Scoping & WhatsApp Routing', () => {
    assert.ok(projectBriefModalContent.includes('GROWTH_SERVICES'));
    assert.ok(projectBriefModalContent.includes('selectedServices'));
    assert.ok(projectBriefModalContent.includes('/api/growth/project-requests'));
    assert.ok(projectBriefModalContent.includes('Start WhatsApp Consultation Now'));
  });
});
