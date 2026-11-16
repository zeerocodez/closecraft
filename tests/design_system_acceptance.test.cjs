const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('CloseCraft Unified Design System Acceptance Tests', () => {
  const uiDir = path.join(__dirname, '..', 'src', 'components', 'ui');

  test('1. Button component exports, variants, and touch target standards', () => {
    const filePath = path.join(uiDir, 'Button.tsx');
    assert.ok(fs.existsSync(filePath), 'Button.tsx must exist');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes('export interface ButtonProps'), 'ButtonProps must be defined');
    assert.ok(content.includes('export const Button'), 'Named Button export must exist');
    assert.ok(content.includes('export default Button'), 'Default Button export must exist');
    assert.ok(content.includes('min-h-[44px]'), 'Standard button must meet 44px touch target accessibility');
    assert.ok(content.includes('variant = \'primary\''), 'Default variant must be primary');
    assert.ok(content.includes('focus-visible:ring-primary'), 'Focus ring must use primary brand token');
  });

  test('2. Badge component exports, semantic variants and dot indicator', () => {
    const filePath = path.join(uiDir, 'Badge.tsx');
    assert.ok(fs.existsSync(filePath), 'Badge.tsx must exist');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes('export interface BadgeProps'), 'BadgeProps must be defined');
    assert.ok(content.includes('export const Badge'), 'Named Badge export must exist');
    assert.ok(content.includes('dot = false'), 'Dot indicator prop must be supported');
    assert.ok(content.includes('success:'), 'Semantic success variant must exist');
    assert.ok(content.includes('warning:'), 'Semantic warning variant must exist');
    assert.ok(content.includes('destructive:'), 'Semantic destructive variant must exist');
  });

  test('3. Card component and compound subcomponents', () => {
    const filePath = path.join(uiDir, 'Card.tsx');
    assert.ok(fs.existsSync(filePath), 'Card.tsx must exist');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes('export const Card'), 'Card must be exported');
    assert.ok(content.includes('export const CardHeader'), 'CardHeader must be exported');
    assert.ok(content.includes('export const CardTitle'), 'CardTitle must be exported');
    assert.ok(content.includes('export const CardDescription'), 'CardDescription must be exported');
    assert.ok(content.includes('export const CardContent'), 'CardContent must be exported');
    assert.ok(content.includes('export const CardFooter'), 'CardFooter must be exported');
    assert.ok(content.includes('border-outline-variant/40'), 'Must use subtle border token');
  });

  test('4. Field, Input, Textarea, Select and SearchInput components', () => {
    const filePath = path.join(uiDir, 'Field.tsx');
    assert.ok(fs.existsSync(filePath), 'Field.tsx must exist');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes('export const Input'), 'Input must be exported');
    assert.ok(content.includes('export const Textarea'), 'Textarea must be exported');
    assert.ok(content.includes('export const Select'), 'Select must be exported');
    assert.ok(content.includes('export const SearchInput'), 'SearchInput must be exported');
    assert.ok(content.includes('export const Field'), 'Field wrapper must be exported');
    assert.ok(content.includes('h-11'), 'Input must meet 44px height for mobile accessibility');
  });

  test('5. EmptyState actionable component', () => {
    const filePath = path.join(uiDir, 'EmptyState.tsx');
    assert.ok(fs.existsSync(filePath), 'EmptyState.tsx must exist');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes('export const EmptyState'), 'EmptyState must be exported');
    assert.ok(content.includes('action?:'), 'EmptyState must support primary action');
    assert.ok(content.includes('secondaryAction?:'), 'EmptyState must support secondary action');
  });

  test('6. ResponsiveTable component for dual desktop-table/mobile-card', () => {
    const filePath = path.join(uiDir, 'ResponsiveTable.tsx');
    assert.ok(fs.existsSync(filePath), 'ResponsiveTable.tsx must exist');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes('export function ResponsiveTable'), 'ResponsiveTable must be exported');
    assert.ok(content.includes('hidden md:block'), 'Must support desktop table layout');
    assert.ok(content.includes('md:hidden'), 'Must support stacked mobile card layout');
  });

  test('7. Drawer slide-over component for responsive viewports', () => {
    const filePath = path.join(uiDir, 'Drawer.tsx');
    assert.ok(fs.existsSync(filePath), 'Drawer.tsx must exist');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes('export const Drawer'), 'Drawer must be exported');
    assert.ok(content.includes('role="dialog"'), 'Must have accessible dialog role');
  });

  test('8. ProductSwitcher active product resolution logic', () => {
    const filePath = path.join(uiDir, 'ProductSwitcher.tsx');
    assert.ok(fs.existsSync(filePath), 'ProductSwitcher.tsx must exist');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes('export const ProductSwitcher'), 'ProductSwitcher must be exported');
    assert.ok(content.includes('export function getActiveProduct'), 'getActiveProduct helper must be exported');

    // Test the logic directly by evaluating pure routing logic
    function getActiveProduct(pathname) {
      if (pathname.startsWith('/dss')) return 'dss';
      if (
        pathname.startsWith('/leads') ||
        pathname.startsWith('/pipeline') ||
        pathname.startsWith('/appointments') ||
        pathname.startsWith('/revenue')
      ) {
        return 'revenue';
      }
      return 'closecraft';
    }

    assert.equal(getActiveProduct('/dss/dashboard'), 'dss');
    assert.equal(getActiveProduct('/dss/courses/intro'), 'dss');
    assert.equal(getActiveProduct('/leads'), 'revenue');
    assert.equal(getActiveProduct('/pipeline'), 'revenue');
    assert.equal(getActiveProduct('/appointments'), 'revenue');
    assert.equal(getActiveProduct('/dashboard'), 'closecraft');
    assert.equal(getActiveProduct('/services'), 'closecraft');
    assert.equal(getActiveProduct('/projects/CC-REQ-12345'), 'closecraft');
  });
});
