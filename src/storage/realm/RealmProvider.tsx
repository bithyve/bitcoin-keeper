import React, { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import config, { APP_STAGE } from 'src/utils/service-utilities/config';
import { RealmProvider as Provider, useQuery } from '@realm/react';
import { stringToArrayBuffer } from 'src/store/sagas/login';
import { useAppSelector } from 'src/store/hooks';
import { sentryConfig } from 'src/services/sentry';
import { RealmDatabase } from './realm';
import { RealmSchema } from './enum';
import { getJSONFromRealmObject } from './utils';
import schema from './schema';
import dbManager from './dbManager';

export const realmConfig = (key) => ({
  path: RealmDatabase.file,
  schema,
  schemaVersion: RealmDatabase.schemaVersion,
  encryptionKey: key,
});

const AppWithNetwork = ({ children }) => {
  const { networkType, id }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  config.setNetwork(networkType);

  useEffect(() => {
    Sentry.init(sentryConfig);
    dbManager.updateObjectById(RealmSchema.KeeperApp, id, { enableAnalytics: true });
  }, []);

  return children;
};

export function RealmProvider({ children }) {
  const key = useAppSelector((state) => state?.login?.key);
  const encKey = stringToArrayBuffer(key);
  if (!encKey) {
    return null;
  }
  return (
    <Provider
      path={RealmDatabase.file}
      schema={schema}
      schemaVersion={RealmDatabase.schemaVersion}
      encryptionKey={encKey}
    >
      <AppWithNetwork>{children}</AppWithNetwork>
    </Provider>
  );
}
