import type { IFetchParams } from '../../../types/customTypes';
export declare const getAll: import("@reduxjs/toolkit").AsyncThunk<any, IFetchParams, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
declare const SystemConfig: {
    getAll: import("@reduxjs/toolkit").AsyncThunk<any, IFetchParams, {
        state?: unknown;
        dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
        extra?: unknown;
        rejectValue?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
};
export default SystemConfig;
