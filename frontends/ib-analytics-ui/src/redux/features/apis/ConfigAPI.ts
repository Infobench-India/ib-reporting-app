import axios from "axios";
import { ApiError } from "../../../util/ApiError";
import API from "../../../util/axiosWrapper";
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setError, setSuccess } from '../../errorSlice';
import type { IFetchParams } from '../../../types/customTypes';
export const getAll = createAsyncThunk('stageConfigsState/getAll', async (params: IFetchParams, { dispatch }) => {
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
    const response = await API.get(`/stageconfigs?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to get stage configs'));
    throw error; // Rethrow the error for further handling if needed
  }
});

export const get = createAsyncThunk('stageConfigsState/get', async (id: any, { dispatch }) => {
  try {
    const response = await API.get(`/stageconfigs/${id}`);
    return response.data;
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to get stage config'));
    throw error; // Rethrow the error for further handling if needed
  }
});

export const create = createAsyncThunk('stageConfigsState/create', async (data: any, { dispatch }) => {
  try {
    const response = await API.post("/stageconfigs", data);
    return response.data;
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to create stage config'));
    throw error; // Rethrow the error for further handling if needed
  }
});

export const update = createAsyncThunk('stageConfigsState/update', async (query: any, { dispatch }) => {
  try {
    const response = await API.put(`/stageconfigs/${query.id}`, query.data);
    return response.data;
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to update stage config'));
    throw error; // Rethrow the error for further handling if needed
  }
});

export const updateToolStatus = createAsyncThunk('stageConfigsState/updateToolStatus', async (query: any, { dispatch }) => {
  try {
    const response = await API.put(`/stageconfigs/toolstatus/${query.tool},${query.status}`);
    return response.data;
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to update tool status'));
    throw error; // Rethrow the error for further handling if needed
  }
});

export const updatePartStatus = createAsyncThunk('stageConfigsState/updatePartStatus', async (query: any, { dispatch }) => {
  try {
    const response = await API.put(`/stageconfigs/partstatus/${query.part},${query.status}`);
    return response.data;
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to update part status'));
    throw error; // Rethrow the error for further handling if needed
  }
});

export const remove = createAsyncThunk('stageConfigsState/remove', async (id: any, { dispatch }) => {
  try {
    const response = await API.delete(`/stageconfigs/${id}`);
    return response.data;
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to delete stage config'));
    throw error; // Rethrow the error for further handling if needed
  }
});

export const removeSKU = createAsyncThunk('stageConfigsState/removeSKU', async (sku: any, { dispatch }) => {
  try {
    const response = await API.delete(`/stageconfigs/${sku}`);
    return response.data;
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to delete stage config by SKU'));
    throw error; // Rethrow the error for further handling if needed
  }
});

export const findByStage = createAsyncThunk('stageConfigsState/findByStage', async (query: any, { dispatch }) => {
  try {
    const response = await API.get(`/stageconfigs?filter=${query.sku},${query.stage}`);
    return response.data;
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to find stage configs by stage'));
    throw error; // Rethrow the error for further handling if needed
  }
});

const ConfigService = {
  getAll,
  create,
  get,
  update,
  updateToolStatus,
  updatePartStatus,
  remove,
  removeSKU,
  findByStage,
};

export default ConfigService;