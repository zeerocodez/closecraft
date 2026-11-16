const { describe, it: test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

describe('CloseCraft HQ Phase 8: Appointment Operations & Calendar Acceptance Tests', () => {

  test('1. Appointments Page strictly enforces authentication and tenant isolation', () => {
    const pagePath = path.join(ROOT, 'src/app/(saas)/appointments/page.tsx');
    assert.ok(fs.existsSync(pagePath), 'Appointments page must exist');

    const content = fs.readFileSync(pagePath, 'utf8');
    assert.match(content, /await auth\(\)/, 'Requires authenticated session');
    assert.match(content, /redirect\(['"]\/login['"]\)/, 'Redirects unauthenticated visitors');
    assert.match(content, /where:\s*\{\s*organizationId\s*\}/, 'Enforces strict tenant isolation on appointments query');
  });

  test('2. Appointments Client features 4-KPI operational metric strip', () => {
    const clientPath = path.join(ROOT, 'src/app/(saas)/appointments/AppointmentsClient.tsx');
    assert.ok(fs.existsSync(clientPath), 'AppointmentsClient component must exist');

    const content = fs.readFileSync(clientPath, 'utf8');
    assert.match(content, /Upcoming Demos/, 'Metric for upcoming demos');
    assert.match(content, /Completed Calls/, 'Metric for completed calls');
    assert.match(content, /Anti-No-Show Shield/, 'Metric for anti-no-show shield');
    assert.match(content, /No-Show Incidents/, 'Metric for no-show tracking');
  });

  test('3. Multi-view navigation supports Agenda, Weekly Distribution, and Sync panels', () => {
    const clientPath = path.join(ROOT, 'src/app/(saas)/appointments/AppointmentsClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    assert.match(content, /Upcoming Agenda/, 'Agenda view mode');
    assert.match(content, /Weekly Distribution/, 'Weekly calendar distribution mode');
    assert.match(content, /Google Calendar (?:&|&amp;) Reminders/, 'Sync and settings mode');
    assert.match(content, /filterStatus === status/, 'Status filter controls (All, Confirmed, Scheduled, Completed, No-Show)');
  });

  test('4. Meeting room bridge and WhatsApp reminders are directly integrated', () => {
    const clientPath = path.join(ROOT, 'src/app/(saas)/appointments/AppointmentsClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    // Video Call Bridge
    assert.match(content, /Join Video Call/, 'Video bridge launch button');
    assert.match(content, /appt\.meetingUrl/, 'Passes dynamic meeting room URL');

    // WhatsApp Reminder
    assert.match(content, /formatWhatsAppUrl/, 'Uses official WhatsApp URL formatter');
    assert.match(content, /Send WhatsApp Reminder/, 'WhatsApp reminder deep-link');
  });

  test('5. Anti-No-Show Shield and Google Calendar synchronization are displayed', () => {
    const clientPath = path.join(ROOT, 'src/app/(saas)/appointments/AppointmentsClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    assert.match(content, /Automated No-Show Shield/, 'Anti-no-show shield card');
    assert.match(content, /WhatsApp 24h Confirmation/, '24h confirmation reminder rule');
    assert.match(content, /SMS \/ Email 1h Flash Reminder/, '1h flash reminder rule');
    assert.match(content, /Google Calendar Synchronization/, 'Google Calendar sync integration');
    assert.match(content, /updateGoogleCalendarIntegration/, 'Invokes server action to connect/disconnect calendar');
  });

  test('6. Schedule Appointment Modal captures prospect, closer, date/time, and duration', () => {
    const clientPath = path.join(ROOT, 'src/app/(saas)/appointments/AppointmentsClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf8');

    assert.match(content, /Schedule Sales Presentation/, 'Modal dialog title');
    assert.match(content, /Select Prospect \/ Lead/, 'Prospect selection dropdown');
    assert.match(content, /Assigned Closer \/ Setter/, 'Closer assignment dropdown');
    assert.match(content, /type="datetime-local"/, 'Native datetime-local picker');
    assert.match(content, /bookOrUpdateAppointment/, 'Invokes server action to book and sync appointment');
  });
});

