import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../../util/axiosWrapper';
import { ApiError } from '../../../util/ApiError';
import axios from 'axios';
import type { IFetchParams } from '../../../types/customTypes';
import { setError } from '../../../redux/errorSlice';
// Thunk to get all SKU data
const getAll = createAsyncThunk('skudata/getAll', async (params: IFetchParams, { dispatch }) => {
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

    const response = await API.get(`/skudatas?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get SKU data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

const search = createAsyncThunk('skudata/search', async (params: IFetchParams, { dispatch }) => {
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
    const response = await API.get(`/skudatas/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get SKU data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to get SKU data by ID
const get = createAsyncThunk('skudata/get', async (id: string) => {
  try {
    const response = await API.get(`/skudatas/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get SKU data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to create new SKU data
const create = createAsyncThunk('skudata/create', async (data: any, { dispatch }) => {
  try {
    const response = await API.post('/skudatas', data);
    return response.data;
  } catch (error:any) {
    dispatch(setError(error.response?.data.errors || error.response?.data.message || 'Failed to create SKU data'));
    
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to create SKU data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to update SKU data
const update = createAsyncThunk('skudata/update', async ({ id, data }: { id: string; data: any }) => {
  try {
    const response = await API.put(`/skudatas/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to update SKU data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to remove SKU data
const remove = createAsyncThunk('skudata/remove', async (id: string) => {
  try {
    const response = await API.delete(`/skudatas/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to delete SKU data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to find SKU data by SKU
const findBySKU = createAsyncThunk('skudata/findBySKU', async (sku: any) => {
  try {
    const response = await API.get(`/skudatas?sku=${sku}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to find SKU data by SKU', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

const SKUService = {
  getAll,
  get,
  create,
  update,
  remove,
  findBySKU,
  search
};

export default SKUService;