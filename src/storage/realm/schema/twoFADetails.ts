import { ObjectSchema } from 'realm';

export const TwoFADetailsSchema: ObjectSchema = {
  name: 'TwoFADetails',
  embedded: true,
  properties: {
    bithyveXpub: 'string?',
    twoFAKey: 'string?',
    twoFAValidated: 'bool?',
  },
};
