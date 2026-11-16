const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('CloseCraft Phase 3: Global Application Shell Acceptance Tests', () => {
  const layoutDir = path.join(__dirname, '..', 'src', 'components', 'layout');
  const authDir = path.join(__dirname, '..', 'src', 'app', '(auth)');

  test('1. WorkspaceHeader incorporates ProductSwitcher and contextual action triggers', () => {
    const headerPath = path.join(layoutDir, 'WorkspaceHeader.tsx');
    assert.ok(fs.existsSync(headerPath), 'WorkspaceHeader.tsx must exist');
    const content = fs.readFileSync(headerPath, 'utf-8');

    assert.ok(content.includes('ProductSwitcher'), 'Header must integrate ProductSwitcher');
    assert.ok(content.includes('getActiveProduct'), 'Header must derive active product context');
    assert.ok(content.includes('Growth Services'), 'CloseCraft context action must be present');
    assert.ok(content.includes('New Enquiry'), 'Revenue Engine context action must be present');
    assert.ok(content.includes('My Learning'), 'DSS context action must be present');
    assert.ok(content.includes('signOut'), 'User profile menu must support sign out');
  });

  test('2. Sidebar evaluates active product and renders dedicated product navigation', () => {
    const sidebarPath = path.join(layoutDir, 'Sidebar.tsx');
    assert.ok(fs.existsSync(sidebarPath), 'Sidebar.tsx must exist');
    const content = fs.readFileSync(sidebarPath, 'utf-8');

    assert.ok(content.includes('getActiveProduct(pathname)'), 'Sidebar must determine active product');
    assert.ok(content.includes('/growth/projects'), 'CloseCraft projects link must exist');
    assert.ok(content.includes('/services'), 'CloseCraft services catalogue link must exist');
    assert.ok(content.includes('/leads'), 'Revenue Engine enquiries link must exist');
    assert.ok(content.includes('/pipeline'), 'Revenue Engine pipeline link must exist');
    assert.ok(content.includes('/dss/dashboard'), 'DSS My Learning link must exist');
    assert.ok(content.includes('/dss/courses'), 'DSS Courses link must exist');
    assert.ok(content.includes('isOperator'), 'Sidebar must guard Operator Queue with isOperator');
    assert.ok(content.includes('EXTERNAL_PROFESSIONAL'), 'Sidebar must provide dedicated Partner hub');
  });

  test('3. AppShell provides product-aware mobile navigation bar and backdrop overlay', () => {
    const shellPath = path.join(layoutDir, 'AppShell.tsx');
    assert.ok(fs.existsSync(shellPath), 'AppShell.tsx must exist');
    const content = fs.readFileSync(shellPath, 'utf-8');

    assert.ok(content.includes('getActiveProduct'), 'AppShell must derive active product for mobile');
    assert.ok(content.includes('md:hidden fixed bottom-0'), 'Mobile bottom navigation must be present');
    assert.ok(content.includes('isMobile && isSidebarOpen'), 'Mobile backdrop overlay must exist');
    assert.ok(content.includes('pb-safe'), 'Mobile nav must handle iOS safe area');
  });

  test('4. Login page defaults post-auth redirect to /dashboard and uses modern Lucide icons', () => {
    const loginPath = path.join(authDir, 'login', 'page.tsx');
    assert.ok(fs.existsSync(loginPath), 'login/page.tsx must exist');
    const content = fs.readFileSync(loginPath, 'utf-8');

    assert.ok(content.includes("callbackUrl') || '/dashboard'"), 'Login must default to /dashboard');
    assert.ok(content.includes("signIn('credentials'"), 'Login must support credentials');
    assert.ok(content.includes("signIn('google'"), 'Login must support Google Workspace SSO');
  });
});

