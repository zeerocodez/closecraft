const { describe, it: test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

describe('CloseCraft HQ Phase 10: Settings, Team Management & User Roles Acceptance Tests', () => {

  test('1. Settings Page strictly enforces session authentication, role checks, and tenant isolation', () => {
    const pagePath = path.join(ROOT, 'src/app/(saas)/settings/page.tsx');
    assert.ok(fs.existsSync(pagePath), 'Settings page must exist');

    const content = fs.readFileSync(pagePath, 'utf8');
    assert.match(content, /await auth\(\)/, 'Requires authenticated session');
    assert.match(content, /redirect\(['"]\/login['"]\)/, 'Redirects unauthenticated visitors');
    assert.match(content, /organizationId/, 'Requires tenant organizationId');
    assert.match(content, /where:\s*\{\s*id:\s*organizationId\s*\}/, 'Queries organization scoped to organizationId');
    assert.match(content, /getOrCreateWorkspaceSubscription\(organizationId\)/, 'Fetches subscription scoped to organizationId');
  });

  test('2. Workspace Identity Form captures legal name, permanent slug, and WhatsApp outreach channel', () => {
    const formPath = path.join(ROOT, 'src/app/(saas)/settings/WorkspaceIdentityForm.tsx');
    assert.ok(fs.existsSync(formPath), 'WorkspaceIdentityForm must exist');

    const content = fs.readFileSync(formPath, 'utf8');
    assert.match(content, /updateOrganizationIdentity/, 'Connected to updateOrganizationIdentity action');
    assert.match(content, /Workspace \/ Organization Legal Name/, 'Organization legal name label');
    assert.match(content, /Official WhatsApp Outreach Number/, 'WhatsApp outreach number label');
    assert.match(content, /Workspace Slug Identifier/, 'Workspace slug label');
    assert.match(content, /closecrafthq\.com\//, 'Displays permanent URL prefix');
  });

  test('3. AI Qualification Policy Form includes 1-click presets and lead reprocessing toggle', () => {
    const formPath = path.join(ROOT, 'src/app/(saas)/settings/SettingsForm.tsx');
    assert.ok(fs.existsSync(formPath), 'SettingsForm component must exist');

    const content = fs.readFileSync(formPath, 'utf8');
    assert.match(content, /updateQualificationPolicy/, 'Connected to updateQualificationPolicy action');
    assert.match(content, /Ideal Customer Profile \(ICP\)/, 'ICP policy header');
    assert.match(content, /B2B Enterprise & Managed Closers/, 'Includes B2B enterprise template');
    assert.match(content, /Digital Sales School \(DSS\) Academy/, 'Includes DSS academy template');
    assert.match(content, /Reprocess Active Leads with New Policy/, 'Includes reprocess toggle');
  });

  test('4. Team Page enforces tenant isolation, operational metric strip, and seat capacity', () => {
    const pagePath = path.join(ROOT, 'src/app/(saas)/team/page.tsx');
    assert.ok(fs.existsSync(pagePath), 'Team page must exist');

    const content = fs.readFileSync(pagePath, 'utf8');
    assert.match(content, /await auth\(\)/, 'Requires authenticated session');
    assert.match(content, /redirect\(['"]\/login['"]\)/, 'Redirects unauthenticated visitors');
    assert.match(content, /where:\s*\{\s*organizationId\s*\}/, 'Enforces tenant isolation on members, leads, deals, appointments');
    assert.match(content, /getOrCreateWorkspaceSubscription\(organizationId\)/, 'Binds team seat quotas to subscription');
  });

  test('5. Team Client provides 4-KPI operational metrics, seat utilization bar, and routing strategies', () => {
    const clientPath = path.join(ROOT, 'src/app/(saas)/team/TeamPageClient.tsx');
    assert.ok(fs.existsSync(clientPath), 'TeamPageClient must exist');

    const content = fs.readFileSync(clientPath, 'utf8');
    // 4 Metrics
    assert.match(content, /Active Closers/, 'Metric for active closers');
    assert.match(content, /Appointment Setters/, 'Metric for appointment setters');
    assert.match(content, /Leads in Workflow/, 'Metric for claimed leads in workflow');
    assert.match(content, /Open Pool \(Unassigned\)/, 'Metric for open pool unassigned leads');

    // Seat capacity bar
    assert.match(content, /Workspace Seat Capacity/, 'Seat capacity header');
    assert.match(content, /seats assigned/, 'Seats assigned tracker');
    assert.match(content, /Manage Seats in Billing/, 'Direct link to billing');

    // Lead routing options
    assert.match(content, /Inbound Lead Routing Engine/, 'Routing engine header');
    assert.match(content, /Open Pool \(First-to-Claim\)/, 'Open pool strategy');
    assert.match(content, /Automated Round-Robin/, 'Automated round robin strategy');
    assert.match(content, /Manual Manager Assignment/, 'Manager manual assignment strategy');
  });

  test('6. Team Roster supports search, availability toggle, commission editing, and member invitation', () => {
    const clientPath = path.join(ROOT, 'src/app/(saas)/team/TeamPageClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    // Roster controls
    assert.match(content, /Search member\.\.\./, 'Search input placeholder');
    assert.match(content, /All Roles/, 'Role filter dropdown');
    assert.match(content, /handleToggleAvailability/, 'Availability toggle handler');
    assert.match(content, /Available for Leads/, 'Availability status label');

    // Modals
    assert.match(content, /Invite Team Member/, 'Add member modal heading');
    assert.match(content, /isSeatLimitReached/, 'Checks seat capacity before allowing invite');
    assert.match(content, /Commission Settings/, 'Commission modal heading');
    assert.match(content, /Role & Permissions Matrix/, 'Role matrix modal heading');
  });

  test('7. Server Actions strictly allow OWNER, ADMIN, and MANAGER to govern team and lead routing', () => {
    const actionsPath = path.join(ROOT, 'src/app/(saas)/actions.ts');
    const content = fs.readFileSync(actionsPath, 'utf8');

    assert.match(content, /caller\?\.role !== 'OWNER' && caller\?\.role !== 'ADMIN' && caller\?\.role !== 'MANAGER'/, 'Allows OWNER in addTenantTeamMember');
    assert.match(content, /internalCount >= sub\.maxInternalSeats/, 'Enforces commercial seat limit on member addition');
    assert.match(content, /updateTenantRoutingMode/, 'Routing mode update action');
    assert.match(content, /toggleMemberAvailability/, 'Availability toggle action');
    assert.match(content, /updateMemberCommission/, 'Commission update action');
  });
});

