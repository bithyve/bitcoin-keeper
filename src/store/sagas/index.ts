import { all, call, spawn } from 'redux-saga/effects';
import {
  credentialsAuthWatcher,
  changeAuthCredWatcher,
  changeLoginMethodWatcher,
  credentialStorageWatcher,
  resetPinCredWatcher
} from './login'
import {
  setupKeeperAppWatcher
} from './storage'
import {
  addNewWalletsWatcher,
  autoWalletsSyncWatcher,
  feeAndExchangeRatesWatcher,
  generateSecondaryXprivWatcher,
  importNewWalletWatcher,
  refreshWalletsWatcher,
  resetTwoFAWatcher,
  syncWalletsWatcher,
  testcoinsWatcher,
  updateWalletSettingsWatcher,
  validateTwoFAWatcher,
} from './wallets';
import { updateFCMTokensWatcher } from './notifications';
import { addUaiStackWatcher, updateUaiStackWatcher } from './uai';

export const rootSaga = function* () {
  const sagas = [
    // login
    credentialsAuthWatcher,
    changeAuthCredWatcher,
    changeLoginMethodWatcher,
    credentialStorageWatcher,
    resetPinCredWatcher,
    setupKeeperAppWatcher,

    // notification
    updateFCMTokensWatcher,

    // wallet
    addNewWalletsWatcher,
    autoWalletsSyncWatcher,
    feeAndExchangeRatesWatcher,
    generateSecondaryXprivWatcher,
    importNewWalletWatcher,
    refreshWalletsWatcher,
    resetTwoFAWatcher,
    syncWalletsWatcher,
    testcoinsWatcher,
    updateWalletSettingsWatcher,
    validateTwoFAWatcher,

    // UAI
    addUaiStackWatcher,
    updateUaiStackWatcher

  ];

  yield all(
    sagas.map((saga) =>
      spawn(function* () {
        while (true) {
          try {
            yield call(saga);
            break;
          } catch (err) {
            console.log(err);
          }
        }
      })
    )
  );
};