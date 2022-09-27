import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import {
  addToUaiStack,
  ADD_TO_UAI_STACK,
  UAI_ACTIONED_ENTITY,
  UAI_CHECKS,
  UPADTE_UAI_STACK,
} from '../sagaActions/uai';
import { createWatcher } from '../utilities';
import { all, call, put } from 'redux-saga/effects';
import { UAI, uaiType } from 'src/common/data/models/interfaces/Uai';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';

const healthCheckRemider = (signer: VaultSigner) => {
  var today = new Date();
  var Difference_In_Time = today.getTime() - signer.lastHealthCheck.getTime();
  var Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));
  console.log(Difference_In_Days);
  return Difference_In_Days;
};

function* addToUaiStackWorker({ payload }) {
  const { uai } = payload;
  let uaiData = { ...uai, timeStamp: new Date() };
  try {
    yield call(dbManager.createObject, RealmSchema.UAI, uaiData);
  } catch (err) {
    console.error('Db add failed', err);
  }
}

function* updateUaiStackWorker({ payload }) {
  const { uai } = payload;
  yield call(dbManager.updateObjectById, RealmSchema.UAI, uai.id, uai);
}

function* uaiChecksWorker({ payload }) {
  const { isFirstLogin } = payload;
  const vaults = yield call(dbManager.getObjectByIndex, RealmSchema.Vault, 0, true);

  for (var vault of vaults) {
    for (var signer of vault.signers) {
      const lastHealthCheckDays = healthCheckRemider(signer);
      if (lastHealthCheckDays >= 1) {
        const uais = dbManager.getObjectByField(RealmSchema.UAI, signer.signerId, 'entityId');
        if (!uais.length) {
          yield put(
            addToUaiStack(
              `Health Check for ${signer.signerName} is due`,
              false,
              uaiType.SIGNING_DEVICES_HEALTH_CHECK,
              100,
              null,
              signer.signerId
            )
          );
        } else {
          const uai = uais[0];
          let updatedUai: UAI = JSON.parse(JSON.stringify(uai)); //Need to get a better way
          updatedUai = { ...updatedUai, isActioned: false };
          yield call(dbManager.updateObjectById, RealmSchema.UAI, updatedUai.id, updatedUai);
        }
      }
    }
  }
}

function* uaiActionedEntityWorker({ payload }) {
  const { entityId } = payload;
  const uais = yield call(dbManager.getObjectByField, RealmSchema.UAI, entityId, 'entityId');
  if (uais.length > 0) {
    const uai = uais[0];
    let updatedUai: UAI = JSON.parse(JSON.stringify(uai)); //Need to get a better way
    updatedUai = { ...updatedUai, isActioned: true };
    yield call(dbManager.updateObjectById, RealmSchema.UAI, uai.id, updatedUai);
  }
}

export const uaiChecksWatcher = createWatcher(uaiChecksWorker, UAI_CHECKS);
export const addUaiStackWatcher = createWatcher(addToUaiStackWorker, ADD_TO_UAI_STACK);
export const updateUaiStackWatcher = createWatcher(updateUaiStackWorker, UPADTE_UAI_STACK);
export const uaiActionedEntityWatcher = createWatcher(uaiActionedEntityWorker, UAI_ACTIONED_ENTITY);
