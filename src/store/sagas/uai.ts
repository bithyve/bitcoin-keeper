import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { call, put, select } from 'redux-saga/effects';
import { UAI, uaiType } from 'src/models/interfaces/Uai';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import { v4 as uuidv4 } from 'uuid';

import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { isTestnet } from 'src/constants/Bitcoin';
import { EntityKind, SignerType, VaultType } from 'src/services/wallets/enums';
import { BackupHistory } from 'src/models/enums/BHR';
import {
  createUaiMap,
  setRefreshUai,
  updateCanaryBalanceCache,
  updateUaiActionMap,
} from '../reducers/uai';
import {
  addToUaiStack,
  ADD_TO_UAI_STACK,
  uaiActioned,
  UAI_ACTIONED,
  UAI_CHECKS,
} from '../sagaActions/uai';
import { createWatcher } from '../utilities';
import { oneDayInsightSelector } from 'src/hooks/useOneDayInsight';
import { generateFeeStatement } from 'src/utils/feeInisghtUtil';
const HEALTH_CHECK_REMINDER_MAINNET = 180; // 180 days
const HEALTH_CHECK_REMINDER_TESTNET = 3; // 3hours
const healthCheckReminderThreshold = isTestnet()
  ? HEALTH_CHECK_REMINDER_TESTNET
  : HEALTH_CHECK_REMINDER_MAINNET;

const healthCheckReminderDays = (lastHealthCheck: Date) => {
  const today = new Date();
  const differenceInTime = today.getTime() - lastHealthCheck.getTime();
  const differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24));
  return differenceInDays;
};

const healthCheckReminderHours = (lastHealthCheck: Date) => {
  const today = new Date();
  const differenceInTime = today.getTime() - lastHealthCheck.getTime();
  const differenceInHours = Math.round(differenceInTime / (1000 * 3600));
  return differenceInHours;
};

const healthCheckReminderMinutes = (lastHealthCheck: Date) => {
  const today = new Date();
  const differenceInTime = today.getTime() - lastHealthCheck.getTime();
  const differenceInMinutes = Math.round(differenceInTime / (1000 * 60));
  return differenceInMinutes;
};

function* addToUaiStackWorker({ payload }) {
  const { entityId, uaiType, uaiDetails } = payload;
  const uai: UAI = {
    id: uuidv4(),
    entityId,
    uaiType,
    uaiDetails,
  };
  try {
    yield call(dbManager.createObject, RealmSchema.UAI, uai);
    yield put(setRefreshUai());
  } catch (err) {
    console.error('Db add failed', err);
  }
}

function* uaiActionedWorker({ payload }) {
  try {
    const { uaiId, action, entityId, uaiType } = payload;
    // Handle action based on entityId
    if (entityId) {
      const uaiEntityId: UAI | any = dbManager.getObjectByField(
        RealmSchema.UAI,
        entityId,
        'entityId'
      )[0];
      if (uaiEntityId) {
        if (action) {
          yield call(dbManager.deleteObjectById, RealmSchema.UAI, uaiEntityId.id);
        } else {
          const updateData = { lastActioned: new Date() };
          yield call(dbManager.updateObjectById, RealmSchema.UAI, uaiEntityId.id, updateData);
          yield put(updateUaiActionMap(uaiEntityId.id));
        }
      }
    }
    // Handle action based on uaiType
    if (uaiType) {
      const uaiTypeBased: UAI | any = dbManager.getObjectByField(
        RealmSchema.UAI,
        uaiType,
        'uaiType'
      )[0];
      if (uaiTypeBased) {
        if (action) {
          yield call(dbManager.deleteObjectById, RealmSchema.UAI, uaiTypeBased.id);
        } else {
          const updateData = { lastActioned: new Date() };
          yield call(dbManager.updateObjectById, RealmSchema.UAI, uaiTypeBased.id, updateData);
          yield put(updateUaiActionMap(uaiTypeBased.id));
        }
      }
    }
    // Handle action based on uaiId
    if (uaiId) {
      if (action) {
        yield call(dbManager.deleteObjectById, RealmSchema.UAI, uaiId);
      } else {
        const updateData = { lastActioned: new Date() };
        yield call(dbManager.updateObjectById, RealmSchema.UAI, uaiId, updateData);
        yield put(updateUaiActionMap(uaiId));
      }
    }

    yield put(setRefreshUai());
  } catch (err) {
    console.log(err);
  }
}

function* uaiChecksWorker({ payload }) {
  const { checkForTypes } = payload;
  try {
    if (checkForTypes.includes(uaiType.SECURE_VAULT)) {
      const vault: Vault = dbManager.getCollection(RealmSchema.Vault)[0];
      const secureVaultUai: UAI = dbManager.getObjectByField(
        RealmSchema.UAI,
        uaiType.SECURE_VAULT,
        'uaiType'
      )[0];

      if (!vault && !secureVaultUai) {
        yield put(
          addToUaiStack({
            uaiType: uaiType.SECURE_VAULT,
          })
        );
      }
      if (vault && secureVaultUai) {
        yield put(uaiActioned({ uaiId: secureVaultUai.id, action: true }));
      }
    }
    if (checkForTypes.includes(uaiType.VAULT_TRANSFER)) {
      const wallets: Wallet[] = yield call(dbManager.getCollection, RealmSchema.Wallet);
      const uaiCollectionVaultTransfer: UAI[] = dbManager.getObjectByField(
        RealmSchema.UAI,
        uaiType.VAULT_TRANSFER,
        'uaiType'
      );
      for (const wallet of wallets) {
        const uai = uaiCollectionVaultTransfer.find((uai) => uai.entityId === wallet.id);
        if (
          wallet.entityKind === EntityKind.WALLET &&
          wallet?.transferPolicy?.threshold > 0 &&
          wallet.specs.balances.confirmed + (isTestnet() ? wallet.specs.balances.unconfirmed : 0) >=
            Number(wallet?.transferPolicy?.threshold)
        ) {
          if (!uai) {
            yield put(
              addToUaiStack({
                uaiType: uaiType.VAULT_TRANSFER,
                entityId: wallet.id,
                uaiDetails: {
                  body: `Transfer fund to vault from ${wallet.presentationData.name}`,
                },
              })
            );
          }
        } else {
          if (uai) {
            yield put(uaiActioned({ entityId: uai.entityId, action: true }));
          }
        }
      }
    }
    if (checkForTypes.includes(uaiType.SIGNING_DEVICES_HEALTH_CHECK)) {
      // check for each signer if health check uai is needed
      const signers: Signer[] = dbManager
        .getCollection(RealmSchema.Signer)
        .filter((signer) => !signer.hidden && signer.type !== SignerType.MY_KEEPER);
      if (signers.length > 0) {
        for (const signer of signers) {
          const lastHealthCheck = isTestnet()
            ? healthCheckReminderHours(signer.lastHealthCheck)
            : healthCheckReminderDays(signer.lastHealthCheck);

          if (lastHealthCheck >= healthCheckReminderThreshold) {
            const uaiCollection: UAI[] = dbManager.getObjectByField(
              RealmSchema.UAI,
              signer.masterFingerprint,
              'entityId'
            );
            const uaiHCforSD = uaiCollection?.filter(
              (uai) => uai.uaiType === uaiType.SIGNING_DEVICES_HEALTH_CHECK
            );
            if (!uaiHCforSD || uaiHCforSD.length === 0) {
              yield put(
                addToUaiStack({
                  uaiType: uaiType.SIGNING_DEVICES_HEALTH_CHECK,
                  entityId: signer.masterFingerprint,
                  uaiDetails: {
                    // body: `Health check for ${signer.signerName} is due`,
                    body: !signer.isBIP85
                      ? `Health check for ${signer.signerName} is due`
                      : `Health check for ${signer.signerName} + is due`,
                  },
                })
              );
            }
            yield put(setRefreshUai());
          }
        }
      }

      // check for exixsisting UAIs of type HC if the signer was recently actioned
      const uaiCollectionHC: UAI[] = dbManager.getObjectByField(
        RealmSchema.UAI,
        uaiType.SIGNING_DEVICES_HEALTH_CHECK,
        'uaiType'
      );

      if (uaiCollectionHC.length > 0) {
        for (const uai of uaiCollectionHC) {
          const signer: Signer = dbManager.getObjectByPrimaryId(
            RealmSchema.Signer,
            'masterFingerprint',
            uai.entityId
          );

          if (signer) {
            const lastHealthCheck = isTestnet()
              ? healthCheckReminderHours(signer.lastHealthCheck)
              : healthCheckReminderDays(signer.lastHealthCheck);
            if (
              lastHealthCheck < healthCheckReminderThreshold ||
              signer.hidden ||
              signer.type === SignerType.MY_KEEPER
            ) {
              yield put(uaiActioned({ uaiId: uai.id, action: true }));
            }
          } //no signer for the UAI that alreay exisists
          else {
            yield put(uaiActioned({ uaiId: uai.id, action: true }));
          }
        }
      }
    }
    if (checkForTypes.includes(uaiType.RECOVERY_PHRASE_HEALTH_CHECK)) {
      const backupHistory: BackupHistory = dbManager.getCollection(RealmSchema.BackupHistory);
      const confirmedBackups = backupHistory.filter((item) => item.confirmed);

      let shouldAddToUaiStack = false;
      if (confirmedBackups.length > 0) {
        const lastConfirmBackup = confirmedBackups.sort((a, b) => b.date - a.date)[0];
        const latestConfirmedBackupDate = new Date(lastConfirmBackup.date * 1000);
        const lastHealthCheck = isTestnet()
          ? healthCheckReminderHours(latestConfirmedBackupDate)
          : healthCheckReminderDays(latestConfirmedBackupDate);

        shouldAddToUaiStack = lastHealthCheck >= healthCheckReminderThreshold;
        if (lastHealthCheck < healthCheckReminderThreshold) {
          const uaiRecoveryPhraseHC: UAI[] = dbManager.getObjectByField(
            RealmSchema.UAI,
            uaiType.RECOVERY_PHRASE_HEALTH_CHECK,
            'uaiType'
          );
          if (uaiRecoveryPhraseHC) {
            yield put(uaiActioned({ uaiId: uaiRecoveryPhraseHC[0].id, action: true }));
          }
        }
      } else {
        shouldAddToUaiStack = true; // If no confirmed backups, we should add to UAI stack.
      }

      // Check to add to UAI stack only if needed.
      if (shouldAddToUaiStack) {
        const uaiCollection: UAI[] = dbManager.getObjectByField(
          RealmSchema.UAI,
          uaiType.RECOVERY_PHRASE_HEALTH_CHECK,
          'uaiType'
        );

        if (!uaiCollection || uaiCollection.length === 0) {
          yield put(
            addToUaiStack({
              uaiType: uaiType.RECOVERY_PHRASE_HEALTH_CHECK,
            })
          );
        }
      }

      yield put(setRefreshUai());
    }
    if (checkForTypes.includes(uaiType.FEE_INISGHT)) {
      const uaiCollectionHC: UAI[] = dbManager.getObjectByField(
        RealmSchema.UAI,
        uaiType.FEE_INISGHT,
        'uaiType'
      );
      if (uaiCollectionHC.length > 0) {
        for (const uai of uaiCollectionHC) {
          dbManager.deleteObjectById(RealmSchema.UAI, uai.id);
        }
      }
      const graphData = yield select(oneDayInsightSelector);
      const statement = generateFeeStatement(graphData);
      if (statement) {
        yield put(
          addToUaiStack({
            uaiType: uaiType.FEE_INISGHT,
            uaiDetails: {
              heading: 'Fee Insight',
              body: statement,
            },
          })
        );
        yield put(setRefreshUai());
      }
    }
    if (checkForTypes.includes(uaiType.DEFAULT)) {
      const defaultUAI: UAI = dbManager.getObjectByField(
        RealmSchema.UAI,
        uaiType.DEFAULT,
        'uaiType'
      )[0];

      if (!defaultUAI) {
        yield put(
          addToUaiStack({
            uaiType: uaiType.DEFAULT,
          })
        );
      }
    }
    if (checkForTypes.includes(uaiType.CANARAY_WALLET)) {
      //TO-DO
      //fetch all canary vaults
      const vaults: Vault[] = yield call(dbManager.getCollection, RealmSchema.Vault);
      const canaryWallets = vaults.filter((vault) => vault.type === VaultType.CANARY);

      const uaiCollectionCanaryWallet: UAI[] = dbManager.getObjectByField(
        RealmSchema.UAI,
        uaiType.CANARAY_WALLET,
        'uaiType'
      );

      const canaryBalanceCache = yield select((state) => state.uai.canaryBalanceCache);
      for (const wallet of canaryWallets) {
        const uaiForCanaryWallet = uaiCollectionCanaryWallet?.find(
          (uai) => uai.entityId === wallet.id
        );
        const currentTotalBalance =
          wallet.specs.balances.unconfirmed + wallet.specs.balances.confirmed;
        const cachedBalance = canaryBalanceCache?.[wallet.id];
        if (cachedBalance && currentTotalBalance < cachedBalance) {
          if (!uaiForCanaryWallet) {
            yield put(
              addToUaiStack({
                uaiType: uaiType.CANARAY_WALLET,
                entityId: wallet.id,
                uaiDetails: {
                  body: `Canary Vault  from ${wallet.presentationData.name}`,
                },
              })
            );
          }
          yield put(updateCanaryBalanceCache({ id: wallet.id, balance: currentTotalBalance }));
        } else {
          yield put(updateCanaryBalanceCache({ id: wallet.id, balance: currentTotalBalance }));
        }
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    const UAIs: UAI = dbManager.getCollection(RealmSchema.UAI);
    yield put(createUaiMap(UAIs));
  }
}

export const uaiChecksWatcher = createWatcher(uaiChecksWorker, UAI_CHECKS);
export const addUaiStackWatcher = createWatcher(addToUaiStackWorker, ADD_TO_UAI_STACK);
export const uaiActionedWatcher = createWatcher(uaiActionedWorker, UAI_ACTIONED);
