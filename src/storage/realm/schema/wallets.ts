import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

const UTXO = {
  type: '{}',
  properties: {
    txId: 'string',
    vout: 'int',
    value: 'int',
    address: 'string',
    status: 'string?',
  },
};

const Balances = {
  type: '{}',
  properties: {
    confirmed: 'int',
    unconfirmed: 'int',
  },
};

const BIP85Config = {
  type: '{}',
  properties: {
    index: 'int',
    words: 'int',
    language: 'string',
    derivationPath: 'string',
  },
};

export const WalletDerivationDetailsSchema: ObjectSchema = {
  name: RealmSchema.WalletDerivationDetails,
  embedded: true,
  properties: {
    networkType: 'string',
    instanceNum: 'int',
    mnemonic: 'string',
    bip85Config: BIP85Config,
    xDerivationPath: 'string',
  },
};

export const WalletPresentationDataSchema: ObjectSchema = {
  name: RealmSchema.WalletPresentationData,
  embedded: true,
  properties: {
    walletName: 'string',
    walletDescription: 'string',
    walletVisibility: 'string',
    isSynching: 'bool',
  },
};

export const WalletSpecsSchema: ObjectSchema = {
  name: RealmSchema.WalletSpecs,
  embedded: true,
  properties: {
    xpub: 'string',
    xpriv: 'string',
    receivingAddress: 'string',
    nextFreeAddressIndex: 'int',
    nextFreeChangeAddressIndex: 'int',
    // activeAddresses: '{}',
    // confirmedUTXOs: { type: 'list', objectType: UTXO },
    // unconfirmedUTXOs: { type: 'list', objectType: UTXO },
    // balances: Balances,
    // transactions: '{}',
    // lastSynched: 'int',
    // newTransactions: '{}?',
    // txIdMap: '{}?',
    // hasNewTxn: 'bool?',
    transactionsNote: '{}',
    importedAddresses: '{}',
    // transactionsMeta?:'{}?';
  },
};

export const WalletSchema: ObjectSchema = {
  name: RealmSchema.Wallet,
  properties: {
    id: 'string',
    type: 'string',
    walletShellId: 'string',
    isUsable: 'bool',
    derivationDetails: RealmSchema.WalletDerivationDetails,
    presentationData: RealmSchema.WalletPresentationData,
    specs: RealmSchema.WalletSpecs,
  },
  primaryKey: 'id',
};
