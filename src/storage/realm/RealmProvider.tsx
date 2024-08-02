import React, { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import config from 'src/utils/service-utilities/config';
import { RealmProvider as Provider, useQuery } from '@realm/react';
import { stringToArrayBuffer } from 'src/store/sagas/login';
import { useAppSelector } from 'src/store/hooks';
import { sentryConfig } from 'src/services/sentry';
import { RealmDatabase } from './realm';
import { RealmSchema } from './enum';
import { getJSONFromRealmObject } from './utils';
import schema from './schema';

export const realmConfig = (key) => ({
  path: RealmDatabase.file,
  schema,
  schemaVersion: RealmDatabase.schemaVersion,
  encryptionKey: key,
});

const AppWithNetwork = ({ children }) => {
  const { networkType, id, enableAnalytics }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  config.setNetwork(networkType);

  useEffect(() => {
    if (enableAnalytics) {
      Sentry.init(sentryConfig);
    } else {
      Sentry.init({ ...sentryConfig, enabled: false });
    }
  }, [enableAnalytics]);

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
