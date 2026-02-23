import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getAll,
  get,
  create,
  update,
  remove,
  findBySKU,
  search
} from '../apis/ConfigGridAPI'; // Adjust the import path accordingly
import type { IConfigGrid, ConfigGridsState, I_GET_API_RESPONSE } from '../../../types/customTypes';


const initialState: ConfigGridsState = {
  data: undefined,
  loading: false,
  error: null,
};

const configGridsSlice = createSlice({
  name: 'configGrids',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null; // Clears the error state
    },
  },
  extraReducers: (builder) => {
    // Get all config grids
    builder
      .addCase(getAll.pending, (state) => {
        state.loading = true; // Set loading to true
        state.error = null; // Clear any previous error
      })
      .addCase(getAll.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false; // Load is complete
        state.data = action.payload; // Update with the fetched config grids
      })
      .addCase(getAll.rejected, (state, action) => {
        state.loading = false; // Load is complete
        state.error = action.error.message; // Set error message
      })

      // Get a config grid by ID
      .addCase(get.pending, (state) => {
        state.loading = true; // Set loading to true
        state.error = null; // Clear any previous error
      })
      .addCase(get.fulfilled, (state, action: PayloadAction<IConfigGrid>) => {
        state.loading = false; // Load is complete
        // Optionally update the state with the fetched config grid object
      })
      .addCase(get.rejected, (state, action) => {
        state.loading = false; // Load is complete
        state.error = action.error.message; // Set error message
      })

      // Create a new config grid
      .addCase(create.pending, (state) => {
        state.loading = true; // Set loading to true
        state.error = null; // Clear any previous error
      })
      .addCase(create.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false; // Load is complete
        if (state.data) {
          state.data.docs.push(action.payload.doc); // Add the new tool to the list
        }
      })
      .addCase(create.rejected, (state, action) => {
        state.loading = false; // Load is complete
        state.error = action.error.message; // Set error message
      })

      // Update a config grid
      .addCase(update.pending, (state) => {
        state.loading = true; // Set loading to true
        state.error = null; // Clear any previous error
      })
      .addCase(update.fulfilled, (state, action: PayloadAction<IConfigGrid>) => {
        state.loading = false; // Load is complete
        if (state.data && state.data.docs) {
          const index = state.data.docs.findIndex((item) => item.id === action.payload.id);
          if (index !== -1) {
            state.data.docs[index] = action.payload; // Update the tool in the state
          }
        }
      })
      .addCase(update.rejected, (state, action) => {
        state.loading = false; // Load is complete
        state.error = action.error.message; // Set error message
      })

      // Remove a config grid
      .addCase(remove.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(remove.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (state.data && state.data.docs)  {
          state.data.docs = state.data?.docs.filter((item) => item.id !== action.payload.doc.id); 
          }
      })
      .addCase(remove.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Find config grids by SKU
      .addCase(findBySKU.pending, (state) => {
        state.loading = true; // Set loading to true
        state.error = null; // Clear any previous error
      })
      .addCase(findBySKU.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false; // Load is complete
        state.data = action.payload; // Update with the found config grids by SKU
      })
      .addCase(findBySKU.rejected, (state, action) => {
        state.loading = false; // Load is complete
        state.error = action.error.message; // Set error message
      })
      // Search config data
      .addCase(search.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(search.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false;
        state.data = action.payload; // Update the list with the search results
      })
      .addCase(search.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Export actions
export const { clearError } = configGridsSlice.actions;

// Export the reducer for use in the store
export const { reducer: configGridsReducer } = configGridsSlice;
export default configGridsReducer;