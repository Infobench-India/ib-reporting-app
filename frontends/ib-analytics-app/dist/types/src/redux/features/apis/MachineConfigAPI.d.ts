import type { IFetchParams } from '../../../types/customTypes';
interface Field {
    name: string;
    key: string;
    'db-columName': string;
    'ui-displayOnCardAt': number;
    unit: string;
}
interface Event {
    id: string;
    type: 'alarm' | 'statusChange' | 'metricUpdate';
    description: string;
    tableName: string;
    live: boolean;
    fields: Field[];
}
interface MachineConfig {
    _id?: string;
    id: string;
    type: 'machine' | 'line' | 'plant';
    description: string;
    events: Event[];
    createdAt?: string;
    updatedAt?: string;
}
declare const MachineConfigService: {
    listConfigs: import("@reduxjs/toolkit").AsyncThunk<any, IFetchParams, {
        state?: unknown;
        dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
        extra?: unknown;
        rejectValue?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    searchConfigs: import("@reduxjs/toolkit").AsyncThunk<any, IFetchParams, {
        state?: unknown;
        dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
        extra?: unknown;
        rejectValue?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    getConfig: import("@reduxjs/toolkit").AsyncThunk<any, string, {
        state?: unknown;
        dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
        extra?: unknown;
        rejectValue?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    createConfig: import("@reduxjs/toolkit").AsyncThunk<any, MachineConfig, {
        state?: unknown;
        dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
        extra?: unknown;
        rejectValue?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    updateConfig: import("@reduxjs/toolkit").AsyncThunk<any, {
        _id?: string;
        data: Partial<MachineConfig>;
    }, {
        state?: unknown;
        dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
        extra?: unknown;
        rejectValue?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    deleteConfig: import("@reduxjs/toolkit").AsyncThunk<any, string, {
        state?: unknown;
        dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
        extra?: unknown;
        rejectValue?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    addEvent: import("@reduxjs/toolkit").AsyncThunk<any, {
        configId: string;
        event: Event;
    }, {
        state?: unknown;
        dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
        extra?: unknown;
        rejectValue?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    updateEvent: import("@reduxjs/toolkit").AsyncThunk<any, {
        configId: string;
        eventId: string;
        event: Partial<Event>;
    }, {
        state?: unknown;
        dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
        extra?: unknown;
        rejectValue?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    deleteEvent: import("@reduxjs/toolkit").AsyncThunk<any, {
        configId: string;
        eventId: string;
    }, {
        state?: unknown;
        dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
        extra?: unknown;
        rejectValue?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }>;
    addField: import("@reduxjs/toolkit").AsyncThunk<any, {
        configId: string;
        eventId: string;
        field: Field;
    }, {
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
export default MachineConfigService;
