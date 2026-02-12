import { configureStore, combineReducers, Reducer } from '@reduxjs/toolkit';
import adminReducer from './slices/adminSlice';
import authReducer from './slices/authSlice';

// Initial state and reducers
const staticReducers = {
    admin: adminReducer,
    auth: authReducer,
    _root: (state = {}) => state
};

const createReducer = (asyncReducers: { [key: string]: Reducer } = {}) => {
    return combineReducers({
        ...staticReducers,
        ...asyncReducers
    });
};

const store = configureStore({
    reducer: createReducer(),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

// Dynamic reducer injection logic
const asyncReducers: { [key: string]: Reducer } = {};

const injectReducer = (key: string, reducer: Reducer) => {
    if (asyncReducers[key]) return;
    asyncReducers[key] = reducer;
    store.replaceReducer(createReducer(asyncReducers));
};

// Expose to window for MFEs
(window as any).__HOST_STORE__ = store;
(window as any).__INJECT_REDUCER__ = injectReducer;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, injectReducer };
