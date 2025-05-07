import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const BalancesSchema: Realm.ObjectSchema = {
  name: RealmSchema.Balances,
  embedded: true,
  properties: {
    confirmed: { type: 'int', default: 0 },
    unconfirmed: { type: 'int', default: 0 },
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

// DEPRECATED
export const LabelSchema: ObjectSchema = {
  name: RealmSchema.Label,
  properties: {
    name: 'string',
    type: 'string',
  },
};

// DEPRECATED
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
    external: 'mixed?',
    internal: 'mixed?',
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
    addressPubs: 'mixed?',
    confirmedUTXOs: `${RealmSchema.UTXO}[]`,
    unconfirmedUTXOs: `${RealmSchema.UTXO}[]`,
    balances: { type: 'object', objectType: RealmSchema.Balances },
    transactions: `${RealmSchema.Transaction}[]`,
    hasNewUpdates: 'bool',
    lastSynched: 'int',
  },
};

export const WalletSchema: ObjectSchema = {
  name: RealmSchema.Wallet,
  properties: {
    id: 'string',
    entityKind: 'string',
    type: 'string',
    networkType: 'string',
    derivationDetails: `${RealmSchema.WalletDerivationDetails}?`,
    presentationData: RealmSchema.WalletPresentationData,
    specs: RealmSchema.WalletSpecs,
    scriptType: 'string',
  },
  primaryKey: 'id',
};
