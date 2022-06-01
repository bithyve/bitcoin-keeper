import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const TriggerPolicySchema: ObjectSchema = {
  name: RealmSchema.TriggerPolicy,
  properties: {
    policyId: 'string',
    date: 'string',
    specifications: '{}',
    version: 'string',
  },
  primaryKey: 'policyId',
};
