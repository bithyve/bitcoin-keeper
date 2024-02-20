import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { call, put } from 'redux-saga/effects';
import { UAI, uaiType } from 'src/models/interfaces/Uai';
import { Vault, VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { v4 as uuidv4 } from 'uuid';

import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { SUBSCRIPTION_SCHEME_MAP } from 'src/hooks/usePlan';
import { isTestnet } from 'src/constants/Bitcoin';
import { EntityKind, VaultType } from 'src/core/wallets/enums';
import { setRefreshUai, updateUaiActionMap } from '../reducers/uai';
import {
  addToUaiStack,
  ADD_TO_UAI_STACK,
  uaiActioned,
  uaiActionedEntity,
  UAI_ACTIONED,
  UAI_ACTIONED_ENTITY,
  UAI_CHECKS,
} from '../sagaActions/uai';
import { createWatcher } from '../utilities';

const healthCheckRemider = (signer: VaultSigner) => {
  const today = new Date();
  const Difference_In_Time = today.getTime() - signer.lastHealthCheck.getTime();
  const Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));
  return Difference_In_Days;
};

const healthCheckReminderHours = (signer: VaultSigner) => {
  const today = new Date();
  const differenceInTime = today.getTime() - signer.lastHealthCheck.getTime();
  const differenceInHours = Math.round(differenceInTime / (1000 * 3600));
  return differenceInHours;
};

function* addToUaiStackWorker({ payload }) {
  const { entityId, uaiType } = payload;
  const uai: UAI = {
    id: uuidv4(),
    entityId,
    uaiType,
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
  const vault: Vault = dbManager
    .getCollection(RealmSchema.Vault)
    .filter((vault: Vault) => !vault.archived && vault.type !== VaultType.COLLABORATIVE)[0];
  try {
    if (checkForTypes.includes(uaiType.SIGNING_DEVICES_HEALTH_CHECK)) {
      if (vault) {
        for (const signer of vault.signers) {
          const lastHealthCheckDays = healthCheckRemider(signer);
          const lastHealthCheckHours = healthCheckReminderHours(signer);
          const testnet = isTestnet();
          if (testnet ? lastHealthCheckHours >= 3 : lastHealthCheckDays >= 180) {
            const uais = dbManager.getObjectByField(RealmSchema.UAI, signer.signerId, 'entityId');
            if (!uais.length) {
              yield put(
                addToUaiStack({
                  uaiType: uaiType.SIGNING_DEVICES_HEALTH_CHECK,
                  entityId: signer.signerId,
                  uaiDetails: {
                    body: `Health check for ${signer.signerName} is due`,
                  },
                })
              );
            } else {
              const uai = uais[0];
              let updatedUai: UAI = JSON.parse(JSON.stringify(uai)); // Need to get a better way
              updatedUai = { ...updatedUai, isActioned: false };
              yield call(dbManager.updateObjectById, RealmSchema.UAI, updatedUai.id, updatedUai);
            }
            yield put(setRefreshUai());
          }
        }
      }
    }

    if (checkForTypes.includes(uaiType.SECURE_VAULT)) {
      const secureVaultUai = dbManager.getObjectByField(
        RealmSchema.UAI,
        uaiType.SECURE_VAULT,
        'uaiType'
      )[0];

      if (!secureVaultUai) {
        yield put(
          addToUaiStack({
            uaiType: uaiType.SECURE_VAULT,
          })
        );
      }
      if (vault && secureVaultUai) {
        yield put(uaiActioned(secureVaultUai.id));
      }
    }

    if (checkForTypes.includes(uaiType.VAULT_TRANSFER)) {
      const wallets: Wallet[] = yield call(
        dbManager.getObjectByIndex,
        RealmSchema.Wallet,
        null,
        true
      );
      if (vault) {
        for (const wallet of wallets) {
          const uai = dbManager.getObjectByField(RealmSchema.UAI, wallet.id, 'entityId')[0];
          if (
            wallet.entityKind === EntityKind.WALLET &&
            wallet.specs.balances.confirmed >= Number(wallet?.transferPolicy?.threshold)
          ) {
            if (uai) {
              if (wallet.specs.balances.confirmed >= Number(wallet?.transferPolicy?.threshold)) {
                yield put(uaiActionedEntity(uai.entityId, false));
              }
            } else {
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
          } else if (uai) {
            yield put(uaiActionedEntity(uai.entityId, true));
          }
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}

function* uaiActionedEntityWorker({ payload }) {
  const { entityId, action } = payload;
  const uai: UAI | any = dbManager.getObjectByField(RealmSchema.UAI, entityId, 'entityId')[0];
  if (uai) {
    yield call(dbManager.updateObjectById, RealmSchema.UAI, uai.id, { isActioned: action });
    yield put(setRefreshUai());
  }
}

export const uaiChecksWatcher = createWatcher(uaiChecksWorker, UAI_CHECKS);
export const addUaiStackWatcher = createWatcher(addToUaiStackWorker, ADD_TO_UAI_STACK);
export const uaiActionedWatcher = createWatcher(uaiActionedWorker, UAI_ACTIONED);
export const uaiActionedEntityWatcher = createWatcher(uaiActionedEntityWorker, UAI_ACTIONED_ENTITY);
