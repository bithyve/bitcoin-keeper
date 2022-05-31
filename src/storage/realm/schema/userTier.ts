import { ObjectSchema } from 'realm';

export const UserTierSchema: ObjectSchema = {
  name: 'UserTier',
  embedded: true,
  properties: {
    level: 'string',
  },
};
