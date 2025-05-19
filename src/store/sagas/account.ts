import { call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';

import { RootState } from '../store';
import { loadConciergeTickets, loadConciergeUser } from '../reducers/concierge';
import { LOAD_CONCIERGE_USER_ON_LOGIN, SAVE_BACKUP_METHOD_BY_APP_ID } from '../sagaActions/account';
import { addConciergeUserToAccount, updateBackupMethodByAppId } from '../reducers/account';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';

function* loadConciergeUserOnLoginWorker({ payload }) {
  try {
    const { conciergeUsers } = yield select((state: RootState) => state.account);
    if (!Object.keys(conciergeUsers).length) {
      // Only primary account exists | need to save its value
      let { conciergeUser } = yield select((state: RootState) => state.concierge);
      conciergeUser = conciergeUser ? JSON.stringify(conciergeUser) : null;
      yield put(addConciergeUserToAccount({ appId: payload.appId, conciergeUser }));
    } else {
      const existingConciergeUser = conciergeUsers[payload.appId]
        ? JSON.parse(conciergeUsers[payload.appId])
        : null;
      yield put(loadConciergeUser(existingConciergeUser));
      yield put(loadConciergeTickets([]));
    }
  } catch (error) {
    console.log('🚀 ~ function*loadConciergeUserOnLoginWorker ~ error:', error);
  }
}

function* saveBackupMethodByAppIdWorker() {
  try {
    const { backupMethod } = yield select((state: RootState) => state.bhr);
    const { id: appId } = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    yield put(updateBackupMethodByAppId({ appId, backupMethod }));
  } catch (error) {
    console.log('🚀 ~ function*saveBackupMethodByAppIdWorker ~ error:', error);
  }
}

export const loadConciergeUserOnLoginWatcher = createWatcher(
  loadConciergeUserOnLoginWorker,
  LOAD_CONCIERGE_USER_ON_LOGIN
);

export const saveBackupMethodByAppIdWatcher = createWatcher(
  saveBackupMethodByAppIdWorker,
  SAVE_BACKUP_METHOD_BY_APP_ID
);
