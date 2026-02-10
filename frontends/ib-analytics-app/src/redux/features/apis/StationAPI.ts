import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../../util/axiosWrapper';
import { ApiError } from '../../../util/ApiError';
import axios from 'axios';
import type { IFetchParams } from '../../../types/customTypes';
// Thunk to get all stations
export const getAll = createAsyncThunk('stations/getAll', async (params: IFetchParams, { dispatch }) => {
  try {
    const { page = 1, limit = 50, sort, filter } = params;
    // Build the query string
    const queryParams: URLSearchParams = new URLSearchParams();
    if(page && limit)
    {queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));}

    if (sort) {
      queryParams.append('sort', sort);
    }

    if (filter) {
      queryParams.append('filter', JSON.stringify(Object.entries(filter).map(([key, value]) => ({ id: key, value }))));
    }
    const response = await API.get(`/stations?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get stations', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to get a station by ID
export const get = createAsyncThunk('stations/get', async (id: any) => {
  try {
    const response = await API.get(`/stations/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get station', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to create a new station
export const create = createAsyncThunk('stations/create', async (data: any) => {
  try {
    const response = await API.post('/stations', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to create station', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to update a station
export const update = createAsyncThunk('stations/update', async ({ id, data }: { id: any; data: any }) => {
  try {
    const response = await API.put(`/stations/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to update station', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to remove a station
export const remove = createAsyncThunk('stations/remove', async (id: any) => {
  try {
    const response = await API.delete(`/stations/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to delete station', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to find a station by ID
export const findByID = createAsyncThunk('stations/findByID', async (id: any) => {
  try {
    const response = await API.get(`/stations?id=${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to find station by ID', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

const search = createAsyncThunk('stations/search', async (params: IFetchParams, { dispatch }) => {
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
    const response = await API.get(`/stations/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get SKU data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});
const ToolService = {
  getAll,
  get,
  create,
  update,
  remove,
  findByID,
  search
};

export default ToolService;