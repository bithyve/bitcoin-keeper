import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { call, put } from 'redux-saga/effects';
import { UAI, uaiType } from 'src/models/interfaces/Uai';
import { Signer, Vault } from 'src/core/wallets/interfaces/vault';
import { v4 as uuidv4 } from 'uuid';

import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { isTestnet } from 'src/constants/Bitcoin';
import { EntityKind } from 'src/core/wallets/enums';
import { createUaiMap, setRefreshUai, updateUaiActionMap } from '../reducers/uai';
import {
  addToUaiStack,
  ADD_TO_UAI_STACK,
  uaiActioned,
  UAI_ACTIONED,
  UAI_CHECKS,
} from '../sagaActions/uai';
import { createWatcher } from '../utilities';
import { BackupHistory } from 'src/models/enums/BHR';
const HEALTH_CHECK_REMINDER_MAINNET = 180; // 180 days
const HEALTH_CHECK_REMINDER_TESTNET = 3; // 3hours

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
    const { uaiId, action } = payload;

    if (action) {
      yield call(dbManager.deleteObjectById, RealmSchema.UAI, uaiId);
    } else {
      const updateData = { lastActioned: new Date() };
      yield call(dbManager.updateObjectById, RealmSchema.UAI, uaiId, updateData);
      yield put(updateUaiActionMap(uaiId));
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
          wallet.specs.balances.confirmed >= Number(wallet?.transferPolicy?.threshold)
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
      //check for each signer if health check uai is needed
      const signers: Signer[] = dbManager.getCollection(RealmSchema.Signer);
      if (signers.length > 0) {
        for (const signer of signers) {
          const lastHealthCheck = isTestnet()
            ? healthCheckReminderHours(signer.lastHealthCheck)
            : healthCheckReminderDays(signer.lastHealthCheck);
          if (
            lastHealthCheck >=
            (isTestnet() ? HEALTH_CHECK_REMINDER_MAINNET : HEALTH_CHECK_REMINDER_TESTNET)
          ) {
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
                    body: `Health check for ${signer.signerName} is due`,
                  },
                })
              );
            }
            yield put(setRefreshUai());
          }
        }
      }

      //check for exixsisting UAIs of type HC if the signer was recently actioned
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
              lastHealthCheck <
              (isTestnet() ? HEALTH_CHECK_REMINDER_TESTNET : HEALTH_CHECK_REMINDER_MAINNET)
            ) {
              yield put(uaiActioned({ uaiId: uai.id, action: true }));
            }
          }
        }
      }
    }
    if (checkForTypes.includes(uaiType.RECOVERY_PHRASE_HEALTH_CHECK)) {
      const backupHistory: BackupHistory = dbManager.getCollection(RealmSchema.BackupHealthHistory);
      const confirmedBackups = backupHistory.filter((item) => item.confirmed);

      let shouldAddToUaiStack = false;

      if (confirmedBackups.length > 0) {
        const lastConfirmBackup = confirmedBackups.sort((a, b) => b.date - a.date)[0];
        const latestConfirmedBackupDate = new Date(lastConfirmBackup.date * 1000);
        const lastHealthCheck = isTestnet()
          ? healthCheckReminderHours(latestConfirmedBackupDate)
          : healthCheckReminderDays(latestConfirmedBackupDate);
        const healthCheckReminderThreshold = isTestnet()
          ? HEALTH_CHECK_REMINDER_MAINNET
          : HEALTH_CHECK_REMINDER_TESTNET;

        shouldAddToUaiStack = lastHealthCheck >= healthCheckReminderThreshold;
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
