import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../apis/MachineConfigAPI';
import type { I_GET_API_RESPONSE } from 'src/types/customTypes';

interface MachineConfigState {
  data: I_GET_API_RESPONSE | undefined;
  loading: boolean;
  error: string | null | undefined;
}

const initialState: MachineConfigState = {
  data: undefined,
  loading: false,
  error: null,
};

const machineConfigSlice = createSlice({
  name: 'machineConfigs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // List configs
    builder
      .addCase(apiService.listConfigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.listConfigs.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(apiService.listConfigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Get config by id
      .addCase(apiService.getConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.getConfig.fulfilled, (state) => {
        state.loading = false;
        // Handle selected config if needed
      })
      .addCase(apiService.getConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Create config
      .addCase(apiService.createConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.createConfig.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload?.doc) {
          state.data?.docs.push(action.payload.doc);
        }
      })
      .addCase(apiService.createConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update config
      .addCase(apiService.updateConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.updateConfig.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const updated = action.payload?.doc;
        if (updated && state.data && state.data.docs) {
          const idx = state.data.docs.findIndex((d: any) => d.id === updated.id);
          if (idx !== -1) state.data.docs[idx] = updated;
        }
      })
      .addCase(apiService.updateConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Delete config
      .addCase(apiService.deleteConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.deleteConfig.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const removed = action.payload?.doc;
        if (removed && state.data && state.data.docs) {
          state.data.docs = state.data.docs.filter((d: any) => d.id !== removed.id);
        }
      })
      .addCase(apiService.deleteConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Search configs
      .addCase(apiService.searchConfigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(apiService.searchConfigs.fulfilled, (state, action: PayloadAction<I_GET_API_RESPONSE>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(apiService.searchConfigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = machineConfigSlice.actions;
export const { reducer: machineConfigReducer } = machineConfigSlice;
export default machineConfigReducer;
