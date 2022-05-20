import {
  AccountType,
  AccountVisibility,
  ActiveAddressAssigneeType,
  GiftStatus,
  GiftThemeId,
  GiftType,
  NetworkType,
  TransactionType,
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
  accountType: string;
  primaryAccType?: string;
  accountName?: string;
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
  accountType: string;
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

export interface Transactions {
  totalTransactions: number;
  confirmedTransactions: number;
  unconfirmedTransactions: number;
  transactionDetails: Array<Transaction>;
}

export interface UTXO {
  txId: string;
  vout: number;
  value: number;
  address: string;
  status?: any;
}

export interface AccountImportedAddresses {
  [address: string]: {
    address: string;
    privateKey: string;
  };
}

export interface ActiveAddressAssignee {
  type: AccountType | ActiveAddressAssigneeType;
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

export interface LightningNode {
  host?: string;
  port?: string;
  url?: string;
  lndhubUrl?: string;
  existingAccount?: boolean;
  macaroonHex?: string;
  accessKey?: string;
  username?: string;
  password?: string;
  implementation?: string;
  certVerification?: boolean;
  enableTor?: boolean;
}

export interface AccountDerivationDetails {
  networkType: NetworkType; // testnet/mainnet
  instanceNum: number; // instance number of this particular accountType
  mnemonic: string; // mnemonic of the account
  bip85Config: BIP85Config; // bip85 configuration leading to the derivation path for the corresponding entropy
  xDerivationPath: string; // derivation path of the extended keys belonging to this account
}

export interface AccountPresentationData {
  accountName: string; // name of the account
  accountDescription: string; // description of the account
  accountVisibility: AccountVisibility; // visibility of the account
  isSynching: boolean; // sync status of the account
}

export interface DonationAccountPresentationData extends AccountPresentationData {
  donee: string;
  donationName: string;
  donationDescription: string;
  configuration: {
    displayBalance: boolean;
    displayIncomingTxs: boolean;
    displayOutgoingTxs: boolean;
  };
  disableAccount: boolean;
}

export interface AccountSpecs {
  xpub: string | null; // account's xpub (primary for multi-sig accounts)
  xpriv: string | null; // account's xpriv (primary for multi-sig accounts)
  activeAddresses: ActiveAddresses; // addresses being actively used by this account
  receivingAddress: string; // current external address
  nextFreeAddressIndex: number; // external-chain free address marker
  nextFreeChangeAddressIndex: number; // internal-chain free address marker
  confirmedUTXOs: UTXO[]; // utxo set available for use
  unconfirmedUTXOs: UTXO[]; // utxos to arrive
  balances: Balances; // confirmed/unconfirmed balances
  transactions: Transaction[]; // transactions belonging to this account
  lastSynched: number; // account's last sync timestamp
  newTransactions?: Transaction[]; // new transactions arrived during the current sync
  txIdMap?: { [txid: string]: string[] }; // tx-mapping; tx insertion checker
  hasNewTxn?: boolean; // indicates new txns
  transactionsNote: TransactionsNote;
  importedAddresses: AccountImportedAddresses;
  transactionsMeta?: TransactionMetaData[];
  node?: LightningNode;
}

export interface MultiSigAccountSpecs extends AccountSpecs {
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

export interface Account {
  id: string; // account identifier(derived from xpub)
  type: AccountType; // type of account
  isUsable: boolean; // true if account is usable
  derivationDetails: AccountDerivationDetails;
  presentationData: AccountPresentationData;
  specs: AccountSpecs;
}

export interface MultiSigAccount extends Account {
  specs: MultiSigAccountSpecs;
}

export interface DonationAccount extends Account {
  presentationData: DonationAccountPresentationData;
  specs: AccountSpecs | MultiSigAccountSpecs;
}

export interface Accounts {
  [accountId: string]: Account | MultiSigAccount | DonationAccount;
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
    walletId: string;
    accountId: string;
    walletName: string;
    contactId?: string; // permanentAddress of the contact
  };
  receiver: {
    walletId?: string;
    accountId?: string;
    walletName?: string;
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
