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

const initialState: {
  allAccounts: Account[];
  activeAccount: string;
  tempDetails: tempDetails;
} = {
  allAccounts: [],
  activeAccount: null,
  tempDetails: null,
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
    setActiveAccount: (state, action: PayloadAction<string>) => {
      state.activeAccount = action.payload;
    },
    setTempDetails: (state, action: PayloadAction<tempDetails>) => {
      state.tempDetails = action.payload;
    },
    resetTempDetails: (state) => {
      state.tempDetails = null;
    },
  },
});

export const { addAccount, setActiveAccount, setTempDetails, resetTempDetails } =
  accountSlice.actions;
export default accountSlice.reducer;
