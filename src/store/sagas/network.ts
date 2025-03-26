import { call, put, select } from 'redux-saga/effects';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { NetworkType } from 'src/services/wallets/enums';
import {
  predefinedMainnetNodes,
  predefinedTestnetNodes,
} from 'src/services/electrum/predefinedNodes';
import ElectrumClient from 'src/services/electrum/client';
import { captureError } from 'src/services/sentry';
import { setInitialNodesSaved } from '../reducers/network';
import { RootState } from '../store';
import {
  electrumClientConnectionExecuted,
  electrumClientConnectionInitiated,
} from '../reducers/login';
import { createWatcher } from '../utilities';
import { fetchFeeRates } from '../sagaActions/send_and_receive';
import { CONNECT_TO_NODE } from '../sagaActions/network';

export function* connectToNodeWorker() {
  try {
    const { bitcoinNetworkType } = yield select((state: RootState) => state.settings);
    console.log('Connecting to node...');
    yield put(electrumClientConnectionInitiated());

    const areInitialNodesSaved = yield select(
      (state: RootState) => state.network.initialNodesSaved
    );

    if (!areInitialNodesSaved) {
      const currentNodes = yield call(dbManager.getCollection, RealmSchema.NodeConnect);
      const defaultNodes = yield call(dbManager.getCollection, RealmSchema.DefaultNodeConnect);
      let addInitialNode = defaultNodes && defaultNodes.length != 0;
      if (!addInitialNode && currentNodes.length == 0) {
        addInitialNode = true;
      }

      if (addInitialNode) {
        const hardcodedInitialNodes =
          bitcoinNetworkType === NetworkType.TESTNET
            ? predefinedTestnetNodes
            : predefinedMainnetNodes;
        dbManager.createObjectBulk(RealmSchema.NodeConnect, hardcodedInitialNodes);
      }

      yield put(setInitialNodesSaved(true));
    }

    const nodes = yield call(dbManager.getCollection, RealmSchema.NodeConnect);
    ElectrumClient.setActivePeer(nodes);
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
