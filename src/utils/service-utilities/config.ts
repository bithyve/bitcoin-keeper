import { Platform } from 'react-native';
import config from 'react-native-config';
import { EntityKind, WalletType } from '../../services/wallets/enums';

export enum APP_STAGE {
  DEVELOPMENT = 'DEVELOPMENT',
  PRODUCTION = 'PRODUCTION',
}

export const KEEPER_KNOWLEDGEBASE = 'https://help.bitcoinkeeper.app/hc/en-us/';
export const KEEPER_WEBSITE_BASE_URL = 'https://bitcoinkeeper.app';

export const PENDING_HEALTH_CHECK_TIME_DEV = 3 * 60 * 60 * 1000;
export const PENDING_HEALTH_CHECK_TIME_PROD = 90 * 24 * 60 * 60 * 1000;

// defaults to development environment
const DEFAULT_CONFIG = {
  RELAY: 'https://bithyve-dev-relay.el.r.appspot.com/',
  SIGNING_SERVER_TESTNET: 'https://dev-sign.bithyve.com/',
  SIGNING_SERVER_MAINNET: 'https://dev-sign.bithyve.com/',
  ENC_KEY_STORAGE_IDENTIFIER: 'KEEPER-KEY',
  HEXA_ID_TESTNET: 'b01623f1065ba45d68b516efe2873f59bfc9b9b2d8b194f94f989d87d711830a',
  HEXA_ID_MAINNET: 'b01623f1065ba45d68b516efe2873f59bfc9b9b2d8b194f94f989d87d711830a',
  SENTRY_DNS: 'https://25289533edf7432994f58edeaf6541dc@o1388909.ingest.sentry.io/6711631',
  ENVIRONMENT: APP_STAGE.DEVELOPMENT,
  CHANNEL_URL: 'https://keeper-channel-dev-8d01fa5233d0.herokuapp.com/',
  RAMP_BASE_URL: 'https://app.rampnetwork.com/',
  RAMP_REFERRAL_CODE: 'ku67r7oh5juc27bmb3h5pek8y5heyb5bdtfa66pr',
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

  public SIGNING_SERVER_TESTNET = config.SIGNING_SERVER_TESTNET?.trim()
    ? config.SIGNING_SERVER_TESTNET.trim()
    : DEFAULT_CONFIG.SIGNING_SERVER_TESTNET;

  public SIGNING_SERVER_MAINNET = config.SIGNING_SERVER_MAINNET?.trim()
    ? config.SIGNING_SERVER_MAINNET.trim()
    : DEFAULT_CONFIG.SIGNING_SERVER_MAINNET;

  public HEXA_ID_TESTNET: string = config.HEXA_ID_TESTNET?.trim()
    ? config.HEXA_ID_TESTNET.trim()
    : DEFAULT_CONFIG.HEXA_ID_TESTNET;

  public HEXA_ID_MAINNET: string = config.HEXA_ID_MAINNET?.trim()
    ? config.HEXA_ID_MAINNET.trim()
    : DEFAULT_CONFIG.HEXA_ID_MAINNET;

  public HEXA_ID: string;

  public BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH = "m/83696968'/39'/0'/12'/83696968'";

  public VAC_CHILD_INDEX: number = 3012009;

  public ENC_KEY_STORAGE_IDENTIFIER: string = config.ENC_KEY_STORAGE_IDENTIFIER?.trim()
    ? config.ENC_KEY_STORAGE_IDENTIFIER.trim()
    : DEFAULT_CONFIG.ENC_KEY_STORAGE_IDENTIFIER;

  public SENTRY_DNS: string = config.SENTRY_DNS?.trim()
    ? config.SENTRY_DNS.trim()
    : DEFAULT_CONFIG.SENTRY_DNS;

  public WALLET_INSTANCE_SERIES: {
    [WalletType.DEFAULT]: { series: number; upperBound: number };
    [EntityKind.USDT_WALLET]: { series: number; upperBound: number };
  } = {
    [WalletType.DEFAULT]: {
      series: 0, // 0-99 BIP-85 child indexes reserved for default wallets
      upperBound: 100,
    },
    [EntityKind.USDT_WALLET]: {
      series: 100, // 100-199 BIP-85 child indexes reserved for USDT wallets
      upperBound: 200,
    },
    // exception: Read-only and Imported(non-bip85 wallets)
  };

  public REQUEST_TIMEOUT: number = 15000;

  public GAP_LIMIT: number = 20;

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

  public GASFREE_API_KEY: string = config.GASFREE_API_KEY?.trim();
  public GASFREE_API_SECRET: string = config.GASFREE_API_SECRET?.trim();

  public RENEWAL_WINDOW: number;

  constructor() {
    this.ENVIRONMENT = config.ENVIRONMENT?.trim()
      ? config.ENVIRONMENT.trim()
      : DEFAULT_CONFIG.ENVIRONMENT;

    this.RENEWAL_WINDOW =
      this.ENVIRONMENT === APP_STAGE.PRODUCTION
        ? 30.44 * 3 * 24 * 60 * 60 * 1000 // 3 months
        : 3 * 60 * 60 * 1000; // 20 mins  || 3 hours

    this.HEXA_ID =
      this.ENVIRONMENT === APP_STAGE.PRODUCTION ? this.HEXA_ID_MAINNET : this.HEXA_ID_TESTNET;
  }

  public isDevMode = () => {
    return this.ENVIRONMENT === APP_STAGE.DEVELOPMENT;
  };
}

export default new Configuration();
