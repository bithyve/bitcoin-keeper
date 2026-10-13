// This matrix requires the pinned paired Relay, a real native Realm binding
// and disposable loopback Mongo. Missing prerequisites are a failing check.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const relaySha = '5a42a0368223d952e1dda475859743ce30d08058';
const root = path.resolve(__dirname, '..');
const fixture = process.env.KEEPER_RELAY_FIXTURE_MODULE;
assert.equal(process.versions.node.split('.')[0], '22', 'Run the genuine automatic backup matrix with Node 22');
assert.ok(fixture, 'Set KEEPER_RELAY_FIXTURE_MODULE to the pinned Relay tests/support/automaticBackupHttpFixture.cjs');
const filename = fs.realpathSync(fixture);
const checkout = path.dirname(path.dirname(path.dirname(filename)));
assert.equal(path.relative(checkout, filename), 'tests/support/automaticBackupHttpFixture.cjs');
const revision = spawnSync('git', ['-C', checkout, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
assert.equal(revision.status, 0, 'The Relay fixture must be in a Git checkout');
assert.equal(revision.stdout.trim(), relaySha, `Use paired Relay commit ${relaySha}`);
const clean = spawnSync('git', ['-C', checkout, 'diff', '--quiet', 'HEAD'], { encoding: 'utf8' });
assert.equal(clean.status, 0, 'The pinned Relay checkout must have no tracked changes');

const mongoUrl = new URL(process.env.BACKUP_TEST_MONGO_URL || 'mongodb://127.0.0.1:27058');
assert.equal(mongoUrl.protocol, 'mongodb:');
assert.ok(['127.0.0.1', 'localhost'].includes(mongoUrl.hostname), 'The matrix only accepts loopback Mongo');
assert.equal(mongoUrl.port, '27058', 'Use the disposable keeperQA replica set on port 27058');
assert.ok(!mongoUrl.username && !mongoUrl.password, 'The disposable matrix does not accept credentials');

const Realm = require('realm');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'keeper-native-realm-prerequisite-'));
let probe;
try {
  probe = new Realm({
    path: path.join(directory, 'probe.realm'), inMemory: true,
    schema: [{ name: 'NativeProbe', primaryKey: 'id', properties: { id: 'string', value: 'int' } }],
  });
  probe.write(() => probe.create('NativeProbe', { id: 'native', value: 1 }));
  assert.equal(probe.objectForPrimaryKey('NativeProbe', 'native').value, 1);
} finally {
  probe?.close();
  Realm.shutdown();
  fs.rmSync(directory, { recursive: true, force: true });
}

const result = spawnSync(process.execPath, [
  '--test',
  'tests/recovery/automaticWriteRealmRelay.integration.cjs',
  'tests/recovery/automaticLabelProducers.integration.cjs',
], {
  cwd: root, stdio: 'inherit',
  env: { ...process.env, KEEPER_RELAY_FIXTURE_MODULE: filename, BACKUP_TEST_MONGO_URL: mongoUrl.toString() },
});
process.exit(result.status ?? 1);
