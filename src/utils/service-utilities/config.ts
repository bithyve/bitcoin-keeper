import * as bitcoinJS from 'bitcoinjs-lib';

import axios, { AxiosInstance } from 'axios';

import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import config from 'react-native-config';
import { NetworkType, WalletType } from '../../services/wallets/enums';

export enum APP_STAGE {
  DEVELOPMENT = 'DEVELOPMENT',
  PRODUCTION = 'PRODUCTION',
}

export enum BITCOIN_NETWORK {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET',
}

export const KEEPER_KNOWLEDGEBASE = 'https://help.bitcoinkeeper.app/hc/en-us/';
export const KEEPER_WEBSITE_BASE_URL = 'https://bitcoinkeeper.app';

export const PENDING_HEALTH_CHECK_TIME_DEV = 3 * 60 * 60 * 1000;
export const PENDING_HEALTH_CHECK_TIME_PROD = 90 * 24 * 60 * 60 * 1000;

// defaults to development environment
const DEFAULT_CONFIG = {
  BITCOIN_NETWORK: BITCOIN_NETWORK.TESTNET,
  RELAY: 'https://bithyve-dev-relay.el.r.appspot.com/',
  SIGNING_SERVER: 'https://dev-sign.bithyve.com/',
  ENC_KEY_STORAGE_IDENTIFIER: 'KEEPER-KEY',
  HEXA_ID: 'b01623f1065ba45d68b516efe2873f59bfc9b9b2d8b194f94f989d87d711830a',
  SENTRY_DNS: 'https://25289533edf7432994f58edeaf6541dc@o1388909.ingest.sentry.io/6711631',
  ENVIRONMENT: APP_STAGE.DEVELOPMENT,
  CHANNEL_URL: 'https://keeper-channel-dev-8d01fa5233d0.herokuapp.com/',
  RAMP_BASE_URL: 'https://app.ramp.network/',
  RAMP_REFERRAL_CODE: 'ku67r7oh5juc27bmb3h5pek8y5heyb5bdtfa66pr',
  SIGNING_SERVER_RSA_PUBKEY:
    '-----BEGIN PUBLIC KEY----- MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr/gXW+ITXpSfp8tu9Ujw gDfcPSfFLuIDovPFRBdMP9uJ7baHqhYO1WqvrafLHZ/akhdk9XSR18Oqb7pvUfvQ Y/40QO6Qlx6zxyGoM1FOTaXY2NxCv5U+kTi2NJpMi2C7/h63ykiLD9dkO0qBCBjd /tFsv8e5GTOQXZQvIEsAyeBNsNQxNX5AY7HQI0nMjGrxKYGMaBQKFqtaJIQwESlo DSkrd5yQJQR50KwL0+/e5znemVhxS08NgjxGTVKTuiJhsJa+PWMZhlmHjcLaFrZz QjDuhqycRCwXk7tuZHOVRSI9LC+L5LfayL6Mj7N1NdmkRWRY/feXU9GlaFX8KQqq fwIDAQAB -----END PUBLIC KEY-----',
};

class Configuration {
  public RELAY = config.RELAY?.trim() ? config.RELAY.trim() : DEFAULT_CONFIG.RELAY;

  // RAMP details
  public RAMP_BASE_URL: string = config.RAMP_BASE_URL
    ? config.RAMP_BASE_URL.trim()
    : DEFAULT_CONFIG.RAMP_BASE_URL;

  public RAMP_REFERRAL_CODE: string = config.RAMP_REFERRAL_CODE
    ? config.RAMP_REFERRAL_CODE.trim()
    : DEFAULT_CONFIG.RAMP_REFERRAL_CODE;

  public SIGNING_SERVER = config.SIGNING_SERVER?.trim()
    ? config.SIGNING_SERVER.trim()
    : DEFAULT_CONFIG.SIGNING_SERVER;

  public HEXA_ID: string = config.HEXA_ID?.trim() ? config.HEXA_ID.trim() : DEFAULT_CONFIG.HEXA_ID; // for legacy-relay interaction

  public BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH = "m/83696968'/39'/0'/12'/83696968'";

  public VAC_CHILD_INDEX: number = 3012009;

  public ENC_KEY_STORAGE_IDENTIFIER: string = config.ENC_KEY_STORAGE_IDENTIFIER?.trim()
    ? config.ENC_KEY_STORAGE_IDENTIFIER.trim()
    : DEFAULT_CONFIG.ENC_KEY_STORAGE_IDENTIFIER;

  public SENTRY_DNS: string = config.SENTRY_DNS?.trim()
    ? config.SENTRY_DNS.trim()
    : DEFAULT_CONFIG.SENTRY_DNS;

  public WALLET_INSTANCE_SERIES = {
    [WalletType.DEFAULT]: {
      series: 0,
      upperBound: 100,
    },

    // exception: Read-only and Imported(non-bip85 wallets)
  };

  public REQUEST_TIMEOUT: number = 15000;

  public GAP_LIMIT: number = 20;

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

  public SIGNING_SERVER_RSA_PUBKEY: string = config.SIGNING_SERVER_RSA_PUBKEY
    ? config.SIGNING_SERVER_RSA_PUBKEY.trim()
    : DEFAULT_CONFIG.SIGNING_SERVER_RSA_PUBKEY;

  public NETWORK: bitcoinJS.Network;

  public NETWORK_TYPE: NetworkType;

  public ENVIRONMENT: string;

  public CHANNEL_URL: string = config.CHANNEL_URL?.trim()
    ? config.CHANNEL_URL.trim()
    : DEFAULT_CONFIG.CHANNEL_URL.trim();

  public ZENDESK_USERNAME: string = config.ZENDESK_USERNAME?.trim();

  public ZENDESK_PASSWORD: string = config.ZENDESK_PASSWORD?.trim();

  public ZENDESK_BASE_URL: string = config.ZENDESK_BASE_URL?.trim();

  public ZENDESK_CHANNEL_ID = Platform.select({
    ios: config.ZENDESK_IOS_CHANNEL_ID?.trim(),
    android: config.ZENDESK_ANDROID_CHANNEL_ID?.trim(),
  });

  public RENEWAL_WINDOW: number;

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

    this.RENEWAL_WINDOW =
      this.ENVIRONMENT === APP_STAGE.PRODUCTION
        ? 30.44 * 3 * 24 * 60 * 60 * 1000 // 3 months
        : 3 * 60 * 60 * 1000; // 20 mins  || 3 hours
  }

  public setNetwork = (network: NetworkType) => {
    const isTestnet = network === NetworkType.TESTNET;
    this.NETWORK_TYPE = network;
    this.NETWORK = isTestnet ? bitcoinJS.networks.testnet : bitcoinJS.networks.bitcoin;
  };

  public isDevMode = () => {
    return this.ENVIRONMENT === APP_STAGE.DEVELOPMENT;
  };
}

export default new Configuration();
