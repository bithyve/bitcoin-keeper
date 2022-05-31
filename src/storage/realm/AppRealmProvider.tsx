import React from 'react';
import { createRealmContext } from '@realm/react';
import { KeeperAppSchema } from './schema/app';
import { WalletSchema } from './schema/wallets';
import { TriggerPolicySchema } from './schema/triggerPolicy';
import { VaultShcema } from './schema/vaults';
import { InheritancePolicySchema } from './schema/inheritancePolicy';
import { TwoFADetailsSchema } from './schema/twoFADetails';
import { NodeConnectSchema } from './schema/nodeConnect';
import { UserTierSchema } from './schema/userTier';
import { UAISchema } from './schema/uai';
import { WalletShellShcema } from './schema/walletShell';
import { VaultShellSchema } from './schema/vaultShell';

export const realmConfig = {
  schema: [
    KeeperAppSchema,
    WalletShellShcema,
    WalletSchema,
    TriggerPolicySchema,
    VaultShellSchema,
    VaultShcema,
    InheritancePolicySchema,
    TwoFADetailsSchema,
    NodeConnectSchema,
    UserTierSchema,
    UAISchema,
  ],
  schemaVersion: 8,
};

export const RealmContext = createRealmContext(realmConfig);

export const AppRelamProvider = ({ children }) => {
  return <RealmContext.RealmProvider>{children}</RealmContext.RealmProvider>;
};
