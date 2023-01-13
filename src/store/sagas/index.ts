import { all, call, spawn } from 'redux-saga/effects';
import {
  addNewVaultWatcher,
  addNewWalletsWatcher,
  addSigningDeviceWatcher,
  autoWalletsSyncWatcher,
  finaliseVaultMigrationWatcher,
  importNewWalletWatcher,
  migrateVaultWatcher,
  refreshWalletsWatcher,
  registerWithSigningServerWatcher,
  syncWalletsWatcher,
  testcoinsWatcher,
  updateSignerPolicyWatcher,
  updateWalletDetailWatcher,
  updateWalletSettingsWatcher,
  validateSigningServerRegistrationWatcher,
  updateSignerDetails,
} from './wallets';
import {
  addUaiStackWatcher,
  uaiActionedEntityWatcher,
  uaiActionedWatcher,
  uaiChecksWatcher,
} from './uai';
import {
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
  recoverVaultWatcher,
  seedBackedUpWatcher,
  seedBackeupConfirmedWatcher,
  updateAppImageWatcher,
  updateVaultImageWatcher,
} from './bhr';
import {
  calculateCustomFeeWatcher,
  calculateSendMaxFeeWatcher,
  corssTransferWatcher,
  fetchExchangeRatesWatcher,
  fetchFeeRatesWatcher,
  sendPhaseOneWatcher,
  sendPhaseThreeWatcher,
  sendPhaseTwoWatcher,
} from './send_and_receive';
import { getMessageWatcher, updateFCMTokensWatcher } from './notifications';

import { setupKeeperAppWatcher, setupKeeperVaultRecoveryAppWatcher } from './storage';
import { updateVersionHistoryWatcher } from './upgrade';

const rootSaga = function* () {
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
    getMessageWatcher,

    // wallet
    addNewWalletsWatcher,
    autoWalletsSyncWatcher,
    importNewWalletWatcher,
    refreshWalletsWatcher,
    syncWalletsWatcher,
    updateWalletSettingsWatcher,
    registerWithSigningServerWatcher,
    validateSigningServerRegistrationWatcher,
    updateSignerPolicyWatcher,
    testcoinsWatcher,
    updateWalletDetailWatcher,

    // vaults
    addNewVaultWatcher,
    addSigningDeviceWatcher,
    migrateVaultWatcher,
    finaliseVaultMigrationWatcher,
    updateSignerDetails,

    // send and receive
    fetchExchangeRatesWatcher,
    fetchFeeRatesWatcher,
    sendPhaseOneWatcher,
    sendPhaseTwoWatcher,
    sendPhaseThreeWatcher,
    corssTransferWatcher,
    calculateSendMaxFeeWatcher,
    calculateCustomFeeWatcher,

    // UAI
    uaiChecksWatcher,
    addUaiStackWatcher,
    uaiActionedWatcher,
    uaiActionedEntityWatcher,

    // BHR
    updateAppImageWatcher,
    updateVaultImageWatcher,
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
    recoverVaultWatcher,
    setupKeeperVaultRecoveryAppWatcher,

    // upgrade
    updateVersionHistoryWatcher,
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

export default rootSaga;
