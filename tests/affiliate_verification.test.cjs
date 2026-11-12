require('tsx/cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { db } = require('../src/lib/db.ts');
const { authConfig } = require('../src/lib/auth.ts');

test('affiliate sign-in and existing sessions require persisted email verification', async () => {
  const original = db.user.findUnique;
  const passwordHash = await bcrypt.hash('test-password', 4);
  const user = { id: 'affiliate-test', email: 'affiliate@example.test', passwordHash,
    memberships: [], affiliateProfile: { id: 'profile-test' }, emailVerified: null };
  const provider = authConfig.providers.find(p => p.id === 'credentials');
  const authorize = provider.options.authorize;
  const signIn = () => authorize({ email: user.email, password: 'test-password' }, new Request('http://local'));
  const google = () => authConfig.callbacks.signIn({ user: { email: user.email }, account: { provider: 'google' } });
  const jwt = () => authConfig.callbacks.jwt({ token: { id: user.id, emailVerified: new Date() } });
  try {
    db.user.findUnique = async () => user;
    assert.equal(await signIn(), null, 'password must not grant an unverified affiliate a session');
    assert.match(await google(), /^\/verify-email\?flow=affiliate&email=/);
    assert.equal(await jwt(), null, 'even a previously issued token claiming verified must be rejected');
    user.emailVerified = new Date();
    assert.equal((await signIn()).id, user.id);
    assert.equal(await google(), true);
    assert.equal((await jwt()).id, user.id);
    assert.equal(await authorize({ email: user.email, password: 'wrong' }, new Request('http://local')), null);
    user.affiliateProfile = null;
    user.emailVerified = null;
    assert.equal((await signIn()).id, user.id, 'ordinary workspace registration preserves its existing flow');
  } finally { db.user.findUnique = original; }
});
