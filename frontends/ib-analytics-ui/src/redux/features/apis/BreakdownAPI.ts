import axios from "axios";
import API from "../../../util/axiosWrapper";
import { ApiError } from "../../../util/ApiError";
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setError, setSuccess } from '../../errorSlice';
import type { IFetchParams } from "../../../types/customTypes";

export const getAll = createAsyncThunk('breakdownsState/getAll', async (params: IFetchParams, { dispatch }) => {
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

    const response = await API.get(`/breakdowns?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

const search = createAsyncThunk('breakdown/search', async (params: IFetchParams, { dispatch }) => {
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
    const response = await API.get(`/breakdowns/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.message || 'Failed to get breakdown data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

export const get = createAsyncThunk('breakdownsState/get', async (tool: any, { dispatch }) => {
  try {
    const response = await API.get(`/breakdowns/${tool}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const create = createAsyncThunk('breakdownsState/create', async (data: any, { dispatch }) => {
  try {
    const response = await API.post("/breakdowns", data);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const update = createAsyncThunk('breakdownsState/update', async (query: any, { dispatch }) => {
  try {
    const response = await API.put(`/breakdowns/${query.id}`, query.data);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const updatebyname = createAsyncThunk('breakdownsState/updatebyname', async (query: any, { dispatch }) => {
  try {
    const response = await API.put(`/breakdowns/${query.name}`, query.data);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const remove = createAsyncThunk('breakdownsState/remove', async (id: any, { dispatch }) => {
  try {
    const response = await API.delete(`/breakdowns/${id}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const findByDate = createAsyncThunk('breakdownsState/findByDate', async (timespan: any, { dispatch }) => {
  try {
    const response = await API.get(`/breakdowns?timespan=${timespan}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const BreakdownService = {
  getAll,
  search,
  get,
  create,
  update,
  remove,
  updatebyname,
  findByDate,
};

export default BreakdownService;