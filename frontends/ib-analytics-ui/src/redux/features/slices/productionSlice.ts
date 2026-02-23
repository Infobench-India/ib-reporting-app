import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../apis/productionAPI'; // Adjust the import path based on your project structure
import type { I_GET_API_RESPONSE } from 'src/types/customTypes';


interface ProductionState {
  data: I_GET_API_RESPONSE | undefined; // Replace `any` with the specific data type for Production
  loading: boolean;
  error: string | null | undefined;
}

const initialState: ProductionState = {
  data: undefined,
  loading: false,
  error: null,
};

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null; // Clears the error state
    },
    // Add any other synchronous reducers you might need here
  },
  extraReducers: (builder) => {
    // Get all Production data
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
        console.error("Production Fetch Error:", action.error);
      })

      // Get Production data by ID
      .addCase(apiService.get.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.get.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // You might want to replace an existing Production or handle it as needed
      })
      .addCase(apiService.get.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Create new Production data
      .addCase(apiService.create.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.create.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data?.docs.push(action.payload?.doc); // Add the created Production to the list
      })
      .addCase(apiService.create.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update Production data
      .addCase(apiService.update.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.update.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const index = state.data?.docs.findIndex((item) => item.id === action.payload.doc.id);
        if (index !== undefined && index !== -1 && state.data && state.data.docs)  {
          state.data.docs[index] = action.payload.doc; 
        }
      })
      .addCase(apiService.update.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Remove Production data
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
  },
});

// Export actions
export const { clearError } = productionSlice.actions;

// Export the reducer
export const { reducer: productionReducer } = productionSlice;
export default productionReducer;