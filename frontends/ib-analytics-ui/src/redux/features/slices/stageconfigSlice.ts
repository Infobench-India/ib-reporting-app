import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../apis/StageconfigAPI'; // Adjust the import path based on your project structure
import type { I_GET_API_RESPONSE } from 'src/types/customTypes';


interface StageConfigState {
  data: I_GET_API_RESPONSE | undefined; // Replace `any` with the specific data type for StageConfig
  loading: boolean;
  error: string | null | undefined;
}

const initialState: StageConfigState = {
  data: undefined,
  loading: false,
  error: null,
};

const stageconfigsSlice = createSlice({
  name: 'stageconfigs',
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

      // Get SKU data by ID
      .addCase(apiService.get.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.get.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // You might want to replace an existing SKU or handle it as needed
      })
      .addCase(apiService.get.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Create new SKU data
      .addCase(apiService.create.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.create.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data?.docs.push(action.payload?.data); // Add the created SKU to the list
      })
      .addCase(apiService.create.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update SKU data
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

      // UpdateStatus SKU data
      .addCase(apiService.updateStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.updateStatus.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const index = state.data?.docs.findIndex((item) => item.id === action.payload.doc.id);
        if (index !== undefined && index !== -1 && state.data && state.data.docs)  {
          state.data.docs[index] = action.payload.doc; // updateStatus existing company
        }
      })
      .addCase(apiService.updateStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Remove SKU data
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

      // Find SKU data by SKU
      .addCase(apiService.findByStageconfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.findByStageconfig.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // You can choose how to handle the found SKU data
      })
      .addCase(apiService.findByStageconfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Search SKU data
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

// Export actions
export const { clearError } = stageconfigsSlice.actions;

// Export the reducer
export const { reducer: skudatasReducer } = stageconfigsSlice;
export default skudatasReducer;
