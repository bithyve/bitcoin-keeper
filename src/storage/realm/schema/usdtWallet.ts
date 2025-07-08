import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const USDTTransactionSchema: ObjectSchema = {
  name: RealmSchema.USDTTransaction,
  embedded: true,
  properties: {
    txId: 'string?',
    traceId: 'string?',
    from: 'string',
    to: 'string',
    amount: 'string',
    transferFee: 'double?',
    activateFee: 'double?',
    fee: 'string?',
    status: 'string',
    timestamp: 'int',
    blockNumber: 'int?',
    isGasFree: 'bool',
  },
};

export const USDTWalletSpecsSchema: ObjectSchema = {
  name: RealmSchema.USDTWalletSpecs,
  embedded: true,
  properties: {
    address: 'string',
    privateKey: 'string',
    balance: 'double',
    transactions: `${RealmSchema.USDTTransaction}[]`,
    hasNewUpdates: 'bool',
    lastSynched: 'int',
  },
};

export const USDTWalletAccountStatusSchema: ObjectSchema = {
  name: RealmSchema.USDTWalletAccountStatus,
  embedded: true,
  properties: {
    address: 'string',
    gasFreeAddress: 'string',
    isActive: 'bool',
    frozen: 'double',
    canTransfer: 'bool',
    nextNonce: 'int',
    fees: 'mixed', // Store as JSON: { transferFee: double, activateFee: double }
  },
};

export const USDTWalletPresentationDataSchema: ObjectSchema = {
  name: RealmSchema.USDTWalletPresentationData,
  embedded: true,
  properties: {
    name: 'string',
    description: 'string',
    visibility: 'string',
  },
};

export const USDTWalletDerivationDetailsSchema: ObjectSchema = {
  name: RealmSchema.USDTWalletDerivationDetails,
  embedded: true,
  properties: {
    instanceNum: 'int?',
    mnemonic: 'string?',
    bip85Config: `${RealmSchema.BIP85Config}?`,
    xDerivationPath: 'string',
  },
};

export const USDTWalletSchema: ObjectSchema = {
  name: RealmSchema.USDTWallet,
  properties: {
    id: 'string',
    entityKind: 'string',
    type: 'string',
    networkType: 'string',
    derivationDetails: `${RealmSchema.USDTWalletDerivationDetails}?`,
    presentationData: RealmSchema.USDTWalletPresentationData,
    specs: RealmSchema.USDTWalletSpecs,
    accountStatus: RealmSchema.USDTWalletAccountStatus,
    createdAt: 'int',
  },
  primaryKey: 'id',
};
