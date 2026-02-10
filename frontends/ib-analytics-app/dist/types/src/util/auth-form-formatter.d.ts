/**
 * This file has been taken 1-to-1 from https://github.com/ory/kratos-selfservice-ui-node/blob/master/src/helpers.ts
 *
 * Slightly altered to provide a more consistent interface.
 */
import { Flows } from "@ory/kratos-client";
export declare const formatFormFieldValues: (flow: Flows, method: string) => Record<string, any> | undefined;
/**
 * Format `method.config` to provide a more uniform and consistent UX.
 *
 * @param flow - a `Login`, `Registration`, etc. `Flow` as returned by Kratos.
 * @param method - The auth method to perform the formatting on.
 */
export declare const formatFormFields: (flow: Flows, method: string) => string | undefined;
