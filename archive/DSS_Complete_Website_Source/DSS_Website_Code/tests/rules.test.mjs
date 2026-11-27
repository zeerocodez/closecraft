import assert from 'node:assert/strict';
import {test} from 'node:test';
import {commissionFor,safeCheckout,validCode,availableSales} from '../app/rules.ts';
test('commission uses integer money and rounds down fractional kobo',()=>{assert.equal(commissionFor(5000000,3000),1500000);assert.equal(commissionFor(101,1250),12);assert.throws(()=>commissionFor(5000000,10001));assert.throws(()=>commissionFor(-1,3000));});
test('checkout rejects hostile hosts and insecure destinations',()=>{assert.equal(safeCheckout('https://selar.com/dss','selar.com'),'https://selar.com/dss');assert.throws(()=>safeCheckout('https://selar.com.evil.test/dss','selar.com'));assert.throws(()=>safeCheckout('http://nestuge.com/dss','nestuge.com'));assert.throws(()=>safeCheckout('https://user:secret@selar.com/dss','selar.com'));});
test('cleared balance excludes paid, refunded and unexpired records',()=>{assert.deepEqual(availableSales([{status:'paid',eligible:1},{status:'pending',eligible:20},{status:'pending',eligible:5},{status:'reversed',eligible:1}],10),[{status:'pending',eligible:5}]);});
test('only issued code formats can be used for referral redirects',()=>{assert.ok(validCode('DSS-ABCDEF123456'));assert.equal(validCode('//evil.test'),false);assert.equal(validCode('DSS-DEMO'),false);});
