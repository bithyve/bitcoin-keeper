import { all, call, spawn } from 'redux-saga/effects';
import {
  credentialsAuthWatcher,
  changeAuthCredWatcher,
  changeLoginMethodWatcher,
  credentialStorageWatcher,
  resetPinCredWatcher,
} from './login';
import { setupKeeperAppWatcher } from './storage';
import {
  addNewVaultWatcher,
  addNewWalletsWatcher,
  autoWalletsSyncWatcher,
  importNewWalletWatcher,
  refreshWalletsWatcher,
  syncWalletsWatcher,
  updateWalletSettingsWatcher,
} from './wallets';
import { updateFCMTokensWatcher } from './notifications';
import { addUaiStackWatcher, updateUaiStackWatcher } from './uai';
import {
  calculateCustomFeeWatcher,
  calculateSendMaxFeeWatcher,
  sendPhaseOneWatcher,
  sendPhaseTwoWatcher,
  corssTransferWatcher,
  feeAndExchangeRatesWatcher,
  sendPhaseThreeWatcher,
} from './send_and_receive';

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
    addNewVaultWatcher,
    autoWalletsSyncWatcher,
    importNewWalletWatcher,
    refreshWalletsWatcher,
    syncWalletsWatcher,
    updateWalletSettingsWatcher,

    // send and receive
    feeAndExchangeRatesWatcher,
    sendPhaseOneWatcher,
    sendPhaseTwoWatcher,
    sendPhaseThreeWatcher,
    corssTransferWatcher,
    calculateSendMaxFeeWatcher,
    calculateCustomFeeWatcher,

    // UAI
    addUaiStackWatcher,
    updateUaiStackWatcher,
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
