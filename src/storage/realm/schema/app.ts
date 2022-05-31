import { ObjectSchema } from 'realm';
import { RealmSchema } from './enum';

export const KeeperAppSchema: ObjectSchema = {
  name: RealmSchema.KeeperApp,
  properties: {
    appId: 'string',
    appName: 'string',
    primaryMnemonic: 'string',
    primarySeed: 'string',
    walletShell: 'WalletShell',
    vaultShell: 'VaultShell?',
    twoFADetails: 'TwoFADetails?',
    nodeConnect: 'NodeConnect?',
    uai: 'UAI?',
    userTier: 'UserTier',
    version: 'string',
  },
  primaryKey: 'appId',
};
