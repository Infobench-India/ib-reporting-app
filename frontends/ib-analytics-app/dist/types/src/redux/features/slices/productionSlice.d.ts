import type { I_GET_API_RESPONSE } from 'src/types/customTypes';
interface ProductionState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"production/clearError">;
export declare const productionReducer: import("redux").Reducer<ProductionState>;
export default productionReducer;
