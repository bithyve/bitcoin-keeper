import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

const initialState: {
  allAccounts: Account[];
  tempDetails: tempDetails;
  conciergeUsers: ConciergeUsers;
  biometricEnabledAppId: string;
} = {
  allAccounts: [],
  tempDetails: null,
  conciergeUsers: {},
  biometricEnabledAppId: null,
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
  },
});

export const {
  addAccount,
  setTempDetails,
  resetTempDetails,
  updatePasscodeHash,
  addConciergeUserToAccount,
  setBiometricEnabledAppId,
} = accountSlice.actions;
export default accountSlice.reducer;
