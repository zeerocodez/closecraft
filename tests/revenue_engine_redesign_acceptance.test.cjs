const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('CloseCraft HQ Phase 5: Revenue Engine & Sales Operations Redesign Acceptance Tests', () => {
  const commandCentrePath = path.join(__dirname, '../src/app/(saas)/dashboard/revenue-engine/page.tsx');
  const actionQueuePath = path.join(__dirname, '../src/components/revenue-engine/ActionQueue.tsx');
  const leadsPagePath = path.join(__dirname, '../src/app/(saas)/leads/page.tsx');
  const leadsClientPath = path.join(__dirname, '../src/app/(saas)/leads/LeadsTableClient.tsx');
  const pipelinePagePath = path.join(__dirname, '../src/app/(saas)/pipeline/page.tsx');
  const pipelineClientPath = path.join(__dirname, '../src/app/(saas)/pipeline/PipelineClient.tsx');
  const dealCardPath = path.join(__dirname, '../src/app/(saas)/pipeline/DealCard.tsx');
  const appointmentsPagePath = path.join(__dirname, '../src/app/(saas)/appointments/page.tsx');
  const appointmentsClientPath = path.join(__dirname, '../src/app/(saas)/appointments/AppointmentsClient.tsx');
  const repPagePath = path.join(__dirname, '../src/app/(saas)/rep/page.tsx');
  const repClientPath = path.join(__dirname, '../src/app/(saas)/rep/RepDashboardClient.tsx');

  it('1. Sales Command Centre answers "What needs attention right now?" with Attention Pods', () => {
    assert.strictEqual(fs.existsSync(commandCentrePath), true, 'Command Centre page must exist');
    const content = fs.readFileSync(commandCentrePath, 'utf8');

    // Answers "What needs attention right now?"
    assert.match(content, /Hot Leads Needing Action/, 'Must feature Hot Leads attention pod');
    assert.match(content, /Revenue at Risk (?:&|&amp;) Leaks/, 'Must feature Revenue at Risk pod');
    assert.match(content, /ActionQueue/, 'Must render Next Best Action queue');

    // KPI Strip
    assert.match(content, /Closed-Won/, 'Must display Closed-Won metric');
    assert.match(content, /Open Pipeline/, 'Must display Open Pipeline metric');
    assert.match(content, /New Inbound Leads/, 'Must display Inbound Leads metric');
    assert.match(content, /Appointments/, 'Must display Scheduled Appointments metric');
    assert.match(content, /Pending Actions/, 'Must display Pending Human Actions metric');

    // Strict Tenant Isolation
    assert.match(content, /organizationId/, 'Must enforce organizationId boundary on queries');
  });

  it('2. ActionQueue enforces explainable factors, actor models, and slide-over inspector', () => {
    assert.strictEqual(fs.existsSync(actionQueuePath), true, 'ActionQueue.tsx must exist');
    const content = fs.readFileSync(actionQueuePath, 'utf8');

    // Explainable factor & Actor Model
    assert.match(content, /priority/, 'Must calculate and render priority score');
    assert.match(content, /ActorBadge/, 'Must display recommended actor');
    assert.match(content, /Explainable Factor (?:&|&amp;) Reasoning/, 'Must explain priority in drawer');

    // Direct WhatsApp Outreach
    assert.match(content, /formatWhatsAppUrl/, 'Must format direct WhatsApp outreach link');
    assert.match(content, /Send WhatsApp Outreach/, 'Must provide WhatsApp button in drawer');

    // Drawer Inspector
    assert.match(content, /ACTION INSPECTOR/, 'Must provide slide-over action inspector');
    assert.match(content, /claimRevenueAction/, 'Must support claiming actions');
  });

  it('3. Leads & Enquiry Hub supports team distribution, ICP intent scoring, and WhatsApp outreach', () => {
    assert.strictEqual(fs.existsSync(leadsPagePath), true, 'leads/page.tsx must exist');
    assert.strictEqual(fs.existsSync(leadsClientPath), true, 'LeadsTableClient.tsx must exist');

    const pageContent = fs.readFileSync(leadsPagePath, 'utf8');
    const clientContent = fs.readFileSync(leadsClientPath, 'utf8');

    // Page level quarantine & role isolation
    assert.match(pageContent, /getLeadsForTenant/, 'Must fetch tenant leads through DAL');
    assert.match(pageContent, /isExternalPro/, 'Must isolate external professionals');

    // Client level ICP scoring & distribution
    assert.match(clientContent, /buyingIntent/, 'Must evaluate buying intent score');
    assert.match(clientContent, /assignLeadToUser/, 'Must support lead assignment to closers/setters');
    assert.match(clientContent, /formatWhatsAppUrl/, 'Must support WhatsApp outreach');
    assert.match(clientContent, /LeadAiAssessmentModal/, 'Must integrate AI qualification protocol modal');
  });

  it('4. Sales Pipeline supports dual-mode Kanban & List views with stalled deal detection', () => {
    assert.strictEqual(fs.existsSync(pipelinePagePath), true, 'pipeline/page.tsx must exist');
    assert.strictEqual(fs.existsSync(pipelineClientPath), true, 'PipelineClient.tsx must exist');
    assert.strictEqual(fs.existsSync(dealCardPath), true, 'DealCard.tsx must exist');

    const clientContent = fs.readFileSync(pipelineClientPath, 'utf8');
    const cardContent = fs.readFileSync(dealCardPath, 'utf8');

    // Dual-mode view
    assert.match(clientContent, /KANBAN/, 'Must support Kanban view');
    assert.match(clientContent, /LIST/, 'Must support List view');
    assert.match(clientContent, /ResponsiveTable/, 'List view must use ResponsiveTable');

    // Staged workflow
    assert.match(clientContent, /OPPORTUNITY/, 'Pipeline must have OPPORTUNITY stage');
    assert.match(clientContent, /PROPOSAL/, 'Pipeline must have PROPOSAL stage');
    assert.match(clientContent, /NEGOTIATION/, 'Pipeline must have NEGOTIATION stage');
    assert.match(clientContent, /WON/, 'Pipeline must have WON stage');
    assert.match(clientContent, /LOST/, 'Pipeline must have LOST stage');

    // Stalled deal detection
    assert.match(cardContent, /Stalled (?:>|&gt;)7d/, 'Must detect and flag stalled deals inactive > 7 days');
    assert.match(cardContent, /updateDealStage/, 'Must allow advancing deal stages');
  });

  it('5. Appointments Operations tracks scheduled demos, video bridges, and reminder links', () => {
    assert.strictEqual(fs.existsSync(appointmentsPagePath), true, 'appointments/page.tsx must exist');
    assert.strictEqual(fs.existsSync(appointmentsClientPath), true, 'AppointmentsClient.tsx must exist');

    const pageContent = fs.readFileSync(appointmentsPagePath, 'utf8');
    const clientContent = fs.readFileSync(appointmentsClientPath, 'utf8');

    // Page isolation
    assert.match(pageContent, /organizationId/, 'Must isolate appointments to organization');

    // Client features
    assert.match(clientContent, /AGENDA/, 'Must support agenda view');
    assert.match(clientContent, /CALENDAR/, 'Must support calendar view');
    assert.match(clientContent, /SYNC/, 'Must support Google Calendar sync view');
    assert.match(clientContent, /formatWhatsAppUrl/, 'Must support WhatsApp reminder links');
    assert.match(clientContent, /updateAppointmentStatus/, 'Must allow status updates');
  });

  it('6. Closer & Setter Workspace provides high-focus queue, active deals, and commission tracking', () => {
    assert.strictEqual(fs.existsSync(repPagePath), true, 'rep/page.tsx must exist');
    assert.strictEqual(fs.existsSync(repClientPath), true, 'RepDashboardClient.tsx must exist');

    const pageContent = fs.readFileSync(repPagePath, 'utf8');
    const clientContent = fs.readFileSync(repClientPath, 'utf8');

    // Role verification
    assert.match(pageContent, /membership/, 'Must verify caller membership');

    // Workspace capabilities
    assert.match(clientContent, /activeLeadsCount/, 'Must track assigned active leads');
    assert.match(clientContent, /wonDealsCount/, 'Must track closed-won deals');
    assert.match(clientContent, /pipelineValue/, 'Must calculate rep pipeline value');
    assert.match(clientContent, /totalCommission/, 'Must calculate rep earned commission');
  });
});
