import React from 'react';
import { createRealmContext } from '@realm/react';
import {
  KeeperAppSchema,
  WalletShellShcema,
  VaultShellSchema,
  Details2FASchema,
  NodeConnectSchema,
  UserTierSchema,
  WalletsShcema,
  VaultsShcema,
  TriggerPolicySchema,
  InheritancePolicySchema,
} from './schema/app';

export const realmConfig = {
  schema: [
    KeeperAppSchema,
    WalletShellShcema,
    WalletsShcema,
    TriggerPolicySchema,
    VaultShellSchema,
    VaultsShcema,
    InheritancePolicySchema,
    Details2FASchema,
    NodeConnectSchema,
    UserTierSchema,
  ],
  schemaVersion: 1,
};

export const RealmContext = createRealmContext(realmConfig);

export const AppRelamProvider = ({ children }) => {
  return <RealmContext.RealmProvider>{children}</RealmContext.RealmProvider>;
};
