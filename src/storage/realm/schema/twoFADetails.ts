import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const TwoFADetailsSchema: ObjectSchema = {
  name: RealmSchema.TwoFADetails,
  embedded: true,
  properties: {
    signingServerXpub: 'string?',
    derivationPath: 'string?',
    masterFingerprint: 'string?',
    twoFAKey: 'string?',
    twoFAValidated: 'bool?',
  },
};
