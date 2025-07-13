import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const KeeperAppSchema: ObjectSchema = {
  name: RealmSchema.KeeperApp,
  properties: {
    id: 'string',
    publicId: 'string',
    appName: 'string?',
    primaryMnemonic: 'string',
    primarySeed: 'string',
    imageEncryptionKey: 'string',
    networkType: 'string',
    version: 'string',
    subscription: RealmSchema.StoreSubscription,
    backup: RealmSchema.Backup,
    enableAnalytics: { type: 'bool', default: false },
    contactsKey: 'string?{}',
  },
  primaryKey: 'id',
};
