import {createAsyncThunk} from '@reduxjs/toolkit';
import API from '../../../util/axiosWrapper';
import { ApiError } from 'src/util/ApiError';
import axios from 'axios';
import type {IFetchParams} from '../../../types/customTypes';
import {setError} from '../../../redux/errorSlice';

// Thunk to get all Production data
const getAll = createAsyncThunk('productiondata/getAll', async (params: IFetchParams) => {
    try {
        const {page = 1, limit = 50, sort, filter} = params;

        const queryparams: URLSearchParams = new URLSearchParams();
        queryparams.append('page', String(page));
        queryparams.append('limit', String(limit));

        if(sort) {
            queryparams.append('sort', sort);
        }
        if(filter) {
            queryparams.append('filter', JSON.stringify(Object.entries(filter).map(([Key, value])=>({id: Key, value}))));

        }
        const response = await API.get('/productiondatas?' + queryparams.toString());
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new ApiError(error.response?.data.errors || 'Failed to get Production data', error.response?.status || 500);
        }
        else {
            throw new ApiError('An unexpected error occurred', 500);
        }
    }
})

// Thunk to get Production data by ID
const get = createAsyncThunk('productiondata/get', async (id: string) => {
  try {
    const response = await API.get(`/productiondatas/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to get Production data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to create new Production data
const create = createAsyncThunk('productiondata/create', async (data: any, { dispatch }) => {
  try {
    const response = await API.post('/productiondatas', data);
    return response.data;
  } catch (error:any) {
    dispatch(setError(error.response?.data.errors || error.response?.data.message || 'Failed to create Production data'));

    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to create Production data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to update Production data
const update = createAsyncThunk('productiondata/update', async ({ id, data }: { id: string; data: any }) => {
  try {
    const response = await API.put(`/productiondatas/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to update Production data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

// Thunk to remove Production data
const remove = createAsyncThunk('productiondata/remove', async (id: string) => {
  try {
    const response = await API.delete(`/productiondatas/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.errors || 'Failed to delete Production data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

const ProductionAPI = {
  getAll,
  get,
  create,
  update,
  remove
};

export default ProductionAPI;