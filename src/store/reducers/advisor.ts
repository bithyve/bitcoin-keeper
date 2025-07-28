import { createSlice } from '@reduxjs/toolkit';

type Advisor = {
  duration: string;
  description: string;
  country: string;
  experience: string;
  expertise: string[];
  image: string;
  languages: string[];
  link: string;
  timezone: string;
  title: string;
};

const initialState: {
  advisors: Advisor[];
} = {
  advisors: [],
};

const advisorSlice = createSlice({
  name: 'advisor',
  initialState,
  reducers: {
    setAdvisors: (state, action) => {
      state.advisors = action.payload;
    },
  },
});

export const { setAdvisors } = advisorSlice.actions;

export default advisorSlice.reducer;
