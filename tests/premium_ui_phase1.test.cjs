// Premium UI Phase 1: the design foundation must actually exist —
// brand/accent tokens defined (they were referenced but never defined),
// the signature lime tokenized instead of hardcoded, and the shared
// primitives carrying the premium treatments every screen inherits.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const globals = read('src/app/globals.css');

test('brand tokens referenced across the guide/DSS/landing families are defined', () => {
  for (const token of ['--color-brand-ink', '--color-brand-teal', '--color-brand-surface', '--color-brand-gray', '--color-brand-mint', '--color-brand-sand', '--color-brand-on', '--color-brand-rose']) {
    assert.ok(globals.includes(token), `globals.css is missing ${token}`);
  }
});

test('font-display and the elevation system are defined', () => {
  assert.ok(globals.includes('--font-display'));
  for (const token of ['--shadow-card', '--shadow-pop', '--shadow-glow-primary']) {
    assert.ok(globals.includes(token), `globals.css is missing ${token}`);
  }
  for (const util of ['.glass-panel', '.text-gradient', '.card-sheen']) {
    assert.ok(globals.includes(util), `globals.css is missing the ${util} utility`);
  }
});

test('the signature lime is a token, not a hardcoded hex, anywhere in src', () => {
  assert.ok(globals.includes('--color-accent-lime: #C7F36B'));
  const offenders = [];
  (function scan(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) scan(p);
      else if (/\.(tsx?|jsx?)$/.test(e.name) && fs.readFileSync(p, 'utf8').includes('#C7F36B')) offenders.push(path.relative(ROOT, p));
    }
  })(path.join(ROOT, 'src'));
  assert.deepEqual(offenders, []);
});

test('primary Button uses the tokenized lime with its glow', () => {
  const button = read('src/components/ui/Button.tsx');
  assert.match(button, /bg-accent-lime/);
  assert.ok(!button.includes('#C7F36B'));
});

test('shared Card carries the sheen and the deeper hover elevation', () => {
  const card = read('src/components/ui/Card.tsx');
  assert.match(card, /card-sheen/);
  assert.match(card, /hover:shadow-pop/);
});

test('sidebar marks the active item with an indicator bar', () => {
  const sidebar = read('src/components/layout/Sidebar.tsx');
  assert.match(sidebar, /h-6 w-1 rounded-full bg-primary/);
  assert.match(sidebar, /h-6 w-1 rounded-full bg-emerald-400/);
});

test('app shell and login carry the ambient brand glow', () => {
  assert.match(read('src/components/layout/AppShell.tsx'), /bg-emerald-500\/\[0\.07\]/);
  const login = read('src/app/(auth)/login/page.tsx');
  assert.match(login, /bg-emerald-500\/\[0\.09\]/);
  assert.match(login, /shadow-pop/);
});

test('dashboard KPI cards use the sheen and tokenized accents', () => {
  const dash = read('src/app/(saas)/dashboard/page.tsx');
  assert.ok((dash.match(/card-sheen/g) || []).length >= 4);
  assert.match(dash, /accent-lime/);
});
