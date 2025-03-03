import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  history: [
    {
      from: 'Room 3',
      to: 'Room 4',
      timestamp: '23/02/2025, 22:11:52',
    },
    {
      from: 'Room 5',
      to: 'Room 2',
      timestamp: '23/02/2025, 22:12:52',
    },
  ],
  selectedRoute: null,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addRoute: (state, action) => {
      const newRoute = {
        ...action.payload,
        timestamp: new Date().toLocaleString(), // Store readable timestamp
      };
      state.history.push(newRoute);
    },
    removeRoute: (state, action) => {
      state.history = state.history.filter((route) => route.timestamp !== action.payload);
    },
    clearHistory: (state) => {
      state.history = [];
    },
    setSelectedRoute: (state, action) => {
      state.selectedRoute = action.payload; // Store the selected route
    },
  },
});

export const { addRoute, removeRoute, clearHistory, setSelectedRoute } = historySlice.actions;
export default historySlice.reducer;
