import React, { createContext, useEffect, useState } from 'react';
import { createRealmContext } from '@realm/react';
import schema from './schema';
import { useAppSelector } from 'src/store/hooks';
import * as Cipher from 'src/common/encryption';

export const realmConfig = (key) => {
  return {
    path: 'keeper.realm',
    schema,
    schemaVersion: 7,
    encryptionKey: key,
  };
};
export const RealmWrapperContext = createContext();

export const RealmProvider = ({ children }) => {
  const key = useAppSelector((state) => state.login.key);

  if (key) {
    const bufferKey = Cipher.stringToArrayBuffer(key);
    const RealmContext = createRealmContext(realmConfig(bufferKey));
    const { useQuery, useRealm } = RealmContext;
    return (
      <RealmWrapperContext.Provider value={{ useQuery, useRealm }}>
        <RealmContext.RealmProvider>{children}</RealmContext.RealmProvider>
      </RealmWrapperContext.Provider>
    );
  } else {
    return <>{children}</>;
  }
};
