import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { ADD_TO_UAI_STACK, UPADTE_UAI_STACK } from '../sagaActions/uai';
import { createWatcher } from '../utilities';
import { call } from 'redux-saga/effects';

function* addToUaiStackWorker({ payload }) {
  const { uai } = payload;
  try {
    yield call(dbManager.createObject, RealmSchema.UAI, uai);
  } catch (err) {
    console.error('Db add failed', err);
  }
}

function* updateUaiStackWorker({ payload }) {
  const { uai } = payload;
  yield call(dbManager.updateObjectById, RealmSchema.UAI, uai.id, uai);
}

export const addUaiStackWatcher = createWatcher(addToUaiStackWorker, ADD_TO_UAI_STACK);
export const updateUaiStackWatcher = createWatcher(updateUaiStackWorker, UPADTE_UAI_STACK);
