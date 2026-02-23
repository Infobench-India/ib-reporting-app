import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../../util/axiosWrapper1';
import { ApiError } from '../../../util/ApiError';
import axios from 'axios';
import type { IFetchParams } from '../../../types/customTypes';
import { setError } from '../../../redux/errorSlice';
const getAll = createAsyncThunk('results/getAll', async (params: IFetchParams, { dispatch }) => {
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
    const response = await API.get(`/results?${queryParams.toString()}`);
    return response.data;
  } catch (error : any) {
   dispatch(setError(error.message || 'Failed to get results'));
       throw error; // Rethrow the error for further handling if needed
  }
});

const exportResults = createAsyncThunk(
  "results/export",
  async (params: IFetchParams, { rejectWithValue }) => {
    try {
      const { sort, q, dateFrom, dateTo } = params;

      const queryParams: URLSearchParams = new URLSearchParams();
      if (sort) queryParams.append("sort", sort);
      if (q) queryParams.append("q", q);
      if (dateFrom) queryParams.append("dateFrom", dateFrom);
      if (dateTo) queryParams.append("dateTo", dateTo);

      // ⬇️ Fetch file as blob
      const response = await API.get(`/results/export?${queryParams.toString()}`, {
        responseType: "blob",
      });

      // ⬇️ Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `results_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true; // success flag
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to export results"
      );
    }
  }
);


const search = createAsyncThunk('results/search', async (params: IFetchParams, { dispatch }) => {
  try {
    const { page = 1, limit = 50, sort, q, dateFrom, dateTo } = params;

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
    if (dateFrom) {
      queryParams.append('dateFrom', dateFrom);
    }
    if (dateTo) {
      queryParams.append('dateTo', dateTo);
    }

    const response = await API.get(`/results/search?${queryParams.toString()}`);
    return response.data;
  } catch (error : any) {
   dispatch(setError(error.message || 'Failed to get results'));
       throw error; // Rethrow the error for further handling if needed
  }
});

const get = createAsyncThunk('results/get', async (id: string, { dispatch }) => {
  try {
    const response = await API.get(`/results/${id}`);
    return response.data;
  } catch (error : any) {
   dispatch(setError(error.message || 'Failed to get results'));
       throw error; // Rethrow the error for further handling if needed
  }
});

const create = createAsyncThunk('results/create', async (data: any, { dispatch }) => {
  try {
    const response = await API.post('/results', data);
    return response.data;
  } catch (error : any) {
   dispatch(setError(error.message || 'Failed to get results'));
       throw error; // Rethrow the error for further handling if needed
  }
});

const update = createAsyncThunk('results/update', async ({ id, data }: { id: string; data: any }, { dispatch }) => {
  try {
    const response = await API.put(`/results/${id}`, data);
    return response.data;
  } catch (error : any) {
   dispatch(setError(error.message || 'Failed to get results'));
       throw error; // Rethrow the error for further handling if needed
  }
});

const remove = createAsyncThunk('results/remove', async (id: string, { dispatch }) => {
  try {
    const response = await API.delete(`/results/${id}`);
    return response.data;
  }catch (error : any) {
   dispatch(setError(error.message || 'Failed to get results'));
       throw error; // Rethrow the error for further handling if needed
  }
});

const findByVIN = createAsyncThunk('results/findByVIN', async ({ vin, sku, createdAt }: { vin: string; sku: string; createdAt: Date }) => {
  try {
    const response = await API.get(`/results?vin=${vin}&sku=${sku}&idate=${createdAt}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.message || 'Failed to find results by VIN', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

const ResultService = {
  getAll,
  search,
  get,
  update,
  remove,
 findByVIN,
 exportResults
};

export default ResultService;
