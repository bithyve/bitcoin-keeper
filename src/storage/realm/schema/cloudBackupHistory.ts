import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const CloudBackupHistorySchema: ObjectSchema = {
  name: RealmSchema.CloudBackupHistory,
  properties: {
    title: 'string',
    date: { type: 'int', default: Date.now() },
    confirmed: 'bool',
    subtitle: {
      optional: true,
      type: 'string',
    },
  },
};
