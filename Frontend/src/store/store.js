import { configureStore } from '@reduxjs/toolkit';
import historyReducer from '../features/history/historySlice';

export default configureStore({
  reducer: {
    history: historyReducer,
  },
});
