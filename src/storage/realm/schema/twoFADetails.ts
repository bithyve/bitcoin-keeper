import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const TwoFADetailsSchema: ObjectSchema = {
  name: RealmSchema.TwoFADetails,
  embedded: true,
  properties: {
    bithyveXpub: 'string?',
    twoFAKey: 'string?',
    twoFAValidated: 'bool?',
  },
};
