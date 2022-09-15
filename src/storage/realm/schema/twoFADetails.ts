import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const TwoFADetailsSchema: ObjectSchema = {
  name: RealmSchema.TwoFADetails,
  embedded: true,
  properties: {
    signingServerXpub: 'string?',
    twoFAKey: 'string?',
    twoFAValidated: 'bool?',
  },
};
