import type { I_GET_API_RESPONSE } from 'src/types/customTypes';
interface RESULTState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"resultdatas/clearError">;
export declare const resultdatasReducer: import("redux").Reducer<RESULTState>;
export default resultdatasReducer;
