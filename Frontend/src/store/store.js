import { configureStore } from '@reduxjs/toolkit';
import historyReducer from '../features/history/historySlice';
import roomBookingReducer from '../features/roomBooking/roomBookingSlice';

export default configureStore({
  reducer: {
    history: historyReducer,
    roomBooking: roomBookingReducer,
  },
});
