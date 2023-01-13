/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as bitcoinJS from 'bitcoinjs-lib';

import axios, { AxiosInstance } from 'axios';

import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import _ from 'lodash';
import config from 'react-native-config';
import { NetworkType, WalletType } from './wallets/enums';

export enum APP_STAGE {
  DEVELOPMENT = 'DEVELOPMENT',
  PRODUCTION = 'PRODUCTION',
}

export enum BITCOIN_NETWORK {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET',
}

// defaults to development environment
const DEFAULT_CONFIG = {
  BITCOIN_NETWORK: BITCOIN_NETWORK.TESTNET,
  TESTNET_WRAPPER: 'https://test-wrapper.bithyve.com',
  MAINNET_WRAPPER: 'https://api.bithyve.com',
  RELAY: 'https://bithyve-dev-relay.el.r.appspot.com/',
  SIGNING_SERVER: 'https://dev-sign.bithyve.com/',
  ENC_KEY_STORAGE_IDENTIFIER: 'KEEPER-KEY',
  AUTH_ID: '4f989d87d711830ab0162373f59bfc9b9b2d8b194f9f1065ba45d68b516efe28',
  HEXA_ID: 'b01623f1065ba45d68b516efe2873f59bfc9b9b2d8b194f94f989d87d711830a',
  SENTRY_DNS: 'https://25289533edf7432994f58edeaf6541dc@o1388909.ingest.sentry.io/6711631',
  ENVIRONMENT: APP_STAGE.DEVELOPMENT,
};

class Configuration {
  public TESTNET_WRAPPER: string = config.TESTNET_WRAPPER?.trim()
    ? config.TESTNET_WRAPPER.trim()
    : DEFAULT_CONFIG.TESTNET_WRAPPER;

  public MAINNET_WRAPPER: string = config.MAINNET_WRAPPER?.trim()
    ? config.MAINNET_WRAPPER.trim()
    : DEFAULT_CONFIG.MAINNET_WRAPPER;

  public RELAY = config.RELAY?.trim() ? config.RELAY.trim() : DEFAULT_CONFIG.RELAY;

  public SIGNING_SERVER = config.SIGNING_SERVER?.trim()
    ? config.SIGNING_SERVER.trim()
    : DEFAULT_CONFIG.SIGNING_SERVER;

  public AUTH_ID: string = config.AUTH_ID?.trim() ? config.AUTH_ID.trim() : DEFAULT_CONFIG.AUTH_ID;

  public HEXA_ID: string = config.HEXA_ID?.trim() ? config.HEXA_ID.trim() : DEFAULT_CONFIG.HEXA_ID; // for legacy-relay interaction

  public BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH = `m/83696968'/39'/0'/12'/83696968'`;

  public VAC_CHILD_INDEX: number = 3012009;

  public ENC_KEY_STORAGE_IDENTIFIER: string = config.ENC_KEY_STORAGE_IDENTIFIER?.trim()
    ? config.ENC_KEY_STORAGE_IDENTIFIER.trim()
    : DEFAULT_CONFIG.ENC_KEY_STORAGE_IDENTIFIER;

  public SENTRY_DNS: string = config.SENTRY_DNS?.trim()
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
  };

  public REQUEST_TIMEOUT: number = 15000;

  public GAP_LIMIT: number = 5;

  public RELAY_AXIOS: AxiosInstance = axios.create({
    baseURL: this.RELAY,
    timeout: this.REQUEST_TIMEOUT * 3,
    headers: {
      'HEXA-ID': config.HEXA_ID?.trim() ? config.HEXA_ID.trim() : DEFAULT_CONFIG.HEXA_ID,
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

  public NETWORK_TYPE: NetworkType;

  public ENVIRONMENT: string;

  public INSTABUG_TOKEN: string = config.INSTABUG_TOKEN?.trim() ? config.INSTABUG_TOKEN.trim() : '';

  constructor() {
    this.ENVIRONMENT = config.ENVIRONMENT?.trim()
      ? config.ENVIRONMENT.trim()
      : DEFAULT_CONFIG.ENVIRONMENT;
    this.NETWORK =
      this.ENVIRONMENT === APP_STAGE.PRODUCTION
        ? bitcoinJS.networks.bitcoin
        : bitcoinJS.networks.testnet;
    this.NETWORK_TYPE =
      this.ENVIRONMENT === APP_STAGE.PRODUCTION ? NetworkType.MAINNET : NetworkType.TESTNET;
  }

  public setNetwork = (network: NetworkType) => {
    const isTestnet = network === NetworkType.TESTNET;
    this.NETWORK_TYPE = network;
    this.NETWORK = isTestnet ? bitcoinJS.networks.testnet : bitcoinJS.networks.bitcoin;
  };
}

export default new Configuration();
