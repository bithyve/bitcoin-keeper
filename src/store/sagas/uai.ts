import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { call, put } from 'redux-saga/effects';
import { UAI, uaiType } from 'src/common/data/models/interfaces/Uai';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { createWatcher } from '../utilities';
import { v4 as uuidv4 } from 'uuid';

import {
  addToUaiStack,
  ADD_TO_UAI_STACK,
  uaiActioned,
  uaiActionedEntity,
  UAI_ACTIONED,
  UAI_ACTIONED_ENTITY,
  UAI_CHECKS,
} from '../sagaActions/uai';
import { setRefreshUai } from '../reducers/uai';
import { Wallet } from 'src/core/wallets/interfaces/wallet';

const healthCheckRemider = (signer: VaultSigner) => {
  const today = new Date();
  const Difference_In_Time = today.getTime() - signer.lastHealthCheck.getTime();
  const Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));
  return Difference_In_Days;
};

function* addToUaiStackWorker({ payload }) {
  const { title, isDisplay, displayText, prirority, entityId, uaiType } = payload;
  const uai: UAI = {
    id: uuidv4(),
    title,
    isActioned: false,
    isDisplay,
    displayText,
    displayCount: 0,
    uaiType,
    prirority,
    entityId,
    timeStamp: new Date(),
  };
  try {
    yield call(dbManager.createObject, RealmSchema.UAI, uai);
    yield put(setRefreshUai());
  } catch (err) {
    console.error('Db add failed', err);
  }
}

function* uaiActionedWorker({ payload }) {
  const { uaiId } = payload;
  const uai: UAI = dbManager
    .getCollection(RealmSchema.UAI)
    .filter((uai: UAI) => uai.id === uaiId)[0];

  yield call(dbManager.updateObjectById, RealmSchema.UAI, uai.id, {
    isActioned: true,
  });
  yield put(setRefreshUai());
}

function* uaiChecksWorker({ payload }) {
  const { checkForTypes } = payload;
  const vault: Vault = dbManager
    .getCollection(RealmSchema.Vault)
    .filter((vault: Vault) => !vault.archived)[0];

  if (checkForTypes.includes(uaiType.SIGNING_DEVICES_HEALTH_CHECK)) {
    if (vault) {
      for (const signer of vault.signers) {
        const lastHealthCheckDays = healthCheckRemider(signer);
        if (lastHealthCheckDays >= 90) {
          const uais = dbManager.getObjectByField(RealmSchema.UAI, signer.signerId, 'entityId');
          if (!uais.length) {
            yield put(
              addToUaiStack({
                title: `Health check for ${signer.signerName} is due`,
                isDisplay: false,
                uaiType: uaiType.SIGNING_DEVICES_HEALTH_CHECK,
                prirority: 100,
                entityId: signer.signerId,
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
          title: 'Add a signing device to activate your vault',
          isDisplay: false,
          uaiType: uaiType.SECURE_VAULT,
          prirority: 100,
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
    for (const wallet of wallets) {
      const uai: UAI = yield call(
        dbManager.getObjectByField,
        RealmSchema.UAI,
        wallet.id,
        'entityId'
      )[0];
      if (wallet.specs.balances.confirmed >= Number(wallet.specs.transferPolicy)) {
        if (uai) {
          if (wallet.specs.balances.confirmed >= Number(wallet.specs.transferPolicy)) {
            yield put(uaiActionedEntity(uai.entityId, false));
          }
        } else {
          yield put(
            addToUaiStack({
              title: `Transfer fund to vault for ${wallet.presentationData.name}`,
              isDisplay: false,
              uaiType: uaiType.VAULT_TRANSFER,
              prirority: 80,
              entityId: wallet.id,
            })
          );
        }
      } else if (uai) yield put(uaiActionedEntity(uai.entityId, true));
    }
  }
}

function* uaiActionedEntityWorker({ payload }) {
  const { entityId, action } = payload;
  const uais = yield call(dbManager.getObjectByField, RealmSchema.UAI, entityId, 'entityId');
  if (uais.length > 0) {
    const uai = uais[0];
    yield call(dbManager.updateObjectById, RealmSchema.UAI, uai.id, { isActioned: action });
    yield put(setRefreshUai());
  }
}

export const uaiChecksWatcher = createWatcher(uaiChecksWorker, UAI_CHECKS);
export const addUaiStackWatcher = createWatcher(addToUaiStackWorker, ADD_TO_UAI_STACK);
export const uaiActionedWatcher = createWatcher(uaiActionedWorker, UAI_ACTIONED);
export const uaiActionedEntityWatcher = createWatcher(uaiActionedEntityWorker, UAI_ACTIONED_ENTITY);
