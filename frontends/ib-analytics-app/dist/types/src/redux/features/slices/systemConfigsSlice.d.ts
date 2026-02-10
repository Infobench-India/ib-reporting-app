import type { I_GET_API_RESPONSE } from 'src/types/customTypes';
interface SystemConfigState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"systemConfig/clearError">;
export declare const systemConfigsReducer: import("redux").Reducer<SystemConfigState>;
export default systemConfigsReducer;
