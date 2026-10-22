'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { collectTrustedOrigin, isTrustedOrigin, CASES, EXECUTED, PIN } = require('./trusted-release-origin.cjs');
const REPOSITORY = 'KeeperCommunity/bitcoin-keeper';
const source = 'a'.repeat(40);
const tree = 'b'.repeat(40);
const now = Date.parse('2026-10-22T12:00:00Z');
const request = { repository: REPOSITORY, sourceSha: source, driverSha: source };
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const names = ['Tests', 'Analyze JavaScript/TypeScript', 'ios / Canonical IOS build and features', 'android / Canonical ANDROID build and features', 'Canonical native attestation'];

function zip(name, bytes, { deflate = false, descriptor = false } = {}) {
  const filename = Buffer.from(name);
  const content = deflate ? zlib.deflateRawSync(bytes) : bytes;
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50);
  local.writeUInt16LE(descriptor ? 8 : 0, 6);
  local.writeUInt16LE(deflate ? 8 : 0, 8);
  if (!descriptor) {
    local.writeUInt32LE(content.length, 18);
    local.writeUInt32LE(bytes.length, 22);
  }
  local.writeUInt16LE(filename.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50);
  central.writeUInt16LE(descriptor ? 8 : 0, 8);
  central.writeUInt16LE(deflate ? 8 : 0, 10);
  central.writeUInt32LE(content.length, 20);
  central.writeUInt32LE(bytes.length, 24);
  central.writeUInt16LE(filename.length, 28);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + filename.length, 12);
  const trailer = descriptor ? Buffer.alloc(16) : Buffer.alloc(0);
  if (descriptor) {
    trailer.writeUInt32LE(0x08074b50);
    trailer.writeUInt32LE(content.length, 8);
    trailer.writeUInt32LE(bytes.length, 12);
  }
  end.writeUInt32LE(local.length + filename.length + content.length + trailer.length, 16);
  return Buffer.concat([local, filename, content, trailer, central, filename, end]);
}

function fixture() {
  const repository = { id: 470904030, full_name: REPOSITORY, default_branch: 'sprint' };
  const endpoints = new Map();
  const archives = new Map();
  const reads = new Map();
  endpoints.set('', repository);
  endpoints.set('branches/sprint', { protected: true, commit: { sha: source } });
  endpoints.set(`actions/variables/${PIN}`, { name: PIN, value: source });
  endpoints.set(`git/commits/${source}`, { sha: source, tree: { sha: tree } });
  endpoints.set(`commits/${source}/check-runs?per_page=100`, { total_count: 1, check_runs: [{ id: 555, name: 'CodeQL', head_sha: source,
    status: 'completed', conclusion: 'success', app: { id: 57789, slug: 'github-advanced-security' } }] });
  const sourceNames = {
    'src/utils/utilities.ts': ['getAccountFromSigner', 'getKeyUID'], 'src/store/sagas/storage.ts': ['setupKeeperAppWorker'],
    'src/store/sagas/wallets.ts': ['currentWalletAccountId', 'assertWalletAccount', 'deleteSigningDeviceWorker'],
    'src/store/sagas/bhr.ts': ['currentBackupAppId', 'deleteAppImageEntityWorker'],
    'src/services/backup/transport.ts': ['observeBackupAccount', 'currentBackupAccountSession', 'clearVerifiedRemoteRevision'],
  };
  const sourceFunctions = Object.entries(sourceNames).map(([path, names]) => {
    const bytes = Buffer.from(`committed fake fixture bytes:${path}`);
    endpoints.set(`contents/${path}?ref=${source}`, { path, size: bytes.length, content: bytes.toString('base64'), encoding: 'base64' });
    return { path, names, sha256: sha256(bytes) };
  });
  const files = ['test.yml', 'codeql.yml', 'keeper-canonical-native.yml'];
  const runs = files.map((file, index) => ({ id: (index + 1) * 100, workflow_id: index + 1, path: `.github/workflows/${file}`,
    event: index < 2 ? 'push' : 'workflow_dispatch', head_branch: 'sprint', head_sha: source,
    run_attempt: 1, check_suite_id: index + 1000, status: 'completed', conclusion: 'success',
    repository, head_repository: repository, updated_at: '2026-10-22T11:00:00Z' }));
  files.forEach((file, index) => {
    const run = runs[index];
    endpoints.set(`actions/workflows/${file}`, { id: index + 1, path: `.github/workflows/${file}`, state: 'active' });
    endpoints.set(`actions/workflows/${index + 1}/runs?branch=sprint&event=${run.event}&head_sha=${source}&per_page=100`, { total_count: 1, workflow_runs: [run] });
    endpoints.set(`actions/runs/${run.id}`, run);
    const jobNames = index < 2 ? [names[index]] : names.slice(2);
    const jobs = jobNames.map((name, jobIndex) => {
      const checkId = run.id + jobIndex + 500;
      const requiredSteps = index === 0 ? ['Run tests', 'Run recovery regression tests', 'Verify checked-out release version consistency', 'Run release and packaged-artifact tests'] :
        index === 1 ? ['Initialize CodeQL', 'Analyze'] : name === 'Canonical native attestation' ? ['Verify canonical receipts and required matrix'] : [];
      endpoints.set(`check-runs/${checkId}`, { id: checkId, name, check_suite: { id: run.check_suite_id }, head_sha: source,
        status: 'completed', conclusion: 'success', app: { id: 15368, slug: 'github-actions' } });
      return { id: checkId + 2000, name, run_id: run.id, run_attempt: 1, head_sha: source, status: 'completed', conclusion: 'success',
        check_run_url: `https://api.github.com/repos/${REPOSITORY}/check-runs/${checkId}`,
        steps: requiredSteps.map(step => ({ name: step, status: 'completed', conclusion: 'success' })) };
    });
    endpoints.set(`actions/runs/${run.id}/attempts/1/jobs?per_page=100`, { total_count: jobs.length, jobs });
  });
  const artifacts = [];
  const receipts = {};
  const payload = { schema: 1, kind: 'keeper-canonical-native', repository: REPOSITORY, source_sha: source, source_tree: tree,
    workflow_sha: source, workflow_path: '.github/workflows/keeper-canonical-native.yml', run_id: 300, run_attempt: 1,
    selected_route: 'canonical-hosted-native', feature_matrix_complete: true, platforms: {} };
  function addArtifact(artifactId, name, filename, value) {
    const old = artifacts.findIndex(info => info.id === artifactId);
    if (old !== -1) artifacts.splice(old, 1);
    const bytes = Buffer.from(JSON.stringify(value));
    const archive = zip(filename, bytes);
    const info = { id: artifactId, name, digest: `sha256:${sha256(archive)}`, size_in_bytes: archive.length,
      expired: false, expires_at: '2026-10-23T00:00:00Z', workflow_run: { id: 300, head_sha: source } };
    endpoints.set(`actions/artifacts/${artifactId}`, info);
    artifacts.push(info);
    archives.set(artifactId, archive);
    return bytes;
  }
  for (const [index, platform] of ['IOS', 'ANDROID'].entries()) {
    const installed = platform === 'IOS' ? { method: 'FULL_SIMULATOR_BUNDLE_TREE_AND_EXECUTABLE_SHA256',
      inventory_sha256: 'd'.repeat(64), executable_sha256: 'e'.repeat(64) } :
      { method: 'SINGLE_INSTALLED_BASE_APK_SHA256', sha256: 'f'.repeat(64) };
    receipts[platform] = { schema: 1, platform, source_sha: source, workflow_sha: source, run_id: '300', run_attempt: '1',
      workflow_ref: `${REPOSITORY}/.github/workflows/keeper-canonical-native.yml@refs/heads/sprint`, diagnostic_only: false,
      app_id: platform === 'IOS' ? 'io.hexawallet.hexakeeper.dev' : 'io.hexawallet.keeper.development',
      build: 'PASS', smoke: 'PASS', native_probe: 'PASS', r5_features: 'PASS',
      installed_artifact_verified: true, installed_artifact: { ...installed },
      built_artifact: platform === 'IOS' ? { executable_sha256: installed.executable_sha256 } : { sha256: installed.sha256 },
      r5_feature_evidence: { schema: 1, scope: 'production-worker-native-storage', status: 'PASS',
        scenarios: ['production-setup-offline-retry-native-counts', 'production-deletion-retained-native-references', 'production-deletion-native-rollback',
          'production-worker-stale-session-rejection', 'native-worker-process-relaunch-counts'].map(id => ({ id, status: 'PASS' })),
        limits: ['controlled-transport-no-backend-acceptance', 'synthetic-wallet-generation-no-crypto-acceptance', 'injected-dispatch-selection-no-login-acceptance',
          'no-product-ui-navigation-pin-or-biometric-acceptance', 'probe-and-worker-timings-not-product-startup-ux'],
        source_functions: sourceFunctions.map(row => ({ path: row.path, sha256: row.sha256, names: row.names })),
        measurements: Array.from({ length: 5 }, (_, index) => ({ iteration: index + 1, probe_ready_ms: 1, setup_first_wallet_ms: 2 })) },
      product_ui: { status: 'PASS', requested_samples: 5,
        samples: Array.from({ length: 5 }, (_, index) => ({ sample: index + 1, status: 'PASS', create_new_app_calls: 1,
          visible_wallet_count_before_relaunch: 1, visible_wallet_count_after_relaunch: 1, installed_version_header_and_initial_history: 'PASS',
          key_management_entry_and_exit: 'PASS', installed_artifact_verified: true, installed_artifact: { ...installed },
          raw_durations: { startup_to_passcode_ms: 1, start_new_to_ready_ms: 2, start_new_to_home_ms: 3,
            cold_relaunch_to_login_ms: 4, cold_relaunch_to_authenticated_home_ms: 5 } })),
        controlled_disconnect_retry: { status: 'PASS', scenario: 'CONTROLLED_DISCONNECT_BEFORE_COMMIT_NOT_WAN_OFFLINE', performance_sample: false,
          create_new_app_calls: 2, transport_requests_dropped_without_commit: 1, acknowledged_create_responses: 1, unexpected_create_attempts: 0,
          visible_wallet_count_after_relaunch: 1, installed_artifact_verified: true, installed_artifact: { ...installed } },
        key_management_ui: { status: 'PASS', entrypoint: 'index.js', network: 'TESTNET', scenario: 'UNUSED_MOBILE_KEY_UI_DELETE_AND_NATIVE_PIN',
          new_account_requests_during_key_flow: 0, visible_eligible_keys_after_deletion: 0, unrelated_visible_wallet_count_after_relaunch: 1,
          installed_artifact_verified: true, installed_artifact: { ...installed } } } };
    const bytes = addArtifact(index + 1, `keeper-canonical-native-${platform}-${source}-300-1`, 'metadata.json', receipts[platform]);
    payload.platforms[platform] = { conclusion: 'success', receipt_sha256: sha256(bytes), artifact_id: index + 1,
      cases: CASES.map(id => ({ id, status: 'PASS' })), executed_checks: Object.fromEntries(Object.entries(EXECUTED).map(([id, scope]) => [id, { status: 'PASS', scope }])) };
  }
  function refreshReceipt(platform) {
    const artifactId = platform === 'IOS' ? 1 : 2;
    const bytes = addArtifact(artifactId, `keeper-canonical-native-${platform}-${source}-300-1`, 'metadata.json', receipts[platform]);
    payload.platforms[platform].receipt_sha256 = sha256(bytes);
  }
  function refreshAttestation() {
    addArtifact(3, `keeper-canonical-native-attestation-${source}-300-1`, 'keeper-canonical-native-attestation.json', payload);
  }
  refreshAttestation();
  endpoints.set('actions/runs/300/artifacts?per_page=100', { total_count: artifacts.length, artifacts });
  async function fetchMock(url, options) {
    const target = String(url);
    if (target.startsWith('https://storage.blob.core.windows.net/')) {
      assert.equal(options.headers, undefined, 'never forward API token to storage');
      return new Response(archives.get(Number(target.split('/').pop())), { status: 200 });
    }
    assert.equal(options.headers.Authorization, 'Bearer disposable-test-token');
    const base = `https://api.github.com/repos/${REPOSITORY}`;
    assert.ok(target === base || target.startsWith(base + '/'));
    const endpoint = target === base ? '' : target.slice((base + '/').length);
    const archive = endpoint.match(/^actions\/artifacts\/(\d+)\/zip$/);
    if (archive) return new Response(null, { status: 302, headers: { location: `https://storage.blob.core.windows.net/${archive[1]}` } });
    reads.set(endpoint, (reads.get(endpoint) || 0) + 1);
    assert.ok(endpoints.has(endpoint), `unexpected API request ${endpoint}`);
    let value = endpoints.get(endpoint);
    if (typeof value === 'function') value = value(reads.get(endpoint));
    return new Response(JSON.stringify(value), { status: 200 });
  }
  return { endpoints, archives, payload, receipts, runs, artifacts, reads, fetchMock, refreshAttestation, refreshReceipt };
}

async function withFixture(action) {
  const fixtureValue = fixture();
  const original = global.fetch;
  global.fetch = fixtureValue.fetchMock;
  try { return await action(fixtureValue); } finally { global.fetch = original; }
}

test('mocked installed producer/API artifact chain creates opaque read-only proof; JSON copy cannot mint it', async () => {
  await withFixture(async () => {
    const proof = await collectTrustedOrigin(request, 'disposable-test-token', now);
    assert.equal(isTrustedOrigin(proof), true);
    assert.equal(isTrustedOrigin(JSON.parse(JSON.stringify(proof))), false);
    assert.equal(proof.execution_allowed, false);
    assert.equal(proof.release_authorized, false);
    assert.equal(proof.authorization_eligible, false);
    assert.equal(proof.security_analysis_run_linkage_verified, false);
    assert.equal(proof.producer_runs.length, 3);
    assert.equal(Object.isFrozen(proof.producer_runs[0]), true);
  });
});

for (const [name, mutate] of [
  ['protected driver moved', f => f.endpoints.get('branches/sprint').commit.sha = 'c'.repeat(40)],
  ['unprotected driver', f => f.endpoints.get('branches/sprint').protected = false],
  ['uninstalled driver pin', f => f.endpoints.get(`actions/variables/${PIN}`).value = 'c'.repeat(40)],
  ['foreign repository identity', f => f.endpoints.get('').full_name = 'untrusted/repo'],
  ['wrong source tree', f => f.payload.source_tree = 'c'.repeat(40)],
  ['workflow path collision', f => f.endpoints.get('actions/workflows/test.yml').path = '.github/workflows/other.yml'],
  ['disabled producer', f => f.endpoints.get('actions/workflows/test.yml').state = 'disabled_manually'],
  ['arbitrary successful check name', f => f.endpoints.get('actions/runs/100/attempts/1/jobs?per_page=100').jobs[0].name = 'Unrelated'],
  ['forged check app', f => f.endpoints.get('check-runs/600').app.id = 99],
  ['wrong check suite', f => f.endpoints.get('check-runs/600').check_suite.id = 2000],
  ['foreign job check URL', f => f.endpoints.get('actions/runs/100/attempts/1/jobs?per_page=100').jobs[0].check_run_url = 'https://api.github.com/repos/evil/repo/check-runs/600'],
  ['missing real test step', f => f.endpoints.get('actions/runs/100/attempts/1/jobs?per_page=100').jobs[0].steps.pop()],
  ['skipped real test step', f => f.endpoints.get('actions/runs/100/attempts/1/jobs?per_page=100').jobs[0].steps[0].conclusion = 'skipped'],
  ['PR producer event', f => f.runs[2].event = 'pull_request'],
  ['stale producer', f => f.runs[0].updated_at = '2026-10-20T11:00:00Z'],
  ['source mismatch', f => f.runs[0].head_sha = 'c'.repeat(40)],
  ['pending current attempt', f => f.runs[0].status = 'in_progress'],
  ['cancelled producer', f => f.runs[0].conclusion = 'cancelled'],
  ['old attempt job', f => f.endpoints.get('actions/runs/100/attempts/1/jobs?per_page=100').jobs[0].run_attempt = 2],
  ['incomplete producer pagination', f => f.endpoints.get(`actions/workflows/1/runs?branch=sprint&event=push&head_sha=${source}&per_page=100`).total_count = 101],
  ['incomplete job pagination', f => f.endpoints.get('actions/runs/100/attempts/1/jobs?per_page=100').total_count = 101],
  ['partial native matrix', f => f.payload.feature_matrix_complete = false],
  ['native matrix false credit', f => f.payload.platforms.IOS.cases[2].status = 'NOT IMPLEMENTED'],
  ['missing native case', f => f.payload.platforms.ANDROID.cases.pop()],
  ['duplicate native case', f => f.payload.platforms.IOS.cases[1] = f.payload.platforms.IOS.cases[0]],
  ['boolean run attempt', f => f.payload.run_attempt = true],
  ['arbitrary attestation field', f => f.payload.execution_allowed = true],
  ['old attempt attestation', f => f.payload.run_attempt = 2],
  ['missing executed native checks', f => delete f.payload.platforms.IOS.executed_checks],
  ['partial executed native checks', f => f.payload.platforms.IOS.executed_checks.startup.status = 'NOT VERIFIED'],
  ['expanded executed native scope', f => f.payload.platforms.IOS.executed_checks['production-worker-controls'].scope = 'full app acceptance'],
  ['failed official CodeQL security result', f => f.endpoints.get(`commits/${source}/check-runs?per_page=100`).check_runs[0].conclusion = 'failure'],
  ['forged official CodeQL app', f => f.endpoints.get(`commits/${source}/check-runs?per_page=100`).check_runs[0].app.id = 15368],
  ['expired artifact', f => f.endpoints.get('actions/artifacts/1').expired = true],
  ['artifact source mismatch', f => f.endpoints.get('actions/artifacts/1').workflow_run.head_sha = 'c'.repeat(40)],
  ['artifact run mismatch', f => f.endpoints.get('actions/artifacts/1').workflow_run.id = 99],
  ['missing artifact API digest', f => delete f.endpoints.get('actions/artifacts/1').digest],
  ['receipt digest mismatch', f => f.payload.platforms.IOS.receipt_sha256 = 'c'.repeat(64)],
  ['raw artifact digest mismatch', f => f.archives.get(1)[0] ^= 1],
  ['wrong ZIP filename', f => {
    const zipped = zip('../metadata.json', Buffer.from('{}'));
    f.archives.set(1, zipped);
    Object.assign(f.endpoints.get('actions/artifacts/1'), { digest: `sha256:${sha256(zipped)}`, size_in_bytes: zipped.length });
  }],
]) test(`rejects provenance forgery or incomplete evidence: ${name}`, async () => {
  await withFixture(async f => {
    mutate(f);
    f.refreshAttestation();
    await assert.rejects(collectTrustedOrigin(request, 'disposable-test-token', now));
  });
});

test('a newer failed run prevents fallback to an older passing run', async () => {
  await withFixture(async f => {
    const failed = { ...f.runs[0], id: 101, conclusion: 'failure' };
    f.endpoints.set('actions/runs/101', failed);
    f.endpoints.set(`actions/workflows/1/runs?branch=sprint&event=push&head_sha=${source}&per_page=100`, { total_count: 2, workflow_runs: [f.runs[0], failed] });
    await assert.rejects(collectTrustedOrigin(request, 'disposable-test-token', now), /PRODUCER_NOT_EXACT_CURRENT_SUCCESS/);
  });
});

test('same-source driver pin change during collection revokes proof', async () => {
  await withFixture(async f => {
    f.endpoints.set(`actions/variables/${PIN}`, count => ({ name: PIN, value: count === 1 ? source : 'c'.repeat(40) }));
    await assert.rejects(collectTrustedOrigin(request, 'disposable-test-token', now), /INSTALLED_CANONICAL_DRIVER_NOT_CURRENT/);
  });
});

test('same-source producer rerun during collection revokes old attempt', async () => {
  await withFixture(async f => {
    const original = f.runs[0];
    f.endpoints.set('actions/runs/100', count => count === 1 ? original : { ...original, run_attempt: 2, status: 'queued', conclusion: null });
    await assert.rejects(collectTrustedOrigin(request, 'disposable-test-token', now), /PRODUCER_NOT_EXACT_CURRENT_SUCCESS/);
  });
});

test('same-run artifact change during final read revokes proof', async () => {
  await withFixture(async f => {
    const original = f.endpoints.get('actions/artifacts/1');
    f.endpoints.set('actions/artifacts/1', count => count === 1 ? original : { ...original, digest: 'sha256:' + 'c'.repeat(64) });
    await assert.rejects(collectTrustedOrigin(request, 'disposable-test-token', now), /ARTIFACT_CHANGED_DURING_COLLECTION/);
  });
});

test('bounded deflated streaming ZIP descriptor is accepted without extraction to disk', async () => {
  await withFixture(async f => {
    const zipped = zip('metadata.json', Buffer.from(JSON.stringify(f.receipts.IOS)), { deflate: true, descriptor: true });
    f.archives.set(1, zipped);
    Object.assign(f.endpoints.get('actions/artifacts/1'), { digest: `sha256:${sha256(zipped)}`, size_in_bytes: zipped.length });
    assert.equal(isTrustedOrigin(await collectTrustedOrigin(request, 'disposable-test-token', now)), true);
  });
});

for (const [name, mutate] of [
  ['failed product UI', value => value.product_ui.status = 'FAIL'],
  ['failed R5 worker checks', value => value.r5_features = 'FAIL'],
  ['old receipt attempt', value => value.run_attempt = '2'],
  ['different receipt source', value => value.source_sha = 'c'.repeat(40)],
  ['different installed receipt driver', value => value.workflow_sha = 'c'.repeat(40)],
]) test(`rejects validly hashed but incomplete original receipt: ${name}`, async () => {
  await withFixture(async f => {
    mutate(f.receipts.IOS);
    f.refreshReceipt('IOS');
    f.refreshAttestation();
    await assert.rejects(collectTrustedOrigin(request, 'disposable-test-token', now), /PLATFORM_RECEIPT_NOT_EXACT_SUCCESS/);
  });
});

for (const [name, code, mutate] of [
  ['diagnostic receipt', 'PLATFORM_RECEIPT_NOT_EXACT_SUCCESS', value => value.diagnostic_only = true],
  ['foreign installed app', 'PLATFORM_RECEIPT_NOT_EXACT_SUCCESS', value => value.app_id = 'other.app'],
  ['missing five raw samples', 'PRODUCT_OBSERVATIONS_INCOMPLETE', value => value.product_ui.samples.pop()],
  ['boolean raw timing', 'PRODUCT_OBSERVATIONS_INCOMPLETE', value => value.product_ui.samples[0].raw_durations.startup_to_passcode_ms = true],
  ['missing version history', 'PRODUCT_OBSERVATIONS_INCOMPLETE', value => value.product_ui.samples[0].installed_version_header_and_initial_history = 'NOT RUN'],
  ['missing key entry UI', 'PRODUCT_OBSERVATIONS_INCOMPLETE', value => value.product_ui.samples[0].key_management_entry_and_exit = 'NOT RUN'],
  ['unexpected retry', 'PRODUCT_RETRY_INCOMPLETE', value => value.product_ui.controlled_disconnect_retry.unexpected_create_attempts = 1],
  ['missing PIN deletion UI', 'PRODUCT_KEY_UI_INCOMPLETE', value => delete value.product_ui.key_management_ui],
  ['missing native worker scenario', 'WORKER_FEATURE_EVIDENCE_INCOMPLETE', value => value.r5_feature_evidence.scenarios.pop()],
  ['worker hash inconsistent with committed source', 'WORKER_FEATURE_EVIDENCE_INCOMPLETE', value => value.r5_feature_evidence.source_functions[0].sha256 = 'c'.repeat(64)],
  ['missing worker timing', 'WORKER_MEASUREMENTS_INCOMPLETE', value => value.r5_feature_evidence.measurements.pop()],
  ['boolean helper timing', 'WORKER_MEASUREMENTS_INCOMPLETE', value => value.r5_feature_evidence.measurements[0].probe_ready_ms = true],
]) test(`rejects independently hashed receipt without real observations: ${name}`, async () => {
  await withFixture(async f => {
    mutate(f.receipts.IOS);
    f.refreshReceipt('IOS');
    f.refreshAttestation();
    await assert.rejects(collectTrustedOrigin(request, 'disposable-test-token', now), new RegExp(code));
  });
});

test('archive additional-entry count fails despite correct API digest', async () => {
  await withFixture(async f => {
    const zipped = f.archives.get(1);
    zipped.writeUInt16LE(2, zipped.length - 22 + 10);
    f.endpoints.get('actions/artifacts/1').digest = `sha256:${sha256(zipped)}`;
    await assert.rejects(collectTrustedOrigin(request, 'disposable-test-token', now), /ARTIFACT_ZIP_INVALID/);
  });
});

for (const platform of ['IOS', 'ANDROID']) {
  const rows = [['root', value => value],
    ...Array.from({ length: 5 }, (_, index) => [`sample ${index + 1}`, value => value.product_ui.samples[index]]),
    ['Retry', value => value.product_ui.controlled_disconnect_retry],
    ['key/PIN', value => value.product_ui.key_management_ui]];
  for (const [rowName, select] of rows) {
    for (const [name, mutate] of [
      ['missing proof', row => delete row.installed_artifact],
      ['unverified bytes', row => row.installed_artifact_verified = false],
      ['truthy verification', row => row.installed_artifact_verified = 'true'],
      ['wrong method', row => row.installed_artifact.method = 'INSTALL_COMMAND_SUCCEEDED'],
      ['unexpected proof field', row => row.installed_artifact.normalized = true],
      ['malformed hash', row => row.installed_artifact[platform === 'IOS' ? 'inventory_sha256' : 'sha256'] = 'invalid'],
      ...(rowName === 'root' ? [] : [['different installed bytes', row =>
        row.installed_artifact[platform === 'IOS' ? 'inventory_sha256' : 'sha256'] = '1'.repeat(64)]]),
    ]) test(`${platform} ${rowName} rejects ${name} despite valid original artifact hashes`, async () => {
      await withFixture(async f => {
        mutate(select(f.receipts[platform]));
        f.refreshReceipt(platform);
        f.refreshAttestation();
        await assert.rejects(collectTrustedOrigin(request, 'disposable-test-token', now), /INSTALLED_BYTE_PROOF_INCOMPLETE/);
      });
    });
  }
  for (const [name, mutate] of [
    ['missing build hash', value => delete value.built_artifact],
    ['different build bytes', value => value.built_artifact[platform === 'IOS' ? 'executable_sha256' : 'sha256'] = '1'.repeat(64)],
  ]) test(`${platform} rejects ${name} despite all matching installed receipts`, async () => {
    await withFixture(async f => {
      mutate(f.receipts[platform]);
      f.refreshReceipt(platform);
      f.refreshAttestation();
      await assert.rejects(collectTrustedOrigin(request, 'disposable-test-token', now), /INSTALLED_BYTES_NOT_BOUND_TO_BUILD/);
    });
  });
}

test('artifact redirect never sends API token to untrusted host', async () => {
  await withFixture(async f => {
    global.fetch = async (url, options) => String(url).endsWith('/artifacts/3/zip') ?
      new Response(null, { status: 302, headers: { location: 'https://attacker.invalid/object' } }) : f.fetchMock(url, options);
    await assert.rejects(collectTrustedOrigin(request, 'disposable-test-token', now), /UNTRUSTED_ARTIFACT_HOST/);
  });
});

test('forged serializable booleans cannot mint module-private proof', () => {
  assert.equal(isTrustedOrigin({ trusted: true, originVerified: true, execution_allowed: true }), false);
  assert.equal(isTrustedOrigin(null), false);
});

test('canonical source equality required before any API access', async () => {
  await assert.rejects(collectTrustedOrigin({ ...request, driverSha: 'c'.repeat(40) }, 'disposable-test-token', now), /CANONICAL_SOURCE_REQUIRED/);
});

test('unexpected network or parser details never escape as evidence errors', async () => {
  const original = global.fetch;
  global.fetch = async () => { throw new Error('signed-storage-url-or-private-payload'); };
  try {
    await assert.rejects(collectTrustedOrigin(request, 'disposable-test-token', now), /^Error: PROVENANCE_READ_INVALID$/);
  } finally { global.fetch = original; }
});
