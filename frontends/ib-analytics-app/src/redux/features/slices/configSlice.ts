import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getAll,
  get,
  create,
  update,
  updateToolStatus,
  updatePartStatus,
  remove,
  removeSKU,
  findByStage,
} from '../apis/ConfigAPI'; // Adjust the import path
import { setError } from '../../errorSlice'; // Ensure this is the correct import for your error slice
import type { I_GET_API_RESPONSE, StageConfigState } from '../../../types/customTypes';

const initialState: StageConfigState = {
  data: undefined,
  loading: false,
  error: null,
};

const stageConfigsSlice = createSlice({
  name: 'configs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null; // Clears the error state
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all stage configs
      .addCase(getAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAll.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false;
        state.data = action.payload; // Update with the fetched stage configs
      })
      .addCase(getAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error fetching stage configs';
      })

      // Get a stage config by ID
      .addCase(get.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(get.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // Handle the found stage config as needed
      })
      .addCase(get.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error fetching stage config';
      })

      // Create a new stage config
      .addCase(create.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(create.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // If data is an array, you might append the new tool
        if (state.data) {
          state.data.docs.push(action.payload.doc); // Add the new tool to the list
        }
      })
      .addCase(create.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error creating stage config';
      })

      // Update a stage config
      .addCase(update.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(update.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (state.data && state.data.docs) {
          const index = state.data.docs.findIndex((item) => item.id === action.payload.id);
          if (index !== -1) {
            state.data.docs[index] = action.payload; // Update the tool in the state
          }
        }
      })
      .addCase(update.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error updating stage config';
      })

      // Update tool status
      .addCase(updateToolStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateToolStatus.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // Handle the updated tool status if necessary
      })
      .addCase(updateToolStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error updating tool status';
      })

      // Update part status
      .addCase(updatePartStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePartStatus.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // Handle the updated part status if necessary
      })
      .addCase(updatePartStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error updating part status';
      })

      // Remove a stage config
      .addCase(remove.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(remove.fulfilled,(state, action: PayloadAction<any>) => {
        state.loading = false;
        if (state.data && state.data.docs) {
          state.data.docs = state.data.docs.filter((item) => item.id !== action.payload.doc.id); // Remove the tool
        }
      })
      .addCase(remove.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error removing stage config';
      })

      // Remove a stage config by SKU
      .addCase(removeSKU.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeSKU.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // Handle the result of removing a stage config by SKU if necessary
      })
      .addCase(removeSKU.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error removing stage config by SKU';
      })

      // Find stage configs by stage
      .addCase(findByStage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(findByStage.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data = action.payload; // Update with the found stage configs
      })
      .addCase(findByStage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error finding stage configs by stage';
      });
  },
});

// Export actions
export const { clearError } = stageConfigsSlice.actions;

// Export the reducer
export const { reducer: stageConfigsReducer } = stageConfigsSlice;
export default stageConfigsReducer;