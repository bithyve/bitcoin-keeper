import { ObjectSchema } from 'realm';

export const InheritancePolicySchema: ObjectSchema = {
  name: 'InheritancePolicy',
  embedded: true,
  properties: {
    policyId: 'string',
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
};
