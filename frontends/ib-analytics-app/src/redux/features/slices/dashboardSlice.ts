// src/redux/slices/dashboardSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { I_GET_API_RESPONSE, ScheduleState } from '../../../types/customTypes';
import apiService from '../apis/DashboardAPI';
interface DashboardState {
  data: I_GET_API_RESPONSE | undefined; // Replace `any` with the specific data type for Schedules
  loading: boolean;
  error: string | null | undefined;
}
const initialState: DashboardState = {
  data: undefined,
  loading: false,
  error: null,
};
// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
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
  },
});
export default dashboardSlice.reducer;