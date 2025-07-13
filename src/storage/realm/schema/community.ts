import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const MessageSchema: ObjectSchema = {
  name: RealmSchema.Message,
  primaryKey: 'id',
  properties: {
    id: 'string',
    communityId: 'string',
    block: 'int?',
    unread: 'bool',
    createdAt: { type: 'int', default: Date.now() },
    text: 'string?',
    type: 'string?',
    sender: 'string',
    fileUrl: 'string?',
  },
};

export const ContactSchema: ObjectSchema = {
  name: RealmSchema.Contact,
  primaryKey: 'contactKey',
  properties: {
    contactKey: 'string',
    appID: 'string',
    imageUrl: 'string?',
    name: 'string',
  },
};

export const CommunitySchema: ObjectSchema = {
  name: RealmSchema.Community,
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string?',
    createdAt: { type: 'int', default: Date.now() },
    type: 'string',
    with: 'string?',
  },
};
