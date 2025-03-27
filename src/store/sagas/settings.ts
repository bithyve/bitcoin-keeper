import { call, put } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import { setBitcoinNetwork } from '../reducers/settings';
import { CHANGE_BITCOIN_NETWORK } from '../sagaActions/settings';
import Node from 'src/services/electrum/node';

function* changeBitcoinNetworkWorker({ payload }) {
  try {
    const { network } = payload;
    const activeNode = Node.getAllNodes().find((node) => node.isConnected);
    yield put(setBitcoinNetwork(network));
    if (activeNode) {
      yield call(Node.disconnect, activeNode);
    }
  } catch (error) {
    console.log('🚀 ~ function*changeBitcoinNetworkWorker ~ error:', error);
  }
}

export const changeBitcoinNetworkWatcher = createWatcher(
  changeBitcoinNetworkWorker,
  CHANGE_BITCOIN_NETWORK
);
