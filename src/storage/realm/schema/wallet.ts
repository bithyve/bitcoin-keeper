import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const Balances = {
  type: '{}',
  properties: {
    confirmed: 'int',
    unconfirmed: 'int',
  },
};

export const BIP85ConfigSchema: ObjectSchema = {
  name: RealmSchema.BIP85Config,
  embedded: true,
  properties: {
    index: 'int',
    words: 'int',
    language: 'string',
    derivationPath: 'string',
  },
};

export const LabelSchema: ObjectSchema = {
  name: RealmSchema.Label,
  properties: {
    name: 'string',
    type: 'string',
  },
};

export const UTXOInfoSchema: ObjectSchema = {
  name: RealmSchema.UTXOInfo,
  properties: {
    id: 'string',
    txId: 'string',
    vout: 'int',
    walletId: 'string',
    labels: { type: 'list', objectType: `${RealmSchema.Label}` },
  },
  primaryKey: 'id',
};

export const Tags: ObjectSchema = {
  name: RealmSchema.Tags,
  properties: {
    id: 'string',
    type: 'string',
    ref: 'string',
    label: 'string',
    origin: 'string?',
    isSystem: { type: 'bool', default: false },
  },
  primaryKey: 'id',
};

export const UTXOSchema: ObjectSchema = {
  name: RealmSchema.UTXO,
  embedded: true,
  properties: {
    txId: 'string',
    vout: 'int',
    value: 'int',
    address: 'string',
    height: 'int',
  },
};

export const AddressCacheSchema: ObjectSchema = {
  name: RealmSchema.AddressCache,
  embedded: true,
  properties: {
    external: '{}',
    internal: '{}',
  },
};

export const TransactionSchema: ObjectSchema = {
  name: RealmSchema.Transaction,
  embedded: true,
  properties: {
    txid: 'string',
    address: 'string?',
    confirmations: 'int?',
    fee: 'int?',
    date: 'string?',
    transactionType: 'string?',
    amount: 'int',
    recipientAddresses: 'string[]',
    senderAddresses: 'string[]',
    blockTime: 'int?',
    tags: 'string[]',
  },
};

export const TransactionToAddressMappingSchema: ObjectSchema = {
  name: RealmSchema.TransactionToAddressMapping,
  embedded: true,
  properties: {
    txid: 'string',
    addresses: 'string[]',
  },
};

export const WalletDerivationDetailsSchema: ObjectSchema = {
  name: RealmSchema.WalletDerivationDetails,
  embedded: true,
  properties: {
    instanceNum: 'int?',
    mnemonic: 'string?',
    bip85Config: `${RealmSchema.BIP85Config}?`,
    xDerivationPath: 'string',
  },
};

export const WalletPresentationDataSchema: ObjectSchema = {
  name: RealmSchema.WalletPresentationData,
  embedded: true,
  properties: {
    name: 'string',
    description: 'string',
    visibility: 'string',
    shell: 'int',
  },
};

export const TransferPolicySchema: ObjectSchema = {
  name: RealmSchema.TransferPolicy,
  embedded: true,
  properties: {
    id: 'string',
    threshold: 'int',
  },
};

export const WalletSpecsSchema: ObjectSchema = {
  name: RealmSchema.WalletSpecs,
  embedded: true,
  properties: {
    xpub: 'string',
    xpriv: 'string?',
    nextFreeAddressIndex: 'int',
    nextFreeChangeAddressIndex: 'int',
    totalExternalAddresses: 'int',
    receivingAddress: 'string?',
    addresses: `${RealmSchema.AddressCache}?`,
    addressPubs: '{}?',
    confirmedUTXOs: `${RealmSchema.UTXO}[]`,
    unconfirmedUTXOs: `${RealmSchema.UTXO}[]`,
    balances: Balances,
    transactions: `${RealmSchema.Transaction}[]`,
    txNote: '{}',
    hasNewUpdates: 'bool',
    lastSynched: 'int',
  },
};

export const WhirlpoolWalletDetailsSchema: ObjectSchema = {
  name: RealmSchema.WhirlpoolWalletDetails,
  embedded: true,
  properties: {
    walletId: 'string',
    walletType: 'string',
  },
};

export const WhirlpoolConfigSchema: ObjectSchema = {
  name: RealmSchema.WhirlpoolConfig,
  embedded: true,
  properties: {
    whirlpoolWalletDetails: `${RealmSchema.WhirlpoolWalletDetails}[]`,
  },
};

export const WalletSchema: ObjectSchema = {
  name: RealmSchema.Wallet,
  properties: {
    id: 'string',
    entityKind: 'string',
    type: 'string',
    networkType: 'string',
    isUsable: 'bool',
    derivationDetails: `${RealmSchema.WalletDerivationDetails}?`,
    presentationData: RealmSchema.WalletPresentationData,
    specs: RealmSchema.WalletSpecs,
    scriptType: 'string',
    transferPolicy: `${RealmSchema.TransferPolicy}?`,
    depositWalletId: 'string?',
    whirlpoolConfig: `${RealmSchema.WhirlpoolConfig}?`,
  },
  primaryKey: 'id',
};
