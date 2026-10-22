// Fixed development observations only. Never retain or forward an Error object.
export const STARTUP_FAILURE_STAGES = [
  'READ_CALL',
  'STATE_READ',
  'SERVICE_SELECT',
  'KEYCHAIN_READ',
  'CREDENTIAL_PARSE',
  'NAVIGATE_LOGIN',
  'NAVIGATE_CREATE_PIN',
] as const;
export type StartupFailureStage = (typeof STARTUP_FAILURE_STAGES)[number];

const NATIVE_CODES = {
  '-34018': 'NATIVE_CODE_NEG34018',
  '-25308': 'NATIVE_CODE_NEG25308',
  '-25291': 'NATIVE_CODE_NEG25291',
  '-25293': 'NATIVE_CODE_NEG25293',
  '-26275': 'NATIVE_CODE_NEG26275',
  '-50': 'NATIVE_CODE_NEG50',
} as const;
const ERROR_NAMES = {
  Error: 'ERROR',
  TypeError: 'TYPE_ERROR',
  SyntaxError: 'SYNTAX_ERROR',
  RangeError: 'RANGE_ERROR',
  ReferenceError: 'REFERENCE_ERROR',
} as const;
export const STARTUP_FAILURE_CATEGORIES = [
  ...Object.values(NATIVE_CODES),
  ...Object.values(ERROR_NAMES),
  'UNKNOWN',
] as const;
export type StartupFailureCategory = (typeof STARTUP_FAILURE_CATEGORIES)[number];
export type StartupFailureFact = Readonly<{
  stage: StartupFailureStage;
  category: StartupFailureCategory;
}>;

export const startupFailureFact = (
  stage: StartupFailureStage,
  error: unknown
): StartupFailureFact => {
  let category: StartupFailureCategory = 'UNKNOWN';
  // Accessors may themselves throw. No dynamic value is returned or logged.
  try {
    if (error && (typeof error === 'object' || typeof error === 'function')) {
      const { code } = error as { code?: unknown };
      if (
        stage === 'KEYCHAIN_READ' &&
        (typeof code === 'string' || typeof code === 'number') &&
        Object.prototype.hasOwnProperty.call(NATIVE_CODES, code)
      ) {
        category = NATIVE_CODES[String(code) as keyof typeof NATIVE_CODES];
      } else {
        const { name } = error as { name?: unknown };
        if (typeof name === 'string' && Object.prototype.hasOwnProperty.call(ERROR_NAMES, name)) {
          category = ERROR_NAMES[name as keyof typeof ERROR_NAMES];
        }
      }
    }
  } catch {
    // Unknown is more accurate than letting diagnostics replace the failure.
  }
  return {
    stage: STARTUP_FAILURE_STAGES.includes(stage) ? stage : 'READ_CALL',
    category,
  };
};

export const reportStartupFailure = (fact: StartupFailureFact) => {
  if (!__DEV__) return;
  try {
    const { stage, category } = fact;
    if (STARTUP_FAILURE_STAGES.includes(stage) && STARTUP_FAILURE_CATEGORIES.includes(category)) {
      // One info line adds no LogBox warning/error and exports no raw details.
      console.info(`KEEPER_STARTUP_ERROR stage=${stage} category=${category}`);
    }
  } catch {
    // Logging never changes credential, navigation, Retry or unmount semantics.
  }
};
