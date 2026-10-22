'use strict';
// Fixed historical transport/format capability only. No native or release acceptance.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const BRANCH = 'refs/heads/codex/r5-public-artifact-transport-proof-20261022';
const REPOSITORY = 'KeeperCommunity/bitcoin-keeper', REPO_ID = 470904030;
const SOURCE = '1bc34890cb8618b2fffd446a63924974e0fe15b5';
const CONTROL = '3c44ab6412a8118b183273c402dd08136db05b28';
const RUN = 39858617273, ARTIFACT = 12462694619;
const ZIP_SHA = '550142809a0faf812741a586630b17d6f458b2b6c935b5bab4b00f84da67c84f';
const MEMBER_SHA = '202ff3e86b6697e30f02d233453365ffca4ee809fae5491f36d79f7ef28866e4';
const NAME = `keeper-diagnostic-native-IOS-${SOURCE}-${RUN}-1`;
const API = { owner: 'KeeperCommunity', repo: 'bitcoin-keeper', request: { timeout: 30000 } };
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const demand = (yes, code) => { if (!yes) throw new Error(code); };
const SAFE = new Set(['FIXED_ARTIFACT_CONTEXT_INVALID', 'FIXED_ARTIFACT_SOURCE_INVALID',
  'FIXED_ARTIFACT_API_INVALID', 'FIXED_ARTIFACT_RUN_INVALID', 'FIXED_ARTIFACT_IDENTITY_INVALID',
  'FIXED_ARTIFACT_ARCHIVE_INVALID', 'FIXED_ARTIFACT_MEMBER_INVALID', 'FIXED_ARTIFACT_METADATA_INVALID',
  'STRICT_ARTIFACT_JSON_INVALID', 'SOFTWARE_ARTIFACT_IDENTITY_INVALID', 'SOFTWARE_ARCHIVE_READ_FAILED',
  'SOFTWARE_ARCHIVE_API_REQUEST_INVALID',
  'SOFTWARE_ARCHIVE_TOO_LARGE', 'SOFTWARE_ARCHIVE_SIZE_MISMATCH', 'SOFTWARE_ARCHIVE_REDIRECT_REQUIRED',
  'SOFTWARE_ARCHIVE_HOST_INVALID']);

function sourceFence(expected) {
  try {
    demand(/^[a-f0-9]{40}$/.test(expected) && process.cwd() === ROOT && fs.realpathSync(ROOT) === ROOT,
      'FIXED_ARTIFACT_SOURCE_INVALID');
    const git = args => execFileSync('git', args, { cwd: ROOT, maxBuffer: 4 * 1024 * 1024 });
    // No dependency/build steps need untracked files; include ignored Python import shadows.
    demand(git(['ls-files', '--others', '-z']).length === 0, 'FIXED_ARTIFACT_SOURCE_INVALID');
    demand(git(['rev-parse', 'HEAD']).toString().trim() === expected, 'FIXED_ARTIFACT_SOURCE_INVALID');
    let count = 0;
    for (const entry of git(['ls-tree', '-r', '-z', 'HEAD']).toString('utf8').split('\0').filter(Boolean)) {
      const match = entry.match(/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/);
      demand(match, 'FIXED_ARTIFACT_SOURCE_INVALID');
      const [, mode, oid, name] = match, pieces = name.split('/');
      demand(pieces.every(part => part && part !== '.' && part !== '..' && !part.includes('\\')),
        'FIXED_ARTIFACT_SOURCE_INVALID');
      let location = ROOT;
      for (const [index, piece] of pieces.entries()) {
        location = path.join(location, piece);
        const info = fs.lstatSync(location);
        demand(!info.isSymbolicLink() && fs.realpathSync(location) === location &&
          (index === pieces.length - 1 ? info.isFile() : info.isDirectory()), 'FIXED_ARTIFACT_SOURCE_INVALID');
      }
      const bytes = fs.readFileSync(location), info = fs.lstatSync(location);
      const actual = crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
      demand(actual === oid && Boolean(info.mode & 0o100) === (mode === '100755'), 'FIXED_ARTIFACT_SOURCE_INVALID');
      count++;
    }
    demand(count > 0 && git(['rev-parse', 'HEAD']).toString().trim() === expected, 'FIXED_ARTIFACT_SOURCE_INVALID');
    return count;
  } catch { throw new Error('FIXED_ARTIFACT_SOURCE_INVALID'); }
}
function data(response) {
  demand(response?.status === 200 && response.data && !/rel="next"/.test(response.headers?.link || ''),
    'FIXED_ARTIFACT_API_INVALID');
  return response.data;
}
function identities(run, artifact) {
  const repository = value => value?.id === REPO_ID && value.full_name === REPOSITORY;
  demand(run.id === RUN && run.run_attempt === 1 && run.workflow_id === 392538840 &&
    run.head_sha === SOURCE && run.head_branch === 'codex/r5-ios-startup-diagnosis-20261022' &&
    run.event === 'pull_request' && run.path === '.github/workflows/keeper-native-diagnostic.yml' &&
    repository(run.repository) && repository(run.head_repository) && ['in_progress', 'completed'].includes(run.status) &&
    Array.isArray(run.referenced_workflows) && run.referenced_workflows.length === 1 &&
    run.referenced_workflows[0].path === `${REPOSITORY}/.github/workflows/keeper-native-platform.yml@${CONTROL}` &&
    run.referenced_workflows[0].sha === CONTROL && run.referenced_workflows[0].ref === 'refs/pull/7116/merge',
  'FIXED_ARTIFACT_RUN_INVALID');
  demand(artifact.id === ARTIFACT && artifact.name === NAME && artifact.expired === false &&
    artifact.size_in_bytes === 6884 && artifact.digest === `sha256:${ZIP_SHA}` &&
    Date.parse(artifact.expires_at) > Date.now() && artifact.workflow_run?.id === RUN &&
    artifact.workflow_run.head_sha === SOURCE && artifact.workflow_run.repository_id === REPO_ID &&
    artifact.workflow_run.head_repository_id === REPO_ID &&
    artifact.workflow_run.head_branch === 'codex/r5-ios-startup-diagnosis-20261022', 'FIXED_ARTIFACT_IDENTITY_INVALID');
}
async function run({ github, context, fetchImpl = fetch }) {
  try {
    demand(context?.eventName === 'push' && context.ref === BRANCH && context.repo?.owner === 'KeeperCommunity' &&
      context.repo.repo === 'bitcoin-keeper' && context.sha === process.env.GITHUB_WORKFLOW_SHA,
    'FIXED_ARTIFACT_CONTEXT_INVALID');
    const tracked = sourceFence(context.sha);
    // No repository module or artifact parser is loaded before the raw source fence.
    const { readPublicArtifactBytes } = require('../native/actions_software_evidence.cjs');
    const { parseStrictJson } = require('../native/strict_json.cjs');
    const current = async () => {
      const [r, a] = await Promise.all([
        github.rest.actions.getWorkflowRun({ ...API, run_id: RUN }),
        github.rest.actions.getArtifact({ ...API, artifact_id: ARTIFACT }),
      ]);
      identities(data(r), data(a));
    };
    await current();
    const archive = await readPublicArtifactBytes(github, ARTIFACT, { fetchImpl });
    demand(Buffer.isBuffer(archive) && archive.length === 6884 && sha256(archive) === ZIP_SHA,
      'FIXED_ARTIFACT_ARCHIVE_INVALID');
    const envelope = execFileSync('python3', ['-B', path.join(ROOT, '.github/native/software_artifact_zip.py'), 'IOS'], {
      input: archive, timeout: 10000, maxBuffer: 1048576, stdio: ['pipe', 'pipe', 'pipe'],
      env: { PATH: process.env.PATH, PYTHONDONTWRITEBYTECODE: '1', PYTHONNOUSERSITE: '1' },
    });
    const members = JSON.parse(envelope), encoded = members['ios/metadata.json'];
    demand(Object.keys(members).length === 1 && typeof encoded === 'string', 'FIXED_ARTIFACT_MEMBER_INVALID');
    const bytes = Buffer.from(encoded, 'base64');
    demand(bytes.length === 29150 && bytes.toString('base64') === encoded && sha256(bytes) === MEMBER_SHA,
      'FIXED_ARTIFACT_MEMBER_INVALID');
    const metadata = parseStrictJson(bytes);
    demand(metadata.schema === 1 && metadata.source_sha === SOURCE && metadata.workflow_sha === CONTROL &&
      metadata.workflow_ref === `${REPOSITORY}/.github/workflows/keeper-native-diagnostic.yml@refs/pull/7116/merge` &&
      metadata.run_id === String(RUN) && metadata.run_attempt === '1' && metadata.platform === 'IOS' &&
      metadata.diagnostic_only === true && metadata.app_id === 'io.hexawallet.hexakeeper.dev' &&
      metadata.smoke === 'FAIL' && metadata.native_probe === 'NOT RUN', 'FIXED_ARTIFACT_METADATA_INVALID');
    await current();
    demand(sourceFence(context.sha) === tracked, 'FIXED_ARTIFACT_SOURCE_INVALID');
    return Object.freeze({ schema: 1, probe_source_sha: context.sha, target_source_sha: SOURCE,
      target_run_id: RUN, target_attempt: 1, artifact_id: ARTIFACT, archive_bytes: 6884, archive_sha256: ZIP_SHA,
      member_count: 1, member_bytes: 29150, member_sha256: MEMBER_SHA, source_fences: 2, tracked_files: tracked,
      manual_redirect_stream: 'PASS', zip_format: 'PASS', strict_json: 'PASS', original_smoke: 'FAIL',
      original_native_probe: 'NOT RUN', retained_raw_files: 0, native_acceptance: false, installed_trust: false,
      release_ready: false, authorization_eligible: false, release_authorized: false, execution_allowed: false });
  } catch (error) {
    throw new Error(SAFE.has(error?.message) ? error.message : 'FIXED_ARTIFACT_TRANSPORT_PROBE_FAILED');
  }
}
module.exports = { run, sourceFence };
