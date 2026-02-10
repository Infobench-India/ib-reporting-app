import type { I_GET_API_RESPONSE } from 'src/types/customTypes';
interface SHIFTState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"shifts/clearError">;
export declare const shiftReducer: import("redux").Reducer<SHIFTState>;
export default shiftReducer;
