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
        inheritanceKey: false,
      },
    },
  }),
  3: (state) => ({
    ...state,
    vault: {
      ...state.vault,
      collaborativeSession: {
        signers: {},
        lastSynced: null,
      },
    },
  }),
};

export default migrations;
