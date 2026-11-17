require('tsx/cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
let configuration;
const file = require.resolve('next-auth');
require.cache[file] = { id:file, filename:file, loaded:true, exports:{ __esModule:true, default: (config) => { configuration=config; return {handlers:{}}; } } };
const { db } = require('../src/lib/db.ts');
require('../src/lib/auth.ts');
test('login rejects throttled accounts before reading credentials from database',async()=>{
 const originalQuery=db.$queryRaw;
 const originalFind=db.user.findUnique;
 let reads=0;
 try {
   const counts=[1,11];
   db.$queryRaw=async()=>[{count:counts.shift()}];
   db.user.findUnique=async()=>{reads++;throw Error('must not look up credentials');};
   const provider=configuration.providers.find(p=>p.id==='credentials');
   const result=await provider.options.authorize({email:'TEST@example.test',password:'synthetic-password'},new Request('http://local.test/'));
   assert.equal(result,null);
   assert.equal(reads,0);
 }finally{db.$queryRaw=originalQuery;db.user.findUnique=originalFind;}
});
