import { call, put, select } from 'redux-saga/effects';
import Relay from 'src/services/backend/Relay';
import { RootState } from '../store';
import { setFcmToken } from '../reducers/notifications';
import { UPDATE_FCM_TOKENS } from '../sagaActions/notifications';
import { createWatcher } from '../utilities';

function* updateFCMTokensWorker({ payload }) {
  try {
    const { FCMs } = payload;
    if (FCMs.length === 0) {
      throw new Error('No FCM token found');
    }
    const appId = yield select((state: RootState) => state.storage.appId);
    const { updated } = yield call(Relay.updateFCMTokens, appId, FCMs);
    if (updated) {
      yield put(setFcmToken(FCMs[0]));
    } else {
      console.log('Failed to update FCMs on the server');
    }
  } catch (err) {
    console.log('Error when updating FCMs', err);
  }
}

export const updateFCMTokensWatcher = createWatcher(updateFCMTokensWorker, UPDATE_FCM_TOKENS);
