interface SQLSchedulerState {
    data: {
        docs: any[];
    };
    history: {
        docs: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    loading: boolean;
    error: string | null;
}
export declare const clearSchedulerError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"sqlScheduler/clearSchedulerError">;
declare const _default: import("redux").Reducer<SQLSchedulerState>;
export default _default;
