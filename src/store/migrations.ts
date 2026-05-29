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
  4: (state) => {
    // Migrate recoveryKeyBackedUpByAppId (Boolean) → recoveryKeyStatusByAppId (RecoveryKeyStatus)
    const oldMap: Record<string, boolean> = state?.account?.recoveryKeyBackedUpByAppId ?? {};
    const newMap: Record<string, string> = {};
    for (const appId of Object.keys(oldMap)) {
      newMap[appId] = oldMap[appId] === true ? 'confirmed' : 'generated';
    }
    return {
      ...state,
      account: {
        ...state.account,
        recoveryKeyStatusByAppId: newMap,
      },
    };
  },
};

export default migrations;
