import { call, put } from 'redux-saga/effects';
import { GET_ADVISORS } from '../sagaActions/advisor';
import { createWatcher } from '../utilities';
import Relay from 'src/services/backend/Relay';
import { setAdvisors } from '../reducers/advisor';

export function* getAdvisorWorker({ callback }) {
  try {
    let res = yield call(Relay.getAdvisors);
    if (res.length) {
      yield put(setAdvisors(res));
      if (callback) {
        callback({ status: true });
      }
    } else {
      if (callback) {
        callback({ status: false, error: 'No advisors found' });
      }
    }
  } catch (error) {
    console.log('🚀 ~ getAdvisorWorker ~ error:', error);
    if (callback) {
      callback({ status: false, error: error.message || 'Something went wrong' });
    }
  }
}

export const getAdvisorWatcher = createWatcher(getAdvisorWorker, GET_ADVISORS);
