import * as bitcoinJS from 'bitcoinjs-lib';

import axios, { AxiosInstance } from 'axios';

import DeviceInfo from 'react-native-device-info';
import PersonalNode from '../common/data/models/PersonalNode';
import { Platform } from 'react-native';
import { WalletType } from './wallets/enums';
import _ from 'lodash';
import remoteConfig from '@react-native-firebase/remote-config';

export enum BITCOIN_NETWORK {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET',
}
export enum APP_STAGE {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
}

interface ESPLORA_ENPOINTS {
  TESTNET: {
    MULTIBALANCE: string;
    MULTIUTXO: string;
    MULTITXN: string;
    MULTIBALANCETXN: string;
    NEWMULTIUTXOTXN: string;
    TXN_FEE: string;
    TXNDETAILS: string;
    BROADCAST_TX: string;
  };
  MAINNET: {
    MULTIBALANCE: string;
    MULTIUTXO: string;
    MULTITXN: string;
    MULTIBALANCETXN: string;
    NEWMULTIUTXOTXN: string;
    TXN_FEE: string;
    TXNDETAILS: string;
    BROADCAST_TX: string;
  };
}
export interface Configuration {
  ENVIRONMENT: string;
  NETWORK?: bitcoinJS.networks.Network;
  APP_STAGE: APP_STAGE;
  BITCOIN_NETWORK: string;
  TESTNET_WRAPPER: string;
  MAINNET_WRAPPER: string;
  RELAY: string;
  SIGNING_SERVER: string;
  ENC_KEY_STORAGE_IDENTIFIER: string;
  AUTH_ID: string;
  HEXA_ID: string;
  SENTRY_DNS: string;
  WALLET_INSTANCES?: {
    CHECKING: { series: number; upperBound: number };
    IMPORTED: { series: number; upperBound: number };
    SWAN: { series: number; upperBound: number };
    LIGHTNING: { series: number; upperBound: number };
    MOBILE_KEY: { series: number; upperBound: number };
  };
  REQUEST_TIMEOUT?: number;
  GAP_LIMIT?: number;
  ESPLORA_API_ENDPOINTS?: ESPLORA_ENPOINTS;
  USE_ESPLORA_FALLBACK?: boolean;
  RELAY_AXIOS?: AxiosInstance;
  SIGNING_AXIOS?: AxiosInstance;
  VAC_CHILD_INDEX?: number;
  BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH?: string;
  BITHYVE_ESPLORA_API_ENDPOINTS?: ESPLORA_ENPOINTS;
}

const DEFAULT_CONFIG = {
  ENVIRONMENT: APP_STAGE.STAGING,
  APP_STAGE: APP_STAGE.STAGING,
  BITCOIN_NETWORK: 'MAINNET',
  TESTNET_WRAPPER: 'https://test-wrapper.bithyve.com',
  MAINNET_WRAPPER: 'https://api.bithyve.com',
  RELAY: 'https://new-staging-relay.nw.r.appspot.com/',
  SIGNING_SERVER: 'https://new-staging-sign.nw.r.appspot.com/',
  ENC_KEY_STORAGE_IDENTIFIER: 'KEEPER-KEY',
  AUTH_ID: '4f989d87d711830ab0162373f59bfc9b9b2d8b194f9f1065ba45d68b516efe28',
  HEXA_ID: 'b01623f1065ba45d68b516efe2873f59bfc9b9b2d8b194f94f989d87d711830a',
  SENTRY_DNS: 'https://25289533edf7432994f58edeaf6541dc@o1388909.ingest.sentry.io/6711631',
};

let myConfig: Configuration = DEFAULT_CONFIG;

const initCofig = async ({ network }: { network: BITCOIN_NETWORK }) => {
  await remoteConfig().setDefaults(DEFAULT_CONFIG);
  await remoteConfig().fetchAndActivate();
  myConfig = JSON.parse(remoteConfig().getValue(network).asString());
  myConfig.APP_STAGE = myConfig.ENVIRONMENT
    ? APP_STAGE[myConfig.ENVIRONMENT]
    : DEFAULT_CONFIG.APP_STAGE;
  myConfig.NETWORK =
    network === BITCOIN_NETWORK.MAINNET ? bitcoinJS.networks.bitcoin : bitcoinJS.networks.testnet;
  myConfig.WALLET_INSTANCES = {
    [WalletType.CHECKING]: {
      series: 0,
      upperBound: 10,
    },
    [WalletType.IMPORTED]: {
      series: 0,
      upperBound: 10,
    },
    [WalletType.SWAN]: {
      series: 30,
      upperBound: 10,
    },
    [WalletType.LIGHTNING]: {
      series: 50,
      upperBound: 1,
    },
    [WalletType.MOBILE_KEY]: {
      series: 70,
      upperBound: 10,
    },
  };

  myConfig.REQUEST_TIMEOUT = 15000;
  myConfig.GAP_LIMIT = 5;

  myConfig.BITHYVE_ESPLORA_API_ENDPOINTS = {
    TESTNET: {
      MULTIBALANCE: myConfig.TESTNET_WRAPPER + '/balances',
      MULTIUTXO: myConfig.TESTNET_WRAPPER + '/utxos',
      MULTITXN: myConfig.TESTNET_WRAPPER + '/data',
      MULTIBALANCETXN: myConfig.TESTNET_WRAPPER + '/baltxs',
      NEWMULTIUTXOTXN: myConfig.TESTNET_WRAPPER + '/nutxotxs',
      TXN_FEE: myConfig.TESTNET_WRAPPER + '/fee-estimates',
      TXNDETAILS: myConfig.TESTNET_WRAPPER + '/tx',
      BROADCAST_TX: myConfig.TESTNET_WRAPPER + '/tx',
    },
    MAINNET: {
      MULTIBALANCE: myConfig.MAINNET_WRAPPER + '/balances',
      MULTIUTXO: myConfig.MAINNET_WRAPPER + '/utxos',
      MULTITXN: myConfig.MAINNET_WRAPPER + '/data',
      MULTIBALANCETXN: myConfig.MAINNET_WRAPPER + '/baltxs',
      NEWMULTIUTXOTXN: myConfig.MAINNET_WRAPPER + '/nutxotxs',
      TXN_FEE: myConfig.MAINNET_WRAPPER + '/fee-estimates',
      TXNDETAILS: myConfig.MAINNET_WRAPPER + '/tx',
      BROADCAST_TX: myConfig.MAINNET_WRAPPER + '/tx',
    },
  };

  myConfig.ESPLORA_API_ENDPOINTS = _.cloneDeep(myConfig.BITHYVE_ESPLORA_API_ENDPOINTS); // current API-endpoints being used
  myConfig.USE_ESPLORA_FALLBACK = false; // BITHYVE_ESPLORA_API_ENDPOINT acts as the fallback(when true)
  myConfig.RELAY_AXIOS = axios.create({
    baseURL: myConfig.RELAY,
    timeout: myConfig.REQUEST_TIMEOUT * 3,
    headers: {
      'HEXA-ID': myConfig.HEXA_ID,
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      os: Platform.OS,
    },
  });
  myConfig.SIGNING_AXIOS = axios.create({
    baseURL: myConfig.SIGNING_SERVER,
    timeout: myConfig.REQUEST_TIMEOUT,
  });
  return myConfig;
};

const connectToBitHyveNode = async () => {
  myConfig.ESPLORA_API_ENDPOINTS = _.cloneDeep(myConfig.BITHYVE_ESPLORA_API_ENDPOINTS);
  myConfig.USE_ESPLORA_FALLBACK = false;
};

const connectToPersonalNode = async (personalNode: PersonalNode) => {
  const personalNodeURL = personalNode.urlPath;
  if (personalNodeURL && personalNode.isConnectionActive) {
    const personalNodeEPs = {
      MULTIBALANCE: personalNodeURL + '/balances',
      MULTIUTXO: personalNodeURL + '/utxos',
      MULTITXN: personalNodeURL + '/data',
      MULTIBALANCETXN: personalNodeURL + '/baltxs',
      MULTIUTXOTXN: personalNodeURL + '/utxotxs',
      NEWMULTIUTXOTXN: personalNodeURL + '/nutxotxs',
      TXN_FEE: personalNodeURL + 'fee-estimates',
      TXNDETAILS: personalNodeURL + '/tx',
      BROADCAST_TX: personalNodeURL + '/tx',
    };

    if (myConfig.NETWORK === bitcoinJS.networks.bitcoin)
      myConfig.ESPLORA_API_ENDPOINTS = {
        ...myConfig.ESPLORA_API_ENDPOINTS,
        MAINNET: personalNodeEPs,
      };
    else
      myConfig.ESPLORA_API_ENDPOINTS = {
        ...myConfig.ESPLORA_API_ENDPOINTS,
        TESTNET: personalNodeEPs,
      };
    myConfig.USE_ESPLORA_FALLBACK = personalNode.useFallback;
  }
  return myConfig;
};

const config = () => {
  return myConfig;
};

export { config, initCofig, connectToBitHyveNode, connectToPersonalNode };
