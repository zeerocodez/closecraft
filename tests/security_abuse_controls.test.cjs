require('tsx/cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { db } = require('../src/lib/db.ts');
const authFile = require.resolve('../src/lib/auth.ts');
require.cache[authFile] = { id: authFile, filename: authFile, loaded: true, exports: { auth: async () => ({ user: { id: 'synthetic-user' } }) } };
const rate = require('../src/lib/rateLimit.ts');
const { POST: widget } = require('../src/app/api/leads/embed/route.ts');
const { POST: payout } = require('../src/app/api/affiliate/payout/route.ts');
const request = (data) => new Request('http://local.test/', { method: 'POST', body: JSON.stringify(data) });

test('widget rejects requests after shared limit and bounds input before writes', async () => {
  const original = { query: db.$queryRaw, find: db.organization.findFirst, create: db.lead.create };
  let writes = 0;
  let count = 0;
  try {
    db.$queryRaw = async () => [{count: ++count}];
    db.organization.findFirst = async () => ({ id: 'synthetic-org', slug: 'synthetic' });
    db.lead.create = async () => { writes++; return {id:'synthetic-lead'}; };
    const body = { workspaceSlug:'synthetic', name:'Synthetic', email:'synthetic@example.test' };
    assert.equal((await widget(request({...body, name:'x'.repeat(121)}))).status,400);
    assert.equal((await widget(request({...body, message:'x'.repeat(17000)}))).status,413);
    count = 50;
    assert.equal((await widget(request(body))).status,429);
    assert.equal(writes,0);
    count = 0;
    assert.equal((await widget(request(body))).status,201);
    assert.equal(writes,1);
  } finally { db.$queryRaw=original.query; db.organization.findFirst=original.find; db.lead.create=original.create; }
});

test('payout balance is read after lock inside transaction; nonfinite amounts rejected', async () => {
  const original = db.$transaction;
  const events=[];
  let writes=0;
  try {
    db.$transaction = async (fn, options) => {
      assert.equal(options.isolationLevel,'ReadCommitted');
      return fn({
        $queryRaw: async (sql) => { assert.match(sql.join('?'), /FOR UPDATE/); events.push('lock'); },
        affiliateProfile: { findUnique: async () => { events.push('read'); return {id:'synthetic',status:'APPROVED',commissions:[{status:'APPROVED',amount:10000}],payouts:[]}; } },
        affiliatePayout: { create: async ({data}) => { writes++; return data; } }
      });
    };
    assert.equal((await payout(request({amountNgn:'NaN'}))).status,400);
    assert.equal(writes,0);
    assert.equal((await payout(request({amountNgn:10000}))).status,200);
    assert.deepEqual(events,['lock','read','lock','read']);
    assert.equal(writes,1);
  } finally { db.$transaction=original; }
});

test('shared limiter refuses after limit using database counters', async () => {
 const original=db.$queryRaw;
 try {
   db.$queryRaw=async ()=>[{count:11}];
   assert.equal((await rate.sharedRateLimit('synthetic-account',10,60000)).allowed,false);
 } finally { db.$queryRaw=original; }
});
