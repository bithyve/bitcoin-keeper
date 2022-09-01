import {
  addNewVaultWatcher,
  addNewWalletsWatcher,
  addSigningDeviceWatcher,
  autoWalletsSyncWatcher,
  finaliseVaultMigrationWatcher,
  importNewWalletWatcher,
  migrateVaultWatcher,
  refreshWalletsWatcher,
  syncWalletsWatcher,
  updateWalletSettingsWatcher,
} from './wallets';
import {
  addUaiStackWatcher,
  uaiActionedEntityWatcher,
  uaiChecksWatcher,
  updateUaiStackWatcher,
} from './uai';
import { all, call, spawn } from 'redux-saga/effects';
import {
  applicationUpdateWatcher,
  changeAuthCredWatcher,
  changeLoginMethodWatcher,
  credentialStorageWatcher,
  credentialsAuthWatcher,
  resetPinCredWatcher,
} from './login';
import {
  backupWarningWatcher,
  cloudBackupSkippedWatcher,
  confirmCloudBackupWatcher,
  getAppImageWatcher,
  getCloudDataWatcher,
  healthCheckSignerWatcher,
  initCloudBackupWatcher,
  recoverBackupWatcher,
  seedBackedUpWatcher,
  seedBackeupConfirmedWatcher,
  updateAppImageWatcher,
} from './bhr';
import {
  calculateCustomFeeWatcher,
  calculateSendMaxFeeWatcher,
  corssTransferWatcher,
  feeAndExchangeRatesWatcher,
  sendPhaseOneWatcher,
  sendPhaseThreeWatcher,
  sendPhaseTwoWatcher,
  updatePSBTSignaturesWatcher,
} from './send_and_receive';
import { getMessageWatcher, updateFCMTokensWatcher } from './notifications';

import { setupKeeperAppWatcher } from './storage';

export const rootSaga = function* () {
  const sagas = [
    // login
    credentialsAuthWatcher,
    changeAuthCredWatcher,
    changeLoginMethodWatcher,
    credentialStorageWatcher,
    resetPinCredWatcher,
    setupKeeperAppWatcher,
    applicationUpdateWatcher,
    // notification
    updateFCMTokensWatcher,
    getMessageWatcher,

    // wallet
    addNewWalletsWatcher,
    autoWalletsSyncWatcher,
    importNewWalletWatcher,
    refreshWalletsWatcher,
    syncWalletsWatcher,
    updateWalletSettingsWatcher,

    // vaults
    addNewVaultWatcher,
    addSigningDeviceWatcher,
    migrateVaultWatcher,
    finaliseVaultMigrationWatcher,

    // send and receive
    feeAndExchangeRatesWatcher,
    sendPhaseOneWatcher,
    sendPhaseTwoWatcher,
    sendPhaseThreeWatcher,
    corssTransferWatcher,
    calculateSendMaxFeeWatcher,
    calculateCustomFeeWatcher,
    updatePSBTSignaturesWatcher,

    // UAI
    uaiChecksWatcher,
    addUaiStackWatcher,
    updateUaiStackWatcher,
    uaiActionedEntityWatcher,

    //BHR
    updateAppImageWatcher,
    getAppImageWatcher,
    seedBackedUpWatcher,
    seedBackeupConfirmedWatcher,
    initCloudBackupWatcher,
    cloudBackupSkippedWatcher,
    confirmCloudBackupWatcher,
    getCloudDataWatcher,
    recoverBackupWatcher,
    healthCheckSignerWatcher,
    backupWarningWatcher,
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
