import React, { createContext, useMemo } from 'react';
import { createRealmContext } from '@realm/react';
import schema from './schema';
import * as Cipher from 'src/common/encryption';
import { useAppSelector } from 'src/store/hooks';

export const realmConfig = (key) => {
  return {
    path: 'keeper.realm',
    schema,
    schemaVersion: 8,
    encryptionKey: key,
  };
};

export const RealmContext = createRealmContext(realmConfig);
export const RealmWrapperContext = createContext({});

export const RealmProvider = ({ children }) => {
  const key = useAppSelector((state) => state?.login?.key);

  if (key) {
    console.log('asdf', key);
    const bufferKey = Cipher.stringToArrayBuffer(key);
    const RealmContext = useMemo(() => createRealmContext(realmConfig(bufferKey)), []);
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
