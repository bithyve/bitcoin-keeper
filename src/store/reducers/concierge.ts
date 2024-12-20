import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export type conciergeUser = {
  id: string;
  name: string;
  userExternalId: string;
};

export type commentsCounter = {
  [tickedId: string]: number;
};

const initialState: {
  onboardingModal: boolean;
  tags: string[];
  tickets: any[];
  conciergeUser: conciergeUser;
  conciergeUserFailed: boolean;
  conciergeUserSuccess: boolean;
  conciergeLoading: boolean;
  commentsCounter: commentsCounter;
} = {
  onboardingModal: false,
  tags: [],
  tickets: [],
  conciergeUser: null,
  conciergeLoading: false,
  conciergeUserFailed: false,
  conciergeUserSuccess: false,
  commentsCounter: {},
};

const conciergeSlice = createSlice({
  name: 'concierge',
  initialState,
  reducers: {
    showOnboarding: (state) => {
      state.onboardingModal = true;
    },
    hideOnboarding: (state) => {
      state.onboardingModal = false;
    },
    setConciergTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload;
    },

    loadConciergeTickets: (state, action: PayloadAction<any[]>) => {
      state.tickets = action.payload;
    },
    loadConciergeUser: (state, action: PayloadAction<conciergeUser>) => {
      state.conciergeUser = action.payload;
    },
    setConciergeLoading: (state, action: PayloadAction<boolean>) => {
      state.conciergeLoading = action.payload;
    },
    setConciergeUserFailed: (state, action: PayloadAction<boolean>) => {
      state.conciergeUserFailed = action.payload;
    },
    setConciergeUserSuccess: (state, action: PayloadAction<boolean>) => {
      state.conciergeUserSuccess = action.payload;
    },
    updateTicketCommentsCount: (state, action: PayloadAction<commentsCounter>) => {
      state.commentsCounter = { ...state.commentsCounter, ...action.payload };
    },
  },
});

export const {
  showOnboarding,
  hideOnboarding,
  setConciergTags,
  loadConciergeTickets,
  loadConciergeUser,
  setConciergeLoading,
  setConciergeUserFailed,
  setConciergeUserSuccess,
  updateTicketCommentsCount,
} = conciergeSlice.actions;

export default conciergeSlice.reducer;
