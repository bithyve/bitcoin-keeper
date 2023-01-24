import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const SigningServerSetupSchema: ObjectSchema = {
  name: RealmSchema.SigningServerSetup,
  embedded: true,
  properties: {
    validation: {
      type: '{}?',
      properties: {
        validationType: 'string',
        validationKey: 'string?',
        vaildated: 'bool?',
      },
    },
    setupInfo: {
      type: '{}?',
      properties: {
        xpub: 'string',
        derivationPath: 'string',
        masterFingerprint: 'string',
      },
    },
  },
};
