import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../../util/axiosWrapper';
import { ApiError } from '../../../util/ApiError';
import axios from 'axios';
import type { IFetchParams } from '../../../types/customTypes';
// Thunk to get all stageconfig data
const getAll = createAsyncThunk('stageconfigs/getAll', async (params: IFetchParams, { dispatch }) => {
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

    const response = await API.get(`/stageconfigs?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get stageconfig data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

const search = createAsyncThunk('stageconfigs/search', async (params: IFetchParams, { dispatch }) => {
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
    const response = await API.get(`/stageconfigs/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get stageconfig data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to get stageconfig data by ID
const get = createAsyncThunk('stageconfigs/get', async (id: string) => {
  try {
    const response = await API.get(`/stageconfigs/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get stageconfig data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to create new stageconfig data
const create = createAsyncThunk('stageconfigs/create', async (data: any) => {
  try {
    const response = await API.post('/stageconfigs', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to create stageconfig data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

const updateStageStatus = createAsyncThunk('stageconfigs/updateStageStatus', async ({ id, status }: { id: string; status: boolean }) => {
  try {
    const response = await API.put(`/stageconfigs/updateStageStatus/${id}`, { status });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to update stageconfig status', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});
// Thunk to update stageconfig data
const update = createAsyncThunk('stageconfigs/update', async ({ id, data }: { id: string; data: any }) => {
  try {
    const response = await API.put(`/stageconfigs/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to update stageconfig data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to update status of stageconfig data
const updateStatus = createAsyncThunk('stageconfigs/update', async ({ id, data }: { id: string; data: any }) => {
  try {
    const response = await API.put(`/stageconfigs/updateStatus/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to update stageconfig data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to remove stageconfig data
const remove = createAsyncThunk('stageconfigs/remove', async (id: string) => {
  try {
    const response = await API.delete(`/stageconfigs/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to delete stageconfig data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to find stageconfig data by stageconfig
const findByStageconfig = createAsyncThunk('stageconfigs/findByStageconfig', async (stageconfig: any) => {
  try {
    const response = await API.get(`/stageconfigs?stageconfig=${stageconfig}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to find stageconfig data ', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

const StageconfigService = {
  getAll,
  get,
  create,
  update,
  updateStageStatus,
  updateStatus,
  remove,
  findByStageconfig,
  search
};

export default StageconfigService;