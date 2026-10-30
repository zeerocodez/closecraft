const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

test('DSS Sprint Landing Page Acceptance & Compliance Suite', async (t) => {
  const landingPageFile = fs.readFileSync(path.join(ROOT, 'src/app/dss/page.tsx'), 'utf8');
  const landingClientFile = fs.readFileSync(path.join(ROOT, 'src/app/dss/DSSLandingClient.tsx'), 'utf8');
  const curriculumFile = fs.readFileSync(path.join(ROOT, 'src/lib/dss/sprint-curriculum.ts'), 'utf8');
  const productsFile = fs.readFileSync(path.join(ROOT, 'src/lib/dss/products.ts'), 'utf8');
  const applyRouteFile = fs.readFileSync(path.join(ROOT, 'src/app/api/dss/apply/route.ts'), 'utf8');

  await t.test('1. SEO Metadata matches exact approved copy', () => {
    assert.match(
      landingPageFile,
      /title:\s*'Digital Sales School \| Four-Week Remote Sales Sprint'/,
      'SEO title must match exact approved string'
    );
    assert.match(
      landingPageFile,
      /Build practical appointment-setting and closing skills through 12 live workshops\. Explore the four-week DSS sprint and apply for the next confirmed cohort\./,
      'SEO description must match exact approved copy'
    );
  });

  await t.test('2. Flagship programme facts and workload totals are accurate', () => {
    // 4 weeks, 12 workshops, 24 topics, 36 scheduled live hours, 48 guided hours, 84 total hours, ~21 hours/week
    assert.match(curriculumFile, /teachingWeeks:\s*4/, 'Must specify 4 teaching weeks');
    assert.match(curriculumFile, /workshopsCount:\s*12/, 'Must specify 12 workshops');
    assert.match(curriculumFile, /originalTopicsCount:\s*24/, 'Must specify 24 original topics');
    assert.match(curriculumFile, /totalScheduledLiveHours:\s*36/, '36 live hours total (3h per workshop)');
    assert.match(curriculumFile, /totalGuidedHours:\s*48/, '48 guided hours total (4h per workshop)');
    assert.match(curriculumFile, /totalHours:\s*84/, '84 total hours');
    assert.match(curriculumFile, /hoursPerWeek:\s*21/, 'Approximately 21 hours per week');
    assert.match(curriculumFile, /trainersCount:\s*3/, 'Three trainers managed in system');

    // Verify on landing page text
    assert.match(landingClientFile, /FOUR-WEEK REMOTE SALES SPRINT/);
    assert.match(landingClientFile, /Learn remote sales\.[\s\S]*Build work you can show\./);
    assert.match(landingClientFile, /4 weeks/);
    assert.match(landingClientFile, /12 live workshops|12 practical workshops/);
    assert.match(landingClientFile, /24 lesson topics|24 original topics/);
    assert.match(landingClientFile, /Approximately 21 hours per week|~21 hrs/);
    assert.match(landingClientFile, /No previous sales experience is required\. You do need time to practise\./);
  });

  await t.test('3. Curriculum coverage includes all 24 topics once across 12 workshops', () => {
    const workshopMatches = [
      { ws: 1, lessons: '01–03', focus: 'Professional foundations and offer accuracy' },
      { ws: 2, lessons: '04–06', focus: 'Buyer research and commercial value' },
      { ws: 3, lessons: '07–08', focus: 'Prospect pipeline and relevant openings' },
      { ws: 4, lessons: '09–10', focus: 'Adaptive follow-up and qualification' },
      { ws: 5, lessons: '11–12', focus: 'Appointments and listening-led discovery' },
      { ws: 6, lessons: '13–14', focus: 'Diagnosis and a relevant recommendation' },
      { ws: 7, lessons: '15–16', focus: 'Buying groups and objection diagnosis' },
      { ws: 8, lessons: '17–18', focus: 'Negotiation and a documented decision' },
      { ws: 9, lessons: '19–20', focus: 'Pipeline accuracy and performance improvement' },
      { ws: 10, lessons: '21–22', focus: 'Onboarding and dependable remote work' },
      { ws: 11, lessons: '23', focus: 'Portfolio and route-specific implementation' },
      { ws: 12, lessons: '24', focus: 'Capstone demonstration and next steps' },
    ];

    for (const w of workshopMatches) {
      assert.ok(
        curriculumFile.includes(w.lessons),
        `Workshop ${w.ws} must cover lessons ${w.lessons}`
      );
      assert.ok(
        curriculumFile.includes(w.focus),
        `Workshop ${w.ws} must focus on "${w.focus}"`
      );
    }
  });

  await t.test('4. Eight-criterion rubric & 12/16 passing threshold standards panel', () => {
    const criteria = [
      'Offer accuracy',
      'Buyer fit',
      'Discovery',
      'Listening',
      'Value explanation',
      'Objection diagnosis',
      'Decision and terms',
      'Records and handoff',
    ];

    for (const c of criteria) {
      assert.ok(curriculumFile.toLowerCase().includes(c.toLowerCase()), `Rubric must include ${c}`);
    }
    assert.match(landingClientFile, /SPRINT_RUBRIC_CRITERIA/, 'Landing client imports and renders rubric criteria');

    assert.match(landingClientFile, /Performance assessment: at least 12 out of 16\./);
    assert.match(landingClientFile, /Knowledge check: at least 8 out of 10\./);
    assert.match(landingClientFile, /All required evidence submitted\./);
    assert.match(landingClientFile, /No unresolved critical failure\./);
    assert.match(landingClientFile, /A Certificate of Completion is subject to the programme's completion requirements\./);
  });

  await t.test('5. Two application routes supported without separate unapproved SKUs', () => {
    assert.match(landingClientFile, /Remote Sales Starter/);
    assert.match(landingClientFile, /Build practical samples for suitable appointment-setting or sales roles\./);
    assert.match(landingClientFile, /Business Builder/);
    assert.match(landingClientFile, /Use an authorised offer from your business, or begin with the DSS fictional training offer\./);
    assert.match(landingClientFile, /Both routes use the same core curriculum\. Your final application task reflects your goal\./);
  });

  await t.test('6. Unconfigured sprint fee policy: honest inquiry state, no fake checkout', () => {
    // Per requirements: NGN 50,000 is an assumption, not published automatically.
    // If unconfigured, must show "Request the current cohort fee and schedule."
    assert.match(curriculumFile, /unconfiguredFeeNotice:\s*'Request the current cohort fee and schedule\.'/);
    assert.match(landingClientFile, /Request the current cohort fee and schedule\./);
    // Does not have a fake checkout button for sprint
    assert.ok(!landingClientFile.includes('https://selar.com/dss-sprint'), 'No fake checkout links');
  });

  await t.test('7. Complete Application form with required fields and approved microcopy', () => {
    assert.match(landingClientFile, /Tell us what you want to use the skill for\./);
    assert.match(landingClientFile, /Share your goal and the time you can commit[\s\S]*proceed with enrolment\./);
    assert.match(landingClientFile, /Submit My Application/);
    assert.match(landingClientFile, /Submitting an application does not confirm admission or payment[\s\S]*programme details and the next step\./);
    assert.match(landingClientFile, /Your application has been received[\s\S]*programme information and the next step\./);

    // Verify fields in API handler
    assert.match(applyRouteFile, /fullName/);
    assert.match(applyRouteFile, /email/);
    assert.match(applyRouteFile, /phone/);
    assert.match(applyRouteFile, /timezone/);
    assert.match(applyRouteFile, /route/);
    assert.match(applyRouteFile, /salesExperience/);
    assert.match(applyRouteFile, /learningGoal/);
    assert.match(applyRouteFile, /canProtectHours/);
    assert.match(applyRouteFile, /companySponsorship/);
    assert.match(applyRouteFile, /deduplicated/);
  });

  await t.test('8. AI Practice powered by Closecraft features and practice buttons', () => {
    assert.match(landingClientFile, /SALES PRACTICE POWERED BY CLOSECRAFT/);
    assert.match(landingClientFile, /Practise the conversation before the next real buyer\./);
    assert.match(landingClientFile, /Use an AI buyer to rehearse a sales situation with approved offer facts\./);
    assert.match(landingClientFile, /Performance Intelligence/);
    assert.match(landingClientFile, /Coach Plan/);
    assert.match(landingClientFile, /See a Practice Example/);
    assert.match(landingClientFile, /Open Practice Studio/);
    assert.match(landingClientFile, /Ask About Practice Access/);
  });

  await t.test('9. All 12 FAQs verbatim', () => {
    const faqQuestions = [
      'Do I need previous sales experience?',
      'Is this only for people looking for remote jobs?',
      'How much time should I plan each week?',
      'Will I learn appointment setting and closing?',
      'Do I need my own product or paying client?',
      'Can I use only a phone?',
      'Is AI practice included?',
      'Does the Closecraft seven-day trial make DSS free?',
      'What does the certificate confirm?',
      'Are internships or placements guaranteed?',
      'What happens if I need to correct my work?',
      'Can my business sponsor someone?',
    ];

    for (const q of faqQuestions) {
      assert.ok(landingClientFile.includes(q), `FAQ must include: "${q}"`);
    }
  });

  await t.test('10. Absence of banned and unsupported claims', () => {
    // No fixed earnings ranges described as typical
    assert.ok(!landingClientFile.includes('₦300,000 - ₦1,500,000/mo'), 'No typical earnings claim');
    assert.ok(!landingClientFile.includes('Earn 35% in Partner Program') && !landingClientFile.includes('4 PRODUCTIZED TRACKS AVAILABLE:'), 'No top banner earnings ticker');
    // No static claimed-seat tickers
    assert.ok(!landingClientFile.includes('Only 6 seats left') && !landingClientFile.includes('seats remaining'), 'No fake seats countdown');
    // No cryptocurrency/blockchain credential hype
    assert.ok(!landingClientFile.includes('cryptographic credential') && !landingClientFile.includes('blockchain certificate'));
  });

  await t.test('11. Secondary partner placement in footer & Closecraft ecosystem links', () => {
    assert.match(landingClientFile, /href="\/dss\/affiliate"/, 'Affiliate link in footer');
    assert.match(landingClientFile, /Looking for sales software for your business\?[\s\S]*Explore Closecraft →/);
    assert.match(landingClientFile, /Emmanuel Effiong is the founder of Digital Sales School and Closecraft under Zeerocodes Automation Limited\./);
  });

  await t.test('12. Legacy catalog preservation: historical tracks remain in products.ts', () => {
    assert.ok(productsFile.includes('dss-setters-route'), 'Setters track preserved');
    assert.ok(productsFile.includes('dss-closers-route'), 'Closers track preserved');
    assert.ok(productsFile.includes('dss-both-routes'), 'Both routes preserved');
    assert.ok(productsFile.includes('DSS_SPRINT_FACTS'), 'Sprint facts exported');
  });
});
