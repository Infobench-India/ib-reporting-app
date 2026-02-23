import { createSlice } from "@reduxjs/toolkit";
import SQLSchedulerService from "../apis/SQLSchedulerAPI";

interface SQLSchedulerState {
    data: {
        docs: any[];
    };
    history: {
        docs: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    loading: boolean;
    error: string | null;
}

const initialState: SQLSchedulerState = {
    data: {
        docs: [],
    },
    history: {
        docs: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    },
    loading: false,
    error: null,
};

const sqlSchedulerSlice = createSlice({
    name: "sqlScheduler",
    initialState,
    reducers: {
        clearSchedulerError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Get Schedules
        builder.addCase(SQLSchedulerService.getSchedules.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(SQLSchedulerService.getSchedules.fulfilled, (state, action) => {
            state.loading = false;
            state.data = { docs: action.payload.data || [] };
        });
        builder.addCase(SQLSchedulerService.getSchedules.rejected, (state, action: any) => {
            state.loading = false;
            state.error = action.payload?.message || "Failed to load schedules";
        });

        // Get History
        builder.addCase(SQLSchedulerService.getHistory.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(SQLSchedulerService.getHistory.fulfilled, (state, action) => {
            state.loading = false;
            state.history = {
                docs: action.payload.data || [],
                total: action.payload.total || 0,
                page: action.payload.page || 1,
                limit: action.payload.limit || 10,
                totalPages: action.payload.totalPages || 0
            };
        });
        builder.addCase(SQLSchedulerService.getHistory.rejected, (state, action: any) => {
            state.loading = false;
            state.error = action.payload?.message || "Failed to load history";
        });
    },
});

export const { clearSchedulerError } = sqlSchedulerSlice.actions;
export default sqlSchedulerSlice.reducer;
