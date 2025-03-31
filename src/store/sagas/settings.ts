import { call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import { setBitcoinNetwork } from '../reducers/settings';
import { CHANGE_BITCOIN_NETWORK } from '../sagaActions/settings';
import Node from 'src/services/electrum/node';
import { fetchFeeRates } from '../sagaActions/send_and_receive';
import { NetworkType } from 'src/services/wallets/enums';
import {
  predefinedMainnetNodes,
  predefinedTestnetNodes,
} from 'src/services/electrum/predefinedNodes';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { RootState } from '../store';
import ElectrumClient from 'src/services/electrum/client';

function* changeBitcoinNetworkWorker({ payload }) {
  let activeNode;
  try {
    const { network } = payload;
    try {
      activeNode = Node.getAllNodes().find((node) => node.isConnected);
    } catch (error) {}

    yield put(setBitcoinNetwork(network));
    yield put(fetchFeeRates());
    if (activeNode) {
      yield call(Node.disconnect, activeNode);
    }
    const bitcoinNetworkType = yield select(
      (state: RootState) => state.settings.bitcoinNetworkType
    );

    // Add default nodes if not exists and connect
    if (
      !Node.getAllNodes().filter((node) =>
        bitcoinNetworkType === NetworkType.TESTNET
          ? node.host.includes('testnet')
          : !node.host.includes('testnet')
      ).length
    )
      yield call(
        dbManager.createObjectBulk,
        RealmSchema.NodeConnect,
        network === NetworkType.TESTNET ? predefinedTestnetNodes : predefinedMainnetNodes
      );

    ElectrumClient.setActivePeer(
      Node.getAllNodes().filter((node) =>
        bitcoinNetworkType === NetworkType.TESTNET
          ? node.host.includes('testnet')
          : !node.host.includes('testnet')
      )
    );
    yield call(ElectrumClient.connect);
  } catch (error) {
    console.log('🚀 ~ function*changeBitcoinNetworkWorker ~ error:', error);
  }
}

export const changeBitcoinNetworkWatcher = createWatcher(
  changeBitcoinNetworkWorker,
  CHANGE_BITCOIN_NETWORK
);
