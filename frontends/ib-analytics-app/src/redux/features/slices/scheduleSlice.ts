// src/redux/slices/scheduleSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { I_GET_API_RESPONSE, ScheduleState } from '../../../types/customTypes';
import apiService from '../apis/ScheduleConfigAPI';
interface SchedulesState {
  data: I_GET_API_RESPONSE | undefined; // Replace `any` with the specific data type for Schedules
  loading: boolean;
  error: string | null | undefined;
}
const initialState: SchedulesState = {
  data: undefined,
  loading: false,
  error: null,
};
// Slice
const scheduleSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null; // Clears the error state
    },
  },
  extraReducers: (builder) => {
    // Get all Schedules data
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

      // Get Schedules data by ID
      .addCase(apiService.get.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.get.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // You might want to replace an existing Schedules or handle it as needed
      })
      .addCase(apiService.get.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Create new Schedules data
      .addCase(apiService.create.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.create.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data?.docs.push(action.payload?.doc); // Add the created Schedules to the list
      })
      .addCase(apiService.create.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update Schedules data
      .addCase(apiService.update.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.update.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const index = state.data?.docs.findIndex((item) => item.id === action.payload.doc.id);
        if (index !== undefined && index !== -1 && state.data && state.data.docs)  {
          state.data.docs[index] = action.payload.doc; // Update existing company
        }
      })
      .addCase(apiService.update.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Remove Schedules data
      .addCase(apiService.remove.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.remove.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (state.data && state.data.docs)  {
          state.data.docs = state.data?.docs.filter((item) => item.id !== action.payload.doc.id); 
          }
      })
      .addCase(apiService.remove.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Search Schedules data
      .addCase(apiService.search.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.search.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false;
        state.data = action.payload; // Update the list with the search results
      })
      .addCase(apiService.search.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
export default scheduleSlice.reducer;