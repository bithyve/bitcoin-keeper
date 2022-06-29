/* eslint-disable @typescript-eslint/no-explicit-any */
import * as bitcoinJS from 'bitcoinjs-lib';

import axios, { AxiosInstance } from 'axios';

import PersonalNode from '../common/data/models/PersonalNode';
import { WalletType } from './wallets/interfaces/enum';
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
  BITCOIN_NETWORK: BITCOIN_NETWORK.MAINNET,
  APP_STAGE: APP_STAGE.STAGING,
  TESTNET_WRAPPER: 'https://test-wrapper.bithyve.com',
  MAINNET_WRAPPER: 'https://api.bithyve.com',
  RELAY: 'https://new-staging-relay.nw.r.appspot.com/',
  SIGNING_SERVER: 'https://new-staging-sign.nw.r.appspot.com/',
  ENC_KEY_STORAGE_IDENTIFIER: 'KEEPER-KEY',
  AUTH_ID: '4f989d87d711830ab0162373f59bfc9b9b2d8b194f9f1065ba45d68b516efe28',
  HEXA_ID: 'b01623f1065ba45d68b516efe2873f59bfc9b9b2d8b194f94f989d87d711830a',
  CIPHER_SPEC_ALGO: 'aes-192-cbc',
  CIPHER_SPEC_SALT: 'e44dac4a355',
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

  public ENC_KEY_STORAGE_IDENTIFIER: string = config.ENC_KEY_STORAGE_IDENTIFIER
    ? config.ENC_KEY_STORAGE_IDENTIFIER.trim()
    : DEFAULT_CONFIG.ENC_KEY_STORAGE_IDENTIFIER;

  public WALLET_INSTANCES = {
    [WalletType.TEST]: {
      series: 0,
      upperBound: 1,
    },
    [WalletType.CHECKING]: {
      series: 0,
      upperBound: 10,
    },
    [WalletType.IMPORTED]: {
      series: 0,
      upperBound: 10,
    },
    [WalletType.SAVINGS]: {
      series: 10,
      upperBound: 10,
    },
    [WalletType.DONATION]: {
      series: 20,
      upperBound: 10,
    },
    [WalletType.SWAN]: {
      series: 30,
      upperBound: 10,
    },
    [WalletType.DEPOSIT]: {
      series: 40,
      upperBound: 10,
    },
    [WalletType.LIGHTNING]: {
      series: 50,
      upperBound: 1,
    },
  };

  public CIPHER_SPEC: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = {
    algorithm: DEFAULT_CONFIG.CIPHER_SPEC_ALGO,
    salt: config.CIPHER_SPEC_SALT
      ? config.CIPHER_SPEC_SALT.trim()
      : DEFAULT_CONFIG.CIPHER_SPEC_SALT,
    keyLength: 24,
    iv: Buffer.alloc(16, 0),
  };

  public REQUEST_TIMEOUT: number = 15000;
  public GAP_LIMIT: number = 5;
  public RELAY_AXIOS: AxiosInstance = axios.create({
    baseURL: this.RELAY,
    timeout: this.REQUEST_TIMEOUT * 3,
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
