import { ImageSourcePropType } from 'react-native'

export enum DerivationPurpose {
  BIP44 = 44,
  BIP49 = 49,
  BIP84 = 84
}

export enum BIP85Languages {
  ENGLISH = "english",
  JAPANESE = "japanese",
  KOREAN = "korean",
  SPANISH = "spanish",
  CHINESE_SIMPLIFIED = "chinese_simplified",
  CHINESE_TRADITIONAL = "chinese_traditional",
  FRENCH = "french",
  ITALIAN = "italian",
  CZECH = "czech",
}

export enum BIP85Words {
  TWELVE = 12,
  TWENTY_FOUR = 24
}

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

export interface TransactionPrerequisiteElements {
  inputs?: InputUTXOs[];
  outputs?: OutputUTXOs[];
  fee?: number;
  estimatedBlocks?: number;
}

export interface TransactionPrerequisite {
  [txnPriority: string]: TransactionPrerequisiteElements
}

export enum TransactionType {
  RECEIVED = 'Received',
  SENT = 'Sent',
}
export interface Transaction {
  txid: string;
  status?: string;
  confirmations?: number;

  /**
   * Sats per byte
   */
  fee?: string;

  /**
   * UTC string
   */
  date?: string;

  /**
   * Inbound(Received)/Outbound(Sent) transaction
   */
  transactionType?: TransactionType;

  /**
   * Amount in Satoshis.
   */
  amount: number;

  /**
   * Account(sub) to which the transaction belongs
   */
  accountType: string;

  /**
   * Account(primary-sub) to which the transaction belongs
   */
  primaryAccType?: string;

   /**
   * Name of the account(custom) to which the transaction belongs
   */
  accountName?: string;

  /**
   * Name of the contact in case of an inbound transaction from trusted-contact
   */
  contactName?: string;

  /**
   * Outbound transaction's destination
   */
  recipientAddresses?: string[];

  /**
   * Inbound transaction's source
   */
  senderAddresses?: string[];

  blockTime?: number;

  /**
   * Note/message attached w/ the transaction(Donation acc specific)
   */
  message?: string;

   /**
   * Address corresponding to which this tx has been fetched
   */
  address?: string
  type?: string
  // sender name
  sender?: string,
  senderId?: string,
  // receivers info
  receivers?: { id?: string, name: string, amount: number}[]
  // txn tags
  tags?: string[]
  // txn notes
  notes?: string
  // indicates that this is a new tx
  isNew?: boolean
}

export type TransactionDetails = Transaction

export interface Balances {
  confirmed: number;
  unconfirmed: number;
}

export enum TxPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CUSTOM = 'custom'
}

export interface Transactions {
  totalTransactions: number;
  confirmedTransactions: number;
  unconfirmedTransactions: number;
  transactionDetails: Array<Transaction>;
}

export interface MetaShare {
  encryptedShare?: {
    pmShare: string;
  };
  shareId: string;
  meta: {
    version: string;
    validator: string;
    index: number;
    walletId: string;
    tag: string;
    timestamp: string;
    reshareVersion: number;
    questionId: string;
    question?: string;
    guardian?: string;
    encryptedKeeperInfo?: string;
    scheme?: ShareSplitScheme,
  };
}

export enum trustedChannelActions {
  downloadShare = 'downloadShare',
}

export interface TrustedDataElements {
  xpub?: string;
  tpub?: string;
  walletID?: string;
  FCM?: string;
  walletName?: string;
  shareTransferDetails?: {
    otp: string;
    encryptedKey: string;
  };
  removeGuardian?: boolean;
  remove?: boolean;
  version?: string;
  isPrimary?: boolean;
  featuresList?: any;
  xPub?: any;
  securityQuestion?: any;
  metaShare? : MetaShare;
  pdfShare? : MetaShare;
  secondaryMnemonics?: string;
  twoFASetup?: {
      qrData: string;
      secret: string;
  };
  secondaryShare?: MetaShare;
  keeperInfo?: string;
}
export interface TrustedData {
  publicKey: string;
  data: TrustedDataElements;
  lastSeen?: number;
  encDataHash?: string;
}

export interface EncryptedTrustedData {
  publicKey: string;
  encryptedData: string; // encrypted TrustedData
  lastSeen?: number;
  dataHash?: string; // hash of the encrypted TrustedData (TrustedData's encDataHash = dataHash)
}

export interface ContactElements {
  privateKey: string;
  publicKey: string;
  encKey: string;
  otp?: string;
  symmetricKey?: string;
  secondaryKey?: string;
  contactsPubKey?: string;
  contactsWalletName?: string;
  isWard?: boolean;
  isGuardian?: boolean;
  walletID?: string;
  FCMs?: string[];
  ephemeralChannel?: {
    address: string;
    initiatedAt?: number;
    data?: EphemeralDataElements[];
  };
  trustedChannel?: {
    address: string;
    data?: TrustedData[];
  };
  lastSeen?: number;
  trustedAddress?: string;
  trustedTestAddress?: string;
}
export interface Contacts {
  [contactName: string]: ContactElements
}

export interface ContactDetails {
  id: string,
  contactName?: string,
  image?: ImageSourcePropType | null,
}

export interface ChannelAssets {
  shareId?: string,
  primaryMnemonicShard?: any,
  keeperInfo?: any,
  secondaryMnemonicShard?: any,
  bhXpub?: string
}

export enum InitTrustedContactFlowKind {
  SETUP_TRUSTED_CONTACT = 'SETUP_TRUSTED_CONTACT',
  APPROVE_TRUSTED_CONTACT = 'APPROVE_TRUSTED_CONTACT',
  REJECT_TRUSTED_CONTACT = 'REJECT_TRUSTED_CONTACT',
  EDIT_TRUSTED_CONTACT = 'EDIT_TRUSTED_CONTACT'
}

export interface ContactInfo  {
  contactDetails?: ContactDetails,
  isKeeper?: boolean,
  channelKey?: string,
  secondaryChannelKey?: string
  contactsSecondaryChannelKey?: string,
  channelAssets?: {
    primaryMnemonicShard?: any,
    keeperInfo?: any,
    secondaryMnemonicShard?: any,
    bhXpub?: string
  },
  flowKind?: InitTrustedContactFlowKind
}
export interface PrimaryStreamData {
  walletID?: string,
  walletName?: string,
  relationType?: TrustedContactRelationTypes,
  FCM?: string,
  contactDetails?: ContactDetails,
  paymentAddresses?: {
    [accountType: string]: string
  },
  giftDeepLink?: string,

  // primary keeper exclusives
  secondarySetupData? :{
    secondaryXpub: string
    secondaryShardWI: string
  },
  bhXpub?: string,
}

export interface SecondaryStreamData {
  secondaryMnemonicShard?: any,
  bhXpub?: string,
}

export interface BackupStreamData {
  primaryMnemonicShard?: MetaShare,
  keeperInfo?: any,
}

export interface UnecryptedStreamData {
  streamId: string,
  primaryData?: PrimaryStreamData,
  secondaryData?: SecondaryStreamData,     // in/out-stream secondaryData = null
  backupData?: BackupStreamData | null, // in/out-stream backupData = null
  metaData?: {
    flags?: {
      active?: boolean,
      lastSeen: number,
      newData?: boolean,
    },
    version?: string
  }
}

export type UnecryptedStreams = {
  [streamId: string]: UnecryptedStreamData
}
export interface StreamData {
  streamId: string,
  primaryEncryptedData?: string // CH encrypted: encrypted via primary channel key
  secondaryEncryptedData?: string // CH2 encrypted: encrypted via secondary channel key & is not stored in the app
  encryptedBackupData?: string, // not stored in the app
  metaData?: {
    flags?: {
      active?: boolean,
      lastSeen: number,
      newData?: boolean,
    },
    version?: string
  }
}

export type Streams = {
  [streamId: string]: StreamData
}

export enum TrustedContactRelationTypes {
  CONTACT = 'CONTACT',
  KEEPER  = 'KEEPER',
  PRIMARY_KEEPER = 'PRIMARY_KEEPER',
  WARD = 'WARD',
  KEEPER_WARD = 'KEEPER_WARD',
  EXISTING_CONTACT = 'EXISTING_CONTACT'
}

export interface TrustedContact {
  contactDetails: ContactDetails,
  relationType: TrustedContactRelationTypes,
  channelKey: string,
  permanentChannelAddress: string,
  isActive: boolean, // is the channel active
  hasNewData: boolean, // instream has new data
  permanentChannel?: Streams, // encrypted and uploaded to Relay
  unencryptedPermanentChannel?: UnecryptedStreams, // unecrypted retained copy
  secondaryChannelKey?: string | null, // temporary secondaryKey(removed post successful contact setup)
  streamId?: string, // contact's streamId
  walletID?: string, // contact's walletId
  contactsSecondaryChannelKey?: string, // contacts secondaryKey(stored locally)
  deepLinkConfig?: {
    encryptionType: DeepLinkEncryptionType,
    encryptionKey: string | null,
  },
  timestamps: {
    created: number,
  }
}
export interface Trusted_Contacts {
  [channelKey: string]: TrustedContact
}

export enum ShareSplitScheme {
  OneOfOne = '1of1',
  TwoOfThree = '2of3',
  ThreeOfFive = '3of5'
}

export enum KeeperType {
  PRIMARY_KEEPER = 'primaryKeeper',
  DEVICE = 'device',
  CONTACT = 'contact',
  EXISTING_CONTACT = 'existingContact',
  PDF = 'pdf',
  SECURITY_QUESTION = 'securityQuestion',
}

export enum ScannedAddressKind {
  ADDRESS = 'address',
  PAYMENT_URI = 'paymentURI',
}

export interface AverageTxFees {
  [priority: string]: {
    averageTxFee: number,
    feePerByte: number,
    estimatedBlocks: number,
  },
}

export enum QRCodeTypes {
  CONTACT_REQUEST = 'CONTACT_REQUEST',
  KEEPER_REQUEST = 'KEEPER_REQUEST',
  PRIMARY_KEEPER_REQUEST = 'PRIMARY_KEEPER_REQUEST',
  RECOVERY_REQUEST = 'RECOVERY_REQUEST',
  EXISTING_CONTACT = 'EXISTING_CONTACT',
  APPROVE_KEEPER = 'APPROVE_KEEPER',
  GIFT = 'GIFT',
  CONTACT_GIFT = 'CONTACT_GIFT'
}

export interface UTXO {
  txId: string;
  vout: number;
  value: number;
  address: string;
  status?: any;
}


export enum ActiveAddressAssigneeType  {
    GIFT = 'GIFT'
}
export interface ActiveAddressAssignee{
    type: AccountType | ActiveAddressAssigneeType;
    id?: string;
    senderInfo?: {
      id?: string
      name: string,
    };
    recipientInfo?: {
      [txid: string]: {id?: string, name: string, amount: number}[],
    };
}
export interface ActiveAddresses {
  external: {
    [address: string]: {
      index: number,
      assignee: ActiveAddressAssignee,
    }
  }
  internal: {
    [address: string]: {
      index: number,
      assignee: ActiveAddressAssignee,
    }
  }
}

export enum NetworkType {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET'
}

export interface TwoFADetails {
    bithyveXpub?: string,
    twoFAKey?: string,
    twoFAValidated?: boolean,
}

export interface Wallet {
  walletId: string,
  walletName: string,
  userName?: string,
  security: { questionId: string, question: string, answer: string },
  primaryMnemonic: string,
  primarySeed: string,
  secondaryXpub?: string,
  details2FA?: TwoFADetails,
  smShare?: string,
  accounts: {
    [accountType: string]: string[] // array of accountIds
  },
  version: string,
}

export interface LightningNode {
  host?: string,
  port?: string,
  url?: string,
  lndhubUrl?: string,
  existingAccount?: boolean,
  macaroonHex?: string,
  accessKey?: string,
  username?: string,
  password?: string,
  implementation?: string,
  certVerification?: boolean,
  enableTor?: boolean
}

export enum AccountVisibility {
  DEFAULT = 'DEFAULT',
  DURESS = 'DURESS',
  HIDDEN = 'HIDDEN',
  ARCHIVED = 'ARCHIVED',
}

export interface BIP85Config {
    index: number,                      
    words: number,
    language: string,
    derivationPath: string,
}
export interface Account {
  id: string,                           // account identifier(derived from xpub)
  isUsable: boolean,                    // true if account is usable
  walletId: string,                     // wallet's id
  type: AccountType,                    // type of account
  instanceNum: number,                  // instance number of the aforementioned type
  networkType: NetworkType,             // testnet/mainnet
  mnemonic: string,                     // mnemonic of the account
  bip85Config: BIP85Config,             // bip85 configuration leading to the derivation path for the corresponding entropy
  xDerivationPath: string,              // derivation path of the extended keys belonging to this account
  xpub: string | null,                  // account's xpub (primary for multi-sig accounts)
  xpriv: string | null,                 // account's xpriv (primary for multi-sig accounts)
  accountName: string,                  // name of the account
  accountDescription: string,           // description of the account
  accountVisibility: AccountVisibility, // visibility of the account
  activeAddresses: ActiveAddresses,     // addresses being actively used by this account
  receivingAddress: string,             // current external address
  nextFreeAddressIndex: number;         // external-chain free address marker
  nextFreeChangeAddressIndex: number;   // internal-chain free address marker
  confirmedUTXOs: UTXO[];               // utxo set available for use
  unconfirmedUTXOs: UTXO[];             // utxos to arrive
  balances: Balances;                   // confirmed/unconfirmed balances
  transactions: Transaction[];          // transactions belonging to this account
  lastSynched: number;                  // account's last sync timestamp
  newTransactions?: Transaction[];      // new transactions arrived during the current sync
  txIdMap?: {[txid: string]: string[]}; // tx-mapping; tx insertion checker
  hasNewTxn?: boolean;                  // indicates new txns
  transactionsNote : {
    [txId: string]: string
  },
  importedAddresses: {                  // non-xpub/imported addresses
    [address: string]: {
      address: string,
      privateKey: string
    }
  },
  transactionsMeta?: {
    receivers: {name: string, amount: number}[];
    sender: string;
    txid: string;
    notes: string;
    tags: string[]
    amount: number;
    accountType: string;
    address: string;
    isNew: boolean
    type: string;
  }[]
  node?: LightningNode
}
export interface MultiSigAccount extends Account {
  is2FA: boolean,                       // is2FA enabled
  xpubs: {                              // additional xpubs for multi-sig
    secondary: string,
    bithyve: string,
  }
  xprivs: {                             // additional xpirvs for multi-sig
    secondary?: string,
  }
}

export interface DonationAccount extends Account {
  donee: string;
  donationName: string;
  donationDescription: string;
  configuration: {
    displayBalance: boolean;
    displayIncomingTxs: boolean;
    displayOutgoingTxs: boolean;
  };
  disableAccount: boolean;
  is2FA: boolean,                       // is2FA enabled
  xpubs?: {                             // additional xpubs for multi-sig
    secondary: string,
    bithyve: string,
  }
  xprivs?: {                            // additional xpirvs for multi-sig
    secondary?: string,
  },
}

export enum AccountType {
  TEST_ACCOUNT = 'TEST_ACCOUNT',
  CHECKING_ACCOUNT = 'CHECKING_ACCOUNT',
  SAVINGS_ACCOUNT = 'SAVINGS_ACCOUNT',
  DONATION_ACCOUNT = 'DONATION_ACCOUNT',
  DEPOSIT_ACCOUNT = 'DEPOSIT_ACCOUNT',
  RAMP_ACCOUNT = 'RAMP_ACCOUNT',
  SWAN_ACCOUNT = 'SWAN_ACCOUNT',
  WYRE_ACCOUNT = 'WYRE_ACCOUNT',
  EXCHANGE_ACCOUNT = 'EXCHANGE_ACCOUNT',
  FNF_ACCOUNT = 'FNF_ACCOUNT',
  LIGHTNING_ACCOUNT = 'LIGHTNING_ACCOUNT',
  IMPORTED_ACCOUNT = 'IMPORTED_ACCOUNT'
}

export interface Accounts {
    [accountId: string]: Account | MultiSigAccount | DonationAccount
}

export enum DeepLinkKind {
  CONTACT = 'CONTACT',
  KEEPER = 'KEEPER',
  PRIMARY_KEEPER = 'PRIMARY_KEEPER',
  RECIPROCAL_KEEPER = 'RECIPROCAL_KEEPER',
  EXISTING_CONTACT = 'EXISTING_CONTACT',
  GIFT = 'GIFT',
  CONTACT_GIFT = 'CONTACT_GIFT',
  CAMPAIGN = 'CAMPAIGN'
}

export enum DeepLinkEncryptionType {
  DEFAULT = 'DEFAULT',
  NUMBER = 'NUM',
  EMAIL = 'EMAIL',
  OTP = 'OTP',
  LONG_OTP = 'LONG_OTP',
  SECRET_PHRASE = 'SECRET_PHRASE'
}

export enum GiftThemeId {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
  FOUR = 'FOUR',
  FIVE = 'FIVE',
  SIX= 'SIX'
}

export enum GiftType {
  SENT = 'SENT',
  RECEIVED = 'RECEIVED'
}

export enum GiftStatus {
  CREATED = 'CREATED',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  RECLAIMED = 'RECLAIMED',
  ASSOCIATED = 'ASSOCIATED',
  EXPIRED = 'EXPIRED',
}

export interface Gift {
  id: string,
  privateKey: string,
  address: string,
  channelAddress?: string,
  amount: number,
  type: GiftType,
  status: GiftStatus,
  themeId: GiftThemeId,
  timestamps: {
    created: number,
    sent?: number,
    accepted?: number,
    reclaimed?: number,
    associated?: number,
    rejected?: number,
  },
  validitySpan?: number,
  sender: {
    walletId: string,
    accountId: string,
    walletName: string,
    contactId?: string // permanentAddress of the contact
  },
  receiver: {
    walletId?: string,
    accountId?: string,
    walletName?: string,
    contactId?: string // permanentAddress of the contact
  },
  note?: string,
  exclusiveGiftCode?: string,
  deepLinkConfig?: {
    encryptionType: string,
    encryptionKey: string,
  },
}

export interface GiftMetaData {
  status: GiftStatus,
  validity?: {
    sentAt: number,
    validitySpan: number,
  },
  exclusiveGiftCode?: string,
  notificationInfo?: {
    walletId: string,
    FCM: string,
  }
}

