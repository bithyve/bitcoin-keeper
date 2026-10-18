const assert = require('node:assert/strict');
const { test } = require('node:test');
const { runIap, failureCode } = require('./prerequisite_iap.cjs');
test('requires two awaited native init/end cycles', async () => {
  const calls = [];
  const api = { initConnection: async () => { calls.push('init'); return true; },
    endConnection: async () => { calls.push('end'); return true; } };
  assert.equal(await runIap(api), 'pass');
  assert.deepEqual(calls, ['init', 'end', 'init', 'end']);
});
test('false initialization, false close and late reinit failure block', async () => {
  await assert.rejects(runIap({initConnection: async () => false, endConnection: async () => true}), {code:'IAP_INIT_FALSE'});
  await assert.rejects(runIap({initConnection: async () => true, endConnection: async () => false}), {code:'IAP_END_FALSE'});
  let count = 0;
  await assert.rejects(runIap({initConnection: async () => ++count === 1, endConnection: async () => true}), {code:'IAP_INIT_FALSE'});
});
test('store unavailable is blocking and private error messages never escape', async () => {
  const marker = 'PRIVATE_SYNTHETIC_PATH_RECOVERY_TEXT';
  for (const [code, expected] of [['iap-not-available','IAP_STORE_UNAVAILABLE'], [marker,'IAP_NATIVE_FAILURE']]) {
    let ended = false;
    try {
      await runIap({initConnection: async () => { throw Object.assign(new Error(marker), {code}); },
        endConnection: async () => { ended = true; return true; }});
      assert.fail('must reject');
    } catch (error) {
      assert.equal(error.code, expected);
      assert.equal(error.message.includes(marker), false);
      assert.equal(ended, true);
    }
  }
  assert.equal(failureCode({code:'IAP_STORE_UNAVAILABLE', message:marker}), 'IAP_NATIVE_FAILURE');
});
test('missing methods and unresolved native promises block', async () => {
  await assert.rejects(runIap({}), {code:'IAP_API_MISSING'});
  await assert.rejects(runIap({initConnection: () => new Promise(() => {}), endConnection: async () => true}, 5), {code:'IAP_TIMEOUT'});
});
