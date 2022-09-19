import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';

export const StoreSubscriptionSchema: ObjectSchema = {
  name: RealmSchema.StoreSubscription,
  properties: {
    name: {
      type: 'string',
      default: SubscriptionTier.PLEB.toUpperCase(),
    },
    productId: {
      type: 'string',
      default: SubscriptionTier.PLEB,
    },
    receipt: {
      type: 'string?',
      default: '',
    },
  },
};

export const KeeperAppSchema: ObjectSchema = {
  name: RealmSchema.KeeperApp,
  properties: {
    id: 'string',
    appID: 'string',
    appName: 'string?',
    primaryMnemonic: 'string',
    primarySeed: 'string',
    imageEncryptionKey: 'string',
    walletShellInstances: RealmSchema.WalletShellInstances,
    vaultShellInstances: RealmSchema.VaultShellInstances,
    twoFADetails: `${RealmSchema.TwoFADetails}?`,
    nodeConnect: `${RealmSchema.NodeConnect}?`,
    uai: `${RealmSchema.UAI}?`,
    notification: `${RealmSchema.Notification}?`,
    subscription: {
      type: RealmSchema.StoreSubscription,
    },
    version: 'string',
    backupPassword: {
      type: 'string?',
      default: '',
    },
    backupPasswordHint: {
      type: 'string?',
      default: '',
    },
    backupMethod: {
      type: 'string?',
      default: '',
    },
    config: '{}',
  },
  primaryKey: 'id',
};
