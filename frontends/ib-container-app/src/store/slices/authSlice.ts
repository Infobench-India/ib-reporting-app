import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    permissions?: string[];
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthData: (state, action: PayloadAction<{ user: User | null; accessToken: string | null; refreshToken?: string | null }>) => {
            state.user = action.payload.user;
            state.isAuthenticated = !!action.payload.user;
            state.accessToken = action.payload.accessToken || null;
            state.refreshToken = action.payload.refreshToken || null;
        },
        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.accessToken = null;
            state.refreshToken = null;
        }
    }
});

export const { setAuthData, clearUser } = authSlice.actions;
export default authSlice.reducer;
