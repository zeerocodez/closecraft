export function requireDemoDatabase() {
  if (process.env.NODE_ENV !== 'development' || process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Demo seed requires NODE_ENV=development and ALLOW_DEMO_SEED=true');
  }
  const url = new URL(process.env.DATABASE_URL || '');
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !url.pathname.endsWith('_demo')) {
    throw new Error('Demo seed requires a local PostgreSQL database whose name ends in _demo');
  }
}
