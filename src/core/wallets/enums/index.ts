export enum DerivationPurpose {
  BIP44 = 44, // P2PKH: legacy, single-sig
  BIP48 = 48, // P2WSH & P2SH-P2WSH: native and wrapped segwit, multi-sig
  BIP49 = 49, // P2SH-P2WPKH: wrapped segwit, single-sg
  BIP84 = 84, // P2WPKH: native segwit, single-sig
}

export enum BIP48ScriptTypes {
  WRAPPED_SEGWIT = 'WRAPPED_SEGWIT',
  NATIVE_SEGWIT = 'NATIVE_SEGWIT',
}

export enum BIP85Languages {
  ENGLISH = 'english',
  JAPANESE = 'japanese',
  KOREAN = 'korean',
  SPANISH = 'spanish',
  CHINESE_SIMPLIFIED = 'chinese_simplified',
  CHINESE_TRADITIONAL = 'chinese_traditional',
  FRENCH = 'french',
  ITALIAN = 'italian',
  CZECH = 'czech',
}

export enum BIP85Words {
  TWELVE = 12,
  TWENTY_FOUR = 24,
}

export enum TransactionType {
  RECEIVED = 'Received',
  SENT = 'Sent',
}

export enum TxPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CUSTOM = 'custom',
}

export enum NetworkType {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET',
}

export enum NodeType {
  ONCHAIN = 'ONCHAIN',
  LIGHTNING = 'LIGHTNING',
}

export enum ActiveAddressAssigneeType {
  GIFT = 'GIFT',
}

export enum VisibilityType {
  DEFAULT = 'DEFAULT',
  DURESS = 'DURESS',
  HIDDEN = 'HIDDEN',
  ARCHIVED = 'ARCHIVED',
}

export enum EntityKind {
  WALLET = 'WALLET',
  VAULT = 'VAULT',
}

export enum WalletType {
  CHECKING = 'CHECKING',
  IMPORTED = 'IMPORTED',
  READ_ONLY = 'READ_ONLY',
  SWAN = 'SWAN',
  LIGHTNING = 'LIGHTNING',
}

export enum VaultType {
  DEFAULT = 'DEFAULT',
}

export enum VaultMigrationType {
  UPGRADE = 'UPGRADE',
  DOWNGRADE = 'DOWNGRADE',
  CHANGE = 'CHANGE',
}

export enum SignerType {
  TAPSIGNER = 'TAPSIGNER',
  KEEPER = 'KEEPER',
  TREZOR = 'TREZOR',
  LEDGER = 'LEDGER',
  COLDCARD = 'COLDCARD',
  PASSPORT = 'PASSPORT',
  JADE = 'JADE',
  KEYSTONE = 'KEYSTONE',
  POLICY_SERVER = 'POLICY_SERVER',
  MOBILE_KEY = 'MOBILE_KEY',
}

export enum PaymentInfoKind {
  ADDRESS = 'address',
  PAYMENT_URI = 'paymentURI',
}
