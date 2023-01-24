import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const additionalInfoSchema: ObjectSchema = {
  name: RealmSchema.AdditionalNotes,
  properties: {
    notes: {
      type: 'string',
      default: '',
    },
  },
};
