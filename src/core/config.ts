/* eslint-disable @typescript-eslint/no-explicit-any */
import * as bitcoinJS from 'bitcoinjs-lib';

import axios, { AxiosInstance } from 'axios';

import DeviceInfo from 'react-native-device-info';
import PersonalNode from '../common/data/models/PersonalNode';
import { Platform } from 'react-native';
import { WalletType } from './wallets/enums';
import _ from 'lodash';
import config from 'react-native-config';

export enum APP_STAGE {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
}

export enum BITCOIN_NETWORK {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET',
}

// defaults to development environment
const DEFAULT_CONFIG = {
  BITCOIN_NETWORK: BITCOIN_NETWORK.TESTNET,
  APP_STAGE: APP_STAGE.DEVELOPMENT,
  TESTNET_WRAPPER: 'https://test-wrapper.bithyve.com',
  MAINNET_WRAPPER: 'https://api.bithyve.com',
  RELAY: 'https://dev-relay.bithyve.com/',
  SIGNING_SERVER: 'https://dev-sign.bithyve.com/',
  ENC_KEY_STORAGE_IDENTIFIER: 'KEEPER-KEY',
  AUTH_ID: '4f989d87d711830ab0162373f59bfc9b9b2d8b194f9f1065ba45d68b516efe28',
  HEXA_ID: 'b01623f1065ba45d68b516efe2873f59bfc9b9b2d8b194f94f989d87d711830a',
  SENTRY_DNS: 'https://25289533edf7432994f58edeaf6541dc@o1388909.ingest.sentry.io/6711631',
};

class Configuration {
  public TESTNET_WRAPPER: string = config.TESTNET_WRAPPER
    ? config.TESTNET_WRAPPER.trim()
    : DEFAULT_CONFIG.TESTNET_WRAPPER;
  public MAINNET_WRAPPER: string = config.MAINNET_WRAPPER
    ? config.MAINNET_WRAPPER.trim()
    : DEFAULT_CONFIG.MAINNET_WRAPPER;
  public RELAY = config.RELAY ? config.RELAY.trim() : DEFAULT_CONFIG.RELAY;
  public SIGNING_SERVER = config.SIGNING_SERVER
    ? config.SIGNING_SERVER.trim()
    : DEFAULT_CONFIG.SIGNING_SERVER;
  public AUTH_ID: string = config.AUTH_ID ? config.AUTH_ID.trim() : DEFAULT_CONFIG.AUTH_ID;
  public HEXA_ID: string = config.HEXA_ID ? config.HEXA_ID.trim() : DEFAULT_CONFIG.HEXA_ID; // for legacy-relay interaction
  public BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH = `m/83696968'/39'/0'/12'/83696968'`;
  public VAC_CHILD_INDEX: number = 3012009;
  public ENC_KEY_STORAGE_IDENTIFIER: string = config.ENC_KEY_STORAGE_IDENTIFIER
    ? config.ENC_KEY_STORAGE_IDENTIFIER.trim()
    : DEFAULT_CONFIG.ENC_KEY_STORAGE_IDENTIFIER;

  public SENTRY_DNS: string = config.SENTRY_DNS
    ? config.SENTRY_DNS.trim()
    : DEFAULT_CONFIG.SENTRY_DNS;

  public WALLET_INSTANCES = {
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

  public REQUEST_TIMEOUT: number = 15000;
  public GAP_LIMIT: number = 5;
  public RELAY_AXIOS: AxiosInstance = axios.create({
    baseURL: this.RELAY,
    timeout: this.REQUEST_TIMEOUT * 3,
    headers: {
      'HEXA-ID': config.HEXA_ID,
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      os: Platform.OS,
    },
  });
  public SIGNING_AXIOS: AxiosInstance = axios.create({
    baseURL: this.SIGNING_SERVER,
    timeout: this.REQUEST_TIMEOUT,
  });

  public NETWORK: bitcoinJS.Network;
  public APP_STAGE: string;

  constructor(env: BITCOIN_NETWORK) {
    this.NETWORK =
      env.trim() === BITCOIN_NETWORK.MAINNET
        ? bitcoinJS.networks.bitcoin
        : bitcoinJS.networks.testnet;
    this.APP_STAGE = config.ENVIRONMENT ? config.ENVIRONMENT.trim() : DEFAULT_CONFIG.APP_STAGE;
  }

  public BITHYVE_ESPLORA_API_ENDPOINTS = {
    TESTNET: {
      MULTIBALANCE: this.TESTNET_WRAPPER + '/balances',
      MULTIUTXO: this.TESTNET_WRAPPER + '/utxos',
      MULTITXN: this.TESTNET_WRAPPER + '/data',
      MULTIBALANCETXN: this.TESTNET_WRAPPER + '/baltxs',
      NEWMULTIUTXOTXN: this.TESTNET_WRAPPER + '/nutxotxs',
      TXN_FEE: this.TESTNET_WRAPPER + '/fee-estimates',
      TXNDETAILS: this.TESTNET_WRAPPER + '/tx',
      BROADCAST_TX: this.TESTNET_WRAPPER + '/tx',
    },
    MAINNET: {
      MULTIBALANCE: this.MAINNET_WRAPPER + '/balances',
      MULTIUTXO: this.MAINNET_WRAPPER + '/utxos',
      MULTITXN: this.MAINNET_WRAPPER + '/data',
      MULTIBALANCETXN: this.MAINNET_WRAPPER + '/baltxs',
      NEWMULTIUTXOTXN: this.MAINNET_WRAPPER + '/nutxotxs',
      TXN_FEE: this.MAINNET_WRAPPER + '/fee-estimates',
      TXNDETAILS: this.MAINNET_WRAPPER + '/tx',
      BROADCAST_TX: this.MAINNET_WRAPPER + '/tx',
    },
  };
  public ESPLORA_API_ENDPOINTS = _.cloneDeep(this.BITHYVE_ESPLORA_API_ENDPOINTS); // current API-endpoints being used
  public USE_ESPLORA_FALLBACK = false; // BITHYVE_ESPLORA_API_ENDPOINT acts as the fallback(when true)

  public connectToPersonalNode = async (personalNode: PersonalNode) => {
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

      if (this.NETWORK === bitcoinJS.networks.bitcoin)
        this.ESPLORA_API_ENDPOINTS = {
          ...this.ESPLORA_API_ENDPOINTS,
          MAINNET: personalNodeEPs,
        };
      else
        this.ESPLORA_API_ENDPOINTS = {
          ...this.ESPLORA_API_ENDPOINTS,
          TESTNET: personalNodeEPs,
        };

      this.USE_ESPLORA_FALLBACK = personalNode.useFallback;
    }
  };

  public connectToBitHyveNode = async () => {
    this.ESPLORA_API_ENDPOINTS = _.cloneDeep(this.BITHYVE_ESPLORA_API_ENDPOINTS);
    this.USE_ESPLORA_FALLBACK = false;
  };
}

export default new Configuration(
  (config.BITCOIN_NETWORK as BITCOIN_NETWORK) || DEFAULT_CONFIG.BITCOIN_NETWORK
);
