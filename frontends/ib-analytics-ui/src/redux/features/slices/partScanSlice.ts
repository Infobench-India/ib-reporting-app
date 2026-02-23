import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../apis/PartscanAPI'; // Adjust this import path
import type { I_GET_API_RESPONSE } from '../../../types/customTypes';

interface PartScanState {
  data:I_GET_API_RESPONSE | undefined; // Define this appropriately based on your station structure
  loading: boolean;
  error: string | null | undefined;
}

const initialState: PartScanState = {
  data: undefined,
  loading: false,
  error: null,
};

const PartScanSlice = createSlice({
  name: 'partscan',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null; // Clears the error state
    },
    // Add any additional reducers here
  },
  extraReducers: (builder) => {
    // Get all partscan
    builder
      .addCase(apiService.getAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.getAll.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false;
        state.data = action.payload; // Assuming response is an array of stations
      })
      .addCase(apiService.getAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Get a station by ID
      .addCase(apiService.get.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.get.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // You might want to replace an existing station or handle it as needed
      })
      .addCase(apiService.get.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Create a new station
      .addCase(apiService.create.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.create.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data?.docs.push(action.payload?.doc); // Add the newly created station
      })
      .addCase(apiService.create.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update a station
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

      // Remove a station
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

      // Find by ID
      .addCase(apiService.findBySKU.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.findBySKU.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(apiService.findBySKU.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Search stations
      .addCase(apiService.search.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.search.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false;
        state.data = action.payload; // Update with the search results
      })
      .addCase(apiService.search.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
  },
});

// Export actions
export const { clearError } = PartScanSlice.actions;

// Export the reducer
export const { reducer: stationsReducer } = PartScanSlice;
export default stationsReducer;