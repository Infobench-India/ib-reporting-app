import type { IFetchParams } from '../../../types/customTypes';
declare const ReportHistoryService: {
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
    resend: import("@reduxjs/toolkit").AsyncThunk<any, {
        id: string;
        recipients?: string[];
        companyId: string;
    }, {
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
export default ReportHistoryService;
