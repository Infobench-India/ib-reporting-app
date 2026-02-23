import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../apis/SystemConfigAPI'; // Adjust the import path based on your project structure
import type { I_GET_API_RESPONSE } from 'src/types/customTypes';


interface SystemConfigState {
  data: I_GET_API_RESPONSE | undefined; // Replace `any` with the specific data type for SKU
  loading: boolean;
  error: string | null | undefined;
}

const initialState: SystemConfigState = {
  data: undefined,
  loading: false,
  error: null,
};

const systemConfigsSlice = createSlice({
  name: 'systemConfig',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null; // Clears the error state
    },
    // Add any other synchronous reducers you might need here
  },
  extraReducers: (builder) => {
    // Get all SKU data
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

// Export actions
export const { clearError } = systemConfigsSlice.actions;

// Export the reducer
export const { reducer: systemConfigsReducer } = systemConfigsSlice;
export default systemConfigsReducer;
