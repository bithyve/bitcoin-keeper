'use strict';
// Host-only exact producer contract controls; no native/installed acceptance.
const { test } = require('node:test'), assert = require('node:assert/strict');
const { validatePrivateIntegration } = require('../native/private_integration_receipts.cjs');
const { validateParentSoftwareEvidence } = require('../native/parent_software_evidence.cjs');
const { synthetic } = require('./fixtures/private-integration.cjs');
const { syntheticParent } = require('./fixtures/parent-software.cjs');
const scopes = { protected: 'BOUNDED_PRIVATE_NATIVE_ACCEPTANCE_TOOLING', recovery: 'BOUNDED_PRIVATE_FRESH_RECOVERY_TOOLING',
  account: 'BOUNDED_PRIVATE_NORMAL_ACCOUNT_READ_ISOLATION_TOOLING' };
for (const platform of ['IOS', 'ANDROID']) for (const [name, fixture, validate] of [
  ['C2', synthetic, validatePrivateIntegration], ['D', syntheticParent, validateParentSoftwareEvidence],
]) {
  test(`${platform}/${name} exact suite scopes survive original-byte hash and barrier validation`, () => {
    const f = fixture(platform);
    for (const [suite, scope] of Object.entries(scopes)) {
      assert.equal(f.aggregate.source_admission[suite].scope, scope);
      for (const row of f.aggregate.barriers) assert.equal(row.source_proofs[suite].scope, scope);
    }
    assert.equal(validate(f.raw, f.expected).release_authorized, false);
  });
  test(`${platform}/${name} old generic scope for recovery/account is not normalized or waived`, () => {
    const f = fixture(platform);
    f.aggregate.source_admission.recovery.scope = scopes.protected;
    f.aggregate.source_admission.account.scope = scopes.protected;
    assert.throws(() => validate(f.rebind(), f.expected), /(?:PRIVATE_INTEGRATION|PARENT_SOFTWARE)_RECEIPT_INVALID/);
  });
  for (const suite of Object.keys(scopes)) for (const wrong of [...Object.values(scopes).filter(scope => scope !== scopes[suite]),
    'BOUNDED_PRIVATE_ALL_ACCEPTANCE_TOOLING', undefined]) test(`${platform}/${name} rejects ${suite} scope ${wrong ?? 'missing'}`, () => {
    const f = fixture(platform);
    if (wrong === undefined) delete f.aggregate.source_admission[suite].scope;
    else f.aggregate.source_admission[suite].scope = wrong;
    assert.throws(() => validate(f.rebind(), f.expected), /(?:PRIVATE_INTEGRATION|PARENT_SOFTWARE)_RECEIPT_INVALID/);
  });
}
