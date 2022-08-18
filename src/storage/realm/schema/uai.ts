import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const UAISchema: ObjectSchema = {
  name: RealmSchema.UAI,
  properties: {
    id: 'string',
    title: 'string',
    notificationId: 'string?',
    isActioned: 'bool',
    isDisplay: 'bool',
    displayText: 'string?',
    displayCount: 'int',
    timeStamp: 'date',
    uaiType: 'string',
    prirority: 'int',
    entityId: 'string?',
  },
  primaryKey: 'id',
};
