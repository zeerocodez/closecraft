// The marketing stylesheet (landing.css) defines the design system the
// marketing pages are built with (eyebrow, hero, button, audience, bento,
// faq sections). It was orphaned — no file imported it — so every one of
// those pages rendered unstyled. These checks pin the wiring so the
// stylesheet cannot silently detach again.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('marketing group layout imports landing.css', () => {
  const layout = read('src/app/(marketing)/layout.tsx');
  assert.match(layout, /import\s+["']\.\/landing\.css["']/);
  assert.match(layout, /export default function MarketingLayout/);
});

test('landing.css still defines the classes marketing pages use', () => {
  const css = read('src/app/(marketing)/landing.css');
  for (const cls of ['.eyebrow', '.button', '.hero', '.section-intro']) {
    assert.ok(css.includes(cls), `landing.css must define ${cls}`);
  }
  // the phase-2 contrast fix must survive: the old light-theme hex is gone
  assert.ok(!css.includes('#455047'), 'hero lede must not use the old #455047');
});
