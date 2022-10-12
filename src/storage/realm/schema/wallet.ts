import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const Balances = {
  type: '{}',
  properties: {
    confirmed: 'int',
    unconfirmed: 'int',
  },
};

const UTXOStatus = {
  type: '{}',
  properties: {
    confirmed: 'bool',
    block_height: 'int?',
    block_hash: 'string?',
    block_time: 'int?',
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

export const ActiveAddressesSchema: ObjectSchema = {
  name: RealmSchema.ActiveAddresses,
  embedded: true,
  properties: {
    external: '{}',
    internal: '{}',
  },
};

export const UTXOSchema: ObjectSchema = {
  name: RealmSchema.UTXO,
  embedded: true,
  properties: {
    txId: 'string',
    vout: 'int',
    value: 'int',
    address: 'string',
    status: UTXOStatus,
  },
};

export const TransactionSchema: ObjectSchema = {
  name: RealmSchema.Transaction,
  embedded: true,
  properties: {
    txid: 'string',
    status: 'string?',
    confirmations: 'int?',
    fee: 'int?',
    date: 'string?',
    transactionType: 'string?',
    amount: 'int',
    walletType: 'string',
    walletName: 'string?',
    contactName: 'string?',
    recipientAddresses: 'string[]',
    senderAddresses: 'string[]',
    blockTime: 'int?',
    message: 'string?',
    address: 'string?',
    type: 'string?',
    // sender: 'string',
    // senderId: 'string',
    // receivers: {
    //   type: 'list',
    //   properties: {
    //     id: 'string?',
    //     name: 'string',
    //     amount: 'number',
    //   },
    // },
    tags: 'string[]',
    notes: 'string?',
    isNew: 'bool?',
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
    instanceNum: 'int',
    mnemonic: 'string',
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
    activeAddresses: RealmSchema.ActiveAddresses,
    importedAddresses: '{}',
    confirmedUTXOs: `${RealmSchema.UTXO}[]`,
    unconfirmedUTXOs: `${RealmSchema.UTXO}[]`,
    balances: Balances,
    transactions: `${RealmSchema.Transaction}[]`,
    newTransactions: `${RealmSchema.Transaction}[]`,
    lastSynched: 'int',
    hasNewTxn: 'bool?',
    txIdCache: '{}',
    transactionMapping: `${RealmSchema.TransactionToAddressMapping}[]`,
    transactionNote: '{}',
    transferPolicy: 'int',
  },
};

export const WalletSchema: ObjectSchema = {
  name: RealmSchema.Wallet,
  properties: {
    id: 'string',
    walletShellId: 'string',
    entityKind: 'string',
    type: 'string',
    networkType: 'string',
    isUsable: 'bool',
    derivationDetails: `${RealmSchema.WalletDerivationDetails}?`,
    presentationData: RealmSchema.WalletPresentationData,
    specs: RealmSchema.WalletSpecs,
  },
  primaryKey: 'id',
};
