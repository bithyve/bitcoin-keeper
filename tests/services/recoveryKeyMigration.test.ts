/**
 * Tests for RecoveryKeyStatus migration and account reducer actions.
 * Task 7.1: migration function tests
 * Task 7.2: setRecoveryKeyStatus reducer tests
 */
import accountReducer, {
  setRecoveryKeyStatus,
  RecoveryKeyStatus,
} from 'src/store/reducers/account';
import migrations from 'src/store/migrations';

// ─── Task 7.1: Migration function tests ────────────────────────────────────

describe('migration 4: recoveryKeyBackedUpByAppId → recoveryKeyStatusByAppId', () => {
  const migration4 = (migrations as any)[4];

  it('maps Boolean true → "confirmed"', () => {
    const state = {
      account: {
        recoveryKeyBackedUpByAppId: { app1: true },
      },
    };
    const result = migration4(state);
    expect(result.account.recoveryKeyStatusByAppId.app1).toBe('confirmed');
  });

  it('maps Boolean false → "generated"', () => {
    const state = {
      account: {
        recoveryKeyBackedUpByAppId: { app1: false },
      },
    };
    const result = migration4(state);
    expect(result.account.recoveryKeyStatusByAppId.app1).toBe('generated');
  });

  it('maps missing entry → "generated"', () => {
    const state = {
      account: {
        recoveryKeyBackedUpByAppId: {},
      },
    };
    const result = migration4(state);
    expect(result.account.recoveryKeyStatusByAppId).toEqual({});
  });

  it('handles undefined recoveryKeyBackedUpByAppId gracefully', () => {
    const state = {
      account: {},
    };
    const result = migration4(state);
    expect(result.account.recoveryKeyStatusByAppId).toEqual({});
  });

  it('maps multiple apps correctly', () => {
    const state = {
      account: {
        recoveryKeyBackedUpByAppId: {
          appA: true,
          appB: false,
          appC: true,
        },
      },
    };
    const result = migration4(state);
    expect(result.account.recoveryKeyStatusByAppId).toEqual({
      appA: 'confirmed',
      appB: 'generated',
      appC: 'confirmed',
    });
  });
});

// ─── Task 7.2: setRecoveryKeyStatus reducer tests ──────────────────────────

describe('setRecoveryKeyStatus reducer', () => {
  const getInitialState = () =>
    accountReducer(undefined, { type: '@@INIT' } as any);

  it('sets status to "generated"', () => {
    const state = getInitialState();
    const next = accountReducer(
      state,
      setRecoveryKeyStatus({ appId: 'app1', status: 'generated' })
    );
    expect(next.recoveryKeyStatusByAppId['app1']).toBe('generated');
  });

  it('sets status to "viewed"', () => {
    const state = getInitialState();
    const next = accountReducer(
      state,
      setRecoveryKeyStatus({ appId: 'app1', status: 'viewed' })
    );
    expect(next.recoveryKeyStatusByAppId['app1']).toBe('viewed');
  });

  it('sets status to "skipped"', () => {
    const state = getInitialState();
    const next = accountReducer(
      state,
      setRecoveryKeyStatus({ appId: 'app1', status: 'skipped' })
    );
    expect(next.recoveryKeyStatusByAppId['app1']).toBe('skipped');
  });

  it('sets status to "confirmed" and syncs legacy boolean to true', () => {
    const state = getInitialState();
    const next = accountReducer(
      state,
      setRecoveryKeyStatus({ appId: 'app1', status: 'confirmed' })
    );
    expect(next.recoveryKeyStatusByAppId['app1']).toBe('confirmed');
    expect(next.recoveryKeyBackedUpByAppId['app1']).toBe(true);
  });

  it('non-confirmed statuses do not change legacy boolean field', () => {
    const state = getInitialState();
    const next = accountReducer(
      state,
      setRecoveryKeyStatus({ appId: 'app1', status: 'skipped' })
    );
    expect(next.recoveryKeyBackedUpByAppId['app1']).toBeUndefined();
  });
});
