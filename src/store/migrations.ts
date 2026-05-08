/**
 * Migrations for Redux Persist
 * Every migration runs sequentially(from the current version of the persisted state) and introduces changes to the state
 */
const migrations = {
  //  Reference:
  //   2: (state) => ({
  //     ...state,
  //     settings: {
  //       ...state.settings,
  //       useFrequently: 'nah',
  //     },
  //   }),
  //   3: (state) => ({
  //     ...state,
  //     settings: {
  //       ...state.settings,
  //       isSleek: 'yeah',
  //     },
  //   }),
  2: (state) => ({
    ...state,
    settings: {
      ...state.settings,
      oneTimeBackupStatus: {
        signingServer: false,
      },
    },
  }),
  3: (state) => ({
    ...state,
    vault: {
      ...state.vault,
      collaborativeSession: {
        signers: {},
        isComplete: false,
        lastSynced: null,
      },
    },
  }),
  4: (state) => ({
    ...state,
    account: {
      ...state.account,
      recoveryKeyStatusByAppId: Object.keys(state?.account?.recoveryKeyBackedUpByAppId || {}).reduce(
        (acc, appId) => ({
          ...acc,
          [appId]: state.account.recoveryKeyBackedUpByAppId[appId] ? 'confirmed' : 'generated',
        }),
        state?.account?.recoveryKeyStatusByAppId || {}
      ),
    },
  }),
};

export default migrations;
