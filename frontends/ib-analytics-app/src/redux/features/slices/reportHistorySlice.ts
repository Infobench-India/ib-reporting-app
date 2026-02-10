import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../apis/ReportHistoryAPI';
import type { I_GET_API_RESPONSE } from '../../../types/customTypes';

interface ReportHistoryState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}

const initialState: ReportHistoryState = {
    data: undefined,
    loading: false,
    error: null,
};

const reportHistorySlice = createSlice({
    name: 'reportHistory',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
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
            .addCase(apiService.resend.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(apiService.resend.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(apiService.resend.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { clearError } = reportHistorySlice.actions;
export const { reducer: reportHistoryReducer } = reportHistorySlice;
export default reportHistoryReducer;
