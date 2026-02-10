/**
 * This file has been taken 1-to-1 from https://github.com/ory/kratos-selfservice-ui-node/blob/master/src/translations.ts
 *
 * Slightly altered to provide a more consistent interface.
 */
import { UiNode } from "@ory/kratos-client";
export declare const getFormFieldTitle: (field: any) => string;
export declare const getFormFieldPosition: (field: UiNode) => number;
export declare const getFormPlaceholder: (field: UiNode) => string;
export declare const toFormInputPartialName: (type: string) => "form_input_hidden" | "form_input_password" | "form_field_button" | "form_input_default";
