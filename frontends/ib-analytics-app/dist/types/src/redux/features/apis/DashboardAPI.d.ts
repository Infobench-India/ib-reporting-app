import type { IDashboardParams } from '../../../types/customTypes';
declare const ScheduleConfigService: {
    getAll: import("@reduxjs/toolkit").AsyncThunk<any, IDashboardParams, {
        state?: unknown;
        dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
        extra?: unknown;
        rejectValue?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
};
export default ScheduleConfigService;
