import type { I_GET_API_RESPONSE } from 'src/types/customTypes';
interface SKUState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"skudatas/clearError">;
export declare const skudatasReducer: import("redux").Reducer<SKUState>;
export default skudatasReducer;
