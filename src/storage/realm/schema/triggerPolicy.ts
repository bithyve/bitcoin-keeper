import { ObjectSchema } from 'realm';

export const TriggerPolicySchema: ObjectSchema = {
  name: 'TriggerPolicy',
  embedded: true,
  properties: {
    policyId: 'string',
    date: 'string',
    specifications: '{}',
    version: 'string',
  },
};
