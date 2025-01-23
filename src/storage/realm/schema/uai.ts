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
    createdAt: 'date?',
    seenAt: 'date?',
  },
  primaryKey: 'id',
};

export const UAIDetailsSchema: ObjectSchema = {
  name: RealmSchema.UAIDetails,
  embedded: true,
  properties: {
    heading: 'string?',
    body: 'string?',
  },
};
