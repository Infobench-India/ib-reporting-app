import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth';

interface AdminState {
    users: any[];
    roles: any[];
    permissions: any[];
    loading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    users: [],
    roles: [],
    permissions: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchAdminData = createAsyncThunk(
    'admin/fetchData',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };
            const [usersRes, rolesRes, permissionsRes] = await Promise.all([
                axios.get(`${API_URL}/users`, { headers }),
                axios.get(`${API_URL}/roles`, { headers }),
                axios.get(`${API_URL}/permissions`, { headers })
            ]);
            return {
                users: usersRes.data.users,
                roles: rolesRes.data.roles,
                permissions: permissionsRes.data.permissions
            };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to fetch admin data');
        }
    }
);

export const createRole = createAsyncThunk(
    'admin/createRole',
    async (data: { name: string; description: string }, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post(`${API_URL}/roles`, data, { headers });
            dispatch(fetchAdminData());
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to create role');
        }
    }
);

export const createPermission = createAsyncThunk(
    'admin/createPermission',
    async (data: { name: string; action: string; resource: string; description?: string }, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post(`${API_URL}/permissions`, data, { headers });
            dispatch(fetchAdminData());
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to create permission');
        }
    }
);

export const assignPermissionToRole = createAsyncThunk(
    'admin/assignPermission',
    async (data: { roleId: string; permissionId: string }, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post(`${API_URL}/roles/assign-permission`, data, { headers });
            dispatch(fetchAdminData());
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to assign permission');
        }
    }
);

export const removePermissionFromRole = createAsyncThunk(
    'admin/removePermission',
    async (data: { roleId: string; permissionId: string }, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post(`${API_URL}/roles/remove-permission`, data, { headers });
            dispatch(fetchAdminData());
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to remove permission');
        }
    }
);

export const updateUser = createAsyncThunk(
    'admin/updateUser',
    // ... rest of the file ...
    async ({ id, updates }: { id: string; updates: any }, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${API_URL}/users/${id}`, updates, { headers });
            dispatch(fetchAdminData());
            return { id, updates };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to update user');
        }
    }
);

export const updateRole = createAsyncThunk(
    'admin/updateRole',
    async ({ id, updates }: { id: string; updates: any }, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${API_URL}/roles/${id}`, updates, { headers });
            dispatch(fetchAdminData());
            return { id, updates };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to update role');
        }
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminData.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users;
                state.roles = action.payload.roles;
                state.permissions = action.payload.permissions;
            })
            .addCase(fetchAdminData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default adminSlice.reducer;
