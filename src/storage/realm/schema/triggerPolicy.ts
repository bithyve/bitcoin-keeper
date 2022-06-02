import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const TriggerPolicySchema: ObjectSchema = {
  name: RealmSchema.TriggerPolicy,
  properties: {
    id: 'string',
    date: 'string',
    specifications: '{}',
    version: 'string',
  },
  primaryKey: 'id',
};
