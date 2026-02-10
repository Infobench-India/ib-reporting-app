import type { I_GET_API_RESPONSE } from '../../../types/customTypes';
interface SchedulesState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
declare const _default: import("redux").Reducer<SchedulesState>;
export default _default;
