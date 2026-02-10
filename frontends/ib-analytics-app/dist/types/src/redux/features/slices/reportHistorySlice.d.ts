import type { I_GET_API_RESPONSE } from '../../../types/customTypes';
interface ReportHistoryState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"reportHistory/clearError">;
export declare const reportHistoryReducer: import("redux").Reducer<ReportHistoryState>;
export default reportHistoryReducer;
