import { call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import { setBitcoinNetwork } from '../reducers/settings';
import { CHANGE_BITCOIN_NETWORK } from '../sagaActions/settings';
import Node from 'src/services/electrum/node';
import { fetchFeeRates } from '../sagaActions/send_and_receive';
import { DerivationPurpose, NetworkType, SignerType, WalletType } from 'src/services/wallets/enums';
import {
  predefinedMainnetNodes,
  predefinedTestnetNodes,
} from 'src/services/electrum/predefinedNodes';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { RootState } from '../store';
import ElectrumClient from 'src/services/electrum/client';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config, { APP_STAGE } from 'src/utils/service-utilities/config';
import { Signer } from 'src/services/wallets/interfaces/vault';
import { getCosignerDetails } from 'src/services/wallets/factories/WalletFactory';
import { setupKeeperSigner } from 'src/hardware/signerSetup';
import { addSigningDevice } from '../sagaActions/vaults';
import { addNewWalletsWorker, NewWalletInfo } from './wallets';
import { setSecondaryNetworkWalletCreated } from '../reducers/storage';

function* changeBitcoinNetworkWorker({ payload }) {
  let activeNode;
  const { network, callback } = payload;
  try {
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

    // Create default wallet and signer if not created already
    const { secondaryNetworkWalletCreated } = yield select((state: RootState) => state.storage);
    const needToCreateWallet =
      config.ENVIRONMENT === APP_STAGE.DEVELOPMENT
        ? bitcoinNetworkType === NetworkType.MAINNET
        : bitcoinNetworkType === NetworkType.TESTNET;
    if (!secondaryNetworkWalletCreated && needToCreateWallet) {
      const signers: Signer[] = yield call(dbManager.getCollection, RealmSchema.Signer);
      const myAppKeys = signers.filter(
        (signer) =>
          signer.type === SignerType.MY_KEEPER &&
          !signer.archived &&
          signer.networkType === bitcoinNetworkType
      );
      const instanceNumberToSet = WalletUtilities.getInstanceNumberForSigners(myAppKeys);
      const { primaryMnemonic } = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
      const cosigner = yield call(getCosignerDetails, primaryMnemonic, instanceNumberToSet);
      const hw = setupKeeperSigner(cosigner);
      if (hw) {
        yield put(addSigningDevice([hw.signer]));
      }
      const defaultWallet: NewWalletInfo = {
        walletType: WalletType.DEFAULT,
        walletDetails: {
          name: 'Mobile Wallet',
          description: '',
          instanceNum: instanceNumberToSet,
          derivationConfig: {
            path: WalletUtilities.getDerivationPath(
              false,
              bitcoinNetworkType,
              0,
              DerivationPurpose.BIP84
            ),
            purpose: DerivationPurpose.BIP84,
          },
        },
      };
      yield call(addNewWalletsWorker, { payload: [defaultWallet] });
      yield put(setSecondaryNetworkWalletCreated(true));
    }
    if (callback) callback(true);
  } catch (error) {
    console.log('🚀 ~changeBitcoinNetworkWorker ~ error:', error);
    if (callback) callback(false);
  }
}

export const changeBitcoinNetworkWatcher = createWatcher(
  changeBitcoinNetworkWorker,
  CHANGE_BITCOIN_NETWORK
);
