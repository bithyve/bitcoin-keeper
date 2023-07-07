import { call, put, select } from 'redux-saga/effects';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import config from 'src/core/config';
import { NetworkType } from 'src/core/wallets/enums';
import {
  predefinedMainnetNodes,
  predefinedTestnetNodes,
} from 'src/core/services/electrum/predefinedNodes';
import ElectrumClient from 'src/core/services/electrum/client';
import { captureError } from 'src/core/services/sentry';
import { setDefaultNodesSaved } from '../reducers/network';
import { RootState } from '../store';
import {
  electrumClientConnectionExecuted,
  electrumClientConnectionInitiated,
} from '../reducers/login';
import { createWatcher } from '../utilities';
import { fetchFeeRates } from '../sagaActions/send_and_receive';
import { CONNECT_TO_NODE } from '../sagaActions/network';

function* connectToNodeWorker() {
  try {
    console.log('Connecting to node...');
    yield put(electrumClientConnectionInitiated());

    const savedDefaultNodes = yield call(dbManager.getCollection, RealmSchema.DefaultNodeConnect);
    const areDefaultNodesSaved = yield select(
      (state: RootState) => state.network.defaultNodesSaved
    );

    if (!areDefaultNodesSaved && !savedDefaultNodes?.length) {
      const hardcodedDefaultNodes =
        config.NETWORK_TYPE === NetworkType.TESTNET
          ? predefinedTestnetNodes
          : predefinedMainnetNodes;
      dbManager.createObjectBulk(RealmSchema.DefaultNodeConnect, hardcodedDefaultNodes);
      yield put(setDefaultNodesSaved(true));
    }

    const privateNodes = yield call(dbManager.getCollection, RealmSchema.NodeConnect);

    ElectrumClient.setActivePeer(privateNodes);
    const { connected, connectedTo, error } = yield call(ElectrumClient.connect);
    if (connected) {
      yield put(electrumClientConnectionExecuted({ successful: connected, connectedTo }));
      yield put(fetchFeeRates());
    } else {
      yield put(electrumClientConnectionExecuted({ successful: connected, error }));
    }
  } catch (err) {
    captureError(err);
  }
}

export const connectToNodeWatcher = createWatcher(connectToNodeWorker, CONNECT_TO_NODE);
