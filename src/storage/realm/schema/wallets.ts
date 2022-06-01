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

const WalletDerivationDetails = {
  type: '{}',
  properties: {
    networkType: 'string',
    instanceNum: 'int',
    mnemonic: 'string',
    bip85Config: BIP85Config,
    xDerivationPath: 'string',
  },
};

const WalletPresentationData = {
  type: '{}',
  properties: {
    walletName: 'string',
    walletDescription: 'string',
    walletVisibility: 'string',
    isSynching: 'bool',
  },
};

const WalletSpecs = {
  type: '{}',
  properties: {
    xpub: 'string',
    xpriv: 'string',
    activeAddresses: '{}',
    receivingAddress: 'string',
    nextFreeAddressIndex: 'int',
    nextFreeChangeAddressIndex: 'int',
    confirmedUTXOs: { type: 'list', objectType: UTXO },
    unconfirmedUTXOs: { type: 'list', objectType: UTXO },
    balances: Balances,
    transactions: '{}',
    lastSynched: 'int',
    newTransactions: '{}?',
    txIdMap: '{}?',
    hasNewTxn: 'bool?',
    transactionsNote: '{}',
    importedAddresses: '{}',
    transactionsMeta: '{}?',
    node: '{}?',
  },
};

export const WalletSchema: ObjectSchema = {
  name: RealmSchema.Wallet,
  properties: {
    id: 'string',
    type: 'string',
    isUsable: 'bool',
    derivationDetails: WalletDerivationDetails,
    presentationData: WalletPresentationData,
    specs: WalletSpecs,
  },
  primaryKey: 'id',
};
