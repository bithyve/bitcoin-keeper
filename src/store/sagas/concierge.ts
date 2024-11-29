import { call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import { GO_TO_CONCEIERGE, OPEN_CONCEIERGE } from '../sagaActions/concierge';
import * as Zendesk from 'react-native-zendesk-messaging';
import { Linking, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';
import { RootState } from '../store';
import { setConciergTags, showOnboarding } from '../reducers/concierge';
import { setDontShowConceirgeOnboarding } from '../reducers/storage';

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

export const openConceirgeWatcher = createWatcher(openConceirge, OPEN_CONCEIERGE);
