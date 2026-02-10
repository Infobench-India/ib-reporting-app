import type { I_GET_API_RESPONSE } from 'src/types/customTypes';
interface MachineConfigState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"machineConfigs/clearError">;
export declare const machineConfigReducer: import("redux").Reducer<MachineConfigState>;
export default machineConfigReducer;
