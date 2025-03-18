import { all, call, spawn } from 'redux-saga/effects';
import {
  addNewVaultWatcher,
  addNewWalletsWatcher,
  addSigningDeviceWatcher,
  deleteSigningDeviceWatcher,
  autoWalletsSyncWatcher,
  finaliseVaultMigrationWatcher,
  migrateVaultWatcher,
  refreshWalletsWatcher,
  syncWalletsWatcher,
  testcoinsWatcher,
  updateSignerPolicyWatcher,
  updateWalletDetailWatcher,
  updateWalletSettingsWatcher,
  updateSignerDetails,
  updateKeyDetails,
  updateWalletsPropertyWatcher,
  updateWalletPathAndPuposeDetailWatcher,
  updateVaultDetailsWatcher,
  deleteVaultyWatcher,
  reinstateVaultWatcher,
  refillMobileKeyWatcher,
  refreshCanaryWalletsWatcher,
  mergeSimilarKeysWatcher,
  archiveSigningDeviceWatcher,
  generateNewExternalAddressWatcher,
  updateCollaborativeChannelWatcher,
  fetchCollaborativeChannelWatcher,
} from './wallets';
import { addUaiStackWatcher, uaiActionedWatcher, uaiChecksWatcher, uaisSeenWatcher } from './uai';
import {
  changeAuthCredWatcher,
  changeLoginMethodWatcher,
  credentialStorageWatcher,
  credentialsAuthWatcher,
  resetPinCredWatcher,
  generateSeedHashWatcher,
  switchAppStatusWatcher,
} from './login';
import {
  backupWarningWatcher,
  deleteAppImageEntityWatcher,
  getAppImageWatcher,
  healthCheckSignerWatcher,
  recoverBackupWatcher,
  seedBackedUpWatcher,
  seedBackeupConfirmedWatcher,
  updateAppImageWatcher,
  updateVaultImageWatcher,
  backupBsmsOnCloudWatcher,
  bsmsCloudHealthCheckWatcher,
  healthCheckSatutsUpdateWatcher,
  backupAllSignersAndVaultsWatcher,
} from './bhr';
import {
  calculateCustomFeeWatcher,
  calculateSendMaxFeeWatcher,
  corssTransferWatcher,
  fetchExchangeRatesWatcher,
  fetchFeeRatesWatcher,
  fetchOneDayInsightWatcher,
  sendPhaseOneWatcher,
  sendPhaseThreeWatcher,
  sendPhaseTwoWatcher,
} from './send_and_receive';
import { getMessageWatcher, updateFCMTokensWatcher } from './notifications';

import {
  fetchDelayedPolicyUpdateWatcher,
  fetchSignedDelayedTransactionWatcher,
  setupKeeperAppWatcher,
  setupKeeperVaultRecoveryAppWatcher,
} from './storage';
import { migrateLablesWatcher, updateVersionHistoryWatcher } from './upgrade';
import { addLabelsWatcher, bulkUpdateLabelWatcher, bulkUpdateUTXOLabelWatcher } from './utxos';
import { connectToNodeWatcher } from './network';
import {
  loadConciergeUserWatcher,
  addTicketStatusUAIWatcher,
  scheduleOnboardingCallWatcher,
} from './concierge';

const rootSaga = function* () {
  const sagas = [
    // login
    credentialsAuthWatcher,
    changeAuthCredWatcher,
    generateSeedHashWatcher,
    changeLoginMethodWatcher,
    credentialStorageWatcher,
    switchAppStatusWatcher,
    resetPinCredWatcher,
    setupKeeperAppWatcher,

    // network
    connectToNodeWatcher,
    fetchOneDayInsightWatcher,

    // notification
    updateFCMTokensWatcher,
    getMessageWatcher,

    // wallet
    addNewWalletsWatcher,
    autoWalletsSyncWatcher,
    refreshWalletsWatcher,
    syncWalletsWatcher,
    updateWalletSettingsWatcher,
    updateSignerPolicyWatcher,
    testcoinsWatcher,
    updateWalletDetailWatcher,
    updateWalletsPropertyWatcher,
    generateNewExternalAddressWatcher,

    // vaults
    addNewVaultWatcher,
    addSigningDeviceWatcher,
    deleteSigningDeviceWatcher,
    migrateVaultWatcher,
    finaliseVaultMigrationWatcher,
    updateVaultDetailsWatcher,
    updateSignerDetails,
    updateKeyDetails,
    deleteVaultyWatcher,
    reinstateVaultWatcher,
    refillMobileKeyWatcher,
    refreshCanaryWalletsWatcher,
    mergeSimilarKeysWatcher,
    archiveSigningDeviceWatcher,
    updateCollaborativeChannelWatcher,
    fetchCollaborativeChannelWatcher,

    // send and receive
    fetchExchangeRatesWatcher,
    fetchFeeRatesWatcher,
    sendPhaseOneWatcher,
    sendPhaseTwoWatcher,
    sendPhaseThreeWatcher,
    corssTransferWatcher,
    fetchSignedDelayedTransactionWatcher,
    fetchDelayedPolicyUpdateWatcher,
    calculateSendMaxFeeWatcher,
    calculateCustomFeeWatcher,

    // UAI
    uaiChecksWatcher,
    addUaiStackWatcher,
    uaiActionedWatcher,
    uaisSeenWatcher,

    // BHR
    updateAppImageWatcher,
    updateVaultImageWatcher,
    getAppImageWatcher,
    seedBackedUpWatcher,
    seedBackeupConfirmedWatcher,
    recoverBackupWatcher,
    healthCheckSignerWatcher,
    healthCheckSatutsUpdateWatcher,
    backupWarningWatcher,
    setupKeeperVaultRecoveryAppWatcher,
    updateWalletPathAndPuposeDetailWatcher,
    backupBsmsOnCloudWatcher,
    bsmsCloudHealthCheckWatcher,
    deleteAppImageEntityWatcher,
    backupAllSignersAndVaultsWatcher,
    // upgrade
    updateVersionHistoryWatcher,
    migrateLablesWatcher,

    // utxos
    addLabelsWatcher,
    bulkUpdateLabelWatcher,
    bulkUpdateUTXOLabelWatcher,
    // concierge
    loadConciergeUserWatcher,
    addTicketStatusUAIWatcher,
    scheduleOnboardingCallWatcher,
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
