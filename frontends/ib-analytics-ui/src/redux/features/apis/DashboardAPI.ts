import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../../util/axiosWrapper';
import { ApiError } from '../../../util/ApiError';
import axios from 'axios';
import type { IDashboardParams } from '../../../types/customTypes';
import { setError } from '../../errorSlice';

const VITE_SYSTEM_MES_API_URL = import.meta.env.VITE_SYSTEM_MES_API_URL; // Use your environment variable for the base URL

// Thunk to get all data
const getAll = createAsyncThunk('dashboard/getAll', async (params: IDashboardParams, { dispatch }) => {
  try {
    const queryParams: URLSearchParams = new URLSearchParams();
    params.machineID && queryParams.append('machineID', String(params.machineID));
    params.shift && queryParams.append('shift', String(params.shift));
    params.startDateTime && queryParams.append('startDateTime', params.startDateTime);
    params.endDateTime && queryParams.append('endDateTime', params.endDateTime);
    params.isLive && queryParams.append('isLive', String(params.isLive));

    const response = await API.get(`${VITE_SYSTEM_MES_API_URL}/api/productiondata/dashboard?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
});

const ScheduleConfigService = {
  getAll,
};

export default ScheduleConfigService;