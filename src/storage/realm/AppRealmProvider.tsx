import React from 'react';
import { createRealmContext } from '@realm/react';
import { SecuritySchema, WalletSchema, Details2faSchema, AccountShcema } from './schema/wallet';

export const realmConfig = {
  schema: [WalletSchema, SecuritySchema, Details2faSchema, AccountShcema],
  schemaVersion: 5,
};

export const RealmContext = createRealmContext(realmConfig);

export const AppRelamProvider = ({ children }) => {
  return <RealmContext.RealmProvider>{children}</RealmContext.RealmProvider>;
};
