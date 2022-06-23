import * as Cipher from 'src/common/encryption';

import React, { createContext, useMemo } from 'react';

import { createRealmContext } from '@realm/react';
import schema from './schema';
import { useAppSelector } from 'src/store/hooks';

export const realmConfig = (key) => {
  return {
    path: 'keeper.realm',
    schema,
    schemaVersion: 11,
    encryptionKey: key,
  };
};

export const RealmWrapperContext = createContext({});

export const RealmProvider = ({ children }) => {
  const key = useAppSelector((state) => state?.login?.key);
  console.log('provider', key);

  if (key) {
    const bufferKey = Cipher.stringToArrayBuffer(key);
    const RealmContext = useMemo(() => createRealmContext(realmConfig(bufferKey)), []);
    const { useQuery, useRealm, useObject } = RealmContext;
    return (
      <RealmWrapperContext.Provider value={{ useQuery, useRealm, useObject }}>
        <RealmContext.RealmProvider>{children}</RealmContext.RealmProvider>
      </RealmWrapperContext.Provider>
    );
  } else {
    return <>{children}</>;
  }
};
