import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth';

interface AdminState {
    users: any[];
    roles: any[];
    loading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    users: [],
    roles: [],
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
            const [usersRes, rolesRes] = await Promise.all([
                axios.get(`${API_URL}/users`, { headers }),
                axios.get(`${API_URL}/roles`, { headers })
            ]);
            return { users: usersRes.data.users, roles: rolesRes.data.roles };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to fetch admin data');
        }
    }
);

export const updateUser = createAsyncThunk(
    'admin/updateUser',
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
            })
            .addCase(fetchAdminData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default adminSlice.reducer;
