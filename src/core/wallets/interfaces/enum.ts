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

export enum WalletVisibility {
  DEFAULT = 'DEFAULT',
  DURESS = 'DURESS',
  HIDDEN = 'HIDDEN',
  ARCHIVED = 'ARCHIVED',
}

export enum WalletType {
  TEST = 'TEST',
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  DONATION = 'DONATION',
  DEPOSIT = 'DEPOSIT',
  RAMP = 'RAMP',
  SWAN = 'SWAN',
  WYRE = 'WYRE',
  EXCHANGE = 'EXCHANGE',
  FNF = 'FNF',
  LIGHTNING = 'LIGHTNING',
  IMPORTED = 'IMPORTED',
}

export enum GiftThemeId {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
  FOUR = 'FOUR',
  FIVE = 'FIVE',
  SIX = 'SIX',
}

export enum GiftType {
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
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
