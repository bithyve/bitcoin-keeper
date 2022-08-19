import { ObjectSchema } from 'realm';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import { RealmSchema } from '../enum';

export const KeeperAppSchema: ObjectSchema = {
  name: RealmSchema.KeeperApp,
  properties: {
    id: 'string',
    appName: 'string?',
    primaryMnemonic: 'string',
    primarySeed: 'string',
    imageEncryptionKey: 'string',
    walletShellInstances: RealmSchema.WalletShellInstances,
    vaultShellInstances: RealmSchema.VaultShellInstances,
    twoFADetails: `${RealmSchema.TwoFADetails}?`,
    nodeConnect: `${RealmSchema.NodeConnect}?`,
    uai: `${RealmSchema.UAI}?`,
    subscriptionPlan: {
      type: 'string?',
      default: SubscriptionTier.PLEB,
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
  },
  primaryKey: 'id',
};
