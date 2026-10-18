// Only real native connection lifecycle APIs are called by the native entrypoint.
class IapFailure extends Error {
  constructor(code) { super(code); this.code = code; }
}
const CODES = new Set(['IAP_TIMEOUT', 'IAP_STORE_UNAVAILABLE', 'IAP_INIT_FALSE',
  'IAP_END_FALSE', 'IAP_NATIVE_FAILURE', 'IAP_API_MISSING']);
function failureCode(error) {
  if (error instanceof IapFailure && CODES.has(error.code)) return error.code;
  if (error && error.code === 'iap-not-available') return 'IAP_STORE_UNAVAILABLE';
  return 'IAP_NATIVE_FAILURE';
}
async function bounded(call, timeoutMs) {
  let timer;
  try {
    return await Promise.race([Promise.resolve().then(call), new Promise((_, reject) => {
      timer = setTimeout(() => reject(new IapFailure('IAP_TIMEOUT')), timeoutMs);
    })]);
  } finally { clearTimeout(timer); }
}
async function runIap({ initConnection, endConnection }, timeoutMs = 20000) {
  if (typeof initConnection !== 'function' || typeof endConnection !== 'function') {
    throw new IapFailure('IAP_API_MISSING');
  }
  // Both first init and re-init must resolve strictly true; unavailability blocks.
  // No product lookup, purchases, restores, receipts, store accounts or credentials.
  for (let cycle = 0; cycle < 2; cycle += 1) {
    let problem;
    try {
      if (await bounded(() => initConnection(), timeoutMs) !== true) {
        throw new IapFailure('IAP_INIT_FALSE');
      }
    } catch (error) { problem = new IapFailure(failureCode(error)); }
    try {
      if (await bounded(() => endConnection(), timeoutMs) !== true && !problem) {
        problem = new IapFailure('IAP_END_FALSE');
      }
    } catch (error) {
      if (!problem) problem = new IapFailure(failureCode(error));
    }
    if (problem) throw problem;
  }
  return 'pass';
}
module.exports = { runIap, IapFailure, failureCode };
