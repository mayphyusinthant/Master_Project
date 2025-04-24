import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchHistoryFromDB = createAsyncThunk(
  'history/fetchHistoryFromDB',
  async () => {
    const response = await fetch('http://localhost:5000/api/history');
    const data = await response.json();
    return data;
  }
);

export const saveRouteToDB = createAsyncThunk(
  'history/saveRouteToDB',
  async (route) => {
    await fetch('http://localhost:5000/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(route),
    });
    return route; // used to update local state after saving
  }
);

export const deleteRouteFromDB = createAsyncThunk(
  'history/deleteRouteFromDB',
  async (id) => {
    await fetch(`http://localhost:5000/api/history/${id}`, {
      method: 'DELETE',
    });
    return id;
  }
);

export const clearHistoryFromDB = createAsyncThunk(
  'history/clearHistoryFromDB',
  async () => {
    await fetch('http://localhost:5000/api/history', { method: 'DELETE' });
  }
);


const initialState = {
  history: [],
  selectedRoute: null,
  loading: false,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    
    setSelectedRoute: (state, action) => {
      state.selectedRoute = action.payload; // Store the selected route
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistoryFromDB.pending, (state) => {
      state.loading = true;
    })
      .addCase(fetchHistoryFromDB.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchHistoryFromDB.rejected, (state) => {
        state.loading = false;
      })
      .addCase(saveRouteToDB.fulfilled, (state, action) => {
        state.history.unshift({
          ...action.payload,
          timestamp: new Date().toLocaleString(), // UI display
        });
      })
      .addCase(deleteRouteFromDB.fulfilled, (state, action) => {
        state.history = state.history.filter(route => route.id !== action.payload);
      })
      .addCase(clearHistoryFromDB.fulfilled, (state) => {
        state.history = [];
      });
  },
});

export const {setSelectedRoute } = historySlice.actions;
export default historySlice.reducer;
