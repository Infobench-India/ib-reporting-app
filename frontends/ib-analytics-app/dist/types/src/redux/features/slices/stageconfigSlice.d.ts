import type { I_GET_API_RESPONSE } from 'src/types/customTypes';
interface StageConfigState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"stageconfigs/clearError">;
export declare const skudatasReducer: import("redux").Reducer<StageConfigState>;
export default skudatasReducer;
