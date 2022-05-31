import React from 'react';
import { createRealmContext } from '@realm/react';
import { UAISchema } from './schema/uai';

export const realmConfig = {
  schema: [UAISchema],
  schemaVersion: 8,
};

export const RealmContext = createRealmContext(realmConfig);

export const AppRelamProvider = ({ children }) => {
  return <RealmContext.RealmProvider>{children}</RealmContext.RealmProvider>;
};
