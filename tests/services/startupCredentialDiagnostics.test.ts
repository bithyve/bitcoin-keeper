import {
  reportStartupFailure,
  startupFailureFact,
} from '../../src/storage/startup-credential-diagnostics';

const previousDev = __DEV__;
afterEach(() => {
  (global as any).__DEV__ = previousDev;
  jest.restoreAllMocks();
});

test('only known native codes at the Keychain boundary supply a fixed code category', () => {
  for (const code of ['-34018', -25308, '-25291', '-25293', '-26275', '-50']) {
    expect(startupFailureFact('KEYCHAIN_READ', { code, message: 'PRIVATE_SENTINEL' })).toEqual({
      stage: 'KEYCHAIN_READ',
      category: `NATIVE_CODE_NEG${String(code).slice(1)}`,
    });
  }
  expect(startupFailureFact('CREDENTIAL_PARSE', { code: '-34018', name: 'SyntaxError' })).toEqual({
    stage: 'CREDENTIAL_PARSE',
    category: 'SYNTAX_ERROR',
  });
});

test('unknown values and hostile error accessors cannot escape or replace the failure', () => {
  const values = [
    null,
    'PRIVATE_SENTINEL',
    { code: 'PRIVATE_SENTINEL', name: '__proto__' },
    {
      get code() {
        throw Error('PRIVATE_SENTINEL');
      },
    },
    {
      get name() {
        throw Error('PRIVATE_SENTINEL');
      },
    },
    {
      code: {
        toString() {
          throw Error('PRIVATE_SENTINEL');
        },
      },
    },
  ];
  for (const value of values) {
    expect(startupFailureFact('KEYCHAIN_READ', value)).toEqual({
      stage: 'KEYCHAIN_READ',
      category: 'UNKNOWN',
    });
  }
  expect(startupFailureFact('PRIVATE_SENTINEL' as any, new TypeError('PRIVATE_SENTINEL'))).toEqual({
    stage: 'READ_CALL',
    category: 'TYPE_ERROR',
  });
});

test('development output is one fixed info marker without warnings, errors or raw fields', () => {
  (global as any).__DEV__ = true;
  const info = jest.spyOn(console, 'info').mockImplementation(() => {});
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  reportStartupFailure(
    startupFailureFact('KEYCHAIN_READ', { code: '-34018', message: 'PRIVATE_SENTINEL' })
  );
  expect(info.mock.calls).toEqual([
    ['KEEPER_STARTUP_ERROR stage=KEYCHAIN_READ category=NATIVE_CODE_NEG34018'],
  ]);
  expect(warn).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
  expect(JSON.stringify(info.mock.calls)).not.toContain('PRIVATE_SENTINEL');
});

test('production ignores observation fields, and a failing logger remains harmless', () => {
  const info = jest.spyOn(console, 'info').mockImplementation(() => {
    throw Error('PRIVATE_SENTINEL');
  });
  const fact = {
    get stage() {
      throw Error('PRIVATE_SENTINEL');
    },
  } as any;
  (global as any).__DEV__ = false;
  expect(() => reportStartupFailure(fact)).not.toThrow();
  expect(info).not.toHaveBeenCalled();
  (global as any).__DEV__ = true;
  expect(() => reportStartupFailure(fact)).not.toThrow();
  expect(() => reportStartupFailure({ stage: 'READ_CALL', category: 'UNKNOWN' })).not.toThrow();
});

test('a changing fact accessor is read once and never interpolated after validation', () => {
  (global as any).__DEV__ = true;
  const info = jest.spyOn(console, 'info').mockImplementation(() => {});
  let reads = 0;
  reportStartupFailure({
    get stage() {
      return ++reads === 1 ? 'READ_CALL' : 'PRIVATE_SENTINEL';
    },
    category: 'UNKNOWN',
  } as any);
  expect(reads).toBe(1);
  expect(info).toHaveBeenCalledWith('KEEPER_STARTUP_ERROR stage=READ_CALL category=UNKNOWN');
});
