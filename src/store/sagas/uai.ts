import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { realmConfig } from 'src/storage/realm/RealmProvider';
import { ADD_TO_UAI_STACK, UPADTE_UAI_STACK } from '../actions/uai';
import { createWatcher } from '../utilities';
import { call } from 'redux-saga/effects';

//Temp to test, will be removed
export const updateRealm = async (schema: string, object: any) => {
  const realm = await Realm.open(realmConfig);
  if (realm) {
    realm.write(() => {
      realm.create(schema, object);
    });
  }
};

function* addToUaiStackWorker({ payload }) {
  const { uai } = payload;
  try {
    console.log('uai to db', uai);
    yield call(dbManager.initializeRealm, Buffer.from('random'));
    yield call(dbManager.createObject, RealmSchema.UAI, uai);
    // dbManager.createObject(RealmSchema.UAI, uai);
  } catch (err) {
    console.error('Db add failed', err);
  }
  // updateRealm(RealmSchema.UAI, uai);
}

//WIP
function* updateUaiStackWorker({ payload }) {
  const { uai } = payload;
  console.log('uai to update', uai);
  yield call(dbManager.initializeRealm, Buffer.from('random'));
  yield call(dbManager.updateObjectById, RealmSchema.UAI, uai.id, uai);
}

export const addUaiStackWatcher = createWatcher(addToUaiStackWorker, ADD_TO_UAI_STACK);
export const updateUaiStackWatcher = createWatcher(updateUaiStackWorker, UPADTE_UAI_STACK);
