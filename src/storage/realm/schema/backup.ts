import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const BackupSchema: ObjectSchema = {
  name: RealmSchema.Backup,
  embedded: true,
  properties: {
    method: 'string?',
    password: 'string?',
    hint: 'string?',
  },
};
