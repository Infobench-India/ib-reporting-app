import { RootState } from '../store';
interface ErrorState {
    message: string | null;
    type: 'success' | 'error' | null;
}
export declare const setError: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    message: string;
    type: "error";
}, "error/setError">, setSuccess: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    message: string;
    type: "success";
}, "error/setSuccess">, clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"error/clearError">;
export declare const selectErrorMessage: (state: RootState) => any;
export declare const selectErrorType: (state: RootState) => any;
declare const _default: import("redux").Reducer<ErrorState>;
export default _default;
