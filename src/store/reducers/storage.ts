import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DelayedPolicyUpdate, DelayedTransaction } from 'src/models/interfaces/AssistedKeys';

interface InheritanceToolVisitedHistoryType {
  BUY_NEW_HARDWARE_SIGNER: number;
  CANARY_WALLETS: number;
  ASSISTED_KEYS: number;
  SECURE_USAGE_TIPS: number;
  SAFE_KEEPING_TIPS: number;
  MASTER_RECOVERY_KEY: number;
  PERSONAL_CLOUD_BACKUP: number;
  WALLET_CONFIG_FILES: number;
  BACKUP_AND_RECOVERY_FILES: number;
  LETTER_OF_ATTORNEY: number;
  RECOVERY_INSTRUCTIONS: number;
  PRINTABLE_TEMPLATES: number;
  INHERITANCE_TIPS: number;
  RECOVERY_PHRASE_TEMPLATE: number;
  TRUSTED_CONTACTS_TEMPLATE: number;
  ADDITIONAL_SIGNER_DETAILS: number;
}

const initialState: {
  appId: string;
  failedAttempts: number;
  lastLoginFailedAt: number;
  pinHash: string;
  appVersion: string;
  inheritanceRequestId: string;
  inheritanceOTBRequestId: string;
  inheritanceKeyExistingEmailCount: number;
  inheritanceToolVisitedHistory: InheritanceToolVisitedHistoryType;
  dontShowConceirgeOnboarding: boolean;
  delayedTransactions: { [txid: string]: DelayedTransaction };
  delayedPolicyUpdate: { [policyId: string]: DelayedPolicyUpdate }; // contains a single policy update at a time
  plebDueToOffline: boolean; // app downgraded to pleb due to internet issue
  wasAutoUpdateEnabledBeforeDowngrade: boolean;
  secondaryNetworkWalletCreated: boolean; // flag for creation of default wallet for secondary network type
} = {
  appId: '',
  failedAttempts: 0,
  lastLoginFailedAt: null,
  pinHash: '',
  appVersion: '',
  inheritanceRequestId: '',
  inheritanceOTBRequestId: '',
  inheritanceKeyExistingEmailCount: 0,
  inheritanceToolVisitedHistory: {
    BUY_NEW_HARDWARE_SIGNER: null,
    CANARY_WALLETS: null,
    ASSISTED_KEYS: null,
    SECURE_USAGE_TIPS: null,
    SAFE_KEEPING_TIPS: null,
    MASTER_RECOVERY_KEY: null,
    PERSONAL_CLOUD_BACKUP: null,
    WALLET_CONFIG_FILES: null,
    BACKUP_AND_RECOVERY_FILES: null,
    LETTER_OF_ATTORNEY: null,
    RECOVERY_INSTRUCTIONS: null,
    PRINTABLE_TEMPLATES: null,
    INHERITANCE_TIPS: null,
    RECOVERY_PHRASE_TEMPLATE: null,
    TRUSTED_CONTACTS_TEMPLATE: null,
    ADDITIONAL_SIGNER_DETAILS: null,
  },
  dontShowConceirgeOnboarding: false,
  delayedTransactions: {},
  delayedPolicyUpdate: {},
  plebDueToOffline: false,
  wasAutoUpdateEnabledBeforeDowngrade: false,
  secondaryNetworkWalletCreated: false,
};

const storageSlice = createSlice({
  name: 'storage',
  initialState,
  reducers: {
    setAppId: (state, action: PayloadAction<string>) => {
      state.appId = action.payload;
    },

    increasePinFailAttempts: (state) => {
      state.failedAttempts += 1;
      state.lastLoginFailedAt = Date.now();
    },
    setPinHash: (state, action: PayloadAction<string>) => {
      state.pinHash = action.payload;
    },
    setAppVersion: (state, action: PayloadAction<string>) => {
      state.appVersion = action.payload;
    },
    updateLastVisitedTimestamp: (
      state,
      action: PayloadAction<{ option: keyof InheritanceToolVisitedHistoryType }>
    ) => {
      const { option } = action.payload;
      if (!state.inheritanceToolVisitedHistory) {
        state.inheritanceToolVisitedHistory = initialState.inheritanceToolVisitedHistory;
      }
      state.inheritanceToolVisitedHistory[option] = Date.now();
    },
    setDontShowConceirgeOnboarding: (state) => {
      state.dontShowConceirgeOnboarding = true;
    },
    updateDelayedTransaction: (state, action: PayloadAction<DelayedTransaction>) => {
      state.delayedTransactions = {
        ...(state.delayedTransactions || {}),
        [action.payload.txid]: action.payload,
      };
    },
    deleteDelayedTransaction: (state, action: PayloadAction<string>) => {
      if (state.delayedTransactions && state.delayedTransactions[action.payload]) {
        delete state.delayedTransactions[action.payload];
      }
    },
    updateDelayedPolicyUpdate: (state, action: PayloadAction<DelayedPolicyUpdate>) => {
      state.delayedPolicyUpdate = {
        [action.payload.policyId]: action.payload, // contains a single policy update at a time, can be updated to handle multiple policy updates
      };
    },
    deleteDelayedPolicyUpdate: (state, action: PayloadAction<string>) => {
      if (state.delayedPolicyUpdate && state.delayedPolicyUpdate[action.payload]) {
        delete state.delayedPolicyUpdate[action.payload];
      }
    },
    setPlebDueToOffline: (state, action: PayloadAction<boolean>) => {
      state.plebDueToOffline = action.payload;
    },
    setAutoUpdateEnabledBeforeDowngrade: (state, action: PayloadAction<boolean>) => {
      state.wasAutoUpdateEnabledBeforeDowngrade = action.payload;
    },
    setSecondaryNetworkWalletCreated: (state, action: PayloadAction<boolean>) => {
      state.secondaryNetworkWalletCreated = action.payload;
    },
  },
});

export const {
  setAppId,
  increasePinFailAttempts,
  setPinHash,
  setAppVersion,
  updateLastVisitedTimestamp,
  setDontShowConceirgeOnboarding,
  updateDelayedTransaction,
  deleteDelayedTransaction,
  updateDelayedPolicyUpdate,
  deleteDelayedPolicyUpdate,
  setPlebDueToOffline,
  setAutoUpdateEnabledBeforeDowngrade,
  setSecondaryNetworkWalletCreated,
} = storageSlice.actions;

export default storageSlice.reducer;
