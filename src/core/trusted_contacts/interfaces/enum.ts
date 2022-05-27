export enum trustedChannelActions {
  downloadShare = 'downloadShare',
}

export enum InitTrustedContactFlowKind {
  SETUP_TRUSTED_CONTACT = 'SETUP_TRUSTED_CONTACT',
  APPROVE_TRUSTED_CONTACT = 'APPROVE_TRUSTED_CONTACT',
  REJECT_TRUSTED_CONTACT = 'REJECT_TRUSTED_CONTACT',
  EDIT_TRUSTED_CONTACT = 'EDIT_TRUSTED_CONTACT',
}

export enum ShareSplitScheme {
  OneOfOne = '1of1',
  TwoOfThree = '2of3',
  ThreeOfFive = '3of5',
}

export enum KeeperType {
  PRIMARY_KEEPER = 'primaryKeeper',
  DEVICE = 'device',
  CONTACT = 'contact',
  EXISTING_CONTACT = 'existingContact',
  PDF = 'pdf',
  SECURITY_QUESTION = 'securityQuestion',
}

export enum TrustedContactRelationTypes {
  CONTACT = 'CONTACT',
  KEEPER = 'KEEPER',
  PRIMARY_KEEPER = 'PRIMARY_KEEPER',
  WARD = 'WARD',
  KEEPER_WARD = 'KEEPER_WARD',
  EXISTING_CONTACT = 'EXISTING_CONTACT',
}

// TODO: Export from src/common interfaces
export enum ScannedAddressKind {
  ADDRESS = 'address',
  PAYMENT_URI = 'paymentURI',
}

export enum QRCodeTypes {
  CONTACT_REQUEST = 'CONTACT_REQUEST',
  KEEPER_REQUEST = 'KEEPER_REQUEST',
  PRIMARY_KEEPER_REQUEST = 'PRIMARY_KEEPER_REQUEST',
  RECOVERY_REQUEST = 'RECOVERY_REQUEST',
  EXISTING_CONTACT = 'EXISTING_CONTACT',
  APPROVE_KEEPER = 'APPROVE_KEEPER',
  GIFT = 'GIFT',
  CONTACT_GIFT = 'CONTACT_GIFT',
}

export enum DeepLinkKind {
  CONTACT = 'CONTACT',
  KEEPER = 'KEEPER',
  PRIMARY_KEEPER = 'PRIMARY_KEEPER',
  RECIPROCAL_KEEPER = 'RECIPROCAL_KEEPER',
  EXISTING_CONTACT = 'EXISTING_CONTACT',
  GIFT = 'GIFT',
  CONTACT_GIFT = 'CONTACT_GIFT',
  CAMPAIGN = 'CAMPAIGN',
}

export enum DeepLinkEncryptionType {
  DEFAULT = 'DEFAULT',
  NUMBER = 'NUM',
  EMAIL = 'EMAIL',
  OTP = 'OTP',
  LONG_OTP = 'LONG_OTP',
  SECRET_PHRASE = 'SECRET_PHRASE',
}
