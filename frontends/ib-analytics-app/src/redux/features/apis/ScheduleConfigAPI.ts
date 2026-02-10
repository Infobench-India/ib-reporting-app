import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../../util/axiosWrapper';
import { ApiError } from '../../../util/ApiError';
import axios from 'axios';
import type { IFetchParams } from '../../../types/customTypes';
import { setError } from '../../../redux/errorSlice';
// Thunk to get all data
const getAll = createAsyncThunk('scheduleConfig/getAll', async (params: IFetchParams, { dispatch }) => {
  try {
    const { page = 1, limit = 50, sort, filter } = params;

    // Build the query string
    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    if (sort) {
      queryParams.append('sort', sort);
    }

    if (filter) {
      queryParams.append('filter', JSON.stringify(Object.entries(filter).map(([key, value]) => ({ id: key, value }))));
    }

    const response = await API.get(`/schedule-config?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

const search = createAsyncThunk('scheduleConfig/search', async (params: IFetchParams, { dispatch }) => {
  try {
    const { page = 1, limit = 50, sort, q } = params;

    // Build the query string
    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    if (sort) {
      queryParams.append('sort', sort);
    }
    if (q) {
      queryParams.append('q', q);
    }
    const response = await API.get(`/schedule-config/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to get data by ID
const get = createAsyncThunk('scheduleConfig/get', async (id: string) => {
  try {
    const response = await API.get(`/schedule-config/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to create new data
const create = createAsyncThunk('scheduleConfig/create', async (data: any, { dispatch }) => {
  try {
    const response = await API.post('/schedule-config', data);
    return response.data;
  } catch (error:any) {
    dispatch(setError(error.response?.data.errors || error.response?.data.message || 'Failed to create data'));
    
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to create data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to update data
const update = createAsyncThunk('scheduleConfig/update', async ({ id, data }: { id: string; data: any }) => {
  try {
    const response = await API.put(`/schedule-config/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to update data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to remove data
const remove = createAsyncThunk('scheduleConfig/remove', async (id: string) => {
  try {
    const response = await API.delete(`/schedule-config/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to delete data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

const ScheduleConfigService = {
  getAll,
  get,
  create,
  update,
  remove,
  search
};

export default ScheduleConfigService;