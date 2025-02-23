import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  history: [],
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addRoute: (state, action) => {
      state.history.push(action.payload);
    },
    removeRoute: (state, action) => {
      state.history = state.history.filter((route) => route !== action.payload);
    },
    clearHistory: (state) => {
      state.history = [];
    },
  },
});

export const { addRoute, removeRoute, clearHistory } = historySlice.actions;
export default historySlice.reducer;
