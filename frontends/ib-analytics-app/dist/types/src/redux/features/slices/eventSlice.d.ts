import type { I_GET_API_RESPONSE } from '../../../types/customTypes';
interface EventsState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"events/clearError">;
export declare const eventsreducer: import("redux").Reducer<EventsState>;
export default eventsreducer;
