import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserProfile } from './authAPI';
import type { User } from 'src/types/customTypes';

interface AuthState {
  user: User | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
};

export const loadUser = createAsyncThunk('auth/loadUser', async (userDetails: any, { dispatch }) => {
  const user = await fetchUserProfile(userDetails);
  return user;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadUser.pending, (state) => {
      state.user = null;
      state.loading = true;
    });
    builder.addCase(loadUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(loadUser.rejected, (state) => {
      state.loading = false;
      state.user = null;
    });
  },
});

export default authSlice.reducer;
