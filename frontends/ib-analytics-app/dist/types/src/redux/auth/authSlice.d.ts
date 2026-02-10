import type { User } from 'src/types/customTypes';
interface AuthState {
    user: User | null;
    loading: boolean;
}
export declare const loadUser: import("@reduxjs/toolkit").AsyncThunk<User, any, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
declare const _default: import("redux").Reducer<AuthState>;
export default _default;
