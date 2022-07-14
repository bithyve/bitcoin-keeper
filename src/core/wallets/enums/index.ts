export enum DerivationPurpose {
  BIP44 = 44,
  BIP49 = 49,
  BIP84 = 84,
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
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CUSTOM = 'Custom',
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
