import {
  WalletType,
  WalletVisibility,
  ActiveAddressAssigneeType,
  GiftStatus,
  GiftThemeId,
  GiftType,
  NetworkType,
  TransactionType,
  NodeType,
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

export interface AverageTxFees {
  [priority: string]: {
    averageTxFee: number;
    feePerByte: number;
    estimatedBlocks: number;
  };
}

export interface TransactionPrerequisiteElements {
  inputs?: InputUTXOs[];
  outputs?: OutputUTXOs[];
  fee?: number;
  estimatedBlocks?: number;
}

export interface TransactionPrerequisite {
  [txnPriority: string]: TransactionPrerequisiteElements;
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
  sender?: string;
  senderId?: string;
  receivers?: { id?: string; name: string; amount: number }[];
  tags?: string[];
  notes?: string;
  isNew?: boolean;
}

export type TransactionDetails = Transaction;

export interface TransactionMetaData {
  receivers: { name: string; amount: number }[];
  sender: string;
  txid: string;
  notes: string;
  tags: string[];
  amount: number;
  walletType: string;
  address: string;
  isNew: boolean;
  type: string;
}

export interface TransactionsNote {
  [txId: string]: string;
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
  status?: any;
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
    [address: string]: {
      index: number;
      assignee: ActiveAddressAssignee;
    };
  };
  internal: {
    [address: string]: {
      index: number;
      assignee: ActiveAddressAssignee;
    };
  };
}

export interface BIP85Config {
  index: number;
  words: number;
  language: string;
  derivationPath: string;
}

export interface NodeConnect {
  nodeId: string;
  type: NodeType;
  networkType: NetworkType;
  config: {};
  isActive: boolean;
}

export interface LightningNode {
  host?: string;
  port?: string;
  url?: string;
  lndhubUrl?: string;
  existingWallet?: boolean;
  macaroonHex?: string;
  accessKey?: string;
  username?: string;
  password?: string;
  implementation?: string;
  certVerification?: boolean;
  enableTor?: boolean;
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

export interface WalletPresentationData {
  walletName: string; // name of the wallet
  walletDescription: string; // description of the wallet
  walletVisibility: WalletVisibility; // visibility of the wallet
  isSynching: boolean; // sync status of the wallet
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
  activeAddresses: ActiveAddresses; // addresses being actively used by this wallet
  receivingAddress: string; // current external address
  nextFreeAddressIndex: number; // external-chain free address marker
  nextFreeChangeAddressIndex: number; // internal-chain free address marker
  confirmedUTXOs: UTXO[]; // utxo set available for use
  unconfirmedUTXOs: UTXO[]; // utxos to arrive
  balances: Balances; // confirmed/unconfirmed balances
  transactions: Transaction[]; // transactions belonging to this wallet
  lastSynched: number; // wallet's last sync timestamp
  newTransactions?: Transaction[]; // new transactions arrived during the current sync
  txIdMap?: { [txid: string]: string[] }; // tx-mapping; tx insertion checker
  hasNewTxn?: boolean; // indicates new txns
  transactionsNote: TransactionsNote;
  importedAddresses: WalletImportedAddresses;
  transactionsMeta?: TransactionMetaData[];
  node?: LightningNode;
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
  isUsable: boolean; // true if wallet is usable
  derivationDetails: WalletDerivationDetails;
  presentationData: WalletPresentationData;
  specs: WalletSpecs;
}

export interface MultiSigWallet extends Wallet {
  specs: MultiSigWalletSpecs;
}

export interface DonationWallet extends Wallet {
  presentationData: DonationWalletPresentationData;
  specs: WalletSpecs | MultiSigWalletSpecs;
}

export interface TriggerPolicy {
  policyId: string;
  date: string;
  specifications: {};
  version: string;
}

export interface WalletShell {
  shellId: string;
  walletInstanceCount: { [walletType: string]: string[] }; // various wallet types mapped to their correspondings instances id
  wallets: (Wallet | MultiSigWallet | DonationWallet)[];
  trigger?: TriggerPolicy;
}

export interface Vault {}

export interface InheritancePolicy {
  policyId: string;
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
  shellId: string;
  vaultInstanceCount: { [vaultType: string]: string[] }; // various vault types mapped to their correspondings instances id
  vaults: Vault[];
  inheritance?: InheritancePolicy;
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
