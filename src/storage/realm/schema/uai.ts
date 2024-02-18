import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const UAISchema: ObjectSchema = {
  name: RealmSchema.UAI,
  properties: {
    id: 'string',
    uaiType: 'string',
    entityId: 'string?',
    lastActioned: 'date?',
    uaiDetails: `${RealmSchema.UAIDetails}?`,
  },
  primaryKey: 'id',
};

export const UAIDetails: ObjectSchema = {
  name: RealmSchema.UAIDetails,
  embedded: true,
  properties: {
    heading: 'string?',
    body: 'string?',
  },
};
