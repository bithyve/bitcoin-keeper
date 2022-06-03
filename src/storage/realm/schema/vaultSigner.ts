import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const VaultSignerSchema: ObjectSchema = {
  name: RealmSchema.VaultSigner,
  primaryKey: 'signerId',
  properties: {
    type: 'string',
    signerId: 'string',
    xpub: 'string',
    signerName: 'string',
    signerDescription: 'string?',
  },
};
