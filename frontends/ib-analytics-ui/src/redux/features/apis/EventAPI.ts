import axios from "axios";
import API from "../../../util/axiosWrapper";
import { ApiError } from "../../../util/ApiError";
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setError } from '../../errorSlice';
import type { IFetchParams } from '../../../types/customTypes';
export const getAll = createAsyncThunk('eventsState/getAll', async (params: IFetchParams, { dispatch }) => {
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
    const response = await API.get(`/events?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const findByDate = createAsyncThunk('eventsState/findByDate', async (timespan: any, { dispatch }) => {
  try {
    const response = await API.get(`/events?timespan=${timespan}`);
    return response.data;
  } catch (error: any) {
    throw error; // Rethrow the error for further handling if needed
  }
});

export const search = createAsyncThunk('eventsState/search', async (params: IFetchParams, { dispatch }) => {
  try {
    const { page = 1, limit = 10, sort, q, dateFrom, dateTo } = params;

    // Build the query string
    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    if (dateFrom) {
      queryParams.append('dateFrom', dateFrom);
    }
    if (dateTo) {
      queryParams.append('dateTo', dateTo);
    }
    if (sort) {
      queryParams.append('sort', sort);
    }
    if (q) {
      queryParams.append('q', q);
    }
    const response = await API.get(`/events/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data.message || 'Failed to get events data', error.response?.status || 500);
    } else {
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
});

const EventService = {
  getAll,
  search
};

export default EventService;