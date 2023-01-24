import { ObjectSchema } from 'realm';
import { XpubTypes } from 'src/core/wallets/enums';
import { Balances } from './wallet';
import { RealmSchema } from '../enum';

export const Scheme = {
  type: '{}',
  properties: {
    m: 'int',
    n: 'int',
  },
};

const propertyType = {
  type: '{}?',
  properties: { xpub: 'string', derivationPath: 'string' },
};

export const SignerPolicy: ObjectSchema = {
  name: RealmSchema.SignerPolicy,
  embedded: true,
  properties: {
    verification: {
      type: '{}?',
      properties: {
        method: 'string',
        verifier: 'string?',
      },
    },
    restrictions: {
      type: '{}?',
      properties: {
        none: 'bool',
        maxTransactionAmount: 'int?',
      },
    },
    exceptions: {
      type: '{}?',
      properties: {
        none: 'bool',
        transactionAmount: 'int?',
      },
    },
  },
};

export const XpubDetailsSchema: ObjectSchema = {
  embedded: true,
  name: RealmSchema.XpubDetails,
  properties: {
    [XpubTypes.AMF]: propertyType,
    [XpubTypes.P2PKH]: propertyType,
    [XpubTypes['P2SH-P2WPKH']]: propertyType,
    [XpubTypes['P2SH-P2WSH']]: propertyType,
    [XpubTypes.P2TR]: propertyType,
    [XpubTypes.P2WPKH]: propertyType,
    [XpubTypes.P2WSH]: propertyType,
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
    signerDescription: 'string?',
    lastHealthCheck: 'date',
    addedOn: 'date',
    isMock: 'bool?',
    registered: { type: 'bool?', default: false },
    storageType: 'string',
    signerPolicy: `${RealmSchema.SignerPolicy}?`,
    derivationPath: 'string',
    masterFingerprint: 'string',
    xpubDetails: RealmSchema.XpubDetails,
  },
};

export const VaultPresentationDataSchema: ObjectSchema = {
  name: RealmSchema.VaultPresentationData,
  embedded: true,
  properties: {
    name: 'string',
    description: 'string',
    visibility: 'string',
    shell: 'int',
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
    scriptType: 'string',
  },
  primaryKey: 'id',
};
