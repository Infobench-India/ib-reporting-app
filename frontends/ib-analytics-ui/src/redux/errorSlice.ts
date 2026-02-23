// errorSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
interface ErrorState {
  message: string | null;
  type: 'success' | 'error' | null; // Add type for success or error
}

const initialState: ErrorState = {
  message: null,
  type: null,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setError(state, action: PayloadAction<{ message: string; type: 'error' }>) {
      state.message = action.payload.message;
      state.type = action.payload.type; // Set type to error
    },
    setSuccess(state, action: PayloadAction<{ message: string; type: 'success' }>) {
      state.message = action.payload.message;
      state.type = action.payload.type; // Set type to errors
    },
    clearError(state) {
      state.message = null;
      state.type = null; // Clear the type as well
    },
  },
});

export const { setError, setSuccess, clearError } = errorSlice.actions;

export const selectErrorMessage = (state: RootState) => {
  return state?.error?.message
};
export const selectErrorType = (state: RootState) => {
  return state?.error?.type;
};

export default errorSlice.reducer;
