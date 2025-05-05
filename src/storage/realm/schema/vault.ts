import { ObjectSchema } from 'realm';
import { XpubTypes } from 'src/services/wallets/enums';
import { RealmSchema } from '../enum';

export const SignerPolicy: ObjectSchema = {
  name: RealmSchema.SignerPolicy,
  embedded: true,
  properties: {
    verification: 'SignerPolicyVerification?',
    restrictions: 'SignerPolicyRestrictions?',
    exceptions: 'SignerPolicyExceptions?',
    signingDelay: 'int?',
    backupDisabled: 'bool?',
  },
};

export const SignerPolicyVerificationSchema: ObjectSchema = {
  name: 'SignerPolicyVerification',
  embedded: true,
  properties: {
    method: 'string',
    verifier: 'string?',
  },
};

export const SignerPolicyRestrictionsSchema: ObjectSchema = {
  name: 'SignerPolicyRestrictions',
  embedded: true,
  properties: {
    none: 'bool',
    maxTransactionAmount: 'int?',
    timeWindow: 'int?',
  },
};

export const SignerPolicyExceptionsSchema: ObjectSchema = {
  name: 'SignerPolicyExceptions',
  embedded: true,
  properties: {
    none: 'bool',
    transactionAmount: 'int?',
  },
};

export const KeySpecsSchema: ObjectSchema = {
  name: RealmSchema.KeySpecs,
  properties: {
    xpub: 'string',
    derivationPath: 'string',
    xpriv: 'string?',
  },
};

export const SignerXpubsSchema: ObjectSchema = {
  embedded: true,
  name: RealmSchema.SignerXpubs,
  properties: {
    [XpubTypes.AMF]: `${RealmSchema.KeySpecs}[]`,
    [XpubTypes.P2PKH]: `${RealmSchema.KeySpecs}[]`,
    [XpubTypes['P2SH-P2WPKH']]: `${RealmSchema.KeySpecs}[]`,
    [XpubTypes['P2SH-P2WSH']]: `${RealmSchema.KeySpecs}[]`,
    [XpubTypes.P2TR]: `${RealmSchema.KeySpecs}[]`,
    [XpubTypes.P2WPKH]: `${RealmSchema.KeySpecs}[]`,
    [XpubTypes.P2WSH]: `${RealmSchema.KeySpecs}[]`,
  },
};

export const RegistrationInfoSchema: ObjectSchema = {
  name: RealmSchema.RegistrationInfo,
  embedded: true,
  properties: {
    vaultId: 'string',
    registered: 'bool',
    registrationInfo: 'string?',
    hmac: 'string?',
  },
};

export const VaultSignerSchema: ObjectSchema = {
  name: RealmSchema.VaultSigner,
  primaryKey: 'xpub',
  properties: {
    masterFingerprint: 'string',
    xpub: 'string',
    xpriv: 'string?',
    xfp: 'string',
    derivationPath: 'string',
    registeredVaults: `${RealmSchema.RegistrationInfo}[]`,
  },
};

export const HealthCheckDetails: ObjectSchema = {
  embedded: true,
  name: RealmSchema.HealthCheckDetails,
  properties: {
    type: 'string',
    actionDate: 'date',
    extraData: 'mixed?',
  },
};

export const SignerSchema: ObjectSchema = {
  name: RealmSchema.Signer,
  primaryKey: 'id',
  properties: {
    id: 'string',
    masterFingerprint: 'string',
    type: 'string',
    signerXpubs: `${RealmSchema.SignerXpubs}`,
    signerName: 'string?',
    signerDescription: 'string?',
    healthCheckDetails: `${RealmSchema.HealthCheckDetails}[]`,
    lastHealthCheck: 'date',
    addedOn: 'date',
    isMock: 'bool?',
    storageType: 'string',
    isBIP85: 'bool?',
    signerPolicy: `${RealmSchema.SignerPolicy}?`,
    hidden: { type: 'bool', default: false },
    extraData: 'mixed?',
    archived: { type: 'bool', default: false },
    isExternal: 'bool?',
    networkType: { type: 'string' },
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

export const MiniscriptKeyInfoSchema: ObjectSchema = {
  name: RealmSchema.MiniscriptKeyInfo,
  embedded: true,
  properties: {
    identifier: 'string',
    descriptor: 'string',
    uniqueKeyIdentifier: 'string?',
  },
};

export const MiniscriptPathSchema: ObjectSchema = {
  name: RealmSchema.MiniscriptPath,
  embedded: true,
  properties: {
    id: 'int',
    keys: `${RealmSchema.MiniscriptKeyInfo}[]`,
    threshold: 'int',
  },
};

export const MiniscriptPhaseSchema: ObjectSchema = {
  name: RealmSchema.MiniscriptPhase,
  embedded: true,
  properties: {
    id: 'int',
    timelock: 'int',
    paths: `${RealmSchema.MiniscriptPath}[]`,
    requiredPaths: 'int',
  },
};

export const MiniscriptElementsSchema: ObjectSchema = {
  name: RealmSchema.MiniscriptElements,
  embedded: true,
  properties: {
    keysInfo: `${RealmSchema.MiniscriptKeyInfo}[]`,
    timelocks: 'int[]',
    phases: `${RealmSchema.MiniscriptPhase}[]`,
    signerFingerprints: 'mixed?',
  },
};

export const MiniscriptSchemeSchema: ObjectSchema = {
  name: RealmSchema.MiniscriptScheme,
  embedded: true,
  properties: {
    miniscriptElements: RealmSchema.MiniscriptElements,
    keyInfoMap: 'mixed?',
    miniscriptPolicy: 'string',
    miniscript: 'string',
    usedMiniscriptTypes: 'string[]',
  },
};

export const VaultSchemeSchema: ObjectSchema = {
  name: RealmSchema.VaultScheme,
  embedded: true,
  properties: {
    m: 'int',
    n: 'int',
    multisigScriptType: 'string?',
    miniscriptScheme: `${RealmSchema.MiniscriptScheme}?`,
  },
};

export const VaultSpecsSchema: ObjectSchema = {
  name: RealmSchema.VaultSpecs,
  embedded: true,
  properties: {
    xpubs: 'string[]',
    nextFreeAddressIndex: 'int',
    nextFreeChangeAddressIndex: 'int',
    totalExternalAddresses: 'int',
    receivingAddress: 'string?',
    addresses: `${RealmSchema.AddressCache}?`,
    addressPubs: 'mixed?',
    confirmedUTXOs: `${RealmSchema.UTXO}[]`,
    unconfirmedUTXOs: `${RealmSchema.UTXO}[]`,
    balances: `${RealmSchema.Balances}`,
    transactions: `${RealmSchema.Transaction}[]`,
    hasNewUpdates: 'bool',
    lastSynched: 'int',
  },
};

export const VaultSchema: ObjectSchema = {
  name: RealmSchema.Vault,
  properties: {
    id: 'string',
    entityKind: 'string',
    type: 'string',
    networkType: 'string',
    isMultiSig: 'bool',
    scheme: `${RealmSchema.VaultScheme}`,
    signers: `${RealmSchema.VaultSigner}[]`,
    presentationData: RealmSchema.VaultPresentationData,
    specs: RealmSchema.VaultSpecs,
    archived: 'bool',
    archivedId: 'string?',
    isMigrating: 'bool?',
    scriptType: 'string',
  },
  primaryKey: 'id',
};
