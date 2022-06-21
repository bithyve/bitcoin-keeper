import {
  ActiveAddressAssigneeType,
  GiftStatus,
  GiftThemeId,
  GiftType,
  NetworkType,
  NodeType,
  SignerType,
  TransactionType,
  TxPriority,
  VaultVisibility,
  WalletType,
  WalletVisibility,
} from './enum';

export interface InputUTXOs {
  txId: string;
  vout: number;
  value: number;
  address: string;
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

export type AverageTxFees = Record<TxPriority, AverageTxFeeElements>;
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

export interface TransactionToAddressMapping {
  txid: string;
  addresses: string[];
}

export interface Transaction {
  txid: string;
  status?: string;
  confirmations?: number;
  fee?: string;
  date?: string;
  transactionType?: TransactionType;
  amount: number;
  walletType: string;
  walletName?: string;
  contactName?: string;
  recipientAddresses?: string[];
  senderAddresses?: string[];
  blockTime?: number;
  message?: string;
  address?: string;
  type?: string;
  // sender?: string;
  // senderId?: string;
  // receivers?: { id?: string; name: string; amount: number }[];
  tags?: string[];
  notes?: string;
  isNew?: boolean;
}

export type TransactionDetails = Transaction;

// export interface TransactionMetaData {
//   receivers: { name: string; amount: number }[];
//   sender: string;
//   txid: string;
//   notes: string;
//   tags: string[];
//   amount: number;
//   walletType: string;
//   address: string;
//   isNew: boolean;
//   type: string;
// }

export interface Balances {
  confirmed: number;
  unconfirmed: number;
}

export interface UTXO {
  txId: string;
  vout: number;
  value: number;
  address: string;
  status?: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

export interface WalletImportedAddresses {
  [address: string]: {
    address: string;
    privateKey: string;
  };
}

export interface ActiveAddressAssignee {
  type: WalletType | ActiveAddressAssigneeType;
  id?: string;
  senderInfo?: {
    id?: string;
    name: string;
  };
  recipientInfo?: {
    [txid: string]: { id?: string; name: string; amount: number }[];
  };
}

export interface ActiveAddresses {
  external: {
    [address: string]: number; // active address to index mapping
  };
  internal: {
    [address: string]: number; // active address to index mapping
  };
}

export interface BIP85Config {
  index: number;
  words: number;
  language: string;
  derivationPath: string;
}

// export interface LightningNode {
//   host?: string;
//   port?: string;
//   url?: string;
//   lndhubUrl?: string;
//   existingWallet?: boolean;
//   macaroonHex?: string;
//   accessKey?: string;
//   username?: string;
//   password?: string;
//   implementation?: string;
//   certVerification?: boolean;
//   enableTor?: boolean;
// }

export interface NodeConnect {
  nodeId: string;
  type: NodeType;
  networkType: NetworkType;
  config: {};
  isActive: boolean;
}

export interface TwoFADetails {
  bithyveXpub?: string;
  twoFAKey?: string;
  twoFAValidated?: boolean;
}

export interface WalletDerivationDetails {
  networkType: NetworkType; // testnet/mainnet
  instanceNum: number; // instance number of this particular walletType
  mnemonic: string; // mnemonic of the wallet
  bip85Config: BIP85Config; // bip85 configuration leading to the derivation path for the corresponding entropy
  xDerivationPath: string; // derivation path of the extended keys belonging to this wallet
}

export interface VaultDerivationDetails {
  [xpub: string]: {
    derivationPath: string; // derivation path of the extended keys belonging to this xpub
  };
}

export interface WalletPresentationData {
  walletName: string; // name of the wallet
  walletDescription: string; // description of the wallet
  walletVisibility: WalletVisibility; // visibility of the wallet
  isSynching: boolean; // sync status of the wallet
}
export interface VaultPresentationData {
  vaultName: string; // name of the vault
  vaultDescription: string; // description of the vault
  vaultVisibility: VaultVisibility; // visibility of the vault
  isSynching: boolean; // sync status of the vault
}

export interface DonationWalletPresentationData extends WalletPresentationData {
  donee: string;
  donationName: string;
  donationDescription: string;
  configuration: {
    displayBalance: boolean;
    displayIncomingTxs: boolean;
    displayOutgoingTxs: boolean;
  };
  disableWallet: boolean;
}

export interface WalletSpecs {
  xpub: string | null; // wallet's xpub (primary for multi-sig wallets)
  xpriv: string | null; // wallet's xpriv (primary for multi-sig wallets)
  receivingAddress: string; // current external address
  nextFreeAddressIndex: number; // external-chain free address marker
  nextFreeChangeAddressIndex: number; // internal-chain free address marker
  activeAddresses: ActiveAddresses; // addresses being actively used by this wallet
  importedAddresses: WalletImportedAddresses;
  confirmedUTXOs: UTXO[]; // utxo set available for use
  unconfirmedUTXOs: UTXO[]; // utxos to arrive
  balances: Balances; // confirmed/unconfirmed balances
  transactions: Transaction[]; // transactions belonging to this wallet
  newTransactions?: Transaction[]; // new transactions arrived during the current sync
  lastSynched: number; // wallet's last sync timestamp
  hasNewTxn?: boolean; // indicates new txns
  txIdCache: { [txid: string]: boolean };
  transactionMapping: TransactionToAddressMapping[];
  transactionsNote: {
    [txId: string]: string;
  };
  // transactionsMeta?: TransactionMetaData[];
}
export interface VaultSpecs {
  is2FA: boolean;
  xpub: string[] | null; // list of xpubs of the signers
  receivingAddress: string; // current external address
  nextFreeAddressIndex: number; // external-chain free address marker
  nextFreeChangeAddressIndex: number; // internal-chain free address marker
  activeAddresses: ActiveAddresses; // addresses being actively used by this vault
  importedAddresses: WalletImportedAddresses;
  confirmedUTXOs: UTXO[]; // utxo set available for use
  unconfirmedUTXOs: UTXO[]; // utxos to arrive
  balances: Balances; // confirmed/unconfirmed balances
  transactions: Transaction[]; // transactions belonging to this vault
  newTransactions?: Transaction[]; // new transactions arrived during the current sync
  lastSynched: number; // vault's last sync timestamp
  hasNewTxn?: boolean; // indicates new txns
  txIdCache: { [txid: string]: boolean };
  transactionMapping: TransactionToAddressMapping[];
  transactionsNote: {
    [txId: string]: string;
  };
  // transactionsMeta?: TransactionMetaData[];
}

export interface MultiSigWalletSpecs extends WalletSpecs {
  is2FA: boolean; // is2FA enabled
  xpubs: {
    // additional xpubs for multi-sig
    secondary: string;
    bithyve: string;
  };
  xprivs: {
    // additional xpirvs for multi-sig
    secondary?: string;
  };
}

export interface Wallet {
  id: string; // wallet identifier(derived from xpub)
  type: WalletType; // type of wallet
  walletShellId: string; // identifier of the wallet shell that the wallet belongs
  isUsable: boolean; // true if wallet is usable
  derivationDetails: WalletDerivationDetails;
  presentationData: WalletPresentationData;
  specs: WalletSpecs;
}

export interface MultiSigWallet extends Wallet {
  specs: MultiSigWalletSpecs;
}

export interface Vault {
  id: string; // vault identifier(derived from xpub)
  scheme: VaultScheme; // type of vault
  vaultShellId: string; // identifier of the vault shell that the vault belongs
  isUsable: boolean; // true if vault is usable
  signers: VaultSigner[];
  presentationData: VaultPresentationData;
  specs: VaultSpecs;
}

export interface VaultScheme {
  m: number; // threshold number of signatures required
  n: number; // total number of xpubs
}

export interface VaultSigner {
  signerId: string;
  signerName: string;
  type: SignerType;
  xpub: string;
  derivation: string;
}
export interface DonationWallet extends Wallet {
  presentationData: DonationWalletPresentationData;
  specs: WalletSpecs | MultiSigWalletSpecs;
}

export interface TriggerPolicy {
  id: string;
  date: string;
  specifications: {};
  version: string;
}

export interface WalletShell {
  id: string;
  walletInstances: { [walletType: string]: number }; // various wallet types mapped to corresponding number of instances
  triggerPolicyId?: string;
}

export interface InheritancePolicy {
  id: string;
  date: string;
  heir: {
    firstName: string;
    lastName: string;
    address: string;
    email: string;
  };
  user: {
    email: string;
  };
  version: string;
}

export interface VaultShell {
  id: string;
  vaultInstances: { [vaultType: string]: number }; // various vault types mapped to corresponding number of instances
  inheritancePolicyId?: string;
}

export interface Gift {
  id: string;
  privateKey: string;
  address: string;
  channelAddress?: string;
  amount: number;
  type: GiftType;
  status: GiftStatus;
  themeId: GiftThemeId;
  timestamps: {
    created: number;
    sent?: number;
    accepted?: number;
    reclaimed?: number;
    associated?: number;
    rejected?: number;
  };
  validitySpan?: number;
  sender: {
    appId: string;
    walletId: string;
    appName: string;
    contactId?: string; // permanentAddress of the contact
  };
  receiver: {
    appId?: string;
    walletId?: string;
    appName?: string;
    contactId?: string; // permanentAddress of the contact
  };
  note?: string;
  exclusiveGiftCode?: string;
  deepLinkConfig?: {
    encryptionType: string;
    encryptionKey: string;
  };
}

export interface GiftMetaData {
  status: GiftStatus;
  validity?: {
    sentAt: number;
    validitySpan: number;
  };
  exclusiveGiftCode?: string;
  notificationInfo?: {
    walletId: string;
    FCM: string;
  };
}
