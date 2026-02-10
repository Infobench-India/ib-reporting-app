import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import ResultAPIService from '../apis/ResultAPI'; // Adjust the import path based on your project structure
import type { I_GET_API_RESPONSE } from 'src/types/customTypes';


interface RESULTState {
  data: I_GET_API_RESPONSE | undefined; // Replace `any` with the specific data type for RESULT
  loading: boolean;
  error: string | null | undefined;
}

const initialState: RESULTState = {
  data: undefined,
  loading: false,
  error: null,
};

const resultdatasSlice = createSlice({
  name: 'resultdatas',
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
      .addCase(ResultAPIService.getAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ResultAPIService.getAll.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(ResultAPIService.getAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Export Results
      .addCase(ResultAPIService.exportResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ResultAPIService.exportResults.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(ResultAPIService.exportResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get SKU data by ID
      .addCase(ResultAPIService.get.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ResultAPIService.get.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // You might want to replace an existing SKU or handle it as needed
      })
      .addCase(ResultAPIService.get.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // // Create new SKU data
      // .addCase(ResultAPIService.create.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(ResultAPIService.create.fulfilled, (state, action: PayloadAction<any>) => {
      //   state.loading = false;
      //   state.data?.docs.push(action.payload.data); // Add the created SKU to the list
      // })
      // .addCase(ResultAPIService.create.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.error.message;
      // })

      // Update SKU data
      .addCase(ResultAPIService.update.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ResultAPIService.update.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const index = state.data?.docs.findIndex((item) => item.id === action.payload.doc.id);
        if (index !== undefined && index !== -1 && state.data && state.data.docs)  {
          state.data.docs[index] = action.payload.doc; // Update existing company
        }
      })
      .addCase(ResultAPIService.update.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Remove SKU data
      .addCase(ResultAPIService.remove.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ResultAPIService.remove.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (state.data && state.data.docs)  {
          state.data.docs = state.data?.docs.filter((item) => item.id !== action.payload); 
          }
      })
      .addCase(ResultAPIService.remove.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Find SKU data by SKU
      .addCase(ResultAPIService.findByVIN.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ResultAPIService.findByVIN.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // You can choose how to handle the found SKU data
      })
      .addCase(ResultAPIService.findByVIN.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Search SKU data
      .addCase(ResultAPIService.search.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ResultAPIService.search.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false;
        state.data = action.payload; // Update the list with the search results
      })
      .addCase(ResultAPIService.search.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Export actions
export const { clearError } = resultdatasSlice.actions;

// Export the reducer
export const { reducer: resultdatasReducer } = resultdatasSlice;
export default resultdatasReducer;
