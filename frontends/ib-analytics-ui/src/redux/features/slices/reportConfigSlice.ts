import { createSlice } from "@reduxjs/toolkit";
import ReportConfigService from "../apis/ReportConfigAPI";

interface ReportConfigState {
    reports: any[];
    settings: any;
    loading: boolean;
    error: string | null;
}

const initialState: ReportConfigState = {
    reports: [],
    settings: null,
    loading: false,
    error: null,
};

const reportConfigSlice = createSlice({
    name: "reportConfig",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // List Reports
        builder.addCase(ReportConfigService.getAllReports.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(ReportConfigService.getAllReports.fulfilled, (state, action) => {
            state.loading = false;
            state.reports = action.payload.data;
        });
        builder.addCase(ReportConfigService.getAllReports.rejected, (state, action: any) => {
            state.loading = false;
            state.error = action.payload?.errors?.[0] || "Failed to load reports";
        });

        // Get Settings
        builder.addCase(ReportConfigService.getSettings.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(ReportConfigService.getSettings.fulfilled, (state, action) => {
            state.loading = false;
            state.settings = action.payload.data;
        });
        builder.addCase(ReportConfigService.getSettings.rejected, (state, action: any) => {
            state.loading = false;
            state.error = action.payload?.errors?.[0] || "Failed to load settings";
        });

        // Import JSON
        builder.addCase(ReportConfigService.importJson.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(ReportConfigService.importJson.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(ReportConfigService.importJson.rejected, (state, action: any) => {
            state.loading = false;
            state.error = action.payload?.errors?.[0] || "Failed to import configuration";
        });
    },
});

export default reportConfigSlice.reducer;
