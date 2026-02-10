import type { I_GET_API_RESPONSE } from '../../../types/customTypes';
interface StationsState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"stations/clearError">;
export declare const stationsReducer: import("redux").Reducer<StationsState>;
export default stationsReducer;
