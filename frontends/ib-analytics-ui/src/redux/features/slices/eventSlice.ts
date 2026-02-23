import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../apis/EventAPI'; 
import type { I_GET_API_RESPONSE } from '../../../types/customTypes';

interface EventsState {
  data:I_GET_API_RESPONSE | undefined; // Define this appropriately based on your station structure
  loading: boolean;
  error: string | null | undefined;
}

const initialState: EventsState = {
  data: undefined,
  loading: false,
  error: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null; // Clears the error state
    },
    // Add any additional reducers here
  },
  extraReducers: (builder) => {
    // Get all auditlogs
    builder
      .addCase(apiService.getAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.getAll.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false;
        state.data = action.payload; 
      })
      .addCase(apiService.getAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Search auditlog
      .addCase(apiService.search.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.search.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false;
        state.data = action.payload; 
      })
      .addCase(apiService.search.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
  },
});

// Export actions
export const { clearError } = eventsSlice.actions;

// Export the reducer
export const { reducer: eventsreducer } = eventsSlice;
export default eventsreducer;