import { ObjectSchema } from 'realm';
// import { XpubTypes } from 'src/core/wallets/enums';
import { Balances } from './wallet';
import { RealmSchema } from '../enum';

const Scheme = {
  type: '{}',
  properties: {
    m: 'int',
    n: 'int',
  },
};

// const propertyType = {
//   type: '{}?',
//   properties: { xpub: 'string', derivationPath: 'string', xpriv: 'string?' },
// };

// const deviceInfo = {
//   type: '{}?',
//   properties: {
//     registerdWallet: 'string?',
//   },
// };

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

export const InheritanceConfigurationSchema: ObjectSchema = {
  name: RealmSchema.InheritanceConfiguration,
  embedded: true,
  properties: {
    m: 'int',
    n: 'int',
    descriptors: 'string[]',
    bsms: 'string?',
  },
};

export const InheritancePolicyNotificationSchema: ObjectSchema = {
  name: RealmSchema.InheritancePolicyNotification,
  embedded: true,
  properties: {
    targets: 'string[]',
  },
};

export const InheritancePolicyAlertSchema: ObjectSchema = {
  name: RealmSchema.InheritancePolicyAlert,
  embedded: true,
  properties: {
    emails: 'string[]',
  },
};

export const InheritancePolicySchema: ObjectSchema = {
  name: RealmSchema.InheritancePolicy,
  embedded: true,
  properties: {
    notification: RealmSchema.InheritancePolicyNotification,
    alert: `${RealmSchema.InheritancePolicyAlert}?`,
  },
};

export const InheritanceKeyInfoSchema: ObjectSchema = {
  name: RealmSchema.InheritanceKeyInfo,
  embedded: true,
  properties: {
    configuration: RealmSchema.InheritanceConfiguration,
    policy: `${RealmSchema.InheritancePolicy}?`,
  },
};

// export const XpubDetailsSchema: ObjectSchema = {
//   embedded: true,
//   name: RealmSchema.XpubDetails,
//   properties: {
//     [XpubTypes.AMF]: propertyType,
//     [XpubTypes.P2PKH]: propertyType,
//     [XpubTypes['P2SH-P2WPKH']]: propertyType,
//     [XpubTypes['P2SH-P2WSH']]: propertyType,
//     [XpubTypes.P2TR]: propertyType,
//     [XpubTypes.P2WPKH]: propertyType,
//     [XpubTypes.P2WSH]: propertyType,
//   },
// };

export const VaultSignerSchema: ObjectSchema = {
  name: RealmSchema.VaultSigner,
  primaryKey: 'masterFingerprint',
  properties: {
    masterFingerprint: 'string',
    type: 'string',
    signerXpubs: `{}`,
    signerName: 'string?',
    signerDescription: 'string?',
    lastHealthCheck: 'date',
    addedOn: 'date',
    isMock: 'bool?',
    storageType: 'string',
    signerPolicy: `${RealmSchema.SignerPolicy}?`,
    inheritanceKeyInfo: `${RealmSchema.InheritanceKeyInfo}?`,
    hidden: { type: 'bool', default: false },
  },
};

export const KeySchema: ObjectSchema = {
  name: RealmSchema.Key,
  primaryKey: 'xpub',
  properties: {
    masterFingerprint: 'string',
    xpub: 'string',
    xpriv: 'string?',
    xfp: 'string',
    derivationPath: 'string',
    vaultInfo: `{}?`,
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
    receivingAddress: 'string?',
    addresses: `${RealmSchema.AddressCache}?`,
    addressPubs: `{}?`,
    confirmedUTXOs: `${RealmSchema.UTXO}[]`,
    unconfirmedUTXOs: `${RealmSchema.UTXO}[]`,
    balances: Balances,
    transactions: `${RealmSchema.Transaction}[]`,
    txNote: '{}',
    hasNewUpdates: 'bool',
    lastSynched: 'int',
  },
};

export const VaultSchema: ObjectSchema = {
  name: RealmSchema.Vault,
  properties: {
    id: 'string',
    shellId: 'string',
    entityKind: 'string',
    type: 'string',
    networkType: 'string',
    isUsable: 'bool',
    isMultiSig: 'bool',
    scheme: Scheme,
    signers: `${RealmSchema.Key}[]`,
    presentationData: RealmSchema.VaultPresentationData,
    specs: RealmSchema.VaultSpecs,
    archived: 'bool',
    scriptType: 'string',
    collaborativeWalletId: 'string?',
  },
  primaryKey: 'id',
};
