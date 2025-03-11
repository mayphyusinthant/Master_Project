import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
};

const roomBooking = createSlice({
  name: 'roomBooking',
  initialState,
  reducers: {
    addBooking: (state, action) => {
      state.bookings.push(action.payload);
    },
    removeBooking: (state, action) => {
      state.bookings = state.bookings.filter((booking) => booking.id !== action.payload);
    },
  },
});

export const { addBooking, removeBooking } = roomBooking.actions;
export default roomBooking.reducer;
