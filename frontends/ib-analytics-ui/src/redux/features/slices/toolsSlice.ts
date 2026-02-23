import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../apis/ToolAPI'; // Adjust this import path if necessary
import type { I_GET_API_RESPONSE, ToolsState } from '../../../types/customTypes'; // Make sure this is the correct import

const initialState: ToolsState = {
  data: undefined,
  loading: false,
  error: null,
};

const toolsSlice = createSlice({
  name: 'tools',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null; // Clears the error state
    },
    // Add any additional reducers here if needed
  },
  extraReducers: (builder) => {
    // Get all tools
    builder
      .addCase(apiService.getAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.getAll.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false;
        state.data = action.payload; // Assuming response is an array of tools
      })
      .addCase(apiService.getAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Get tool by ID
      .addCase(apiService.get.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.get.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // Handle the specific tool data as needed (e.g., you could append, replace, or process in some way)
      })
      .addCase(apiService.get.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Create a new tool
      .addCase(apiService.create.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.create.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // If data is an array, you might append the new tool
        if (state.data) {
          state.data.docs.push(action.payload.doc); // Add the new tool to the list
        }
      })
      .addCase(apiService.create.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update a tool
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

      // Remove a tool
      .addCase(apiService.remove.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.remove.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (state.data && state.data.docs) {
          state.data.docs = state.data.docs.filter((item) => item.id !== action.payload.doc.id); // Remove the tool
        }
      })
      .addCase(apiService.remove.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Find by ID (if applicable)
      .addCase(apiService.findByStage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.findByStage.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data = action.payload; 
      })
      .addCase(apiService.findByStage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Search tools
      .addCase(apiService.search.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.search.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false;
        state.data = action.payload; // Update the state with search results
      })
      .addCase(apiService.search.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Export actions
export const { clearError } = toolsSlice.actions;

// Export the reducer
export const { reducer: toolsReducer } = toolsSlice;
export default toolsReducer;