import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const UserTierSchema: ObjectSchema = {
  name: RealmSchema.UserTier,
  embedded: true,
  properties: {
    level: 'string',
  },
};
