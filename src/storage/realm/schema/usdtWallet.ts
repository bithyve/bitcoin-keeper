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
    transferFee: 'int?',
    activateFee: 'int?',
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
    gasFreeAddress: 'string',
    balance: 'double',
    frozen: 'double',
    isActive: 'bool',
    canTransfer: 'bool',
    nextNonce: 'int',
    fees: 'mixed', // Store as JSON: { transferFee: number, activateFee: number }
    transactions: `${RealmSchema.USDTTransaction}[]`,
    hasNewUpdates: 'bool',
    lastSynched: 'int',
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

export const USDTWalletSchema: ObjectSchema = {
  name: RealmSchema.USDTWallet,
  properties: {
    id: 'string',
    entityKind: 'string',
    type: 'string',
    networkType: 'string',
    presentationData: RealmSchema.USDTWalletPresentationData,
    specs: RealmSchema.USDTWalletSpecs,
    createdAt: 'int',
  },
  primaryKey: 'id',
};
