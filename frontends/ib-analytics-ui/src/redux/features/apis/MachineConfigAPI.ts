import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API from '../../../util/axiosWrapper';
import { ApiError } from '../../../util/ApiError';
import type { IFetchParams } from '../../../types/customTypes';
import { setError } from '../../../redux/errorSlice';

const API_BASE_URL = import.meta.env.VITE_MES_API_URL; // Use your environment variable for the base URL
const baseUrl = `${API_BASE_URL}/api/machine-config`;

interface Field {
  name: string;
  key: string;
  'db-columName': string;
  'ui-displayOnCardAt': number;
  unit: string;
}

interface Event {
  id: string;
  type: 'alarm' | 'statusChange' | 'metricUpdate';
  description: string;
  tableName: string;
  live: boolean;
  fields: Field[];
}

interface MachineConfig {
  _id?: string;
  id: string;
  type: 'machine' | 'line' | 'plant';
  description: string;
  events: Event[];
  createdAt?: string;
  updatedAt?: string;
}

// Thunk to list machine configs
const listConfigs = createAsyncThunk('machineConfig/list', async (params: IFetchParams) => {
  try {
    const { page = 1, limit = 200, sort, filter, q, search } = params as any;
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    if (sort) queryParams.append('sort', sort);
    if (q) queryParams.append('q', q);
    if (search) queryParams.append('search', search);
    if (filter) queryParams.append('filter', JSON.stringify(Object.entries(filter).map(([key, value]) => ({ id: key, value }))));

    const response = await API.get(`${baseUrl}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data?.errors || 'Failed to list machine configs', error.response?.status || 500);
    }
    throw new ApiError('An unexpected error occurred', 500);
  }
});

// Thunk to search machine configs
const searchConfigs = createAsyncThunk('machineConfig/search', async (params: IFetchParams) => {
  try {
    const { page = 1, limit = 20, q } = params as any;
    const queryParams = new URLSearchParams();
    if (q) queryParams.append('q', q);
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    const response = await API.get(`${baseUrl}/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data?.errors || 'Failed to search machine configs', error.response?.status || 500);
    }
    throw new ApiError('An unexpected error occurred', 500);
  }
});

// Thunk to get a config by id
const getConfig = createAsyncThunk('machineConfig/get', async (id: string) => {
  try {
    const response = await API.get(`${baseUrl}/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data?.errors || 'Failed to get machine config', error.response?.status || 500);
    }
    throw new ApiError('An unexpected error occurred', 500);
  }
});

// Thunk to create a config
const createConfig = createAsyncThunk('machineConfig/create', async (data: MachineConfig, { dispatch }) => {
  try {
    const response = await API.post(baseUrl, data);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data?.errors || 'Failed to create machine config', error.response?.status || 500);
    }
    throw new ApiError('An unexpected error occurred', 500);
  }
});

// Thunk to update a config
const updateConfig = createAsyncThunk('machineConfig/update', async ({ _id, data }: { _id?: string; data: Partial<MachineConfig> }) => {
  try {
    const response = await API.put(`${baseUrl}/${_id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data?.errors || 'Failed to update machine config', error.response?.status || 500);
    }
    throw new ApiError('An unexpected error occurred', 500);
  }
});

// Thunk to delete a config
const deleteConfig = createAsyncThunk('machineConfig/delete', async (id: string) => {
  try {
    const response = await API.delete(`${baseUrl}/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data?.errors || 'Failed to delete machine config', error.response?.status || 500);
    }
    throw new ApiError('An unexpected error occurred', 500);
  }
});

// Thunk to add an event
const addEvent = createAsyncThunk('machineConfig/addEvent', async ({ configId, event }: { configId: string; event: Event }) => {
  try {
    const response = await API.post(`${baseUrl}/${configId}/events`, {
      eventId: event.id,
      type: event.type,
      description: event.description,
      tableName: event.tableName,
      live: event.live,
      fields: event.fields
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data?.errors || 'Failed to add event', error.response?.status || 500);
    }
    throw new ApiError('An unexpected error occurred', 500);
  }
});

// Thunk to update an event
const updateEvent = createAsyncThunk('machineConfig/updateEvent', async ({ configId, eventId, event }: { configId: string; eventId: string; event: Partial<Event> }) => {
  try {
    const response = await API.put(`${baseUrl}/${configId}/events/${eventId}`, event);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data?.errors || 'Failed to update event', error.response?.status || 500);
    }
    throw new ApiError('An unexpected error occurred', 500);
  }
});

// Thunk to delete an event
const deleteEvent = createAsyncThunk('machineConfig/deleteEvent', async ({ configId, eventId }: { configId: string; eventId: string }) => {
  try {
    const response = await API.delete(`${baseUrl}/${configId}/events/${eventId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data?.errors || 'Failed to delete event', error.response?.status || 500);
    }
    throw new ApiError('An unexpected error occurred', 500);
  }
});

// Thunk to add a field
const addField = createAsyncThunk('machineConfig/addField', async ({ configId, eventId, field }: { configId: string; eventId: string; field: Field }) => {
  try {
    const response = await API.post(`${baseUrl}/${configId}/events/${eventId}/fields`, field);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data?.errors || 'Failed to add field', error.response?.status || 500);
    }
    throw new ApiError('An unexpected error occurred', 500);
  }
});

const MachineConfigService = {
  listConfigs,
  searchConfigs,
  getConfig,
  createConfig,
  updateConfig,
  deleteConfig,
  addEvent,
  updateEvent,
  deleteEvent,
  addField
};

export default MachineConfigService;
