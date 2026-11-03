const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Closecraft Complementary Services Landing Page Acceptance Tests', async (t) => {
  const landingWrapperPath = path.join(__dirname, '../src/app/(marketing)/LandingClientWrapper.tsx');
  const leadsApiPath = path.join(__dirname, '../src/app/api/leads/route.ts');
  const landingContent = fs.readFileSync(landingWrapperPath, 'utf8');
  const leadsApiContent = fs.readFileSync(leadsApiPath, 'utf8');

  await t.test('1. Exact Hero & Core Offering Preservation', () => {
    // Exact hero headline and copy
    assert.ok(landingContent.includes('Stop losing sales to forgotten follow-up.'));
    assert.ok(landingContent.includes('SALES FOLLOW-UP SOFTWARE FOR GROWING TEAMS'));
    assert.ok(
      landingContent.includes(
        'Give every promising enquiry an owner and a clear next step. Closecraft helps your team follow up consistently, with AI-supported qualification and human sales support when you need it.'
      )
    );
    assert.ok(
      landingContent.includes(
        'Try Starter free for 7 days, with no credit card required. Choose a paid plan to continue after your trial.'
      )
    );

    // Exact hero CTAs
    assert.ok(landingContent.includes('Start My 7-Day Free Trial'));
    assert.ok(landingContent.includes('Request a Revenue Audit'));
    assert.ok(landingContent.includes('Watch Explainer'));

    // Exact hero sanitized product card demo data
    assert.ok(landingContent.includes('DEMO DATA — SAMPLE WORKSPACE'));
    assert.ok(landingContent.includes('7-Day Starter Trial'));
    assert.ok(landingContent.includes('David — ABC Consulting'));
    assert.ok(landingContent.includes('Somtochukwu O.'));
    assert.ok(landingContent.includes('Active (32m waiting)'));
    assert.ok(landingContent.includes('Schedule Discovery Call & confirm commercial scope'));
  });

  await t.test('2. Complementary Services Section Structure & Copy', () => {
    // Section anchor and heading
    assert.ok(landingContent.includes('id="services"'));
    assert.ok(landingContent.includes('Sales training and hands-on support'));
    assert.ok(
      landingContent.includes(
        'Alongside our software, we help individuals develop practical sales skills and businesses improve how they work their leads. Learn through Digital Sales School or discuss sales support tailored to your team.'
      )
    );

    // Offer A: Individual Sales Training
    assert.ok(landingContent.includes('Learn appointment setting and sales closing'));
    assert.ok(
      landingContent.includes(
        'Develop practical sales skills through Digital Sales School. Learn how to qualify enquiries and book suitable appointments, then guide buyers through discovery and a clear buying decision.'
      )
    );
    assert.ok(landingContent.includes('Explore Digital Sales School'));
    assert.ok(landingContent.includes('href="/dss"'));

    // Offer B: Sales Team Training
    assert.ok(landingContent.includes('Train your team to work your leads'));
    assert.ok(
      landingContent.includes(
        'Help your staff improve appointment setting and sales closing using your offer and sales process. We assess the conversations they struggle with and agree on practical training objectives.'
      )
    );
    assert.ok(landingContent.includes('Qualification and appointment setting'));
    assert.ok(landingContent.includes('Discovery and presenting value'));
    assert.ok(landingContent.includes('Investigating objections'));
    assert.ok(landingContent.includes('Follow-up and asking for a decision'));
    assert.ok(landingContent.includes('Useful handovers and sales records'));
    assert.ok(landingContent.includes('Discuss team training'));

    // Offer C: Managed Sales Services
    assert.ok(landingContent.includes('Get help managing the sales process'));
    assert.ok(
      landingContent.includes(
        'Engage Closecraft to coordinate an agreed part of your sales work, including enquiry follow-up or appointment setting, with clear responsibilities and progress reporting.'
      )
    );
    assert.ok(landingContent.includes('Work included and excluded'));
    assert.ok(landingContent.includes('Available capacity and working arrangements'));
    assert.ok(landingContent.includes('Who manages the work'));
    assert.ok(landingContent.includes('Reporting and review expectations'));
    assert.ok(landingContent.includes('Fees and commercial terms'));
    assert.ok(landingContent.includes('Discuss managed sales'));

    // Offer D: External Setters and Closers
    assert.ok(landingContent.includes('Bring in a setter or closer to support your business'));
    assert.ok(
      landingContent.includes(
        'Request an external sales professional to work on your existing leads. We assess your offer and available workload before recommending an appointment-setting or closing engagement.'
      )
    );
    assert.ok(landingContent.includes('Dedicated focus on your existing enquiries and pipeline'));
    assert.ok(landingContent.includes('Supervision and responsibilities agreed before work starts'));
    assert.ok(landingContent.includes('Request a sales professional'));
  });

  await t.test('3. Commercial Boundaries and Disclaimers', () => {
    assert.ok(
      landingContent.includes(
        'Training and managed sales services are available separately from the software. Scope and fees are agreed for the service you choose.'
      )
    );
    assert.ok(
      landingContent.includes(
        'Sales support can work with your existing enquiries and opportunities. Lead generation is included only when explicitly agreed.'
      )
    );
    assert.ok(
      landingContent.includes(
        'Software subscriptions do not automatically include an external closer or setter.'
      )
    );
    assert.ok(
      landingContent.includes(
        'Training is not required to use Closecraft software.'
      )
    );
    assert.ok(
      landingContent.includes(
        'External professionals do not guarantee sales, and training does not guarantee employment.'
      )
    );
    assert.ok(
      landingContent.includes(
        'You remain free to choose any single service or combine them as your business needs dictate.'
      )
    );
  });

  await t.test('4. Discoverability & Navigation Menu', () => {
    // Services menu in desktop nav
    assert.ok(landingContent.includes('<span>Services</span>'));
    assert.ok(landingContent.includes('href="#services"'));

    // Desktop dropdown items
    assert.ok(landingContent.includes('Team Training'));
    assert.ok(landingContent.includes('Managed Sales'));
    assert.ok(landingContent.includes('External Sales Professionals'));

    // Primary action remains unchanged
    assert.ok(landingContent.includes('Start My 7-Day Free Trial'));
  });

  await t.test('5. Targeted FAQ Answers', () => {
    assert.ok(landingContent.includes('Do you offer sales training?'));
    assert.ok(
      landingContent.includes(
        'We offer individual sales training through Digital Sales School, where individuals develop practical appointment setting and sales closing skills. We also offer tailored team training for businesses'
      )
    );

    assert.ok(landingContent.includes('Can you train our team using our existing leads and offer?'));
    assert.ok(
      landingContent.includes(
        'Customer records and sales data are handled strictly under appropriate client authorisation.'
      )
    );

    assert.ok(landingContent.includes('Can an external closer work our existing leads?'));
    assert.ok(
      landingContent.includes(
        'We assess your offer and available workload before recommending an appointment-setting or closing engagement. Supervision, working hours, and clear responsibilities are agreed before work starts.'
      )
    );

    assert.ok(landingContent.includes('What is the difference between managed sales and an external closer?'));
    assert.ok(
      landingContent.includes(
        'Managed sales includes coordination of an agreed workflow (such as enquiry follow-up or appointment setting) with defined responsibilities and progress reporting.'
      )
    );

    assert.ok(landingContent.includes('Are these services included in my software subscription?'));
    assert.ok(
      landingContent.includes(
        'Training and managed sales services are available separately from the software. Scope and fees are agreed for the service you choose'
      )
    );

    assert.ok(landingContent.includes('Do you guarantee sales or employment?'));
    assert.ok(
      landingContent.includes(
        'We do not guarantee sales for businesses or employment/income for training students.'
      )
    );
  });

  await t.test('6. Service Enquiry Form Modal & API Handling', () => {
    // Modal supports SERVICE_ENQUIRY
    assert.ok(landingContent.includes("modalFormType === 'SERVICE_ENQUIRY'"));
    assert.ok(landingContent.includes('BUSINESS SALES SERVICE ASSESSMENT'));
    assert.ok(landingContent.includes('Discuss sales training or hands-on support'));
    assert.ok(landingContent.includes('Submit Service Enquiry'));

    // Service interests supported
    assert.ok(landingContent.includes('Team training'));
    assert.ok(landingContent.includes('Managed sales'));
    assert.ok(landingContent.includes('External appointment setter'));
    assert.ok(landingContent.includes('External closer'));
    assert.ok(landingContent.includes('Help choosing'));

    // Conditional fields
    assert.ok(landingContent.includes('Approximate team size *'));
    assert.ok(landingContent.includes('Main training objective *'));
    assert.ok(landingContent.includes('What does your business sell? *'));
    assert.ok(landingContent.includes('Approximate workload / monthly enquiries *'));
    assert.ok(landingContent.includes('Brief description of your need *'));

    // API route validation
    assert.ok(leadsApiContent.includes("formType === 'SERVICE_ENQUIRY'"));
    assert.ok(leadsApiContent.includes('serviceInterest'));
    assert.ok(leadsApiContent.includes('needDescription'));
    assert.ok(leadsApiContent.includes('SERVICE_ENQUIRY_'));
  });
});
