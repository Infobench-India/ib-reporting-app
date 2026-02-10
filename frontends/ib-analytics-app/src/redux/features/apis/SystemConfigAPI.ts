import axios from "axios";
import { ApiError } from "../../../util/ApiError";
import API from "../../../util/axiosWrapper";
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setError, setSuccess } from '../../errorSlice';
import type { IFetchParams } from '../../../types/customTypes';
const VITE_SYSTEM_CONFIG_URL = import.meta.env.VITE_SYSTEM_CONFIG_URL; // Use your environment variable for the base URL
export const getAll = createAsyncThunk('systemConfig/getAll', async (params: IFetchParams, { dispatch }) => {
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
    const config: any = { headers: {} };
    const selectedCompany = localStorage.getItem('selectedCompany');
    if (selectedCompany) {
      const company = JSON.parse(selectedCompany);
      config.headers['Company-Id'] = company.id;
    }

    const response = await axios.get(`${VITE_SYSTEM_CONFIG_URL}/api/systemconfigs?${queryParams.toString()}`, config);

    return response.data;
  } catch (error: any) {
    dispatch(setError(error.response?.data.errors || 'Failed to get systemconfigs'));
    throw error; // Rethrow the error for further handling if needed
  }
});

const SystemConfig = {
  getAll,
};

export default SystemConfig;