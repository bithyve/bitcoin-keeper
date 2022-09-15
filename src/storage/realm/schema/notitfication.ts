import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';
import { Platform } from 'react-native';

export const additionalInfoSchema: ObjectSchema = {
  name: RealmSchema.AdditionalNotes,
  properties: {
    notes: {
      type: 'string',
      default: '',
    },
  },
};

export const NotificationSchema: ObjectSchema = {
  name: RealmSchema.Notification,
  properties: {
    type: 'string',
    status: 'string',
    timeStamp: 'string',
    _id: 'string',
    title: 'string',
    info: 'string',
    additionalInfo: {
      type: RealmSchema.AdditionalNotes,
    },
    notificationId: 'string?',
  },
  primaryKey: 'notificationId',
};
