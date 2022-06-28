import { Balances } from './wallets';
import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const Scheme = {
  type: '{}',
  properties: {
    m: 'int',
    n: 'int',
  },
};

export const VaultPresentationDataSchema: ObjectSchema = {
  name: RealmSchema.VaultPresentationData,
  embedded: true,
  properties: {
    vaultName: 'string',
    vaultDescription: 'string',
    vaultVisibility: 'string',
  },
};

export const VaultSpecsSchema: ObjectSchema = {
  name: RealmSchema.VaultSpecs,
  properties: {
    is2FA: 'bool',
    xpubs: 'string[]',
    receivingAddress: 'string',
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
    transactionsNote: '{}',
  },
};

export const VaultSchema: ObjectSchema = {
  name: RealmSchema.Vault,
  properties: {
    id: 'string',
    scheme: Scheme,
    vaultShellId: 'string',
    isUsable: 'bool',
    signers: `${RealmSchema.VaultSigner}[]`,
    presentationData: RealmSchema.VaultPresentationData,
    specs: RealmSchema.VaultSpecs,
  },
  primaryKey: 'id',
};
