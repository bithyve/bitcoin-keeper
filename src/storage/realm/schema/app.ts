import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const KeeperAppSchema: ObjectSchema = {
  name: RealmSchema.KeeperApp,
  properties: {
    id: 'string',
    appID: 'string',
    appName: 'string?',
    primaryMnemonic: 'string',
    primarySeed: 'string',
    imageEncryptionKey: 'string',
    networkType: 'string',
    version: 'string',
    walletShellInstances: RealmSchema.WalletShellInstances,
    vaultShellInstances: RealmSchema.VaultShellInstances,
    subscription: RealmSchema.StoreSubscription,
    backup: RealmSchema.Backup,
    twoFADetails: `${RealmSchema.TwoFADetails}?`,
    uai: `${RealmSchema.UAI}?`,
    notification: `${RealmSchema.Notification}?`,
  },
  primaryKey: 'id',
};
