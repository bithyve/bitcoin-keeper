import React from 'react';
import { createRealmContext } from '@realm/react';
import { KeeperAppSchema } from './schema/app';
import { WalletShellShcema, WalletsShcema } from './schema/wallets';
import { TriggerPolicySchema } from './schema/triggerPolicy';
import { VaultShellSchema, VaultsShcema } from './schema/vaults';
import { InheritancePolicySchema } from './schema/inheritancePolicy';
import { TwoFADetailsSchema } from './schema/twoFADetails';
import { NodeConnectSchema } from './schema/nodeConnect';
import { UserTierSchema } from './schema/userTier';
import { UAISchema } from './schema/uai';

export const realmConfig = {
  schema: [
    KeeperAppSchema,
    WalletShellShcema,
    WalletsShcema,
    TriggerPolicySchema,
    VaultShellSchema,
    VaultsShcema,
    InheritancePolicySchema,
    TwoFADetailsSchema,
    NodeConnectSchema,
    UserTierSchema,
    UAISchema,
  ],
  schemaVersion: 1,
};

export const RealmContext = createRealmContext(realmConfig);

export const AppRelamProvider = ({ children }) => {
  return <RealmContext.RealmProvider>{children}</RealmContext.RealmProvider>;
};
