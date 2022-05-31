import { UAIModel } from 'src/storage/realm/constants';
import { updateRealm } from 'src/storage/realm/dbManager';
import { ADD_TO_UAI_STACK } from '../actions/uai';
import { createWatcher } from '../utilities';

function* addToUaiStackWorker({ payload }) {
  const { uai } = payload;
  console.log('uai to db', uai);
  updateRealm(UAIModel, uai);
}

export const addUaiStackWatcher = createWatcher(addToUaiStackWorker, ADD_TO_UAI_STACK);
