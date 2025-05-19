import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BackupType } from 'src/models/enums/BHR';

export type AccountWithoutHash = {
  isDefault: boolean;
  appId: string;
};

export type Account = AccountWithoutHash & tempDetails;

export type tempDetails = {
  hash: string;
  realmId: string;
  accountIdentifier: string;
};

export type ConciergeUsers = {
  [appId: string]: string;
};

export type BackupMethodByAppId = {
  [appId: string]: BackupType;
};

const initialState: {
  allAccounts: Account[];
  tempDetails: tempDetails;
  conciergeUsers: ConciergeUsers;
  biometricEnabledAppId: string;
  backupMethodByAppId: BackupMethodByAppId;
} = {
  allAccounts: [],
  tempDetails: null,
  conciergeUsers: {},
  biometricEnabledAppId: null,
  backupMethodByAppId: {},
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    addAccount: (state, action: PayloadAction<string>) => {
      const account = {
        appId: action.payload,
        hash: state.tempDetails.hash,
        realmId: state.tempDetails.realmId,
        accountIdentifier: state.tempDetails.accountIdentifier,
        isDefault: state.allAccounts.length === 0,
      };
      state.allAccounts.push(account);
      state.tempDetails = null;
    },
    setTempDetails: (state, action: PayloadAction<tempDetails>) => {
      state.tempDetails = action.payload;
    },
    resetTempDetails: (state) => {
      state.tempDetails = null;
    },
    updatePasscodeHash: (state, action: PayloadAction<{ newHash: string; appId: string }>) => {
      state.allAccounts.forEach((account) => {
        if (account.appId === action.payload.appId) {
          account.hash = action.payload.newHash;
        }
      });
    },
    addConciergeUserToAccount: (
      state,
      action: PayloadAction<{ appId: string; conciergeUser: string }>
    ) => {
      state.conciergeUsers[action.payload.appId] = action.payload.conciergeUser;
    },
    setBiometricEnabledAppId: (state, action: PayloadAction<string>) => {
      state.biometricEnabledAppId = action.payload;
    },
    updateBackupMethodByAppId: (
      state,
      action: PayloadAction<{ appId: string; backupMethod: BackupType }>
    ) => {
      (state.backupMethodByAppId ??= {})[action.payload.appId] = action.payload.backupMethod;
    },
  },
});

export const {
  addAccount,
  setTempDetails,
  resetTempDetails,
  updatePasscodeHash,
  addConciergeUserToAccount,
  setBiometricEnabledAppId,
  updateBackupMethodByAppId,
} = accountSlice.actions;
export default accountSlice.reducer;
