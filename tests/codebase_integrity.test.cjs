// Codebase integrity: no live surface may point at a page that does not
// exist, the Loop guide's link registry must agree with the real route
// tree, and the UI kit pieces the admin guide was written against must
// exist with the props it uses.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// Build the set of real page routes from the App Router tree.
function routeSet() {
  const routes = new Set();
  const walk = (dir, segs) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name.startsWith('_')) continue;
        const seg = e.name.startsWith('(') && e.name.endsWith(')') ? null : e.name;
        walk(p, seg ? [...segs, seg] : segs);
      } else if (/^page\.(tsx?|jsx?)$/.test(e.name) || /^route\.(ts|tsx)$/.test(e.name)) {
        routes.add('/' + segs.join('/'));
      }
    }
  };
  walk(path.join(ROOT, 'src/app'), []);
  return routes;
}
const ROUTES = routeSet();
function routeExists(href) {
  const clean = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
  if (ROUTES.has(clean)) return true;
  if (fs.existsSync(path.join(ROOT, 'public', clean))) return true;
  return [...ROUTES].some((r) =>
    new RegExp('^' + r.replace(/\[[^\]]+\]/g, '[^/]+').replace(/\//g, '\\/') + '$').test(clean)
  );
}

test('guide destinations: every ungated destination resolves to a real page', () => {
  const src = read('src/lib/guide/links.ts');
  const entries = [...src.matchAll(/\{ label: "([^"]+)", href: "([^"]+)"(, needs: "[^"]+")?/g)];
  assert.ok(entries.length >= 10, 'expected the destination registry to be parsed');
  for (const [, label, href, needs] of entries) {
    if (needs) continue; // switch-gated roadmap pages are offered only when built
    assert.ok(routeExists(href), `destination "${label}" -> ${href} has no route`);
  }
});

test('guide defaults: every built-in answer link exists in the registry', () => {
  const registry = read('src/lib/guide/links.ts');
  const hrefs = new Set([...registry.matchAll(/href: "([^"]+)"/g)].map((m) => m[1]));
  const defaults = read('src/lib/guide/defaults.ts');
  const used = [...defaults.matchAll(/link\("([^"]+)"\)/g)].map((m) => m[1]);
  assert.ok(used.length > 0);
  for (const h of used) assert.ok(hrefs.has(h), `defaults link ${h} is not in the registry`);
});

test('no source file links to the retired role-split auth paths', () => {
  const dead = ['"/trainee/', '"/org/', '"/employer/', '"/investor/', '"/admin/login', '"/admin/forgot', '"/courses', '"/certificate"', '"/showcase', '"/trainee/job-postings'];
  const files = [];
  (function scan(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) scan(p);
      else if (/\.(tsx?|jsx?)$/.test(e.name)) files.push(p);
    }
  })(path.join(ROOT, 'src'));
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    for (const d of dead) {
      assert.ok(!src.includes(d), `${path.relative(ROOT, f)} still references ${d}`);
    }
  }
});

test('Modal accepts the `open` alias its call sites pass', () => {
  const modal = read('src/components/ui/Modal.tsx');
  assert.match(modal, /open\?: boolean/);
  assert.match(modal, /isOpenProp \?\? openProp/);
});

test('ConfirmModal exists with the props the guide manager uses', () => {
  const cm = read('src/components/ui/ConfirmModal.tsx');
  for (const prop of ['open', 'title', 'description', 'confirmLabel', 'danger', 'onCancel', 'onConfirm']) {
    assert.ok(cm.includes(prop), `ConfirmModal is missing ${prop}`);
  }
  assert.match(cm, /from '\.\/Modal'/);
});

test('Skeleton exports the SkeletonList the guide manager imports', () => {
  assert.match(read('src/components/ui/Skeleton.tsx'), /export const SkeletonList/);
});

test('the Loop guide manager is reachable at /admin/command/guide behind the superadmin gate', () => {
  const page = read('src/app/(saas)/admin/command/guide/page.tsx');
  assert.match(page, /SUPER_ADMIN/);
  assert.match(page, /OPERATOR/);
  assert.match(page, /GuideManager/);
  const dash = read('src/app/(saas)/admin/AdminDashboardClient.tsx');
  assert.match(dash, /GuideSwitchCard/);
});

test('the DSS clinic worksheet download exists and is a real PDF', () => {
  const p = path.join(ROOT, 'public/downloads/Ten_Enquiry_Sales_Audit.pdf');
  assert.ok(fs.existsSync(p), 'worksheet PDF missing');
  const head = fs.readFileSync(p).subarray(0, 5).toString('latin1');
  assert.equal(head, '%PDF-');
});
