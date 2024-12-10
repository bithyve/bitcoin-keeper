import { call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import { GO_TO_CONCEIERGE, LOAD_CONCIERGE_USER, OPEN_CONCEIERGE } from '../sagaActions/concierge';
import * as Zendesk from 'react-native-zendesk-messaging';
import { Linking, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';
import { RootState } from '../store';
import {
  setConciergTags,
  showOnboarding,
  loadConciergeUser,
  conciergeUser,
  setConciergeLoading,
  setConciergeUserSuccess,
  setConciergeUserFailed,
} from '../reducers/concierge';
import { setDontShowConceirgeOnboarding } from '../reducers/storage';
import { hash256 } from 'src/utils/service-utilities/encryption';
import ZendeskClass from 'src/services/backend/Zendesk';

function* goToConceirge({
  payload,
}: {
  payload: {
    tags: string[];
    screenName: string;
  };
}) {
  const { tags, screenName } = payload;
  const { dontShowConceirgeOnboarding } = yield select((state: RootState) => state.storage);
  yield put(setConciergTags([screenName, ...tags].filter((str) => str !== '')));
  if (dontShowConceirgeOnboarding) {
    yield call(openConceirge, { payload: { dontShow: dontShowConceirgeOnboarding } });
  } else {
    yield put(showOnboarding());
  }
}

export const goToConceirgeWatcher = createWatcher(goToConceirge, GO_TO_CONCEIERGE);

function* openConceirge({
  payload,
}: {
  payload: {
    dontShow: boolean;
  };
}) {
  const { dontShow } = payload;
  if (dontShow) yield put(setDontShowConceirgeOnboarding());
  const res = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
  if (!res?.publicId || !res?.subscription) {
    Linking.openURL('https://help.bitcoinkeeper.app/hc/en-us');
    return;
  }
  const { publicId, subscription }: KeeperApp = res;
  const { tags } = yield select((state: RootState) => state.concierge);
  const versionHistory = yield call(dbManager.getObjectByIndex, RealmSchema.VersionHistory);
  yield call(Zendesk.clearConversationFields);
  yield call(Zendesk.clearConversationTags);
  yield call(Zendesk.setConversationTags, [
    `${Platform.OS}-${DeviceInfo.getSystemVersion()}`,
    DeviceInfo.getVersion(),
    `${DeviceInfo.getBrand()}-${DeviceInfo.getModel()}`,
    ...tags,
  ]);
  yield call(Zendesk.setConversationFields, {
    '18084979872925': publicId,
    '18087575177885': subscription.name.toUpperCase(),
    '18087673246237': DeviceInfo.getVersion(),
    '18088921954333': JSON.stringify(versionHistory),
  });
  yield call(Zendesk.openMessagingView);
}

function* loadConciergeUserWorker() {
  try {
    const { primaryMnemonic }: KeeperApp = yield call(
      dbManager.getObjectByIndex,
      RealmSchema.KeeperApp
    );
    let userExternalId = yield call(hash256, primaryMnemonic);
    userExternalId = userExternalId.toString().substring(0, 24);
    yield put(setConciergeLoading(true));
    const res = yield call(ZendeskClass.fetchZendeskUser, userExternalId);
    if (res.status === 200 && res.data.users.length > 0) {
      // User already exists and found
      const data: conciergeUser = {
        id: res.data.users[0].id,
        name: res.data.users[0].name,
        userExternalId: res.data.users[0].external_id,
      };
      yield put(loadConciergeUser(data));
      yield put(setConciergeLoading(false));
      yield put(setConciergeUserSuccess(true));
    } else {
      // user not exists, create new
      const userRes = yield call(ZendeskClass.createZendeskUser, userExternalId);
      if (userRes.status === 201) {
        const data = {
          id: userRes.data.user.id,
          name: userRes.data.user.name,
          userExternalId: userRes.data.user.external_id,
        };
        yield put(loadConciergeUser(data));
        yield put(setConciergeLoading(false));
        yield put(setConciergeUserSuccess(true));
      } else {
        yield put(setConciergeLoading(false));
        yield put(setConciergeUserFailed(true));
      }
    }
  } catch (error) {
    console.log('🚀 ~ function*loadConciergeUserWorker ~ error:', error);
    yield put(setConciergeUserFailed(true));
    yield put(setConciergeLoading(false));
  }
}

export const openConceirgeWatcher = createWatcher(openConceirge, OPEN_CONCEIERGE);
export const loadConciergeUserWatcher = createWatcher(loadConciergeUserWorker, LOAD_CONCIERGE_USER);
