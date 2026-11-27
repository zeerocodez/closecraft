// Premium UI Phase 2: landing contrast + signature CTA, the DSS palette
// tokenized, the clinic on the product emerald, and the inbox's second
// premium pass — all locked in as source checks.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

test('landing: the hero text is readable on the dark shell and the CTA is the signature lime', () => {
  const css = read('src/app/(marketing)/landing.css');
  assert.ok(!css.includes('#455047'), 'dark-on-dark hero lede colour is gone');
  assert.ok(!css.includes('#637065'), 'dark-on-dark eyebrow colour is gone');
  assert.match(css, /\.hero-lede \{[^}]*color: var\(--muted\)/);
  assert.match(css, /\.button \{[^}]*background: #C7F36B/);
  assert.match(css, /\.hero h1 em \{[^}]*linear-gradient\(92deg, #C7F36B/);
});

test('DSS palette is tokenized and the landing client uses the tokens', () => {
  const globals = read('src/app/globals.css');
  for (const token of ['--color-dss-blue: #0066FF', '--color-dss-sky: #38BDF8', '--color-dss-navy: #071126', '--color-dss-deep: #0B1733', '--color-dss-royal: #0052CC']) {
    assert.ok(globals.includes(token), `globals.css is missing ${token}`);
  }
  const dss = read('src/app/dss/DSSLandingClient.tsx');
  for (const hex of ['[#0066FF]', '[#38BDF8]', '[#071126]', '[#0B1733]', '[#0052CC]', '[#94A3B8]', '[#CBD5E1]']) {
    assert.ok(!dss.includes(hex), `DSSLandingClient still hardcodes ${hex}`);
  }
  assert.match(dss, /dss-blue/);
});

test('the DSS clinic uses the product emerald, not the off-brand green', () => {
  const clinic = read('src/app/dss/clinic/page.tsx');
  assert.ok(!clinic.includes('#2ea043'));
  assert.match(clinic, /emerald-500/);
});

test('inbox second pass: glass thread header, sheen frame, focus glow, gradient human bubble', () => {
  const inbox = read('src/app/(saas)/inbox/InboxClient.tsx');
  assert.match(inbox, /backdrop-blur-md border-b border-white\/10/);
  assert.match(inbox, /border-white\/10 rounded-2xl overflow-hidden shadow-2xl card-sheen/);
  assert.match(inbox, /focus:shadow-\[0_0_0_4px_rgba\(16,185,129,0\.12\)\]/);
  assert.match(inbox, /from-emerald-500 to-emerald-600/);
  assert.match(inbox, /shadow-emerald-500\/25/);
});
