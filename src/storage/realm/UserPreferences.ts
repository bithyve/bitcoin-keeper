import { USER_PREFERENCE } from './constants';

export const UserPreferenceTable = {
  name: USER_PREFERENCE,
  primaryKey: 'key',
  properties: {
    key: 'int',
    value: 'string',
  },
};
