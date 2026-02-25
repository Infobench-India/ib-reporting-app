import axios from "axios";
import API from "../../../util/axiosWrapper";
import { ApiError } from "../../../util/ApiError";
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setError, setSuccess } from '../../errorSlice';
import type { IFetchParams } from '../../../types/customTypes';
export const getAll = createAsyncThunk('configGridsState/getAll', async (params: IFetchParams, { dispatch }) => {
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
    const response = await API.get(`/configrids?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const get = createAsyncThunk('configGridsState/get', async (id: any, { dispatch }) => {
  try {
    const response = await API.get(`/configrids/${id}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const create = createAsyncThunk('configGridsState/create', async (data: any, { dispatch }) => {
  try {
    const response = await API.post("/configrids", data);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const update = createAsyncThunk('configGridsState/update', async (query: any, { dispatch }) => {
  try {
    const response = await API.put(`/configrids/${query.id}`, query.data);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const remove = createAsyncThunk('configGridsState/remove', async (id: any, { dispatch }) => {
  try {
    const response = await API.delete(`/configrids/${id}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const findBySKU = createAsyncThunk('configGridsState/findBySKU', async (sku: any, { dispatch }) => {
  try {
    const response = await API.get(`/configrids?sku=${sku}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const search = createAsyncThunk('configrids/search', async (params: IFetchParams, { dispatch }) => {
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
    const response = await API.get(`/configrids/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.message || 'Failed to get configrids data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

const ConfigGridService = {
  getAll,
  get,
  create,
  update,
  remove,
  findBySKU,
  search
};

export default ConfigGridService;