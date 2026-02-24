import { createAsyncThunk } from "@reduxjs/toolkit";
import API from '../../../util/sqlAxiosWrapper';

const ReportConfigService = {
    // Report Configs
    getAllReports: createAsyncThunk(
        "reportConfig/getAll",
        async (params: any, { rejectWithValue }) => {
            try {
                const response = await API.get(`/reports`, { params });
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    getReportById: createAsyncThunk(
        "reportConfig/getById",
        async (id: string, { rejectWithValue }) => {
            try {
                const response = await API.get(`/reports/${id}`);
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    createReport: createAsyncThunk(
        "reportConfig/create",
        async (data: any, { rejectWithValue, dispatch }) => {
            try {
                const response = await API.post(`/reports`, data);
                dispatch(ReportConfigService.getAllReports({}));
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    updateReport: createAsyncThunk(
        "reportConfig/update",
        async ({ id, data }: { id: string; data: any }, { rejectWithValue, dispatch }) => {
            try {
                const response = await API.put(`/reports/${id}`, data);
                dispatch(ReportConfigService.getAllReports({}));
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    deleteReport: createAsyncThunk(
        "reportConfig/delete",
        async (id: string, { rejectWithValue, dispatch }) => {
            try {
                const response = await API.delete(`/reports/${id}`);
                dispatch(ReportConfigService.getAllReports({}));
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    // Settings
    getSettings: createAsyncThunk(
        "reportConfig/getSettings",
        async (_, { rejectWithValue }) => {
            try {
                const response = await API.get(`/report-settings`);
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    updateSettings: createAsyncThunk(
        "reportConfig/updateSettings",
        async (data: any, { rejectWithValue }) => {
            try {
                const response = await API.put(`/report-settings`, data);
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    importJson: createAsyncThunk(
        "reportConfig/importJson",
        async (data: any, { rejectWithValue, dispatch }) => {
            try {
                const response = await API.post(`/import-json`, data);
                dispatch(ReportConfigService.getAllReports({}));
                dispatch(ReportConfigService.getSettings());
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    testConnection: async (connectionString: string) => {
        try {
            const response = await API.post(`/test-connection`, { connectionString });
            return response.data;
        } catch (err: any) {
            throw err.response?.data || err;
        }
    },

    testQuery: async (connectionString: string, query: string) => {
        try {
            const response = await API.post(`/test-query`, { connectionString, query });
            return response.data;
        } catch (err: any) {
            throw err.response?.data || err;
        }
    },
};

export default ReportConfigService;
