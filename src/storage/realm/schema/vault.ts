import { Balances } from './wallet';
import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const Scheme = {
  type: '{}',
  properties: {
    m: 'int',
    n: 'int',
  },
};

export const VaultSignerSchema: ObjectSchema = {
  name: RealmSchema.VaultSigner,
  embedded: true,
  properties: {
    signerId: 'string',
    type: 'string',
    xpub: 'string',
    xpriv: 'string?',
    signerName: 'string?',
    xpubInfo: {
      type: '{}?',
      properties: {
        derivationPath: 'string?',
      },
    },
    lastHealthCheck: 'date',
  },
};

export const VaultPresentationDataSchema: ObjectSchema = {
  name: RealmSchema.VaultPresentationData,
  embedded: true,
  properties: {
    name: 'string',
    description: 'string',
    visibility: 'string',
  },
};

export const VaultSpecsSchema: ObjectSchema = {
  name: RealmSchema.VaultSpecs,
  embedded: true,
  properties: {
    xpubs: 'string[]',
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
  },
};

export const VaultSchema: ObjectSchema = {
  name: RealmSchema.Vault,
  properties: {
    id: 'string',
    vaultShellId: 'string',
    entityKind: 'string',
    type: 'string',
    networkType: 'string',
    isUsable: 'bool',
    isMultiSig: 'bool',
    scheme: Scheme,
    signers: `${RealmSchema.VaultSigner}[]`,
    presentationData: RealmSchema.VaultPresentationData,
    specs: RealmSchema.VaultSpecs,
    VAC: 'string',
    archived: 'bool',
  },
  primaryKey: 'id',
};
