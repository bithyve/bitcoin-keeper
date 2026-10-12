import RestClient from '../rest/RestClient';

// One queue per account covers repair, incremental writes, labels and deletion.
const queues = new Map<string, Promise<unknown>>();
const revisions = new Map<string, number>();
const queuedMutationRevisions = new Map<string, number>();
const revisionedOperations = new Set([
  'updateAppImage',
  'migrateXfps',
  'deleteAppImageEntity',
  'deleteVaults',
  'updateVaultImage',
  'modifyLabels',
  'deleteBackup',
]);
let activeAccount: string | undefined;
let accountSession = 0;
let mayUploadForAccount: (appId: string, explicitChoice: boolean) => boolean = () => false;
let onBackupReconciliationRequired: (appId: string) => void = () => undefined;
export const setBackupUploadGuard = (guard: (appId: string, explicitChoice: boolean) => boolean) => {
  mayUploadForAccount = guard;
};
// A failed or ambiguous write requires a fresh backup check. The encrypted
// payload must never be retried without re-reading local state.
export const setBackupReconciliationHandler = (handler: (appId: string) => void) => {
  onBackupReconciliationRequired = handler;
};
export const canAccessBackupAccount = (appId: string, explicitChoice = false) =>
  mayUploadForAccount(appId, explicitChoice);
// An A -> B -> A switch must invalidate work captured during the first A session.
// The Redux store observes every selected-account transition, including resets.
export function observeBackupAccount(appId?: string) {
  if (appId !== activeAccount) {
    activeAccount = appId;
    accountSession += 1;
  }
}
export const currentBackupAccountSession = () => accountSession;
export const backupRevision = (id: string) => revisions.get(id) || 0;
export const backupQueuedRevision = (id: string) => queuedMutationRevisions.get(id) || 0;
export const markBackupMutation = (id: string) => revisions.set(id, backupRevision(id) + 1);
export const BACKUP_STALL_MS = 30_000;
export const BACKUP_DEADLINE_MS = 10 * 60_000;

export type BackupRequestFailure =
  'conflict' | 'protocol' | 'http-4xx' | 'http-5xx' | 'timeout' | 'network' | 'other';

export class BackupRequestError extends Error {
  constructor(public readonly category: BackupRequestFailure) {
    super('Backup request could not be completed');
  }
}

function requestFailureCategory(error: unknown, aborted: boolean): BackupRequestFailure {
  if (aborted) return 'timeout';
  if (!error || typeof error !== 'object') return 'other';
  const failure = error as { response?: { status?: unknown }; status?: unknown; code?: unknown; name?: unknown; message?: unknown };
  const status = failure.response?.status ?? failure.status;
  if (typeof status === 'number') {
    if (status === 409) return 'conflict';
    if (status >= 400 && status < 500) return 'http-4xx';
    if (status >= 500 && status < 600) return 'http-5xx';
    return 'other';
  }
  if (failure.code === 'ECONNABORTED' || failure.code === 'ETIMEDOUT' || failure.name === 'AbortError')
    return 'timeout';
  if (failure.code === 'ERR_NETWORK' || failure.message === 'Network Error') return 'network';
  return 'other';
}

export function withBackupSession<T>(id: string, work: () => Promise<T>): Promise<T> {
  const previous = queues.get(id) || Promise.resolve();
  const result = previous.catch(() => undefined).then(work);
  queues.set(id, result);
  const clean = () => {
    if (queues.get(id) === result) queues.delete(id);
  };
  result.then(clean, clean);
  return result;
}

// Abort the actual transport, not just the saga waiting on it. A stalled upload
// has an unknown outcome; callers must read back before deciding to upload again.
export async function boundedBackupPost(
  path: string,
  body: object,
  deadline = Date.now() + BACKUP_DEADLINE_MS
) {
  const controller = new AbortController();
  let idle: ReturnType<typeof setTimeout>;
  let uploaded = 0;
  let downloaded = 0;
  const resetIdle = () => {
    clearTimeout(idle);
    idle = setTimeout(() => controller.abort(), BACKUP_STALL_MS);
  };
  const remaining = deadline - Date.now();
  if (remaining <= 0) throw new BackupRequestError('timeout');
  const total = setTimeout(() => controller.abort(), remaining);
  resetIdle();
  try {
    return await RestClient.post(path, body, undefined, {
      signal: controller.signal,
      onUploadProgress: ({ loaded }) => {
        if (loaded > uploaded) {
          uploaded = loaded;
          resetIdle();
        }
      },
      onDownloadProgress: ({ loaded }) => {
        if (loaded > downloaded) {
          downloaded = loaded;
          resetIdle();
        }
      },
    });
  } catch (error) {
    // Do not propagate Axios errors: they can contain request bodies and headers.
    throw new BackupRequestError(requestFailureCategory(error, controller.signal.aborted));
  } finally {
    clearTimeout(idle);
    clearTimeout(total);
  }
}

export function backupPost(path: string, body: any, explicitChoice = false, expectedSession?: number) {
  const appId = body.appId || body.appID;
  if (!appId) return Promise.reject(new Error('Missing backup account'));
  const requestSession = expectedSession ?? currentBackupAccountSession();
  if (requestSession !== currentBackupAccountSession())
    return Promise.reject(new Error('Backup account session changed'));
  if (!canAccessBackupAccount(appId, explicitChoice))
    return Promise.reject(new Error('Backup account is not active or opted in'));
  markBackupMutation(appId);
  const result = withBackupSession(appId, async () => {
    // A queued write may outlive an entire A -> B -> A round trip.
    const assertCurrent = () => {
      if (requestSession !== currentBackupAccountSession())
        throw new Error('Backup account session changed');
      if (!canAccessBackupAccount(appId, explicitChoice))
        throw new Error('Backup account is not active or opted in');
    };
    assertCurrent();
    const deadline = Date.now() + BACKUP_DEADLINE_MS;
    // Read inside this account's queue, immediately before the mutation. Every
    // request carries a server revision, including deletes and label updates.
    // A distinct route makes an old relay return 404 instead of silently
    // accepting the write without enforcing expectedRevision.
    const routeSeparator = path.lastIndexOf('/') + 1;
    const operation = path.slice(routeSeparator);
    const basePath = path.slice(0, routeSeparator);
    try {
      if (!revisionedOperations.has(operation)) throw new BackupRequestError('protocol');
      const snapshot = await boundedBackupPost(
        `${basePath}getBackupSnapshot`,
        { appId },
        deadline
      );
      const expectedRevision = snapshot.data?.revision;
      if (
        typeof expectedRevision !== 'string' ||
        !/^[a-f0-9]{64}$/.test(expectedRevision)
      )
        throw new BackupRequestError('protocol');
      assertCurrent();
      const response = await boundedBackupPost(
        `${basePath}revisionedBackupMutation`,
        { ...body, appId, operation, expectedRevision },
        deadline
      );
      if (response.data?.preconditionApplied !== true) throw new BackupRequestError('protocol');
      return response;
    } catch (error) {
      if (error instanceof BackupRequestError)
        onBackupReconciliationRequired(appId);
      throw error;
    }
  });
  queuedMutationRevisions.set(appId, backupRevision(appId));
  return result;
}
