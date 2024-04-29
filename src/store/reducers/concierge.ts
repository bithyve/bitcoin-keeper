import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState: {
  onboardingModal: boolean;
  tags: string[];
} = {
  onboardingModal: false,
  tags: [],
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
  },
});

export const { showOnboarding, hideOnboarding, setConciergTags } = conciergeSlice.actions;

export default conciergeSlice.reducer;
