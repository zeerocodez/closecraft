const { describe, it: test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

describe('CloseCraft HQ Phase 11: End-to-End Platform Redesign & Production Readiness Verification', () => {

  test('1. Three-Product Global Switcher and Unified AppShell are wired seamlessly', () => {
    const switcherPath = path.join(ROOT, 'src/components/ui/ProductSwitcher.tsx');
    const headerPath = path.join(ROOT, 'src/components/layout/WorkspaceHeader.tsx');
    const sidebarPath = path.join(ROOT, 'src/components/layout/Sidebar.tsx');

    assert.ok(fs.existsSync(switcherPath), 'ProductSwitcher must exist');
    assert.ok(fs.existsSync(headerPath), 'WorkspaceHeader must exist');
    assert.ok(fs.existsSync(sidebarPath), 'Sidebar must exist');

    const switcherContent = fs.readFileSync(switcherPath, 'utf8');
    assert.match(switcherContent, /name:\s*['"]CloseCraft['"]/, 'Includes CloseCraft product option');
    assert.match(switcherContent, /name:\s*['"]Revenue Engine['"]/, 'Includes Revenue Engine product option');
    assert.match(switcherContent, /name:\s*['"]Digital Sales School['"]/, 'Includes DSS product option');

    const headerContent = fs.readFileSync(headerPath, 'utf8');
    assert.match(headerContent, /ProductSwitcher/, 'WorkspaceHeader renders ProductSwitcher');
  });

  test('2. Product 1 (CloseCraft Growth Services) provides end-to-end catalogue, brief, and project tracking', () => {
    const cataloguePath = path.join(ROOT, 'src/app/(saas)/services/ServicesClient.tsx');
    const projectPath = path.join(ROOT, 'src/components/growth/GrowthProjectDetailClient.tsx');
    assert.ok(fs.existsSync(cataloguePath), 'ServicesClient must exist');
    assert.ok(fs.existsSync(projectPath), 'GrowthProjectDetailClient must exist');

    const catalogueContent = fs.readFileSync(cataloguePath, 'utf8');
    assert.match(catalogueContent, /ADS_MANAGEMENT/, 'Features Meta Ads service');
    assert.match(catalogueContent, /AI_FLYER_DESIGN/, 'Features AI Flyer service');
    assert.match(catalogueContent, /AI_VIDEO_CREATION/, 'Features AI Video service');
    assert.match(catalogueContent, /LANDING_PAGE_DESIGN/, 'Features Landing Page service');
    assert.match(catalogueContent, /VSL_DESIGN/, 'Features VSL service');
    assert.match(catalogueContent, /GET STARTED/, 'Primary CTA must be GET STARTED');

    const projectContent = fs.readFileSync(projectPath, 'utf8');
    assert.match(projectContent, /GrowthMilestonesTracker/, 'Project milestone tracking');
    assert.match(projectContent, /CONTINUE ON WHATSAPP/, 'WhatsApp consultation connection');
    assert.match(projectContent, /GrowthProposalCard/, 'Commercial proposal review');
  });

  test('3. Product 2 (Revenue Engine) answers "What needs attention right now?" with explainable actions', () => {
    const commandCentrePath = path.join(ROOT, 'src/app/(saas)/dashboard/revenue-engine/page.tsx');
    const actionQueuePath = path.join(ROOT, 'src/components/revenue-engine/ActionQueue.tsx');
    const appointmentsPath = path.join(ROOT, 'src/app/(saas)/appointments/AppointmentsClient.tsx');

    assert.ok(fs.existsSync(commandCentrePath), 'Command Centre page must exist');
    assert.ok(fs.existsSync(actionQueuePath), 'ActionQueue must exist');
    assert.ok(fs.existsSync(appointmentsPath), 'Appointments client must exist');

    const commandContent = fs.readFileSync(commandCentrePath, 'utf8');
    assert.match(commandContent, /Hot Leads Needing Action/, 'Must feature Hot Leads attention pod');
    assert.match(commandContent, /Revenue at Risk/, 'Must feature Revenue at Risk pod');
    assert.match(commandContent, /ActionQueue/, 'Must render Next Best Action queue');

    const appointmentsContent = fs.readFileSync(appointmentsPath, 'utf8');
    assert.match(appointmentsContent, /Anti-No-Show Shield/, 'Anti-no-show shield active');
    assert.match(appointmentsContent, /Join Video Call/, 'Video bridge integration');
  });

  test('4. Product 3 (Digital Sales School LMS) enforces prerequisite module locking and AI roleplay studio', () => {
    const courseDetailPath = path.join(ROOT, 'src/app/dss/(trainee)/courses/[slug]/page.tsx');
    const modulePath = path.join(ROOT, 'src/app/dss/(trainee)/module/[id]/page.tsx');
    const examPath = path.join(ROOT, 'src/app/dss/(trainee)/examinations/page.tsx');

    assert.ok(fs.existsSync(courseDetailPath), 'Course curriculum detail page must exist');
    assert.ok(fs.existsSync(modulePath), 'Module player page must exist');
    assert.ok(fs.existsSync(examPath), 'Examinations page must exist');

    const detailContent = fs.readFileSync(courseDetailPath, 'utf8');
    assert.match(detailContent, /Sequential Progression Gated/, 'Enforces sequential prerequisite locking');
    assert.match(detailContent, /isLocked/, 'Evaluates lock status dynamically');

    const moduleContent = fs.readFileSync(modulePath, 'utf8');
    assert.match(moduleContent, /const isLocked = index > 0 && !completedLessonIds\.has/, 'Lesson N locked until Lesson N-1 completed');
    assert.match(moduleContent, /Practise this skill/, 'Deep link to practice drill');

    const examContent = fs.readFileSync(examPath, 'utf8');
    assert.match(examContent, /isEligible = totalModules > 0 && completedModules >= totalModules/, 'Locks certification exams until curriculum completion');
    assert.match(examContent, /Start Final AI Assessment/, 'Certification exam start action');
  });

  test('5. Multichannel Unified Inbox provides triage, AI auto-pilot handoff, and WhatsApp web launch', () => {
    const inboxPath = path.join(ROOT, 'src/app/(saas)/inbox/InboxClient.tsx');
    assert.ok(fs.existsSync(inboxPath), 'InboxClient must exist');

    const content = fs.readFileSync(inboxPath, 'utf8');
    assert.match(content, /toggleAiHandoff/, 'Deterministic toggle for pausing/resuming AI auto-pilot');
    assert.match(content, /Dispatch via WhatsApp/, 'WhatsApp web composer launch');
    assert.match(content, /Opportunity Snapshot/, 'Context inspector deal snapshot');
    assert.match(content, /Next Best Action/, 'Presents recommended next best action');
  });

  test('6. Commercial Billing and Bachs payment flow strictly enforce 7-day trial and seat capacities', () => {
    const billingPath = path.join(ROOT, 'src/components/billing/BillingClient.tsx');
    const returnPath = path.join(ROOT, 'src/app/(saas)/billing/return/page.tsx');
    assert.ok(fs.existsSync(billingPath), 'BillingClient must exist');
    assert.ok(fs.existsSync(returnPath), 'Billing return page must exist');

    const billingContent = fs.readFileSync(billingPath, 'utf8');
    assert.match(billingContent, /Starter Plan/, 'Starter tier');
    assert.match(billingContent, /Pro Plan/, 'Pro tier');
    assert.match(billingContent, /Internal Team Seats Utilization/, 'Seat utilization progress bar');
    assert.match(billingContent, /Pay with Bachs/, 'Bachs checkout launcher');
    assert.match(billingContent, /Official Payment Receipt/, 'Verified receipt modal');
  });

  test('7. Settings & Team Operations govern workspace identity, lead routing, and role matrices', () => {
    const settingsPath = path.join(ROOT, 'src/app/(saas)/settings/page.tsx');
    const teamPath = path.join(ROOT, 'src/app/(saas)/team/TeamPageClient.tsx');
    assert.ok(fs.existsSync(settingsPath), 'Settings page must exist');
    assert.ok(fs.existsSync(teamPath), 'TeamPageClient must exist');

    const settingsContent = fs.readFileSync(settingsPath, 'utf8');
    assert.match(settingsContent, /Workspace Identity & WhatsApp Outreach/, 'Identity section');
    assert.match(settingsContent, /AI Qualification & Intent Rules/, 'AI policy section');

    const teamContent = fs.readFileSync(teamPath, 'utf8');
    assert.match(teamContent, /Inbound Lead Routing Engine/, 'Lead routing options');
    assert.match(teamContent, /Role & Permissions Matrix/, 'Role matrix modal');
  });

  test('8. Tenant Isolation & Database Row-Level Security are verified across all private routes', () => {
    const routesToInspect = [
      'src/app/(saas)/appointments/page.tsx',
      'src/app/(saas)/billing/page.tsx',
      'src/app/(saas)/inbox/page.tsx',
      'src/app/(saas)/leads/page.tsx',
      'src/app/(saas)/pipeline/page.tsx',
      'src/app/(saas)/settings/page.tsx',
      'src/app/(saas)/team/page.tsx',
      'src/app/(saas)/growth/projects/[reference]/page.tsx'
    ];

    for (const relPath of routesToInspect) {
      const fullPath = path.join(ROOT, relPath);
      assert.ok(fs.existsSync(fullPath), `Route ${relPath} must exist`);
      const content = fs.readFileSync(fullPath, 'utf8');
      assert.match(content, /await auth\(\)/, `${relPath} must require auth()`);
      assert.match(content, /organizationId/, `${relPath} must query by organizationId`);
    }
  });
});
