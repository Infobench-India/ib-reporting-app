import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../../util/axiosWrapper';
import { ApiError } from '../../../util/ApiError';
import axios from 'axios';
import type { IFetchParams } from '../../../types/customTypes';

const getAll = createAsyncThunk('reportHistory/getAll', async (params: IFetchParams) => {
    try {
        const { page = 1, limit = 50, sort, filter } = params;
        const queryParams: URLSearchParams = new URLSearchParams();
        queryParams.append('page', String(page));
        queryParams.append('limit', String(limit));

        if (sort) queryParams.append('sort', sort);
        if (filter) {
            Object.entries(filter).forEach(([key, value]) => {
                if (value) queryParams.append(key, String(value));
            });
        }

        const response = await API.get(`/report-history?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new ApiError(error.response?.data.message || 'Failed to get data', error.response?.status || 500);
        } else {
            throw new ApiError('An unexpected error occurred', 500);
        }
    }
});

const resend = createAsyncThunk('reportHistory/resend', async ({ id, recipients, companyId }: { id: string, recipients?: string[], companyId: string }) => {
    try {
        const response = await API.post(`/report-history/resend/${id}`, { recipients, companyId });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new ApiError(error.response?.data.message || 'Failed to resend report', error.response?.status || 500);
        } else {
            throw new ApiError('An unexpected error occurred', 500);
        }
    }
});

const ReportHistoryService = {
    getAll,
    resend
};

export default ReportHistoryService;
