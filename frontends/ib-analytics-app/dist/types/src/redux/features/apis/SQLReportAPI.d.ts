declare const SQLReportService: {
    getConfigs: import("@reduxjs/toolkit").AsyncThunk<any, void, {
        state?: unknown;
        dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
        extra?: unknown;
        rejectValue?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    executeReport: import("@reduxjs/toolkit").AsyncThunk<any, {
        category: string;
        reportName: string;
        fromDate: string;
        toDate: string;
        page: number;
        limit: number;
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
export default SQLReportService;
