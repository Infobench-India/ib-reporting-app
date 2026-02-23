import { createAsyncThunk } from "@reduxjs/toolkit";
import API from '../../../util/sqlAxiosWrapper';

// Using the same base URL as in schedulerService.ts
const API_BASE = '/sql-report-scheduler';

const SQLSchedulerService = {
    getSchedules: createAsyncThunk(
        "sqlScheduler/getSchedules",
        async (params: any, { rejectWithValue }) => {
            try {
                const response = await API.get(`${API_BASE}`, { params });
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    createSchedule: createAsyncThunk(
        "sqlScheduler/createSchedule",
        async (data: any, { rejectWithValue, dispatch }) => {
            try {
                const response = await API.post(`${API_BASE}`, data);
                dispatch(SQLSchedulerService.getSchedules({}));
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    updateSchedule: createAsyncThunk(
        "sqlScheduler/updateSchedule",
        async ({ id, data }: { id: number, data: any }, { rejectWithValue, dispatch }) => {
            try {
                const response = await API.put(`${API_BASE}/${id}`, data);
                dispatch(SQLSchedulerService.getSchedules({}));
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    deleteSchedule: createAsyncThunk(
        "sqlScheduler/deleteSchedule",
        async (id: number, { rejectWithValue, dispatch }) => {
            try {
                const response = await API.delete(`${API_BASE}/${id}`);
                dispatch(SQLSchedulerService.getSchedules({}));
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    getHistory: createAsyncThunk(
        "sqlScheduler/getHistory",
        async (params: { scheduleId?: number; page?: number; limit?: number }, { rejectWithValue }) => {
            try {
                const response = await API.get(`${API_BASE}/history/list`, { params });
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    resendReport: createAsyncThunk(
        "sqlScheduler/resendReport",
        async (historyId: number, { rejectWithValue, dispatch }) => {
            try {
                const response = await API.post(`${API_BASE}/history/${historyId}/resend`);
                // dispatch(SQLSchedulerService.getHistory(undefined)); // Optional: refresh history after resend
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),
};

export default SQLSchedulerService;
