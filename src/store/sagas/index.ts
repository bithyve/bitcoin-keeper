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
  updateSignerDetails,
  updateKeyDetails,
  updateWalletsPropertyWatcher,
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
} from './login';
import {
  deleteAppImageEntityWatcher,
  getAppImageWatcher,
  healthCheckSignerWatcher,
  seedBackedUpWatcher,
  seedBackeupConfirmedWatcher,
  updateAppImageWatcher,
  updateVaultImageWatcher,
  backupBsmsOnCloudWatcher,
  bsmsCloudHealthCheckWatcher,
  healthCheckSatutsUpdateWatcher,
  backupAllSignersAndVaultsWatcher,
  deleteBackupWatcher,
} from './bhr';
import {
  calculateCustomFeeWatcher,
  calculateSendMaxFeeWatcher,
  fetchExchangeRatesWatcher,
  fetchFeeRatesWatcher,
  fetchOneDayInsightWatcher,
  sendPhaseOneWatcher,
  sendPhaseThreeWatcher,
  sendPhaseTwoWatcher,
} from './send_and_receive';
import { updateFCMTokensWatcher } from './notifications';

import {
  fetchDelayedPolicyUpdateWatcher,
  fetchSignedDelayedTransactionWatcher,
  setupKeeperAppWatcher,
} from './storage';
import { migrateLablesWatcher, updateVersionHistoryWatcher } from './upgrade';
import { addLabelsWatcher, bulkUpdateLabelWatcher } from './utxos';
import { connectToNodeWatcher } from './network';
import {
  loadConciergeUserWatcher,
  addTicketStatusUAIWatcher,
  scheduleOnboardingCallWatcher,
} from './concierge';
import { changeBitcoinNetworkWatcher } from './settings';

const rootSaga = function* () {
  const sagas = [
    // login
    credentialsAuthWatcher,
    changeAuthCredWatcher,
    changeLoginMethodWatcher,
    credentialStorageWatcher,
    setupKeeperAppWatcher,

    // network
    connectToNodeWatcher,
    fetchOneDayInsightWatcher,

    // notification
    updateFCMTokensWatcher,

    // wallet
    addNewWalletsWatcher,
    autoWalletsSyncWatcher,
    refreshWalletsWatcher,
    syncWalletsWatcher,
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
    healthCheckSignerWatcher,
    healthCheckSatutsUpdateWatcher,
    backupBsmsOnCloudWatcher,
    bsmsCloudHealthCheckWatcher,
    deleteAppImageEntityWatcher,
    backupAllSignersAndVaultsWatcher,
    deleteBackupWatcher,
    // upgrade
    updateVersionHistoryWatcher,
    migrateLablesWatcher,

    // utxos
    addLabelsWatcher,
    bulkUpdateLabelWatcher,
    // concierge
    loadConciergeUserWatcher,
    addTicketStatusUAIWatcher,
    scheduleOnboardingCallWatcher,
    // settings
    changeBitcoinNetworkWatcher,
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
