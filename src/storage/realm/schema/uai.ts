import { ObjectSchema } from 'realm';
import { UAIModel } from '../constants';

export const UAISchema: ObjectSchema = {
  name: UAIModel,
  properties: {
    id: 'string',
    title: 'string',
    notificationId: 'string?',
    isActioned: 'bool',
    timeStamp: 'date',
    uaiType: 'string',
    prirority: 'int',
  },
  primaryKey: 'id',
};
