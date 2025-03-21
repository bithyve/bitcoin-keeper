import {
  LabelRefType,
  LabelType,
  NetworkType,
  SignerType,
  TransactionType,
  TxPriorityDefault,
} from '../enums';
import { Vault } from './vault';
import { Wallet } from './wallet';

export interface InputUTXOs {
  txId: string;
  vout: number;
  value: number;
  address: string;
  height: number;
}

export interface OutputUTXOs {
  value: number;
  address: string;
}

export interface AverageTxFeeElements {
  averageTxFee: number;
  feePerByte: number;
  estimatedBlocks: number;
}

export type AverageTxFees = Record<TxPriorityDefault, AverageTxFeeElements>;
export type AverageTxFeesByNetwork = Record<NetworkType, AverageTxFees>;

export enum CurrencyCodes {
  USD = 'USD',
  AED = 'AED',
  ARS = 'ARS',
  AUD = 'AUD',
  BDT = 'BDT',
  BHD = 'BHD',
  BMD = 'BMD',
  BRL = 'BRL',
  CAD = 'CAD',
  CHF = 'CHF',
  CLP = 'CLP',
  CNY = 'CNY',
  CZK = 'CZK',
  DKK = 'DKK',
  EUR = 'EUR',
  GBP = 'GBP',
  HKD = 'HKD',
  HUF = 'HUF',
  IDR = 'IDR',
  ILS = 'ILS',
  INR = 'INR',
  JPY = 'JPY',
  KRW = 'KRW',
  KWD = 'KWD',
  LKR = 'LKR',
  MMK = 'MMK',
  MXN = 'MXN',
  MYR = 'MYR',
  NGN = 'NGN',
  NOK = 'NOK',
  NZD = 'NZD',
  PHP = 'PHP',
  PKR = 'PKR',
  PLN = 'PLN',
  RUB = 'RUB',
  SAR = 'SAR',
  SEK = 'SEK',
  SGD = 'SGD',
  THB = 'THB',
  TRY = 'TRY',
  TWD = 'TWD',
  UAH = 'UAH',
  VEF = 'VEF',
  VND = 'VND',
  ZAR = 'ZAR',
  XDR = 'XDR',
}

export interface ExchangeRateElements {
  '15m': number;
  buy: number;
  last: number;
  sell: number;
  symbol: string;
}

export type ExchangeRates = Record<CurrencyCodes, ExchangeRateElements>;

export interface TransactionPrerequisiteElements {
  inputs?: InputUTXOs[];
  outputs?: OutputUTXOs[];
  fee?: number;
  estimatedBlocks?: number;
}

export interface TransactionPrerequisite {
  [txnPriority: string]: TransactionPrerequisiteElements;
}

export interface TransactionRecipients {
  [txnPriority: string]: {
    address: string;
    amount: number;
  }[];
}

export interface TransactionToAddressMapping {
  txid: string;
  addresses: string[];
}

export interface Transaction {
  txid: string;
  address?: string;
  confirmations?: number;
  fee?: number;
  date?: string;
  transactionType?: TransactionType;
  amount: number;
  recipientAddresses?: string[];
  senderAddresses?: string[];
  blockTime?: number;
  tags?: string[];
}

export interface Balances {
  confirmed: number;
  unconfirmed: number;
}
export interface UTXO {
  txId: string;
  vout: number;
  value: number;
  address: string;
  height: number;
}

export interface UTXOInfo {
  id: string;
  txId: string;
  vout: number;
  walletId: string;
  labels?: Array<{ name: string; type: LabelType }>;
}

export interface BIP329Label {
  id: string;
  ref: string;
  type: LabelRefType;
  label: string;
  origin?: string;
  isSystem: boolean;
}

export interface BIP85Config {
  index: number;
  words: number;
  language: string;
  derivationPath: string;
}

export interface SigningPayload {
  payloadTarget: SignerType;
  inputs?: InputUTXOs[];
  outputs?: OutputUTXOs[];
  change?: string;
  changeIndex?: number;
  inputsToSign?: Array<{
    digest: string;
    subPath: string;
    inputIndex: number;
    sighashType: number;
    publicKey: string;
    signature?: string;
  }>;
  childIndexArray?: Array<{
    subPath: number[];
    inputIdentifier: {
      txId: string;
      vout: number;
      value: number;
    };
  }>;
}

export interface SerializedPSBTEnvelop {
  mfp: string;
  xfp: string;
  signerType: SignerType;
  serializedPSBT: string;
  signingPayload?: SigningPayload[];
  isSigned: boolean;
  txHex?: string;
  isMockSigner?: boolean;
}

export interface NodeDetail {
  id: number;
  host: string;
  port: string;
  isConnected: boolean;
  useKeeperNode: boolean;
  useSSL: boolean;
}

export interface SyncedWallet {
  synchedWallet: Wallet | Vault;
  newUTXOs: UTXO[];
}
