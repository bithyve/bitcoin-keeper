import accountReducer, {
  setRecoveryKeyBackedUp,
  setRecoveryKeyStatus,
} from 'src/store/reducers/account';
import migrations from 'src/store/migrations';

describe('account recovery key status', () => {
  it('marks recovery key status as confirmed when backup is set true', () => {
    const state = accountReducer(undefined, setRecoveryKeyBackedUp({ appId: 'app-1', status: true }));

    expect(state.recoveryKeyBackedUpByAppId['app-1']).toBe(true);
    expect(state.recoveryKeyStatusByAppId['app-1']).toBe('confirmed');
  });

  it('keeps backup false when status is skipped', () => {
    const initial = accountReducer(undefined, setRecoveryKeyBackedUp({ appId: 'app-1', status: false }));
    const state = accountReducer(initial, setRecoveryKeyStatus({ appId: 'app-1', status: 'skipped' }));

    expect(state.recoveryKeyBackedUpByAppId['app-1']).toBe(false);
    expect(state.recoveryKeyStatusByAppId['app-1']).toBe('skipped');
  });
});

describe('redux persist migration v4', () => {
  it('maps legacy recoveryKeyBackedUpByAppId values to recovery key status', () => {
    const state = {
      account: {
        recoveryKeyBackedUpByAppId: {
          appA: true,
          appB: false,
        },
        recoveryKeyStatusByAppId: {
          appC: 'skipped',
        },
      },
    } as any;

    const migrated = migrations[4](state);

    expect(migrated.account.recoveryKeyStatusByAppId).toEqual({
      appA: 'confirmed',
      appB: 'generated',
      appC: 'skipped',
    });
  });
});
