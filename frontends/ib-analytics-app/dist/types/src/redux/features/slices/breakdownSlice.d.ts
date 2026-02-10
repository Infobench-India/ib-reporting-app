import type { I_GET_API_RESPONSE } from 'src/types/customTypes';
interface BreakDownState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"breakdowndatas/clearError">;
export declare const breakdowndatasReducer: import("redux").Reducer<BreakDownState>;
export default breakdowndatasReducer;
