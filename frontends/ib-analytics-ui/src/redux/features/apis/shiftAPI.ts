import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../../util/axiosWrapper';
import { ApiError } from '../../../util/ApiError';
import axios from 'axios';
import type { IFetchParams } from '../../../types/customTypes';
import { setError } from '../../../redux/errorSlice';
// Thunk to get all shift data
const getAll = createAsyncThunk('shiftdata/getAll', async (params: IFetchParams, { dispatch }) => {
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

    const response = await API.get(`/productionshifts?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get shift data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to get shift data by ID
const get = createAsyncThunk('shiftdata/get', async (id: string) => {
  try {
    const response = await API.get(`/productionshifts/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get shift data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to create new shift data
const create = createAsyncThunk('shiftdata/create', async (data: any, { dispatch }) => {
  try {
    const response = await API.post('/productionshifts', data);
    return response.data;
  } catch (error:any) {
    dispatch(setError(error.response?.data.errors || error.response?.data.message || 'Failed to create shift data'));
    
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to create shift data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to update shift data
const update = createAsyncThunk('shiftdata/update', async ({ id, data }: { id: string; data: any }) => {
  try {
    const response = await API.put(`/productionshifts/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to update shift data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to remove shift data
const remove = createAsyncThunk('shiftdata/remove', async (uuid: string) => {
  try {
    const response = await API.delete(`/productionshifts/${uuid}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to delete shift data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});


const ShiftService = {
  getAll,
  get,
  create,
  update,
  remove,
};

export default ShiftService;