import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const InheritancePolicySchema: ObjectSchema = {
  name: RealmSchema.InheritancePolicy,
  properties: {
    id: 'string',
    date: 'string',
    heir: {
      type: '{}',
      properties: {
        firstName: 'string',
        lastName: 'string',
        address: 'string',
        email: 'string',
      },
    },
    user: {
      type: '{}',
      properties: {
        email: 'string',
      },
    },
    version: 'string',
  },
  primaryKey: 'id',
};
