import axios from "axios";
import API from "../../../util/axiosWrapper";
import { ApiError } from "../../../util/ApiError";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { setError, setSuccess } from '../../errorSlice';
import type { IFetchParams } from '../../../types/customTypes';
export const getAll = createAsyncThunk('partscansState/getAll', async (params: IFetchParams, { dispatch }) => {
  try {
    const { page = 1, limit = 10, sort, filter } = params;

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
    const response = await API.get(`/partscans?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const get = createAsyncThunk('partscansState/get', async (id: any, { dispatch }) => {
  try {
    const response = await API.get(`/partscans/${id}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const create = createAsyncThunk('partscansState/create', async (data: any, { dispatch }) => {
  try {
    const response = await API.post("/partscans", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to create partscans data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

export const update = createAsyncThunk('partscansState/update', async (query: any, { dispatch }) => {
  try {
    const response = await API.put(`/partscans/${query.id}`, query.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to update partscans data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

export const remove = createAsyncThunk('partscansState/remove', async (id: any, { dispatch }) => {
  try {
    const response = await API.delete(`/partscans/${id}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const findBySKU = createAsyncThunk('partscansState/findBySKU', async (query: any, { dispatch }) => {
  try {
    const response = await API.get(`/partscans?sku=${query.sku}&stage=${query.stage}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const search = createAsyncThunk('partscansState/search', async (params: IFetchParams, { dispatch }) => {
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
    const response = await API.get(`/partscans/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get partscans data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

const PartscanService = {
  getAll,
  create,
  get,
  update,
  remove,
  findBySKU,
  search
};

export default PartscanService;