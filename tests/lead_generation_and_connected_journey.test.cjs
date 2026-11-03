const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Closecraft Managed Lead Generation & Connected Offering Acceptance Tests', async (t) => {
  const landingWrapperPath = path.join(__dirname, '../src/app/(marketing)/LandingClientWrapper.tsx');
  const leadGenClientPath = path.join(__dirname, '../src/app/(marketing)/services/lead-generation/LeadGenClient.tsx');
  const leadGenPagePath = path.join(__dirname, '../src/app/(marketing)/services/lead-generation/page.tsx');
  const diagnosticModalPath = path.join(__dirname, '../src/components/marketing/FindRightSupportModal.tsx');
  const serviceRequestsApiPath = path.join(__dirname, '../src/app/api/services/requests/route.ts');
  const todayClientPath = path.join(__dirname, '../src/components/today/TodayViewClient.tsx');
  const cataloguePath = path.join(__dirname, '../src/lib/services/catalogue.ts');

  const landingContent = fs.readFileSync(landingWrapperPath, 'utf8');
  const leadGenClientContent = fs.readFileSync(leadGenClientPath, 'utf8');
  const leadGenPageContent = fs.readFileSync(leadGenPagePath, 'utf8');
  const diagnosticModalContent = fs.readFileSync(diagnosticModalPath, 'utf8');
  const serviceRequestsApiContent = fs.readFileSync(serviceRequestsApiPath, 'utf8');
  const todayClientContent = fs.readFileSync(todayClientPath, 'utf8');
  const catalogueContent = fs.readFileSync(cataloguePath, 'utf8');

  await t.test('1. Exact Homepage Hero Preservation', () => {
    assert.ok(landingContent.includes('Stop losing sales to forgotten follow-up.'));
    assert.ok(landingContent.includes('SALES FOLLOW-UP SOFTWARE FOR GROWING TEAMS'));
    assert.ok(
      landingContent.includes(
        'Give every promising enquiry an owner and a clear next step. Closecraft helps your team follow up consistently, with AI-supported qualification and human sales support when you need it.'
      )
    );
    assert.ok(landingContent.includes('Start My 7-Day Free Trial'));
    assert.ok(landingContent.includes('Request a Revenue Audit'));
    assert.ok(landingContent.includes('Watch Explainer'));
    assert.ok(landingContent.includes('DEMO DATA — SAMPLE WORKSPACE'));
  });

  await t.test('2. Illustrative 500 Enquiries Scenario Section', () => {
    assert.ok(landingContent.includes('Your ads brought in 500 enquiries. What happens next?'));
    assert.ok(landingContent.includes('ILLUSTRATIVE CAMPAIGN SCENARIO'));
    assert.ok(landingContent.includes('Who responds?'));
    assert.ok(landingContent.includes('Who identifies suitable buyers?'));
    assert.ok(landingContent.includes('Who follows up when someone does not reply?'));
    assert.ok(landingContent.includes('Who handles the sales conversation?'));
    assert.ok(landingContent.includes('How does the owner know which opportunities still need attention?'));
    assert.ok(landingContent.includes('Without an organised process, some enquiries can sit unanswered.'));
    assert.ok(landingContent.includes('This is where Closecraft comes in. We help businesses create and manage their advertising campaigns.'));
    assert.ok(landingContent.includes('Get help with my leads'));
    assert.ok(landingContent.includes('See how the process works'));
    assert.ok(landingContent.includes('ILLUSTRATIVE WORKSPACE DATA'));
    assert.ok(landingContent.includes('The 500-lead scenario is illustrative. It is not a customer case study, an advertising forecast or a promise that we generate 500 leads.'));
  });

  await t.test('3. Connected Journey Section Structure & Stages', () => {
    assert.ok(landingContent.includes('id="connected-process"'));
    assert.ok(landingContent.includes('From the first enquiry to a clear sales outcome.'));
    assert.ok(landingContent.includes('Start with the support you need today. Add more help when your business is ready.'));
    assert.ok(landingContent.includes('Attract enquiries'));
    assert.ok(landingContent.includes('Organise the response'));
    assert.ok(landingContent.includes('Follow up'));
    assert.ok(landingContent.includes('Handle the conversation'));
    assert.ok(landingContent.includes('Record the outcome'));
    assert.ok(
      landingContent.includes(
        'Closecraft helps us handle what happens after someone responds to our advertising, so more suitable opportunities can progress towards a sale.'
      )
    );
  });

  await t.test('4. 7-Step Practical Walkthrough', () => {
    assert.ok(landingContent.includes('How the process could work'));
    assert.ok(landingContent.includes('Ad shown to targeted audience on Facebook or Instagram'));
    assert.ok(landingContent.includes('Interested prospect clicks and fills lead form'));
    assert.ok(landingContent.includes('Lead instantly enters Closecraft workspace with timestamp and source attribution'));
    assert.ok(landingContent.includes('Notification alerts assigned team member (or external SDR)'));
    assert.ok(landingContent.includes('Fast first response within minutes via WhatsApp or phone'));
    assert.ok(landingContent.includes('Conversation tracked through qualification and next best action'));
    assert.ok(landingContent.includes('Outcome recorded (Appointment booked, Proposal sent, Won, or Lost with reason)'));
  });

  await t.test('5. Four Clear Entry Points', () => {
    assert.ok(landingContent.includes('Where does your business want to start?'));
    assert.ok(landingContent.includes('We already have leads'));
    assert.ok(landingContent.includes('Get help with my existing leads'));
    assert.ok(landingContent.includes('We need help generating leads'));
    assert.ok(landingContent.includes('Discuss my next campaign'));
    assert.ok(landingContent.includes('We need to improve our team’s sales skills'));
    assert.ok(landingContent.includes('Train my sales team'));
    assert.ok(landingContent.includes('We need hands-on sales support'));
    assert.ok(landingContent.includes('Discuss external sales support'));
    assert.ok(landingContent.includes('Find the right support for your business'));
  });

  await t.test('6. Dedicated Lead Generation Page Copy & Architecture', () => {
    // Route page
    assert.ok(leadGenPageContent.includes('Managed Facebook & Instagram Lead Generation'));
    assert.ok(leadGenPageContent.includes('Bring in enquiries your business is ready to follow up.'));

    // Client component
    assert.ok(leadGenClientContent.includes('Bring in enquiries your business is ready to follow up.'));
    assert.ok(
      leadGenClientContent.includes(
        'Get hands-on Facebook and Instagram campaign management, connected to a clearer follow-up process through Closecraft.'
      )
    );
    assert.ok(leadGenClientContent.includes('Discuss my campaign'));
    assert.ok(leadGenClientContent.includes('See what’s included'));
    assert.ok(
      leadGenClientContent.includes(
        'I want more paying customers. Show me where to start, explain what you will do, and make the next step easy.'
      )
    );

    // 6-step delivery process
    assert.ok(leadGenClientContent.includes('Review the offer'));
    assert.ok(leadGenClientContent.includes('Agree the campaign plan'));
    assert.ok(leadGenClientContent.includes('Prepare the material'));
    assert.ok(leadGenClientContent.includes('Client approval'));
    assert.ok(leadGenClientContent.includes('Launch and monitor'));
    assert.ok(leadGenClientContent.includes('Connect the enquiries'));

    // 30-day pilot scope
    assert.ok(leadGenClientContent.includes('What you receive'));
    assert.ok(leadGenClientContent.includes('What we need from you'));
    assert.ok(leadGenClientContent.includes('After the pilot'));
    assert.ok(leadGenClientContent.includes('Advertising Budget is Separate from Closecraft Fees'));
    assert.ok(leadGenClientContent.includes('paid directly to Meta using your own payment method and ad account'));
  });

  await t.test('7. Eight Specific Grounded FAQs', () => {
    // Both landing page and lead gen client must include all 8 questions and grounded answers
    const expectedFaqKeywords = [
      'Do you guarantee leads or sales?',
      'Is ad spend included in your fee?',
      'Do I have to use Closecraft software if you manage my ads?',
      'What if I already have leads and just need help following up?',
      'Who handles the enquiries when they come in?',
      'Can you train our sales team to handle these leads?',
      'What happens if a campaign is not performing?',
      'How do we get started?',
    ];

    for (const q of expectedFaqKeywords) {
      assert.ok(landingContent.includes(q), `Landing page missing FAQ: ${q}`);
      assert.ok(leadGenClientContent.includes(q), `Lead Gen page missing FAQ: ${q}`);
    }

    assert.ok(landingContent.includes('We do not guarantee a specific number of leads or closed sales.'));
    assert.ok(landingContent.includes('Advertising budget is paid directly to Meta using your own payment method and ad account.'));
    assert.ok(landingContent.includes('We can connect your leads to Closecraft, or send them to your email, WhatsApp, or existing CRM.'));
  });

  await t.test('8. Interactive Diagnostic Assessment Flow', () => {
    assert.ok(diagnosticModalContent.includes('FIND THE RIGHT SUPPORT'));
    assert.ok(diagnosticModalContent.includes('What do you want to improve first?'));
    assert.ok(diagnosticModalContent.includes('We need help generating leads'));
    assert.ok(diagnosticModalContent.includes('We already have leads, but lose them to slow follow-up'));
    assert.ok(diagnosticModalContent.includes('Our team needs better sales and objection-handling skills'));
    assert.ok(diagnosticModalContent.includes('We need external sales reps or appointment setters'));

    // Branch questions
    assert.ok(diagnosticModalContent.includes('Have you verified this offer with paying customers before?'));
    assert.ok(diagnosticModalContent.includes('What remains after the direct cost of delivering the sale, before advertising and overheads.'));
    assert.ok(diagnosticModalContent.includes("I don't know"));
    assert.ok(diagnosticModalContent.includes('Approximately how many enquiries does your business receive each month?'));
    assert.ok(diagnosticModalContent.includes('How many sales team members need training?'));
    assert.ok(diagnosticModalContent.includes('What type of hands-on sales work do you need?'));

    // Submits to /api/services/requests
    assert.ok(diagnosticModalContent.includes('/api/services/requests'));
    assert.ok(diagnosticModalContent.includes('RECOMMENDED STARTING POINT'));
  });

  await t.test('9. Operational Service Request API & Reference Format', () => {
    assert.ok(serviceRequestsApiContent.includes('REQ-LG'));
    assert.ok(serviceRequestsApiContent.includes('REQ-SW'));
    assert.ok(serviceRequestsApiContent.includes('REQ-TT'));
    assert.ok(serviceRequestsApiContent.includes('REQ-MS'));
    assert.ok(serviceRequestsApiContent.includes('db.serviceRequest.create'));
    assert.ok(serviceRequestsApiContent.includes('rateLimit'));
    assert.ok(serviceRequestsApiContent.includes('hpField'));
    assert.ok(serviceRequestsApiContent.includes('stageHistory'));
  });

  await t.test('10. SaaS Today View: Enquiries Waiting, Active Engagement, Checklist & Metrics', () => {
    assert.ok(todayClientContent.includes('waiting for a first response'));
    assert.ok(todayClientContent.includes('ACTIVE SERVICE ENGAGEMENT'));
    assert.ok(todayClientContent.includes('Current Stage:'));
    assert.ok(todayClientContent.includes('Your Next Action:'));
    assert.ok(todayClientContent.includes('Who Is Responsible:'));
    assert.ok(todayClientContent.includes('What Happens Afterwards:'));
    assert.ok(todayClientContent.includes('Review campaign creative'));

    // Launch checklist
    assert.ok(todayClientContent.includes('Lead Generation Launch Checklist'));
    assert.ok(todayClientContent.includes('8 critical milestones'));

    // Ad metrics
    assert.ok(todayClientContent.includes('Campaign Ad Metrics'));
    assert.ok(todayClientContent.includes('Manual or integrated data'));
    assert.ok(todayClientContent.includes('Ad Spend'));
    assert.ok(todayClientContent.includes('Enquiries'));
    assert.ok(todayClientContent.includes('Cost per Enquiry'));
    assert.ok(todayClientContent.includes('Qualified Enquiries'));
    assert.ok(todayClientContent.includes('Cost / Qualified'));
    assert.ok(todayClientContent.includes('Not available'));
  });

  await t.test('11. Service Catalogue Entry for Managed Lead Generation', () => {
    assert.ok(catalogueContent.includes('MANAGED_LEAD_GENERATION'));
    assert.ok(catalogueContent.includes('Managed Facebook & Instagram Lead Generation'));
    assert.ok(catalogueContent.includes('/services/lead-generation'));
    assert.ok(catalogueContent.includes('Advertising budget paid directly to Meta'));
  });
});

