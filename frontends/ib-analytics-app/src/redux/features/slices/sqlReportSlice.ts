import { createSlice } from "@reduxjs/toolkit";
import SQLReportService from "../apis/SQLReportAPI";

interface SQLReportState {
    configs: {
        category: string;
        name: string;
        charts?: {
            chartType: string;
            chartTitle: string;
            xAxisColumn: string;
            yAxisColumns: string;
            xAxisLabel: string;
            yAxisLabel: string;
        }[];
    }[];
    reportData: any[];
    charts: {
        chartType: string;
        chartTitle: string;
        xAxisColumn: string;
        yAxisColumns: string;
        xAxisLabel: string;
        yAxisLabel: string;
    }[] | null;
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        itemsPerPage: number;
    } | null;
    loading: boolean;
    error: string | null;
}

const initialState: SQLReportState = {
    configs: [],
    reportData: [],
    charts: null,
    pagination: null,
    loading: false,
    error: null,
};

const sqlReportSlice = createSlice({
    name: "sqlReport",
    initialState,
    reducers: {
        clearReportData: (state) => {
            state.reportData = [];
            state.charts = null;
            state.pagination = null;
        }
    },
    extraReducers: (builder) => {
        // Get Configs
        builder.addCase(SQLReportService.getConfigs.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(SQLReportService.getConfigs.fulfilled, (state, action) => {
            state.loading = false;
            state.configs = action.payload.data;
        });
        builder.addCase(SQLReportService.getConfigs.rejected, (state, action: any) => {
            state.loading = false;
            state.error = action.payload?.errors?.[0] || "Failed to load report configurations";
        });

        // Execute Report
        builder.addCase(SQLReportService.executeReport.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(SQLReportService.executeReport.fulfilled, (state, action) => {
            state.loading = false;
            state.reportData = action.payload.data;
            state.charts = action.payload.charts;
            state.pagination = action.payload.pagination;
        });
        builder.addCase(SQLReportService.executeReport.rejected, (state, action: any) => {
            state.loading = false;
            state.error = action.payload?.errors?.[0] || "Failed to execute report";
        });
    },
});

export const { clearReportData } = sqlReportSlice.actions;
export default sqlReportSlice.reducer;
